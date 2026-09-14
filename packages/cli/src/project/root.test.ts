import { describe, it, expect } from 'vitest';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { resolveProjectRoot } from './root.ts';

const TEST_ROOT = join(tmpdir(), 'xeyy-cli-test');

function makeDir(): string {
  const dir = join(TEST_ROOT, `root-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  mkdirSync(dir, { recursive: true });
  return dir;
}

const cleanup = (dir: string): void => {
  rmSync(dir, { recursive: true, force: true });
};

function writeMarker(file: string): void {
  mkdirSync(join(file, '..'), { recursive: true });
  writeFileSync(file, '{}', 'utf8');
}

describe('resolveProjectRoot', () => {
  it('resolves to the ancestor with xeyy.config.json when run from a nested package dir', () => {
    const root = makeDir();
    try {
      writeMarker(join(root, 'xeyy.config.json'));
      const nested = join(root, 'packages', 'cli');
      mkdirSync(nested, { recursive: true });
      expect(resolveProjectRoot(nested)).toBe(root);
    } finally {
      cleanup(root);
    }
  });

  it('returns the start dir when it already contains xeyy.config.json', () => {
    const root = makeDir();
    try {
      writeMarker(join(root, 'xeyy.config.json'));
      expect(resolveProjectRoot(root)).toBe(root);
    } finally {
      cleanup(root);
    }
  });

  it('prefers a nearer config over a farther workspace marker', () => {
    const root = makeDir();
    try {
      writeMarker(join(root, 'pnpm-workspace.yaml'));
      const inner = join(root, 'packages', 'inner');
      writeMarker(join(inner, 'xeyy.config.json'));
      const nested = join(inner, 'src', 'components');
      mkdirSync(nested, { recursive: true });
      expect(resolveProjectRoot(nested)).toBe(inner);
    } finally {
      cleanup(root);
    }
  });

  it('falls back to the workspace root via pnpm-workspace.yaml when no config exists', () => {
    const root = makeDir();
    try {
      writeMarker(join(root, 'pnpm-workspace.yaml'));
      const nested = join(root, 'packages', 'cli');
      writeMarker(join(nested, 'package.json'));
      expect(resolveProjectRoot(nested)).toBe(root);
    } finally {
      cleanup(root);
    }
  });

  it('returns the start dir when no config or marker exists anywhere above', () => {
    const root = makeDir();
    try {
      expect(resolveProjectRoot(root)).toBe(root);
    } finally {
      cleanup(root);
    }
  });
});