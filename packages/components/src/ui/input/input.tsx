import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { Input as InputPrimitive } from "@base-ui/react/input";
import { semantic } from "@xeyy/tokens/theme.stylex";

type InputProps = Omit<InputPrimitive.Props, "className" | "style"> & {
  style?: StyleXStyles;
};

const styles = stylex.create({
  input: {
    width: "100%",
    minWidth: 0,
    outlineStyle: "none",
    height: "2rem",
    borderRadius: "0.5rem",
    border: "1px solid",
    borderColor: semantic.input,
    backgroundColor: "transparent",
    paddingInline: "0.625rem",
    paddingBlock: "0.25rem",
    fontSize: "1rem",
    color: semantic.foreground,
    transitionProperty: "background-color, border-color, color, box-shadow",
    transitionDuration: "150ms",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",

    "::placeholder": {
      color: semantic.mutedForeground,
    },

    "::file-selector-button": {
      display: "inline-flex",
      height: "1.5rem",
      fontSize: "0.875rem",
      fontWeight: "500",
      border: "0",
      backgroundColor: "transparent",
      color: semantic.foreground,
    },

    ":focus-visible": {
      borderColor: semantic.ring,
      boxShadow: `0 0 0 3px color-mix(in oklab, ${semantic.ring} 50%, transparent)`,
    },

    ':disabled': {
      pointerEvents: "none",
      cursor: "not-allowed",
      opacity: "0.5",
      backgroundColor: `color-mix(in oklab, ${semantic.input} 50%, transparent)`,
    },

    '[aria-invalid="true"]': {
      borderColor: semantic.destructive,
      boxShadow: `0 0 0 3px color-mix(in oklab, ${semantic.destructive} 20%, transparent)`,
    },

    "@media (min-width: 48rem)": {
      fontSize: "0.875rem",
    },

    "@media (prefers-color-scheme: dark)": {
      backgroundColor: `color-mix(in oklab, ${semantic.input} 30%, transparent)`,

      ':disabled': {
        backgroundColor: `color-mix(in oklab, ${semantic.input} 80%, transparent)`,
      },

      '[aria-invalid="true"]': {
        borderColor: `color-mix(in oklab, ${semantic.destructive} 50%, transparent)`,
        boxShadow: `0 0 0 3px color-mix(in oklab, ${semantic.destructive} 40%, transparent)`,
      },
    },
  },
});

function Input({ style, ...props }: InputProps) {
  return (
    <InputPrimitive
      data-slot="input"
      {...props}
      {...stylex.props(styles.input, style)}
    />
  );
}

export { Input };
export type { InputProps };