import * as stylex from "@stylexjs/stylex";
import { Badge, badgeVariants } from "./badge";

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

function DemoIcon({ size = 12 }: { size?: number }) {
  return (
    <svg
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

export function BadgeExample() {
  return (
    <div {...stylex.props(layout.root)}>
      {/* Variants */}
      <div {...stylex.props(layout.row)}>
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="destructive">Destructive</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="ghost">Ghost</Badge>
        <Badge variant="link">Link</Badge>
      </div>

      {/* With icon */}
      <div {...stylex.props(layout.row)}>
        <Badge>
          <DemoIcon data-icon="inline-start" />
          Tagged
        </Badge>

        <Badge variant="outline">
          Owner
          <DemoIcon data-icon="inline-end" />
        </Badge>
      </div>

      {/* Invalid */}
      <div {...stylex.props(layout.row)}>
        <Badge variant="outline" aria-invalid="true">
          Invalid
        </Badge>
      </div>

      {/* As link */}
      <div {...stylex.props(layout.row)}>
        <Badge>
          <a href="#">Docs</a>
        </Badge>

        <Badge variant="outline">
          <a href="#">Status</a>
        </Badge>
      </div>

      {/* Used with the variants function */}
      <div {...stylex.props(layout.row)}>
        <span {...stylex.props(...badgeVariants())}>span badge</span>

        <button
          type="button"
          {...stylex.props(...badgeVariants({ variant: "outline" }))}
        >
          button badge
        </button>
      </div>

      {/* RTL */}
      <div dir="rtl" {...stylex.props(layout.rtl)}>
        <Badge>
          <DemoIcon data-icon="inline-start" />
          شارة
        </Badge>

        <Badge variant="secondary">
          حالة
          <DemoIcon data-icon="inline-end" />
        </Badge>
      </div>
    </div>
  );
}