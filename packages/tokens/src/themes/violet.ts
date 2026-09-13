import type { ThemeOverlayData } from '../contract.ts';

/** Violet — partial light + dark overlay (shadcn/ui registry themes.ts). */
export const violet: ThemeOverlayData = {
  name: 'violet',
  title: 'Violet',
  light: {
    primary: 'oklch(0.491 0.27 292.581)',
    primaryForeground: 'oklch(0.969 0.016 293.756)',
    secondary: 'oklch(0.967 0.001 286.375)',
    secondaryForeground: 'oklch(0.21 0.006 285.885)',
    chart1: 'oklch(0.811 0.111 293.571)',
    chart2: 'oklch(0.606 0.25 292.717)',
    chart3: 'oklch(0.541 0.281 293.009)',
    chart4: 'oklch(0.491 0.27 292.581)',
    chart5: 'oklch(0.432 0.232 292.759)',
    sidebarPrimary: 'oklch(0.541 0.281 293.009)',
    sidebarPrimaryForeground: 'oklch(0.969 0.016 293.756)',
  },
  dark: {
    primary: 'oklch(0.432 0.232 292.759)',
    primaryForeground: 'oklch(0.969 0.016 293.756)',
    secondary: 'oklch(0.274 0.006 286.033)',
    secondaryForeground: 'oklch(0.985 0 0)',
    chart1: 'oklch(0.811 0.111 293.571)',
    chart2: 'oklch(0.606 0.25 292.717)',
    chart3: 'oklch(0.541 0.281 293.009)',
    chart4: 'oklch(0.491 0.27 292.581)',
    chart5: 'oklch(0.432 0.232 292.759)',
    sidebarPrimary: 'oklch(0.606 0.25 292.717)',
    sidebarPrimaryForeground: 'oklch(0.969 0.016 293.756)',
  },
};