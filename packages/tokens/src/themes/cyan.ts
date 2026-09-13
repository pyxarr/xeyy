import type { ThemeOverlayData } from '../contract.ts';

/**
 * Cyan — partial light + dark overlay applied on top of any Base Color.
 * Values transcribed verbatim from shadcn/ui (apps/v4/registry/themes.ts).
 */
export const cyan: ThemeOverlayData = {
  name: 'cyan',
  title: 'Cyan',
  light: {
    primary: 'oklch(0.52 0.105 223.128)',
    primaryForeground: 'oklch(0.984 0.019 200.873)',
    secondary: 'oklch(0.967 0.001 286.375)',
    secondaryForeground: 'oklch(0.21 0.006 285.885)',
    chart1: 'oklch(0.865 0.127 207.078)',
    chart2: 'oklch(0.715 0.143 215.221)',
    chart3: 'oklch(0.609 0.126 221.723)',
    chart4: 'oklch(0.52 0.105 223.128)',
    chart5: 'oklch(0.45 0.085 224.283)',
    sidebarPrimary: 'oklch(0.609 0.126 221.723)',
    sidebarPrimaryForeground: 'oklch(0.984 0.019 200.873)',
  },
  dark: {
    primary: 'oklch(0.45 0.085 224.283)',
    primaryForeground: 'oklch(0.984 0.019 200.873)',
    secondary: 'oklch(0.274 0.006 286.033)',
    secondaryForeground: 'oklch(0.985 0 0)',
    chart1: 'oklch(0.865 0.127 207.078)',
    chart2: 'oklch(0.715 0.143 215.221)',
    chart3: 'oklch(0.609 0.126 221.723)',
    chart4: 'oklch(0.52 0.105 223.128)',
    chart5: 'oklch(0.45 0.085 224.283)',
    sidebarPrimary: 'oklch(0.715 0.143 215.221)',
    sidebarPrimaryForeground: 'oklch(0.302 0.056 229.695)',
  },
};