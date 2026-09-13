/**
 * The stable semantic theme contract.
 *
 * Mirrors the current shadcn/ui token structure (apps/v4/registry/themes.ts)
 * one-for-one. Every Base Color and every composed Base Color + Theme pair
 * must provide these keys for BOTH light and dark.
 */

export const CONTRACT_KEYS = [
  'background',
  'foreground',
  'card',
  'cardForeground',
  'popover',
  'popoverForeground',
  'primary',
  'primaryForeground',
  'secondary',
  'secondaryForeground',
  'muted',
  'mutedForeground',
  'accent',
  'accentForeground',
  'destructive',
  'border',
  'input',
  'ring',
  'chart1',
  'chart2',
  'chart3',
  'chart4',
  'chart5',
  // Upstream emits `radius` per-theme on the light theme only; Xeyy ships it
  // in both light and dark so every composition owns a full palette.
  'radius',
  'sidebar',
  'sidebarForeground',
  'sidebarPrimary',
  'sidebarPrimaryForeground',
  'sidebarAccent',
  'sidebarAccentForeground',
  'sidebarBorder',
  'sidebarRing',
] as const;

export type SemanticKey = (typeof CONTRACT_KEYS)[number];

/** A full semantic palette (light or dark). All contract keys present. */
export type ThemeValues = { [K in SemanticKey]: string };

/** Base Color = full light + dark palette for one of the 7 shadcn base colors. */
export interface BaseColorData {
  readonly name: string;
  readonly title: string;
  readonly light: ThemeValues;
  readonly dark: ThemeValues;
}

/** Theme = a partial semantic overlay applied on top of a Base Color. */
export interface ThemeOverlayData {
  readonly name: string;
  readonly title: string;
  /** Partial light values. Keys must be a subset of the contract. */
  readonly light: Partial<ThemeValues>;
  /** Partial dark values. Keys must be a subset of the contract. */
  readonly dark: Partial<ThemeValues>;
}

export interface ThemePairValues {
  readonly light: ThemeValues;
  readonly dark: ThemeValues;
}