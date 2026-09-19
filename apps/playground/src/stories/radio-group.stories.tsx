import type { CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fireEvent, fn, userEvent, within } from 'storybook/test';
import {
  RadioGroup,
  RadioGroupItem,
  type RadioGroupItemProps,
} from '@xeyy/components';

const meta: Meta<typeof RadioGroup> = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
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

const options = [
  { value: 'billing', label: 'Billing' },
  { value: 'promotions', label: 'Promotions' },
  { value: 'product', label: 'Product updates' },
];

type OptionProps = { value: string; label: string } & RadioGroupItemProps;

function Option({ value, label, ...itemProps }: OptionProps) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <RadioGroupItem value={value} {...itemProps} />
      <span>{label}</span>
    </label>
  );
}

function OptionList({ items = options }: { items?: typeof options }) {
  return (
    <>
      {items.map((option) => (
        <Option
          key={option.value}
          value={option.value}
          label={option.label}
        />
      ))}
    </>
  );
}

const rowStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '1rem',
};

const fieldStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

// ---------------------------------------------------------------------------
// Visual stories
// ---------------------------------------------------------------------------

export const Vertical: Story = {
  args: { defaultValue: 'billing', 'aria-label': 'Vertical group' },
  render: (args) => (
    <RadioGroup {...args}>
      <OptionList />
    </RadioGroup>
  ),
};

export const Horizontal: Story = {
  name: 'Horizontal',
  args: { defaultValue: 'billing', 'aria-label': 'Horizontal group' },
  render: (args) => (
    <RadioGroup {...args}>
      <div style={rowStyle}>
        <OptionList />
      </div>
    </RadioGroup>
  ),
};

export const AllUnselected: Story = {
  name: 'All unselected',
  args: { 'aria-label': 'Unselected group' },
  render: (args) => (
    <RadioGroup {...args}>
      <OptionList />
    </RadioGroup>
  ),
};

export const DisabledItem: Story = {
  name: 'Disabled item',
  args: { defaultValue: 'billing', 'aria-label': 'Disabled item group' },
  render: (args) => (
    <RadioGroup {...args}>
      <Option
        value="billing"
        label="Billing"
      />
      <Option
        value="promotions"
        label="Promotions"
        disabled
      />
      <Option
        value="product"
        label="Product updates"
        disabled
      />
    </RadioGroup>
  ),
};

export const DisabledGroup: Story = {
  name: 'Fully disabled group',
  args: {
    disabled: true,
    defaultValue: 'billing',
    'aria-label': 'Disabled group',
  },
  render: (args) => (
    <RadioGroup {...args}>
      <OptionList />
    </RadioGroup>
  ),
};

export const Invalid: Story = {
  args: { defaultValue: 'billing', 'aria-label': 'Invalid group' },
  render: (args) => (
    <RadioGroup {...args}>
      <Option
        value="billing"
        label="Billing"
        aria-invalid="true"
      />
      <Option
        value="promotions"
        label="Promotions"
      />
    </RadioGroup>
  ),
};

export const Rtl: Story = {
  name: 'RTL',
  args: { defaultValue: 'rtl-on', 'aria-label': 'RTL group' },
  render: (args) => (
    <div style={fieldStyle} dir="rtl">
      <span>Notifications</span>
      <RadioGroup {...args}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RadioGroupItem value="rtl-on" />
          <span>معاينة</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RadioGroupItem value="rtl-off" />
          <span>مغلقة</span>
        </label>
      </RadioGroup>
    </div>
  ),
};

export const WithFieldLabel: Story = {
  name: 'With Field-like label',
  render: () => (
    <div style={fieldStyle}>
      <span id="notifications-label">Notifications</span>
      <RadioGroup aria-labelledby="notifications-label" defaultValue="billing">
        <OptionList />
      </RadioGroup>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Interaction tests
// ---------------------------------------------------------------------------

export const ClickSelectsAndFiresOnValueChange: Story = {
  name: 'Interaction: click selects and fires onValueChange',
  args: { 'aria-label': 'Options' },
  render: (args) => (
    <RadioGroup {...args}>
      <OptionList />
    </RadioGroup>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const promotions = canvas.getByRole('radio', { name: /promotions/i });
    await userEvent.click(promotions);
    await expect(promotions).toHaveAttribute('aria-checked', 'true');
    await expect(promotions).toHaveAttribute('data-checked');
    await expect(args.onValueChange).toHaveBeenCalledTimes(1);
    await expect(args.onValueChange).toHaveBeenCalledWith(
      'promotions',
      expect.anything(),
    );
  },
};

export const SingleSelectSemantics: Story = {
  name: 'Interaction: choosing another deselects the previous',
  args: { 'aria-label': 'Options' },
  render: (args) => (
    <RadioGroup {...args}>
      <OptionList />
    </RadioGroup>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const billing = canvas.getByRole('radio', { name: /billing/i });
    const promotions = canvas.getByRole('radio', { name: /promotions/i });
    const product = canvas.getByRole('radio', { name: /product updates/i });

    await userEvent.click(billing);
    await expect(billing).toHaveAttribute('aria-checked', 'true');
    await expect(promotions).toHaveAttribute('aria-checked', 'false');

    await userEvent.click(product);
    await expect(product).toHaveAttribute('aria-checked', 'true');
    await expect(billing).toHaveAttribute('aria-checked', 'false');
    await expect(promotions).toHaveAttribute('aria-checked', 'false');
    await expect(args.onValueChange).toHaveBeenCalledTimes(2);
  },
};

export const UncontrolledDefaultValue: Story = {
  name: 'Interaction: uncontrolled via defaultValue',
  args: { defaultValue: 'billing', 'aria-label': 'Options' },
  render: (args) => (
    <RadioGroup {...args}>
      <OptionList />
    </RadioGroup>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const billing = canvas.getByRole('radio', { name: /billing/i });
    const product = canvas.getByRole('radio', { name: /product updates/i });

    await expect(billing).toHaveAttribute('aria-checked', 'true');

    await userEvent.click(product);
    await expect(product).toHaveAttribute('aria-checked', 'true');
    await expect(billing).toHaveAttribute('aria-checked', 'false');
    await expect(args.onValueChange).toHaveBeenCalledWith(
      'product',
      expect.anything(),
    );
  },
};

export const ControlledValue: Story = {
  name: 'Interaction: controlled via value',
  args: { value: 'billing', 'aria-label': 'Options' },
  render: (args) => (
    <RadioGroup {...args}>
      <OptionList />
    </RadioGroup>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const billing = canvas.getByRole('radio', { name: /billing/i });
    const product = canvas.getByRole('radio', { name: /product updates/i });

    await userEvent.click(product);
    await expect(args.onValueChange).toHaveBeenCalledWith(
      'product',
      expect.anything(),
    );
    await expect(billing).toHaveAttribute('aria-checked', 'true');
    await expect(product).toHaveAttribute('aria-checked', 'false');
  },
};

export const DisabledItemCannotBeSelected: Story = {
  name: 'Interaction: disabled item cannot be chosen',
  args: { 'aria-label': 'Options' },
  render: (args) => (
    <RadioGroup {...args}>
      <Option
        value="billing"
        label="Billing"
      />
      <Option
        value="promotions"
        label="Promotions"
        disabled
      />
    </RadioGroup>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const promotions = canvas.getByRole('radio', { name: /promotions/i });
    await expect(promotions).toHaveAttribute('aria-disabled', 'true');
    await expect(promotions).toHaveAttribute('data-disabled');
    await expect(promotions).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(promotions);
    await expect(promotions).toHaveAttribute('aria-checked', 'false');
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};

export const DisabledGroupBlocksSelection: Story = {
  name: 'Interaction: disabled group blocks selection',
  args: { disabled: true, 'aria-label': 'Options' },
  render: (args) => (
    <RadioGroup {...args}>
      <OptionList />
    </RadioGroup>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('radiogroup');
    await expect(group).toHaveAttribute('aria-disabled', 'true');

    const billing = canvas.getByRole('radio', { name: /billing/i });
    await expect(billing).toHaveAttribute('aria-disabled', 'true');
    await expect(billing).toHaveAttribute('data-disabled');

    fireEvent.click(billing);
    await expect(billing).toHaveAttribute('aria-checked', 'false');
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};

export const KeyboardArrowVertical: Story = {
  name: 'Interaction: ArrowDown/ArrowUp move selection',
  args: { defaultValue: 'billing', 'aria-label': 'Options' },
  render: (args) => (
    <RadioGroup {...args}>
      <OptionList />
    </RadioGroup>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const billing = canvas.getByRole('radio', { name: /billing/i });
    const promotions = canvas.getByRole('radio', { name: /promotions/i });

    billing.focus();
    await expect(billing).toHaveFocus();

    await userEvent.keyboard('{ArrowDown}');
    await expect(promotions).toHaveFocus();
    await expect(promotions).toHaveAttribute('aria-checked', 'true');
    await expect(billing).toHaveAttribute('aria-checked', 'false');
    await expect(args.onValueChange).toHaveBeenCalledWith(
      'promotions',
      expect.anything(),
    );

    await userEvent.keyboard('{ArrowUp}');
    await expect(billing).toHaveFocus();
    await expect(billing).toHaveAttribute('aria-checked', 'true');
    await expect(promotions).toHaveAttribute('aria-checked', 'false');
  },
};

export const KeyboardArrowHorizontal: Story = {
  name: 'Interaction: ArrowRight/ArrowLeft move selection',
  args: { defaultValue: 'billing', 'aria-label': 'Options' },
  render: (args) => (
    <RadioGroup {...args}>
      <div style={rowStyle}>
        <OptionList />
      </div>
    </RadioGroup>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const billing = canvas.getByRole('radio', { name: /billing/i });
    const promotions = canvas.getByRole('radio', { name: /promotions/i });

    billing.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(promotions).toHaveFocus();
    await expect(promotions).toHaveAttribute('aria-checked', 'true');
    await expect(args.onValueChange).toHaveBeenCalledWith(
      'promotions',
      expect.anything(),
    );

    await userEvent.keyboard('{ArrowLeft}');
    await expect(billing).toHaveFocus();
    await expect(billing).toHaveAttribute('aria-checked', 'true');
  },
};

export const KeyboardWraps: Story = {
  name: 'Interaction: arrows wrap around the group',
  args: { defaultValue: 'product', 'aria-label': 'Options' },
  render: (args) => (
    <RadioGroup {...args}>
      <OptionList />
    </RadioGroup>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const billing = canvas.getByRole('radio', { name: /billing/i });
    const product = canvas.getByRole('radio', { name: /product updates/i });

    product.focus();
    await expect(product).toHaveAttribute('aria-checked', 'true');

    await userEvent.keyboard('{ArrowDown}');
    await expect(billing).toHaveFocus();
    await expect(billing).toHaveAttribute('aria-checked', 'true');
    await expect(product).toHaveAttribute('aria-checked', 'false');
    await expect(args.onValueChange).toHaveBeenCalledWith(
      'billing',
      expect.anything(),
    );
  },
};

export const SpaceSelectsFocusedItem: Story = {
  name: 'Interaction: Space selects, Enter does not',
  args: { defaultValue: 'billing', 'aria-label': 'Options' },
  render: (args) => (
    <RadioGroup {...args}>
      <OptionList />
    </RadioGroup>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const promotions = canvas.getByRole('radio', { name: /promotions/i });

    promotions.focus();
    await expect(promotions).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await expect(promotions).toHaveAttribute('aria-checked', 'false');

    fireEvent.keyDown(promotions, { key: ' ', code: 'Space' });
    fireEvent.keyUp(promotions, { key: ' ', code: 'Space' });
    await expect(promotions).toHaveAttribute('aria-checked', 'true');
    await expect(args.onValueChange).toHaveBeenCalledWith(
      'promotions',
      expect.anything(),
    );
  },
};

export const ClickFocusesItem: Story = {
  name: 'Interaction: clicking an item focuses it',
  args: { 'aria-label': 'Options' },
  render: (args) => (
    <RadioGroup {...args}>
      <OptionList />
    </RadioGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const promotions = canvas.getByRole('radio', { name: /promotions/i });
    await userEvent.click(promotions);
    await expect(promotions).toHaveFocus();
    await expect(promotions).toHaveAttribute('aria-checked', 'true');
  },
};

export const ClickingLabelTextSelects: Story = {
  name: 'Interaction: clicking the field label selects',
  args: { 'aria-label': 'Options' },
  render: (args) => (
    <RadioGroup {...args}>
      <OptionList />
    </RadioGroup>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const promotions = canvas.getByRole('radio', { name: /promotions/i });
    await userEvent.click(canvas.getByText('Promotions'));
    await expect(promotions).toHaveAttribute('aria-checked', 'true');
    await expect(args.onValueChange).toHaveBeenCalledWith(
      'promotions',
      expect.anything(),
    );
  },
};

export const RtlSelection: Story = {
  name: 'Interaction: selection works in RTL',
  args: { defaultValue: 'rtl-on', 'aria-label': 'RTL group' },
  render: (args) => (
    <div style={fieldStyle} dir="rtl">
      <RadioGroup {...args}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RadioGroupItem value="rtl-on" />
          <span>معاينة</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RadioGroupItem value="rtl-off" />
          <span>مغلقة</span>
        </label>
      </RadioGroup>
    </div>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const on = canvas.getByRole('radio', { name: 'معاينة' });
    const off = canvas.getByRole('radio', { name: 'مغلقة' });

    await expect(on).toHaveAttribute('aria-checked', 'true');

    await userEvent.click(off);
    await expect(off).toHaveAttribute('aria-checked', 'true');
    await expect(on).toHaveAttribute('aria-checked', 'false');
    await expect(args.onValueChange).toHaveBeenCalledWith(
      'rtl-off',
      expect.anything(),
    );
  },
};

export const RoleAndAriaState: Story = {
  name: 'Interaction: role, aria-checked, data-checked surface',
  args: { defaultValue: 'billing', 'aria-label': 'Options' },
  render: (args) => (
    <RadioGroup {...args}>
      <OptionList />
    </RadioGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const billing = canvas.getByRole('radio', { name: /billing/i });
    const promotions = canvas.getByRole('radio', { name: /promotions/i });

    await expect(billing).toHaveAttribute('role', 'radio');
    await expect(billing).toHaveAttribute('aria-checked', 'true');
    await expect(billing).toHaveAttribute('data-checked');
    await expect(billing).not.toHaveAttribute('data-unchecked');

    await expect(promotions).toHaveAttribute('aria-checked', 'false');
    await expect(promotions).toHaveAttribute('data-unchecked');
    await expect(promotions).not.toHaveAttribute('data-checked');

    const inputs = canvasElement.querySelectorAll('input[type="radio"]');
    await expect(inputs).toHaveLength(3);
    for (const input of Array.from(inputs)) {
      await expect(input).toHaveAttribute('aria-hidden', 'true');
      await expect(input).toHaveAttribute('tabindex', '-1');
    }
    const checkedInput = Array.from(inputs).find(
      (input) => (input as HTMLInputElement).checked,
    );
    expect(checkedInput).toBeDefined();
    await expect(checkedInput).toHaveAttribute('value', 'billing');
  },
};

export const DataSlotNames: Story = {
  name: 'Interaction: data-slot names',
  args: { defaultValue: 'billing', 'aria-label': 'Options' },
  render: (args) => (
    <RadioGroup {...args}>
      <OptionList />
    </RadioGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('radiogroup');
    await expect(group).toHaveAttribute('data-slot', 'radio-group');

    const billing = canvas.getByRole('radio', { name: /billing/i });
    const promotions = canvas.getByRole('radio', { name: /promotions/i });
    await expect(billing).toHaveAttribute('data-slot', 'radio-group-item');
    await expect(promotions).toHaveAttribute('data-slot', 'radio-group-item');

    const indicator = canvasElement.querySelector(
      '[data-slot="radio-group-indicator"]',
    );
    expect(indicator).not.toBeNull();
    await expect(billing).toContainElement(indicator as HTMLElement);
    await expect(promotions).not.toContainElement(indicator as HTMLElement);
  },
};

export const NameAndRequired: Story = {
  name: 'Interaction: name and required surface',
  args: { name: 'plan', required: true, 'aria-label': 'Options' },
  render: (args) => (
    <RadioGroup {...args}>
      <OptionList />
    </RadioGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('radiogroup');
    await expect(group).toHaveAttribute('aria-required', 'true');

    const inputs = canvasElement.querySelectorAll<HTMLInputElement>(
      'input[type="radio"]',
    );
    await expect(inputs).toHaveLength(3);
    for (const input of Array.from(inputs)) {
      await expect(input).toHaveAttribute('name', 'plan');
      await expect(input).toHaveAttribute('required');
    }
  },
};