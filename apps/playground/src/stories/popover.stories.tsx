import type { Meta, StoryObj } from '@storybook/react-vite';
import * as stylex from '@stylexjs/stylex';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { expect, fn, screen, userEvent, waitFor } from 'storybook/test';
import {
  Button,
  Input,
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@xeyy/components';

const meta: Meta<typeof Popover> = {
  title: 'Components/Popover',
  component: Popover,
  tags: ['autodocs'],
  parameters: {
    a11y: { test: 'error' },
  },
  args: {
    onOpenChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const layout = stylex.create({
  row: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1.5rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.625rem',
  },
});

type Side = 'top' | 'bottom' | 'left' | 'right' | 'inline-start' | 'inline-end';
type Align = 'start' | 'center' | 'end';

type PopoverFixtureProps = {
  dir?: 'rtl' | 'ltr';
  defaultOpen?: boolean;
  side?: Side;
  align?: Align;
  sideOffset?: number;
  alignOffset?: number;
  triggerLabel: string;
  title: string;
  description: string;
  children?: ReactNode;
};

function PopoverFixture({
  dir,
  defaultOpen = false,
  side,
  align,
  sideOffset,
  alignOffset,
  triggerLabel,
  title,
  description,
  children,
}: PopoverFixtureProps) {
  return (
    <div dir={dir} {...stylex.props(layout.row)}>
      <Popover defaultOpen={defaultOpen}>
        <PopoverTrigger render={<Button>{triggerLabel}</Button>} />
        <PopoverContent
          side={side}
          align={align}
          sideOffset={sideOffset}
          alignOffset={alignOffset}
        >
          <PopoverHeader>
            <PopoverTitle>{title}</PopoverTitle>
            <PopoverDescription>{description}</PopoverDescription>
          </PopoverHeader>
          {children}
        </PopoverContent>
      </Popover>
    </div>
  );
}

function PopoverWithForm({ defaultOpen = false }: { defaultOpen?: boolean }) {
  return (
    <div {...stylex.props(layout.row)}>
      <Popover defaultOpen={defaultOpen}>
        <PopoverTrigger render={<Button>Share</Button>} />
        <PopoverContent>
          <PopoverHeader>
            <PopoverTitle>Share project</PopoverTitle>
            <PopoverDescription>
              Invite a collaborator to join this project.
            </PopoverDescription>
          </PopoverHeader>
          <form
            {...stylex.props(layout.form)}
            onSubmit={(event) => event.preventDefault()}
          >
            <Input aria-label="Email address" placeholder="name@example.com" />
            <Button type="submit" size="sm">
              Send invite
            </Button>
          </form>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function ControlledPopover() {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<Button>Controlled</Button>} />
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Controlled popover</PopoverTitle>
          <PopoverDescription>
            {open ? 'The popover is open.' : 'The popover is closed.'}
          </PopoverDescription>
        </PopoverHeader>
        <Button size="sm" onClick={() => setOpen(false)}>
          Close
        </Button>
      </PopoverContent>
    </Popover>
  );
}

// ---------------------------------------------------------------------------
// Visual stories
// ---------------------------------------------------------------------------

export const Closed: Story = {
  name: 'Closed trigger',
  render: () => (
    <PopoverFixture
      triggerLabel="Open menu"
      title="Menu"
      description="This popover is closed by default."
    />
  ),
};

export const Basic: Story = {
  name: 'Open: full anatomy',
  render: () => (
    <PopoverFixture
      defaultOpen
      triggerLabel="Profile"
      title="Account"
      description="Manage your profile and notification preferences."
    >
      <Button size="sm" variant="ghost">
        Sign out
      </Button>
    </PopoverFixture>
  ),
};

export const PlacementTop: Story = {
  name: 'Placement: side top',
  render: () => (
    <PopoverFixture
      defaultOpen
      side="top"
      triggerLabel="Open on top"
      title="Placement"
      description="Anchored above the trigger."
    />
  ),
};

export const PlacementBottom: Story = {
  name: 'Placement: side bottom',
  render: () => (
    <PopoverFixture
      defaultOpen
      side="bottom"
      triggerLabel="Open on bottom"
      title="Placement"
      description="Anchored below the trigger."
    />
  ),
};

export const PlacementLeft: Story = {
  name: 'Placement: side left',
  render: () => (
    <PopoverFixture
      defaultOpen
      side="left"
      triggerLabel="Open on left"
      title="Placement"
      description="Anchored to the left of the trigger."
    />
  ),
};

export const PlacementRight: Story = {
  name: 'Placement: side right',
  render: () => (
    <PopoverFixture
      defaultOpen
      side="right"
      triggerLabel="Open on right"
      title="Placement"
      description="Anchored to the right of the trigger."
    />
  ),
};

export const PlacementAlignStart: Story = {
  name: 'Placement: align start',
  render: () => (
    <PopoverFixture
      defaultOpen
      side="top"
      align="start"
      triggerLabel="Align start"
      title="Placement"
      description="Aligned to the start edge of the trigger."
    />
  ),
};

export const PlacementOffset: Story = {
  name: 'Placement: custom offsets',
  render: () => (
    <PopoverFixture
      defaultOpen
      side="right"
      align="start"
      sideOffset={8}
      alignOffset={12}
      triggerLabel="Offset"
      title="Placement"
      description="Uses a sideOffset of 8 and an alignOffset of 12."
    />
  ),
};

export const WithForm: Story = {
  name: 'With interactive form content',
  render: () => <PopoverWithForm defaultOpen />,
};

export const Rtl: Story = {
  name: 'RTL (open)',
  render: () => (
    <PopoverFixture
      dir="rtl"
      defaultOpen
      triggerLabel="القائمة"
      title="الحساب"
      description="إدارة ملفك الشخصي وتفضيلاتك."
    >
      <Button size="sm" variant="ghost">
        تسجيل الخروج
      </Button>
    </PopoverFixture>
  ),
};

// ---------------------------------------------------------------------------
// Interaction tests
// ---------------------------------------------------------------------------

export const InteractionToggle: Story = {
  name: 'Interaction: trigger click toggles open/closed',
  render: () => (
    <PopoverFixture
      triggerLabel="Open profile"
      title="Account"
      description="Profile settings."
    >
      <Button size="sm" variant="ghost">
        Sign out
      </Button>
    </PopoverFixture>
  ),
  play: async ({ canvasElement }) => {
    const trigger = screen.getByRole('button', { name: /open profile/i });

    await expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(trigger);
    const dialog = await screen.findByRole('dialog');

    await expect(dialog).toHaveAttribute('data-open');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    await expect(trigger).toHaveAttribute('data-popup-open');
    await expect(dialog).not.toHaveAttribute('aria-modal');

    await expect(canvasElement.contains(dialog)).toBe(false);
    await expect(document.body.contains(dialog)).toBe(true);

    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).not.toHaveAttribute('data-popup-open');
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  },
};

export const InteractionAriaRelationships: Story = {
  name: 'Interaction: aria-labelledby/aria-describedby wiring',
  render: () => (
    <PopoverFixture
      triggerLabel="Open account"
      title="Account"
      description="Manage your profile and notification preferences."
    />
  ),
  play: async () => {
    const trigger = screen.getByRole('button', { name: /open account/i });
    await userEvent.click(trigger);
    const dialog = await screen.findByRole('dialog');

    const title = screen.getByRole('heading', { name: /account/i });
    const description = screen.getByText(/manage your profile/i);

    await expect(dialog).toHaveAttribute('aria-labelledby', title.id);
    await expect(dialog).toHaveAttribute('aria-describedby', description.id);
    await expect(screen.getByRole('dialog', { name: /account/i })).toBe(dialog);
    await expect(title.tagName).toBe('H2');
    await expect(description.tagName).toBe('P');
  },
};

export const InteractionOutsideClick: Story = {
  name: 'Interaction: click outside closes',
  render: () => (
    <div {...stylex.props(layout.row)}>
      <PopoverFixture
        triggerLabel="Open panel"
        title="Panel"
        description="Outside clicks should dismiss this."
      />
      <Button variant="outline">Outside target</Button>
    </div>
  ),
  play: async () => {
    const trigger = screen.getByRole('button', { name: /open panel/i });
    await userEvent.click(trigger);
    await screen.findByRole('dialog');

    await userEvent.click(
      screen.getByRole('button', { name: /outside target/i }),
    );

    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  },
};

export const InteractionEscape: Story = {
  name: 'Interaction: Escape closes',
  render: () => (
    <PopoverFixture
      triggerLabel="Open help"
      title="Keyboard help"
      description="Press Escape to close."
    />
  ),
  play: async () => {
    const trigger = screen.getByRole('button', { name: /open help/i });
    await userEvent.click(trigger);
    const dialog = await screen.findByRole('dialog');
    dialog.focus();

    await userEvent.keyboard('{Escape}');

    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  },
};

export const InteractionFocus: Story = {
  name: 'Interaction: focus moves into the popover and returns',
  render: () => (
    <PopoverFixture
      triggerLabel="Open focus test"
      title="Focus"
      description="Focus should move into the popup."
    >
      <Input aria-label="Name" placeholder="Ada" />
    </PopoverFixture>
  ),
  play: async () => {
    const trigger = screen.getByRole('button', { name: /open focus test/i });
    await userEvent.click(trigger);
    await screen.findByRole('dialog');

    const input = await screen.findByRole('textbox', { name: /name/i });
    await expect(input).toHaveFocus();

    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const InteractionTypeInForm: Story = {
  name: 'Interaction: typing renders inside the portal content',
  render: () => <PopoverWithForm />,
  play: async () => {
    const trigger = screen.getByRole('button', { name: /share/i });
    await userEvent.click(trigger);
    await screen.findByRole('dialog');

    const email = await screen.findByRole('textbox', { name: /email address/i });
    await userEvent.type(email, 'ada@example.com');
    await expect(email).toHaveValue('ada@example.com');

    await userEvent.click(
      screen.getByRole('button', { name: /send invite/i }),
    );
    await expect(email).toHaveValue('ada@example.com');
  },
};

export const InteractionUncontrolled: Story = {
  name: 'Interaction: uncontrolled toggling fires onOpenChange',
  render: (args) => (
    <Popover {...args}>
      <PopoverTrigger render={<Button>Toggle me</Button>} />
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Uncontrolled</PopoverTitle>
          <PopoverDescription>
            This popover manages its own state.
          </PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  ),
  play: async ({ args }) => {
    const trigger = screen.getByRole('button', { name: /toggle me/i });

    await expect(args.onOpenChange).not.toHaveBeenCalled();

    await userEvent.click(trigger);
    await screen.findByRole('dialog');
    await expect(args.onOpenChange).toHaveBeenCalledWith(true, expect.anything());

    await userEvent.click(trigger);
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    await expect(args.onOpenChange).toHaveBeenCalledWith(false, expect.anything());
  },
};

export const InteractionControlled: Story = {
  name: 'Interaction: controlled via useState',
  render: () => <ControlledPopover />,
  play: async () => {
    const trigger = screen.getByRole('button', { name: /controlled/i });

    await userEvent.click(trigger);
    await screen.findByRole('dialog');
    await expect(screen.getByText('The popover is open.')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /close/i }));
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );

    await userEvent.click(trigger);
    await screen.findByRole('dialog');
    await expect(screen.getByText('The popover is open.')).toBeInTheDocument();
  },
};

export const InteractionDefaults: Story = {
  name: 'Interaction: default side/align attributes',
  render: (args) => (
    <Popover {...args} defaultOpen>
      <PopoverTrigger render={<Button>Defaults</Button>} />
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Defaults</PopoverTitle>
          <PopoverDescription>
            Default placement renders data-side bottom and data-align center.
          </PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  ),
  play: async () => {
    const dialog = await screen.findByRole('dialog');
    await expect(dialog).toHaveAttribute('data-side', 'bottom');
    await expect(dialog).toHaveAttribute('data-align', 'center');
  },
};

export const InteractionSide: Story = {
  name: 'Interaction: data-side/data-align reflect placement props',
  render: () => (
    <PopoverFixture
      side="right"
      align="start"
      triggerLabel="Open right"
      title="Placement"
      description="Popover should anchor to the right edge."
    />
  ),
  play: async () => {
    const trigger = screen.getByRole('button', { name: /open right/i });
    await userEvent.click(trigger);
    const dialog = await screen.findByRole('dialog');

    await expect(dialog).toHaveAttribute('data-side', 'right');
    await expect(dialog).toHaveAttribute('data-align', 'start');
    await expect(dialog.parentElement).toHaveAttribute(
      'data-slot',
      'popover-positioner',
    );
  },
};

export const InteractionDataSlots: Story = {
  name: 'Interaction: data-slot names per part',
  render: () => (
    <PopoverFixture
      triggerLabel="Open slots"
      title="Slots"
      description="Each part carries its own data-slot."
    />
  ),
  play: async ({ canvasElement }) => {
    const trigger = screen.getByRole('button', { name: /open slots/i });
    await expect(trigger).toHaveAttribute('data-slot', 'popover-trigger');

    await userEvent.click(trigger);
    const dialog = await screen.findByRole('dialog');

    await expect(dialog).toHaveAttribute('data-slot', 'popover-content');
    await expect(dialog.parentElement).toHaveAttribute(
      'data-slot',
      'popover-positioner',
    );

    const header = dialog.querySelector('[data-slot="popover-header"]');
    const title = dialog.querySelector('[data-slot="popover-title"]');
    const description = dialog.querySelector('[data-slot="popover-description"]');

    expect(header).not.toBeNull();
    expect(title).not.toBeNull();
    expect(description).not.toBeNull();

    await expect(header).toHaveAttribute('data-slot', 'popover-header');
    await expect(title).toHaveAttribute('data-slot', 'popover-title');
    await expect(description).toHaveAttribute(
      'data-slot',
      'popover-description',
    );

    await expect(canvasElement.contains(dialog)).toBe(false);
  },
};

export const InteractionRtl: Story = {
  name: 'Interaction: opens within an RTL context',
  render: () => (
    <div dir="rtl" {...stylex.props(layout.row)}>
      <Popover>
        <PopoverTrigger render={<Button>القائمة</Button>} />
        <PopoverContent>
          <PopoverHeader>
            <PopoverTitle>الحساب</PopoverTitle>
            <PopoverDescription>إدارة ملفك الشخصي وتفضيلاتك.</PopoverDescription>
          </PopoverHeader>
        </PopoverContent>
      </Popover>
    </div>
  ),
  play: async () => {
    const trigger = screen.getByRole('button', { name: /القائمة/i });
    await expect(trigger.closest('[dir="rtl"]')).not.toBeNull();

    await userEvent.click(trigger);
    await screen.findByRole('dialog', { name: /الحساب/i });
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  },
};