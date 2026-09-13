import type { ThemeOverlayData } from '../contract.ts';

/** Fuchsia — partial light + dark overlay (shadcn/ui registry themes.ts). */
export const fuchsia: ThemeOverlayData = {
  name: 'fuchsia',
  title: 'Fuchsia',
  light: {
    primary: 'oklch(0.518 0.253 323.949)',
    primaryForeground: 'oklch(0.977 0.017 320.058)',
    secondary: 'oklch(0.967 0.001 286.375)',
    secondaryForeground: 'oklch(0.21 0.006 285.885)',
    chart1: 'oklch(0.833 0.145 321.434)',
    chart2: 'oklch(0.667 0.295 322.15)',
    chart3: 'oklch(0.591 0.293 322.896)',
    chart4: 'oklch(0.518 0.253 323.949)',
    chart5: 'oklch(0.452 0.211 324.591)',
    sidebarPrimary: 'oklch(0.591 0.293 322.896)',
    sidebarPrimaryForeground: 'oklch(0.977 0.017 320.058)',
  },
  dark: {
    primary: 'oklch(0.452 0.211 324.591)',
    primaryForeground: 'oklch(0.977 0.017 320.058)',
    secondary: 'oklch(0.274 0.006 286.033)',
    secondaryForeground: 'oklch(0.985 0 0)',
    chart1: 'oklch(0.833 0.145 321.434)',
    chart2: 'oklch(0.667 0.295 322.15)',
    chart3: 'oklch(0.591 0.293 322.896)',
    chart4: 'oklch(0.518 0.253 323.949)',
    chart5: 'oklch(0.452 0.211 324.591)',
    sidebarPrimary: 'oklch(0.667 0.295 322.15)',
    sidebarPrimaryForeground: 'oklch(0.977 0.017 320.058)',
  },
};