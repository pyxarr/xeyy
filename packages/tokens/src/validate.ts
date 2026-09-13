/**
 * Structural validation for the three-layer token system.
 *
 * Runs on plain Node (type stripping, no Node built-ins, no
 * `@stylexjs/stylex` calls — the shipped stylex package throws on
 * `defineVars`/`createTheme` at runtime without a compiler). It proves
 * that every Base Color + Theme composition is contract-complete and that
 * every Style exposes a recipe for every part using only the recipe
 * vocabulary. Actual StyleX compilation of consumer files is covered by
 * `check-types` (tsc), not by this file.
 */
import { CONTRACT_KEYS } from './contract.ts';
import { BASE_COLORS } from './base-colors/index.ts';
import { THEMES } from './themes/index.ts';
import { composeThemePair } from './compose.ts';
import { RADIUS_STEPS } from './styles/scale.ts';
import { PART_NAMES, STYLE_NAMES, PART_RECIPE_KEYS } from './styles/recipe.ts';
import { STYLE_RECIPES } from './styles/values.ts';
import { renderDefaultThemeSource } from '../scripts/generate-theme.ts';

export class ValidationError extends Error {}

function fail(message: string): never {
  throw new ValidationError(message);
}

function keyset(values: object): string[] {
  return Object.keys(values).sort();
}

function assertKeyset(values: object, label: string): void {
  const keys = keyset(values);
  const expected = [...CONTRACT_KEYS].sort();
  if (keys.length !== expected.length || keys.some((key, i) => key !== expected[i])) {
    fail(
      `${label} must expose exactly the semantic contract keys.\n` +
        `  expected: ${expected.join(', ')}\n` +
        `  actual:   ${keys.join(', ')}`,
    );
  }
}

function assertSubset(values: object, label: string): void {
  const keys = keyset(values);
  if (keys.length === 0) {
    fail(`${label} must override at least one semantic key.`);
  }
  const allowed = new Set(CONTRACT_KEYS);
  const unknown = keys.filter((key) => !allowed.has(key as (typeof CONTRACT_KEYS)[number]));
  if (unknown.length > 0) {
    fail(`${label} overrides keys outside the contract: ${unknown.join(', ')}.`);
  }
}

export function validateBaseColors(): number {
  for (const base of BASE_COLORS) {
    assertKeyset(base.light, `base color ${base.name} (light)`);
    assertKeyset(base.dark, `base color ${base.name} (dark)`);
  }
  return BASE_COLORS.length;
}

export function validateThemes(): number {
  for (const theme of THEMES) {
    assertSubset(theme.light, `theme ${theme.name} (light)`);
    assertSubset(theme.dark, `theme ${theme.name} (dark)`);
  }
  return THEMES.length;
}

export function validateCompositions(): number {
  let count = 0;
  for (const base of BASE_COLORS) {
    for (const theme of [null, ...THEMES]) {
      const composed = composeThemePair(base, theme);
      assertKeyset(composed.light, `composition ${composed.name} (light)`);
      assertKeyset(composed.dark, `composition ${composed.name} (dark)`);
      count += 1;
    }
  }
  return count;
}

const LEGACY_DEPTH_KEYS = [
  'depthValues',
  'darkDepthValues',
  'radiusControlSm',
  'radiusControlMd',
  'radiusControlLg',
  'radiusCard',
  'radiusOverlay',
  'radiusDialog',
  'cardPadding',
  'cardGap',
  'overlayPadding',
  'shadowXs',
  'shadowSm',
  'shadowMd',
  'shadowLg',
  'shadowXl',
  'shadow2xl',
];

export function validateStyles(): number {
  if (keyset(STYLE_RECIPES).join() !== [...STYLE_NAMES].sort().join()) {
    fail('STYLE_RECIPES must cover exactly the STYLE_NAMES styles.');
  }
  const allowedKeys = new Set<string>(PART_RECIPE_KEYS);
  const radiusSteps = new Set<string>(RADIUS_STEPS);
  for (const name of STYLE_NAMES) {
    const recipes = STYLE_RECIPES[name];
    const parts = keyset(recipes as unknown as object);
    if (parts.join() !== [...PART_NAMES].sort().join()) {
      fail(
        `style ${name} must expose a recipe for every part.\n` +
          `  expected: ${[...PART_NAMES].sort().join(', ')}\n` +
          `  actual:   ${parts.join(', ')}`,
      );
    }
    for (const part of PART_NAMES) {
      const recipe = recipes[part];
      for (const key of keyset(recipe)) {
        if (!allowedKeys.has(key)) {
          fail(`style ${name} part ${part} uses unknown key "${key}".`);
        }
        if (LEGACY_DEPTH_KEYS.includes(key)) {
          fail(`style ${name} part ${part} leaks legacy depth key "${key}".`);
        }
        const value = (recipe as Record<string, unknown>)[key];
        if (key === 'radius') {
          if (typeof value !== 'string' || !radiusSteps.has(value)) {
            fail(`style ${name} part ${part} has invalid radius "${String(value)}".`);
          }
        }
        if (key === 'borderRadius' && typeof value !== 'string') {
          fail(`style ${name} part ${part} has an empty/undefined borderRadius.`);
        }
      }
    }
  }
  return STYLE_NAMES.length;
}

/**
 * The generated default scaffold must always carry the full contract.
 *
 * The committed `src/theme.stylex.ts` cannot be imported at runtime (it
 * calls `stylex.defineVars`, which throws without a compiler), so we check
 * the rendered source instead: it must be a single-import file exposing
 * semantic/darkSemantic with every contract line present and no legacy
 * depth/darkDepth exports. Freshness of the committed file vs. this render
 * is asserted in tests.
 */
export function validateScaffold(): void {
  const source = renderDefaultThemeSource();
  const importLine = /^import .+$/gm.exec(source);
  if (importLine?.[0] !== `import * as stylex from '@stylexjs/stylex';`) {
    fail('default scaffold must import only `@stylexjs/stylex`.');
  }
  for (const exportName of ['semantic', 'darkSemantic'] as const) {
    if (!source.includes(`export const ${exportName} =`)) {
      fail(`default scaffold source must export \`${exportName}\`.`);
    }
  }
  for (const legacyExport of ['depth', 'darkDepth'] as const) {
    if (source.includes(`export const ${legacyExport} =`)) {
      fail(`default scaffold source must not export the legacy \`${legacyExport}\` vars.`);
    }
  }
  for (const key of CONTRACT_KEYS) {
    if (!source.includes(`  ${key}: `)) {
      fail(`default scaffold source must declare every contract key (missing \`${key}\`).`);
    }
  }
}

export interface ValidationSummary {
  readonly baseColors: number;
  readonly themes: number;
  readonly compositions: number;
  readonly styles: number;
}

export function validate(): ValidationSummary {
  const baseColors = validateBaseColors();
  const themes = validateThemes();
  const compositions = validateCompositions();
  const styles = validateStyles();
  validateScaffold();
  return { baseColors, themes, compositions, styles };
}