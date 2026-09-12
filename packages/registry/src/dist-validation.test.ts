import { describe, it, expect, afterEach } from 'vitest';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { validateDistRegistry, distRegistryItemSchema } from './index.ts';
import type { RegistryIndex, RegistryIndexEntry, RegistryItem } from './schemas.ts';

const TEST_ROOT = join(tmpdir(), 'xeyy-dist-test');

/** Public distribution payload shape (never carries `source`). */
type DistItem = Omit<RegistryItem, 'source'>;

interface Fixture {
  root: string;
  dist: string;
  button: DistItem;
  index: RegistryIndex;
}

function entryFor(item: DistItem, overrides: Partial<RegistryIndexEntry> = {}): RegistryIndexEntry {
  return {
    name: item.name,
    section: item.type === 'registry:theme' ? 'themes' : 'ui',
    type: item.type,
    version: item.version,
    fileCount: item.files.length,
    path: `${item.type === 'registry:theme' ? 'themes' : 'ui'}/${item.name}.json`,
    ...overrides,
  };
}

function makeItem(overrides: Partial<DistItem> = {}): DistItem {
  return {
    name: 'button',
    type: 'registry:ui',
    version: '1.0.0',
    files: [{ path: 'button.tsx', type: 'registry:ui' as const, content: 'export const Button = 1;' }],
    ...overrides,
  };
}

function makeFixture(): Fixture {
  const root = join(TEST_ROOT, `dist-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const dist = join(root, 'dist', 'registry');
  const button = makeItem();
  const index: RegistryIndex = { $schema: 'https://xeyy.dev/schema/registry-index.json', name: 'test', items: [entryFor(button)] };
  return { root, dist, button, index };
}

function writeDist(fix: Fixture, items: DistItem[], index: RegistryIndex): void {
  mkdirSync(fix.dist, { recursive: true });
  for (const item of items) {
    const file = join(fix.dist, item.type === 'registry:theme' ? 'themes' : 'ui', `${item.name}.json`);
    mkdirSync(join(file, '..'), { recursive: true });
    writeFileSync(file, JSON.stringify(item), 'utf8');
  }
  writeFileSync(join(fix.dist, 'index.json'), JSON.stringify(index), 'utf8');
}

function writeIndex(fix: Fixture, index: RegistryIndex): void {
  mkdirSync(fix.dist, { recursive: true });
  writeFileSync(join(fix.dist, 'index.json'), JSON.stringify(index), 'utf8');
}

const cleanup = (fix: Fixture): void => {
  rmSync(fix.root, { recursive: true, force: true });
};

describe('distRegistryItemSchema', () => {
  it('accepts a distribution payload and rejects internal source', () => {
    const payload = makeItem();
    expect(distRegistryItemSchema.safeParse(payload).success).toBe(true);

    const leak = { ...payload, source: '../../../packages/components/src/ui/button' };
    const parsed = distRegistryItemSchema.safeParse(leak);
    expect(parsed.success).toBe(false);
  });
});

describe('validateDistRegistry', () => {
  describe('valid distribution', () => {
    it('passes a fully valid generated registry', () => {
      const fix = makeFixture();
      try {
        writeDist(fix, [fix.button], fix.index);
        const result = validateDistRegistry({ distDir: fix.dist });
        expect(result.valid).toBe(true);
        expect(result.rootIssues).toHaveLength(0);
        expect(result.itemIssues.size).toBe(0);
        expect(result.consistencyIssues).toHaveLength(0);
      } finally {
        cleanup(fix);
      }
    });

    it('passes a valid theme item with a target', () => {
      const fix = makeFixture();
      try {
        const theme = makeItem({
          name: 'default-theme',
          type: 'registry:theme',
          files: [{ path: 'theme.stylex.ts', type: 'registry:theme' as const, target: 'theme.stylex.ts', content: 'export const t = 1;' }],
        });
        const index: RegistryIndex = { $schema: 'https://xeyy.dev/schema/registry-index.json', name: 'test', items: [entryFor(theme)] };
        writeDist(fix, [theme], index);
        expect(validateDistRegistry({ distDir: fix.dist }).valid).toBe(true);
      } finally {
        cleanup(fix);
      }
    });
  });

  describe('index integrity', () => {
    it('fails when the index is missing', () => {
      const fix = makeFixture();
      try {
        mkdirSync(fix.dist, { recursive: true });
        const result = validateDistRegistry({ distDir: fix.dist });
        expect(result.valid).toBe(false);
        expect(result.rootIssues.some((i) => i.path === 'index.json')).toBe(true);
      } finally {
        cleanup(fix);
      }
    });

    it('fails when a referenced item payload does not exist', () => {
      const fix = makeFixture();
      try {
        writeIndex(fix, fix.index);
        const result = validateDistRegistry({ distDir: fix.dist });
        expect(result.valid).toBe(false);
        expect(result.itemIssues.has('ui/button.json')).toBe(true);
      } finally {
        cleanup(fix);
      }
    });

    it('fails on an unsafe index reference that escapes the distribution', () => {
      const fix = makeFixture();
      try {
        const index: RegistryIndex = {
          $schema: 'https://xeyy.dev/schema/registry-index.json',
          name: 'test',
          items: [entryFor(fix.button, { path: '../escape.json' })],
        };
        writeDist(fix, [fix.button], index);
        const result = validateDistRegistry({ distDir: fix.dist });
        expect(result.valid).toBe(false);
        expect([...result.itemIssues.keys()].some((p) => p.includes('..'))).toBe(true);
      } finally {
        cleanup(fix);
      }
    });
  });

  describe('item payloads', () => {
    it('fails on malformed item JSON', () => {
      const fix = makeFixture();
      try {
        writeDist(fix, [fix.button], fix.index);
        writeFileSync(join(fix.dist, 'ui', 'button.json'), '{oops', 'utf8');
        const result = validateDistRegistry({ distDir: fix.dist });
        expect(result.valid).toBe(false);
        expect(result.itemIssues.get('ui/button.json')?.some((i) => i.message.startsWith('malformed'))).toBe(true);
      } finally {
        cleanup(fix);
      }
    });

    it('fails when an item violates the registry item schema', () => {
      const fix = makeFixture();
      try {
        const broken = { ...makeItem(), version: undefined };
        writeDist(fix, [broken as never], fix.index);
        const result = validateDistRegistry({ distDir: fix.dist });
        expect(result.valid).toBe(false);
        expect(result.itemIssues.get('ui/button.json')?.length).toBeGreaterThan(0);
      } finally {
        cleanup(fix);
      }
    });

    it('fails when source leaks into the public distribution', () => {
      const fix = makeFixture();
      try {
        writeDist(fix, [{ ...makeItem(), source: '../../../packages/components/src/ui/button' } as unknown as DistItem], fix.index);
        const result = validateDistRegistry({ distDir: fix.dist });
        expect(result.valid).toBe(false);
        expect(result.itemIssues.get('ui/button.json')?.some((i) => i.message.includes('source'))).toBe(true);
      } finally {
        cleanup(fix);
      }
    });

    it('fails when a file is missing embedded content', () => {
      const fix = makeFixture();
      try {
        writeDist(fix, [makeItem({ files: [{ path: 'button.tsx', type: 'registry:ui' }] })], fix.index);
        const result = validateDistRegistry({ distDir: fix.dist });
        expect(result.valid).toBe(false);
        expect(result.itemIssues.get('ui/button.json')?.some((i) => i.message.includes('embedded content'))).toBe(true);
      } finally {
        cleanup(fix);
      }
    });

    it('rejects example/test/documentation files in the distribution', () => {
      const fix = makeFixture();
      try {
        const item = makeItem({
          files: [
            { path: 'button.tsx', type: 'registry:ui' as const, content: 'export const Button = 1;' },
            { path: 'button.example.tsx', type: 'example' as const, content: 'export const Example = () => null;' },
          ],
        });
        writeDist(fix, [item], fix.index);
        const result = validateDistRegistry({ distDir: fix.dist });
        expect(result.valid).toBe(false);
        expect(result.itemIssues.get('ui/button.json')?.some((i) => i.message.includes('development-only'))).toBe(true);
      } finally {
        cleanup(fix);
      }
    });

    it('rejects an unsupported registry type', () => {
      const fix = makeFixture();
      try {
        const item = makeItem({ type: 'registry:primitive' as never });
        const index: RegistryIndex = {
          $schema: 'https://xeyy.dev/schema/registry-index.json',
          name: 'test',
          items: [entryFor(item as RegistryItem)],
        };
        writeDist(fix, [item as never], index);
        const result = validateDistRegistry({ distDir: fix.dist });
        expect(result.valid).toBe(false);
      } finally {
        cleanup(fix);
      }
    });
  });

  describe('index ↔ payload consistency', () => {
    it('fails when fileCount does not match the payload', () => {
      const fix = makeFixture();
      try {
        const index: RegistryIndex = {
          $schema: 'https://xeyy.dev/schema/registry-index.json',
          name: 'test',
          items: [entryFor(fix.button, { fileCount: 2 })],
        };
        writeDist(fix, [fix.button], index);
        const result = validateDistRegistry({ distDir: fix.dist });
        expect(result.valid).toBe(false);
        expect(result.itemIssues.get('ui/button.json')?.some((i) => i.message.includes('fileCount'))).toBe(true);
      } finally {
        cleanup(fix);
      }
    });

    it('fails when index metadata does not match the payload', () => {
      const fix = makeFixture();
      try {
        const index: RegistryIndex = {
          $schema: 'https://xeyy.dev/schema/registry-index.json',
          name: 'test',
          items: [entryFor(fix.button, { name: 'other' })],
        };
        writeDist(fix, [fix.button], index);
        const result = validateDistRegistry({ distDir: fix.dist });
        expect(result.valid).toBe(false);
        expect(result.itemIssues.get('ui/button.json')?.some((i) => i.message.includes('index entry'))).toBe(true);
      } finally {
        cleanup(fix);
      }
    });

    it('fails when an indexed registry dependency is missing from the index', () => {
      const fix = makeFixture();
      try {
        const item = makeItem({ registryDependencies: ['ghost'] });
        writeDist(fix, [item], fix.index);
        const result = validateDistRegistry({ distDir: fix.dist });
        expect(result.valid).toBe(false);
        expect(result.consistencyIssues.some((i) => i.message.includes('ghost'))).toBe(true);
      } finally {
        cleanup(fix);
      }
    });

    it('fails a theme item that is missing its install target', () => {
      const fix = makeFixture();
      try {
        const theme = makeItem({
          name: 'default-theme',
          type: 'registry:theme',
          files: [{ path: 'theme.stylex.ts', type: 'registry:theme' as const, content: 'export const t = 1;' }],
        });
        const index: RegistryIndex = {
          $schema: 'https://xeyy.dev/schema/registry-index.json',
          name: 'test',
          items: [entryFor(theme)],
        };
        writeDist(fix, [theme], index);
        const result = validateDistRegistry({ distDir: fix.dist });
        expect(result.valid).toBe(false);
        expect(result.itemIssues.get('themes/default-theme.json')?.some((i) => i.message.includes('target'))).toBe(true);
      } finally {
        cleanup(fix);
      }
    });
  });
});