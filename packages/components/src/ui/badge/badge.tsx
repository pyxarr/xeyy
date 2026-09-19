import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { semantic } from "@xeyy/tokens/theme.stylex";

type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "ghost"
  | "link";

type BadgeProps = Omit<useRender.ComponentProps<"span">, "className" | "style"> & {
  variant?: BadgeVariant;
  style?: StyleXStyles;
};

function badgeVariants({ variant = "default" }: { variant?: BadgeVariant } = {}) {
  return [styles.base, variantStyles[variant]];
}

const styles = stylex.create({
  base: {
    display: "inline-flex",
    width: "fit-content",
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    whiteSpace: "nowrap",
    height: "1.25rem",
    gap: "0.25rem",
    borderRadius: "2rem",
    border: "1px solid transparent",
    paddingInline: "0.5rem",
    paddingBlock: "0.125rem",
    fontSize: "0.75rem",
    fontWeight: "500",
    transitionProperty: "all",
    transitionDuration: "150ms",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",

    ':has([data-icon="inline-end"])': {
      paddingRight: "0.375rem",
    },

    ':has([data-icon="inline-start"])': {
      paddingLeft: "0.375rem",
    },

    ":focus-visible": {
      borderColor: semantic.ring,
      boxShadow: `0 0 0 3px color-mix(in oklab, ${semantic.ring} 50%, transparent)`,
    },

    '[aria-invalid="true"]': {
      borderColor: semantic.destructive,
      boxShadow: `0 0 0 3px color-mix(in oklab, ${semantic.destructive} 20%, transparent)`,
    },

    "@media (prefers-color-scheme: dark)": {
      '[aria-invalid="true"]': {
        boxShadow: `0 0 0 3px color-mix(in oklab, ${semantic.destructive} 40%, transparent)`,
      },
    },
  },
});

const variantStyles = stylex.create({
  default: {
    backgroundColor: semantic.primary,
    color: semantic.primaryForeground,

    ":where(:has(a:hover))": {
      backgroundColor: `color-mix(in oklab, ${semantic.primary} 80%, transparent)`,
    },
  },

  secondary: {
    backgroundColor: semantic.secondary,
    color: semantic.secondaryForeground,

    ":where(:has(a:hover))": {
      backgroundColor: `color-mix(in oklab, ${semantic.secondary} 80%, transparent)`,
    },
  },

  destructive: {
    backgroundColor: semantic.destructive,
    color: semantic.primaryForeground,

    ":where(:has(a:hover))": {
      backgroundColor: `color-mix(in oklab, ${semantic.destructive} 80%, transparent)`,
    },

    ":focus-visible": {
      boxShadow: `0 0 0 3px color-mix(in oklab, ${semantic.destructive} 40%, transparent)`,
    },

    "@media (prefers-color-scheme: dark)": {
      ":focus-visible": {
        boxShadow: `0 0 0 3px color-mix(in oklab, ${semantic.destructive} 40%, transparent)`,
      },
    },
  },

  outline: {
    borderColor: semantic.border,
    color: semantic.foreground,

    ":where(:has(a:hover))": {
      backgroundColor: semantic.muted,
      color: semantic.mutedForeground,
    },
  },

  ghost: {
    ":hover": {
      backgroundColor: semantic.muted,
      color: semantic.mutedForeground,
    },

    "@media (prefers-color-scheme: dark)": {
      ":hover": {
        backgroundColor: `color-mix(in oklab, ${semantic.muted} 50%, transparent)`,
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

function Badge({
  variant = "default",
  style,
  render,
  ...props
}: BadgeProps) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      stylex.props(...badgeVariants({ variant }), style),
      props,
    ),
    render,
    state: { slot: "badge", variant },
  });
}

export { Badge, badgeVariants };
export type { BadgeVariant, BadgeProps };