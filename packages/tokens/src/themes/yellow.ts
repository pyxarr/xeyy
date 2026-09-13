import type { ThemeOverlayData } from '../contract.ts';

/** Yellow — partial light + dark overlay (shadcn/ui registry themes.ts). */
export const yellow: ThemeOverlayData = {
  name: 'yellow',
  title: 'Yellow',
  light: {
    primary: 'oklch(0.852 0.199 91.936)',
    primaryForeground: 'oklch(0.421 0.095 57.708)',
    secondary: 'oklch(0.967 0.001 286.375)',
    secondaryForeground: 'oklch(0.21 0.006 285.885)',
    chart1: 'oklch(0.905 0.182 98.111)',
    chart2: 'oklch(0.795 0.184 86.047)',
    chart3: 'oklch(0.681 0.162 75.834)',
    chart4: 'oklch(0.554 0.135 66.442)',
    chart5: 'oklch(0.476 0.114 61.907)',
    sidebarPrimary: 'oklch(0.681 0.162 75.834)',
    sidebarPrimaryForeground: 'oklch(0.987 0.026 102.212)',
  },
  dark: {
    primary: 'oklch(0.795 0.184 86.047)',
    primaryForeground: 'oklch(0.421 0.095 57.708)',
    secondary: 'oklch(0.274 0.006 286.033)',
    secondaryForeground: 'oklch(0.985 0 0)',
    chart1: 'oklch(0.905 0.182 98.111)',
    chart2: 'oklch(0.795 0.184 86.047)',
    chart3: 'oklch(0.681 0.162 75.834)',
    chart4: 'oklch(0.554 0.135 66.442)',
    chart5: 'oklch(0.476 0.114 61.907)',
    sidebarPrimary: 'oklch(0.795 0.184 86.047)',
    sidebarPrimaryForeground: 'oklch(0.987 0.026 102.212)',
  },
};