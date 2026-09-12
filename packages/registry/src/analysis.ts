import { dirname, join, relative } from 'node:path';

import type { RegistrySection } from './schemas.ts';
import type { ScannedFile } from './discovery.ts';
import { toPosix } from './paths.ts';

export const EXCLUDED_PEERS = new Set([
  'react',
  'react-dom',
  'react-is',
  'react/jsx-runtime',
  'react-dom/client',
  'react-dom/server',
  'typescript',
  '@types/react',
  '@types/react-dom',
]);

function isLocalOrAlias(spec: string): boolean {
  return spec.startsWith('.') || spec.startsWith('/') || spec.startsWith('@/');
}

/** Return the root package name for a subpath import. */
export function rootPackage(spec: string): string {
  if (spec.startsWith('@')) {
    const parts = spec.split('/');
    return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : spec;
  }
  return spec.split('/')[0]!;
}

/** Raw module specifiers (subpaths preserved) from non-type import statements. */
export function extractModuleSpecifiers(src: string): string[] {
  const IMPORT_RE = /^\s*import\s*(?!type\b)[\s\S]*?\bfrom\s+['"]([^'"]+)['"]/gm;
  const specifiers: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = IMPORT_RE.exec(src))) {
    specifiers.push(m[1]!);
  }
  return specifiers;
}

export type ImportKind = 'npm' | 'local' | 'alias';

export interface ModuleImport {
  spec: string;
  packageName?: string;
  kind: ImportKind;
}

export function classifyImport(spec: string): ModuleImport {
  if (spec.startsWith('@/')) {
    return { spec, kind: 'alias' };
  }
  if (spec.startsWith('.') || spec.startsWith('/')) {
    return { spec, kind: 'local' };
  }
  return { spec, packageName: rootPackage(spec), kind: 'npm' };
}

/** npm package names imported by the given source texts (excludes peers/types/tokens). */
export function extractNpmDependencies(
  files: ScannedFile[],
  read: (f: ScannedFile) => string,
): string[] {
  const names = new Set<string>();
  for (const file of files) {
    if (file.kind !== 'code') continue;
    let content: string;
    try {
      content = read(file);
    } catch {
      continue;
    }
    for (const spec of extractModuleSpecifiers(content)) {
      const cls = classifyImport(spec);
      if (cls.kind !== 'npm' || !cls.packageName) continue;
      if (EXCLUDED_PEERS.has(cls.packageName) || cls.packageName.startsWith('@types/')) continue;
      if (cls.packageName === '@xeyy/tokens') continue;
      names.add(cls.packageName);
    }
  }
  return [...names].sort();
}

export interface KnownComponent {
  name: string;
  section: RegistrySection;
  dir: string;
}

/** Resolve a relative/alias import to an absolute path under the source root. */
export function resolveImportTarget(
  fromFileDir: string,
  spec: string,
  sourceRoot: string,
): string | null {
  if (spec.startsWith('@/')) {
    return join(sourceRoot, spec.slice(2));
  }
  if (!spec.startsWith('.')) return null;
  return join(dirname(fromFileDir), spec);
}

export interface RegistryDependencyMatch {
  name: string;
  fromFile: string;
  spec: string;
}

const EXTENSIONS = ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx'];

/**
 * Detect likely registry dependencies (other Xeyy components) from relative /
 * alias imports that resolve into the canonical source tree. Only known
 * candidate components produce a match — nothing is guessed.
 */
export function detectRegistryDependencies(
  files: ScannedFile[],
  options: {
    sourceDir: string;
    candidates: KnownComponent[];
    read: (f: ScannedFile) => string;
  },
): RegistryDependencyMatch[] {
  const { sourceDir, candidates } = options;
  const matches: RegistryDependencyMatch[] = [];
  const seen = new Set<string>();

  for (const file of files) {
    if (file.kind !== 'code') continue;
    const fileAbs = join(sourceDir, file.relativePath);
    const fromDir = dirname(fileAbs);

    for (const spec of extractModuleSpecifiers(options.read(file))) {
      const target = resolveImportTarget(fromDir, spec, sourceDir);
      if (!target) continue;

      const normalizedTarget = toPosix(target);
      let hit: KnownComponent | null = null;

      outer: for (const candidate of candidates) {
        const candidateDir = toPosix(candidate.dir);
        for (const ext of EXTENSIONS) {
          const resolved = normalizedTarget + ext;
          if (resolved === candidateDir || resolved.startsWith(`${candidateDir}/`)) {
            hit = candidate;
            break outer;
          }
        }
      }

      if (hit && !seen.has(hit.name)) {
        seen.add(hit.name);
        matches.push({ name: hit.name, fromFile: file.relativePath, spec });
      }
    }
  }

  matches.sort((a, b) => a.name.localeCompare(b.name));
  return matches;
}

// ── StyleX analysis ──────────────────────────────────────────────────────────

const STYLEX_FEATURE_APIS = ['create', 'createTheme', 'defineVars', 'keyframes'] as const;
const STYLEX_ALIAS_RE = /import\s+\*\s+as\s+(\w+)\s+from\s+['"]@stylexjs\/stylex['"]/;

export interface StylexAnalysis {
  features: string[];
  conditions: string[];
  minVersion?: string;
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findStylexAlias(src: string): string | null {
  return STYLEX_ALIAS_RE.exec(src)?.[1] ?? null;
}

function matchedBrace(src: string, open: number): number {
  let depth = 0;
  let quote: string | null = null;
  for (let i = open; i < src.length; i++) {
    const ch = src[i];
    if (quote) {
      if (ch === '\\') { i++; continue; }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return src.length;
}

function extractConditions(src: string, alias: string): string[] {
  const set = new Set<string>();
  const callRe = new RegExp(`\\b${escapeRe(alias)}\\.(?:create|createTheme)\\s*\\(`, 'g');
  let m: RegExpExecArray | null;
  while ((m = callRe.exec(src))) {
    const open = src.indexOf('{', m.index + m[0].length);
    if (open === -1) continue;
    const block = src.slice(open, matchedBrace(src, open));
    const pseudoRe = /['"]:([A-Za-z][\w-]*)['"]/g;
    let pm: RegExpExecArray | null;
    while ((pm = pseudoRe.exec(block))) {
      set.add(pm[1]!);
    }
    const atRuleRe = /['"]@([\w-]+)/g;
    let am: RegExpExecArray | null;
    while ((am = atRuleRe.exec(block))) {
      set.add(am[1]!);
    }
  }
  return [...set].sort();
}

export function analyzeStylex(src: string, resolvedStylexVersion?: string): StylexAnalysis {
  const alias = findStylexAlias(src);
  if (!alias) return { features: [], conditions: [] };

  const features = new Set<string>();
  const featureRe = new RegExp(`\\b${escapeRe(alias)}\\.(${STYLEX_FEATURE_APIS.join('|')})\\s*\\(`, 'g');
  let m: RegExpExecArray | null;
  while ((m = featureRe.exec(src))) {
    features.add(m[1]!);
  }

  const minVersion =
    features.size > 0 && resolvedStylexVersion && !/^[a-z]/.test(resolvedStylexVersion)
      ? resolvedStylexVersion.replace(/^[~^]+/, '')
      : undefined;

  return {
    features: [...features].sort(),
    conditions: extractConditions(src, alias),
    minVersion,
  };
}

// ── Accessibility ────────────────────────────────────────────────────────────

export interface AccessibilityAnalysis {
  aria: boolean;
  keyboard: boolean;
  focusManagement: boolean;
}

export function analyzeAccessibility(src: string): AccessibilityAnalysis {
  const ARIA_JSX_RE = /\s(aria-[\w-]+|role|tabIndex)(?=\s*[={:])/g;
  const ARIA_PROPS_RE = /['"](aria-[\w-]+|role|tabIndex)['"]\s*[?:]/g;
  const KEYBOARD_RE = /\bon(?:KeyDown|KeyUp|KeyPress)/;
  const FOCUS_RE = /\b(?:autoFocus|focusVisible|focusableWhenDisabled|onFocusVisibleChange|RovingTabIndex|FocusTrap)\b/;
  return {
    aria: ARIA_JSX_RE.test(src) || ARIA_PROPS_RE.test(src),
    keyboard: KEYBOARD_RE.test(src),
    focusManagement: FOCUS_RE.test(src),
  };
}

// ── Client vs server indicators ──────────────────────────────────────────────

export interface ClientSignals {
  moduleLevelBrowserGlobal: boolean;
  eventListener: boolean;
}

/** Conservative, positive-only indicators; absence never claims server safety. */
export function detectClientSignals(src: string): ClientSignals {
  const moduleGlobalRe = /^\s*(?:const|let|var)\s+\w+[^]*?\b(?:window|document|navigator)\b/m;
  const eventRe = /\baddEventListener\b|\bonClick\s*[={]|\buseEffect\s*\(/;
  return {
    moduleLevelBrowserGlobal: moduleGlobalRe.test(src),
    eventListener: eventRe.test(src),
  };
}

// ── Token / theme import rewriting ───────────────────────────────────────────

const TOKENS_IMPORT_RE = /^\s*import\s+[^;]*?\bfrom\s+['"]([^'"]*@xeyy\/tokens[^'"]*)['"]/gm;

/** Return the `@xeyy/tokens` module specifiers imported by a source text. */
export function extractTokenImports(src: string): string[] {
  const specs: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = TOKENS_IMPORT_RE.exec(src))) {
    specs.push(m[1]!);
  }
  return specs;
}

/**
 * Build a browser-relative module specifier from one directory to a file.
 * Used to point installed components at the project's theme file.
 */
export function relativeModuleSpec(fromFileDir: string, toFile: string): string {
  const rel = relative(fromFileDir, toFile);
  return toPosix(rel).replace(/\.ts$/, '');
}

/**
 * Rewrite `@xeyy/tokens` imports to a relative import of the installed theme
 * file. Consumers must not depend on `@xeyy/tokens` as a runtime package —
 * the theme file (e.g. `src/styles/theme.stylex.ts`) is the installed source.
 */
export function rewriteTokenImports(content: string, fromFileDir: string, themeFile: string): string {
  const spec = relativeModuleSpec(fromFileDir, themeFile);
  return content.replace(TOKENS_IMPORT_RE, (_match, oldSpec: string) => {
    return _match.replace(oldSpec, spec);
  });
}