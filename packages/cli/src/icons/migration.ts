import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { getIconLibrary, iconLibraryIds, type IconLibraryId } from '@xeyy/icons';
import {
  canMigrateIconLibraries,
  rewriteIconImports,
  type MappedIcon,
  type SkippedIconImportReason,
  type UnmappedIcon,
} from './imports.ts';

const SOURCE_EXTENSIONS = ['.ts', '.tsx'];
const IGNORED_DIRS = new Set(['node_modules', 'dist', 'build', 'coverage']);

/** One source file that needs attention. */
export interface IconMigrationEdit {
  /** Absolute path. */
  path: string;
  /** Search-directory-relative posix path, for reporting. */
  relativePath: string;
  /** Rewritten source (identical to the file on disk when nothing was mapped). */
  content: string;
  /** False when only unmapped icons were found; such files are not written. */
  changed: boolean;
  mapped: MappedIcon[];
  unmapped: UnmappedIcon[];
  skipped: { spec: string; reason: SkippedIconImportReason }[];
}

export interface IconMigrationFailure {
  relativePath: string;
  message: string;
}

export interface IconMigrationScan {
  from: IconLibraryId;
  to: IconLibraryId;
  /** Files scanned under the search directory. */
  scanned: number;
  /** Files importing the source library. */
  candidates: number;
  /** Files to rewrite, sorted by path. */
  edits: IconMigrationEdit[];
  /** Files left untouched because they could not be parsed or rewritten safely. */
  failures: IconMigrationFailure[];
  /** Files importing some other icon library (out of scope for this run). */
  otherLibraries: { relativePath: string; library: IconLibraryId }[];
}

export interface IconMigrationSummary {
  mapped: { from: string; to: string; localName: string }[];
  unmapped: { library: IconLibraryId; name: string; files: string[] }[];
  skipped: { spec: string; reason: SkippedIconImportReason; files: string[] }[];
  otherLibraries: { library: IconLibraryId; files: string[] }[];
}

function toPosix(path: string): string {
  return path.split('\\').join('/');
}

function* walkSourceFiles(dir: string): Generator<string> {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) continue;
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name.startsWith('.') || IGNORED_DIRS.has(entry.name)) continue;
      yield* walkSourceFiles(fullPath);
      continue;
    }
    if (SOURCE_EXTENSIONS.some((extension) => entry.name.endsWith(extension))) yield fullPath;
  }
}

/**
 * Find every file under `searchDir` that imports the `from` icon library and
 * compute its rewrite into the `to` package. Nothing is written: the returned
 * scan is a reviewable plan.
 */
export function scanProjectIconMigration(options: {
  searchDir: string;
  from: IconLibraryId;
  to: IconLibraryId;
}): IconMigrationScan {
  const { searchDir, from, to } = options;
  const sourcePackage = getIconLibrary(from).packageName;
  const scan: IconMigrationScan = {
    from,
    to,
    scanned: 0,
    candidates: 0,
    edits: [],
    failures: [],
    otherLibraries: [],
  };

  for (const filePath of walkSourceFiles(searchDir)) {
    const content = readFileSync(filePath, 'utf8');
    scan.scanned++;
    const relativePath = toPosix(relative(searchDir, filePath));

    if (!content.includes(sourcePackage)) {
      for (const library of iconLibraryIds) {
        if (library === from) continue;
        if (content.includes(getIconLibrary(library).packageName)) {
          scan.otherLibraries.push({ relativePath, library });
        }
      }
      continue;
    }

    scan.candidates++;
    if (!canMigrateIconLibraries(from, to)) {
      // The command refuses unsupported pairs up front; this keeps the scan honest anyway.
      scan.failures.push({ relativePath, message: `no verified mappings from ${from} to ${to}` });
      continue;
    }

    const rewrite = rewriteIconImports(content, { from, to });
    if (rewrite.status !== 'ok') {
      scan.failures.push({ relativePath, message: rewrite.message });
      continue;
    }
    if (!rewrite.changed && rewrite.unmapped.length === 0 && rewrite.skipped.length === 0) continue;

    scan.edits.push({
      path: filePath,
      relativePath,
      content: rewrite.changed ? rewrite.content : content,
      changed: rewrite.changed,
      mapped: rewrite.mapped,
      unmapped: rewrite.unmapped,
      skipped: rewrite.skipped,
    });
  }

  scan.edits.sort((a, b) => (a.relativePath < b.relativePath ? -1 : 1));
  scan.otherLibraries.sort((a, b) => (a.relativePath < b.relativePath ? -1 : 1));
  return scan;
}

/** Write every planned rewrite; returns the paths that changed. */
export function applyIconMigration(scan: IconMigrationScan): string[] {
  const written: string[] = [];
  for (const edit of scan.edits) {
    if (!edit.changed) continue;
    writeFileSync(edit.path, edit.content, 'utf8');
    written.push(edit.path);
  }
  return written;
}

/** Aggregate a scan into deduplicated, display-ready lists. */
export function summarizeIconMigration(scan: IconMigrationScan): IconMigrationSummary {
  const mapped = new Map<string, { from: string; to: string; localName: string }>();
  const unmapped = new Map<string, { library: IconLibraryId; name: string; files: Set<string> }>();
  const skipped = new Map<string, { spec: string; reason: SkippedIconImportReason; files: Set<string> }>();

  for (const edit of scan.edits) {
    for (const icon of edit.mapped) {
      mapped.set(`${icon.from}->${icon.localName}`, { from: icon.from, to: icon.to, localName: icon.localName });
    }
    for (const icon of edit.unmapped) {
      const entry = unmapped.get(icon.name) ?? { library: icon.library, name: icon.name, files: new Set<string>() };
      entry.files.add(edit.relativePath);
      unmapped.set(icon.name, entry);
    }
    for (const skip of edit.skipped) {
      const entry = skipped.get(skip.spec) ?? { spec: skip.spec, reason: skip.reason, files: new Set<string>() };
      entry.files.add(edit.relativePath);
      skipped.set(skip.spec, entry);
    }
  }

  const otherLibraries = new Map<IconLibraryId, Set<string>>();
  for (const entry of scan.otherLibraries) {
    const files = otherLibraries.get(entry.library) ?? new Set<string>();
    files.add(entry.relativePath);
    otherLibraries.set(entry.library, files);
  }

  return {
    mapped: [...mapped.values()],
    unmapped: [...unmapped.values()].map((entry) => ({ ...entry, files: [...entry.files] })),
    skipped: [...skipped.values()].map((entry) => ({ ...entry, files: [...entry.files] })),
    otherLibraries: [...otherLibraries.entries()].map(([library, files]) => ({ library, files: [...files] })),
  };
}