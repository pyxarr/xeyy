import type { ThemeOverlayData } from '../contract.ts';

/** Purple — partial light + dark overlay (shadcn/ui registry themes.ts). */
export const purple: ThemeOverlayData = {
  name: 'purple',
  title: 'Purple',
  light: {
    primary: 'oklch(0.496 0.265 301.924)',
    primaryForeground: 'oklch(0.977 0.014 308.299)',
    secondary: 'oklch(0.967 0.001 286.375)',
    secondaryForeground: 'oklch(0.21 0.006 285.885)',
    chart1: 'oklch(0.827 0.119 306.383)',
    chart2: 'oklch(0.627 0.265 303.9)',
    chart3: 'oklch(0.558 0.288 302.321)',
    chart4: 'oklch(0.496 0.265 301.924)',
    chart5: 'oklch(0.438 0.218 303.724)',
    sidebarPrimary: 'oklch(0.558 0.288 302.321)',
    sidebarPrimaryForeground: 'oklch(0.977 0.014 308.299)',
  },
  dark: {
    primary: 'oklch(0.438 0.218 303.724)',
    primaryForeground: 'oklch(0.977 0.014 308.299)',
    secondary: 'oklch(0.274 0.006 286.033)',
    secondaryForeground: 'oklch(0.985 0 0)',
    chart1: 'oklch(0.827 0.119 306.383)',
    chart2: 'oklch(0.627 0.265 303.9)',
    chart3: 'oklch(0.558 0.288 302.321)',
    chart4: 'oklch(0.496 0.265 301.924)',
    chart5: 'oklch(0.438 0.218 303.724)',
    sidebarPrimary: 'oklch(0.627 0.265 303.9)',
    sidebarPrimaryForeground: 'oklch(0.977 0.014 308.299)',
  },
};