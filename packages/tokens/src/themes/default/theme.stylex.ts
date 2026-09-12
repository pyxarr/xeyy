import * as stylex from '@stylexjs/stylex';

export const colors = stylex.defineVars({
    white: '#ffffff',
    black: '#000000',

    neutral50: '#fafafa',
    neutral100: '#f5f5f5',
    neutral200: '#e5e5e5',
    neutral300: '#d4d4d4',
    neutral400: '#a3a3a3',
    neutral500: '#737373',
    neutral600: '#525252',
    neutral700: '#404040',
    neutral800: '#262626',
    neutral900: '#171717',

    primary50: '#eff6ff',
    primary100: '#dbeafe',
    primary500: '#3b82f6',
    primary600: '#2563eb',
    primary700: '#1d4ed8',

    success500: '#22c55e',
    warning500: '#f59e0b',
    destructive500: '#dc2626',
});

export const spacing = stylex.defineVars({
    0: '0px',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
});

export const radii = stylex.defineVars({
    none: '0px',
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    full: '9999px',
});

export const semantic = stylex.defineVars({
    background: colors.white,
    surface: colors.neutral50,

    foreground: colors.neutral900,
    foregroundMuted: colors.neutral500,

    border: colors.neutral200,
    borderStrong: colors.neutral400,

    primary: colors.primary600,
    primaryForeground: colors.white,

    destructive: colors.destructive500,
    destructiveForeground: colors.white,
    success: colors.success500,
    warning: colors.warning500,

    focusRing: colors.primary500,
});

export const darkTheme = stylex.createTheme(semantic, {
    background: colors.neutral900,
    surface: colors.neutral800,

    foreground: colors.white,
    foregroundMuted: colors.neutral400,

    border: colors.neutral700,
    borderStrong: colors.neutral600,

    primary: colors.primary500,
    primaryForeground: colors.white,

    destructive: colors.destructive500,
    destructiveForeground: colors.white,
    success: colors.success500,
    warning: colors.warning500,

    focusRing: colors.primary500,
});