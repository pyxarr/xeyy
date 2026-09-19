import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdirSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import {
  discoverCandidates,
  generateDefinition,
  buildRegistry,
  validateDistRegistry,
  analyzeIconUsage,
  mergeIconUsage,
  extractNamedImports,
} from './index.ts';

const TEST_ROOT = join(tmpdir(), 'xeyy-registry-icon-test');

interface Repo {
  root: string;
  sourceDir: string;
  registryDir: string;
  outputDir: string;
}

function makeRepo(): Repo {
  const root = join(TEST_ROOT, `repo-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  return {
    root,
    sourceDir: join(root, 'packages', 'components', 'src'),
    registryDir: join(root, 'registry'),
    outputDir: join(root, 'dist', 'registry'),
  };
}

function cleanup(dir: string): void {
  if (existsSync(dir)) rmSync(dir, { recursive: true, force: true });
}

const ICON_SRC = `import * as stylex from '@stylexjs/stylex';
import { Check, Minus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export function Box() {
  return <Check />;
}
`;

const MULTI_LIB_SRC = `import { Check } from 'lucide-react';
import { X } from '@tabler/icons-react';
export const a = <Check />;
export const b = <X />;
`;

function writeRepo(repo: Repo): void {
  const dir = join(repo.sourceDir, 'ui', 'icon-widget');
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'icon-widget.tsx'), ICON_SRC, 'utf8');
  writeFileSync(join(dir, 'icon-widget.example.tsx'), `export const Example = () => null;\n`, 'utf8');
}

function register(repo: Repo): void {
  const candidates = discoverCandidates({ sourceDir: repo.sourceDir, registryDir: repo.registryDir });
  const root = { name: 'Test Registry', version: '1.0.0', items: [] as string[] };
  for (const candidate of candidates) {
    if (candidate.empty) continue;
    const g = generateDefinition(candidate, { registryDir: repo.registryDir, candidates });
    mkdirSync(join(repo.registryDir, candidate.section, candidate.name), { recursive: true });
    writeFileSync(g.itemFilePath, `${JSON.stringify(g.item, null, 2)}\n`, 'utf8');
    root.items.push(g.indexEntry);
  }
  mkdirSync(repo.registryDir, { recursive: true });
  writeFileSync(join(repo.registryDir, 'registry.json'), `${JSON.stringify(root, null, 2)}\n`, 'utf8');
}

describe('analyzeIconUsage', () => {
  it('derives icon library usage from source imports', () => {
    const usage = analyzeIconUsage(`import { Check, Minus } from 'lucide-react';\n`);
    expect(usage).toEqual([{ library: 'lucide', names: ['Check', 'Minus'] }]);
  });

  it('excludes type-only imports', () => {
    expect(
      analyzeIconUsage(`import { Check } from 'lucide-react';\nimport type { LucideIcon } from 'lucide-react';\n`),
    ).toEqual([{ library: 'lucide', names: ['Check'] }]);
  });

  it('aggregates per-file usages deterministically across libraries', () => {
    expect(mergeIconUsage(analyzeIconUsage(MULTI_LIB_SRC))).toEqual([
      { library: 'lucide', names: ['Check'] },
      { library: 'tabler', names: ['X'] },
    ]);
  });

  it('returns [] for non-icon source', () => {
    expect(analyzeIconUsage(`import { z } from 'zod';\n`)).toEqual([]);
  });
});

describe('registry icon metadata', () => {
  let repo: Repo;

  beforeEach(() => {
    cleanup(TEST_ROOT);
    mkdirSync(TEST_ROOT, { recursive: true });
    repo = makeRepo();
    writeRepo(repo);
    register(repo);
  });

  afterEach(() => cleanup(TEST_ROOT));

  it('records icons metadata derived from source', () => {
    const def = JSON.parse(readFileSync(join(repo.registryDir, 'ui', 'icon-widget', 'registry.json'), 'utf8'));
    expect(def.dependencies).toContain('lucide-react');
    expect(def.icons).toEqual([{ library: 'lucide', names: ['Check', 'Minus'] }]);
  });

  it('does not read consumer config when deriving icon metadata', () => {
    // No xeyy.config.json exists in the repo; derivation is source-only.
    expect(existsSync(join(repo.root, 'xeyy.config.json'))).toBe(false);
    const def = JSON.parse(readFileSync(join(repo.registryDir, 'ui', 'icon-widget', 'registry.json'), 'utf8'));
    expect(def.icons?.[0]?.library).toBe('lucide');
  });

  it('emits icon metadata into built index and payloads and validates the dist', () => {
    buildRegistry({ registryDir: repo.registryDir, outputDir: repo.outputDir });

    const index = JSON.parse(readFileSync(join(repo.outputDir, 'index.json'), 'utf8'));
    const entry = index.items.find((item: { name: string }) => item.name === 'icon-widget')!;
    expect(entry.icons).toEqual([{ library: 'lucide', names: ['Check', 'Minus'] }]);
    expect(entry.dependencies).toContain('lucide-react');

    const payload = JSON.parse(readFileSync(join(repo.outputDir, 'ui', 'icon-widget.json'), 'utf8'));
    expect(payload.icons).toEqual([{ library: 'lucide', names: ['Check', 'Minus'] }]);

    const result = validateDistRegistry({ distDir: repo.outputDir });
    expect(result.valid).toBe(true);
  });
});
