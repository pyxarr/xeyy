import type { ThemeOverlayData } from '../contract.ts';

/** Sky — partial light + dark overlay (shadcn/ui registry themes.ts). */
export const sky: ThemeOverlayData = {
  name: 'sky',
  title: 'Sky',
  light: {
    primary: 'oklch(0.5 0.134 242.749)',
    primaryForeground: 'oklch(0.977 0.013 236.62)',
    secondary: 'oklch(0.967 0.001 286.375)',
    secondaryForeground: 'oklch(0.21 0.006 285.885)',
    chart1: 'oklch(0.828 0.111 230.318)',
    chart2: 'oklch(0.685 0.169 237.323)',
    chart3: 'oklch(0.588 0.158 241.966)',
    chart4: 'oklch(0.5 0.134 242.749)',
    chart5: 'oklch(0.443 0.11 240.79)',
    sidebarPrimary: 'oklch(0.588 0.158 241.966)',
    sidebarPrimaryForeground: 'oklch(0.977 0.013 236.62)',
  },
  dark: {
    primary: 'oklch(0.443 0.11 240.79)',
    primaryForeground: 'oklch(0.977 0.013 236.62)',
    secondary: 'oklch(0.274 0.006 286.033)',
    secondaryForeground: 'oklch(0.985 0 0)',
    chart1: 'oklch(0.828 0.111 230.318)',
    chart2: 'oklch(0.685 0.169 237.323)',
    chart3: 'oklch(0.588 0.158 241.966)',
    chart4: 'oklch(0.5 0.134 242.749)',
    chart5: 'oklch(0.443 0.11 240.79)',
    sidebarPrimary: 'oklch(0.685 0.169 237.323)',
    sidebarPrimaryForeground: 'oklch(0.293 0.066 243.157)',
  },
};