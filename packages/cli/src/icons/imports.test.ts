import { describe, expect, it } from 'vitest';

import { canMigrateIconLibraries, parseIconImports, rewriteIconImports } from './imports.ts';

const COMPONENT = `import { Check, Sparkles } from 'lucide-react';

export function Status() {
  return (
    <>
      <Check />
      <Sparkles />
    </>
  );
}
`;

describe('parseIconImports', () => {
  it('lists icon library statements with their bindings', () => {
    const result = parseIconImports(
      `import { Check, Minus as Remove } from 'lucide-react';\nimport { Button } from './button.tsx';\n`,
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toEqual([
      {
        library: 'lucide',
        spec: 'lucide-react',
        bindings: [
          { exportedName: 'Check', localName: 'Check' },
          { exportedName: 'Minus', localName: 'Remove' },
        ],
        opaque: false,
      },
    ]);
  });

  it('flags namespace and default imports as opaque', () => {
    const result = parseIconImports(
      `import * as Icons from '@tabler/icons-react';\nimport Default, { Check } from 'lucide-react';\n`,
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.map((statement) => statement.opaque)).toEqual([true, true]);
    expect(result.value[1]?.bindings).toEqual([{ exportedName: 'Check', localName: 'Check' }]);
  });

  it('ignores type-only icon imports and non-icon packages', () => {
    const result = parseIconImports(`import type { LucideIcon } from 'lucide-react';\nimport { z } from 'zod';\n`);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toEqual([]);
  });

  it('reports unparseable source instead of guessing', () => {
    const result = parseIconImports(`import { Check } from 'lucide-react';\nconst = ;\n`);
    expect(result.ok).toBe(false);
  });
});

describe('canMigrateIconLibraries', () => {
  it('allows verified pairs and refuses hugeicons and identity', () => {
    expect(canMigrateIconLibraries('lucide', 'tabler')).toBe(true);
    expect(canMigrateIconLibraries('tabler', 'lucide')).toBe(true);
    expect(canMigrateIconLibraries('lucide', 'hugeicons')).toBe(false);
    expect(canMigrateIconLibraries('hugeicons', 'lucide')).toBe(false);
    expect(canMigrateIconLibraries('lucide', 'lucide')).toBe(false);
  });
});

describe('rewriteIconImports', () => {
  it('rewrites mapped icons and leaves unmapped icons on the source package', () => {
    const result = rewriteIconImports(COMPONENT, { from: 'lucide', to: 'tabler' });
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;

    expect(result.changed).toBe(true);
    expect(result.content).toBe(`import { IconCheck as Check } from '@tabler/icons-react';
import { Sparkles } from 'lucide-react';

export function Status() {
  return (
    <>
      <Check />
      <Sparkles />
    </>
  );
}
`);
    expect(result.mapped).toEqual([{ library: 'lucide', from: 'Check', to: 'IconCheck', localName: 'Check' }]);
    expect(result.unmapped).toEqual([{ library: 'lucide', name: 'Sparkles' }]);
  });

  it('preserves aliases and JSX usage', () => {
    const result = rewriteIconImports(`import { Check as Tick } from "lucide-react";\n\nexport const ok = <Tick />;\n`, {
      from: 'lucide',
      to: 'tabler',
    });
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    expect(result.content).toBe(`import { IconCheck as Tick } from "@tabler/icons-react";\n\nexport const ok = <Tick />;\n`);
    expect(result.mapped).toEqual([{ library: 'lucide', from: 'Check', to: 'IconCheck', localName: 'Tick' }]);
  });

  it('maps renamed exports back to lucide names', () => {
    const result = rewriteIconImports(`import { IconCheck, IconX } from '@tabler/icons-react';\n`, {
      from: 'tabler',
      to: 'lucide',
    });
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    expect(result.content).toBe(`import { Check as IconCheck, X as IconX } from 'lucide-react';\n`);
  });

  it('reports re-exports without touching source', () => {
    const source = `export { Check } from 'lucide-react';\n\nexport const ok = true;\n`;
    const result = rewriteIconImports(source, { from: 'lucide', to: 'tabler' });
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    expect(result.changed).toBe(false);
    expect(result.content).toBe(source);
    expect(result.skipped).toEqual([{ spec: 'lucide-react', reason: 're-export' }]);
  });

  it('reports dynamic imports without touching source', () => {
    const source = `export async function load() {\n  const { Check } = await import('lucide-react');\n  return Check;\n}\n`;
    const result = rewriteIconImports(source, { from: 'lucide', to: 'tabler' });
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    expect(result.changed).toBe(false);
    expect(result.content).toBe(source);
    expect(result.skipped).toEqual([{ spec: 'lucide-react', reason: 'dynamic' }]);
  });

  it('keeps local names when the target export matches', () => {
    const result = rewriteIconImports(`import { Check } from 'lucide-react';\n`, { from: 'lucide', to: 'phosphor' });
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    expect(result.content).toBe(`import { Check } from '@phosphor-icons/react';\n`);
    expect(result.mapped).toEqual([{ library: 'lucide', from: 'Check', to: 'Check', localName: 'Check' }]);
  });

  it('rewrites subpath specifiers to the target package', () => {
    const result = rewriteIconImports(`import { Check } from 'lucide-react/dist/esm/icons/check';\n`, {
      from: 'lucide',
      to: 'tabler',
    });
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    expect(result.content).toBe(`import { IconCheck as Check } from '@tabler/icons-react';\n`);
  });

  it('leaves the file untouched when no icon maps', () => {
    const source = `import { Sparkles, Wand } from 'lucide-react';\n`;
    const result = rewriteIconImports(source, { from: 'lucide', to: 'tabler' });
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    expect(result.changed).toBe(false);
    expect(result.content).toBe(source);
    expect(result.unmapped).toEqual([
      { library: 'lucide', name: 'Sparkles' },
      { library: 'lucide', name: 'Wand' },
    ]);
  });

  it('skips type-only, namespace and default imports', () => {
    const typeOnly = rewriteIconImports(`import type { LucideIcon } from 'lucide-react';\n`, {
      from: 'lucide',
      to: 'tabler',
    });
    expect(typeOnly.status === 'ok' && typeOnly.changed).toBe(false);
    expect(typeOnly.status === 'ok' ? typeOnly.skipped : []).toEqual([{ spec: 'lucide-react', reason: 'type-only' }]);

    const namespace = rewriteIconImports(`import * as Icons from 'lucide-react';\n`, { from: 'lucide', to: 'tabler' });
    expect(namespace.status === 'ok' && namespace.changed).toBe(false);
    expect(namespace.status === 'ok' ? namespace.skipped : []).toEqual([{ spec: 'lucide-react', reason: 'namespace' }]);

    const fallback = rewriteIconImports(`import Icons from 'lucide-react';\n`, { from: 'lucide', to: 'tabler' });
    expect(fallback.status === 'ok' ? fallback.skipped : []).toEqual([{ spec: 'lucide-react', reason: 'default' }]);
  });

  it('keeps inline type specifiers on the source package', () => {
    const result = rewriteIconImports(
      `import { type LucideIcon, Check } from 'lucide-react';\n\nexport const icon: LucideIcon = Check;\n`,
      { from: 'lucide', to: 'tabler' },
    );
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    expect(result.content).toBe(`import { IconCheck as Check } from '@tabler/icons-react';
import { type LucideIcon } from 'lucide-react';

export const icon: LucideIcon = Check;
`);
  });

  it('preserves CRLF line endings', () => {
    const result = rewriteIconImports(
      `import { Check, Sparkles } from 'lucide-react';\r\n\r\nexport const a = 1;\r\n`,
      { from: 'lucide', to: 'tabler' },
    );
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    expect(result.content).toBe(
      `import { IconCheck as Check } from '@tabler/icons-react';\r\n` +
        `import { Sparkles } from 'lucide-react';\r\n\r\nexport const a = 1;\r\n`,
    );
  });

  it('never corrupts an unparseable file', () => {
    const source = `import { Check } from 'lucide-react';\nconst = ;\n`;
    const result = rewriteIconImports(source, { from: 'lucide', to: 'tabler' });
    expect(result.status).toBe('unparseable');
    expect(result.status !== 'ok' ? result.message.length > 0 : false).toBe(true);
  });

  it('is a no-op for the same library', () => {
    const result = rewriteIconImports(COMPONENT, { from: 'lucide', to: 'lucide' });
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    expect(result.changed).toBe(false);
    expect(result.content).toBe(COMPONENT);
  });

  it('ignores files without icon imports', () => {
    const source = `import { Button } from './button.tsx';\n\nexport const a = <Button />;\n`;
    const result = rewriteIconImports(source, { from: 'lucide', to: 'tabler' });
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    expect(result.changed).toBe(false);
    expect(result.content).toBe(source);
  });
});
