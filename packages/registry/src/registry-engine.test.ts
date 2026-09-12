import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdirSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { z } from 'zod';

import {
  validateCategories,
  suggestCategories,
  isSafeRegistryPath,
  safeResolve,
  discoverCandidates,
  generateDefinition,
  validateRegistryItem,
  validateFullRegistry,
  buildRegistry,
  ITEM_SCHEMA_URL,
  analyzeStatus,
  extractNpmDependencies,
  classifyImport,
  analyzeStylex,
  detectClientSignals,
  rewriteTokenImports,
  registryItemSchema,
  registryIndexSchema,
  registryRootSchema,
} from './index.ts';
import type { RegistryCandidate, ScannedFile } from './discovery.ts';

const TEST_ROOT = join(tmpdir(), 'xeyy-registry-test');

interface Repo {
  root: string;
  sourceDir: string;
  registryDir: string;
}

function makeRepo(): Repo {
  const root = join(TEST_ROOT, `repo-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const sourceDir = join(root, 'packages', 'components', 'src');
  const registryDir = join(root, 'registry');
  return { root, sourceDir, registryDir };
}

function cleanup(dir: string): void {
  if (existsSync(dir)) rmSync(dir, { recursive: true, force: true });
}

const BUTTON_SRC = `import * as React from 'react';
import * as stylex from '@stylexjs/stylex';
import { Button as BaseButton } from '@base-ui/react/button';
import { semantic } from '@xeyy/tokens/tokens.stylex';

const styles = stylex.create({
  base: {
    color: semantic.foreground,
    ':hover': { opacity: '0.9' },
  },
});

export const Button = React.forwardRef<HTMLButtonElement>(function Button(_props, ref) {
  return (
    <BaseButton ref={ref} {...stylex.props(styles.base)}>
      Button
    </BaseButton>
  );
});
`;

const BUTTON_EXAMPLE = `import { Button } from './button.tsx';

export function Example() {
  return <Button>Press me</Button>;
}
`;

const TOKENS_SRC = `import * as stylex from '@stylexjs/stylex';

export const semantic = stylex.defineVars({
  foreground: '#171717',
  background: '#ffffff',
});

export const dark = stylex.createTheme(semantic, {
  foreground: '#ffffff',
  background: '#171717',
});
`;

function writeButton(repo: Repo): void {
  const btn = join(repo.sourceDir, 'ui', 'button');
  mkdirSync(btn, { recursive: true });
  writeFileSync(join(btn, 'button.tsx'), BUTTON_SRC, 'utf8');
  writeFileSync(join(btn, 'button.example.tsx'), BUTTON_EXAMPLE, 'utf8');
}

function writeTokens(repo: Repo): void {
  const dir = join(repo.sourceDir, 'themes', 'default');
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'tokens.stylex.ts'), TOKENS_SRC, 'utf8');
}

/** Discover + register every candidate into a valid registry root. */
function registerAll(repo: Repo): void {
  const candidates = discoverCandidates({ sourceDir: repo.sourceDir, registryDir: repo.registryDir });
  const root = { name: 'Test Registry', version: '1.0.0', items: [] as string[] };
  for (const candidate of candidates) {
    if (candidate.empty) continue;
    const g = generateDefinition(candidate, { registryDir: repo.registryDir, candidates });
    mkdirSync(dirname(g.itemFilePath), { recursive: true });
    writeFileSync(g.itemFilePath, `${JSON.stringify(g.item, null, 2)}\n`, 'utf8');
    root.items.push(g.indexEntry);
  }
  writeFileSync(join(repo.registryDir, 'registry.json'), `${JSON.stringify({ ...root, items: root.items.sort() }, null, 2)}\n`, 'utf8');
}

describe('categories', () => {
  it('allows combinable behavior categories', () => {
    expect(validateCategories(['form', 'interactive', 'accessible']).valid).toBe(true);
  });

  it('rejects two functional categories at once', () => {
    expect(validateCategories(['form', 'data-display']).valid).toBe(false);
  });

  it('rejects unknown and duplicate categories', () => {
    expect(validateCategories(['bogus']).valid).toBe(false);
    expect(validateCategories(['form', 'form']).valid).toBe(false);
  });

  it('suggests overlay + client-only for dialog-like roles', () => {
    const suggested = suggestCategories({ name: 'dialog', baseUiComponents: ['dialog'] });
    expect(suggested).toContain('overlay');
    expect(suggested).toContain('client-only');
  });

  it('suggests interactive + accessible for a button', () => {
    const suggested = suggestCategories({ name: 'button', baseUiComponents: ['button'] });
    expect(suggested).toContain('interactive');
    expect(suggested).toContain('accessible');
    expect(suggested).not.toContain('overlay');
  });
});

describe('paths', () => {
  const base = 'C:/proj/registry/ui/button';
  const scope = 'C:/proj';

  it('accepts a safe relative path', () => {
    expect(isSafeRegistryPath('button.tsx', base, scope)).toBe(true);
  });

  it('rejects traversal escape', () => {
    expect(isSafeRegistryPath('../../../../escape.ts', base, scope)).toBe(false);
  });

  it('allows upward traversal that stays within scope', () => {
    expect(isSafeRegistryPath('../../../packages/components/src', base, scope)).toBe(true);
  });

  it('rejects absolute paths', () => {
    expect(isSafeRegistryPath('C:\\windows\\file.ts', base, scope)).toBe(false);
    expect(isSafeRegistryPath('/etc/passwd', base, scope)).toBe(false);
  });

  it('safeResolve returns undefined on escape', () => {
    expect(safeResolve(base, '../../escape.ts')).toBeUndefined();
    expect(safeResolve(base, 'button.tsx')).toBeDefined();
  });
});

describe('analysis', () => {
  const files: ScannedFile[] = [{ relativePath: 'button.tsx', kind: 'code' }];

  it('extracts npm deps, excluding peers and tokens', () => {
    const deps = extractNpmDependencies(
      files,
      () => `import * as React from 'react';\nimport * as stylex from '@stylexjs/stylex';\nimport { Button } from '@base-ui/react/button';\nimport { semantic } from '@xeyy/tokens/tokens.stylex';\nimport type { Foo } from 'typescript';`,
    );
    expect(deps).toEqual(['@base-ui/react', '@stylexjs/stylex'].sort());
  });

  it('classifies import kinds', () => {
    expect(classifyImport('./x').kind).toBe('local');
    expect(classifyImport('@/x').kind).toBe('alias');
    expect(classifyImport('@base-ui/react/button').packageName).toBe('@base-ui/react');
  });

  it('analyzes StyleX usage and conditions', () => {
    const result = analyzeStylex(BUTTON_SRC);
    expect(result.features).toEqual(['create']);
    expect(result.conditions).toContain('hover');
  });

  it('detects no module-level browser globals for a pure component', () => {
    const signals = detectClientSignals(BUTTON_SRC);
    expect(signals.moduleLevelBrowserGlobal).toBe(false);
  });

  it('rewrites @xeyy/tokens imports to a relative theme file', () => {
    const rewritten = rewriteTokenImports(
      `import { semantic } from '@xeyy/tokens/tokens.stylex';`,
      'C:/proj/src/components/ui/button',
      'C:/proj/src/styles/theme.stylex.ts',
    );
    expect(rewritten).toContain("from '../../../styles/theme.stylex'");
  });
});

describe('discovery', () => {
  it('discovers candidates across sections with theme naming rule', () => {
    const repo = makeRepo();
    writeButton(repo);
    writeTokens(repo);

    const candidates = discoverCandidates({ sourceDir: repo.sourceDir, registryDir: repo.registryDir });

    const button = candidates.find((c) => c.section === 'ui')!;
    expect(button.name).toBe('button');
    expect(button.registered).toBe(false);
    expect(button.empty).toBe(false);
    expect(button.files.some((f) => f.kind === 'code' && f.relativePath === 'button.tsx')).toBe(true);
    expect(button.files.some((f) => f.kind === 'example')).toBe(true);

    const theme = candidates.find((c) => c.section === 'themes')!;
    expect(theme.name).toBe('default-theme');

    cleanup(repo.root);
  });
});

describe('generate → validate → build → status (integration)', () => {
  let repo: Repo;
  beforeEach(() => {
    repo = makeRepo();
    writeButton(repo);
    writeTokens(repo);
    registerAll(repo);
  });
  afterEach(() => cleanup(repo.root));

  it('generates definition referencing canonical source (not mirroring content)', () => {
    const candidate = discoverCandidates({ sourceDir: repo.sourceDir, registryDir: repo.registryDir }).find(
      (c) => c.name === 'button',
    ) as RegistryCandidate;
    const g = generateDefinition(candidate, { registryDir: repo.registryDir, candidates: [candidate] });
    expect(g.item.source).toBe('../../../packages/components/src/ui/button');
    expect(g.item.files[0]!.content).toBeUndefined();
    expect(g.item.fingerprint?.['button.tsx']).toBeDefined();
  });

  it('generates complete metadata when provided', () => {
    const candidate = discoverCandidates({ sourceDir: repo.sourceDir, registryDir: repo.registryDir }).find(
      (c) => c.name === 'button',
    ) as RegistryCandidate;
    const g = generateDefinition(candidate, {
      registryDir: repo.registryDir,
      candidates: [candidate],
      title: 'Super Button',
      description: 'A super button.',
      categories: ['form', 'interactive'],
    });
    expect(g.item.title).toBe('Super Button');
    expect(g.item.description).toBe('A super button.');
    expect(g.item.categories).toEqual(['form', 'interactive']);
    expect(g.item.version).toBe('1.0.0');
  });

  it('validates a fully registered registry', () => {
    const root = JSON.parse(readFileSync(join(repo.registryDir, 'registry.json'), 'utf8')) as unknown;
    const result = validateFullRegistry(root, {
      contentRoot: repo.registryDir,
      scopeDir: repo.root,
    });
    expect(result.valid).toBe(true);
    expect(result.itemIssues.size).toBe(0);
  });

  it('rejects traversal in source paths', () => {
    const candidates = discoverCandidates({ sourceDir: repo.sourceDir, registryDir: repo.registryDir });
    const g = generateDefinition(candidates[0]!, { registryDir: repo.registryDir, candidates });
    const bad = { ...g.item, source: '../../../../escape-path' };
    const result = validateRegistryItem(bad, { baseDir: dirname(g.itemFilePath), scopeDir: repo.root });
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.path === 'source')).toBe(true);
  });

  it('builds the distribution payload with embedded content, omitting source', () => {
    // Source registry definitions retain `source`.
    const sourceDef = JSON.parse(readFileSync(join(repo.registryDir, 'ui', 'button', 'registry.json'), 'utf8')) as {
      source?: string;
    };
    expect(sourceDef.source).toMatch(/^\.\.\/\.\.\/\.\.\/packages\/components\/src\/ui\/button$/);

    const outputDir = join(repo.root, 'dist', 'registry');
    const result = buildRegistry({ registryDir: repo.registryDir, outputDir });

    expect(result.itemCount).toBe(2);
    expect(existsSync(join(outputDir, 'index.json'))).toBe(true);

    const button = JSON.parse(readFileSync(join(outputDir, 'ui', 'button.json'), 'utf8')) as Record<string, unknown> & {
      files: { path: string; type: string; content?: string }[];
      name: string;
      type: string;
      version: string;
      $schema: string;
    };
    // The built distribution never exposes internal source paths.
    expect(button).not.toHaveProperty('source');
    // Existing metadata is preserved.
    expect(button.name).toBe('button');
    expect(button.type).toBe('registry:ui');
    expect(button.version).toBe('1.0.0');
    expect(button.$schema).toBe(ITEM_SCHEMA_URL);
    expect(button.files.some((f) => f.path === 'button.tsx' && typeof f.content === 'string')).toBe(true);

    const codeFile = button.files.find((f) => f.path === 'button.tsx')!;
    expect(codeFile.content).toContain('@xeyy/tokens');
    expect(button.files.some((f) => f.type === 'example')).toBe(false);
    expect(button.files.some((f) => f.type === 'documentation')).toBe(false);

    const theme = JSON.parse(readFileSync(join(outputDir, 'themes', 'default-theme.json'), 'utf8')) as {
      files: { target?: string }[];
    };
    expect(theme.files.some((f) => f.target === 'theme.stylex.ts')).toBe(true);
  });

  it('omits source from built payloads for every registry item type', () => {
    const writeTypeSource = (section: string, name: string, content: string): void => {
      const dir = join(repo.sourceDir, section, name);
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, `${name}.tsx`), content, 'utf8');
    };
    writeTypeSource('components', 'data-grid', `export const DataGrid = () => null;\n`);
    writeTypeSource('blocks', 'login-form', `export function LoginForm() { return <form />; }\n`);
    writeTypeSource('internal', 'focus-ring', `export const FocusRing = () => null;\n`);

    const defPaths = [
      'ui/button',
      'components/data-grid',
      'blocks/login-form',
      'internal/focus-ring',
      'themes/default',
    ].map((p) => join(repo.registryDir, p, 'registry.json'));

    registerAll(repo);
    for (const defPath of defPaths) {
      const def = JSON.parse(readFileSync(defPath, 'utf8')) as { source?: unknown };
      expect(typeof def.source).toBe('string');
      expect(String(def.source)).toMatch(/^\.\.\//);
    }

    const outputDir = join(repo.root, 'dist', 'registry');
    const result = buildRegistry({ registryDir: repo.registryDir, outputDir });
    expect(result.itemCount).toBe(5);

    const expectedPayloads = [
      'ui/button.json',
      'themes/default-theme.json',
      'components/data-grid.json',
      'blocks/login-form.json',
      'internal/focus-ring.json',
    ];
    for (const rel of expectedPayloads) {
      const payload = JSON.parse(readFileSync(join(outputDir, rel), 'utf8')) as Record<string, unknown> & {
        files: { content?: unknown }[];
        type: string;
      };
      expect(payload, rel).not.toHaveProperty('source');
      expect(payload.type).toMatch(/^registry:/);
      expect(payload.files.length).toBeGreaterThan(0);
      for (const file of payload.files) expect(typeof file.content, rel).toBe('string');
    }
  });

  it('build exposes the public JSON Schemas in dist/schema', () => {
    const outputDir = join(repo.root, 'dist', 'registry');
    const result = buildRegistry({ registryDir: repo.registryDir, outputDir });

    expect(result.schemaDir).toBe(join(repo.root, 'dist', 'schema'));
    for (const id of ['registry.json', 'registry-item.json', 'registry-index.json']) {
      const file = join(result.schemaDir, id);
      expect(existsSync(file), file).toBe(true);
      const doc = JSON.parse(readFileSync(file, 'utf8')) as { $id?: string; title?: string };
      expect(doc.$id, id).toBe(`https://xeyy-registry.vercel.app/schema/${id}`);
      expect(typeof doc.title, id).toBe('string');
    }
  });

  it('build schemas are generated from the current zod definitions', () => {
    const outputDir = join(repo.root, 'dist', 'registry');
    buildRegistry({ registryDir: repo.registryDir, outputDir });

    const expected = `${JSON.stringify(
      {
        $schema: 'https://json-schema.org/draft/2020-12/schema',
        $id: 'https://xeyy-registry.vercel.app/schema/registry-item.json',
        title: 'Xeyy Registry Item',
        ...z.toJSONSchema(registryItemSchema),
      },
      null,
      2,
    )}\n`;
    expect(readFileSync(join(outputDir, '..', 'schema', 'registry-item.json'), 'utf8')).toBe(expected);

    const itemDoc = JSON.parse(expected) as {
      required: string[];
      properties: Record<string, unknown>;
    };
    // The public item schema remains the authoring contract: `source` is
    // required there (distribution payloads still omit it at build time).
    expect(itemDoc.required).toContain('source');
    expect(itemDoc.required).toContain('files');
  });

  it('reports unchanged status when definitions match source', () => {
    const report = analyzeStatus({ sourceDir: repo.sourceDir, registryDir: repo.registryDir, gitAvailable: false });
    expect(report.entries.every((e) => e.status === 'unchanged')).toBe(true);
  });

  it('reports modified after editing source', () => {
    writeFileSync(join(repo.sourceDir, 'ui', 'button', 'button.tsx'), BUTTON_SRC + '\n// extra\n', 'utf8');
    const report = analyzeStatus({ sourceDir: repo.sourceDir, registryDir: repo.registryDir, gitAvailable: false });
    const button = report.entries.find((e) => e.name === 'button')!;
    expect(button.status).toBe('modified');
    expect(button.changes.some((c) => c.startsWith('modified:'))).toBe(true);
  });

  it('reports unregistered for new source components', () => {
    const dir = join(repo.sourceDir, 'ui', 'tabs');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'tabs.tsx'), `export const Tabs = () => null;\n`, 'utf8');

    const report = analyzeStatus({ sourceDir: repo.sourceDir, registryDir: repo.registryDir, gitAvailable: false });
    expect(report.entries.some((e) => e.name === 'tabs' && e.status === 'unregistered')).toBe(true);
  });

  it('reports deleted when a registered source directory disappears', () => {
    rmSync(join(repo.sourceDir, 'ui', 'button'), { recursive: true, force: true });
    const report = analyzeStatus({ sourceDir: repo.sourceDir, registryDir: repo.registryDir, gitAvailable: false });
    const button = report.entries.find((e) => e.name === 'button');
    expect(button?.status).toBe('deleted');
    expect(button?.changes).toContain('source component directory missing');
  });

  it('does not report deleted when a definition source still exists', () => {
    rmSync(join(repo.sourceDir, 'ui', 'button'), { recursive: true, force: true });
    const report = analyzeStatus({ sourceDir: repo.sourceDir, registryDir: repo.registryDir, gitAvailable: false });
    const theme = report.entries.find((e) => e.name === 'default-theme');
    expect(theme?.status).toBe('unchanged');
  });
});

describe('validateRegistryItem', () => {
  it('rejects a missing source file', () => {
    const candidateLike = {
      name: 'widget',
      type: 'registry:ui',
      version: '1.0.0',
      source: '.',
      files: [{ path: 'missing.tsx', type: 'registry:ui' }],
    } as never;
    const result = validateRegistryItem(candidateLike, { baseDir: TEST_ROOT, scopeDir: TEST_ROOT });
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.path.startsWith('files[0]'))).toBe(true);
  });
});