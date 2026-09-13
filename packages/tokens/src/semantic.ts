import * as stylex from '@stylexjs/stylex';
import { neutral } from './base-colors/neutral.ts';

/**
 * Canonical StyleX semantic tokens — the neutral base color (light view).
 *
 * The analogous tokens are re-declared inside the generated self-contained
 * default theme at `src/theme.stylex.ts` so that file can be copied into
 * consumer projects without importing from this package. `validate.ts`
 * asserts the generated scaffold matches these tokens.
 */
export const semantic = stylex.defineVars({ ...neutral.light });

/** Dark theme for the canonical tokens (neutral base color, dark view). */
export const darkSemantic = stylex.createTheme(semantic, neutral.dark);