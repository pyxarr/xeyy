/**
 * @xeyy/tokens public API.
 *
 * Three-layer token system mirroring shadcn/ui's current structure:
 * Base Color (7) + Theme (17 overlays) + Style (8) -> Light + Dark.
 */
export type {
  BaseColorData,
  SemanticKey,
  ThemeOverlayData,
  ThemePairValues,
  ThemeValues,
} from './contract.ts';
export { CONTRACT_KEYS } from './contract.ts';

export { BASE_COLORS } from './base-colors/index.ts';
export { THEMES } from './themes/index.ts';

export { composeThemePair, composeValues } from './compose.ts';
export type { ComposedTheme } from './compose.ts';

export { semantic, darkSemantic } from './semantic.ts';

export {
  STYLE_NAMES,
  STYLE_META,
  PART_NAMES,
  STYLE_RECIPES,
  STYLES,
  getStyle,
  radiusScale,
  radiusValue,
  RADIUS_BASE,
  RADIUS_STEPS,
} from './styles/index.ts';
export type {
  StyleName,
  StyleMeta,
  PartName,
  PartRecipe,
  StyleRecipes,
  Style,
  RadiusScale,
  RadiusStep,
} from './styles/index.ts';

export {
  validate,
  validateBaseColors,
  validateThemes,
  validateCompositions,
  validateStyles,
  validateScaffold,
  ValidationError,
} from './validate.ts';
export type { ValidationSummary } from './validate.ts';