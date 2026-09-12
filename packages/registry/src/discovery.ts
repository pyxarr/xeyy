import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

import type { RegistrySection } from './schemas.ts';

export type SourceFileKind = 'code' | 'example' | 'test' | 'documentation' | 'skip';

export interface ScannedFile {
  /** Path relative to the component source directory, POSIX-style. */
  relativePath: string;
  kind: SourceFileKind;
}

export interface RegistryCandidate {
  /** Item name, derived deterministically from the directory. */
  name: string;
  section: RegistrySection;
  /** Absolute path to the canonical component source directory. */
  dir: string;
  /** Section-relative descriptor, e.g. `ui/button` or `themes/default`. */
  rel: string;
  files: ScannedFile[];
  /** Whether a registry definition already exists for this candidate. */
  registered: boolean;
  /** Directory of the existing/expected registry definition. */
  definitionDir: string;
  /** True when the candidate exists on disk but has no usable source files. */
  empty: boolean;
}

const WORD_RE = /^[\w][\w-]*$/;

export function sectionFromPath(rel: string): RegistrySection | undefined {
  const first = rel.split(/[\\/]/)[0]!;
  if (first === 'ui' || first === 'components' || first === 'blocks' || first === 'internal' || first === 'themes') {
    return first;
  }
  return undefined;
}

/** Directories that must never be scanned as candidates or registered. */
const IGNORED_DIRS = new Set([
  'node_modules',
  'dist',
  'build',
  'coverage',
  '.git',
  '.turbo',
  '.next',
  '.svn',
  '.hg',
  '.yarn',
  '.pnpm',
  '.cache',
]);

export function classifySourceFile(filename: string): SourceFileKind {
  if (filename === 'registry.json' || filename === 'registry.schema.json') return 'skip';
  if (/\.(test|spec)\.[cm]?[jt]sx?$/i.test(filename)) return 'test';
  if (/\.(stories?|story|example|examples?|demo|sample|fixture)\.[cm]?[jt]sx?$/i.test(filename)) return 'example';
  if (/\.types\.[cm]?[jt]sx?$/i.test(filename)) return 'skip';
  if (/\.(md|mdx)$/i.test(filename)) return 'documentation';
  if (/\.(ts|tsx|cts|mts|js|jsx)$/i.test(filename)) return 'code';
  return 'skip';
}

export function scanSourceDir(dir: string): ScannedFile[] {
  if (!existsSync(dir)) return [];
  const results: ScannedFile[] = [];

  const walk = (current: string, relPrefix: string): void => {
    let entries: string[];
    try {
      entries = readdirSync(current);
    } catch {
      return;
    }

    for (const entry of entries) {
      if (entry.startsWith('.') && entry !== '.') continue;
      if (IGNORED_DIRS.has(entry)) continue;

      const abs = join(current, entry);
      let stat: ReturnType<typeof statSync>;
      try {
        stat = statSync(abs);
      } catch {
        continue;
      }

      if (stat.isSymbolicLink()) {
        // Do not follow symlinks during discovery: they can escape the repo.
        continue;
      }

      const rel = relPrefix.length > 0 ? `${relPrefix}/${entry}` : entry;

      if (stat.isDirectory()) {
        walk(abs, rel);
        continue;
      }
      if (!stat.isFile()) continue;

      const kind = classifySourceFile(entry);
      if (kind === 'skip') continue;
      results.push({ relativePath: rel, kind });
    }
  };

  walk(dir, '');
  results.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
  return results;
}

function itemNameForSection(section: RegistrySection, dirName: string): string {
  if (section === 'themes') {
    return dirName.endsWith('-theme') ? dirName : `${dirName}-theme`;
  }
  return dirName;
}

function definitionDirFor(section: RegistrySection, rel: string, registryDir: string): string {
  const parts = rel.split('/');
  const dirName = parts[parts.length - 1]!;
  return join(registryDir, section, dirName);
}

/**
 * Discover registry candidates from the canonical component source tree.
 *
 * Expected layout:
 *   <sourceDir>/ui/<name>
 *   <sourceDir>/components/<name>
 *   <sourceDir>/blocks/<name>
 *   <sourceDir>/internal/<name>
 *   <themes>/<name>          (themeSourceDir ?? sourceDir)
 *
 * Deterministic: candidates are returned sorted by (section, name).
 */
export function discoverCandidates(options: {
  sourceDir: string;
  registryDir: string;
  themeSourceDir?: string;
}): RegistryCandidate[] {
  const { sourceDir, registryDir, themeSourceDir } = options;
  if (!existsSync(sourceDir)) return [];

  const candidates: RegistryCandidate[] = [];

  for (const section of ['ui', 'components', 'blocks', 'internal'] as const) {
    const sectionDir = join(sourceDir, section);
    if (!existsSync(sectionDir)) continue;

    let entries: string[];
    try {
      entries = readdirSync(sectionDir);
    } catch {
      continue;
    }

    for (const entry of entries) {
      if (entry.startsWith('.')) continue;
      if (IGNORED_DIRS.has(entry)) continue;
      if (!WORD_RE.test(entry)) continue;

      const abs = join(sectionDir, entry);
      let stat;
      try {
        stat = statSync(abs);
      } catch {
        continue;
      }
      if (!stat.isDirectory() || stat.isSymbolicLink()) continue;

      const files = scanSourceDir(abs);
      const name = itemNameForSection(section, entry);
      const definitionDir = definitionDirFor(section, `${section}/${entry}`, registryDir);
      const registered = existsSync(join(definitionDir, 'registry.json'));

      const empty = !files.some((f) => f.kind === 'code');

      candidates.push({
        name,
        section,
        dir: abs,
        rel: `${section}/${entry}`,
        files,
        registered,
        definitionDir,
        empty,
      });
    }
  }

  const themesRoot = themeSourceDir ?? sourceDir;
  const themesDir = join(themesRoot, 'themes');
  if (existsSync(themesDir)) {
    let entries: string[];
    try {
      entries = readdirSync(themesDir);
    } catch {
      entries = [];
    }
    for (const entry of entries) {
      if (entry.startsWith('.')) continue;
      if (IGNORED_DIRS.has(entry)) continue;
      if (!WORD_RE.test(entry)) continue;

      const abs = join(themesDir, entry);
      let stat;
      try {
        stat = statSync(abs);
      } catch {
        continue;
      }
      if (!stat.isDirectory() || stat.isSymbolicLink()) continue;

      const files = scanSourceDir(abs);
      const name = itemNameForSection('themes', entry);
      const definitionDir = definitionDirFor('themes', `themes/${entry}`, registryDir);
      const registered = existsSync(join(definitionDir, 'registry.json'));
      const empty = !files.some((f) => f.kind === 'code');

      candidates.push({
        name,
        section: 'themes',
        dir: abs,
        rel: `themes/${entry}`,
        files,
        registered,
        definitionDir,
        empty,
      });
    }
  }

  candidates.sort((a, b) => a.rel.localeCompare(b.rel));
  return candidates;
}

/** Load a registry definition for a candidate if one exists. */
export function readCandidateDefinition(candidate: RegistryCandidate): unknown | null {
  const defFile = join(candidate.definitionDir, 'registry.json');
  if (!existsSync(defFile)) return null;
  try {
    return JSON.parse(readFileSync(defFile, 'utf8')) as unknown;
  } catch {
    return null;
  }
}

export function resolveSourceDir(candidate: RegistryCandidate): string {
  return resolve(candidate.dir);
}