import type { CSSProperties } from 'react';
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fireEvent, screen, userEvent, waitFor } from 'storybook/test';
import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@xeyy/components';

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  parameters: {
    a11y: { test: 'error' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const wrapStyle: CSSProperties = {
  display: 'flex',
  justifyItems: 'center',
  alignItems: 'center',
  gap: '1.5rem',
  flexWrap: 'wrap',
  padding: '2rem',
};

// ---------------------------------------------------------------------------
// Visual stories
// ---------------------------------------------------------------------------

export const Closed: Story = {
  name: 'Closed: idle trigger',
  render: () => (
    <TooltipProvider>
      <div style={wrapStyle}>
        <Tooltip>
          <TooltipTrigger render={<Button>Hover me</Button>} />
          <TooltipContent>Adds this item to your library.</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  ),
};

export const OpenByDefault: Story = {
  name: 'Open: visible tooltip with arrow',
  render: () => (
    <TooltipProvider>
      <div style={wrapStyle}>
        <Tooltip defaultOpen>
          <TooltipTrigger render={<Button>Default open</Button>} />
          <TooltipContent>The tooltip is open by default.</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  ),
};

export const Sides: Story = {
  name: 'Sides: top, bottom, left, right',
  render: () => (
    <TooltipProvider>
      <div style={{ ...wrapStyle, justifyItems: 'center', justifyContent: 'center', gap: '4rem' }}>
        <Tooltip defaultOpen>
          <TooltipTrigger render={<Button>Top</Button>} />
          <TooltipContent side="top">Positioned on top.</TooltipContent>
        </Tooltip>
        <Tooltip defaultOpen>
          <TooltipTrigger render={<Button>Bottom</Button>} />
          <TooltipContent side="bottom">Positioned below.</TooltipContent>
        </Tooltip>
        <Tooltip defaultOpen>
          <TooltipTrigger render={<Button>Left</Button>} />
          <TooltipContent side="left" sideOffset={12}>Positioned to the left.</TooltipContent>
        </Tooltip>
        <Tooltip defaultOpen>
          <TooltipTrigger render={<Button>Right</Button>} />
          <TooltipContent side="right" sideOffset={12} align="start">Positioned to the right.</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  ),
};

export const LongText: Story = {
  name: 'Long text: wraps at max-width',
  render: () => (
    <TooltipProvider>
      <div style={wrapStyle}>
        <Tooltip defaultOpen>
          <TooltipTrigger render={<Button>Long content</Button>} />
          <TooltipContent>
            Displays extended helper copy. This sentence is long enough to wrap
            against the 20rem maximum width so the tooltip never dominates the
            surrounding interface.
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  ),
};

export const Rtl: Story = {
  name: 'RTL',
  render: () => (
    <div dir="rtl" style={wrapStyle}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger render={<Button>عرض التلميح</Button>} />
          <TooltipContent>تلميح نصي باللغة العربية.</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  ),
};

export const DisabledTrigger: Story = {
  name: 'Disabled trigger: no tooltip',
  render: () => (
    <TooltipProvider>
      <div style={wrapStyle}>
        <Tooltip>
          <TooltipTrigger
            disabled
            render={<Button variant="secondary" disabled>No tooltip</Button>}
          />
          <TooltipContent>This content never appears.</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  ),
};

// ---------------------------------------------------------------------------
// Interaction tests
// ---------------------------------------------------------------------------

export const OpenOnHover: Story = {
  name: 'Interaction: hover opens the tooltip',
  render: () => (
    <TooltipProvider>
      <div style={wrapStyle}>
        <Tooltip>
          <TooltipTrigger render={<Button>Hover to open</Button>} />
          <TooltipContent>Opened on hover.</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  ),
  play: async () => {
    const trigger = screen.getByRole('button', { name: /hover to open/i });
    await expect(screen.queryByText('Opened on hover.')).toBeNull();
    await userEvent.hover(trigger);
    const tooltip = await screen.findByText('Opened on hover.');
    await expect(tooltip).toHaveAttribute('data-slot', 'tooltip-content');
    await expect(tooltip).toHaveAttribute('data-open');
    await expect(tooltip).not.toHaveAttribute('role');
    await expect(trigger).toHaveAttribute('data-popup-open');
  },
};

export const CloseOnMouseLeave: Story = {
  name: 'Interaction: unhover closes the tooltip',
  render: () => (
    <TooltipProvider>
      <div style={wrapStyle}>
        <Tooltip>
          <TooltipTrigger render={<Button>Hover to dismiss</Button>} />
          <TooltipContent>Closes on leave.</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  ),
  play: async () => {
    const trigger = screen.getByRole('button', { name: /hover to dismiss/i });
    await userEvent.hover(trigger);
    await screen.findByText('Closes on leave.');
    await userEvent.unhover(trigger);
    await waitFor(() => {
      expect(screen.queryByText('Closes on leave.')).not.toBeInTheDocument();
    });
  },
};

export const KeyboardFocusOpens: Story = {
  name: 'Interaction: keyboard focus opens the tooltip',
  render: () => (
    <TooltipProvider>
      <div style={wrapStyle}>
        <Tooltip>
          <TooltipTrigger render={<Button>Focus me</Button>} />
          <TooltipContent>Opened on focus.</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  ),
  play: async () => {
    const trigger = screen.getByRole('button', { name: /focus me/i });
    await expect(screen.queryByText('Opened on focus.')).toBeNull();
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    const tooltip = await screen.findByText('Opened on focus.');
    await expect(tooltip).toBeInTheDocument();
    await userEvent.tab();
    await waitFor(() => {
      expect(screen.queryByText('Opened on focus.')).not.toBeInTheDocument();
    });
  },
};

export const CloseOnClick: Story = {
  name: 'Interaction: closeOnClick (default) closes on trigger click',
  render: () => (
    <TooltipProvider>
      <div style={wrapStyle}>
        <Tooltip>
          <TooltipTrigger render={<Button>Click to close</Button>} />
          <TooltipContent>Closes on click.</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  ),
  play: async () => {
    const trigger = screen.getByRole('button', { name: /click to close/i });
    await userEvent.hover(trigger);
    await screen.findByText('Closes on click.');
    await fireEvent.click(trigger);
    await waitFor(() => {
      expect(screen.queryByText('Closes on click.')).not.toBeInTheDocument();
    });
  },
};

export const StaysOpenWhenCloseOnClickFalse: Story = {
  name: 'Interaction: closeOnClick={false} keeps the tooltip open on trigger click',
  render: () => (
    <TooltipProvider>
      <div style={wrapStyle}>
        <Tooltip>
          <TooltipTrigger closeOnClick={false} render={<Button>Sticky trigger</Button>} />
          <TooltipContent>Stays open on click.</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  ),
  play: async () => {
    const trigger = screen.getByRole('button', { name: /sticky trigger/i });
    await userEvent.hover(trigger);
    await screen.findByText('Stays open on click.');
    await fireEvent.click(trigger);
    await expect(screen.getByText('Stays open on click.')).toBeInTheDocument();
    await userEvent.unhover(trigger);
    await waitFor(() => {
      expect(screen.queryByText('Stays open on click.')).not.toBeInTheDocument();
    });
  },
};

export const CloseDelay: Story = {
  name: 'Interaction: closeDelay delays closing after unhover',
  render: () => (
    <TooltipProvider>
      <div style={wrapStyle}>
        <Tooltip>
          <TooltipTrigger closeDelay={250} render={<Button>Slow close</Button>} />
          <TooltipContent>Closes slowly.</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  ),
  play: async () => {
    const trigger = screen.getByRole('button', { name: /slow close/i });
    await userEvent.hover(trigger);
    await screen.findByText('Closes slowly.');
    await userEvent.unhover(trigger);
    await new Promise((resolve) => setTimeout(resolve, 150));
    await expect(screen.getByText('Closes slowly.')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText('Closes slowly.')).not.toBeInTheDocument();
    });
  },
};

export const DelayedOpen: Story = {
  name: 'Interaction: trigger delay delays opening on hover',
  render: () => (
    <TooltipProvider>
      <div style={wrapStyle}>
        <Tooltip>
          <TooltipTrigger delay={300} render={<Button>Slow open</Button>} />
          <TooltipContent>Delayed open.</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  ),
  play: async () => {
    const trigger = screen.getByRole('button', { name: /slow open/i });
    await userEvent.hover(trigger);
    await new Promise((resolve) => setTimeout(resolve, 120));
    await expect(screen.queryByText('Delayed open.')).toBeNull();
    const tooltip = await screen.findByText('Delayed open.');
    await expect(tooltip).toBeInTheDocument();
    await userEvent.unhover(trigger);
    await waitFor(() => {
      expect(screen.queryByText('Delayed open.')).not.toBeInTheDocument();
    });
  },
};

export const DisabledDoesNotOpen: Story = {
  name: 'Interaction: disabled trigger never shows the tooltip',
  render: () => (
    <TooltipProvider>
      <div style={wrapStyle}>
        <Tooltip>
          <TooltipTrigger
            disabled
            render={<Button variant="secondary" disabled>No tooltip</Button>}
          />
          <TooltipContent>Hidden content.</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  ),
  play: async () => {
    const trigger = screen.getByRole('button', { name: /no tooltip/i });
    await expect(trigger).toHaveAttribute('data-trigger-disabled');
    await expect(trigger).toBeDisabled();
    fireEvent.mouseEnter(trigger);
    await new Promise((resolve) => setTimeout(resolve, 500));
    await expect(screen.queryByText('Hidden content.')).toBeNull();
  },
};

function ControlledTooltip() {
  const [open, setOpen] = useState(false);
  return (
    <div style={wrapStyle}>
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger render={<Button variant="outline">Controlled</Button>} />
        <TooltipContent>Follows the external open state.</TooltipContent>
      </Tooltip>
      <Button onClick={() => setOpen(true)}>Open</Button>
    </div>
  );
}

export const ControlledOpen: Story = {
  name: 'Interaction: controlled via open/onOpenChange',
  render: () => <ControlledTooltip />,
  play: async () => {
    await expect(screen.queryByText('Follows the external open state.')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: /open/i }));
    await screen.findByText('Follows the external open state.');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(
        screen.queryByText('Follows the external open state.'),
      ).not.toBeInTheDocument();
    });
  },
};

export const DataSlots: Story = {
  name: 'Interaction: data-slot names per part',
  render: () => (
    <TooltipProvider>
      <div style={wrapStyle}>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Slot content.</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  ),
  play: async () => {
    const trigger = screen.getByRole('button', { name: /hover me/i });
    await expect(trigger).toHaveAttribute('data-slot', 'tooltip-trigger');
    await expect(trigger).not.toHaveAttribute('data-popup-open');

    await userEvent.hover(trigger);
    const content = await screen.findByText('Slot content.');
    await expect(content).toHaveAttribute('data-slot', 'tooltip-content');
    await expect(content).toHaveAttribute('data-open');
    await expect(content).not.toHaveAttribute('role');

    const portal = document.querySelector('[data-slot="tooltip-portal"]');
    const positioner = document.querySelector('[data-slot="tooltip-positioner"]');
    const arrow = document.querySelector('[data-slot="tooltip-arrow"]');

    await expect(portal).not.toBeNull();
    await expect(positioner).not.toBeNull();
    await expect(arrow).not.toBeNull();
    await expect(positioner).toContainElement(content);
    await expect(trigger).toHaveAttribute('data-popup-open');
    await expect(arrow).toHaveAttribute('aria-hidden', 'true');
  },
};