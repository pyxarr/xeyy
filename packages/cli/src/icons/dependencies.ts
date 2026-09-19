import { getIconLibrary, isIconPackageName, type IconLibraryId } from '@xeyy/icons';
import { rootPackage, type RegistryItem } from '@xeyy/registry';
import type { StagedFile } from '../registry/install.ts';
import {
  canMigrateIconLibraries,
  extractDynamicImportSpecs,
  parseIconImports,
  rewriteIconImports,
  type SkippedIconImportReason,
} from './imports.ts';

/** Icons rewritten to the project's configured library. */
export interface AdoptedIcon {
  item: string;
  file: string;
  library: IconLibraryId;
  from: string;
  to: string;
  localName: string;
}

/** Icons without a verified mapping, left on their original package. */
export interface PreservedIcon {
  item: string;
  file: string;
  library: IconLibraryId;
  name: string;
}

export interface AdoptedImportSkip {
  item: string;
  file: string;
  spec: string;
  reason: SkippedIconImportReason;
}

export interface IconAdoptionFailure {
  item: string;
  file: string;
  message: string;
}

export interface IconAdoption {
  /** Staged files with source adapted to the configured icon library. */
  files: StagedFile[];
  /** Icon packages the adapted source imports, deduplicated and sorted. */
  dependencies: string[];
  /**
   * Icon packages declared by items whose source could not be analyzed. They are
   * installed in addition to `dependencies` so nothing required is dropped.
   */
  retainedDependencies: string[];
  mapped: AdoptedIcon[];
  unmapped: PreservedIcon[];
  skipped: AdoptedImportSkip[];
  /** Files left untouched because they could not be parsed or rewritten safely. */
  failures: IconAdoptionFailure[];
  /** Source libraries that cannot be migrated into the configured library. */
  unsupported: { item: string; file: string; library: IconLibraryId }[];
}

/**
 * Every npm package needed to consume an icon-library module specifier: the
 * library's primary package, its additional packages (e.g. HugeIcons ships its
 * icon data separately) and the imported package itself (subpath imports).
 */
export function packagesRequiredBySpec(spec: string): string[] {
  const library = isIconPackageName(spec);
  if (!library) return [];
  const metadata = getIconLibrary(library);
  return [...new Set([metadata.packageName, ...metadata.additionalPackageNames, rootPackage(spec)])];
}

/**
 * Adapt staged component source to the project's configured icon library and
 * report which icon packages the installed source actually imports.
 *
 * Icons without a verified mapping keep their original import untouched. When a
 * file cannot be parsed, the items' own declared icon dependencies are retained
 * rather than dropped — a dependency is never silently removed.
 */
export function adoptIconLibrary(
  files: StagedFile[],
  targetLibrary: IconLibraryId,
  items: RegistryItem[] = [],
): IconAdoption {
  const adoption: IconAdoption = {
    files: [],
    dependencies: [],
    retainedDependencies: [],
    mapped: [],
    unmapped: [],
    skipped: [],
    failures: [],
    unsupported: [],
  };

  const unanalyzableItems = new Set<string>();

  for (const file of files) {
    const initial = parseIconImports(file.content, { includeTypeOnly: true });
    if (!initial.ok) {
      adoption.failures.push({ item: file.item, file: file.target, message: initial.message });
      adoption.files.push(file);
      unanalyzableItems.add(file.item);
      continue;
    }

    let content = file.content;
    const libraries = [
      ...new Set(initial.value.map((statement) => statement.library).filter((library) => library !== targetLibrary)),
    ];

    for (const library of libraries) {
      if (!canMigrateIconLibraries(library, targetLibrary)) {
        adoption.unsupported.push({ item: file.item, file: file.target, library });
        continue;
      }
      const rewrite = rewriteIconImports(content, { from: library, to: targetLibrary });
      if (rewrite.status !== 'ok') {
        adoption.failures.push({ item: file.item, file: file.target, message: rewrite.message });
        unanalyzableItems.add(file.item);
        continue;
      }
      content = rewrite.content;
      for (const icon of rewrite.mapped) adoption.mapped.push({ item: file.item, file: file.target, ...icon });
      for (const icon of rewrite.unmapped) adoption.unmapped.push({ item: file.item, file: file.target, ...icon });
      for (const skip of rewrite.skipped) adoption.skipped.push({ item: file.item, file: file.target, ...skip });
    }

    adoption.files.push(content === file.content ? file : { ...file, content });
  }

  const dependencies = new Set<string>();
  for (const file of adoption.files) {
    // Type-only imports are included: the consumer's typecheck still needs them.
    const parsed = parseIconImports(file.content, { includeTypeOnly: true });
    if (!parsed.ok) {
      // Already reported in the pass above; never drop its declared packages.
      unanalyzableItems.add(file.item);
      continue;
    }
    for (const statement of parsed.value) {
      for (const name of packagesRequiredBySpec(statement.spec)) dependencies.add(name);
    }
    const dynamicSpecs = extractDynamicImportSpecs(file.content);
    if (dynamicSpecs.ok) {
      for (const spec of dynamicSpecs.value) {
        for (const name of packagesRequiredBySpec(spec)) dependencies.add(name);
      }
    }
  }

  // Retain declared icon dependencies for anything we could not analyze.
  const retained = new Set<string>();
  for (const item of items) {
    if (!unanalyzableItems.has(item.name)) continue;
    for (const dependency of item.dependencies ?? []) {
      if (isIconPackageName(dependency) && !dependencies.has(dependency)) retained.add(dependency);
    }
  }

  adoption.dependencies = [...dependencies].sort();
  adoption.retainedDependencies = [...retained].sort();
  return adoption;
}
