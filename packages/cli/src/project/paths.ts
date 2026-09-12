import { dirname, resolve } from 'node:path';
import type { XeyyConfig } from '@xeyy/config';
import {
  resolveComponentPath,
  resolveThemePath,
  resolveRegistryDir,
  resolveRegistrySource,
  resolveRegistryDist,
  resolveRegistryThemeSource,
} from '../config.ts';

/** Alias for consumers; kept for backwards compatibility. */
export function resolveComponentPaths(config: XeyyConfig, projectDir: string): string {
  return resolveComponentPath(config, projectDir);
}

export function resolveThemePaths(config: XeyyConfig, projectDir: string): string {
  return resolveThemePath(config, projectDir);
}

/**
 * Authoring-mode registry definition dir (`config.registry.path`, default
 * `registry`). Used by `xeyy registry add/status/sync/validate`.
 */
export function resolveRegistryDirPath(config: XeyyConfig, projectDir: string): string {
  return resolveRegistryDir(config, projectDir);
}

/** Authoring-mode canonical source root (default `packages/components/src`). */
export function resolveSourceDirPath(config: XeyyConfig, projectDir: string): string {
  return resolveRegistrySource(config, projectDir);
}

/** Authoring-mode canonical theme source root (defaults to source root). */
export function resolveThemeSourceDirPath(config: XeyyConfig, projectDir: string): string {
  return resolveRegistryThemeSource(config, projectDir);
}

/** Authoring-mode distribution target (default `dist/registry`). */
export function resolveDistDirPath(config: XeyyConfig, projectDir: string): string {
  return resolveRegistryDist(config, projectDir);
}

/** The directory consumed by `xeyy add`: the built distribution. */
export function resolveRegistryPath(config: XeyyConfig, projectDir: string): string {
  return resolveRegistryDist(config, projectDir);
}

export interface InstallTarget {
  baseDir: string;
  path: string;
}

/**
 * Map a distributable file to its install destination per item type (§26):
 * - registry:ui       → <components>/<file>
 * - registry:component → <dirname(components)>/<file>
 * - registry:block    → <dirname(components)>/blocks/<file>
 * - registry:internal → <dirname(components)>/internal/<file>
 * - registry:theme    → <theme.path> (single-file theme target)
 */
export function installTargetFor(itemType: string, filePath: string, config: XeyyConfig, projectDir: string): InstallTarget {
  const components = resolveComponentPath(config, projectDir);

  if (itemType === 'registry:theme') {
    const themeFile = resolveThemePath(config, projectDir);
    return { baseDir: dirname(themeFile), path: themeFile };
  }

  let baseDir: string;
  if (itemType === 'registry:ui') {
    baseDir = components;
  } else {
    const parent = dirname(components);
    if (itemType === 'registry:block') baseDir = resolve(parent, 'blocks');
    else if (itemType === 'registry:internal') baseDir = resolve(parent, 'internal');
    else baseDir = parent;
  }
  return { baseDir, path: resolve(baseDir, toSafeTarget(filePath)) };
}

function toSafeTarget(filePath: string): string {
  if (filePath.includes('..')) {
    throw new Error(`Unsafe install path: ${filePath}`);
  }
  return filePath.split('/').map((seg) => (seg === '..' ? '' : seg)).filter(Boolean).join('/');
}