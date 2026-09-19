import { describe, expect, it } from 'vitest';

import type { RegistryItem } from '@xeyy/registry';
import type { StagedFile } from '../../registry/install.ts';
import { adoptIconLibrary } from './dependencies.ts';

function staged(item: string, file: string, content: string): StagedFile {
  return { item, itemType: 'registry:ui', sourcePath: file, target: `/project/src/components/ui/${file}`, content };
}

describe('adoptIconLibrary', () => {
  it('leaves source untouched when the configured library matches', () => {
    const result = adoptIconLibrary([staged('widget', 'widget.tsx', `import { Check } from 'lucide-react';\n`)], 'lucide');
    expect(result.mapped).toEqual([]);
    expect(result.dependencies).toEqual(['lucide-react']);
    expect(result.files[0]?.content).toBe(`import { Check } from 'lucide-react';\n`);
  });

  it('maps icons to the configured library and swaps the dependency', () => {
    const result = adoptIconLibrary(
      [
        staged(
          'widget',
          'widget.tsx',
          `import { Check, ChevronDown } from 'lucide-react';\n\nexport const a = <Check />; export const b = <ChevronDown />;\n`,
        ),
      ],
      'tabler',
    );
    expect(result.mapped).toHaveLength(2);
    expect(result.dependencies).toEqual(['@tabler/icons-react']);
    expect(result.files[0]?.content).toBe(
      `import { IconCheck as Check, IconChevronDown as ChevronDown } from '@tabler/icons-react';\n\nexport const a = <Check />; export const b = <ChevronDown />;\n`,
    );
  });

  it('installs both packages when some icons are unmapped', () => {
    const result = adoptIconLibrary(
      [staged('widget', 'widget.tsx', `import { Check, Sparkles } from 'lucide-react';\n`)],
      'tabler',
    );
    expect(result.unmapped).toEqual([{ item: 'widget', file: '/project/src/components/ui/widget.tsx', library: 'lucide', name: 'Sparkles' }]);
    expect(result.dependencies.sort()).toEqual(['@tabler/icons-react', 'lucide-react']);
  });

  it('leaves items using an unsupported library untouched and reports them', () => {
    const content = `import { HugeiconsIcon } from '@hugeicons/react';\n`;
    const result = adoptIconLibrary([staged('huge', 'huge.tsx', content)], 'tabler');
    expect(result.unsupported).toEqual([{ item: 'huge', file: '/project/src/components/ui/huge.tsx', library: 'hugeicons' }]);
    // HugeIcons needs its icon data package too; both must be installed.
    expect(result.dependencies.sort()).toEqual(['@hugeicons/core-free-icons', '@hugeicons/react']);
    expect(result.files[0]?.content).toBe(content);
  });

  it('does not adopt files whose only icon import is target-only', () => {
    const content = `import { Check } from '@tabler/icons-react';\n`;
    const result = adoptIconLibrary([staged('widget', 'widget.tsx', content)], 'tabler');
    expect(result.mapped).toEqual([]);
    expect(result.dependencies).toEqual(['@tabler/icons-react']);
  });

  it('records unparseable files as failures and leaves them untouched', () => {
    const content = `import { Check } from 'lucide-react';\nconst x: = ;\n`;
    const result = adoptIconLibrary([staged('widget', 'widget.tsx', content)], 'tabler');
    expect(result.failures).toHaveLength(1);
    expect(result.files[0]?.content).toBe(content);
    expect(result.dependencies).toEqual([]);
  });

  it('retains declared icon dependencies when a file cannot be parsed', () => {
    const bad = staged('broken', 'bad.tsx', `import { Check } from 'lucide-react';\nconst x: = ;\n`);
    const item = (name: string): RegistryItem => ({
      name,
      type: 'registry:ui',
      version: '1.0.0',
      source: '.',
      files: [],
      dependencies: ['lucide-react'],
    });
    const result = adoptIconLibrary([bad], 'lucide', [item('broken')]);
    expect(result.failures).toHaveLength(1);
    expect(result.files[0]?.content).toBe(bad.content);
    expect(result.dependencies).toEqual([]);
    expect(result.retainedDependencies).toEqual(['lucide-react']);
  });

  it('keeps type-only imports installed for the consumer typecheck', () => {
    const content = `import type { LucideIcon } from 'lucide-react';\n`;
    const result = adoptIconLibrary([staged('widget', 'widget.tsx', content)], 'tabler');
    expect(result.dependencies).toEqual(['lucide-react']);
    expect(result.skipped).toEqual([
      { item: 'widget', file: '/project/src/components/ui/widget.tsx', spec: 'lucide-react', reason: 'type-only' },
    ]);
  });

  it('installs the full package set for hugeicons', () => {
    const content = `import { Add01Icon } from '@hugeicons/core-free-icons';\n`;
    const result = adoptIconLibrary([staged('huge', 'huge.tsx', content)], 'lucide');
    expect(result.dependencies.sort()).toEqual(['@hugeicons/core-free-icons', '@hugeicons/react']);
    expect(result.unsupported).toEqual([
      { item: 'huge', file: '/project/src/components/ui/huge.tsx', library: 'hugeicons' },
    ]);
  });
});
