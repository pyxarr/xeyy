/**
 * Radius scale derived from a single base radius value.
 *
 * Xeyy uses the shadcn v4 theme override formulas: xs through 4xl are
 * linear offsets from the base, and full is always 9999px.
 */
export const RADIUS_BASE = '0.625rem';

export type RadiusStep = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'full';

export const RADIUS_STEPS: readonly RadiusStep[] = [
  'none',
  'xs',
  'sm',
  'md',
  'lg',
  'xl',
  '2xl',
  '3xl',
  '4xl',
  'full',
];

export interface RadiusScale {
  readonly xs: string;
  readonly sm: string;
  readonly md: string;
  readonly lg: string;
  readonly xl: string;
  readonly '2xl': string;
  readonly '3xl': string;
  readonly '4xl': string;
  readonly full: string;
}

export function radiusScale(baseRadius: string): RadiusScale {
  return {
    xs: `calc(${baseRadius} - 6px)`,
    sm: `calc(${baseRadius} - 4px)`,
    md: `calc(${baseRadius} - 2px)`,
    lg: baseRadius,
    xl: `calc(${baseRadius} + 4px)`,
    '2xl': `calc(${baseRadius} + 8px)`,
    '3xl': `calc(${baseRadius} + 16px)`,
    '4xl': `calc(${baseRadius} + 24px)`,
    full: '9999px',
  };
}

export function radiusValue(step: RadiusStep, baseRadius: string): string {
  if (step === 'none') return '0';
  if (step === 'full') return '9999px';
  return radiusScale(baseRadius)[step];
}
