import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fireEvent, fn, userEvent, within } from 'storybook/test';
import { Switch } from '@xeyy/components';

const meta: Meta<typeof Switch> = {
  title: 'Components/Switch',
  component: Switch,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'default'],
    },
  },
  args: {
    'aria-label': 'Toggle',
    onCheckedChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Visual stories
// ---------------------------------------------------------------------------

export const Default: Story = {
  name: 'Unchecked',
};

export const Checked: Story = {
  name: 'Checked',
  args: { defaultChecked: true },
};

export const SizeDefault: Story = {
  name: 'Size: default',
};

export const SizeSm: Story = {
  name: 'Size: sm',
  args: { size: 'sm' },
};

export const AllSizes: Story = {
  name: 'All sizes',
  render: () => (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <Switch size="sm" aria-label="Small off" />
      <Switch size="sm" defaultChecked aria-label="Small on" />
      <Switch aria-label="Default off" />
      <Switch defaultChecked aria-label="Default on" />
    </div>
  ),
};

export const Disabled: Story = {
  name: 'Disabled (on and off)',
  render: () => (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <Switch disabled defaultChecked aria-label="Disabled on" />
      <Switch disabled aria-label="Disabled off" />
    </div>
  ),
};

export const Invalid: Story = {
  name: 'Invalid (aria-invalid)',
  render: () => (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <Switch aria-invalid="true" defaultChecked aria-label="Invalid on" />
      <Switch aria-invalid="true" aria-label="Invalid off" />
    </div>
  ),
};

export const Labeled: Story = {
  name: 'Labeled',
  render: () => (
    <label style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      Enable notifications
      <Switch />
    </label>
  ),
};

export const Rtl: Story = {
  name: 'RTL',
  render: () => (
    <div dir="rtl" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <Switch defaultChecked aria-label="RTL on" />
      <Switch size="sm" defaultChecked aria-label="RTL small on" />
      <Switch aria-label="RTL off" />
    </div>
  ),
};

export const RtlDisabled: Story = {
  name: 'RTL disabled',
  render: () => (
    <div dir="rtl" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <Switch disabled defaultChecked aria-label="RTL disabled on" />
      <Switch disabled aria-label="RTL disabled off" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggles = canvas.getAllByRole('switch');
    for (const toggle of toggles) {
      const before = toggle.getAttribute('aria-checked');
      await fireEvent.click(toggle);
      await expect(toggle.getAttribute('aria-checked')).toBe(before);
    }
  },
};

// ---------------------------------------------------------------------------
// Interaction tests
// ---------------------------------------------------------------------------

export const ClickTurnsOn: Story = {
  name: 'Interaction: click turns on',
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('switch');
    await expect(toggle).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(toggle);
    await expect(args.onCheckedChange).toHaveBeenCalledWith(true, expect.any(Object));
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
    await expect(toggle).toHaveAttribute('data-checked', '');
  },
};

export const ClickTurnsOff: Story = {
  name: 'Interaction: click turns off',
  args: { defaultChecked: true },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('switch');
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(toggle);
    await expect(args.onCheckedChange).toHaveBeenCalledWith(false, expect.any(Object));
    await expect(toggle).toHaveAttribute('aria-checked', 'false');
    await expect(toggle).toHaveAttribute('data-unchecked', '');
  },
};

export const KeyboardEnterToggles: Story = {
  name: 'Interaction: Enter toggles',
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('switch');
    toggle.focus();
    await expect(toggle).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onCheckedChange).toHaveBeenCalledWith(true, expect.any(Object));
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
  },
};

export const KeyboardSpaceToggles: Story = {
  name: 'Interaction: Space toggles',
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('switch');
    toggle.focus();
    await expect(toggle).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(args.onCheckedChange).toHaveBeenCalledWith(true, expect.any(Object));
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
  },
};

export const TabFocusable: Story = {
  name: 'Interaction: keyboard focusable',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('switch');
    await userEvent.tab();
    await expect(toggle).toHaveFocus();
  },
};

export const DisabledDoesNotToggle: Story = {
  name: 'Interaction: disabled does not toggle',
  args: { disabled: true, defaultChecked: true },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('switch');
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
    await expect(toggle).toHaveAttribute('data-disabled', '');
    await fireEvent.click(toggle);
    await expect(args.onCheckedChange).not.toHaveBeenCalled();
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
  },
};

export const Controlled: Story = {
  name: 'Interaction: controlled does not self-toggle',
  args: { checked: false },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('switch');
    await userEvent.click(toggle);
    await expect(args.onCheckedChange).toHaveBeenCalledWith(true, expect.any(Object));
    await expect(toggle).toHaveAttribute('aria-checked', 'false');
  },
};

export const Uncontrolled: Story = {
  name: 'Interaction: uncontrolled self-toggles',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('switch');
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
  },
};

export const DataAttributes: Story = {
  name: 'Interaction: data-slot and data-size',
  args: { size: 'sm' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('switch');
    await expect(toggle).toHaveAttribute('data-slot', 'switch');
    await expect(toggle).toHaveAttribute('data-size', 'sm');
    const thumb = canvasElement.querySelector('[data-slot="switch-thumb"]');
    await expect(thumb).not.toBeNull();
    await expect(toggle).toHaveAttribute('tabindex', '0');
  },
};