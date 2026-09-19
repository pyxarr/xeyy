import * as stylex from "@stylexjs/stylex";
import { useState, type ReactNode } from "react";
import { RadioGroup, RadioGroupItem } from "./radio-group";

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

const options = [
  { value: "nothing", label: "Nothing" },
  { value: "billing", label: "Billing" },
  { value: "promotions", label: "Promotions" },
  { value: "product", label: "Product updates" },
];

export function RadioGroupExample() {
  const [value, setValue] = useState("nothing");

  return (
    <div {...stylex.props(layout.root)}>
      {/* Controlled */}
      <div {...stylex.props(layout.field)}>
        <span>Notifications</span>
        <RadioGroup value={value} onValueChange={setValue}>
          {options.map((option) => (
            <FieldLabel key={option.value}>
              <RadioGroupItem value={option.value} />
              {option.label}
            </FieldLabel>
          ))}
        </RadioGroup>
        <span>Selected: {value}</span>
      </div>

      {/* Horizontal */}
      <div {...stylex.props(layout.field)}>
        <span>Mode</span>
        <RadioGroup defaultValue="billing">
          <div {...stylex.props(layout.row)}>
            {options.map((option) => (
              <FieldLabel key={option.value}>
                <RadioGroupItem value={option.value} />
                {option.label}
              </FieldLabel>
            ))}
          </div>
        </RadioGroup>
      </div>

      {/* Disabled */}
      <div {...stylex.props(layout.field)}>
        <span>Disabled</span>
        <RadioGroup defaultValue="disabled-on">
          <div {...stylex.props(layout.row)}>
            <FieldLabel>
              <RadioGroupItem disabled value="disabled-on" />
              On
            </FieldLabel>
            <FieldLabel>
              <RadioGroupItem disabled value="disabled-off" />
              Off
            </FieldLabel>
          </div>
        </RadioGroup>
      </div>

      {/* Invalid */}
      <div {...stylex.props(layout.field)}>
        <span>Invalid</span>
        <RadioGroup defaultValue="invalid">
          <FieldLabel>
            <RadioGroupItem aria-invalid="true" value="invalid" />
            Invalid choice
          </FieldLabel>
        </RadioGroup>
      </div>

      {/* RTL */}
      <div dir="rtl" {...stylex.props(layout.field)}>
        <RadioGroup defaultValue="rtl-on">
          <FieldLabel>
            <RadioGroupItem value="rtl-on" />
            معاينة
          </FieldLabel>
          <FieldLabel>
            <RadioGroupItem value="rtl-off" />
            مغلقة
          </FieldLabel>
        </RadioGroup>
      </div>
    </div>
  );
}