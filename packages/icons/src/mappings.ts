import type { IconLibraryId } from './types.ts';
import { phosphorIconNames } from './mappings/phosphor.ts';
import { remixIconNames } from './mappings/remixicon.ts';
import { tablerIconNames } from './mappings/tabler.ts';

/**
 * Canonical lucide name -> exact export name in the target library.
 * Lucide is the pivot: lucide export names ARE the canonical names, so it has
 * no table (identity). HugeIcons has no verified mappings at all.
 */
const targetTables: Partial<Record<IconLibraryId, Record<string, string>>> = {
  tabler: tablerIconNames,
  phosphor: phosphorIconNames,
  remixicon: remixIconNames,
};

/** Canonical lucide name -> exact export name in the target library, or null when no verified equivalent exists. */
export function canonicalToTargetName(target: IconLibraryId, canonicalName: string): string | null {
  if (target === 'lucide') return canonicalName;
  const table = targetTables[target];
  if (!table) return null;
  return table[canonicalName] ?? null;
}

/** Exact export name in the source library -> canonical lucide name, or null when unknown. */
export function targetToCanonicalName(source: IconLibraryId, exportName: string): string | null {
  if (source === 'lucide') return exportName;
  const table = targetTables[source];
  if (!table) return null;
  for (const [canonicalName, targetName] of Object.entries(table)) {
    if (targetName === exportName) return canonicalName;
  }
  return null;
}

/** Map an icon name from one library to another via the lucide pivot; null when no verified equivalent exists. */
export function mapIconName(from: IconLibraryId, to: IconLibraryId, name: string): string | null {
  const canonicalName = targetToCanonicalName(from, name);
  if (canonicalName === null) return null;
  return canonicalToTargetName(to, canonicalName);
}
