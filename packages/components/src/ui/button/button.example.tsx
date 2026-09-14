import * as stylex from "@stylexjs/stylex";
import { Button, buttonVariants } from "./button";

const layout = stylex.create({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: "32px",
  },
  row: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "8px",
  },
  rtl: {
    display: "flex",
    gap: "8px",
  },
});

const rounded = stylex.create({
  roundedFull: {
    borderRadius: "999px",
  },
});

const spin = stylex.keyframes({
  from: { transform: "rotate(0deg)" },
  to: { transform: "rotate(360deg)" },
});

const demo = stylex.create({
  spinner: {
    width: "1rem",
    height: "1rem",
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: "currentColor",
    borderTopColor: "transparent",
    borderRadius: "999px",
    animationName: spin,
    animationDuration: "0.7s",
    animationTimingFunction: "linear",
    animationIterationCount: "infinite",
  },
});

type IconPosition = "inline-start" | "inline-end";

function DemoIcon({
  dataIcon,
  size = 16,
}: {
  dataIcon?: IconPosition;
  size?: number;
}) {
  return (
    <svg
      data-icon={dataIcon}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function ButtonExample() {
  return (
    <div {...stylex.props(layout.root)}>
      {/* Styles */}
      <div {...stylex.props(layout.row)}>
        <Button>Default</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="link">Link</Button>
      </div>

      {/* Sizes */}
      <div {...stylex.props(layout.row)}>
        <Button size="xs">Extra Small</Button>
        <Button size="sm">Small</Button>
        <Button>Default</Button>
        <Button size="lg">Large</Button>
      </div>

      {/* Icon-only sizes */}
      <div {...stylex.props(layout.row)}>
        <Button size="icon-xs" aria-label="Extra small icon button">
          <DemoIcon size={12} />
        </Button>

        <Button size="icon-sm" aria-label="Small icon button">
          <DemoIcon size={16} />
        </Button>

        <Button size="icon" aria-label="Default icon button">
          <DemoIcon size={16} />
        </Button>

        <Button size="icon-lg" aria-label="Large icon button">
          <DemoIcon size={16} />
        </Button>
      </div>

      {/* Icon-only buttons */}
      <div {...stylex.props(layout.row)}>
        <Button size="icon" aria-label="Ghost icon button" variant="ghost">
          <DemoIcon size={16} />
        </Button>

        <Button size="icon" aria-label="Outline icon button" variant="outline">
          <DemoIcon size={16} />
        </Button>

        <Button
          size="icon"
          aria-label="Destructive icon button"
          variant="destructive"
        >
          <DemoIcon size={16} />
        </Button>
      </div>

      {/* With icon */}
      <div {...stylex.props(layout.row)}>
        <Button>
          <DemoIcon dataIcon="inline-start" size={16} />
          Inline-start icon
        </Button>

        <Button>
          Inline-end icon
          <DemoIcon dataIcon="inline-end" size={16} />
        </Button>

        <Button variant="destructive">
          <DemoIcon dataIcon="inline-start" size={16} />
          Inline-start icon
        </Button>
      </div>

      {/* Rounded */}
      <div {...stylex.props(layout.row)}>
        <Button style={rounded.roundedFull}>Rounded</Button>

        <Button variant="outline" style={rounded.roundedFull}>
          Rounded
        </Button>

        <Button
          size="icon"
          style={rounded.roundedFull}
          aria-label="Rounded icon button"
        >
          <DemoIcon size={16} />
        </Button>
      </div>

      {/* Loading */}
      <div {...stylex.props(layout.row)}>
        <Button disabled>
          <span
            {...stylex.props(demo.spinner)}
            data-icon="inline-start"
            aria-hidden="true"
          />
          Generating
        </Button>

        <Button variant="outline" disabled>
          <span
            {...stylex.props(demo.spinner)}
            data-icon="inline-start"
            aria-hidden="true"
          />
          Downloading…
        </Button>
      </div>

      {/* As link */}
      <div {...stylex.props(layout.row)}>
        <a href="#" {...stylex.props(...buttonVariants())}>
          Login
        </a>

        <a
          href="#"
          {...stylex.props(
            ...buttonVariants({
              variant: "outline",
              size: "sm",
            })
          )}
        >
          Sign up
        </a>
      </div>

      {/* RTL */}
      <div dir="rtl" {...stylex.props(layout.rtl)}>
        <Button>زر</Button>

        <Button variant="outline">
          <DemoIcon dataIcon="inline-start" size={16} />
          حذف
        </Button>

        <Button variant="ghost">
          إرسال
          <DemoIcon dataIcon="inline-end" size={16} />
        </Button>

        <Button variant="destructive" disabled>
          <span
            {...stylex.props(demo.spinner)}
            data-icon="inline-start"
            aria-hidden="true"
          />
          تحميل
        </Button>
      </div>
    </div>
  );
}
