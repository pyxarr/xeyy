import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { join, relative, resolve } from 'node:path';

import { discoverCandidates, readCandidateDefinition, scanSourceDir, type RegistryCandidate } from './discovery.ts';
import type { RegistryItem } from './schemas.ts';

export type ItemStatus = 'unchanged' | 'modified' | 'new' | 'deleted' | 'unregistered';

export interface StatusEntry {
  name: string;
  section: string;
  rel: string;
  status: ItemStatus;
  changes: string[];
  registered: boolean;
}

export interface StatusReport {
  entries: StatusEntry[];
  total: number;
}

export interface StatusOptions {
  sourceDir: string;
  registryDir: string;
  /** Canonical theme source root; defaults to `sourceDir`. */
  themeSourceDir?: string;
  /** Set false to skip git-based "new" classification (tests). */
  gitAvailable?: boolean;
}

export function sha256(input: string): string {
  return createHash('sha256').update(input, 'utf8').digest('hex');
}

/**
 * Compute a fingerprint record for the code files of a candidate source dir:
 * `relativePath -> sha256(content)`. Only code files are fingerprinted;
 * examples/docs/tests are not part of change detection.
 */
export function fingerprintCandidate(candidate: RegistryCandidate): Record<string, string> {
  return fingerprintCodeFiles(candidate.dir, candidate.files);
}

export function fingerprintCodeFiles(
  dir: string,
  files: { relativePath: string; kind: string }[],
): Record<string, string> {
  const record: Record<string, string> = {};
  for (const file of files) {
    if (file.kind !== 'code') continue;
    const abs = join(dir, file.relativePath);
    if (!existsSync(abs)) continue;
    record[file.relativePath] = sha256(readFileSync(abs, 'utf8'));
  }
  const entries = Object.entries(record).sort(([a], [b]) => a.localeCompare(b));
  const sorted: Record<string, string> = {};
  for (const [k, v] of entries) sorted[k] = v;
  return sorted;
}

/** True when the definition's recorded fingerprint matches the current source. */
export function fingerprintMatches(item: RegistryItem, candidate: RegistryCandidate): boolean {
  const existing = item.fingerprint ?? {};
  const current = fingerprintCandidate(candidate);
  const existingKeys = Object.keys(existing).sort();
  const currentKeys = Object.keys(current).sort();
  if (existingKeys.length !== currentKeys.length) return false;
  for (let i = 0; i < existingKeys.length; i++) {
    if (existingKeys[i] !== currentKeys[i]) return false;
    if (existing[existingKeys[i]!] !== current[currentKeys[i]!]) return false;
  }
  return true;
}

function diffChanges(item: RegistryItem, candidate: RegistryCandidate): string[] {
  const changes: string[] = [];
  const current = fingerprintCandidate(candidate);
  const existing = item.fingerprint ?? {};

  for (const key of Object.keys(current).sort()) {
    if (!(key in existing)) changes.push(`added: ${key}`);
    else if (existing[key] !== current[key]) changes.push(`modified: ${key}`);
  }
  for (const key of Object.keys(existing).sort()) {
    if (!(key in current)) changes.push(`removed: ${key}`);
  }
  return changes;
}

/** True when the candidate source dir contains files untracked in git. */
function isNewInGit(sourceDir: string, candidateDir: string): boolean {
  try {
    const rootRel = relative(sourceDir, candidateDir).split('\\').join('/');
    const out = execFileSync('git', ['ls-files', '--others', '--exclude-standard', rootRel], {
      cwd: sourceDir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: 5000,
    });
    return out.trim().length > 0;
  } catch {
    return false;
  }
}

/**
 * Resolve a registered definition that has no discovered candidate against its
 * own canonical source. Returns the status the definition actually warrants:
 * `unchanged`/`modified` when the source still exists (non-canonical layout),
 * or `undefined` when the canonical source is gone (true deletion).
 */
function evaluateOrphanSource(item: RegistryItem, defDir: string):
  | { status: 'unchanged' | 'modified'; changes: string[] }
  | undefined {
  if (!Array.isArray(item.files) || item.files.length === 0) return undefined;
  const sourceDir = resolve(defDir, typeof item.source === 'string' ? item.source : '.');
  const files = item.files
    .map((f) => f.path)
    .filter((p): p is string => typeof p === 'string')
    .map((relativePath) => ({ relativePath, kind: 'code' }));
  if (files.length === 0) return undefined;
  if (!files.every((f) => existsSync(join(sourceDir, f.relativePath)))) return undefined;
  const synthetic = { dir: sourceDir, files } as RegistryCandidate;
  if (fingerprintMatches(item, synthetic)) return { status: 'unchanged', changes: [] };
  return { status: 'modified', changes: diffChanges(item, synthetic) };
}

/** Registered definitions whose canonical source candidate no longer exists. */
function orphanDefinitions(registryDir: string, candidates: RegistryCandidate[]): StatusEntry[] {
  const known = new Set(candidates.map((c) => c.rel));
  const orphans: StatusEntry[] = [];
  const sections = ['ui', 'components', 'blocks', 'themes', 'internal'];

  for (const section of sections) {
    const sectionDir = join(registryDir, section);
    if (!existsSync(sectionDir)) continue;
    let entries: string[];
    try {
      entries = readdirSync(sectionDir);
    } catch {
      continue;
    }
    for (const entry of entries) {
      const defFile = join(sectionDir, entry, 'registry.json');
      if (!existsSync(defFile)) continue;
      const rel = `${section}/${entry}`;
      if (known.has(rel)) continue;
      let name = entry;
      let item: RegistryItem | undefined;
      try {
        item = JSON.parse(readFileSync(defFile, 'utf8')) as RegistryItem;
        if (item.name) name = item.name;
      } catch {
        /* resolved name retained */
      }
      const real = item ? evaluateOrphanSource(item, join(sectionDir, entry)) : undefined;
      if (real) {
        orphans.push({
          name,
          section,
          rel,
          status: real.status,
          changes: real.changes,
          registered: true,
        });
        continue;
      }
      orphans.push({
        name,
        section,
        rel,
        status: 'deleted',
        changes: ['source component directory missing'],
        registered: true,
      });
    }
  }

  orphans.sort((a, b) => a.rel.localeCompare(b.rel));
  return orphans;
}

/** Analyze the source tree + registry definitions and report change status. */
export function analyzeStatus(options: StatusOptions): StatusReport {
  const { sourceDir, registryDir, themeSourceDir, gitAvailable } = options;
  const candidates = discoverCandidates({ sourceDir, registryDir, themeSourceDir });
  const entries: StatusEntry[] = [];

  for (const candidate of candidates) {
    if (candidate.empty) continue;

    if (candidate.registered) {
      const raw = readCandidateDefinition(candidate);
      if (raw === null) {
        entries.push({
          name: candidate.name,
          section: candidate.section,
          rel: candidate.rel,
          status: 'modified',
          changes: ['registry definition could not be parsed'],
          registered: true,
        });
        continue;
      }
      const item = raw as RegistryItem;
      if (fingerprintMatches(item, candidate)) {
        entries.push({ name: candidate.name, section: candidate.section, rel: candidate.rel, status: 'unchanged', changes: [], registered: true });
      } else {
        entries.push({
          name: candidate.name,
          section: candidate.section,
          rel: candidate.rel,
          status: 'modified',
          changes: diffChanges(item, candidate),
          registered: true,
        });
      }
      continue;
    }

    const newInGit = gitAvailable === false ? false : isNewInGit(sourceDir, candidate.dir);
    entries.push({
      name: candidate.name,
      section: candidate.section,
      rel: candidate.rel,
      status: newInGit ? 'new' : 'unregistered',
      changes: [],
      registered: false,
    });
  }

  const orphans = orphanDefinitions(registryDir, candidates);
  entries.push(...orphans);

  const order = ['new', 'modified', 'deleted', 'unregistered', 'unchanged'];
  entries.sort((a, b) => {
    const diff = order.indexOf(a.status) - order.indexOf(b.status);
    return diff !== 0 ? diff : a.rel.localeCompare(b.rel);
  });

  return { entries, total: entries.length };
}