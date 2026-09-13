import type { BaseColorData, ThemeOverlayData, ThemePairValues, ThemeValues } from './contract.ts';
import { CONTRACT_KEYS } from './contract.ts';

/** A Base Color resolved into a full light + dark contract palette. */
export interface ComposedTheme extends ThemePairValues {
  readonly name: string;
  readonly baseColor: string;
  readonly theme: string;
}

/**
 * Apply a partial theme overlay on top of a full base palette, always
 * producing every contract key.
 */
export function composeValues(base: ThemeValues, overlay: Partial<ThemeValues> | undefined): ThemeValues {
  const composed: ThemeValues = { ...base };
  if (overlay) {
    for (const key of CONTRACT_KEYS) {
      const value = overlay[key];
      if (value !== undefined) {
        composed[key] = value;
      }
    }
  }
  return composed;
}

/** The identity theme — a Base Color with no overlay. */
export const IDENTITY_THEME: ThemeOverlayData = {
  name: 'default',
  title: 'Default',
  light: {},
  dark: {},
};

/**
 * Three-layer composition: Base Color + Theme -> full light + dark palette.
 * `theme` defaults to the identity (bare Base Color).
 */
export function composeThemePair(
  baseColor: BaseColorData,
  theme: ThemeOverlayData | null = null,
): ComposedTheme {
  const overlay = theme ?? IDENTITY_THEME;
  return {
    name: `${baseColor.name}-${overlay.name}`,
    baseColor: baseColor.name,
    theme: overlay.name,
    light: composeValues(baseColor.light, overlay.light),
    dark: composeValues(baseColor.dark, overlay.dark),
  };
}