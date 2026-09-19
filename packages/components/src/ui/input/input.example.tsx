import * as stylex from "@stylexjs/stylex";
import { useState, type ReactNode } from "react";
import { Input } from "./input";

const layout = stylex.create({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: "32px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    width: "320px",
  },
  row: {
    display: "flex",
    gap: "8px",
  },
  rtl: {
    display: "flex",
    gap: "8px",
  },
});

const custom = stylex.create({
  pill: {
    borderRadius: "9999px",
  },
});

function FieldLabel({ children }: { children: ReactNode }) {
  return <label {...stylex.props(layout.field)}>{children}</label>;
}

export function InputExample() {
  const [value, setValue] = useState("");

  return (
    <div {...stylex.props(layout.root)}>
      {/* Basic */}
      <FieldLabel>
        Name
        <Input placeholder="Enter your name" />
      </FieldLabel>

      {/* Controlled */}
      <FieldLabel>
        Controlled
        <Input value={value} onValueChange={setValue} placeholder="Type here…" />
      </FieldLabel>

      {/* Prefix icon */}
      <FieldLabel>
        Email
        <Input type="email" placeholder="you@example.com" />
      </FieldLabel>

      {/* Disabled */}
      <FieldLabel>
        Disabled
        <Input defaultValue="locked@example.com" disabled />
      </FieldLabel>

      {/* Invalid */}
      <FieldLabel>
        Password
        <Input
          type="password"
          defaultValue="hunter2"
          aria-invalid="true"
          aria-describedby="password-hint"
        />
        <span {...stylex.props(layout.row)} id="password-hint">
          Too short — at least 12 characters required.
        </span>
      </FieldLabel>

      {/* Consumer StyleX composition */}
      <FieldLabel>
        Styled
        <Input placeholder="Rounded override" style={custom.pill} />
      </FieldLabel>

      {/* File input */}
      <FieldLabel>
        Avatar
        <Input type="file" />
      </FieldLabel>

      {/* RTL */}
      <div dir="rtl" {...stylex.props(layout.rtl)}>
        <Input placeholder="اسم" />
        <Input placeholder="بريد إلكتروني" aria-invalid="true" />
      </div>
    </div>
  );
}