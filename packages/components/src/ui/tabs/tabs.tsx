import { createContext, useContext } from "react";
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { semantic } from "@xeyy/tokens/theme.stylex";

type TabsListVariant = "default" | "line";

interface TabsListVariantsProps {
  variant?: TabsListVariant;
}

type TabsProps = Omit<TabsPrimitive.Root.Props, "className" | "style"> & {
  style?: StyleXStyles;
};

type TabsListProps = Omit<TabsPrimitive.List.Props, "className" | "style"> &
  TabsListVariantsProps & {
    style?: StyleXStyles;
  };

type TabsTriggerProps = Omit<TabsPrimitive.Tab.Props, "className" | "style"> & {
  style?: StyleXStyles;
};

type TabsContentProps = Omit<TabsPrimitive.Panel.Props, "className" | "style"> & {
  style?: StyleXStyles;
};

const listStyles = stylex.create({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "fit-content",
    color: semantic.mutedForeground,
    height: "2rem",
    padding: "3px",
    borderRadius: `calc(${semantic.radius} - 2px)`,

    '[data-orientation="vertical"]': {
      height: "fit-content",
      flexDirection: "column",
    },

    // Mirrors upstream `data-[variant=line]:rounded-none`.
    '[data-variant="line"]': {
      borderRadius: 0,
    },
  },

  default: {
    backgroundColor: semantic.muted,
  },

  line: {
    backgroundColor: "transparent",
    gap: "0.25rem",
  },
});

const triggerStyles = stylex.create({
  base: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.375rem",
    height: "calc(100% - 1px)",
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
    whiteSpace: "nowrap",
    border: "1px solid transparent",
    borderRadius: `calc(${semantic.radius} - 2px)`,
    paddingInline: "0.375rem",
    paddingBlock: "0.125rem",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    fontWeight: "500",
    color: `color-mix(in oklab, ${semantic.foreground} 15%, ${semantic.mutedForeground})`,
    transitionProperty: "all",
    transitionDuration: "150ms",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    outlineStyle: "none",

    ":hover": {
      color: semantic.foreground,
    },

    ":focus-visible": {
      borderColor: semantic.ring,
      boxShadow: `0 0 0 3px color-mix(in oklab, ${semantic.ring} 50%, transparent)`,
    },

    ':has([data-icon="inline-end"])': {
      paddingRight: "0.25rem",
    },

    ':has([data-icon="inline-start"])': {
      paddingLeft: "0.25rem",
    },

    ":disabled": {
      pointerEvents: "none",
      opacity: 0.5,
    },

    "[data-disabled]": {
      pointerEvents: "none",
      opacity: 0.5,
    },

    '[data-orientation="vertical"]': {
      width: "100%",
      justifyContent: "flex-start",
    },

    "::after": {
      content: '""',
      position: "absolute",
      backgroundColor: semantic.foreground,
      opacity: 0,
      transitionProperty: "opacity",
      transitionDuration: "150ms",
      transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    },

    '[data-orientation="horizontal"]::after': {
      left: 0,
      right: 0,
      bottom: "-5px",
      height: "2px",
    },

    '[data-orientation="vertical"]::after': {
      top: 0,
      bottom: 0,
      right: "-0.25rem",
      width: "2px",
    },
  },

  default: {
    "[data-active]": {
      color: semantic.foreground,
      backgroundColor: semantic.background,
      boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",

      "@media (prefers-color-scheme: dark)": {
        backgroundColor: `color-mix(in oklab, ${semantic.input} 30%, transparent)`,
        borderColor: semantic.input,
      },
    },
  },

  line: {
    "[data-active]": {
      color: semantic.foreground,
      backgroundColor: "transparent",
      boxShadow: "none",

      "::after": {
        opacity: 1,
      },
    },
  },
});

const contentStyles = stylex.create({
  base: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
    fontSize: "0.875rem",
    outlineStyle: "none",
  },
});

const rootStyles = stylex.create({
  base: {
    display: "flex",
    gap: "0.5rem",

    '[data-orientation="horizontal"]': {
      flexDirection: "column",
    },
  },
});

// StyleX cannot express upstream's group-data-[variant=line]/tabs-list ancestor
// selectors, so the list variant is threaded to triggers through context.
const TabsListVariantContext = createContext<TabsListVariant>("default");

function tabsListVariants({ variant = "default" }: TabsListVariantsProps = {}) {
  return [listStyles.base, listStyles[variant]];
}

function Tabs({
  style,
  orientation = "horizontal",
  ...props
}: TabsProps) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      orientation={orientation}
      {...props}
      {...stylex.props(rootStyles.base, style)}
    />
  );
}

function TabsList({
  style,
  variant = "default",
  children,
  ...props
}: TabsListProps) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      {...props}
      {...stylex.props(...tabsListVariants({ variant }), style)}
    >
      <TabsListVariantContext.Provider value={variant}>
        {children}
      </TabsListVariantContext.Provider>
    </TabsPrimitive.List>
  );
}

function TabsTrigger({ style, ...props }: TabsTriggerProps) {
  const variant = useContext(TabsListVariantContext);
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      {...props}
      {...stylex.props(triggerStyles.base, triggerStyles[variant], style)}
    />
  );
}

function TabsContent({ style, ...props }: TabsContentProps) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      {...props}
      {...stylex.props(contentStyles.base, style)}
    />
  );
}

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  tabsListVariants,
};

export type {
  TabsListVariant,
  TabsListVariantsProps,
  TabsProps,
  TabsListProps,
  TabsTriggerProps,
  TabsContentProps,
};