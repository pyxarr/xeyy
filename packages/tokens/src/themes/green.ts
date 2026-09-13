import type { ThemeOverlayData } from '../contract.ts';

/** Green — partial light + dark overlay (shadcn/ui registry themes.ts). */
export const green: ThemeOverlayData = {
  name: 'green',
  title: 'Green',
  light: {
    primary: 'oklch(0.527 0.154 150.069)',
    primaryForeground: 'oklch(0.982 0.018 155.826)',
    secondary: 'oklch(0.967 0.001 286.375)',
    secondaryForeground: 'oklch(0.21 0.006 285.885)',
    chart1: 'oklch(0.871 0.15 154.449)',
    chart2: 'oklch(0.723 0.219 149.579)',
    chart3: 'oklch(0.627 0.194 149.214)',
    chart4: 'oklch(0.527 0.154 150.069)',
    chart5: 'oklch(0.448 0.119 151.328)',
    sidebarPrimary: 'oklch(0.627 0.194 149.214)',
    sidebarPrimaryForeground: 'oklch(0.982 0.018 155.826)',
  },
  dark: {
    primary: 'oklch(0.448 0.119 151.328)',
    primaryForeground: 'oklch(0.982 0.018 155.826)',
    secondary: 'oklch(0.274 0.006 286.033)',
    secondaryForeground: 'oklch(0.985 0 0)',
    chart1: 'oklch(0.871 0.15 154.449)',
    chart2: 'oklch(0.723 0.219 149.579)',
    chart3: 'oklch(0.627 0.194 149.214)',
    chart4: 'oklch(0.527 0.154 150.069)',
    chart5: 'oklch(0.448 0.119 151.328)',
    sidebarPrimary: 'oklch(0.723 0.219 149.579)',
    sidebarPrimaryForeground: 'oklch(0.982 0.018 155.826)',
  },
};