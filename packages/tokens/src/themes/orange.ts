import type { ThemeOverlayData } from '../contract.ts';

/** Orange — partial light + dark overlay (shadcn/ui registry themes.ts). */
export const orange: ThemeOverlayData = {
  name: 'orange',
  title: 'Orange',
  light: {
    primary: 'oklch(0.553 0.195 38.402)',
    primaryForeground: 'oklch(0.98 0.016 73.684)',
    secondary: 'oklch(0.967 0.001 286.375)',
    secondaryForeground: 'oklch(0.21 0.006 285.885)',
    chart1: 'oklch(0.837 0.128 66.29)',
    chart2: 'oklch(0.705 0.213 47.604)',
    chart3: 'oklch(0.646 0.222 41.116)',
    chart4: 'oklch(0.553 0.195 38.402)',
    chart5: 'oklch(0.47 0.157 37.304)',
    sidebarPrimary: 'oklch(0.646 0.222 41.116)',
    sidebarPrimaryForeground: 'oklch(0.98 0.016 73.684)',
  },
  dark: {
    primary: 'oklch(0.47 0.157 37.304)',
    primaryForeground: 'oklch(0.98 0.016 73.684)',
    secondary: 'oklch(0.274 0.006 286.033)',
    secondaryForeground: 'oklch(0.985 0 0)',
    chart1: 'oklch(0.837 0.128 66.29)',
    chart2: 'oklch(0.705 0.213 47.604)',
    chart3: 'oklch(0.646 0.222 41.116)',
    chart4: 'oklch(0.553 0.195 38.402)',
    chart5: 'oklch(0.47 0.157 37.304)',
    sidebarPrimary: 'oklch(0.705 0.213 47.604)',
    sidebarPrimaryForeground: 'oklch(0.98 0.016 73.684)',
  },
};