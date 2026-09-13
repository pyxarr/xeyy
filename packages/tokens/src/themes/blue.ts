import type { ThemeOverlayData } from '../contract.ts';

/**
 * Blue — partial light + dark overlay applied on top of any Base Color.
 * Values transcribed verbatim from shadcn/ui (apps/v4/registry/themes.ts).
 */
export const blue: ThemeOverlayData = {
  name: 'blue',
  title: 'Blue',
  light: {
    primary: 'oklch(0.488 0.243 264.376)',
    primaryForeground: 'oklch(0.97 0.014 254.604)',
    secondary: 'oklch(0.967 0.001 286.375)',
    secondaryForeground: 'oklch(0.21 0.006 285.885)',
    chart1: 'oklch(0.809 0.105 251.813)',
    chart2: 'oklch(0.623 0.214 259.815)',
    chart3: 'oklch(0.546 0.245 262.881)',
    chart4: 'oklch(0.488 0.243 264.376)',
    chart5: 'oklch(0.424 0.199 265.638)',
    sidebarPrimary: 'oklch(0.546 0.245 262.881)',
    sidebarPrimaryForeground: 'oklch(0.97 0.014 254.604)',
  },
  dark: {
    primary: 'oklch(0.424 0.199 265.638)',
    primaryForeground: 'oklch(0.97 0.014 254.604)',
    secondary: 'oklch(0.274 0.006 286.033)',
    secondaryForeground: 'oklch(0.985 0 0)',
    chart1: 'oklch(0.809 0.105 251.813)',
    chart2: 'oklch(0.623 0.214 259.815)',
    chart3: 'oklch(0.546 0.245 262.881)',
    chart4: 'oklch(0.488 0.243 264.376)',
    chart5: 'oklch(0.424 0.199 265.638)',
    sidebarPrimary: 'oklch(0.623 0.214 259.815)',
    sidebarPrimaryForeground: 'oklch(0.97 0.014 254.604)',
  },
};