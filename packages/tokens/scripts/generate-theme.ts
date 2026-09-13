/**
 * Generates the self-contained default theme (`src/theme.stylex.ts`) from
 * the composable token sources.
 *
 * The output is a single file that imports nothing but `@stylexjs/stylex`
 * so it can be copied verbatim into consumer projects by the CLI/registry.
 * It derives from the neutral base color (semantic layer) — that module is
 * the single source of truth.
 * `renderDefaultThemeSource()` is pure so `validate.ts` and the tests can
 * assert the committed file stays a fresh render.
 *
 * Run: `pnpm --filter @xeyy/tokens generate:theme`
 */
import { writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CONTRACT_KEYS } from '../src/contract.ts';
import { neutral } from '../src/base-colors/neutral.ts';

function renderObject(values: Record<string, string>, keys: readonly string[]): string {
  return keys.map((key) => `  ${key}: ${JSON.stringify(values[key])}`).join(',\n');
}

export function renderDefaultThemeSource(): string {
  return `/**
 * GENERATED FILE.
 *
 * DO NOT EDIT BY HAND. Regenerate with:
 *   pnpm --filter @xeyy/tokens generate:theme
 *
 * Self-contained default theme (neutral base) for direct installation into
 * consumer projects. Derived from the composable token modules in this
 * package; those modules are the single source of truth.
 */
import * as stylex from '@stylexjs/stylex';

export const semantic = stylex.defineVars({
${renderObject(neutral.light, CONTRACT_KEYS)}
});

export const darkSemantic = stylex.createTheme(semantic, {
${renderObject(neutral.dark, CONTRACT_KEYS)}
});
`;
}

const here = dirname(fileURLToPath(import.meta.url));
const outputPath = join(here, '..', 'src', 'theme.stylex.ts');

const isMain = process.argv[1] ? resolve(process.argv[1]) === fileURLToPath(import.meta.url) : false;

if (isMain) {
  await writeFile(outputPath, renderDefaultThemeSource(), 'utf8');
  console.log(`Wrote ${outputPath}`);
}