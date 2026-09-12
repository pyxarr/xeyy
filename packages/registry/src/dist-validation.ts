import { existsSync, readFileSync } from 'node:fs';
import { isAbsolute, relative, resolve } from 'node:path';

import {
  distRegistryItemSchema,
  registryIndexSchema,
} from './schemas.ts';
import type { RegistryIndex, RegistryIndexEntry, RegistryItem } from './schemas.ts';

export interface RegistryDistIssue {
  /** Path-like pointer to the offending value (e.g. `ui/button.json.files[0].path`). */
  path: string;
  message: string;
}

export interface RegistryDistValidationResult {
  valid: boolean;
  /** Index-level problems: missing/malformed/unparseable index.json, schema errors. */
  rootIssues: RegistryDistIssue[];
  /** Per-payload problems, keyed by the payload path from the index. */
  itemIssues: Map<string, RegistryDistIssue[]>;
  /** Cross-cutting problems: index entry vs payload mismatch, orphaned/missing references. */
  consistencyIssues: RegistryDistIssue[];
}

function issuesFromZod(error: {
  issues: { path: (string | number | symbol)[]; message: string }[];
}, prefix = ''): RegistryDistIssue[] {
  return error.issues.map((issue) => ({
    path:
      prefix.length > 0
        ? `${prefix}.${issue.path.length > 0 ? issue.path.filter((p): p is string | number => typeof p !== 'symbol').join('.') : '(root)'}`
        : issue.path.length > 0
          ? issue.path.filter((p): p is string | number => typeof p !== 'symbol').join('.')
          : '(root)',
    message: issue.message,
  }));
}

/** Resolve a path relative to the dist root without escaping it. */
function safeDistResolve(rootDir: string, p: string): string | undefined {
  if (isAbsolute(p) || p.includes('..') || p.includes('\0') || /^[\\/]/.test(p)) {
    return undefined;
  }
  const resolved = resolve(rootDir, p);
  const rel = relative(rootDir, resolved);
  if (rel === '' || rel.startsWith('..') || isAbsolute(rel)) {
    return undefined;
  }
  return resolved;
}

function basename(p: string): string {
  const posix = p.split('\\').join('/');
  const parts = posix.split('/');
  return parts[parts.length - 1] ?? '';
}

function dirname(p: string): string {
  const posix = p.split('\\').join('/');
  const parts = posix.split('/');
  parts.pop();
  if (parts.length === 0 || (parts.length === 1 && parts[0] === '')) {
    return '.';
  }
  return parts.join('/');
}

const DEV_FILE_TYPES = ['example', 'documentation'] as const;

/**
 * Validate a built registry distribution (`dist/registry`): the root index,
 * every indexed payload, and the consistency between them. This is the
 * distribution contract — public payloads must be installable-only and must
 * never expose internal `source` provenance.
 */
export function validateDistRegistry(options: {
  distDir: string;
}): RegistryDistValidationResult {
  const { distDir } = options;
  const rootIssues: RegistryDistIssue[] = [];
  const itemIssues = new Map<string, RegistryDistIssue[]>();
  const consistencyIssues: RegistryDistIssue[] = [];

  const indexFile = resolve(distDir, 'index.json');
  if (!existsSync(indexFile)) {
    return {
      valid: false,
      rootIssues: [{ path: 'index.json', message: `distribution index not found at ${indexFile}` }],
      itemIssues,
      consistencyIssues,
    };
  }

  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(indexFile, 'utf8'));
  } catch (error) {
    return {
      valid: false,
      rootIssues: [{ path: 'index.json', message: `malformed index JSON: ${(error as Error).message}` }],
      itemIssues,
      consistencyIssues,
    };
  }

  const parsedIndex = registryIndexSchema.safeParse(raw);
  if (!parsedIndex.success) {
    return {
      valid: false,
      rootIssues: issuesFromZod(parsedIndex.error, 'index.json'),
      itemIssues,
      consistencyIssues,
    };
  }
  const index = parsedIndex.data;

  const indexedNames = new Set(index.items.map((entry) => entry.name));
  const seenNames = new Set<string>();

  for (const entry of index.items) {
    if (seenNames.has(entry.name)) {
      consistencyIssues.push({ path: `items[${entry.name}]`, message: `duplicate index entry for "${entry.name}"` });
    }
    seenNames.add(entry.name);

    const payloadPath = entry.path;
    const payloadFile = safeDistResolve(distDir, payloadPath);
    if (payloadFile === undefined) {
      itemIssues.set(payloadPath, [
        { path: payloadPath, message: `unsafe index reference "${payloadPath}" escapes the distribution directory` },
      ]);
      continue;
    }

    // Structural: `<section>/<name>.json` must match the entry metadata.
    if (dirname(payloadPath) !== entry.section) {
      consistencyIssues.push({
        path: `items[${entry.name}].path`,
        message: `index path "${payloadPath}" does not live in section "${entry.section}"`,
      });
    }
    if (basename(payloadPath) !== `${entry.name}.json`) {
      consistencyIssues.push({
        path: `items[${entry.name}].path`,
        message: `index path "${payloadPath}" does not match item name "${entry.name}"`,
      });
    }

    if (!existsSync(payloadFile)) {
      itemIssues.set(payloadPath, [
        { path: payloadPath, message: `indexed item payload does not exist: ${payloadPath}` },
      ]);
      continue;
    }

    const payloadIssues = validateDistItem(payloadFile, payloadPath, entry);
    if (payloadIssues.length > 0) {
      itemIssues.set(payloadPath, payloadIssues);
    }
  }

  // Every referenced registry dependency must be a real indexed item.
  for (const entry of index.items) {
    const payloadFile = safeDistResolve(distDir, entry.path);
    if (payloadFile === undefined || !existsSync(payloadFile)) continue;
    let item: RegistryItem | null = null;
    try {
      item = JSON.parse(readFileSync(payloadFile, 'utf8')) as RegistryItem;
    } catch {
      continue;
    }
    for (const dep of item.registryDependencies ?? []) {
      if (dep === entry.name) {
        consistencyIssues.push({ path: `items[${entry.name}].registryDependencies`, message: `item "${entry.name}" depends on itself` });
      } else if (!indexedNames.has(dep)) {
        consistencyIssues.push({ path: `items[${entry.name}].registryDependencies`, message: `registry dependency "${dep}" is not present in the index` });
      }
    }
  }

  const valid = rootIssues.length === 0 && itemIssues.size === 0 && consistencyIssues.length === 0;
  return { valid, rootIssues, itemIssues, consistencyIssues };
}

function validateDistItem(
  payloadFile: string,
  payloadPath: string,
  entry: RegistryIndexEntry,
): RegistryDistIssue[] {
  const issues: RegistryDistIssue[] = [];

  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(payloadFile, 'utf8'));
  } catch (error) {
    issues.push({ path: payloadPath, message: `malformed item JSON: ${(error as Error).message}` });
    return issues;
  }

  // The public distribution never exposes internal source provenance.
  if (typeof raw === 'object' && raw !== null && Object.prototype.hasOwnProperty.call(raw, 'source')) {
    issues.push({ path: `${payloadPath}.source`, message: `forbidden "source" field leaked into the distribution payload` });
  }

  const parsed = distRegistryItemSchema.safeParse(raw);
  if (!parsed.success) {
    issues.push(...issuesFromZod(parsed.error, payloadPath));
    return issues;
  }
  const item = parsed.data;

  if (item.name !== entry.name) {
    issues.push({ path: `${payloadPath}.name`, message: `payload name "${item.name}" does not match index entry "${entry.name}"` });
  }
  if (item.type !== entry.type) {
    issues.push({ path: `${payloadPath}.type`, message: `payload type "${item.type}" does not match index entry "${entry.type}"` });
  }
  if (item.version !== entry.version) {
    issues.push({ path: `${payloadPath}.version`, message: `payload version "${item.version}" does not match index entry "${entry.version}"` });
  }
  if (item.files.length !== entry.fileCount) {
    issues.push({
      path: `${payloadPath}.files`,
      message: `index fileCount ${entry.fileCount} does not match payload file count ${item.files.length}`,
    });
  }

  const seenFilePaths = new Set<string>();
  for (const [fileIndex, file] of item.files.entries()) {
    const at = `${payloadPath}.files[${fileIndex}]`;

    if (DEV_FILE_TYPES.includes(file.type as (typeof DEV_FILE_TYPES)[number])) {
      issues.push({ path: `${at}.type`, message: `development-only file type "${file.type}" is not allowed in the distribution` });
    }
    if (file.type !== item.type) {
      issues.push({
        path: `${at}.type`,
        message: `file type "${file.type}" does not match item type "${item.type}"`,
      });
    }
    if (typeof file.content !== 'string') {
      issues.push({ path: `${at}.content`, message: `file "${file.path}" is missing embedded content` });
    }
    if (safeDistResolve('.', file.path) === undefined) {
      issues.push({ path: `${at}.path`, message: `unsafe file path "${file.path}"` });
    }
    if (file.target !== undefined && safeDistResolve('.', file.target) === undefined) {
      issues.push({ path: `${at}.target`, message: `unsafe target path "${file.target}"` });
    }
    if (seenFilePaths.has(file.path)) {
      issues.push({ path: `${at}.path`, message: `duplicate file path "${file.path}"` });
    }
    seenFilePaths.add(file.path);
  }

  if (item.type === 'registry:theme') {
    const themeFiles = item.files.filter((file) => file.type === 'registry:theme');
    if (themeFiles.length !== 1) {
      issues.push({
        path: `${payloadPath}.files`,
        message: `registry:theme items must contain exactly one registry:theme file (found ${themeFiles.length})`,
      });
    } else if (themeFiles[0]!.target === undefined) {
      issues.push({
        path: `${payloadPath}.files`,
        message: `registry:theme file is missing its install target`,
      });
    }
    if (entry.section !== 'themes') {
      issues.push({
        path: `${payloadPath}.section`,
        message: `registry:theme item "${item.name}" is not indexed under the "themes" section`,
      });
    }
  }

  if (item.registryDependencies && new Set(item.registryDependencies).size !== item.registryDependencies.length) {
    issues.push({ path: `${payloadPath}.registryDependencies`, message: 'duplicate registry dependency' });
  }
  if (item.dependencies && new Set(item.dependencies).size !== item.dependencies.length) {
    issues.push({ path: `${payloadPath}.dependencies`, message: 'duplicate npm dependency' });
  }

  return issues;
}