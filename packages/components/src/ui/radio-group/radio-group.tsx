import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { Radio as RadioPrimitive } from "@base-ui/react/radio";
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group";
import { semantic } from "@xeyy/tokens/theme.stylex";

type RadioGroupProps = Omit<
  RadioGroupPrimitive.Props,
  "className" | "style"
> & {
  style?: StyleXStyles;
};

type RadioGroupItemProps = Omit<
  RadioPrimitive.Root.Props,
  "className" | "style"
> & {
  style?: StyleXStyles;
};

const styles = stylex.create({
  group: {
    display: "grid",
    gap: "0.5rem",
    width: "100%",
  },

  root: {
    position: "relative",
    display: "flex",
    width: "1rem",
    height: "1rem",
    flexShrink: "0",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "9999px",
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
    display: "grid",
    placeContent: "center",
  },

  dot: {
    width: "0.5rem",
    height: "0.5rem",
    borderRadius: "9999px",
    backgroundColor: semantic.primaryForeground,
  },
});

function RadioGroup({ style, ...props }: RadioGroupProps) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      {...props}
      {...stylex.props(styles.group, style)}
    />
  );
}

function RadioGroupItem({ style, ...props }: RadioGroupItemProps) {
  return (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      {...props}
      {...stylex.props(styles.root, style)}
    >
      <RadioPrimitive.Indicator
        data-slot="radio-group-indicator"
        {...stylex.props(styles.indicator)}
      >
        <span {...stylex.props(styles.dot)} />
      </RadioPrimitive.Indicator>
    </RadioPrimitive.Root>
  );
}

export { RadioGroup, RadioGroupItem };
export type { RadioGroupProps, RadioGroupItemProps };