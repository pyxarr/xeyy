import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import type * as React from "react";
import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { semantic } from "@xeyy/tokens/theme.stylex";

type PopoverProps = PopoverPrimitive.Root.Props;

type PopoverTriggerProps = Omit<
  PopoverPrimitive.Trigger.Props,
  "className" | "style"
> & {
  style?: StyleXStyles;
};

type PopoverContentProps = Omit<
  PopoverPrimitive.Popup.Props,
  "className" | "style"
> &
  Pick<
    PopoverPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  > & {
    style?: StyleXStyles;
  };

type PopoverHeaderProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "className" | "style"
> & {
  style?: StyleXStyles;
};

type PopoverTitleProps = Omit<
  PopoverPrimitive.Title.Props,
  "className" | "style"
> & {
  style?: StyleXStyles;
};

type PopoverDescriptionProps = Omit<
  PopoverPrimitive.Description.Props,
  "className" | "style"
> & {
  style?: StyleXStyles;
};

const styles = stylex.create({
  positioner: {
    zIndex: 50,
    isolation: "isolate",
  },

  content: {
    display: "flex",
    flexDirection: "column",
    gap: "0.625rem",
    padding: "0.625rem",
    width: "18rem",
    zIndex: 50,
    borderRadius: `calc(${semantic.radius} - 2px)`,
    border: "1px solid",
    borderColor: semantic.border,
    backgroundColor: semantic.popover,
    color: semantic.popoverForeground,
    boxShadow:
      "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    outlineStyle: "none",
    transformOrigin: "var(--transform-origin)",
    transitionProperty: "opacity, transform",
    transitionDuration: "100ms",
    transitionTimingFunction: "ease-out",

    '[data-starting-style]': {
      opacity: 0,
      transform: "scale(0.95)",
    },

    '[data-ending-style]': {
      opacity: 0,
      transform: "scale(0.95)",
    },

    "@media (prefers-reduced-motion: reduce)": {
      transitionProperty: "none",

      '[data-starting-style]': {
        opacity: 1,
        transform: "scale(1)",
      },

      '[data-ending-style]': {
        opacity: 1,
        transform: "scale(1)",
      },
    },
  },

  header: {
    display: "flex",
    flexDirection: "column",
    gap: "0.125rem",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
  },

  title: {
    fontWeight: "500",
  },

  description: {
    color: semantic.mutedForeground,
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
  },
});

function Popover(props: PopoverProps) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({ style, ...props }: PopoverTriggerProps) {
  return (
    <PopoverPrimitive.Trigger
      data-slot="popover-trigger"
      {...props}
      {...stylex.props(style)}
    />
  );
}

function PopoverContent({
  style,
  align = "center",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  ...props
}: PopoverContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        data-slot="popover-positioner"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        {...stylex.props(styles.positioner)}
      >
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          {...props}
          {...stylex.props(styles.content, style)}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  );
}

function PopoverHeader({ style, ...props }: PopoverHeaderProps) {
  return (
    <div
      data-slot="popover-header"
      {...props}
      {...stylex.props(styles.header, style)}
    />
  );
}

function PopoverTitle({ style, ...props }: PopoverTitleProps) {
  return (
    <PopoverPrimitive.Title
      data-slot="popover-title"
      {...props}
      {...stylex.props(styles.title, style)}
    />
  );
}

function PopoverDescription({ style, ...props }: PopoverDescriptionProps) {
  return (
    <PopoverPrimitive.Description
      data-slot="popover-description"
      {...props}
      {...stylex.props(styles.description, style)}
    />
  );
}

export {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
};

export type {
  PopoverContentProps,
  PopoverDescriptionProps,
  PopoverHeaderProps,
  PopoverProps,
  PopoverTitleProps,
  PopoverTriggerProps,
};