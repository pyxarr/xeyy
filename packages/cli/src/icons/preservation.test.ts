import { describe, expect, it } from 'vitest';
import { rewriteIconImports } from './imports.ts';


describe('source preservation regressions', () => {
  it('preserves multiline imports, comments and alias trivia when all icons map', () => {
    const source = `import {\n  Check /* chosen */ as Tick,\n  Minus, // remove\n} from "lucide-react"\nexport const view = <Tick data-icon="inline-start" />;\n`;
    const result = rewriteIconImports(source, { from: 'lucide', to: 'tabler' });
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    expect(result.content).toBe(`import {\n  IconCheck /* chosen */ as Tick,\n  IconMinus as Minus, // remove\n} from "@tabler/icons-react"\nexport const view = <Tick data-icon="inline-start" />;\n`);
  });

  it('retains comments when splitting mixed mapped and unmapped imports', () => {
    const source = `import { Check, /* custom */ Sparkles } from 'lucide-react'; // trailing\nexport const view = <><Check /><Sparkles /></>;\n`;
    const result = rewriteIconImports(source, { from: 'lucide', to: 'tabler' });
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    expect(result.content).toContain('/* custom */');
    expect(result.content).toContain('// trailing');
    expect(result.content).toContain("import { Sparkles } from 'lucide-react';");
    expect(result.content).toContain('export const view = <><Check /><Sparkles /></>;');
    expect(rewriteIconImports(result.content, { from: 'lucide', to: 'tabler' })).toMatchObject({ status: 'ok', changed: false });
  });

  it('does not duplicate code preceding an import on the same line', () => {
    const source = `const value = 1; import { Check, Sparkles } from 'lucide-react';\n`;
    const result = rewriteIconImports(source, { from: 'lucide', to: 'tabler' });
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    expect(result.content.match(/const value/g)).toHaveLength(1);
    expect(result.unmapped).toEqual([{ library: 'lucide', name: 'Sparkles' }]);
  });
});
