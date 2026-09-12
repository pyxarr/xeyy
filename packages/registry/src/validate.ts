import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

import { registryItemSchema, registryRootSchema } from './schemas.ts';
import type { RegistryItem, RegistryRoot } from './schemas.ts';
import { isSafeRegistryPath, resolveWithin } from './paths.ts';
import { validateCategories } from './categories.ts';

export interface RegistryValidationIssue {
  /** Path-like pointer to the offending value (e.g. `files[0].path`). */
  path: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface RegistryValidationResult {
  valid: boolean;
  issues: RegistryValidationIssue[];
}

export interface RegistryItemValidationResult extends RegistryValidationResult {
  item: RegistryItem;
}

function issuesFromZod(error: {
  issues: { path: (string | number | symbol)[]; message: string }[];
}): RegistryValidationIssue[] {
  return error.issues.map((issue) => ({
    path:
      issue.path.length > 0
        ? issue.path.filter((p): p is string | number => typeof p !== 'symbol').join('.')
        : '(root)',
    message: issue.message,
    severity: 'error',
  }));
}

/**
 * Validate a single registry item definition against the schema plus path /
 * category / dependency rules.
 */
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

  if (registryItem.categories) {
    const catResult = validateCategories(registryItem.categories);
    for (const msg of catResult.issues) {
      issues.push({ path: 'categories', message: msg, severity: 'error' });
    }
  }

  const sourceDir = resolve(options.baseDir, registryItem.source);
  if (!isSafeRegistryPath(registryItem.source, options.baseDir, options.scopeDir)) {
    issues.push({
      path: 'source',
      message: `unsafe source path "${registryItem.source}"`,
      severity: 'error',
    });
  }

  const seenFiles = new Set<string>();
  for (const [index, file] of registryItem.files.entries()) {
    if (seenFiles.has(file.path)) {
      issues.push({
        path: `files[${index}].path`,
        message: `duplicate file path "${file.path}"`,
        severity: 'error',
      });
    }
    seenFiles.add(file.path);

    if (!isSafeRegistryPath(file.path, options.baseDir, options.scopeDir)) {
      issues.push({
        path: `files[${index}].path`,
        message: `unsafe path "${file.path}"`,
        severity: 'error',
      });
      continue;
    }

    const resolvedFile = resolveWithin(sourceDir, file.path);
    if (resolvedFile === undefined) {
      issues.push({
        path: `files[${index}].path`,
        message: `file path "${file.path}" escapes the item source directory`,
        severity: 'error',
      });
      continue;
    }
    if (existsSync(sourceDir) && !existsSync(resolvedFile)) {
      issues.push({
        path: `files[${index}].path`,
        message: `source file does not exist: ${registryItem.source}/${file.path}`,
        severity: 'error',
      });
    }

    if (file.target && !isSafeRegistryPath(file.target, options.baseDir, options.scopeDir)) {
      issues.push({
        path: `files[${index}].target`,
        message: `unsafe target "${file.target}"`,
        severity: 'error',
      });
    }
  }

  if (
    registryItem.registryDependencies &&
    new Set(registryItem.registryDependencies).size !== registryItem.registryDependencies.length
  ) {
    issues.push({ path: 'registryDependencies', message: 'duplicate registry dependency', severity: 'error' });
  }
  if (registryItem.dependencies && new Set(registryItem.dependencies).size !== registryItem.dependencies.length) {
    issues.push({ path: 'dependencies', message: 'duplicate npm dependency', severity: 'error' });
  }

  return { item: registryItem, valid: issues.length === 0, issues };
}

export function validateRegistryRoot(root: unknown): RegistryValidationResult {
  const parsed = registryRootSchema.safeParse(root);
  const issues: RegistryValidationIssue[] = [];
  if (!parsed.success) {
    issues.push(...issuesFromZod(parsed.error));
    return { valid: false, issues };
  }
  if (new Set(parsed.data.items).size !== parsed.data.items.length) {
    issues.push({ path: 'items', message: 'duplicate item path', severity: 'error' });
  }
  return { valid: issues.length === 0, issues };
}

export function loadRegistryItemFromRoot(
  itemPath: string,
  contentRoot: string,
  scopeDir: string,
): RegistryItemValidationResult {
  if (!isSafeRegistryPath(itemPath, contentRoot, contentRoot)) {
    return {
      item: { name: itemPath, type: 'registry:ui', version: '', source: '.', files: [] },
      valid: false,
      issues: [{ path: itemPath, message: `unsafe registry item path: ${itemPath}`, severity: 'error' }],
    };
  }

  const itemFile = resolve(contentRoot, itemPath);
  if (!existsSync(itemFile)) {
    return {
      item: { name: itemPath, type: 'registry:ui', version: '', source: '.', files: [] },
      valid: false,
      issues: [{ path: itemPath, message: `registry item file does not exist: ${itemFile}`, severity: 'error' }],
    };
  }

  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(itemFile, 'utf8')) as unknown;
  } catch (error) {
    return {
      item: { name: itemPath, type: 'registry:ui', version: '', source: '.', files: [] },
      valid: false,
      issues: [{ path: itemPath, message: `malformed registry item JSON: ${(error as Error).message}`, severity: 'error' }],
    };
  }

  return validateRegistryItem(raw, { baseDir: dirname(itemFile), scopeDir });
}

export interface FullRegistryValidationResult {
  valid: boolean;
  rootIssues: RegistryValidationIssue[];
  itemIssues: Map<string, RegistryValidationIssue[]>;
  duplicateNames: string[];
}

/** Full registry validation: root schema, item schemas, duplicate item names. */
export function validateFullRegistry(
  root: unknown,
  options: {
    contentRoot: string;
    scopeDir: string;
  },
): FullRegistryValidationResult {
  const rootResult = validateRegistryRoot(root);
  const itemIssues = new Map<string, RegistryValidationIssue[]>();
  const duplicateNames: string[] = [];
  const seenNames = new Set<string>();

  for (const itemPath of (root as RegistryRoot | null)?.items ?? []) {
    const itemResult = loadRegistryItemFromRoot(itemPath, options.contentRoot, options.scopeDir);
    if (seenNames.has(itemResult.item.name)) {
      duplicateNames.push(itemResult.item.name);
    }
    seenNames.add(itemResult.item.name);
    if (!itemResult.valid) {
      itemIssues.set(itemPath, itemResult.issues);
    }
  }

  return {
    valid: rootResult.valid && itemIssues.size === 0 && duplicateNames.length === 0,
    rootIssues: rootResult.issues,
    itemIssues,
    duplicateNames,
  };
}

export type { RegistryRoot } from './schemas.ts';
export type { RegistryItem } from './schemas.ts';