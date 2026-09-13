import type { ThemeOverlayData } from '../contract.ts';

/** Red — partial light + dark overlay (shadcn/ui registry themes.ts). */
export const red: ThemeOverlayData = {
  name: 'red',
  title: 'Red',
  light: {
    primary: 'oklch(0.505 0.213 27.518)',
    primaryForeground: 'oklch(0.971 0.013 17.38)',
    secondary: 'oklch(0.967 0.001 286.375)',
    secondaryForeground: 'oklch(0.21 0.006 285.885)',
    chart1: 'oklch(0.808 0.114 19.571)',
    chart2: 'oklch(0.637 0.237 25.331)',
    chart3: 'oklch(0.577 0.245 27.325)',
    chart4: 'oklch(0.505 0.213 27.518)',
    chart5: 'oklch(0.444 0.177 26.899)',
    sidebarPrimary: 'oklch(0.577 0.245 27.325)',
    sidebarPrimaryForeground: 'oklch(0.971 0.013 17.38)',
  },
  dark: {
    primary: 'oklch(0.444 0.177 26.899)',
    primaryForeground: 'oklch(0.971 0.013 17.38)',
    secondary: 'oklch(0.274 0.006 286.033)',
    secondaryForeground: 'oklch(0.985 0 0)',
    chart1: 'oklch(0.808 0.114 19.571)',
    chart2: 'oklch(0.637 0.237 25.331)',
    chart3: 'oklch(0.577 0.245 27.325)',
    chart4: 'oklch(0.505 0.213 27.518)',
    chart5: 'oklch(0.444 0.177 26.899)',
    sidebarPrimary: 'oklch(0.637 0.237 25.331)',
    sidebarPrimaryForeground: 'oklch(0.971 0.013 17.38)',
  },
};