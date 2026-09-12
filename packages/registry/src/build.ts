import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

import type { RegistryFile, RegistryItem, RegistryRoot } from './schemas.ts';
import { writeRegistrySchemas } from './generate-schemas.ts';
import { toPosix } from './paths.ts';
import { validateRegistryItem, validateRegistryRoot } from './validate.ts';

export const INDEX_SCHEMA_URL = 'https://xeyy-registry.vercel.app/schema/registry-index.json';
export const ITEM_SCHEMA_URL = 'https://xeyy-registry.vercel.app/schema/registry-item.json';

/**
 * Public distribution payload for a registry item. Identical to the source
 * definition's metadata + embedded `files[].content`, minus the internal
 * `source` path used only by the build to locate canonical files.
 */
export type DistRegistryItem = Omit<RegistryItem, 'source'>;

export interface RegistryIndexEntry {
  name: string;
  section: string;
  type: RegistryItem['type'];
  version: string;
  title?: string;
  description?: string;
  categories?: string[];
  dependencies?: string[];
  registryDependencies?: string[];
  fileCount: number;
  /** Path to the built item payload, relative to the registry output dir. */
  path: string;
}

export interface RegistryIndex {
  $schema: string;
  name: string;
  homepage?: string;
  version?: string;
  items: RegistryIndexEntry[];
}

export interface BuildResult {
  itemCount: number;
  outputDir: string;
  /** Public JSON Schema output (`<outputDir>/../schema`), generated from zod. */
  schemaDir: string;
  index: RegistryIndex;
}

/**
 * Resolve + embed every registered item's source and write the distribution
 * payload (`index.json` + per-item `<section>/<name>.json`), then regenerate
 * the public JSON Schemas from the canonical zod definitions into the sibling
 * `schema/` directory. Fails on any validation or resolution problem rather
 * than emitting a partial registry.
 */
export function buildRegistry(options: { registryDir: string; outputDir: string; name?: string }): BuildResult {
  const { registryDir, outputDir } = options;
  const rootFile = join(registryDir, 'registry.json');
  if (!existsSync(rootFile)) {
    throw new Error(`registry root not found at ${rootFile}`);
  }

  let rawRoot: unknown;
  try {
    rawRoot = JSON.parse(readFileSync(rootFile, 'utf8'));
  } catch (error) {
    throw new Error(`malformed registry root JSON: ${(error as Error).message}`);
  }

  const rootResult = validateRegistryRoot(rawRoot);
  if (!rootResult.valid) {
    const issues = rootResult.issues.map((i) => `  - ${i.path}: ${i.message}`).join('\n');
    throw new Error(`invalid registry root:\n${issues}`);
  }
  const root = rawRoot as RegistryRoot;
  const contentRoot = registryDir;

  const builtItems: { item: DistRegistryItem; section: string; builtPath: string }[] = [];
  const indexEntries: RegistryIndexEntry[] = [];
  const errors: string[] = [];

  for (const itemPath of root.items) {
    try {
      const built = buildItem(itemPath, { contentRoot, scopeDir: resolve(registryDir, '..') });
      builtItems.push(built);
      indexEntries.push(indexEntryFor(built));
    } catch (error) {
      errors.push((error as Error).message);
    }
  }

  if (errors.length > 0) {
    throw new Error(`registry build failed:\n${errors.map((e) => `  - ${e}`).join('\n')}`);
  }

  // Duplicate item names across sections must fail (ambiguous install names).
  const byName = new Map<string, { name: string; builtPath: string }[]>();
  for (const b of builtItems) {
    const list = byName.get(b.item.name) ?? [];
    list.push({ name: b.item.name, builtPath: b.builtPath });
    byName.set(b.item.name, list);
  }
  for (const [name, list] of byName) {
    if (list.length > 1) {
      throw new Error(
        `duplicate item name "${name}" registered at: ${list.map((l) => l.builtPath).join(', ')} — install names would be ambiguous`,
      );
    }
  }

  indexEntries.sort((a, b) => a.section.localeCompare(b.section) || a.name.localeCompare(b.name));

  const index: RegistryIndex = {
    $schema: INDEX_SCHEMA_URL,
    name: options.name ?? root.name,
    ...(root.homepage ? { homepage: root.homepage } : {}),
    ...(root.version ? { version: root.version } : {}),
    items: indexEntries,
  };

  mkdirSync(outputDir, { recursive: true });
  writeFileSync(join(outputDir, 'index.json'), `${JSON.stringify(index, null, 2)}\n`, 'utf8');

  for (const built of builtItems) {
    const target = join(outputDir, built.builtPath);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, `${JSON.stringify(built.item, null, 2)}\n`, 'utf8');
  }

  const schemaDir = resolve(outputDir, '..', 'schema');
  writeRegistrySchemas(schemaDir);

  return { itemCount: builtItems.length, outputDir, schemaDir, index };
}

function buildItem(
  itemPath: string,
  options: { contentRoot: string; scopeDir: string },
): { item: DistRegistryItem; section: string; builtPath: string } {
  const itemFile = resolve(options.contentRoot, itemPath);
  if (!existsSync(itemFile)) {
    throw new Error(`registry item file does not exist: ${itemFile}`);
  }

  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(itemFile, 'utf8'));
  } catch (error) {
    throw new Error(`malformed registry item JSON (${itemPath}): ${(error as Error).message}`);
  }

  const definitionDir = dirname(itemFile);
  const parsed = validateRegistryItem(raw, {
    baseDir: definitionDir,
    scopeDir: options.scopeDir,
  });
  if (!parsed.valid) {
    const issues = parsed.issues.map((i) => `  - ${i.path}: ${i.message}`).join('\n');
    throw new Error(`invalid registry item (${itemPath}):\n${issues}`);
  }
  const item = parsed.item as RegistryItem;

  const sourceDir = join(definitionDir, item.source);
  const files: RegistryFile[] = [];
  for (const file of item.files) {
    if (file.type === 'example' || file.type === 'documentation') continue;
    const sourceFile = join(sourceDir, file.path);
    if (!existsSync(sourceFile)) {
      throw new Error(`source file missing for item "${item.name}": ${item.source}/${file.path}`);
    }
    files.push({
      path: file.path,
      type: file.type,
      ...(file.target ? { target: file.target } : {}),
      content: readFileSync(sourceFile, 'utf8'),
    });
  }

  const posixPath = toPosix(itemPath).replace(/^\.\//, '');
  const segments = posixPath.split('/');
  const section = segments.length >= 2 ? segments[0]! : 'ui';
  const builtPath = `${section}/${item.name}.json`;

  const builtItem: DistRegistryItem = {
    name: item.name,
    type: item.type,
    version: item.version,
    ...(item.$schema ? { $schema: item.$schema } : {}),
    ...(item.title ? { title: item.title } : {}),
    ...(item.description ? { description: item.description } : {}),
    ...(item.author ? { author: item.author } : {}),
    ...(item.homepage ? { homepage: item.homepage } : {}),
    ...(item.categories ? { categories: item.categories } : {}),
    ...(item.docs ? { docs: item.docs } : {}),
    ...(item.license ? { license: item.license } : {}),
    ...(item.dependencies ? { dependencies: item.dependencies } : {}),
    ...(item.registryDependencies ? { registryDependencies: item.registryDependencies } : {}),
    files,
    ...(item.fingerprint ? { fingerprint: item.fingerprint } : {}),
    ...(item.stylex ? { stylex: item.stylex } : {}),
    ...(item.accessibility ? { accessibility: item.accessibility } : {}),
  };

  return { item: builtItem, section, builtPath };
}

function indexEntryFor(built: { item: DistRegistryItem; section: string; builtPath: string }): RegistryIndexEntry {
  const { item, section, builtPath } = built;
  return {
    name: item.name,
    section,
    type: item.type,
    version: item.version,
    ...(item.title ? { title: item.title } : {}),
    ...(item.description ? { description: item.description } : {}),
    ...(item.categories ? { categories: item.categories } : {}),
    ...(item.dependencies ? { dependencies: item.dependencies } : {}),
    ...(item.registryDependencies ? { registryDependencies: item.registryDependencies } : {}),
    fileCount: built.item.files.length,
    path: builtPath,
  };
}