import { describe, expect, it } from 'vitest';

import {
  canonicalToTargetName,
  mapIconName,
  phosphorIconNames,
  remixIconNames,
  tablerIconNames,
  targetToCanonicalName,
} from './index.ts';

describe('canonicalToTargetName', () => {
  it('is identity for lucide', () => {
    expect(canonicalToTargetName('lucide', 'Check')).toBe('Check');
    expect(canonicalToTargetName('lucide', 'ChevronDown')).toBe('ChevronDown');
  });

  it('maps canonical lucide names to tabler exports', () => {
    expect(canonicalToTargetName('tabler', 'ChevronDown')).toBe('IconChevronDown');
  });

  it('maps canonical lucide names to remixicon exports', () => {
    expect(canonicalToTargetName('remixicon', 'Check')).toBe('RiCheckLine');
  });

  it('returns null for hugeicons and unknown names', () => {
    expect(canonicalToTargetName('hugeicons', 'Check')).toBeNull();
    expect(canonicalToTargetName('tabler', 'NotARealIcon')).toBeNull();
  });
});

describe('targetToCanonicalName', () => {
  it('is identity for lucide', () => {
    expect(targetToCanonicalName('lucide', 'Check')).toBe('Check');
  });

  it('maps tabler exports back to canonical lucide names', () => {
    expect(targetToCanonicalName('tabler', 'IconCheck')).toBe('Check');
  });

  it('maps remixicon exports back to canonical lucide names', () => {
    expect(targetToCanonicalName('remixicon', 'RiCheckLine')).toBe('Check');
  });

  it('returns null for hugeicons and unknown exports', () => {
    expect(targetToCanonicalName('hugeicons', 'Check')).toBeNull();
    expect(targetToCanonicalName('phosphor', 'NotARealIcon')).toBeNull();
  });
});

describe('mapIconName', () => {
  it('is identity within lucide', () => {
    expect(mapIconName('lucide', 'lucide', 'Check')).toBe('Check');
  });

  it('maps lucide to tabler', () => {
    expect(mapIconName('lucide', 'tabler', 'ChevronDown')).toBe('IconChevronDown');
  });

  it('maps tabler to lucide', () => {
    expect(mapIconName('tabler', 'lucide', 'IconCheck')).toBe('Check');
  });

  it('maps remixicon seeds correctly', () => {
    expect(mapIconName('lucide', 'remixicon', 'Check')).toBe('RiCheckLine');
    expect(mapIconName('remixicon', 'lucide', 'RiCheckLine')).toBe('Check');
  });

  it('returns null for hugeicons in either direction', () => {
    expect(mapIconName('lucide', 'hugeicons', 'Check')).toBeNull();
    expect(mapIconName('hugeicons', 'lucide', 'Anything')).toBeNull();
    expect(mapIconName('hugeicons', 'tabler', 'Anything')).toBeNull();
  });

  it('returns null for unknown names', () => {
    expect(mapIconName('lucide', 'tabler', 'NotARealIcon')).toBeNull();
    expect(mapIconName('tabler', 'phosphor', 'NotARealIcon')).toBeNull();
  });

  it('round-trips every seeded tabler entry', () => {
    for (const [canonicalName, exportName] of Object.entries(tablerIconNames)) {
      expect(mapIconName('lucide', 'tabler', canonicalName)).toBe(exportName);
      expect(mapIconName('tabler', 'lucide', exportName)).toBe(canonicalName);
    }
  });

  it('round-trips every phosphor entry', () => {
    for (const [canonicalName, exportName] of Object.entries(phosphorIconNames)) {
      expect(mapIconName('lucide', 'phosphor', canonicalName)).toBe(exportName);
      expect(mapIconName('phosphor', 'lucide', exportName)).toBe(canonicalName);
    }
  });

  it('round-trips every remixicon entry', () => {
    for (const [canonicalName, exportName] of Object.entries(remixIconNames)) {
      expect(mapIconName('lucide', 'remixicon', canonicalName)).toBe(exportName);
      expect(mapIconName('remixicon', 'lucide', exportName)).toBe(canonicalName);
    }
  });
});
