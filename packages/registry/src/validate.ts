import { existsSync, readFileSync } from 'node:fs';
import { dirname, isAbsolute, join, normalize, relative, resolve } from 'node:path';

import { registryItemSchema, registryRootSchema } from './schemas.ts';
import type { RegistryItem, RegistryRoot } from './schemas.ts';

export interface RegistryValidationIssue {
  /** Path-like pointer to the offending value (e.g. `files[0].path`). */
  path: string;
  message: string;
}

export interface RegistryValidationResult {
  valid: boolean;
  issues: RegistryValidationIssue[];
}

export interface RegistryItemValidationResult extends RegistryValidationResult {
  item: RegistryItem;
}

function issuesFromZod(error: { issues: { path: (string | number | symbol)[]; message: string }[] }): RegistryValidationIssue[] {
  return error.issues.map((issue) => ({
    path: issue.path.length > 0 ? issue.path.filter((p): p is string | number => typeof p !== 'symbol').join('.') : '(root)',
    message: issue.message,
  }));
}

/**
 * Reject absolute paths, traversal escapes, and targets that leave the
 * intended scope directory. Mirrors registry spec §23 (never allow
 * `../../package.json` or `.env` escapes).
 */
export function isSafeRegistryPath(p: string, baseDir: string, scopeDir: string): boolean {
  if (isAbsolute(p)) {
    return false;
  }
  if (/[\\/]$/.test(p) || p.includes('\0')) {
    return false;
  }

  const resolved = resolve(baseDir, normalize(p));
  const relativeToScope = relative(resolve(scopeDir), resolved);
  return relativeToScope !== '' && !relativeToScope.startsWith('..') && !isAbsolute(relativeToScope);
}

export function validateRegistryItem(
  item: unknown,
  options: { baseDir: string; scopeDir: string },
): RegistryItemValidationResult {
  const parsed = registryItemSchema.safeParse(item);
  const issues: RegistryValidationIssue[] = [];

  if (!parsed.success) {
    issues.push(...issuesFromZod(parsed.error));
    return { item: item as RegistryItem, valid: false, issues };
  }
  const registryItem = parsed.data;

  const seen = new Set<string>();
  for (const [index, file] of registryItem.files.entries()) {
    if (seen.has(file.path)) {
      issues.push({ path: `files[${index}].path`, message: `duplicate file path "${file.path}"` });
    }
    seen.add(file.path);

    if (!isSafeRegistryPath(file.path, options.baseDir, options.scopeDir)) {
      issues.push({
        path: `files[${index}].path`,
        message: `unsafe path "${file.path}" (absolute or escapes the component scope)`,
      });
      continue;
    }

    if (!existsSync(join(options.baseDir, file.path))) {
      issues.push({ path: `files[${index}].path`, message: `file does not exist: ${file.path}` });
    }

    if (file.target && !isSafeRegistryPath(file.target, options.baseDir, options.scopeDir)) {
      issues.push({ path: `files[${index}].target`, message: `unsafe target "${file.target}"` });
    }
  }

  if (
    registryItem.registryDependencies &&
    new Set(registryItem.registryDependencies).size !== registryItem.registryDependencies.length
  ) {
    issues.push({ path: 'registryDependencies', message: 'duplicate registry dependency' });
  }

  return { item: registryItem, valid: issues.length === 0, issues };
}

export function validateRegistryRoot(root: unknown): RegistryValidationResult {
  const parsed = registryRootSchema.safeParse(root);
  if (!parsed.success) {
    return { valid: false, issues: issuesFromZod(parsed.error) };
  }

  const issues: RegistryValidationIssue[] = [];
  if (new Set(parsed.data.items).size !== parsed.data.items.length) {
    issues.push({ path: 'items', message: 'duplicate item path' });
  }

  return { valid: issues.length === 0, issues };
}

/** Load a registry item from a content-root-relative path, validated against the item schema. */
export function loadRegistryItemFromRoot(
  itemPath: string,
  contentRoot: string,
  scopeDir: string,
): RegistryItemValidationResult {
  const itemFile = resolve(contentRoot, itemPath);
  if (!existsSync(itemFile)) {
    return {
      item: { name: itemPath, type: 'component', version: '', files: [] },
      valid: false,
      issues: [{ path: itemPath, message: `registry item file does not exist: ${itemFile}` }],
    };
  }

  const raw = JSON.parse(readFileSync(itemFile, 'utf8')) as RegistryItem;
  return validateRegistryItem(raw, { baseDir: dirname(itemFile), scopeDir });
}

export type { RegistryRoot } from './schemas.ts';
export type { RegistryItem } from './schemas.ts';