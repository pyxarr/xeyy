import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { Select as SelectPrimitive } from "@base-ui/react/select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { semantic } from "@xeyy/tokens/theme.stylex";

type SelectSize = "sm" | "default";

type SelectProps<Value = string> = Omit<
  SelectPrimitive.Root.Props<Value>,
  "className" | "style"
> & {
  style?: StyleXStyles;
};

type SelectGroupProps = Omit<
  SelectPrimitive.Group.Props,
  "className" | "style"
> & {
  style?: StyleXStyles;
};

type SelectValueProps = Omit<
  SelectPrimitive.Value.Props,
  "className" | "style"
> & {
  style?: StyleXStyles;
};

type SelectTriggerProps = Omit<
  SelectPrimitive.Trigger.Props,
  "className" | "style"
> & {
  size?: SelectSize;
  style?: StyleXStyles;
};

type SelectContentProps = Omit<
  SelectPrimitive.Popup.Props,
  "className" | "style"
> &
  Pick<
    SelectPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset" | "alignItemWithTrigger"
  > & {
    style?: StyleXStyles;
  };

type SelectLabelProps = Omit<
  SelectPrimitive.GroupLabel.Props,
  "className" | "style"
> & {
  style?: StyleXStyles;
};

type SelectItemProps = Omit<
  SelectPrimitive.Item.Props,
  "className" | "style"
> & {
  style?: StyleXStyles;
};

type SelectSeparatorProps = Omit<
  SelectPrimitive.Separator.Props,
  "className" | "style"
> & {
  style?: StyleXStyles;
};

type SelectScrollButtonProps = Omit<
  SelectPrimitive.ScrollUpArrow.Props,
  "className" | "style"
> & {
  style?: StyleXStyles;
};

const styles = stylex.create({
  trigger: {
    display: "flex",
    width: "fit-content",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "0.375rem",
    paddingBlock: "0.5rem",
    paddingInlineEnd: "0.5rem",
    paddingInlineStart: "0.625rem",
    border: "1px solid",
    borderColor: semantic.input,
    borderRadius: `calc(${semantic.radius} - 2px)`,
    backgroundColor: "transparent",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    color: semantic.foreground,
    whiteSpace: "nowrap",
    outlineStyle: "none",
    cursor: "default",
    userSelect: "none",
    transitionProperty: "background-color, border-color, color, box-shadow",
    transitionDuration: "150ms",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",

    ":hover": {
      backgroundColor: semantic.muted,
    },

    ":disabled": {
      opacity: "0.5",
      cursor: "not-allowed",
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
      backgroundColor: `color-mix(in oklab, ${semantic.input} 30%, transparent)`,

      ":hover": {
        backgroundColor: `color-mix(in oklab, ${semantic.input} 50%, transparent)`,
      },
    },
  },

  triggerIcon: {
    display: "flex",
    flexShrink: 0,
    alignItems: "center",
    color: semantic.mutedForeground,
  },

  value: {
    display: "flex",
    flex: 1,
    alignItems: "center",
    gap: "0.375rem",
    textAlign: "start",

    "[data-placeholder]": {
      color: semantic.mutedForeground,
    },
  },

  group: {
    padding: "0.25rem",
    scrollMarginBlock: "0.25rem",
  },

  positioner: {
    isolation: "isolate",
    zIndex: 50,
  },

  popup: {
    position: "relative",
    isolation: "isolate",
    zIndex: 50,
    width: "var(--anchor-width)",
    maxHeight: "var(--available-height)",
    transformOrigin: "var(--transform-origin)",
    overflowX: "hidden",
    overflowY: "auto",
    minWidth: "9rem",
    border: "1px solid",
    borderColor: semantic.border,
    borderRadius: `calc(${semantic.radius} - 2px)`,
    backgroundColor: semantic.popover,
    color: semantic.popoverForeground,
    boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    outlineStyle: "none",
  },

  item: {
    position: "relative",
    display: "flex",
    width: "100%",
    alignItems: "center",
    gap: "0.375rem",
    paddingBlock: "0.25rem",
    paddingInlineEnd: "0.375rem",
    paddingInlineStart: "2rem",
    borderRadius: "0.375rem",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    outlineStyle: "none",
    cursor: "default",
    userSelect: "none",

    "[data-highlighted]": {
      backgroundColor: semantic.accent,
      color: semantic.accentForeground,
    },

    "[data-selected]": {
      fontWeight: "500",
    },

    "[data-disabled]": {
      opacity: "0.5",
      cursor: "not-allowed",
      pointerEvents: "none",
    },
  },

  itemText: {
    display: "flex",
    flex: 1,
    gap: "0.5rem",
  },

  itemIndicator: {
    position: "absolute",
    insetInlineStart: "0.5rem",
    display: "flex",
    width: "1rem",
    height: "1rem",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
  },

  label: {
    color: semantic.mutedForeground,
    paddingBlock: "0.25rem",
    paddingInline: "0.375rem",
    fontSize: "0.75rem",
    lineHeight: "1rem",
  },

  separator: {
    height: "1px",
    flexShrink: 0,
    backgroundColor: semantic.border,
    marginBlock: "0.25rem",
    marginInline: "-0.25rem",
    pointerEvents: "none",
  },

  scrollButton: {
    display: "flex",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    insetInlineStart: "0",
    zIndex: 10,
    paddingBlock: "0.25rem",
    backgroundColor: semantic.popover,
    cursor: "default",
  },

  scrollUpButton: {
    top: 0,
  },

  scrollDownButton: {
    bottom: 0,
  },
});

const sizes = stylex.create({
  default: {
    height: "2rem",
  },

  sm: {
    height: "1.75rem",
    borderRadius: `min(calc(${semantic.radius} - 2px), 10px)`,
  },
});

function Select<Value = string>({ style, ...props }: SelectProps<Value>) {
  return (
    <SelectPrimitive.Root
      data-slot="select"
      {...props}
      {...stylex.props(style)}
    />
  );
}

function SelectGroup({ style, ...props }: SelectGroupProps) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      {...props}
      {...stylex.props(styles.group, style)}
    />
  );
}

function SelectValue({ style, ...props }: SelectValueProps) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      {...props}
      {...stylex.props(styles.value, style)}
    />
  );
}

function SelectTrigger({
  style,
  size = "default",
  children,
  ...props
}: SelectTriggerProps) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      {...props}
      {...stylex.props(styles.trigger, sizes[size], style)}
    >
      {children}
      <SelectPrimitive.Icon {...stylex.props(styles.triggerIcon)}>
        <ChevronDown size={16} pointerEvents="none" aria-hidden="true" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  style,
  children,
  side = "bottom",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  alignItemWithTrigger = true,
  ...props
}: SelectContentProps) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        {...stylex.props(styles.positioner)}
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          data-align-trigger={alignItemWithTrigger}
          {...props}
          {...stylex.props(styles.popup, style)}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.List>{children}</SelectPrimitive.List>
          <SelectScrollDownButton />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({ style, ...props }: SelectLabelProps) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      {...props}
      {...stylex.props(styles.label, style)}
    />
  );
}

function SelectItem({ style, children, ...props }: SelectItemProps) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      {...props}
      {...stylex.props(styles.item, style)}
    >
      <SelectPrimitive.ItemText
        data-slot="select-item-text"
        {...stylex.props(styles.itemText)}
      >
        {children}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator
        data-slot="select-item-indicator"
        {...stylex.props(styles.itemIndicator)}
      >
        <Check size={12} pointerEvents="none" aria-hidden="true" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({ style, ...props }: SelectSeparatorProps) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      {...props}
      {...stylex.props(styles.separator, style)}
    />
  );
}

function SelectScrollUpButton({ style, ...props }: SelectScrollButtonProps) {
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-button"
      {...props}
      {...stylex.props(styles.scrollButton, styles.scrollUpButton, style)}
    >
      <ChevronUp size={16} pointerEvents="none" aria-hidden="true" />
    </SelectPrimitive.ScrollUpArrow>
  );
}

function SelectScrollDownButton({ style, ...props }: SelectScrollButtonProps) {
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot="select-scroll-down-button"
      {...props}
      {...stylex.props(styles.scrollButton, styles.scrollDownButton, style)}
    >
      <ChevronDown size={16} pointerEvents="none" aria-hidden="true" />
    </SelectPrimitive.ScrollDownArrow>
  );
}

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
export type {
  SelectSize,
  SelectProps,
  SelectGroupProps,
  SelectValueProps,
  SelectTriggerProps,
  SelectContentProps,
  SelectLabelProps,
  SelectItemProps,
  SelectSeparatorProps,
  SelectScrollButtonProps,
};