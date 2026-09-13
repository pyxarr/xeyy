import type { ThemeOverlayData } from '../contract.ts';

/** Pink — partial light + dark overlay (shadcn/ui registry themes.ts). */
export const pink: ThemeOverlayData = {
  name: 'pink',
  title: 'Pink',
  light: {
    primary: 'oklch(0.525 0.223 3.958)',
    primaryForeground: 'oklch(0.971 0.014 343.198)',
    secondary: 'oklch(0.967 0.001 286.375)',
    secondaryForeground: 'oklch(0.21 0.006 285.885)',
    chart1: 'oklch(0.823 0.12 346.018)',
    chart2: 'oklch(0.656 0.241 354.308)',
    chart3: 'oklch(0.592 0.249 0.584)',
    chart4: 'oklch(0.525 0.223 3.958)',
    chart5: 'oklch(0.459 0.187 3.815)',
    sidebarPrimary: 'oklch(0.592 0.249 0.584)',
    sidebarPrimaryForeground: 'oklch(0.971 0.014 343.198)',
  },
  dark: {
    primary: 'oklch(0.459 0.187 3.815)',
    primaryForeground: 'oklch(0.971 0.014 343.198)',
    secondary: 'oklch(0.274 0.006 286.033)',
    secondaryForeground: 'oklch(0.985 0 0)',
    chart1: 'oklch(0.823 0.12 346.018)',
    chart2: 'oklch(0.656 0.241 354.308)',
    chart3: 'oklch(0.592 0.249 0.584)',
    chart4: 'oklch(0.525 0.223 3.958)',
    chart5: 'oklch(0.459 0.187 3.815)',
    sidebarPrimary: 'oklch(0.656 0.241 354.308)',
    sidebarPrimaryForeground: 'oklch(0.971 0.014 343.198)',
  },
};