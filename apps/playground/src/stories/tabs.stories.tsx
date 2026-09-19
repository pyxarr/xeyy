import type { CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fireEvent, fn, userEvent, within } from 'storybook/test';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  type TabsListVariant,
  type TabsProps,
} from '@xeyy/components';

const meta: Meta<typeof Tabs> = {
  title: 'Components/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  parameters: {
    a11y: { test: 'error' },
  },
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
  },
  args: {
    onValueChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const tabItems = [
  {
    value: 'overview',
    label: 'Overview',
    content: 'Recent activity across all of your projects, grouped by day.',
  },
  {
    value: 'activity',
    label: 'Activity',
    content: 'Every push, merge, and comment from the last thirty days.',
  },
  {
    value: 'settings',
    label: 'Settings',
    content: 'Profile, notifications, and team preferences live here.',
  },
];

const panelStyle: CSSProperties = {
  backgroundColor: '#f4f4f5',
  color: '#18181b',
  border: '1px solid #e4e4e7',
  borderRadius: '6px',
  padding: '0.75rem 1rem',
};

const columnStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

type TabsDemoProps = TabsProps & {
  variant?: TabsListVariant;
  disabledValues?: readonly string[];
  activateOnFocus?: boolean;
  withContent?: boolean;
};

function TabsDemo({
  variant,
  disabledValues = [],
  activateOnFocus,
  withContent = true,
  ...tabsProps
}: TabsDemoProps) {
  return (
    <div style={columnStyle}>
      <Tabs {...tabsProps}>
        <TabsList variant={variant} activateOnFocus={activateOnFocus}>
          {tabItems.map((item) => (
            <TabsTrigger
              key={item.value}
              value={item.value}
              disabled={disabledValues.includes(item.value)}
            >
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {withContent &&
          tabItems.map((item) => (
            <TabsContent key={item.value} value={item.value}>
              <div style={panelStyle}>
                <strong>{item.label}</strong>
                <p style={{ margin: '4px 0 0' }}>{item.content}</p>
              </div>
            </TabsContent>
          ))}
      </Tabs>
    </div>
  );
}

function StarIcon() {
  return (
    <svg
      data-icon="inline-start"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M12 2l2.9 6.3 6.9.8-5.1 4.6 1.4 6.8L12 17.8 5.9 20.5l1.4-6.8L2.2 9.1l6.9-.8L12 2z" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg
      data-icon="inline-start"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Visual stories
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: (args) => (
    <TabsDemo {...args} defaultValue="overview" />
  ),
};

export const LineVariant: Story = {
  name: 'Variant: line',
  render: (args) => (
    <TabsDemo {...args} defaultValue="overview" variant="line" />
  ),
};

export const Vertical: Story = {
  name: 'Vertical',
  render: (args) => (
    <TabsDemo {...args} defaultValue="overview" orientation="vertical" />
  ),
};

export const VerticalLineVariant: Story = {
  name: 'Vertical: line',
  render: (args) => (
    <TabsDemo
      {...args}
      defaultValue="overview"
      orientation="vertical"
      variant="line"
    />
  ),
};

export const VariantsShowcase: Story = {
  name: 'Variants (default + line)',
  render: () => (
    <div style={{ ...columnStyle, gap: '1.5rem' }}>
      <TabsDemo defaultValue="overview" />
      <TabsDemo defaultValue="overview" variant="line" />
    </div>
  ),
};

export const WithIcons: Story = {
  name: 'Tabs with icons',
  render: () => (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">
          <StarIcon />
          Overview
        </TabsTrigger>
        <TabsTrigger value="activity">
          <BellIcon />
          Activity
        </TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <div style={panelStyle}>Favorites and pinned projects.</div>
      </TabsContent>
      <TabsContent value="activity">
        <div style={panelStyle}>Notifications and recent changes.</div>
      </TabsContent>
      <TabsContent value="settings">
        <div style={panelStyle}>Preferences.</div>
      </TabsContent>
    </Tabs>
  ),
};

export const DisabledTrigger: Story = {
  name: 'Disabled trigger',
  render: (args) => (
    <TabsDemo {...args} defaultValue="overview" disabledValues={['settings']} />
  ),
};

export const ControlledDemo: Story = {
  name: 'Controlled (stateful)',
  render: () => {
    function ControlledTabs() {
      const [value, setValue] = useState('overview');
      return (
        <Tabs value={value} onValueChange={setValue}>
          <TabsList>
            {tabItems.map((item) => (
              <TabsTrigger key={item.value} value={item.value}>
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabItems.map((item) => (
            <TabsContent key={item.value} value={item.value}>
              <div style={panelStyle}>
                <strong>{item.label}</strong>
                <p style={{ margin: '4px 0 0' }}>{item.content}</p>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      );
    }
    return <ControlledTabs />;
  },
};

export const Rtl: Story = {
  name: 'RTL',
  render: () => (
    <div dir="rtl" style={columnStyle}>
      <Tabs defaultValue="rtl-on">
        <TabsList>
          <TabsTrigger value="rtl-on">الرئيسية</TabsTrigger>
          <TabsTrigger value="rtl-off">الإعدادات</TabsTrigger>
        </TabsList>
        <TabsContent value="rtl-on">
          <div style={panelStyle}>اللوحة الرئيسية</div>
        </TabsContent>
        <TabsContent value="rtl-off">
          <div style={panelStyle}>لوحة الإعدادات</div>
        </TabsContent>
      </Tabs>
      <Tabs defaultValue="rtl-on">
        <TabsList variant="line">
          <TabsTrigger value="rtl-on">الرئيسية</TabsTrigger>
          <TabsTrigger value="rtl-off">الإعدادات</TabsTrigger>
        </TabsList>
        <TabsContent value="rtl-on">
          <div style={panelStyle}>اللوحة الرئيسية (line)</div>
        </TabsContent>
        <TabsContent value="rtl-off">
          <div style={panelStyle}>لوحة الإعدادات (line)</div>
        </TabsContent>
      </Tabs>
    </div>
  ),
};

export const RtlLineVariant: Story = {
  name: 'RTL: line',
  render: () => (
    <div dir="rtl" style={columnStyle}>
      <Tabs defaultValue="rtl-on">
        <TabsList variant="line">
          <TabsTrigger value="rtl-on">الرئيسية</TabsTrigger>
          <TabsTrigger value="rtl-off">الإعدادات</TabsTrigger>
        </TabsList>
        <TabsContent value="rtl-on">
          <div style={panelStyle}>اللوحة الرئيسية</div>
        </TabsContent>
        <TabsContent value="rtl-off">
          <div style={panelStyle}>لوحة الإعدادات</div>
        </TabsContent>
      </Tabs>
    </div>
  ),
};

export const VariousContent: Story = {
  name: 'Various content',
  render: () => (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <div style={panelStyle}>
          <strong>Overview</strong>
          <ul style={{ margin: '8px 0 0', paddingInlineStart: '1.25rem' }}>
            <li>12 pull requests merged</li>
            <li>4 issues closed</li>
            <li>2 releases published</li>
          </ul>
        </div>
      </TabsContent>
      <TabsContent value="activity">
        <div style={panelStyle}>
          <strong>Activity</strong>
          <p style={{ margin: '4px 0 0' }}>
            A longer paragraph describing the last thirty days of commits,
            reviews, and comments across the repository.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  ),
};

// ---------------------------------------------------------------------------
// Interaction tests
// ---------------------------------------------------------------------------

export const ClickActivates: Story = {
  name: 'Interaction: clicking a tab activates it',
  args: { defaultValue: 'overview' },
  render: (args) => <TabsDemo {...args} />,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const overview = canvas.getByRole('tab', { name: /overview/i });
    const activity = canvas.getByRole('tab', { name: /activity/i });

    await expect(overview).toHaveAttribute('data-active');
    await expect(overview).toHaveAttribute('aria-selected', 'true');
    await expect(canvas.getByRole('tabpanel')).toBeInTheDocument();

    await userEvent.click(activity);
    await expect(activity).toHaveAttribute('data-active');
    await expect(activity).toHaveAttribute('aria-selected', 'true');
    await expect(overview).not.toHaveAttribute('data-active');
    await expect(overview).toHaveAttribute('aria-selected', 'false');
    await expect(args.onValueChange).toHaveBeenCalledTimes(1);
    await expect(args.onValueChange).toHaveBeenCalledWith(
      'activity',
      expect.anything(),
    );

    const panel = canvas.getByRole('tabpanel');
    await expect(panel).toHaveAttribute('aria-labelledby', activity.id);
  },
};

export const A11yWiring: Story = {
  name: 'Interaction: a11y wiring (roles, aria, roving tabindex)',
  args: { defaultValue: 'overview' },
  render: (args) => <TabsDemo {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole('tablist');
    const tabs = canvas.getAllByRole('tab');
    await expect(tabs).toHaveLength(3);

    await expect(list).toHaveAttribute('role', 'tablist');
    for (const tab of tabs) {
      await expect(tab).toHaveAttribute('role', 'tab');
    }

    // Roving tabindex: only the active tab is in the tab order.
    await expect(tabs[0]).toHaveAttribute('tabindex', '0');
    await expect(tabs[1]).toHaveAttribute('tabindex', '-1');
    await expect(tabs[2]).toHaveAttribute('tabindex', '-1');

    // Panel wiring: aria-labelledby points at the active tab, aria-controls
    // on the tab points back at the panel.
    const panel = canvas.getByRole('tabpanel');
    await expect(panel).toHaveAttribute('role', 'tabpanel');
    await expect(panel).toHaveAttribute('tabindex', '0');
    const panelLabel = panel.getAttribute('aria-labelledby');
    const tabControls = tabs[0].getAttribute('aria-controls');
    await expect(panelLabel).toBeTruthy();
    await expect(tabControls).toBeTruthy();
    await expect(tabs[0]).toHaveAttribute('id', panelLabel ?? '');
    const controlledPanel = canvasElement.querySelector(
      `#${tabControls ?? ''}`,
    );
    await expect(controlledPanel).not.toBeNull();
    await expect(controlledPanel).toHaveAttribute('role', 'tabpanel');

    // Roving tabindex follows activation.
    await userEvent.click(tabs[2]);
    await expect(tabs[2]).toHaveAttribute('tabindex', '0');
    await expect(tabs[0]).toHaveAttribute('tabindex', '-1');
  },
};

export const KeyboardArrowsMoveFocus: Story = {
  name: 'Interaction: arrows move focus, Enter activates',
  args: { defaultValue: 'overview' },
  render: (args) => <TabsDemo {...args} />,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const overview = canvas.getByRole('tab', { name: /overview/i });
    const activity = canvas.getByRole('tab', { name: /activity/i });

    overview.focus();
    await expect(overview).toHaveFocus();

    await userEvent.keyboard('{ArrowRight}');
    await expect(activity).toHaveFocus();
    // Base UI defaults to manual activation: arrows move focus only.
    await expect(activity).not.toHaveAttribute('data-active');
    await expect(activity).toHaveAttribute('aria-selected', 'false');
    await expect(args.onValueChange).not.toHaveBeenCalled();

    await userEvent.keyboard('{ArrowLeft}');
    await expect(overview).toHaveFocus();
    await expect(overview).toHaveAttribute('data-active');

    await userEvent.keyboard('{ArrowRight}');
    await userEvent.keyboard('{Enter}');
    await expect(activity).toHaveAttribute('data-active');
    await expect(activity).toHaveAttribute('aria-selected', 'true');
    await expect(args.onValueChange).toHaveBeenCalledWith(
      'activity',
      expect.anything(),
    );
  },
};

export const KeyboardVerticalArrows: Story = {
  name: 'Interaction: vertical uses ArrowDown/ArrowUp',
  args: { orientation: 'vertical', defaultValue: 'overview' },
  render: (args) => <TabsDemo {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole('tablist');
    await expect(list).toHaveAttribute('aria-orientation', 'vertical');

    const overview = canvas.getByRole('tab', { name: /overview/i });
    const activity = canvas.getByRole('tab', { name: /activity/i });

    overview.focus();
    await expect(overview).toHaveFocus();

    await userEvent.keyboard('{ArrowDown}');
    await expect(activity).toHaveFocus();
    await expect(activity).not.toHaveAttribute('data-active');

    await userEvent.keyboard('{ArrowUp}');
    await expect(overview).toHaveFocus();
    await expect(overview).toHaveAttribute('data-active');
  },
};

export const KeyboardHomeEnd: Story = {
  name: 'Interaction: Home/End move focus',
  args: { defaultValue: 'overview' },
  render: (args) => <TabsDemo {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const overview = canvas.getByRole('tab', { name: /overview/i });
    const settings = canvas.getByRole('tab', { name: /settings/i });

    overview.focus();
    await expect(overview).toHaveFocus();

    await userEvent.keyboard('{End}');
    await expect(settings).toHaveFocus();
    await expect(settings).not.toHaveAttribute('data-active');

    await userEvent.keyboard('{Home}');
    await expect(overview).toHaveFocus();
  },
};

export const KeyboardActivation: Story = {
  name: 'Interaction: Enter and Space activate focused tab',
  args: { defaultValue: 'overview' },
  render: (args) => <TabsDemo {...args} />,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const overview = canvas.getByRole('tab', { name: /overview/i });
    const activity = canvas.getByRole('tab', { name: /activity/i });
    const settings = canvas.getByRole('tab', { name: /settings/i });

    overview.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(activity).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(activity).toHaveAttribute('data-active');
    await expect(args.onValueChange).toHaveBeenCalledTimes(1);

    activity.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(settings).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(settings).toHaveAttribute('data-active');
    await expect(settings).toHaveAttribute('aria-selected', 'true');
    await expect(args.onValueChange).toHaveBeenCalledTimes(2);
  },
};

export const DisabledTabNotActivatable: Story = {
  name: 'Interaction: disabled tab is not activatable',
  args: { defaultValue: 'overview' },
  render: (args) => (
    <TabsDemo {...args} disabledValues={['settings']} />
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const settings = canvas.getByRole('tab', { name: /settings/i });
    const overview = canvas.getByRole('tab', { name: /overview/i });

    await expect(settings).toHaveAttribute('aria-disabled', 'true');
    await expect(settings).toHaveAttribute('data-disabled');
    await expect(settings).toHaveAttribute('tabindex', '-1');
    await expect(settings).toHaveAttribute('aria-selected', 'false');

    fireEvent.click(settings);
    await expect(settings).not.toHaveAttribute('data-active');
    await expect(settings).toHaveAttribute('aria-selected', 'false');
    await expect(args.onValueChange).not.toHaveBeenCalled();

    // Keyboard navigation skips the disabled tab.
    overview.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(settings).not.toHaveFocus();
    await expect(settings).not.toHaveAttribute('data-active');
  },
};

export const ControlledPinned: Story = {
  name: 'Interaction: controlled (pinned value)',
  args: { value: 'overview' },
  render: (args) => <TabsDemo {...args} />,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const overview = canvas.getByRole('tab', { name: /overview/i });
    const activity = canvas.getByRole('tab', { name: /activity/i });

    await expect(overview).toHaveAttribute('data-active');

    await userEvent.click(activity);
    await expect(args.onValueChange).toHaveBeenCalledWith(
      'activity',
      expect.anything(),
    );
    // A pinned value keeps the rendered state on 'overview'.
    await expect(activity).not.toHaveAttribute('data-active');
    await expect(overview).toHaveAttribute('data-active');
  },
};

export const UncontrolledDefault: Story = {
  name: 'Interaction: uncontrolled via defaultValue',
  args: { defaultValue: 'overview' },
  render: (args) => <TabsDemo {...args} />,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const overview = canvas.getByRole('tab', { name: /overview/i });
    const activity = canvas.getByRole('tab', { name: /activity/i });

    await expect(overview).toHaveAttribute('data-active');

    await userEvent.click(activity);
    await expect(activity).toHaveAttribute('data-active');
    await expect(overview).not.toHaveAttribute('data-active');
    await expect(args.onValueChange).toHaveBeenCalledWith(
      'activity',
      expect.anything(),
    );
  },
};

export const DataSlotNames: Story = {
  name: 'Interaction: data-slot names per part',
  args: { defaultValue: 'overview' },
  render: (args) => <TabsDemo {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = canvasElement.querySelector('[data-slot="tabs"]');
    await expect(root).not.toBeNull();
    await expect(root).toHaveAttribute('data-orientation', 'horizontal');

    const list = canvas.getByRole('tablist');
    await expect(list).toHaveAttribute('data-slot', 'tabs-list');

    const overview = canvas.getByRole('tab', { name: /overview/i });
    await expect(overview).toHaveAttribute('data-slot', 'tabs-trigger');

    const panel = canvas.getByRole('tabpanel');
    await expect(panel).toHaveAttribute('data-slot', 'tabs-content');
  },
};

export const ActiveUsesDataActive: Story = {
  name: 'Interaction: active state is data-active, not data-state',
  args: { defaultValue: 'overview' },
  render: (args) => <TabsDemo {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const overview = canvas.getByRole('tab', { name: /overview/i });
    const activity = canvas.getByRole('tab', { name: /activity/i });

    await expect(overview).toHaveAttribute('data-active');
    await expect(overview).not.toHaveAttribute('data-state');
    await expect(overview).toHaveAttribute('aria-selected', 'true');
    await expect(activity).not.toHaveAttribute('data-active');

    await userEvent.click(activity);
    await expect(activity).toHaveAttribute('data-active');
    await expect(activity).not.toHaveAttribute('data-state');
    await expect(overview).not.toHaveAttribute('data-active');

    const list = canvas.getByRole('tablist');
    await expect(list).toHaveAttribute('data-slot', 'tabs-list');
  },
};

export const ActivateOnFocus: Story = {
  name: 'Interaction: activateOnFocus makes arrow navigation activate',
  args: { defaultValue: 'overview' },
  render: (args) => (
    <TabsDemo {...args} activateOnFocus />
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const overview = canvas.getByRole('tab', { name: /overview/i });
    const activity = canvas.getByRole('tab', { name: /activity/i });

    overview.focus();
    await expect(overview).toHaveFocus();

    await userEvent.keyboard('{ArrowRight}');
    await expect(activity).toHaveFocus();
    await expect(activity).toHaveAttribute('data-active');
    await expect(activity).toHaveAttribute('aria-selected', 'true');
    await expect(overview).not.toHaveAttribute('data-active');
    await expect(args.onValueChange).toHaveBeenCalledWith(
      'activity',
      expect.anything(),
    );
  },
};

export const RtlInteraction: Story = {
  name: 'Interaction: activation works in RTL',
  args: { defaultValue: 'rtl-on' },
  render: (args) => (
    <div dir="rtl" style={columnStyle}>
      <Tabs {...args}>
        <TabsList>
          <TabsTrigger value="rtl-on">الرئيسية</TabsTrigger>
          <TabsTrigger value="rtl-off">الإعدادات</TabsTrigger>
        </TabsList>
        <TabsContent value="rtl-on">
          <div style={panelStyle}>اللوحة الرئيسية</div>
        </TabsContent>
        <TabsContent value="rtl-off">
          <div style={panelStyle}>لوحة الإعدادات</div>
        </TabsContent>
      </Tabs>
    </div>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const rtlWrapper = canvasElement.querySelector('[dir="rtl"]');
    await expect(rtlWrapper).not.toBeNull();

    const home = canvas.getByRole('tab', { name: 'الرئيسية' });
    const settings = canvas.getByRole('tab', { name: 'الإعدادات' });

    await expect(home).toHaveAttribute('data-active');
    await userEvent.click(settings);
    await expect(settings).toHaveAttribute('data-active');
    await expect(home).not.toHaveAttribute('data-active');
    await expect(args.onValueChange).toHaveBeenCalledWith(
      'rtl-off',
      expect.anything(),
    );
  },
};

export const RtlLineInteraction: Story = {
  name: 'Interaction: RTL + line variant',
  args: { defaultValue: 'rtl-on' },
  render: (args) => (
    <div dir="rtl" style={columnStyle}>
      <Tabs {...args}>
        <TabsList variant="line">
          <TabsTrigger value="rtl-on">الرئيسية</TabsTrigger>
          <TabsTrigger value="rtl-off">الإعدادات</TabsTrigger>
        </TabsList>
        <TabsContent value="rtl-on">
          <div style={panelStyle}>اللوحة الرئيسية</div>
        </TabsContent>
        <TabsContent value="rtl-off">
          <div style={panelStyle}>لوحة الإعدادات</div>
        </TabsContent>
      </Tabs>
    </div>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const settings = canvas.getByRole('tab', { name: 'الإعدادات' });
    const list = canvas.getByRole('tablist');
    await expect(list).toHaveAttribute('data-variant', 'line');

    await userEvent.click(settings);
    await expect(settings).toHaveAttribute('data-active');
    await expect(args.onValueChange).toHaveBeenCalledWith(
      'rtl-off',
      expect.anything(),
    );
  },
};