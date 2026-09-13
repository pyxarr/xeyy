import type { ThemeOverlayData } from '../contract.ts';

/**
 * Rose — partial light + dark overlay (shadcn/ui registry themes.ts).
 * Note: shadcn also overrides `sidebar` in dark; kept verbatim.
 */
export const rose: ThemeOverlayData = {
  name: 'rose',
  title: 'Rose',
  light: {
    primary: 'oklch(0.514 0.222 16.935)',
    primaryForeground: 'oklch(0.969 0.015 12.422)',
    secondary: 'oklch(0.967 0.001 286.375)',
    secondaryForeground: 'oklch(0.21 0.006 285.885)',
    chart1: 'oklch(0.81 0.117 11.638)',
    chart2: 'oklch(0.645 0.246 16.439)',
    chart3: 'oklch(0.586 0.253 17.585)',
    chart4: 'oklch(0.514 0.222 16.935)',
    chart5: 'oklch(0.455 0.188 13.697)',
    sidebarPrimary: 'oklch(0.586 0.253 17.585)',
    sidebarPrimaryForeground: 'oklch(0.969 0.015 12.422)',
  },
  dark: {
    primary: 'oklch(0.455 0.188 13.697)',
    primaryForeground: 'oklch(0.969 0.015 12.422)',
    secondary: 'oklch(0.274 0.006 286.033)',
    secondaryForeground: 'oklch(0.985 0 0)',
    chart1: 'oklch(0.81 0.117 11.638)',
    chart2: 'oklch(0.645 0.246 16.439)',
    chart3: 'oklch(0.586 0.253 17.585)',
    chart4: 'oklch(0.514 0.222 16.935)',
    chart5: 'oklch(0.455 0.188 13.697)',
    sidebar: 'oklch(0.21 0.006 285.885)',
    sidebarPrimary: 'oklch(0.645 0.246 16.439)',
    sidebarPrimaryForeground: 'oklch(0.969 0.015 12.422)',
  },
};