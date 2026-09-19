import * as stylex from "@stylexjs/stylex";
import { useState, type ReactNode } from "react";
import { Checkbox } from "./checkbox";

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

export function CheckboxExample() {
  const [checked, setChecked] = useState(false);
  const [quote, setQuote] = useState(true);
  const [newsletter, setNewsletter] = useState(false);

  const selected = [quote, newsletter].filter(Boolean).length;
  const allSelected = selected === 2;
  const someSelected = selected > 0 && !allSelected;

  return (
    <div {...stylex.props(layout.root)}>
      {/* Controlled */}
      <FieldLabel>
        Controlled
        <Checkbox checked={checked} onCheckedChange={setChecked} />
        <span>{checked ? "Checked" : "Unchecked"}</span>
      </FieldLabel>

      {/* Indeterminate via select-all */}
      <div {...stylex.props(layout.field)}>
        <span>Email preferences</span>
        <Checkbox
          checked={allSelected}
          indeterminate={someSelected}
          onCheckedChange={(value) => {
            setQuote(value);
            setNewsletter(value);
          }}
        />
        <span>
          {allSelected ? "All" : someSelected ? "Some" : "None"} selected
        </span>
        <div {...stylex.props(layout.row)}>
          <label>
            <Checkbox checked={quote} onCheckedChange={setQuote} />
            Quote updates
          </label>
          <label>
            <Checkbox checked={newsletter} onCheckedChange={setNewsletter} />
            Newsletter
          </label>
        </div>
      </div>

      {/* Disabled */}
      <div {...stylex.props(layout.row)}>
        <Checkbox disabled defaultChecked />
        <Checkbox disabled />
        <Checkbox disabled indeterminate />
      </div>

      {/* Invalid */}
      <FieldLabel>
        Invalid
        <Checkbox aria-invalid="true" />
      </FieldLabel>

      {/* RTL */}
      <div dir="rtl" {...stylex.props(layout.row)}>
        <Checkbox defaultChecked />
        <Checkbox />
        <Checkbox indeterminate />
      </div>
    </div>
  );
}
