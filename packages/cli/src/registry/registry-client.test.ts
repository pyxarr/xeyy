import { describe, it, expect, afterEach } from 'vitest';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import type { RegistryItem, RegistryIndex } from '@xeyy/registry';
import type { XeyyConfig } from '@xeyy/config';
import { loadDistRegistry } from './client.ts';
import { resolveItem, flattenResolved } from './resolver.ts';
import { stageFiles, requiresTheme } from './install.ts';

const TEST_ROOT = join(tmpdir(), 'xeyy-cli-test');

interface Fixture {
  dir: string;
  components: string;
  theme: string;
}

function makeFixture(): Fixture {
  const dir = join(TEST_ROOT, `proj-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const components = join(dir, 'src', 'components', 'ui');
  const theme = join(dir, 'src', 'styles', 'theme.stylex.ts');
  return { dir, components, theme };
}

const cleanup = (dir: string): void => {
  rmSync(dir, { recursive: true, force: true });
};

function makeItem(overrides: Partial<RegistryItem> = {}): RegistryItem {
  return {
    name: 'x',
    type: 'registry:ui',
    version: '1.0.0',
    source: '.',
    files: [{ path: 'x.tsx', type: 'registry:ui', content: 'export const X = 1;' }],
    ...overrides,
  } as RegistryItem;
}

/** Write a dist registry: theme + base-button + dialog(->base-button) + modal(->dialog + base-button). */
function writeDist(fix: Fixture): void {
  const items: RegistryItem[] = [
    makeItem({
      name: 'default-theme',
      type: 'registry:theme',
      files: [
        {
          path: 'tokens.stylex.ts',
          type: 'registry:theme',
          target: 'theme.stylex.ts',
          content: 'export const t = 1;',
        },
      ],
    }),
    makeItem({
      name: 'base-button',
      files: [
        {
          path: 'base-button.tsx',
          type: 'registry:ui',
          content: `import { t } from '@xeyy/tokens/tokens.stylex'; export const B = t;`,
        },
      ],
    }),
    makeItem({
      name: 'dialog',
      files: [{ path: 'dialog.tsx', type: 'registry:ui', content: 'export const D = 1;' }],
      registryDependencies: ['base-button'],
    }),
    makeItem({
      name: 'modal',
      files: [{ path: 'modal.tsx', type: 'registry:ui', content: 'export const M = 1;' }],
      registryDependencies: ['dialog', 'base-button'],
    }),
  ];

  const index: RegistryIndex = {
    $schema: 'https://xeyy.dev/schema/registry-index.json',
    name: 'test',
    items: items.map((item) => ({
      name: item.name,
      section: item.type === 'registry:theme' ? 'themes' : 'ui',
      type: item.type,
      version: item.version,
      fileCount: item.files.length,
      path: `${item.type === 'registry:theme' ? 'themes' : 'ui'}/${item.name}.json`,
    })),
  };

  const dist = join(fix.dir, 'dist', 'registry');
  mkdirSync(dist, { recursive: true });
  writeFileSync(join(dist, 'index.json'), JSON.stringify(index), 'utf8');
  for (const item of items) {
    const file = join(dist, item.type === 'registry:theme' ? 'themes' : 'ui', `${item.name}.json`);
    mkdirSync(join(file, '..'), { recursive: true });
    writeFileSync(file, JSON.stringify(item), 'utf8');
  }
}

const CONFIG: XeyyConfig = {
  components: { path: 'src/components/ui' },
  theme: { path: 'src/styles/theme.stylex.ts' },
};

describe('resolver', () => {
  it('resolves transitive registry dependencies deps-first', () => {
    const fix = makeFixture();
    try {
      writeDist(fix);
      const client = loadDistRegistry(join(fix.dir, 'dist', 'registry'));
      const resolved = resolveItem(client, 'modal');
      expect(resolved.dependencies.map((d) => d.name)).toEqual(['base-button', 'dialog']);
      expect(resolved.item.name).toBe('modal');
    } finally {
      cleanup(fix.dir);
    }
  });

  it('rejects unknown registry dependencies', () => {
    const fix = makeFixture();
    try {
      writeDist(fix);
      const client = loadDistRegistry(join(fix.dir, 'dist', 'registry'));
      expect(() => resolveItem(client, 'ghost')).toThrow(/not found/);
    } finally {
      cleanup(fix.dir);
    }
  });

  it('detects circular registry dependencies', () => {
    const fix = makeFixture();
    try {
      const a = makeItem({ name: 'a', registryDependencies: ['b'] });
      const b = makeItem({ name: 'b', registryDependencies: ['a'] });
      const dist = join(fix.dir, 'dist', 'registry');
      mkdirSync(dist, { recursive: true });
      const index: RegistryIndex = {
        $schema: 'https://xeyy.dev/schema/registry-index.json',
        name: 'test',
        items: [a, b].map((item) => ({
          name: item.name,
          section: 'ui',
          type: item.type,
          version: item.version,
          fileCount: item.files.length,
          path: `ui/${item.name}.json`,
        })),
      };
      writeFileSync(join(dist, 'index.json'), JSON.stringify(index), 'utf8');
      mkdirSync(join(dist, 'ui'), { recursive: true });
      writeFileSync(join(dist, 'ui', 'a.json'), JSON.stringify(a), 'utf8');
      writeFileSync(join(dist, 'ui', 'b.json'), JSON.stringify(b), 'utf8');
      const client = loadDistRegistry(dist);
      expect(() => resolveItem(client, 'a')).toThrow(/circular/i);
    } finally {
      cleanup(fix.dir);
    }
  });

  it('flattenResolved merges shared transitive deps without duplicates', () => {
    const shared = makeItem({ name: 'shared' });
    const a = makeItem({ name: 'a', registryDependencies: ['shared'] });
    const b = makeItem({ name: 'b', registryDependencies: ['shared'] });
    const flattened = flattenResolved([
      { item: a, dependencies: [shared] },
      { item: b, dependencies: [shared] },
    ]);
    expect(flattened.map((i) => i.name)).toEqual(['shared', 'a', 'b']);
  });
});

describe('install staging', () => {
  it('rewrites token imports and installs theme to the configured path', () => {
    const fix = makeFixture();
    try {
      const themeItem = makeItem({
        name: 'default-theme',
        type: 'registry:theme',
        files: [
          {
            path: 'tokens.stylex.ts',
            type: 'registry:theme',
            target: 'theme.stylex.ts',
            content: 'export const t = 1;',
          },
        ],
      });
      const button = makeItem({
        name: 'button',
        files: [
          {
            path: 'button.tsx',
            type: 'registry:ui',
            content: `import { t } from '@xeyy/tokens/tokens.stylex'; export const B = t;`,
          },
          { path: 'button.example.tsx', type: 'example', content: 'export const E = 1;' },
          { path: 'button.md', type: 'documentation', content: '# docs' },
        ],
      });

      const staged = stageFiles([themeItem, button], CONFIG, fix.dir);

      const themeStaged = staged.find((s) => s.item === 'default-theme');
      expect(themeStaged?.sourcePath).toBe('tokens.stylex.ts');
      expect(themeStaged?.target).toBe(fix.theme);
      expect(themeStaged?.content).toBe('export const t = 1;');

      const buttonStaged = staged.find((s) => s.item === 'button');
      expect(buttonStaged?.target).toBe(resolve(fix.dir, 'src/components/ui/button.tsx'));
      expect(buttonStaged?.content).not.toContain('@xeyy/tokens');
      expect(buttonStaged?.content).toContain("'../../styles/theme.stylex'");

      // example/documentation files are never staged.
      expect(staged.filter((s) => s.item === 'button')).toHaveLength(1);
    } finally {
      cleanup(fix.dir);
    }
  });

  it('throws when embedded content is missing', () => {
    const fix = makeFixture();
    try {
      const item = makeItem({
        files: [{ path: 'x.tsx', type: 'registry:ui' }],
      });
      expect(() => stageFiles([item], CONFIG, fix.dir)).toThrow(/missing embedded content/);
    } finally {
      cleanup(fix.dir);
    }
  });

  it('detects theme requirement from token imports', () => {
    const withTokens = makeItem({
      name: 'a',
      files: [{ path: 'a.tsx', type: 'registry:ui', content: `import { t } from '@xeyy/tokens';` }],
    });
    const plain = makeItem({ name: 'b' });
    expect(requiresTheme([withTokens])).toBe(true);
    expect(requiresTheme([plain])).toBe(false);
  });
});

describe('client', () => {
  it('loads a built dist registry', () => {
    const fix = makeFixture();
    try {
      writeDist(fix);
      const client = loadDistRegistry(join(fix.dir, 'dist', 'registry'));
      expect(client.index.items).toHaveLength(4);
      expect(client.items.get('modal')?.type).toBe('registry:ui');
      expect(client.items.get('default-theme')?.type).toBe('registry:theme');
      expect(existsSync(client.source)).toBe(true);
    } finally {
      cleanup(fix.dir);
    }
  });
});