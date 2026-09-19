import { useState, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fireEvent, fn, screen, userEvent, waitFor, within } from 'storybook/test';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  type SelectProps,
  type SelectTriggerProps,
} from '@xeyy/components';

const meta: Meta<typeof SelectWithStringValue> = {
  title: 'Components/Select',
  component: SelectWithStringValue,
  tags: ['autodocs'],
  parameters: {
    a11y: { test: 'error' },
  },
  args: {
    onValueChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Shared demo data and renderers
// ---------------------------------------------------------------------------

const fruits = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'durian', label: 'Durian' },
];

const flavors = [
  { value: 'vanilla', label: 'Vanilla' },
  { value: 'chocolate', label: 'Chocolate' },
  { value: 'pistachio', label: 'Pistachio', disabled: true },
  { value: 'tahini', label: 'Tahini' },
  { value: 'mint', label: 'Mint' },
];

const berries = [
  { value: 'strawberry', label: 'Strawberry' },
  { value: 'raspberry', label: 'Raspberry' },
  { value: 'blueberry', label: 'Blueberry' },
  { value: 'blackberry', label: 'Blackberry' },
];

const stoneFruits = [
  { value: 'peach', label: 'Peach' },
  { value: 'plum', label: 'Plum' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'apricot', label: 'Apricot' },
];

const longList = Array.from({ length: 40 }, (_, index) => ({
  value: `option-${index}`,
  label: `Option ${index + 1}`,
}));

const fruitsFa = [
  { value: 'apple', label: 'سیب' },
  { value: 'banana', label: 'موز' },
  { value: 'cherry', label: 'گیلاس' },
];

type DemoItem = { value: string; label: string; disabled?: boolean };

// A generic `Select` cannot be used directly as a storybook component; pin
// Value to string so args/docgen stay non-generic.
function SelectWithStringValue(props: SelectProps) {
  return <Select {...props} />;
}

function DemoItems({ items }: { items: ReadonlyArray<DemoItem> }) {
  return (
    <>
      {items.map((item) => (
        <SelectItem key={item.value} value={item.value} disabled={item.disabled}>
          {item.label}
        </SelectItem>
      ))}
    </>
  );
}

const fieldStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '8px',
} as const;

const fieldLabelStyle = {
  fontSize: '0.8125rem',
  fontWeight: 500,
} as const;

const rowStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'flex-start',
  gap: '24px',
} as const;

type DemoSelectProps = SelectProps & {
  label: string;
  content: ReactNode;
  placeholder?: string;
  triggerProps?: SelectTriggerProps;
};

function DemoSelect({
  label,
  content,
  placeholder = 'Pick an option',
  triggerProps,
  ...selectProps
}: DemoSelectProps) {
  const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const fieldId = `select-field-${slug || 'field'}`;
  return (
    <div style={fieldStyle}>
      <span id={fieldId} style={fieldLabelStyle}>
        {label}
      </span>
      <Select {...selectProps}>
        <SelectTrigger aria-labelledby={fieldId} {...triggerProps}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>{content}</SelectContent>
      </Select>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Visual stories
// ---------------------------------------------------------------------------

export const Default: Story = {
  name: 'Default (value selected)',
  render: (args) => (
    <DemoSelect
      label="Favorite fruit"
      content={<DemoItems items={fruits} />}
      items={fruits}
      defaultValue="banana"
      {...args}
    />
  ),
};

export const Placeholder: Story = {
  name: 'Placeholder (no value)',
  render: (args) => (
    <DemoSelect
      label="Favorite fruit"
      content={<DemoItems items={fruits} />}
      items={fruits}
      {...args}
    />
  ),
};

export const SizeDefault: Story = {
  name: 'Size: default',
  render: (args) => (
    <DemoSelect
      label="Favorite fruit"
      content={<DemoItems items={fruits} />}
      items={fruits}
      triggerProps={{ size: 'default' }}
      defaultValue="cherry"
      {...args}
    />
  ),
};

export const SizeSm: Story = {
  name: 'Size: sm',
  render: (args) => (
    <DemoSelect
      label="Favorite fruit"
      content={<DemoItems items={fruits} />}
      items={fruits}
      triggerProps={{ size: 'sm' }}
      defaultValue="cherry"
      {...args}
    />
  ),
};

export const AllSizes: Story = {
  name: 'All sizes',
  render: () => (
    <div style={rowStyle}>
      <DemoSelect
        label="Default size"
        content={<DemoItems items={fruits} />}
        items={fruits}
        defaultValue="banana"
      />
      <DemoSelect
        label="Small size"
        content={<DemoItems items={fruits} />}
        items={fruits}
        triggerProps={{ size: 'sm' }}
        defaultValue="cherry"
      />
    </div>
  ),
};

export const DisabledSelect: Story = {
  name: 'Disabled select',
  render: (args) => (
    <DemoSelect
      label="Ice cream flavor"
      content={<DemoItems items={flavors} />}
      items={flavors}
      disabled
      defaultValue="vanilla"
      {...args}
    />
  ),
};

export const DisabledOption: Story = {
  name: 'Disabled option',
  render: (args) => (
    <DemoSelect
      label="Ice cream flavor"
      content={<DemoItems items={flavors} />}
      items={flavors}
      defaultValue="chocolate"
      {...args}
    />
  ),
};

export const Grouped: Story = {
  name: 'Groups, labels and separator',
  render: (args) => (
    <DemoSelect
      label="Fruit"
      items={[...berries, ...stoneFruits]}
      defaultValue="plum"
      content={
        <>
          <SelectGroup>
            <SelectLabel>Berries</SelectLabel>
            <DemoItems items={berries} />
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Stone fruit</SelectLabel>
            <DemoItems items={stoneFruits} />
          </SelectGroup>
        </>
      }
      {...args}
    />
  ),
};

export const ManyOptions: Story = {
  name: 'Many options (scroll buttons)',
  render: (args) => (
    <DemoSelect
      label="Option"
      content={<DemoItems items={longList} />}
      items={longList}
      defaultValue="option-0"
      {...args}
    />
  ),
};

export const OpenByDefault: Story = {
  name: 'Open by default',
  render: (args) => (
    <DemoSelect
      label="Favorite fruit"
      content={<DemoItems items={fruits} />}
      items={fruits}
      defaultOpen
      defaultValue="apple"
      {...args}
    />
  ),
};

export const Rtl: Story = {
  name: 'RTL',
  render: (args) => (
    <div dir="rtl">
      <DemoSelect
        label="میوه"
        items={fruitsFa}
        defaultValue="apple"
        content={<DemoItems items={fruitsFa} />}
        {...args}
      />
    </div>
  ),
};

export const Controlled: Story = {
  name: 'Controlled (live state)',
  render: () => {
    const [favorite, setFavorite] = useState('strawberry');
    return (
      <div style={fieldStyle}>
        <span id="controlled-field-label" style={fieldLabelStyle}>
          Favorite berry
        </span>
        <Select value={favorite} onValueChange={(value) => setFavorite(value ?? '')} items={berries}>
          <SelectTrigger aria-labelledby="controlled-field-label">
            <SelectValue placeholder="Pick a berry" />
          </SelectTrigger>
          <SelectContent>
            <DemoItems items={berries} />
          </SelectContent>
        </Select>
        <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Live value: {favorite}</span>
      </div>
    );
  },
};

// ---------------------------------------------------------------------------
// Interaction tests
// ---------------------------------------------------------------------------

export const InteractionSelection: Story = {
  name: 'Interaction: click opens, selecting updates the value',
  render: (args) => (
    <DemoSelect
      label="Favorite fruit"
      content={<DemoItems items={fruits} />}
      items={fruits}
      defaultValue="banana"
      {...args}
    />
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox', { name: /favorite fruit/i });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).not.toHaveAttribute('data-popup-open');

    await userEvent.click(trigger);
    const listbox = await screen.findByRole('listbox');
    await expect(listbox).toBeInTheDocument();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(trigger).toHaveAttribute('data-popup-open');
    await expect(trigger).toHaveAttribute('aria-controls', listbox.id);
    await expect(screen.getByRole('option', { name: 'Banana' })).toBeInTheDocument();

    const durian = screen.getByRole('option', { name: 'Durian' });
    await userEvent.click(durian);

    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    await expect(args.onValueChange).toHaveBeenCalledWith('durian', expect.anything());
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).not.toHaveAttribute('data-popup-open');
    await expect(canvas.getByText('Durian')).toBeInTheDocument();
  },
};

export const InteractionOutsidePress: Story = {
  name: 'Interaction: clicking outside closes the popup',
  render: (args) => (
    <div style={fieldStyle}>
      <button type="button">Outside target</button>
      <DemoSelect
        label="Favorite fruit"
        content={<DemoItems items={fruits} />}
        items={fruits}
        {...args}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox', { name: /favorite fruit/i });
    const outside = canvas.getByRole('button', { name: /outside target/i });

    await userEvent.click(trigger);
    await screen.findByRole('listbox');

    await userEvent.click(outside);
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
};

export const InteractionEscape: Story = {
  name: 'Interaction: Escape closes and restores focus to the trigger',
  render: (args) => (
    <DemoSelect
      label="Favorite fruit"
      content={<DemoItems items={fruits} />}
      items={fruits}
      {...args}
    />
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox', { name: /favorite fruit/i });

    trigger.focus();
    await userEvent.keyboard('{ArrowDown}');
    await screen.findByRole('listbox');
    await expect(args.onValueChange).not.toHaveBeenCalled();

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
};

export const InteractionKeyboardOpen: Story = {
  name: 'Interaction: ArrowDown opens a closed trigger',
  render: (args) => (
    <DemoSelect
      label="Favorite fruit"
      content={<DemoItems items={fruits} />}
      items={fruits}
      {...args}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox', { name: /favorite fruit/i });
    await expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    trigger.focus();
    await userEvent.keyboard('{ArrowDown}');
    const listbox = await screen.findByRole('listbox');
    await expect(listbox).toBeInTheDocument();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    const apple = screen.getByRole('option', { name: 'Apple' });
    await expect(apple).toHaveFocus();
    await expect(apple).toHaveAttribute('data-highlighted');

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
  },
};

export const InteractionKeyboardNavigation: Story = {
  name: 'Interaction: arrows, Home/End and Enter',
  render: (args) => (
    <DemoSelect
      label="Favorite fruit"
      content={<DemoItems items={fruits} />}
      items={fruits}
      {...args}
    />
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox', { name: /favorite fruit/i });

    trigger.focus();
    await userEvent.keyboard('{ArrowDown}');
    await screen.findByRole('listbox');
    const apple = screen.getByRole('option', { name: 'Apple' });
    const banana = screen.getByRole('option', { name: 'Banana' });
    const cherry = screen.getByRole('option', { name: 'Cherry' });
    const durian = screen.getByRole('option', { name: 'Durian' });

    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(apple).toHaveFocus();
    await expect(apple).toHaveAttribute('data-highlighted');

    await userEvent.keyboard('{ArrowDown}');
    await expect(banana).toHaveFocus();

    await userEvent.keyboard('{ArrowDown}');
    await expect(cherry).toHaveFocus();

    await userEvent.keyboard('{End}');
    await expect(durian).toHaveFocus();
    await expect(durian).toHaveAttribute('data-highlighted');

    await userEvent.keyboard('{Home}');
    await expect(apple).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    await expect(args.onValueChange).toHaveBeenCalledWith('apple', expect.anything());
    await expect(trigger).toHaveFocus();
    await expect(canvas.getByText('Apple')).toBeInTheDocument();
  },
};

export const InteractionPlaceholder: Story = {
  name: 'Interaction: placeholder is shown until a value is chosen',
  render: (args) => (
    <DemoSelect
      label="Favorite fruit"
      content={<DemoItems items={fruits} />}
      items={fruits}
      placeholder="Pick a fruit"
      {...args}
    />
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox', { name: /favorite fruit/i });
    const valueEl = canvasElement.querySelector('[data-slot="select-value"]');

    await expect(trigger).toHaveAttribute('data-placeholder');
    await expect(valueEl).toHaveAttribute('data-placeholder');
    await expect(valueEl).toHaveTextContent('Pick a fruit');

    await userEvent.click(trigger);
    const apple = await screen.findByRole('option', { name: 'Apple' });
    await userEvent.click(apple);

    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    await expect(args.onValueChange).toHaveBeenCalledWith('apple', expect.anything());
    await expect(trigger).not.toHaveAttribute('data-placeholder');
    await expect(valueEl).not.toHaveAttribute('data-placeholder');
    await expect(valueEl).toHaveTextContent('Apple');
  },
};

export const InteractionDisabledSelect: Story = {
  name: 'Interaction: disabled select cannot open',
  render: (args) => (
    <DemoSelect
      label="Ice cream flavor"
      content={<DemoItems items={flavors} />}
      items={flavors}
      disabled
      defaultValue="vanilla"
      {...args}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox', { name: /ice cream flavor/i });
    await expect(trigger).toBeDisabled();
    await expect(trigger).toHaveAttribute('data-disabled');
    await expect(trigger).toHaveAttribute('tabindex', '-1');

    await fireEvent.click(trigger);
    await expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
};

export const InteractionDisabledOption: Story = {
  name: 'Interaction: disabled option cannot be selected',
  render: (args) => (
    <DemoSelect
      label="Ice cream flavor"
      content={<DemoItems items={flavors} />}
      items={flavors}
      defaultValue="chocolate"
      {...args}
    />
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox', { name: /ice cream flavor/i });

    await userEvent.click(trigger);
    await screen.findByRole('listbox');

    const pistachio = screen.getByRole('option', { name: 'Pistachio' });
    await expect(pistachio).toHaveAttribute('aria-disabled', 'true');
    await expect(pistachio).toHaveAttribute('data-disabled');

    await fireEvent.click(pistachio);
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await expect(screen.getByRole('listbox')).toBeInTheDocument();

    const chocolate = screen.getByRole('option', { name: 'Chocolate' });
    chocolate.focus();
    await userEvent.keyboard('{ArrowDown}');

    // Base UI highlights disabled items while navigating by arrow keys, so the highlight
    // lands on the disabled Pistachio; only typeahead skips disabled items. Selection is
    // still refused for the disabled entry.
    await expect(pistachio).toHaveFocus();
    await expect(pistachio).toHaveAttribute('data-highlighted');
    await expect(pistachio).toHaveAttribute('aria-disabled', 'true');

    await userEvent.keyboard('{Enter}');
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await expect(screen.getByRole('listbox')).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
  },
};

export const InteractionControlledVsUncontrolled: Story = {
  name: 'Interaction: controlled vs uncontrolled',
  render: (args) => (
    <div style={rowStyle}>
      <DemoSelect
        label="Controlled select"
        content={<DemoItems items={fruits} />}
        items={fruits}
        value="banana"
        {...args}
      />
      <DemoSelect
        label="Uncontrolled select"
        content={<DemoItems items={fruits} />}
        items={fruits}
        defaultValue="banana"
        {...args}
      />
    </div>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const controlled = canvas.getByRole('combobox', { name: /^controlled select$/i });
    const uncontrolled = canvas.getByRole('combobox', { name: /^uncontrolled select$/i });

    await expect(controlled).toHaveTextContent('Banana');
    await expect(uncontrolled).toHaveTextContent('Banana');

    await userEvent.click(controlled);
    await screen.findByRole('listbox');
    await userEvent.click(screen.getByRole('option', { name: 'Durian' }));
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    await expect(args.onValueChange).toHaveBeenNthCalledWith(1, 'durian', expect.anything());
    await expect(controlled).toHaveTextContent('Banana');

    await userEvent.click(uncontrolled);
    await screen.findByRole('listbox');
    await userEvent.click(screen.getByRole('option', { name: 'Cherry' }));
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    await expect(args.onValueChange).toHaveBeenNthCalledWith(2, 'cherry', expect.anything());
    await expect(uncontrolled).toHaveTextContent('Cherry');
  },
};

export const InteractionRtl: Story = {
  name: 'Interaction: RTL selection works',
  render: (args) => (
    <div dir="rtl">
      <DemoSelect
        label="میوه"
        items={fruitsFa}
        defaultValue="apple"
        content={<DemoItems items={fruitsFa} />}
        {...args}
      />
    </div>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox', { name: 'میوه' });
    await expect(trigger.closest('[dir="rtl"]')).not.toBeNull();

    await userEvent.click(trigger);
    await screen.findByRole('listbox');
    const banana = screen.getByRole('option', { name: 'موز' });
    await userEvent.click(banana);

    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    await expect(args.onValueChange).toHaveBeenCalledWith('banana', expect.anything());
    await expect(trigger).toHaveTextContent('موز');
  },
};

export const InteractionPopState: Story = {
  name: 'Interaction: popup has listbox role and is labelled',
  render: (args) => (
    <DemoSelect
      label="Favorite fruit"
      content={<DemoItems items={fruits} />}
      items={fruits}
      {...args}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox', { name: /favorite fruit/i });

    await userEvent.click(trigger);
    const listbox = await screen.findByRole('listbox');
    await expect(trigger).toHaveAttribute('aria-controls', listbox.id);

    // data-open and the content marker live on the portaled Popup wrapper (role="presentation"),
    // not on the inner role="listbox" List that houses the options.
    const content = document.querySelector('[data-slot="select-content"]');
    await expect(content).not.toBeNull();
    await expect(content).toHaveAttribute('data-open');
    await expect(content).toHaveAttribute('data-slot', 'select-content');
    await expect(content).toContainElement(listbox);

    const apple = screen.getByRole('option', { name: 'Apple' });
    await expect(apple).toHaveAttribute('aria-selected', 'false');
    await expect(apple).toHaveAttribute('data-slot', 'select-item');
    await expect(listbox).toHaveTextContent('Banana');

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
  },
};