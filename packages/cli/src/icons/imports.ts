import { parse } from '@babel/parser';
import {
  getIconLibrary,
  iconLibraries,
  isIconPackageName,
  mapIconName,
  type IconLibraryId,
} from '@xeyy/icons';

/**
 * Icon import discovery and rewriting. Unlike the registry's regex-based
 * `analyzeIconUsage` (which only derives metadata), install-time and migration
 * rewriting must be exact, so this module parses with `@babel/parser` and edits
 * original source spans only.
 *
 * Rewriting preserves local binding names (`IconCheck as Check`), which keeps
 * every JSX/expression usage untouched and makes identifier scope irrelevant.
 */

type ProgramNode = ReturnType<typeof parse>['program'];
type ImportDeclarationNode = Extract<ProgramNode['body'][number], { type: 'ImportDeclaration' }>;
type ImportSpecifierNode = Extract<ImportDeclarationNode['specifiers'][number], { type: 'ImportSpecifier' }>;

export interface IconImportBinding {
  /** Exported name in the icon library (aliases resolve to the exported name). */
  exportedName: string;
  /** Local name the file binds the icon to. */
  localName: string;
}

export interface IconImportStatement {
  library: IconLibraryId;
  /** Module specifier exactly as written (subpaths preserved). */
  spec: string;
  bindings: IconImportBinding[];
  /** True for namespace/default imports, whose bindings cannot be enumerated. */
  opaque: boolean;
}

export interface MappedIcon {
  library: IconLibraryId;
  /** Exported name in the source library. */
  from: string;
  /** Exported name in the target library. */
  to: string;
  localName: string;
}

export interface UnmappedIcon {
  library: IconLibraryId;
  name: string;
}

export type SkippedIconImportReason =
  | 'namespace'
  | 'default'
  | 'type-only'
  | 'attributes'
  | 're-export'
  | 'dynamic';

export interface SkippedIconImport {
  spec: string;
  reason: SkippedIconImportReason;
}

export type ParseResult<T> = { ok: true; value: T } | { ok: false; message: string };

export interface IconRewrite {
  content: string;
  /** True when at least one import statement was rewritten. */
  changed: boolean;
  mapped: MappedIcon[];
  unmapped: UnmappedIcon[];
  skipped: SkippedIconImport[];
}

export type IconRewriteResult =
  | ({ status: 'ok' } & IconRewrite)
  | { status: 'unparseable' | 'unsafe'; message: string };

function parseModule(source: string) {
  return parse(source, { sourceType: 'module', plugins: ['typescript', 'jsx'] });
}

function parseErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return message.split('\n')[0] ?? message;
}

/** Whether verified mappings allow rewriting `from` imports into `to`. */
export function canMigrateIconLibraries(from: IconLibraryId, to: IconLibraryId): boolean {
  if (from === to) return false;
  return iconLibraries[from].migrationSourceSupported && iconLibraries[to].migrationTargetSupported;
}

/** Icon library import statements in a source text. */
export function parseIconImports(
  source: string,
  options: { includeTypeOnly?: boolean } = {},
): ParseResult<IconImportStatement[]> {
  let program: ProgramNode;
  try {
    program = parseModule(source).program;
  } catch (error) {
    return { ok: false, message: parseErrorMessage(error) };
  }

  const statements: IconImportStatement[] = [];
  for (const node of program.body) {
    if (node.type !== 'ImportDeclaration') continue;
    if (!options.includeTypeOnly && node.importKind === 'type') continue;
    const library = isIconPackageName(node.source.value);
    if (!library) continue;

    const bindings: IconImportBinding[] = [];
    let opaque = false;
    for (const specifier of node.specifiers) {
      if (specifier.type !== 'ImportSpecifier' || specifier.importKind !== 'value') {
        opaque = true;
        continue;
      }
      if (specifier.imported.type !== 'Identifier') {
        opaque = true;
        continue;
      }
      bindings.push({ exportedName: specifier.imported.name, localName: specifier.local.name });
    }
    statements.push({ library, spec: node.source.value, bindings, opaque });
  }
  return { ok: true, value: statements };
}

/** Module specifiers referenced through dynamic `import()` calls in a source text. */
export function extractDynamicImportSpecs(source: string): ParseResult<string[]> {
  let program: ProgramNode;
  try {
    program = parseModule(source).program;
  } catch (error) {
    return { ok: false, message: parseErrorMessage(error) };
  }
  const specs: string[] = [];
  collectImportCalls(program, specs);
  return { ok: true, value: specs };
}

/**
 * Depth-first collection of `import('…')` module specifiers. Babel 8 parses
 * dynamic imports as `ImportExpression`; older output used a `CallExpression`
 * with an `Import` callee — both forms are detected.
 */
export function collectImportSpecs(program: ProgramNode): string[] {
  const specs: string[] = [];
  collectImportCalls(program, specs);
  return specs;
}

/** Depth-first collection of `import('…')` string arguments. */
function collectImportCalls(node: unknown, specs: string[]): void {
  if (node === null || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    for (const child of node) collectImportCalls(child, specs);
    return;
  }
  const record = node as Record<string, unknown>;
  if (record.type === 'ImportExpression') {
    const source = record.source as { type?: unknown; value?: unknown } | undefined;
    if (source?.type === 'StringLiteral' && typeof source.value === 'string') {
      specs.push(source.value);
    }
  } else if (record.type === 'CallExpression') {
    const callee = record.callee as { type?: unknown } | undefined;
    if (callee?.type === 'Import') {
      const argument = (record.arguments as unknown[] | undefined)?.[0] as
        | { type?: unknown; value?: unknown }
        | undefined;
      if (argument?.type === 'StringLiteral' && typeof argument.value === 'string') {
        specs.push(argument.value);
      }
    }
  }
  for (const value of Object.values(record)) collectImportCalls(value, specs);
}

interface SourceEdit {
  start: number;
  end: number;
  text: string;
}

interface PlannedMove {
  specifier: ImportSpecifierNode;
  exportedName: string;
  targetName: string;
}

/**
 * Rewrite every named icon import of `from` to the `to` package. Local names
 * are preserved via aliases; icons without a verified mapping (and opaque or
 * type-only imports) stay on the original package and are reported.
 */
export function rewriteIconImports(
  source: string,
  options: { from: IconLibraryId; to: IconLibraryId },
): IconRewriteResult {
  const { from, to } = options;
  const unchanged: IconRewrite = { content: source, changed: false, mapped: [], unmapped: [], skipped: [] };
  if (from === to) return { status: 'ok', ...unchanged };

  let program: ProgramNode;
  try {
    program = parseModule(source).program;
  } catch (error) {
    return { status: 'unparseable', message: parseErrorMessage(error) };
  }

  const targetPackage = getIconLibrary(to).packageName;
  const eol = source.includes('\r\n') ? '\r\n' : '\n';
  const edits: SourceEdit[] = [];
  const mapped: MappedIcon[] = [];
  const unmapped: UnmappedIcon[] = [];
  const skipped: SkippedIconImport[] = [];

  for (const statement of program.body) {
    if (statement.type === 'ExportNamedDeclaration' && statement.source) {
      if (isIconPackageName(statement.source.value) === from) {
        skipped.push({ spec: statement.source.value, reason: 're-export' });
      }
      continue;
    }
    if (statement.type !== 'ImportDeclaration') continue;
    if (isIconPackageName(statement.source.value) !== from) continue;

    if (statement.importKind === 'type') {
      skipped.push({ spec: statement.source.value, reason: 'type-only' });
      continue;
    }

    if (statement.attributes?.length) {
      skipped.push({ spec: statement.source.value, reason: 'attributes' });
      continue;
    }

    const opaqueSpecifier = statement.specifiers.find((specifier) => specifier.type !== 'ImportSpecifier');
    if (opaqueSpecifier) {
      skipped.push({
        spec: statement.source.value,
        reason: opaqueSpecifier.type === 'ImportNamespaceSpecifier' ? 'namespace' : 'default',
      });
      continue;
    }

    const moves: PlannedMove[] = [];
    const preserved: ImportSpecifierNode[] = [];
    let preservedTypeOnly = false;

    for (const specifier of statement.specifiers) {
      if (specifier.type !== 'ImportSpecifier') continue;
      if (specifier.importKind !== 'value' || specifier.imported.type !== 'Identifier') {
        preserved.push(specifier);
        preservedTypeOnly = true;
        continue;
      }
      const exportedName = specifier.imported.name;
      const targetName = mapIconName(from, to, exportedName);
      if (targetName === null) {
        preserved.push(specifier);
        unmapped.push({ library: from, name: exportedName });
        continue;
      }
      moves.push({ specifier, exportedName, targetName });
    }

    if (moves.length === 0) {
      if (preservedTypeOnly) skipped.push({ spec: statement.source.value, reason: 'type-only' });
      continue;
    }

    if (!hasSpan(statement) || !hasSpan(statement.source)) {
      return { status: 'unsafe', message: `missing source positions for icon import "${statement.source.value}"` };
    }

    const quote = source[statement.source.start] ?? "'";
    const originalSpec = source.slice(statement.source.start, statement.source.end);
    const terminator = source.slice(statement.start, statement.end).trimEnd().endsWith(';') ? ';' : '';
    const lineStart = source.lastIndexOf('\n', statement.start) + 1;
    const indent = source.slice(lineStart, statement.start).match(/^[ \t]*/)?.[0] ?? '';

    const rewritten = moves.map((move) =>
      move.targetName === move.specifier.local.name ? move.targetName : `${move.targetName} as ${move.specifier.local.name}`,
    );
    for (const move of moves) {
      mapped.push({
        library: from,
        from: move.exportedName,
        to: move.targetName,
        localName: move.specifier.local.name,
      });
    }

    if (preserved.length === 0) {
      edits.push({ start: statement.source.start, end: statement.source.end, text: `${quote}${targetPackage}${quote}` });
      for (const move of moves) {
        const imported = move.specifier.imported;
        if (!hasSpan(imported)) {
          return { status: 'unsafe', message: 'Missing icon export source positions; file left unchanged.' };
        }
        const localName = move.specifier.local.name;
        const hasAlias = move.specifier.local.start !== imported.start;
        edits.push({
          start: imported.start,
          end: imported.end,
          text: hasAlias || move.targetName === localName ? move.targetName : `${move.targetName} as ${localName}`,
        });
      }
      continue;
    }

    // Mixed imports require splitting. Retain internal comments before the
    // split statements; source outside this import remains byte-for-byte intact.
    const comments = (parseModule(source).comments ?? [])
      .filter((comment) => hasSpan(comment) && comment.start >= statement.start && comment.end <= statement.end)
      .map((comment) => source.slice(comment.start, comment.end));
    const commentPrefix = comments.length > 0 ? `${comments.join(eol)}${eol}${indent}` : '';
    edits.push({
      start: statement.start,
      end: statement.end,
      text: `${commentPrefix}import { ${rewritten.join(', ')} } from ${quote}${targetPackage}${quote}${terminator}`,
    });

    if (preserved.length > 0) {
      const kept = preserved.map((specifier) => source.slice(specifier.start ?? 0, specifier.end ?? 0));
      edits.push({
        start: statement.end,
        end: statement.end,
        text: `${eol}${indent}import { ${kept.join(', ')} } from ${originalSpec}${terminator}`,
      });
    }
  }

  for (const spec of new Set(collectImportSpecs(program))) {
    if (isIconPackageName(spec) === from) skipped.push({ spec, reason: 'dynamic' });
  }

  if (edits.length === 0) return { status: 'ok', ...unchanged, unmapped, skipped };

  let content: string;
  try {
    content = applyEdits(source, edits);
  } catch (error) {
    return { status: 'unsafe', message: parseErrorMessage(error) };
  }

  const rewritten = parseIconImports(content);
  if (!rewritten.ok) {
    return { status: 'unsafe', message: `rewritten source failed to parse: ${rewritten.message}` };
  }
  if (!sameBindingNames(iconBindingNames(source), iconBindingNames(content))) {
    return { status: 'unsafe', message: 'rewritten source lost an icon binding; file left unchanged' };
  }

  return { status: 'ok', content, changed: true, mapped, unmapped, skipped };
}

type Span = { start?: number | null; end?: number | null };

/** Babel leaves positions unset only for synthetic nodes; parsed source always has them. */
function hasSpan(node: Span): node is { start: number; end: number } {
  return node.start !== null && node.start !== undefined && node.end !== null && node.end !== undefined;
}

/** Apply non-overlapping span edits, ascending, preserving everything else. */
function applyEdits(source: string, edits: SourceEdit[]): string {
  const ordered = [...edits].sort((a, b) => a.start - b.start || a.end - b.end);
  let result = '';
  let cursor = 0;
  for (const edit of ordered) {
    if (edit.start < cursor) {
      throw new Error('overlapping source edits');
    }
    result += source.slice(cursor, edit.start) + edit.text;
    cursor = edit.end;
  }
  return result + source.slice(cursor);
}

/** Local names bound by icon-package imports in a source text. */
function iconBindingNames(source: string): Set<string> {
  const names = new Set<string>();
  let program: ProgramNode;
  try {
    program = parseModule(source).program;
  } catch {
    return names;
  }
  for (const node of program.body) {
    if (node.type !== 'ImportDeclaration') continue;
    if (!isIconPackageName(node.source.value)) continue;
    for (const specifier of node.specifiers) names.add(specifier.local.name);
  }
  return names;
}

function sameBindingNames(before: Set<string>, after: Set<string>): boolean {
  if (before.size !== after.size) return false;
  for (const name of before) {
    if (!after.has(name)) return false;
  }
  return true;
}
