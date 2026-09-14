import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import kleur from 'kleur';
import { readConfig } from '../config.ts';
import type { XeyyConfig } from '../config.ts';
import {
  resolveRegistryDirPath,
  resolveSourceDirPath,
  resolveThemeSourceDirPath,
  resolveDistDirPath,
} from '../project/paths.ts';

export interface AuthoringPaths {
  registryDir: string;
  sourceDir: string;
  themeDir: string;
  distDir: string;
  config: XeyyConfig | null;
}

/**
 * Fail clearly when the component source root is missing or invalid. Without
 * this guard a wrong path silently produces an empty status result
 * ("All components up to date").
 */
export function requireSourceDir(sourceDir: string): void {
  if (existsSync(sourceDir)) return;
  console.error(kleur.red(`Component source not found at ${sourceDir}.`));
  console.error(kleur.dim('  Expected layout: <source>/ui, <source>/components, <source>/blocks, <source>/themes, <source>/internal'));
  process.exit(4);
}

export function authoringPaths(projectDir: string): AuthoringPaths {
  const config = readConfig(projectDir);
  return {
    registryDir: config ? resolveRegistryDirPath(config, projectDir) : join(projectDir, 'registry'),
    sourceDir: config ? resolveSourceDirPath(config, projectDir) : join(projectDir, 'packages/components/src'),
    themeDir: config ? resolveThemeSourceDirPath(config, projectDir) : join(projectDir, 'packages/components/src'),
    distDir: config ? resolveDistDirPath(config, projectDir) : join(projectDir, 'dist/registry'),
    config,
  };
}

export interface RootFile {
  $schema?: string;
  name?: string;
  homepage?: string;
  version?: string;
  items: string[];
}

export function readRoot(registryDir: string): RootFile {
  const file = join(registryDir, 'registry.json');
  if (!existsSync(file)) {
    return { name: 'Xeyy Registry', items: [] };
  }
  const raw = JSON.parse(readFileSync(file, 'utf8')) as RootFile;
  raw.items = raw.items ?? [];
  return raw;
}

export function writeRoot(registryDir: string, root: RootFile): void {
  const file = join(registryDir, 'registry.json');
  const sorted = { ...root, items: [...root.items].sort((a, b) => a.localeCompare(b)) };
  const cleaned = Object.fromEntries(
    Object.entries(sorted).filter(([, v]) => v !== undefined && v !== ''),
  ) as unknown as RootFile;
  writeFileSync(file, `${JSON.stringify(cleaned, null, 2)}\n`, 'utf8');
}

/** Relative display path for CLI output (POSIX). */
export function rel(name: string, projectDir: string, abs: string): string {
  return abs.replace(projectDir + '/', '').split('\\').join('/') || name;
}

/** Human-readable item type label. */
export function typeLabel(type: string): string {
  const map: Record<string, string> = {
    'registry:ui': 'ui',
    'registry:component': 'component',
    'registry:block': 'block',
    'registry:theme': 'theme',
    'registry:internal': 'internal',
  };
  return map[type] ?? type;
}

export function statusGlyph(status: string): string {
  switch (status) {
    case 'new':
      return kleur.green('NEW');
    case 'modified':
      return kleur.yellow('MODIFIED');
    case 'deleted':
      return kleur.red('DELETED');
    case 'unregistered':
      return kleur.cyan('UNREGISTERED');
    case 'unchanged':
      return kleur.dim('unchanged');
    default:
      return status;
  }
}