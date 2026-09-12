import { dirname, isAbsolute, join, normalize, relative, resolve } from 'node:path';

/**
 * Security boundary for every path taken from registry metadata. A path is
 * accepted only when its resolved form stays inside `scopeDir`. Note that
 * leading `..` segments are NOT rejected outright: an item's `source` legitimately
 * traverses upward from a nested definition dir into the repo root as long as it
 * never leaves `scopeDir` (the resolved containment check below enforces that).
 */
/** True for any absolute path in the host or Windows convention. */
function isAbsolutePortable(p: string): boolean {
  return isAbsolute(p) || /^[A-Za-z]:[\\/]/.test(p) || /^\\\\/.test(p);
}

export function isSafeRegistryPath(p: string, baseDir: string, scopeDir: string): boolean {
  if (isAbsolutePortable(p)) {
    return false;
  }
  if (/[\\/]$/.test(p) || p.includes('\0')) {
    return false;
  }
  const normalized = normalize(p);

  const resolved = resolve(baseDir, normalized);
  const relativeToScope = relative(resolve(scopeDir), resolved);
  return relativeToScope !== '' && !relativeToScope.startsWith('..') && !isAbsolute(relativeToScope);
}

/** Resolve within `baseDir`, returning undefined when the path escapes it. */
export function resolveWithin(baseDir: string, p: string): string | undefined {
  if (isAbsolutePortable(p) || p.includes('\0') || /[\\/]$/.test(p)) {
    return undefined;
  }
  const resolved = resolve(baseDir, normalize(p));
  const rel = relative(resolve(baseDir), resolved);
  if (rel === '' || rel.startsWith('..') || isAbsolute(rel)) {
    return undefined;
  }
  return resolved;
}

/** Resolve a registry-root-relative path, returning undefined on escape. */
export function safeResolve(rootDir: string, itemPath: string): string | undefined {
  if (!isSafeRegistryPath(itemPath, rootDir, rootDir)) {
    return undefined;
  }
  return resolve(rootDir, normalize(itemPath));
}

/** Resolve a source-relative reference against a base directory, guarded. */
export function safeJoin(baseDir: string, ref: string): string | undefined {
  if (!isSafeRegistryPath(ref, baseDir, baseDir)) {
    return undefined;
  }
  return join(baseDir, ref);
}

/** Convert a path to POSIX separators for stable JSON output. */
export function toPosix(p: string): string {
  return p.split('\\').join('/');
}

export { dirname, join, resolve };