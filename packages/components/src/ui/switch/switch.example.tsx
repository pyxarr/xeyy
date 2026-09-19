import * as stylex from "@stylexjs/stylex";
import { useState, type ReactNode } from "react";
import { Switch } from "./switch";

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
    gap: "24px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
});

function FieldLabel({ children }: { children: ReactNode }) {
  return <label {...stylex.props(layout.field)}>{children}</label>;
}

export function SwitchExample() {
  const [checked, setChecked] = useState(false);

  return (
    <div {...stylex.props(layout.root)}>
      {/* Controlled */}
      <FieldLabel>
        Controlled
        <Switch checked={checked} onCheckedChange={setChecked} />
        <span>{checked ? "On" : "Off"}</span>
      </FieldLabel>

      {/* Sizes */}
      <div {...stylex.props(layout.row)}>
        <Switch size="sm" defaultChecked />
        <Switch size="sm" />
        <Switch defaultChecked />
        <Switch />
      </div>

      {/* Disabled */}
      <div {...stylex.props(layout.row)}>
        <Switch disabled defaultChecked />
        <Switch disabled />
      </div>

      {/* Invalid */}
      <FieldLabel>
        Invalid
        <Switch aria-invalid="true" defaultChecked />
      </FieldLabel>

      {/* RTL */}
      <div dir="rtl" {...stylex.props(layout.row)}>
        <Switch defaultChecked />
        <Switch size="sm" defaultChecked />
        <Switch />
      </div>
    </div>
  );
}
