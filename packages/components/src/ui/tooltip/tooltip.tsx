import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";
import { semantic } from "@xeyy/tokens/theme.stylex";

const styles = stylex.create({
  positioner: {
    isolation: "isolate",
    zIndex: 50,
  },

  content: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.375rem",
    width: "fit-content",
    maxWidth: "20rem",
    paddingBlock: "0.375rem",
    paddingInline: "0.75rem",
    borderRadius: `calc(${semantic.radius} - 4px)`,
    backgroundColor: semantic.primary,
    color: semantic.primaryForeground,
    boxShadow:
      "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    transformOrigin: "var(--transform-origin)",
    zIndex: 50,

    "@media (prefers-reduced-motion: no-preference)": {
      transitionProperty: "translate, scale, opacity",
      transitionDuration: "150ms",
      transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",

      "[data-starting-style]": {
        opacity: 0,
        scale: "0.95",
      },

      "[data-ending-style]": {
        opacity: 0,
        scale: "0.95",
      },
    },
  },

  arrow: {
    width: "0.625rem",
    height: "0.625rem",
    borderRadius: "2px",
    backgroundColor: semantic.primary,
    rotate: "45deg",
    translate: "0 calc(-50% - 2px)",
  },
});

type TooltipProps = Omit<TooltipPrimitive.Root.Props, "className" | "style"> & {
  style?: StyleXStyles;
};

type TooltipProviderProps = TooltipPrimitive.Provider.Props;

type TooltipTriggerProps = TooltipPrimitive.Trigger.Props;

type TooltipContentProps = Omit<
  TooltipPrimitive.Popup.Props,
  "className" | "style"
> &
  Pick<
    TooltipPrimitive.Positioner.Props,
    "side" | "align" | "sideOffset" | "alignOffset"
  > & {
    style?: StyleXStyles;
  };

function TooltipProvider({ delay = 0, ...props }: TooltipProviderProps) {
  return <TooltipPrimitive.Provider delay={delay} {...props} />;
}

function Tooltip({ ...props }: TooltipProps) {
  return <TooltipPrimitive.Root {...props} />;
}

function TooltipTrigger({ ...props }: TooltipTriggerProps) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  style,
  side = "top",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  children,
  ...props
}: TooltipContentProps) {
  return (
    <TooltipPrimitive.Portal data-slot="tooltip-portal">
      <TooltipPrimitive.Positioner
        data-slot="tooltip-positioner"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        {...stylex.props(styles.positioner)}
      >
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          {...props}
          {...stylex.props(styles.content, style)}
        >
          {children}
          <TooltipPrimitive.Arrow
            data-slot="tooltip-arrow"
            {...stylex.props(styles.arrow)}
          />
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  );
}

export {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
};

export type {
  TooltipProps,
  TooltipProviderProps,
  TooltipTriggerProps,
  TooltipContentProps,
};