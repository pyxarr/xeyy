import type { ThemeOverlayData } from '../contract.ts';

/** Indigo — partial light + dark overlay (shadcn/ui registry themes.ts). */
export const indigo: ThemeOverlayData = {
  name: 'indigo',
  title: 'Indigo',
  light: {
    primary: 'oklch(0.457 0.24 277.023)',
    primaryForeground: 'oklch(0.962 0.018 272.314)',
    secondary: 'oklch(0.967 0.001 286.375)',
    secondaryForeground: 'oklch(0.21 0.006 285.885)',
    chart1: 'oklch(0.785 0.115 274.713)',
    chart2: 'oklch(0.585 0.233 277.117)',
    chart3: 'oklch(0.511 0.262 276.966)',
    chart4: 'oklch(0.457 0.24 277.023)',
    chart5: 'oklch(0.398 0.195 277.366)',
    sidebarPrimary: 'oklch(0.511 0.262 276.966)',
    sidebarPrimaryForeground: 'oklch(0.962 0.018 272.314)',
  },
  dark: {
    primary: 'oklch(0.398 0.195 277.366)',
    primaryForeground: 'oklch(0.962 0.018 272.314)',
    secondary: 'oklch(0.274 0.006 286.033)',
    secondaryForeground: 'oklch(0.985 0 0)',
    chart1: 'oklch(0.785 0.115 274.713)',
    chart2: 'oklch(0.585 0.233 277.117)',
    chart3: 'oklch(0.511 0.262 276.966)',
    chart4: 'oklch(0.457 0.24 277.023)',
    chart5: 'oklch(0.398 0.195 277.366)',
    sidebarPrimary: 'oklch(0.585 0.233 277.117)',
    sidebarPrimaryForeground: 'oklch(0.962 0.018 272.314)',
  },
};