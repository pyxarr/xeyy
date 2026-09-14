import { describe, it, expect, vi } from 'vitest';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { analyzeStatus, sha256, type StatusReport } from '@xeyy/registry';
import type { XeyyConfig } from '@xeyy/config';
import { authoringPaths, requireSourceDir } from '../registry/authoring.ts';
import { resolveProjectRoot } from '../project/root.ts';

const TEST_ROOT = join(tmpdir(), 'xeyy-cli-test');

const CONFIG: XeyyConfig = {
  components: { path: 'packages/components/src/ui' },
  theme: { path: 'packages/tokens/src/theme.stylex.ts' },
  aliases: { components: '@/components' },
  registry: {
    path: 'registry',
    source: 'packages/components/src',
    themes: 'packages/tokens/src',
    dist: 'dist/registry',
  },
};

const BUTTON_V1 = 'export const Button = 1;';
const BUTTON_V2 = 'export const Button = () => 2;';
const THEME = 'export const theme = {};';

interface StatusFixture {
  dir: string;
  nested: string;
  sourceDir: string;
  registryDir: string;
}

function write(file: string, content: string): void {
  mkdirSync(join(file, '..'), { recursive: true });
  writeFileSync(file, content, 'utf8');
}

/**
 * Replicates the repo layout: `xeyy.config.json` at the project root, canonical
 * source under `packages/`, registry definitions under `registry/`, and a
 * nested package dir (e.g. `packages/cli`) that a `pnpm --filter ... start`
 * invocation would use as cwd.
 */
function makeStatusFixture(): StatusFixture {
  const dir = join(TEST_ROOT, `status-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const nested = join(dir, 'packages', 'cli');

  write(join(dir, 'xeyy.config.json'), JSON.stringify(CONFIG, null, 2));
  write(join(dir, 'packages', 'components', 'src', 'ui', 'button', 'button.tsx'), BUTTON_V1);
  write(join(dir, 'packages', 'tokens', 'src', 'theme.stylex.ts'), THEME);

  const rootIndex = {
    $schema: 'https://xeyy-registry.vercel.app/schema/registry.json',
    name: 'Test Registry',
    version: '0.0.1',
    items: ['./themes/default/registry.json', './ui/button/registry.json'],
  };
  write(join(dir, 'registry', 'registry.json'), JSON.stringify(rootIndex, null, 2));

  const buttonDef = {
    name: 'button',
    type: 'registry:ui',
    version: '0.0.1',
    files: [],
    fingerprint: { 'button.tsx': sha256(BUTTON_V1) },
  };
  write(join(dir, 'registry', 'ui', 'button', 'registry.json'), JSON.stringify(buttonDef, null, 2));

  const themeDef = {
    name: 'default-theme',
    type: 'registry:theme',
    version: '0.0.1',
    files: [],
    fingerprint: { 'theme.stylex.ts': sha256(THEME) },
  };
  write(join(dir, 'registry', 'themes', 'default', 'registry.json'), JSON.stringify(themeDef, null, 2));

  return {
    dir,
    nested,
    sourceDir: join(dir, 'packages', 'components', 'src'),
    registryDir: join(dir, 'registry'),
  };
}

const cleanup = (dir: string): void => {
  rmSync(dir, { recursive: true, force: true });
};

/**
 * The pipeline used by `xeyy registry status`: resolve the project root from
 * the (nested) working directory, derive authoring paths, then analyze status.
 */
function statusFrom(nested: string): StatusReport {
  const root = resolveProjectRoot(nested);
  const base = authoringPaths(root);
  return analyzeStatus({
    sourceDir: base.sourceDir,
    registryDir: base.registryDir,
    themeSourceDir: base.themeDir,
    gitAvailable: false,
  });
}

describe('registry status project-root resolution', () => {
  it('resolves authoring paths to the project root, not the nested package cwd', () => {
    const fix = makeStatusFixture();
    try {
      const root = resolveProjectRoot(fix.nested);
      expect(root).toBe(fix.dir);

      const base = authoringPaths(root);
      expect(base.sourceDir).toBe(resolve(fix.dir, 'packages/components/src'));
      expect(base.registryDir).toBe(resolve(fix.dir, 'registry'));
      expect(base.themeDir).toBe(resolve(fix.dir, 'packages/tokens/src'));
    } finally {
      cleanup(fix.dir);
    }
  });

  it('reports up to date when source matches the registered fingerprints', () => {
    const fix = makeStatusFixture();
    try {
      const report = statusFrom(fix.nested);
      expect(report.entries.filter((e) => e.status !== 'unchanged')).toEqual([]);
    } finally {
      cleanup(fix.dir);
    }
  });

  it('reports modified components when source diverges (no false "up to date")', () => {
    const fix = makeStatusFixture();
    try {
      write(join(fix.dir, 'packages', 'components', 'src', 'ui', 'button', 'button.tsx'), BUTTON_V2);

      const report = statusFrom(fix.nested);
      const button = report.entries.find((e) => e.name === 'button');
      expect(button?.status).toBe('modified');
      expect(button?.changes).toContain('modified: button.tsx');

      const theme = report.entries.find((e) => e.name === 'default-theme');
      expect(theme?.status).toBe('unchanged');
    } finally {
      cleanup(fix.dir);
    }
  });

  it('fails clearly when the source root is missing instead of reporting up to date', () => {
    const fix = makeStatusFixture();
    try {
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      try {
        requireSourceDir(join(fix.dir, 'packages', 'missing', 'src'));
        expect(exitSpy).toHaveBeenCalledWith(4);
        expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Component source not found'));
      } finally {
        exitSpy.mockRestore();
        errorSpy.mockRestore();
      }
    } finally {
      cleanup(fix.dir);
    }
  });

  it('fails instead of reporting up to date when run outside any configured project', () => {
    const fix = makeStatusFixture();
    const bare = join(TEST_ROOT, `bare-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(bare, { recursive: true });
    try {
      // No config and no markers above `bare`: the CLI treats it as its own
      // root and derives the default layout, whose source dir does not exist.
      const base = authoringPaths(bare);
      expect(existsSync(base.sourceDir)).toBe(false);

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      try {
        requireSourceDir(base.sourceDir);
        expect(exitSpy).toHaveBeenCalledWith(4);
      } finally {
        exitSpy.mockRestore();
        errorSpy.mockRestore();
      }
    } finally {
      cleanup(bare);
      cleanup(fix.dir);
    }
  });

  it('accepts an existing source root', () => {
    const fix = makeStatusFixture();
    try {
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
      try {
        requireSourceDir(fix.sourceDir);
        expect(exitSpy).not.toHaveBeenCalled();
      } finally {
        exitSpy.mockRestore();
      }
    } finally {
      cleanup(fix.dir);
    }
  });
});