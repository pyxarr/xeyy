import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import type { HTMLAttributes } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { semantic } from "@xeyy/tokens/theme.stylex";
import { Button } from "../button/button";

type DialogProps = DialogPrimitive.Root.Props;

type DialogTriggerProps = Omit<
  DialogPrimitive.Trigger.Props,
  "className" | "style"
> & {
  style?: StyleXStyles;
};

type DialogPortalProps = Omit<
  DialogPrimitive.Portal.Props,
  "className" | "style"
> & {
  style?: StyleXStyles;
};

type DialogCloseProps = Omit<
  DialogPrimitive.Close.Props,
  "className" | "style"
> & {
  style?: StyleXStyles;
};

type DialogOverlayProps = Omit<
  DialogPrimitive.Backdrop.Props,
  "className" | "style"
> & {
  style?: StyleXStyles;
};

type DialogContentProps = Omit<
  DialogPrimitive.Popup.Props,
  "className" | "style"
> & {
  style?: StyleXStyles;
  showCloseButton?: boolean;
};

type DialogHeaderProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "className" | "style"
> & {
  style?: StyleXStyles;
};

type DialogFooterProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "className" | "style"
> & {
  style?: StyleXStyles;
  showCloseButton?: boolean;
};

type DialogTitleProps = Omit<
  DialogPrimitive.Title.Props,
  "className" | "style"
> & {
  style?: StyleXStyles;
};

type DialogDescriptionProps = Omit<
  DialogPrimitive.Description.Props,
  "className" | "style"
> & {
  style?: StyleXStyles;
};

const styles = stylex.create({
  overlay: {
    position: "fixed",
    inset: 0,
    isolation: "isolate",
    zIndex: 50,
    backgroundColor: "rgb(0 0 0 / 0.1)",
    backdropFilter: "blur(4px)",

    "@media (prefers-reduced-motion: no-preference)": {
      transitionProperty: "opacity",
      transitionDuration: "100ms",

      "[data-starting-style]": {
        opacity: 0,
      },

      "[data-ending-style]": {
        opacity: 0,
      },
    },
  },

  content: {
    position: "fixed",
    top: "50%",
    left: "50%",
    translate: "-50% -50%",
    zIndex: 50,
    width: "100%",
    maxWidth: "calc(100% - 2rem)",
    display: "grid",
    gap: "1rem",
    padding: "1rem",
    fontSize: "0.875rem",
    borderRadius: semantic.radius,
    backgroundColor: semantic.popover,
    color: semantic.popoverForeground,
    boxShadow: `0 0 0 1px color-mix(in oklab, ${semantic.foreground} 10%, transparent)`,
    outlineStyle: "none",

    "@media (min-width: 40rem)": {
      maxWidth: "24rem",
    },

    "@media (prefers-reduced-motion: no-preference)": {
      transitionProperty: "opacity, scale",
      transitionDuration: "100ms",
      transitionTimingFunction: "ease",

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

  header: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },

  footer: {
    display: "flex",
    flexDirection: "column-reverse",
    gap: "0.5rem",
    marginInline: "-1rem",
    marginBottom: "-1rem",
    padding: "1rem",
    borderTopWidth: "1px",
    borderTopColor: semantic.border,
    borderBottomLeftRadius: semantic.radius,
    borderBottomRightRadius: semantic.radius,
    backgroundColor: `color-mix(in oklab, ${semantic.muted} 50%, transparent)`,

    "@media (min-width: 40rem)": {
      flexDirection: "row",
      justifyContent: "flex-end",
    },
  },

  title: {
    fontSize: "1rem",
    lineHeight: "1",
    fontWeight: "500",
  },

  description: {
    color: semantic.mutedForeground,
    fontSize: "0.875rem",
  },

  closeButton: {
    position: "absolute",
    top: "0.5rem",
    right: "0.5rem",
  },

  closeIcon: {
    width: "1rem",
    height: "1rem",
    flexShrink: 0,
  },

  visuallyHidden: {
    position: "absolute",
    width: "1px",
    height: "1px",
    padding: 0,
    margin: "-1px",
    overflow: "hidden",
    clipPath: "inset(50%)",
    whiteSpace: "nowrap",
    borderWidth: 0,
  },
});

function Dialog({ ...props }: DialogProps) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({ style, ...props }: DialogTriggerProps) {
  return (
    <DialogPrimitive.Trigger
      data-slot="dialog-trigger"
      {...props}
      {...stylex.props(style)}
    />
  );
}

function DialogPortal({ style, ...props }: DialogPortalProps) {
  return (
    <DialogPrimitive.Portal
      data-slot="dialog-portal"
      {...props}
      {...stylex.props(style)}
    />
  );
}

function DialogClose({ style, ...props }: DialogCloseProps) {
  return (
    <DialogPrimitive.Close
      data-slot="dialog-close"
      {...props}
      {...stylex.props(style)}
    />
  );
}

function DialogOverlay({ style, ...props }: DialogOverlayProps) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      {...props}
      {...stylex.props(styles.overlay, style)}
    />
  );
}

function DialogContent({
  style,
  children,
  showCloseButton = true,
  ...props
}: DialogContentProps) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        {...props}
        {...stylex.props(styles.content, style)}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                style={styles.closeButton}
              />
            }
          >
            <X
              {...stylex.props(styles.closeIcon)}
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <span {...stylex.props(styles.visuallyHidden)}>Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPortal>
  );
}

function DialogHeader({ style, ...props }: DialogHeaderProps) {
  return (
    <div
      data-slot="dialog-header"
      {...props}
      {...stylex.props(styles.header, style)}
    />
  );
}

function DialogFooter({
  style,
  showCloseButton = false,
  children,
  ...props
}: DialogFooterProps) {
  return (
    <div
      data-slot="dialog-footer"
      {...props}
      {...stylex.props(styles.footer, style)}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close render={<Button variant="outline" />}>
          Close
        </DialogPrimitive.Close>
      )}
    </div>
  );
}

function DialogTitle({ style, ...props }: DialogTitleProps) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      {...props}
      {...stylex.props(styles.title, style)}
    />
  );
}

function DialogDescription({ style, ...props }: DialogDescriptionProps) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      {...props}
      {...stylex.props(styles.description, style)}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};

export type {
  DialogCloseProps,
  DialogContentProps,
  DialogDescriptionProps,
  DialogFooterProps,
  DialogHeaderProps,
  DialogOverlayProps,
  DialogPortalProps,
  DialogProps,
  DialogTitleProps,
  DialogTriggerProps,
};