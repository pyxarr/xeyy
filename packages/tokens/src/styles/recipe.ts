/**
 * Component-specific visual recipes transcribed from shadcn-ui/ui@main
 * apps/v4/registry/styles/style-<name>.css, resolved to StyleX property
 * vocabulary.
 *
 * The recipe set is a curated subset of the upstream `cn-*` slots.
 * Intentionally NOT included: slider orientation (horizontal/vertical)
 * variants, calendar, breadcrumb, kbd, radio indicator, sheet sides, table,
 * pagination, command, combobox, button/toggle size variants beyond the ones
 * kept, card corner-radius utilities, and all color/ring/focus-state/
 * animation utilities.
 *
 * Base dimensions are transcribed from `data-[size=default]` selectors; the
 * default size is canonical. Arbitrary `--radius-*` expressions are resolved
 * against the shadcn base radius of 0.625rem (RADIUS_BASE in scale.ts).
 *
 * Radius-collapse rules for min()/calc() expressions:
 * - `rounded-[min(var(--radius-md),<n>px)]` where <n> >= resolved md (8px):
 *   the minimum caps at radius-md → step 'md'.
 * - `rounded-[min(var(--radius-4xl),24px)]`: caps at 24px which is less
 *   than resolved 4xl (34px) → borderRadius literal string
 *   `min(calc(0.625rem + 24px), 24px)`.
 * - `rounded-[calc(var(--radius-sm)+2px)]`: sm resolved 6px + 2px = 8px
 *   = radius-md → step 'md'.
 * - `rounded-[calc(var(--radius-md)-2px)]`: md resolved 8px - 2px = 6px
 *   = radius-sm → borderRadius `calc(0.625rem - 4px)` (no step alias used).
 */
import type { RadiusStep } from './scale.ts';

export type StyleName = 'vega' | 'nova' | 'maia' | 'lyra' | 'mira' | 'luma' | 'rhea' | 'sera';

export const STYLE_NAMES: readonly StyleName[] = [
  'vega',
  'nova',
  'maia',
  'lyra',
  'mira',
  'luma',
  'rhea',
  'sera',
];

export interface StyleMeta {
  readonly title: string;
  readonly description: string;
}

export const STYLE_META: Record<StyleName, StyleMeta> = {
  vega: { title: 'Vega', description: 'Clean, neutral, and familiar.' },
  nova: { title: 'Nova', description: 'Reduced padding and margins.' },
  maia: { title: 'Maia', description: 'Rounded, with generous spacing.' },
  lyra: { title: 'Lyra', description: 'Boxy and sharp. For mono fonts.' },
  mira: { title: 'Mira', description: 'Made for compact interfaces.' },
  luma: { title: 'Luma', description: 'Fluid, luminous, and soft.' },
  rhea: { title: 'Rhea', description: 'Like Luma but compact.' },
  sera: { title: 'Sera', description: 'Editorial and typographic.' },
};

export const PART_NAMES = [
  'button',
  'buttonSizeSm',
  'buttonSizeDefault',
  'buttonSizeLg',
  'buttonSizeIcon',
  'badge',
  'card',
  'cardHeader',
  'dialogContent',
  'menuContent',
  'menuItem',
  'tooltipContent',
  'popoverContent',
  'input',
  'textarea',
  'selectTrigger',
  'tabsList',
  'tabsTrigger',
  'accordionTrigger',
  'toggle',
  'checkbox',
  'switch',
  'progress',
  'skeleton',
  'sidebarMenuButton',
  'sliderTrack',
] as const;

export type PartName = (typeof PART_NAMES)[number];

export interface PartRecipe {
  readonly height?: string;
  readonly width?: string;
  readonly minWidth?: string;
  readonly maxWidth?: string;
  readonly padding?: string;
  readonly paddingInline?: string;
  readonly paddingBlock?: string;
  readonly paddingLeft?: string;
  readonly paddingRight?: string;
  readonly gap?: string;
  readonly radius?: RadiusStep;
  readonly borderRadius?: string;
  readonly fontSize?: string;
  readonly lineHeight?: string;
  readonly fontWeight?: string;
  readonly letterSpacing?: string;
  readonly textTransform?: string;
  readonly boxShadow?: string;
  readonly borderWidth?: string;
  readonly borderBottomWidth?: string;
  readonly iconSize?: string;
}

export const PART_RECIPE_KEYS = [
  'height',
  'width',
  'minWidth',
  'maxWidth',
  'padding',
  'paddingInline',
  'paddingBlock',
  'paddingLeft',
  'paddingRight',
  'gap',
  'radius',
  'borderRadius',
  'fontSize',
  'lineHeight',
  'fontWeight',
  'letterSpacing',
  'textTransform',
  'boxShadow',
  'borderWidth',
  'borderBottomWidth',
  'iconSize',
] as const;

export type StyleRecipes = { readonly [P in PartName]: PartRecipe };

export interface Style {
  readonly name: StyleName;
  readonly title: string;
  readonly description: string;
  readonly recipes: StyleRecipes;
}
