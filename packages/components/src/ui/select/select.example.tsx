import * as stylex from "@stylexjs/stylex";
import { useState, type ReactNode } from "react";
import { semantic } from "@xeyy/tokens/theme.stylex";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./select";

const layout = stylex.create({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: "40px",
    fontFamily: "system-ui, sans-serif",
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "0.875rem",
    fontWeight: "600",
    color: semantic.foreground,
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
    alignItems: "flex-start",
    gap: "8px",
  },
  fieldLabel: {
    fontSize: "0.8125rem",
    fontWeight: "500",
    color: semantic.foreground,
  },
  result: {
    fontSize: "0.875rem",
    color: semantic.mutedForeground,
  },
  submit: {
    width: "fit-content",
    border: "1px solid",
    borderColor: semantic.border,
    borderRadius: "8px",
    backgroundColor: semantic.primary,
    color: semantic.primaryForeground,
    paddingBlock: "8px",
    paddingInline: "16px",
    fontSize: "0.875rem",
    fontFamily: "inherit",
    cursor: "pointer",
  },
});

const berries = [
  { value: "strawberry", label: "Strawberry" },
  { value: "raspberry", label: "Raspberry" },
  { value: "blueberry", label: "Blueberry" },
  { value: "blackberry", label: "Blackberry" },
];

const stoneFruits = [
  { value: "peach", label: "Peach" },
  { value: "plum", label: "Plum" },
  { value: "cherry", label: "Cherry" },
  { value: "apricot", label: "Apricot" },
];

const flavors = [
  { value: "vanilla", label: "Vanilla", disabled: false },
  { value: "chocolate", label: "Chocolate", disabled: false },
  { value: "pistachio", label: "Pistachio", disabled: false },
  { value: "tahini", label: "Tahini", disabled: true },
  { value: "mint", label: "Mint", disabled: false },
];

const longList = Array.from({ length: 30 }, (_, index) => ({
  value: `option-${index}`,
  label: `Option ${index + 1}`,
}));

function FieldLabel({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label {...stylex.props(layout.field)}>
      <span {...stylex.props(layout.fieldLabel)}>{label}</span>
      {children}
    </label>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section {...stylex.props(layout.section)}>
      <h2 {...stylex.props(layout.sectionTitle)}>{title}</h2>
      {children}
    </section>
  );
}

function ItemList({
  items,
}: {
  items: ReadonlyArray<{ value: string; label: string; disabled?: boolean }>;
}) {
  return (
    <>
      {items.map((item) => (
        <SelectItem
          key={item.value}
          value={item.value}
          disabled={item.disabled}
        >
          {item.label}
        </SelectItem>
      ))}
    </>
  );
}

function ControlledSelect() {
  const [favorite, setFavorite] = useState<string>("strawberry");

  return (
    <FieldLabel label="Favorite berry">
      <Select
        value={favorite}
        onValueChange={(value) => setFavorite(value ?? "")}
      >
        <SelectTrigger>
          <SelectValue placeholder="Pick a berry" />
        </SelectTrigger>
        <SelectContent>
          <ItemList items={berries} />
        </SelectContent>
      </Select>
      <span {...stylex.props(layout.result)}>Live value: {favorite}</span>
    </FieldLabel>
  );
}

function SelectExample() {
  const [submitted, setSubmitted] = useState<string>("");

  return (
    <div {...stylex.props(layout.root)}>
      <Section title="Controlled">
        <ControlledSelect />
      </Section>

      <Section title="Uncontrolled with default value">
        <FieldLabel label="Fruit">
          <Select defaultValue="banana">
            <SelectTrigger>
              <SelectValue placeholder="Select a fruit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
              <SelectItem value="cherry">Cherry</SelectItem>
              <SelectItem value="durian">Durian</SelectItem>
            </SelectContent>
          </Select>
        </FieldLabel>
      </Section>

      <Section title="Groups and separator">
        <FieldLabel label="Fruit">
          <Select defaultValue="plum">
            <SelectTrigger>
              <SelectValue placeholder="Select a fruit" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Berries</SelectLabel>
                <ItemList items={berries} />
              </SelectGroup>
              <SelectSeparator />
              <SelectGroup>
                <SelectLabel>Stone fruit</SelectLabel>
                <ItemList items={stoneFruits} />
              </SelectGroup>
            </SelectContent>
          </Select>
        </FieldLabel>
      </Section>

      <Section title="Sizes">
        <div {...stylex.props(layout.row)}>
          <Select>
            <SelectTrigger size="sm">
              <SelectValue placeholder="Small" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sm">Small</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Default" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Section>

      <Section title="Placeholder and disabled states">
        <div {...stylex.props(layout.row)}>
          <FieldLabel label="No selection">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Choose an option" />
              </SelectTrigger>
              <SelectContent>
                <ItemList items={flavors} />
              </SelectContent>
            </Select>
          </FieldLabel>

          <FieldLabel label="Disabled select">
            <Select disabled defaultValue="vanilla">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <ItemList items={flavors} />
              </SelectContent>
            </Select>
          </FieldLabel>
        </div>
      </Section>

      <Section title="Scroll buttons (long list)">
        <FieldLabel label="Option">
          <Select defaultValue="option-0">
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              <ItemList items={longList} />
            </SelectContent>
          </Select>
        </FieldLabel>
      </Section>

      <Section title="RTL">
        <div dir="rtl">
          <FieldLabel label="سیب">
            <Select defaultValue="apple">
              <SelectTrigger>
                <SelectValue placeholder="یک میوه انتخاب کنید" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apple">سیب</SelectItem>
                <SelectItem value="banana">موز</SelectItem>
                <SelectItem value="cherry">گیلاس</SelectItem>
              </SelectContent>
            </Select>
          </FieldLabel>
        </div>
      </Section>

      <Section title="Form usage">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            setSubmitted(String(data.get("flavor") ?? ""));
          }}
        >
          <FieldLabel label="Ice cream flavor">
            <Select name="flavor" defaultValue="vanilla">
              <SelectTrigger>
                <SelectValue placeholder="Choose a flavor" />
              </SelectTrigger>
              <SelectContent>
                <ItemList items={flavors} />
              </SelectContent>
            </Select>
          </FieldLabel>
          <div {...stylex.props(layout.row)}>
            <button type="submit" {...stylex.props(layout.submit)}>
              Submit
            </button>
            {submitted !== "" && (
              <span {...stylex.props(layout.result)}>
                Submitted flavor: {submitted}
              </span>
            )}
          </div>
        </form>
      </Section>
    </div>
  );
}

export { SelectExample };