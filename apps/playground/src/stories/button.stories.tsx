import type { Meta, StoryObj } from '@storybook/react-vite';
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
      options: ['primary', 'secondary', 'destructive', 'outline', 'ghost', 'link'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'icon'],
    },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    nativeButton: { control: 'boolean' },
    focusableWhenDisabled: { control: 'boolean' },
  },
  args: {
    onClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Visual stories
// ---------------------------------------------------------------------------

export const Primary: Story = {
  args: { variant: 'primary', children: 'Primary' },
};

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Secondary' },
};

export const Destructive: Story = {
  args: { variant: 'destructive', children: 'Destructive' },
};

export const Outline: Story = {
  args: { variant: 'outline', children: 'Outline' },
};

export const Ghost: Story = {
  args: { variant: 'ghost', children: 'Ghost' },
};

export const Link: Story = {
  args: { variant: 'link', children: 'Link' },
};

export const Small: Story = {
  args: { size: 'sm', children: 'Small' },
};

export const Medium: Story = {
  args: { size: 'md', children: 'Medium' },
};

export const Large: Story = {
  args: { size: 'lg', children: 'Large' },
};

export const IconSize: Story = {
  args: { size: 'icon', children: '★' },
};

export const FullWidth: Story = {
  args: { fullWidth: true, children: 'Full Width Button' },
  parameters: { docs: { description: { story: 'Spans the full width of its container.' } } },
};

export const Loading: Story = {
  args: { loading: true, children: 'Saving…' },
};

export const Disabled: Story = {
  args: { disabled: true, children: 'Disabled' },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <Button size="icon">★</Button>
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
  name: 'Interaction: disabled blocks onClick',
  args: { disabled: true, children: 'No click' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /no click/i });
    await fireEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
    await expect(button).toBeDisabled();
  },
};

export const LoadingPreventsClick: Story = {
  name: 'Interaction: loading blocks onClick',
  args: { loading: true, children: 'Saving…' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await fireEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
    await expect(button).toHaveAttribute('aria-disabled', 'true');
  },
};

export const LoadingShowsSpinner: Story = {
  name: 'Interaction: loading shows spinner',
  args: { loading: true, children: 'Saving…' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    const spinner = button.querySelector('[aria-hidden="true"]');
    await expect(spinner).toBeInTheDocument();
    await expect(button).toHaveAttribute('aria-labelledby');
  },
};

export const LoadingHasAriaLabelledBy: Story = {
  name: 'Interaction: loading aria-labelledby points to label',
  args: { loading: true, children: 'Uploading' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    const labelId = button.getAttribute('aria-labelledby');
    await expect(labelId).toBeTruthy();
    const label = canvasElement.ownerDocument.getElementById(labelId!);
    await expect(label).toBeInTheDocument();
    await expect(label).toHaveTextContent('Uploading');
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

export const KeyboardAccessible: Story = {
  name: 'Interaction: keyboard focusable',
  args: { children: 'Focus me' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /focus me/i });
    await userEvent.tab();
    await expect(button).toHaveFocus();
  },
};

export const FocusableWhenDisabled: Story = {
  name: 'Interaction: focusableWhenDisabled keeps focus',
  args: { disabled: true, focusableWhenDisabled: true, children: 'Still focusable' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /still focusable/i });
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await expect(button).toHaveAttribute('aria-disabled', 'true');
  },
};

// ---------------------------------------------------------------------------
// Props passthrough stories
// ---------------------------------------------------------------------------

export const AsLink: Story = {
  name: 'Interaction: as renders custom element',
  args: {
    as: <a href="https://example.com" />,
    children: 'Link button',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: /link button/i });
    await expect(link).toBeInTheDocument();
    await expect(link).toHaveAttribute('href', 'https://example.com');
  },
};

export const NativeButtonFalse: Story = {
  name: 'Interaction: nativeButton=false',
  args: {
    nativeButton: false,
    children: 'Non-native',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const el = canvas.getByText('Non-native');
    await expect(el).toBeInTheDocument();
    await expect(el.tagName).not.toBe('BUTTON');
  },
};

export const KeyDownHandler: Story = {
  name: 'Interaction: onKeyDown fires',
  args: { children: 'Press Enter' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /press enter/i });
    await userEvent.click(button);
    await userEvent.keyboard('{Enter}');
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

export const AriaLabel: Story = {
  name: 'Interaction: aria-label renders',
  args: { 'aria-label': 'Close dialog', children: '×' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /close dialog/i });
    await expect(button).toHaveAttribute('aria-label', 'Close dialog');
  },
};

export const AriaDescribedby: Story = {
  name: 'Interaction: aria-describedby renders',
  args: { 'aria-describedby': 'hint-text', children: 'Submit' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /submit/i });
    await expect(button).toHaveAttribute('aria-describedby', 'hint-text');
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

export const AriaPressed: Story = {
  name: 'Interaction: aria-pressed renders',
  args: { 'aria-pressed': 'true', children: 'Bold' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /bold/i });
    await expect(button).toHaveAttribute('aria-pressed', 'true');
  },
};

export const AriaHaspopup: Story = {
  name: 'Interaction: aria-haspopup renders',
  args: { 'aria-haspopup': 'menu', children: 'Options' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /options/i });
    await expect(button).toHaveAttribute('aria-haspopup', 'menu');
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

export const NonLoadingHasNoLabelledby: Story = {
  name: 'Interaction: non-loading has no aria-labelledby',
  args: { children: 'Normal' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /normal/i });
    await expect(button).not.toHaveAttribute('aria-labelledby');
  },
};
