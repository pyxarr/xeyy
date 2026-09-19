import type { Meta, StoryObj } from '@storybook/react-vite';
import * as stylex from '@stylexjs/stylex';
import { useState, type ReactNode } from 'react';
import { expect, fireEvent, fn, userEvent, within } from 'storybook/test';
import { Checkbox } from '@xeyy/components';

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  parameters: {
    a11y: { test: 'error' },
  },
  args: {
    onCheckedChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const demoStyles = stylex.create({
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },
});

const rowInline = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

function FieldLikeControl({
  title,
  helper,
  children,
}: {
  title: string;
  helper: string;
  children: ReactNode;
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <span style={{ fontWeight: 600 }}>{title}</span>
      {children}
      <span style={{ fontSize: '12px', color: '#6b7280' }}>{helper}</span>
    </label>
  );
}

function SelectAllCheckboxes({
  dir,
  initial,
}: {
  dir?: 'rtl' | 'ltr';
  initial?: { one?: boolean; two?: boolean };
}) {
  const [itemOne, setItemOne] = useState(initial?.one ?? false);
  const [itemTwo, setItemTwo] = useState(initial?.two ?? false);
  const selected = [itemOne, itemTwo].filter(Boolean).length;
  const allChecked = selected === 2;
  const someChecked = selected > 0 && !allChecked;
  return (
    <div dir={dir} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <label style={rowInline}>
        <Checkbox
          checked={allChecked}
          indeterminate={someChecked}
          onCheckedChange={(value) => {
            setItemOne(value);
            setItemTwo(value);
          }}
        />
        <span>Select all</span>
      </label>
      <label style={rowInline}>
        <Checkbox checked={itemOne} onCheckedChange={setItemOne} />
        <span>Item one</span>
      </label>
      <label style={rowInline}>
        <Checkbox checked={itemTwo} onCheckedChange={setItemTwo} />
        <span>Item two</span>
      </label>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Visual stories
// ---------------------------------------------------------------------------

export const Unchecked: Story = {
  render: (args) => (
    <label {...stylex.props(demoStyles.label)}>
      <Checkbox {...args} />
      Unchecked
    </label>
  ),
};

export const Checked: Story = {
  render: (args) => (
    <label {...stylex.props(demoStyles.label)}>
      <Checkbox {...args} defaultChecked />
      Checked
    </label>
  ),
};

export const Indeterminate: Story = {
  render: (args) => (
    <label {...stylex.props(demoStyles.label)}>
      <Checkbox {...args} indeterminate />
      Indeterminate
    </label>
  ),
};

export const IndeterminateWithChildren: Story = {
  name: 'Indeterminate with children labels',
  render: (args) => (
    <div {...stylex.props(demoStyles.column)}>
      <label {...stylex.props(demoStyles.label)}>
        <Checkbox {...args} indeterminate />
        Select all
      </label>
      <div {...stylex.props(demoStyles.row)}>
        <label {...stylex.props(demoStyles.label)}>
          <Checkbox {...args} defaultChecked />
          Quote updates
        </label>
        <label {...stylex.props(demoStyles.label)}>
          <Checkbox {...args} />
          Newsletter
        </label>
      </div>
    </div>
  ),
};

export const DisabledStates: Story = {
  name: 'Disabled: unchecked, checked, indeterminate',
  render: (args) => (
    <div {...stylex.props(demoStyles.row)}>
      <label {...stylex.props(demoStyles.label)}>
        <Checkbox {...args} disabled />
        Disabled
      </label>
      <label {...stylex.props(demoStyles.label)}>
        <Checkbox {...args} disabled defaultChecked />
        Disabled checked
      </label>
      <label {...stylex.props(demoStyles.label)}>
        <Checkbox {...args} disabled indeterminate />
        Disabled indeterminate
      </label>
    </div>
  ),
};

export const Invalid: Story = {
  name: 'Invalid (aria-invalid)',
  render: (args) => (
    <label {...stylex.props(demoStyles.label)}>
      <Checkbox {...args} aria-invalid="true" />
      Invalid
    </label>
  ),
};

export const FieldLabelWrapper: Story = {
  name: 'Field-like label wrapper',
  render: (args) => (
    <FieldLikeControl title="Notifications" helper="You will receive a weekly digest.">
      <Checkbox {...args} />
    </FieldLikeControl>
  ),
};

export const Rtl: Story = {
  name: 'RTL',
  render: (args) => (
    <div dir="rtl" {...stylex.props(demoStyles.row)}>
      <label {...stylex.props(demoStyles.label)}>
        <Checkbox {...args} defaultChecked />
        Checked
      </label>
      <label {...stylex.props(demoStyles.label)}>
        <Checkbox {...args} />
        Unchecked
      </label>
      <label {...stylex.props(demoStyles.label)}>
        <Checkbox {...args} indeterminate />
        Indeterminate
      </label>
    </div>
  ),
};

export const SelectAllComposite: Story = {
  name: 'Select-all composite',
  render: () => <SelectAllCheckboxes />,
};

// ---------------------------------------------------------------------------
// Interaction tests
// ---------------------------------------------------------------------------

export const InteractionToggle: Story = {
  name: 'Interaction: click toggles checked state',
  render: (args) => (
    <label {...stylex.props(demoStyles.label)}>
      <Checkbox {...args} />
      <span>Toggle me</span>
    </label>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox', { name: /toggle me/i });
    await expect(checkbox).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(checkbox);
    await expect(checkbox).toHaveAttribute('aria-checked', 'true');
    await expect(args.onCheckedChange).toHaveBeenCalledWith(true, expect.anything());
    await userEvent.click(checkbox);
    await expect(checkbox).toHaveAttribute('aria-checked', 'false');
    await expect(args.onCheckedChange).toHaveBeenCalledWith(false, expect.anything());
    await expect(args.onCheckedChange).toHaveBeenCalledTimes(2);
  },
};

export const InteractionKeyboardSpace: Story = {
  name: 'Interaction: Space toggles',
  render: (args) => (
    <label {...stylex.props(demoStyles.label)}>
      <Checkbox {...args} />
      <span>Space me</span>
    </label>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox', { name: /space me/i });
    checkbox.focus();
    await expect(checkbox).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(checkbox).toHaveAttribute('aria-checked', 'true');
    await expect(args.onCheckedChange).toHaveBeenCalledWith(true, expect.anything());
  },
};

export const InteractionEnterDoesNotToggle: Story = {
  name: 'Interaction: Enter does not toggle',
  render: (args) => (
    <label {...stylex.props(demoStyles.label)}>
      <Checkbox {...args} />
      <span>Enter me</span>
    </label>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox', { name: /enter me/i });
    checkbox.focus();
    await expect(checkbox).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(checkbox).toHaveAttribute('aria-checked', 'false');
    await expect(args.onCheckedChange).not.toHaveBeenCalled();
  },
};

export const InteractionIndeterminateClickChecks: Story = {
  name: 'Interaction: clicking an indeterminate box checks it',
  render: () => <SelectAllCheckboxes initial={{ one: true, two: false }} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const parent = canvas.getByRole('checkbox', { name: /select all/i });
    await expect(parent).toHaveAttribute('aria-checked', 'mixed');
    await expect(parent).toHaveAttribute('data-indeterminate');
    const indicator = canvasElement.querySelector('[data-slot="checkbox-indicator"]');
    await expect(indicator).not.toBeNull();
    await expect(indicator?.querySelector('path')).toHaveAttribute('d', 'M5 12h14');
    await userEvent.click(parent);
    await expect(parent).toHaveAttribute('aria-checked', 'true');
    await expect(parent).not.toHaveAttribute('data-indeterminate');
    await expect(canvas.getByRole('checkbox', { name: /item one/i })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await expect(canvas.getByRole('checkbox', { name: /item two/i })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  },
};

export const InteractionDisabledDoesNotToggle: Story = {
  name: 'Interaction: disabled does not toggle',
  render: (args) => (
    <label {...stylex.props(demoStyles.label)}>
      <Checkbox {...args} disabled />
      <span>Disabled</span>
    </label>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox', { name: /^disabled$/i });
    await expect(checkbox).toHaveAttribute('aria-checked', 'false');
    await expect(checkbox).toHaveAttribute('data-disabled');
    await expect(checkbox).toHaveAttribute('tabindex', '-1');
    await fireEvent.click(checkbox);
    await expect(checkbox).toHaveAttribute('aria-checked', 'false');
    await expect(args.onCheckedChange).not.toHaveBeenCalled();
    const indicator = canvasElement.querySelector('[data-slot="checkbox-indicator"]');
    await expect(indicator).toBeNull();
  },
};

export const InteractionReadonlyDoesNotToggle: Story = {
  name: 'Interaction: readOnly does not toggle',
  render: (args) => (
    <label {...stylex.props(demoStyles.label)}>
      <Checkbox {...args} readOnly />
      <span>Read only</span>
    </label>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox', { name: /read only/i });
    await expect(checkbox).toHaveAttribute('aria-checked', 'false');
    await expect(checkbox).toHaveAttribute('data-readonly');
    await userEvent.click(checkbox);
    await expect(checkbox).toHaveAttribute('aria-checked', 'false');
    await expect(args.onCheckedChange).not.toHaveBeenCalled();
  },
};

export const InteractionRoleAndDataSlots: Story = {
  name: 'Interaction: role, aria-checked, data slots and glyphs',
  render: (args) => (
    <label {...stylex.props(demoStyles.label)}>
      <Checkbox {...args} />
      <span>Slots</span>
    </label>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox', { name: /slots/i });
    await expect(checkbox).toHaveAttribute('role', 'checkbox');
    await expect(checkbox).toHaveAttribute('data-slot', 'checkbox');
    await expect(checkbox).toHaveAttribute('aria-checked', 'false');
    await expect(checkbox).toHaveAttribute('data-unchecked');
    await expect(canvasElement.querySelector('[data-slot="checkbox-indicator"]')).toBeNull();
    await userEvent.click(checkbox);
    await expect(checkbox).toHaveAttribute('aria-checked', 'true');
    await expect(checkbox).toHaveAttribute('data-checked');
    await expect(checkbox).not.toHaveAttribute('data-unchecked');
    const indicator = canvasElement.querySelector('[data-slot="checkbox-indicator"]');
    await expect(indicator).not.toBeNull();
    await expect(indicator?.querySelector('path')).toHaveAttribute('d', 'M20 6 9 17l-5-5');
  },
};

export const InteractionLabelClick: Story = {
  name: 'Interaction: clicking the label text toggles',
  render: (args) => (
    <label {...stylex.props(demoStyles.label)}>
      <Checkbox {...args} />
      <span>Accept terms</span>
    </label>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox', { name: /accept terms/i });
    await expect(checkbox).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(canvas.getByText('Accept terms'));
    await expect(checkbox).toHaveAttribute('aria-checked', 'true');
    await expect(args.onCheckedChange).toHaveBeenCalledWith(true, expect.anything());
  },
};

export const InteractionControlledVsUncontrolled: Story = {
  name: 'Interaction: controlled vs uncontrolled',
  render: (args) => (
    <div {...stylex.props(demoStyles.column)}>
      <label {...stylex.props(demoStyles.label)}>
        <Checkbox {...args} checked={false} />
        <span>Controlled (pinned false)</span>
      </label>
      <label {...stylex.props(demoStyles.label)}>
        <Checkbox {...args} defaultChecked={false} />
        <span>Uncontrolled</span>
      </label>
    </div>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const controlled = canvas.getByRole('checkbox', { name: /^controlled/i });
    const uncontrolled = canvas.getByRole('checkbox', { name: /^uncontrolled/i });
    await expect(controlled).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(controlled);
    await expect(controlled).toHaveAttribute('aria-checked', 'false');
    await expect(uncontrolled).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(uncontrolled);
    await expect(uncontrolled).toHaveAttribute('aria-checked', 'true');
    await expect(args.onCheckedChange).toHaveBeenCalledTimes(2);
  },
};

export const InteractionSelectAllComposite: Story = {
  name: 'Interaction: select-all composite',
  render: () => <SelectAllCheckboxes />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const parent = canvas.getByRole('checkbox', { name: /select all/i });
    const itemOne = canvas.getByRole('checkbox', { name: /item one/i });
    const itemTwo = canvas.getByRole('checkbox', { name: /item two/i });
    await expect(parent).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(parent);
    await expect(itemOne).toHaveAttribute('aria-checked', 'true');
    await expect(itemTwo).toHaveAttribute('aria-checked', 'true');
    await expect(parent).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(itemOne);
    await expect(itemOne).toHaveAttribute('aria-checked', 'false');
    await expect(itemTwo).toHaveAttribute('aria-checked', 'true');
    await expect(parent).toHaveAttribute('aria-checked', 'mixed');
    await expect(parent).toHaveAttribute('data-indeterminate');
    await userEvent.click(parent);
    await expect(itemOne).toHaveAttribute('aria-checked', 'true');
    await expect(itemTwo).toHaveAttribute('aria-checked', 'true');
  },
};

export const InteractionRtlSelectAllComposite: Story = {
  name: 'Interaction: RTL select-all composite',
  render: () => <SelectAllCheckboxes dir="rtl" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const parent = canvas.getByRole('checkbox', { name: /select all/i });
    const itemOne = canvas.getByRole('checkbox', { name: /item one/i });
    const itemTwo = canvas.getByRole('checkbox', { name: /item two/i });
    await expect(parent.closest('[dir="rtl"]')).not.toBeNull();
    await userEvent.click(itemOne);
    await expect(itemOne).toHaveAttribute('aria-checked', 'true');
    await expect(parent).toHaveAttribute('aria-checked', 'mixed');
    await expect(parent).toHaveAttribute('data-indeterminate');
    await userEvent.click(parent);
    await expect(itemOne).toHaveAttribute('aria-checked', 'true');
    await expect(itemTwo).toHaveAttribute('aria-checked', 'true');
  },
};