/**
 * Style layer: component-specific visual recipes per shadcn style.
 *
 * Pure data — no `@stylexjs/stylex` calls (the stylex package throws at
 * runtime on `defineVars`/`createTheme` without a compiler). Styles are
 * mode-agnostic: upstream recipes contain no structural `dark:` variants, so
 * a single recipe set applies to both light and dark.
 */
import { STYLE_META, STYLE_NAMES } from './recipe.ts';
import type { Style, StyleName } from './recipe.ts';
import { STYLE_RECIPES } from './values.ts';

export { STYLE_RECIPES } from './values.ts';

export const STYLES: readonly Style[] = STYLE_NAMES.map((name) => ({
  name,
  ...STYLE_META[name],
  recipes: STYLE_RECIPES[name],
}));

export function getStyle(name: StyleName): Style {
  const style = STYLES.find((s) => s.name === name);
  if (!style) {
    throw new Error(`Unknown style "${name}".`);
  }
  return style;
}

export type { StyleName, StyleMeta, StyleRecipes, PartName, PartRecipe, Style } from './recipe.ts';
export { STYLE_NAMES, STYLE_META, PART_NAMES } from './recipe.ts';

export { radiusScale, radiusValue, RADIUS_BASE, RADIUS_STEPS } from './scale.ts';
export type { RadiusScale, RadiusStep } from './scale.ts';