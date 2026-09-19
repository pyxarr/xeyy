import type { Meta, StoryObj } from '@storybook/react-vite';
import * as stylex from '@stylexjs/stylex';
import { expect, fireEvent, fn, userEvent, within } from 'storybook/test';
import { Button } from '@xeyy/components';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    a11y: { test: 'error' },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outline', 'secondary', 'ghost', 'destructive', 'link'],
    },
    size: {
      control: 'select',
      options: ['default', 'xs', 'sm', 'lg', 'icon', 'icon-xs', 'icon-sm', 'icon-lg'],
    },
  },
  args: {
    onClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Visual stories — one per variant
// ---------------------------------------------------------------------------

export const Default: Story = {
  args: { variant: 'default', children: 'Default' },
};

export const Outline: Story = {
  args: { variant: 'outline', children: 'Outline' },
};

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Secondary' },
};

export const Ghost: Story = {
  args: { variant: 'ghost', children: 'Ghost' },
};

export const Destructive: Story = {
  args: { variant: 'destructive', children: 'Destructive' },
};

export const Link: Story = {
  args: { variant: 'link', children: 'Link' },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <Button variant="default">Default</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Visual stories — one per size
// ---------------------------------------------------------------------------

export const SizeDefault: Story = {
  name: 'Size: default',
  args: { size: 'default', children: 'Default' },
};

export const SizeXs: Story = {
  name: 'Size: xs',
  args: { size: 'xs', children: 'XS' },
};

export const SizeSm: Story = {
  name: 'Size: sm',
  args: { size: 'sm', children: 'SM' },
};

export const SizeLg: Story = {
  name: 'Size: lg',
  args: { size: 'lg', children: 'LG' },
};

export const SizeIcon: Story = {
  name: 'Size: icon',
  args: { size: 'icon', children: '★' },
};

export const SizeIconXs: Story = {
  name: 'Size: icon-xs',
  args: { size: 'icon-xs', children: '★' },
};

export const SizeIconSm: Story = {
  name: 'Size: icon-sm',
  args: { size: 'icon-sm', children: '★' },
};

export const SizeIconLg: Story = {
  name: 'Size: icon-lg',
  args: { size: 'icon-lg', children: '★' },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      <Button size="default">Default</Button>
      <Button size="xs">XS</Button>
      <Button size="sm">SM</Button>
      <Button size="lg">LG</Button>
      <Button size="icon">★</Button>
      <Button size="icon-xs">★</Button>
      <Button size="icon-sm">★</Button>
      <Button size="icon-lg">★</Button>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Visual stories — states, icons, RTL
// ---------------------------------------------------------------------------

export const Disabled: Story = {
  args: { disabled: true, children: 'Disabled' },
};

export const Invalid: Story = {
  name: 'Invalid (aria-invalid)',
  args: { 'aria-invalid': 'true', children: 'Invalid' },
};

const fullWidthStyles = stylex.create({
  button: { width: '100%', justifyContent: 'center' },
});

export const FullWidth: Story = {
  name: 'Full width (style override)',
  render: () => <Button style={fullWidthStyles.button}>Full width</Button>,
};

export const IconStart: Story = {
  name: 'Icon: inline-start',
  render: () => (
    <Button>
      <svg data-icon="inline-start" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M21 12a9 9 0 1 1-6.2-8.6" />
      </svg>
      Refresh
    </Button>
  ),
};

export const IconEnd: Story = {
  name: 'Icon: inline-end',
  render: () => (
    <Button>
      Save
      <svg data-icon="inline-end" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </Button>
  ),
};

export const Rtl: Story = {
  name: 'RTL',
  render: () => (
    <div style={{ display: 'flex', gap: '8px' }} dir="rtl">
      <Button>زر</Button>
      <Button variant="outline">التالي</Button>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Interaction tests
// ---------------------------------------------------------------------------

export const ClickFiresOnClick: Story = {
  name: 'Interaction: onClick fires',
  args: { children: 'Click me' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /click me/i });
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const DisabledPreventsClick: Story = {
  name: 'Interaction: disabled blocks onClick and click',
  args: { disabled: true, children: 'No click' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /no click/i });
    await expect(button).toBeDisabled();
    await fireEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const KeyboardActivation: Story = {
  name: 'Interaction: Enter activates',
  args: { children: 'Press Enter' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /press enter/i });
    button.focus();
    await expect(button).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const KeyboardSpaceActivation: Story = {
  name: 'Interaction: Space activates',
  args: { children: 'Press Space' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /press space/i });
    button.focus();
    await userEvent.keyboard(' ');
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const TabFocusable: Story = {
  name: 'Interaction: keyboard focusable',
  args: { children: 'Focus me' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /focus me/i });
    await userEvent.tab();
    await expect(button).toHaveFocus();
  },
};

export const TypeSubmit: Story = {
  name: 'Interaction: type=submit renders',
  args: { type: 'submit', children: 'Submit' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /submit/i });
    await expect(button).toHaveAttribute('type', 'submit');
  },
};

export const RenderAsLink: Story = {
  name: 'Interaction: render as <a>',
  args: {
    render: <a href="https://example.com" />,
    children: 'Link button',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: /link button/i });
    await expect(link).toBeInTheDocument();
    await expect(link).toHaveAttribute('href', 'https://example.com');
  },
};

export const RenderAsDiv: Story = {
  name: 'Interaction: render as <div>',
  args: {
    render: <div />,
    children: 'Div button',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const el = canvas.getByText('Div button');
    await expect(el.tagName).toBe('DIV');
  },
};

export const IdPassthrough: Story = {
  name: 'Interaction: id renders on element',
  args: { id: 'my-button', children: 'With ID' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /with id/i });
    await expect(button).toHaveAttribute('id', 'my-button');
  },
};

export const NamePassthrough: Story = {
  name: 'Interaction: name renders on element',
  args: { name: 'submit-btn', children: 'With name' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /with name/i });
    await expect(button).toHaveAttribute('name', 'submit-btn');
  },
};

export const FormPassthrough: Story = {
  name: 'Interaction: form renders on element',
  args: { form: 'my-form', children: 'Submit' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /submit/i });
    await expect(button).toHaveAttribute('form', 'my-form');
  },
};

export const AriaLabel: Story = {
  name: 'Interaction: aria-label renders',
  args: { 'aria-label': 'Close dialog', children: '×' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /close dialog/i });
    await expect(button).toHaveAttribute('aria-label', 'Close dialog');
  },
};

export const AriaExpanded: Story = {
  name: 'Interaction: aria-expanded renders',
  args: { 'aria-expanded': 'true', children: 'Menu' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /menu/i });
    await expect(button).toHaveAttribute('aria-expanded', 'true');
  },
};

export const AriaInvalid: Story = {
  name: 'Interaction: aria-invalid renders',
  args: { 'aria-invalid': 'true', children: 'Invalid' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /invalid/i });
    await expect(button).toHaveAttribute('aria-invalid', 'true');
  },
};

export const DataSlotPresent: Story = {
  name: 'Interaction: data-slot=button',
  args: { children: 'Slot' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /slot/i });
    await expect(button).toHaveAttribute('data-slot', 'button');
  },
};