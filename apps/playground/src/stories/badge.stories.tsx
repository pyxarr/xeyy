import type { Meta, StoryObj } from '@storybook/react-vite';
import * as stylex from '@stylexjs/stylex';
import { expect, within } from 'storybook/test';
import { Badge, badgeVariants } from '@xeyy/components';

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  tags: ['autodocs'],
  parameters: {
    a11y: { test: 'error' },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline', 'ghost', 'link'],
    },
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

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="ghost">Ghost</Badge>
      <Badge variant="link">Link</Badge>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Visual stories — icons, links, invalid, composition, RTL
// ---------------------------------------------------------------------------

function CheckIcon({ side }: { side: 'inline-start' | 'inline-end' }) {
  return (
    <svg
      data-icon={side}
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export const IconInlineStart: Story = {
  name: 'Icon: inline-start',
  render: () => (
    <Badge>
      <CheckIcon side="inline-start" />
      Completed
    </Badge>
  ),
};

export const IconInlineEnd: Story = {
  name: 'Icon: inline-end',
  render: () => (
    <Badge variant="outline">
      Owner
      <CheckIcon side="inline-end" />
    </Badge>
  ),
};

export const AsLink: Story = {
  name: 'As link',
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <Badge>
        <a href="https://example.com" style={{ color: 'inherit' }}>Docs</a>
      </Badge>

      <Badge variant="outline">
        <a href="https://example.com" style={{ color: 'inherit' }}>Status</a>
      </Badge>
    </div>
  ),
};

export const Invalid: Story = {
  name: 'Invalid (aria-invalid)',
  args: {
    variant: 'outline',
    'aria-invalid': 'true',
    children: 'Invalid',
  },
};

const fullWidthStyles = stylex.create({
  badge: { width: '100%', justifyContent: 'center' },
});

export const FullWidth: Story = {
  name: 'Full width (style override)',
  render: () => <Badge style={fullWidthStyles.badge}>Notification</Badge>,
};

const pillStyles = stylex.create({
  badge: {
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    paddingInline: '0.75rem',
    fontSize: '0.6875rem',
    fontWeight: '700',
  },
});

export const CustomStyling: Story = {
  name: 'Custom styling (style composition)',
  render: () => <Badge style={pillStyles.badge}>Release candidate</Badge>,
};

export const VariantsFunction: Story = {
  name: 'badgeVariants function',
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      <span {...stylex.props(...badgeVariants())}>span badge</span>

      <button type="button" {...stylex.props(...badgeVariants({ variant: 'outline' }))}>
        button badge
      </button>
    </div>
  ),
};

export const Rtl: Story = {
  name: 'RTL',
  render: () => (
    <div dir="rtl" style={{ display: 'flex', gap: '8px' }}>
      <Badge>
        <CheckIcon side="inline-start" />
        شارة
      </Badge>

      <Badge variant="secondary">
        حالة
        <CheckIcon side="inline-end" />
      </Badge>
    </div>
  ),
};

export const StatusBoard: Story = {
  name: 'Realistic combinations',
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
      <Badge variant="outline">v1.4.2</Badge>

      <Badge variant="secondary">Stable</Badge>

      <Badge>
        <CheckIcon side="inline-start" />
        Running
      </Badge>

      <Badge variant="destructive">Degraded</Badge>

      <Badge variant="ghost">Internal</Badge>

      <Badge variant="link">
        <a href="https://example.com" style={{ color: 'inherit' }}>View docs</a>
      </Badge>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Interaction tests — static prop/data-slot assertions
// ---------------------------------------------------------------------------

export const DataSlotPresent: Story = {
  name: 'Interaction: data-slot=badge',
  args: { children: 'Slot' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('Slot');
    await expect(badge).toHaveAttribute('data-slot', 'badge');
  },
};

export const DataVariant: Story = {
  name: 'Interaction: data-variant reflects variant',
  args: { variant: 'outline', children: 'Variant' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('Variant');
    await expect(badge).toHaveAttribute('data-variant', 'outline');
  },
};

export const DefaultTagName: Story = {
  name: 'Interaction: renders as <span> by default',
  args: { children: 'Span' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('Span');
    await expect(badge.tagName).toBe('SPAN');
    await expect(badge).toHaveAttribute('data-variant', 'default');
  },
};

export const RenderAsLink: Story = {
  name: 'Interaction: render as <a>',
  args: {
    render: <a href="https://example.com" />,
    children: 'Link badge',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: /link badge/i });
    await expect(link).toBeInTheDocument();
    await expect(link).toHaveAttribute('href', 'https://example.com');
    await expect(link).toHaveAttribute('data-slot', 'badge');
  },
};

export const RenderAsDiv: Story = {
  name: 'Interaction: render as <div>',
  args: {
    render: <div />,
    children: 'Div badge',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('Div badge');
    await expect(badge.tagName).toBe('DIV');
    await expect(badge).toHaveAttribute('data-slot', 'badge');
  },
};

export const IdPassthrough: Story = {
  name: 'Interaction: id renders on element',
  args: { id: 'release-badge', children: 'With ID' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('With ID');
    await expect(badge).toHaveAttribute('id', 'release-badge');
  },
};

export const AriaLabel: Story = {
  name: 'Interaction: aria-label renders',
  args: { 'aria-label': '3 unread items', children: '3' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('3');
    await expect(badge).toHaveAttribute('aria-label', '3 unread items');
  },
};

export const AriaInvalid: Story = {
  name: 'Interaction: aria-invalid renders',
  args: { variant: 'outline', 'aria-invalid': 'true', children: 'Invalid' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('Invalid');
    await expect(badge).toHaveAttribute('aria-invalid', 'true');
  },
};