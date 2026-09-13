import type { ThemeOverlayData } from '../contract.ts';

/** Emerald — partial light + dark overlay (shadcn/ui registry themes.ts). */
export const emerald: ThemeOverlayData = {
  name: 'emerald',
  title: 'Emerald',
  light: {
    primary: 'oklch(0.508 0.118 165.612)',
    primaryForeground: 'oklch(0.979 0.021 166.113)',
    secondary: 'oklch(0.967 0.001 286.375)',
    secondaryForeground: 'oklch(0.21 0.006 285.885)',
    chart1: 'oklch(0.845 0.143 164.978)',
    chart2: 'oklch(0.696 0.17 162.48)',
    chart3: 'oklch(0.596 0.145 163.225)',
    chart4: 'oklch(0.508 0.118 165.612)',
    chart5: 'oklch(0.432 0.095 166.913)',
    sidebarPrimary: 'oklch(0.596 0.145 163.225)',
    sidebarPrimaryForeground: 'oklch(0.979 0.021 166.113)',
  },
  dark: {
    primary: 'oklch(0.432 0.095 166.913)',
    primaryForeground: 'oklch(0.979 0.021 166.113)',
    secondary: 'oklch(0.274 0.006 286.033)',
    secondaryForeground: 'oklch(0.985 0 0)',
    chart1: 'oklch(0.845 0.143 164.978)',
    chart2: 'oklch(0.696 0.17 162.48)',
    chart3: 'oklch(0.596 0.145 163.225)',
    chart4: 'oklch(0.508 0.118 165.612)',
    chart5: 'oklch(0.432 0.095 166.913)',
    sidebarPrimary: 'oklch(0.696 0.17 162.48)',
    sidebarPrimaryForeground: 'oklch(0.262 0.051 172.552)',
  },
};