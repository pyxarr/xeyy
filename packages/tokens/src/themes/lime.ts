import type { ThemeOverlayData } from '../contract.ts';

/** Lime — partial light + dark overlay (shadcn/ui registry themes.ts). */
export const lime: ThemeOverlayData = {
  name: 'lime',
  title: 'Lime',
  light: {
    primary: 'oklch(0.841 0.238 128.85)',
    primaryForeground: 'oklch(0.405 0.101 131.063)',
    secondary: 'oklch(0.967 0.001 286.375)',
    secondaryForeground: 'oklch(0.21 0.006 285.885)',
    chart1: 'oklch(0.897 0.196 126.665)',
    chart2: 'oklch(0.768 0.233 130.85)',
    chart3: 'oklch(0.648 0.2 131.684)',
    chart4: 'oklch(0.532 0.157 131.589)',
    chart5: 'oklch(0.453 0.124 130.933)',
    sidebarPrimary: 'oklch(0.648 0.2 131.684)',
    sidebarPrimaryForeground: 'oklch(0.986 0.031 120.757)',
  },
  dark: {
    primary: 'oklch(0.768 0.233 130.85)',
    primaryForeground: 'oklch(0.405 0.101 131.063)',
    secondary: 'oklch(0.274 0.006 286.033)',
    secondaryForeground: 'oklch(0.985 0 0)',
    chart1: 'oklch(0.897 0.196 126.665)',
    chart2: 'oklch(0.768 0.233 130.85)',
    chart3: 'oklch(0.648 0.2 131.684)',
    chart4: 'oklch(0.532 0.157 131.589)',
    chart5: 'oklch(0.453 0.124 130.933)',
    sidebarPrimary: 'oklch(0.768 0.233 130.85)',
    sidebarPrimaryForeground: 'oklch(0.274 0.072 132.109)',
  },
};