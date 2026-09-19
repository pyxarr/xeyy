import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { Check, Minus } from "lucide-react";
import { semantic } from "@xeyy/tokens/theme.stylex";

type CheckboxProps = Omit<CheckboxPrimitive.Root.Props, "className" | "style"> & {
  style?: StyleXStyles;
};

const styles = stylex.create({
  root: {
    position: "relative",
    display: "flex",
    width: "1rem",
    height: "1rem",
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "4px",
    border: "1px solid",
    borderColor: semantic.input,
    outlineStyle: "none",
    transitionProperty: "background-color, border-color, color, box-shadow",
    transitionDuration: "150ms",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",

    "::after": {
      content: '""',
      position: "absolute",
      insetInline: "-12px",
      insetBlock: "-8px",
    },

    "[data-checked]": {
      backgroundColor: semantic.primary,
      borderColor: semantic.primary,
      color: semantic.primaryForeground,
    },

    "[data-indeterminate]": {
      backgroundColor: semantic.primary,
      borderColor: semantic.primary,
      color: semantic.primaryForeground,
    },

    "[data-disabled]": {
      cursor: "not-allowed",
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

    '[aria-invalid="true"][data-checked]': {
      borderColor: semantic.primary,
    },

    "@media (prefers-color-scheme: dark)": {
      backgroundColor: `color-mix(in oklab, ${semantic.input} 30%, transparent)`,

      '[aria-invalid="true"]': {
        borderColor: `color-mix(in oklab, ${semantic.destructive} 50%, transparent)`,
        boxShadow: `0 0 0 3px color-mix(in oklab, ${semantic.destructive} 40%, transparent)`,
      },

      '[aria-invalid="true"][data-checked]': {
        borderColor: semantic.primary,
      },
    },
  },

  indicator: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "currentColor",
  },
});

function Checkbox({ style, indeterminate = false, ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      indeterminate={indeterminate}
      {...props}
      {...stylex.props(styles.root, style)}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        {...stylex.props(styles.indicator)}
      >
        {indeterminate ? (
          <Minus size={14} strokeWidth={3} aria-hidden="true" />
        ) : (
          <Check size={14} strokeWidth={3} aria-hidden="true" />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
export type { CheckboxProps };