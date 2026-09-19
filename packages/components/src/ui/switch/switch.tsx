import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import { semantic } from "@xeyy/tokens/theme.stylex";

type SwitchSize = "sm" | "default";

type SwitchProps = Omit<SwitchPrimitive.Root.Props, "className" | "style"> & {
  size?: SwitchSize;
  style?: StyleXStyles;
};

const styles = stylex.create({
  root: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    flexShrink: 0,
    borderRadius: "9999px",
    border: "1px solid transparent",
    outlineStyle: "none",
    transitionProperty: "all",
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
    },

    "[data-unchecked]": {
      backgroundColor: semantic.input,
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

    "@media (prefers-color-scheme: dark)": {
      "[data-unchecked]": {
        backgroundColor: `color-mix(in oklab, ${semantic.input} 80%, transparent)`,
      },

      '[aria-invalid="true"]': {
        borderColor: `color-mix(in oklab, ${semantic.destructive} 50%, transparent)`,
        boxShadow: `0 0 0 3px color-mix(in oklab, ${semantic.destructive} 40%, transparent)`,
      },
    },
  },

  thumb: {
    pointerEvents: "none",
    display: "block",
    borderRadius: "9999px",
    backgroundColor: semantic.background,
    boxShadow: "none",
    transitionProperty: "translate, background-color",
    transitionDuration: "150ms",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",

    "[data-checked]": {
      translate: "calc(100% - 2px) 0",
    },

    "[data-unchecked]": {
      translate: "0 0",
    },

    "@media (prefers-color-scheme: dark)": {
      "[data-unchecked]": {
        backgroundColor: semantic.foreground,
      },

      "[data-checked]": {
        backgroundColor: semantic.primaryForeground,
      },
    },
  },
});

const sizeStyles = stylex.create({
  sm: {
    width: "24px",
    height: "14px",
  },

  default: {
    width: "32px",
    height: "18.4px",
  },
});

const thumbSizes = stylex.create({
  sm: {
    width: "0.75rem",
    height: "0.75rem",
  },

  default: {
    width: "1rem",
    height: "1rem",
  },
});

function Switch({ style, size = "default", ...props }: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      {...props}
      {...stylex.props(styles.root, sizeStyles[size], style)}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        {...stylex.props(styles.thumb, thumbSizes[size])}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
export type { SwitchSize, SwitchProps };