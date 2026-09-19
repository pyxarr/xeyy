import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { applyIconMigration, scanProjectIconMigration, summarizeIconMigration } from './migration.ts';

const LUCIDE = `import { Check, Sparkles } from 'lucide-react';

export function ok() {
  return <Check />;
}
`;

const UNMAPPED = `import { Sparkles } from 'lucide-react';
export const x = () => null;
`;

const PHOSPHOR = `import { Check } from '@phosphor-icons/react';
export const x = () => null;
`;

const BROKEN = `import { Check } from 'lucide-react';
const = ;
`;

describe('scanProjectIconMigration', () => {
  let root: string;
  const ui = (): string => join(root, 'src', 'components', 'ui');

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'xeyy-migrate-'));
    mkdirSync(ui(), { recursive: true });
  });
  afterEach(() => rmSync(root, { recursive: true, force: true }));

  function write(name: string, content: string): void {
    writeFileSync(join(ui(), name), content, 'utf8');
  }

  it('plans rewrites only for files importing the source library', () => {
    write('a.tsx', LUCIDE);
    write('b.tsx', PHOSPHOR);
    write('c.tsx', `import { Card } from './card.tsx';\n`);
    write('broken.tsx', BROKEN);

    const scan = scanProjectIconMigration({ searchDir: ui(), from: 'lucide', to: 'tabler' });
    expect(scan.scanned).toBe(4);
    expect(scan.candidates).toBe(2);
    expect(scan.edits.map((edit) => edit.relativePath)).toEqual(['a.tsx']);
    expect(scan.otherLibraries.map((entry) => entry.library)).toEqual(['phosphor']);
    expect(scan.failures.map((failure) => failure.relativePath)).toEqual(['broken.tsx']);
  });

  it('preserves unmapped icons and does not write them', () => {
    write('unmapped.tsx', UNMAPPED);
    const scan = scanProjectIconMigration({ searchDir: ui(), from: 'lucide', to: 'tabler' });
    expect(scan.edits[0]?.changed).toBe(false);
    expect(scan.edits[0]?.unmapped).toEqual([{ library: 'lucide', name: 'Sparkles' }]);
    expect(applyIconMigration(scan)).toEqual([]);
  });

      it('summarizes mapped icons and other libraries', () => {
    write('a.tsx', LUCIDE);
    write('b.tsx', PHOSPHOR);
    const scan = scanProjectIconMigration({ searchDir: ui(), from: 'lucide', to: 'tabler' });
    const summary = summarizeIconMigration(scan);
    // Sparkles is not in the verified tabler table, so it is unmapped — not mapped.
    expect(summary.unmapped).toEqual([{ library: 'lucide', name: 'Sparkles', files: ['a.tsx'] }]);
    expect(summary.mapped).toEqual([{ from: 'Check', to: 'IconCheck', localName: 'Check' }]);
    expect(summary.otherLibraries).toEqual([{ library: 'phosphor', files: ['b.tsx'] }]);
  });

  it('applies rewrites to disk', () => {
    write('a.tsx', LUCIDE);
    const scan = scanProjectIconMigration({ searchDir: ui(), from: 'lucide', to: 'tabler' });
    const written = applyIconMigration(scan);
    expect(written).toEqual([join(ui(), 'a.tsx')]);
    expect(readFileSync(join(ui(), 'a.tsx'), 'utf8')).toBe(
      `import { IconCheck as Check } from '@tabler/icons-react';\nimport { Sparkles } from 'lucide-react';\n\nexport function ok() {\n  return <Check />;\n}\n`,
    );
  });
});

