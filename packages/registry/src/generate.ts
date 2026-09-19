import { existsSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

import { ITEM_SCHEMA_URL } from './build.ts';
import { analyzeAccessibility, analyzeIconUsage, analyzeStylex, detectClientSignals, detectRegistryDependencies, extractNpmDependencies, mergeIconUsage, type KnownComponent } from './analysis.ts';
import { suggestCategories } from './categories.ts';
import { fingerprintCandidate } from './status.ts';
import type { ScannedFile } from './discovery.ts';
import type { RegistryCandidate } from './discovery.ts';
import type { RegistryFile, RegistryIconUsage, RegistryItem, RegistryItemType } from './schemas.ts';
import { registryItemTypeSchema } from './schemas.ts';
import { toPosix } from './paths.ts';
import { validateRegistryItem } from './validate.ts';

export const DEFAULT_ITEM_VERSION = '1.0.0';

export function typeForSection(section: RegistryCandidate['section']): RegistryItemType {
  switch (section) {
    case 'ui':
      return 'registry:ui';
    case 'components':
      return 'registry:component';
    case 'blocks':
      return 'registry:block';
    case 'themes':
      return 'registry:theme';
    case 'internal':
      return 'registry:internal';
  }
}

export interface GeneratedDefinition {
  item: RegistryItem;
  /** Absolute path where the definition should be written. */
  itemFilePath: string;
  /** Registry root-index entry for this item, e.g. `./ui/button/registry.json`. */
  indexEntry: string;
  section: string;
  name: string;
  titleFallback: string;
  descriptionFallback: string;
}

function readContent(file: ScannedFile, sourceDir: string): string {
  return readFileSync(join(sourceDir, file.relativePath), 'utf8');
}

export function pascalCase(s: string): string {
  const cleaned = s.replace(/[-_.]+(.)?/g, (_m, c: string) => (c ? c.toUpperCase() : ''));
  return (s[0]?.toUpperCase() ?? '') + cleaned.slice(1);
}

function defaultDescription(candidate: RegistryCandidate, type: RegistryItemType, builtOnBaseUi: boolean): string {
  const title = pascalCase(candidate.name);
  if (type === 'registry:theme') return 'The central Xeyy theme and semantic token system.';
  if (type === 'registry:internal') return `Internal ${title} support utilities used by Xeyy components.`;
  if (builtOnBaseUi) return `A themeable ${title} component built on Base UI and StyleX.`;
  return `A themeable ${title} component built on StyleX.`;
}

export interface GenerateDefinitionOptions {
  registryDir: string;
  /** All candidates (for registry-dependency detection). */
  candidates: KnownComponent[];
  /** Optional resolution for npm dependency versions (e.g. @stylexjs/stylex). */
  readPackageJson?: (dir: string) => Record<string, unknown> | null;
  version?: string;
  title?: string;
  description?: string;
  categories?: string[];
  author?: string;
  homepage?: string;
  docs?: string;
}

/**
 * Build a registry definition for a candidate. The definition references the
 * canonical source via `source`; it never mirrors source content.
 */
export function generateDefinition(
  candidate: RegistryCandidate,
  options: GenerateDefinitionOptions,
): GeneratedDefinition {
  if (candidate.empty) {
    throw new Error(`"${candidate.rel}" has no code files; refusing to register an empty component`);
  }

  const type = typeForSection(candidate.section);
  const baseUI = new Set<string>();
  const stylexFeatures = new Set<string>();
  const stylexConditions = new Set<string>();
  let minVersion: string | undefined;
  let aria = false;
  let keyboard = false;
  let focusManagement = false;
  let moduleLevelBrowserGlobal = false;
  let stylexVersion: string | undefined;
  const iconUsages: RegistryIconUsage[] = [];

  if (candidate.section === 'themes') {
    // Theme resolution: stylex version from an ancestor package.json.
    const stylexPkg = findPackageVersion(candidate.dir, '@stylexjs/stylex', options.readPackageJson);
    if (stylexPkg) stylexVersion = stylexPkg;
  }

  for (const file of candidate.files) {
    if (file.kind !== 'code') continue;
    const content = readContent(file, candidate.dir);

    const stylex = analyzeStylex(content, stylexVersion);
    for (const f of stylex.features) stylexFeatures.add(f);
    for (const c of stylex.conditions) stylexConditions.add(c);
    if (stylex.minVersion) minVersion = stylex.minVersion;

    const a11y = analyzeAccessibility(content);
    aria = aria || a11y.aria;
    keyboard = keyboard || a11y.keyboard;
    focusManagement = focusManagement || a11y.focusManagement;

    const signals = detectClientSignals(content);
    moduleLevelBrowserGlobal = moduleLevelBrowserGlobal || signals.moduleLevelBrowserGlobal;

    for (const usage of analyzeIconUsage(content)) iconUsages.push(usage);

    for (const spec of extractBaseUiSpecs(content)) baseUI.add(spec);
  }

  const builtOnBaseUi = baseUI.size > 0;

  const npmDeps = extractNpmDependencies(candidate.files, (f) => readContent(f, candidate.dir));
  const registryMatches = detectRegistryDependencies(candidate.files, {
    fileDir: candidate.dir,
    sourceDir: findSourceRoot(candidate),
    candidates: options.candidates,
    read: (f) => readContent(f, candidate.dir),
  });
  const registryDependencies = registryMatches.map((m) => m.name);

  const categoryInput = {
    name: candidate.name,
    baseUiComponents: [...baseUI],
    interactive: builtOnBaseUi,
    accessible: aria || keyboard || focusManagement,
    animated: stylexFeatures.has('keyframes'),
    roleHints: [candidate.section, candidate.name],
  };
  const suggestedCategories = options.categories ?? suggestCategories(categoryInput);

  const files: RegistryFile[] = [];
  for (const file of candidate.files) {
    if (file.kind === 'test' || file.kind === 'skip') continue;
    let fileType: RegistryItemType | 'example' | 'documentation';
    if (file.kind === 'example') fileType = 'example';
    else if (file.kind === 'documentation') fileType = 'documentation';
    else fileType = type;
    if (type === 'registry:theme' && fileType === 'registry:theme') {
      // Themes install as the consumer's configured theme file.
      files.push({ path: file.relativePath, type: fileType, target: 'theme.stylex.ts' });
    } else {
      files.push({ path: file.relativePath, type: fileType });
    }
  }

  const definitionDir = candidate.definitionDir;
  const sourceRel = toPosix(relative(definitionDir, candidate.dir));

  const item: RegistryItem = {
    $schema: ITEM_SCHEMA_URL,
    name: candidate.name,
    type,
    version: options.version ?? DEFAULT_ITEM_VERSION,
    ...(options.title ? { title: options.title } : {}),
    ...(options.description ? { description: options.description } : {}),
    ...(options.author ? { author: options.author } : {}),
    ...(options.homepage ? { homepage: options.homepage } : {}),
    ...(suggestedCategories.length > 0 ? { categories: suggestedCategories } : {}),
    ...(options.docs ? { docs: options.docs } : {}),
    source: sourceRel,
    files,
    ...(npmDeps.length > 0 ? { dependencies: npmDeps } : {}),
    ...(registryDependencies.length > 0 ? { registryDependencies } : {}),
    ...(iconUsages.length > 0 ? { icons: mergeIconUsage(iconUsages) } : {}),
    fingerprint: fingerprintCandidate(candidate),
    ...(stylexFeatures.size > 0
      ? {
          stylex: {
            ...(minVersion ? { minVersion } : {}),
            features: [...stylexFeatures].sort(),
            compiler: true,
            ...(stylexConditions.size > 0 ? { conditions: [...stylexConditions].sort() } : {}),
          },
        }
      : {}),
    ...(aria || keyboard || focusManagement
      ? { accessibility: { keyboard, aria, focusManagement } }
      : {}),
  };

  const itemFilePath = join(definitionDir, 'registry.json');
  const parsed = validateRegistryItem(item, {
    baseDir: definitionDir,
    scopeDir: resolve(options.registryDir, '..'),
  });
  if (!parsed.valid) {
    const issues = parsed.issues.map((i) => `  - ${i.path}: ${i.message}`).join('\n');
    throw new Error(`Generated registry item is invalid:\n${issues}`);
  }

  const indexEntry = `./${toPosix(relative(options.registryDir, itemFilePath))}`;
  const titleFallback = pascalCase(candidate.name);
  const descriptionFallback = defaultDescription(candidate, type, builtOnBaseUi);

  return {
    item: parsed.item,
    itemFilePath,
    indexEntry,
    section: candidate.section,
    name: candidate.name,
    titleFallback,
    descriptionFallback,
  };
}

function extractBaseUiSpecs(src: string): string[] {
  const specs: string[] = [];
  const IMPORT_RE = /^\s*import\s*(?!type\b)[\s\S]*?\bfrom\s+['"]([^'"]+)['"]/gm;
  let m: RegExpExecArray | null;
  while ((m = IMPORT_RE.exec(src))) {
    const spec = m[1]!;
    if (spec === '@base-ui/react') {
      specs.push('root');
      continue;
    }
    if (spec.startsWith('@base-ui/react/')) {
      specs.push(spec.slice('@base-ui/react/'.length).split('/')[0]!);
    }
  }
  return specs;
}

function findSourceRoot(candidate: RegistryCandidate): string {
  const dir = resolve(candidate.dir);
  const parent = resolve(dir, '..');
  const grandParent = resolve(parent, '..');
  if (existsSync(join(grandParent, 'ui')) || existsSync(join(grandParent, 'components'))) {
    return grandParent;
  }
  return parent;
}

function findPackageVersion(
  startDir: string,
  packageName: string,
  readPackageJson?: (dir: string) => Record<string, unknown> | null,
): string | undefined {
  let dir = startDir;
  for (let i = 0; i < 10; i++) {
    const pkg = readPackageJson ? readPackageJson(dir) : tryReadPackageJson(dir);
    if (pkg) {
      const deps = pkg.dependencies as Record<string, string> | undefined;
      const devDeps = pkg.devDependencies as Record<string, string> | undefined;
      const version = deps?.[packageName] ?? devDeps?.[packageName];
      if (typeof version === 'string') {
        return version.startsWith('workspace:') ? undefined : version;
      }
    }
    const parent = resolve(dir, '..');
    if (parent === dir) break;
    dir = parent;
  }
  return undefined;
}

function tryReadPackageJson(dir: string): Record<string, unknown> | null {
  const file = join(dir, 'package.json');
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(readFileSync(file, 'utf8')) as Record<string, unknown>;
  } catch {
    return null;
  }
}