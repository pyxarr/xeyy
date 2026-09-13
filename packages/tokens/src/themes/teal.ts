import type { ThemeOverlayData } from '../contract.ts';

/** Teal — partial light + dark overlay (shadcn/ui registry themes.ts). */
export const teal: ThemeOverlayData = {
  name: 'teal',
  title: 'Teal',
  light: {
    primary: 'oklch(0.511 0.096 186.391)',
    primaryForeground: 'oklch(0.984 0.014 180.72)',
    secondary: 'oklch(0.967 0.001 286.375)',
    secondaryForeground: 'oklch(0.21 0.006 285.885)',
    chart1: 'oklch(0.855 0.138 181.071)',
    chart2: 'oklch(0.704 0.14 182.503)',
    chart3: 'oklch(0.6 0.118 184.704)',
    chart4: 'oklch(0.511 0.096 186.391)',
    chart5: 'oklch(0.437 0.078 188.216)',
    sidebarPrimary: 'oklch(0.6 0.118 184.704)',
    sidebarPrimaryForeground: 'oklch(0.984 0.014 180.72)',
  },
  dark: {
    primary: 'oklch(0.437 0.078 188.216)',
    primaryForeground: 'oklch(0.984 0.014 180.72)',
    secondary: 'oklch(0.274 0.006 286.033)',
    secondaryForeground: 'oklch(0.985 0 0)',
    chart1: 'oklch(0.855 0.138 181.071)',
    chart2: 'oklch(0.704 0.14 182.503)',
    chart3: 'oklch(0.6 0.118 184.704)',
    chart4: 'oklch(0.511 0.096 186.391)',
    chart5: 'oklch(0.437 0.078 188.216)',
    sidebarPrimary: 'oklch(0.704 0.14 182.503)',
    sidebarPrimaryForeground: 'oklch(0.277 0.046 192.524)',
  },
};