import { describe, expect, it } from 'vitest';

import { getIconLibrary, iconLibraries, isIconPackageName } from './index.ts';
import { iconLibraryIds, type IconLibraryId } from './types.ts';

describe('iconLibraries', () => {
  it('covers every icon library id exactly once', () => {
    expect(Object.keys(iconLibraries).sort()).toEqual([...iconLibraryIds].sort());
  });

  it('has required metadata for every library', () => {
    for (const id of iconLibraryIds) {
      const library = iconLibraries[id];
      expect(library.id).toBe(id);
      expect(library.displayName.length).toBeGreaterThan(0);
      expect(library.packageName.length).toBeGreaterThan(0);
      expect(Array.isArray(library.additionalPackageNames)).toBe(true);
      expect(library.importConvention.length).toBeGreaterThan(0);
      expect(typeof library.installSupported).toBe('boolean');
      expect(typeof library.migrationSourceSupported).toBe('boolean');
      expect(typeof library.migrationTargetSupported).toBe('boolean');
    }
  });

  it('declares all packages each library requires', () => {
    expect(iconLibraries.hugeicons.additionalPackageNames).toEqual(['@hugeicons/core-free-icons']);
    for (const id of ['lucide', 'tabler', 'phosphor', 'remixicon'] as const) {
      expect(iconLibraries[id].additionalPackageNames).toEqual([]);
    }
  });

  it('marks only hugeicons as unsupported for migration', () => {
    for (const id of iconLibraryIds) {
      const library = iconLibraries[id];
      const migrationSupported = library.migrationSourceSupported || library.migrationTargetSupported;
      if (id === 'hugeicons') {
        expect(migrationSupported).toBe(false);
      } else {
        expect(migrationSupported).toBe(true);
      }
    }
  });

  it('uses the verified npm package names', () => {
    expect(iconLibraries.lucide.packageName).toBe('lucide-react');
    expect(iconLibraries.tabler.packageName).toBe('@tabler/icons-react');
    expect(iconLibraries.hugeicons.packageName).toBe('@hugeicons/react');
    expect(iconLibraries.phosphor.packageName).toBe('@phosphor-icons/react');
    expect(iconLibraries.remixicon.packageName).toBe('@remixicon/react');
  });
});

describe('getIconLibrary', () => {
  it('returns the metadata for a known id', () => {
    expect(getIconLibrary('lucide')).toEqual(iconLibraries.lucide);
    expect(getIconLibrary('remixicon').displayName).toBe('Remix Icon');
  });
});

describe('isIconPackageName', () => {
  it.each([
    ['lucide-react', 'lucide'],
    ['@tabler/icons-react', 'tabler'],
    ['@hugeicons/react', 'hugeicons'],
    ['@phosphor-icons/react', 'phosphor'],
    ['@remixicon/react', 'remixicon'],
  ] as const satisfies readonly [string, IconLibraryId][])('%s -> %s', (packageName, expected) => {
    expect(isIconPackageName(packageName)).toBe(expected);
  });

  it('recognizes multi-package HugeIcons imports', () => {
    expect(isIconPackageName('@hugeicons/core-free-icons')).toBe('hugeicons');
  });

  it('matches subpath imports against the root package name', () => {
    expect(isIconPackageName('@phosphor-icons/react/dist/ssr')).toBe('phosphor');
    expect(isIconPackageName('@tabler/icons-react/dist/icons.mjs')).toBe('tabler');
    expect(isIconPackageName('lucide-react/dist/esm/icons/check')).toBe('lucide');
  });

  it('returns undefined for unrelated packages', () => {
    expect(isIconPackageName('react')).toBeUndefined();
    expect(isIconPackageName('zod')).toBeUndefined();
    expect(isIconPackageName('@xeyy/icons')).toBeUndefined();
  });
});
