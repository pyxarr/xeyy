import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { semantic } from "@xeyy/tokens/theme.stylex";

type ButtonVariant =
  "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";

type ButtonSize =
  "default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg";

interface ButtonVariantsProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

type ButtonProps = Omit<ButtonPrimitive.Props, "className" | "style"> &
  ButtonVariantsProps & {
    style?: StyleXStyles;
  };

function buttonVariants({
  variant = "default",
  size = "default",
}: ButtonVariantsProps = {}) {
  return [styles.base, variants[variant], sizes[size]];
}

const styles = stylex.create({
  base: {
    display: "inline-flex",
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    whiteSpace: "nowrap",
    padding: 0,
    borderRadius: `calc(${semantic.radius} - 2px)`,
    border: "1px solid transparent",
    backgroundClip: "padding-box",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    fontWeight: "500",
    transitionProperty: "all",
    transitionDuration: "150ms",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    outlineStyle: "none",
    userSelect: "none",

    ":disabled": {
      pointerEvents: "none",
      opacity: "0.5",
    },

    ":focus-visible": {
      borderColor: semantic.ring,
      boxShadow: `0 0 0 3px color-mix(in oklab, ${semantic.ring} 50%, transparent)`,
    },

    '[aria-invalid="true"]': {
      borderColor: semantic.destructive,
      boxShadow: `0 0 0 3px color-mix(in oklab, ${semantic.destructive} 20%, transparent)`,
    },

    ":active:not([aria-haspopup])": {
      translate: "0 1px",
    },

    "@media (prefers-color-scheme: dark)": {
      '[aria-invalid="true"]': {
        borderColor: `color-mix(in oklab, ${semantic.destructive} 50%, transparent)`,
        boxShadow: `0 0 0 3px color-mix(in oklab, ${semantic.destructive} 40%, transparent)`,
      },
    },
  },
});

const variants = stylex.create({
  default: {
    backgroundColor: semantic.primary,
    color: semantic.primaryForeground,

    ":hover": {
      backgroundColor: `color-mix(in oklab, ${semantic.primary} 80%, transparent)`,
    },
  },

  outline: {
    borderColor: semantic.border,
    backgroundColor: semantic.background,
    boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",

    ":hover": {
      backgroundColor: semantic.muted,
      color: semantic.foreground,
    },

    '[aria-expanded="true"]': {
      backgroundColor: semantic.muted,
      color: semantic.foreground,
    },

    "@media (prefers-color-scheme: dark)": {
      backgroundColor: `color-mix(in oklab, ${semantic.input} 30%, transparent)`,
      borderColor: semantic.input,

      ":hover": {
        backgroundColor: `color-mix(in oklab, ${semantic.input} 50%, transparent)`,
      },
    },
  },

  secondary: {
    backgroundColor: semantic.secondary,
    color: semantic.secondaryForeground,

    ":hover": {
      backgroundColor: `color-mix(in oklch, ${semantic.secondary}, ${semantic.foreground} 5%)`,
    },

    '[aria-expanded="true"]': {
      backgroundColor: semantic.secondary,
      color: semantic.secondaryForeground,
    },
  },

  ghost: {
    ":hover": {
      backgroundColor: semantic.muted,
      color: semantic.foreground,
    },

    '[aria-expanded="true"]': {
      backgroundColor: semantic.muted,
      color: semantic.foreground,
    },

    "@media (prefers-color-scheme: dark)": {
      ":hover": {
        backgroundColor: `color-mix(in oklab, ${semantic.muted} 50%, transparent)`,
      },
    },
  },

  destructive: {
    backgroundColor: semantic.destructive,
    color: semantic.primaryForeground,

    ":hover": {
      backgroundColor: `color-mix(in oklab, ${semantic.destructive} 90%, transparent)`,
    },

    ":focus-visible": {
      boxShadow: `0 0 0 3px color-mix(in oklab, ${semantic.destructive} 40%, transparent)`,
    },

    "@media (prefers-color-scheme: dark)": {
      ":hover": {
        backgroundColor: `color-mix(in oklab, ${semantic.destructive} 80%, transparent)`,
      },

      ":focus-visible": {
        boxShadow: `0 0 0 3px color-mix(in oklab, ${semantic.destructive} 40%, transparent)`,
      },
    },
  },

  link: {
    color: semantic.primary,
    textUnderlineOffset: "4px",

    ":hover": {
      textDecorationLine: "underline",
    },
  },
});

const sizes = stylex.create({
  default: {
    height: "2.25rem",
    gap: "0.375rem",
    paddingInline: "0.625rem",

    ':has([data-icon="inline-end"])': {
      paddingRight: "0.5rem",
    },

    ':has([data-icon="inline-start"])': {
      paddingLeft: "0.5rem",
    },
  },

  xs: {
    height: "1.5rem",
    gap: "0.25rem",
    borderRadius: `min(calc(${semantic.radius} - 2px), 8px)`,
    paddingInline: "0.5rem",
    fontSize: "0.75rem",
    lineHeight: "1rem",

    ':has([data-icon="inline-end"])': {
      paddingRight: "0.375rem",
    },

    ':has([data-icon="inline-start"])': {
      paddingLeft: "0.375rem",
    },
  },

  sm: {
    height: "2rem",
    gap: "0.25rem",
    borderRadius: `min(calc(${semantic.radius} - 2px), 10px)`,
    paddingInline: "0.625rem",

    ':has([data-icon="inline-end"])': {
      paddingRight: "0.375rem",
    },

    ':has([data-icon="inline-start"])': {
      paddingLeft: "0.375rem",
    },
  },

  lg: {
    height: "2.5rem",
    gap: "0.375rem",
    paddingInline: "0.625rem",

    ':has([data-icon="inline-end"])': {
      paddingRight: "0.5rem",
    },

    ':has([data-icon="inline-start"])': {
      paddingLeft: "0.5rem",
    },
  },

  icon: {
    height: "2.25rem",
    width: "2.25rem",
  },

  "icon-xs": {
    height: "1.5rem",
    width: "1.5rem",
    borderRadius: `min(calc(${semantic.radius} - 2px), 8px)`,
  },

  "icon-sm": {
    height: "2rem",
    width: "2rem",
    borderRadius: `min(calc(${semantic.radius} - 2px), 10px)`,
  },

  "icon-lg": {
    height: "2.5rem",
    width: "2.5rem",
  },
});

function Button({
  style,
  variant = "default",
  size = "default",
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      {...props}
      {...stylex.props(...buttonVariants({ variant, size }), style)}
    />
  );
}

export { Button, buttonVariants };
export type { ButtonVariant, ButtonSize, ButtonVariantsProps, ButtonProps };
