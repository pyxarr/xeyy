import type { CSSProperties } from 'react';
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { Mock } from 'vitest';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  type DialogProps,
} from '@xeyy/components';

const meta: Meta<typeof Dialog> = {
  title: 'Components/Dialog',
  component: Dialog,
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

// ---------------------------------------------------------------------------
// Shared demo pieces
// ---------------------------------------------------------------------------

const demoRow: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '16px',
  padding: '24px',
};

function nextFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

type DialogDemoProps = {
  defaultOpen?: boolean;
  open?: boolean;
  modal?: DialogProps['modal'];
  dir?: 'rtl' | 'ltr';
  showCloseButton?: boolean;
  onOpenChange?: DialogProps['onOpenChange'];
};

function EditProfileDialog({
  defaultOpen,
  open,
  modal,
  dir,
  showCloseButton,
  onOpenChange,
}: DialogDemoProps) {
  return (
    <Dialog
      open={open}
      defaultOpen={defaultOpen}
      modal={modal}
      onOpenChange={onOpenChange}
    >
      <DialogTrigger render={<Button>Open dialog</Button>} />
      <DialogContent dir={dir} showCloseButton={showCloseButton}>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click Save when you are done.
          </DialogDescription>
        </DialogHeader>
        <p style={{ margin: 0 }}>Profile information appears here.</p>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          <Button>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ControlledOpenDemo() {
  const [open, setOpen] = useState(true);
  return (
    <div style={demoRow}>
      <EditProfileDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}

function ControlledInteractionDemo() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>Toggle controlled dialog</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Controlled dialog</DialogTitle>
          <DialogDescription>
            This dialog is driven by open / onOpenChange state.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ModalDemo() {
  return (
    <div style={demoRow}>
      <Button>Background action</Button>
      <EditProfileDialog />
    </div>
  );
}

function RtlDialog({ defaultOpen = false }: { defaultOpen?: boolean }) {
  return (
    <div style={demoRow} dir="rtl">
      <Dialog defaultOpen={defaultOpen}>
        <DialogTrigger render={<Button>فتح الحوار</Button>} />
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>تحرير الملف الشخصي</DialogTitle>
            <DialogDescription>
              قم بإجراء تغييرات على ملفك الشخصي هنا.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline">إلغاء</Button>} />
            <Button>حفظ التغييرات</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Visual stories
// ---------------------------------------------------------------------------

export const Closed: Story = {
  name: 'Closed (trigger visible)',
  render: () => (
    <div style={demoRow}>
      <EditProfileDialog />
    </div>
  ),
};

export const Open: Story = {
  name: 'Open (defaultOpen, header + footer layout)',
  render: () => (
    <div style={demoRow}>
      <EditProfileDialog defaultOpen />
    </div>
  ),
};

export const Controlled: Story = {
  name: 'Controlled (open state)',
  render: () => <ControlledOpenDemo />,
};

export const NoCloseIcon: Story = {
  name: 'No close icon (showCloseButton={false})',
  render: () => (
    <div style={demoRow}>
      <EditProfileDialog defaultOpen showCloseButton={false} />
    </div>
  ),
};

export const FooterCloseButton: Story = {
  name: 'Footer close button (showCloseButton)',
  render: () => (
    <div style={demoRow}>
      <Dialog defaultOpen>
        <DialogTrigger render={<Button>Open notice</Button>} />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notice</DialogTitle>
            <DialogDescription>
              This dialog can only be dismissed from the footer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter showCloseButton>
            <Button>Accept</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  ),
};

export const NonModal: Story = {
  name: 'Non-modal (modal={false})',
  render: () => (
    <div style={demoRow}>
      <EditProfileDialog defaultOpen modal={false} />
      <p style={{ margin: 0, maxWidth: '360px' }}>
        With modal={"false"} the page behind stays available to assistive
        tech and focus is not trapped.
      </p>
    </div>
  ),
};

export const Rtl: Story = {
  name: 'RTL',
  render: () => <RtlDialog defaultOpen />,
};

// ---------------------------------------------------------------------------
// Interaction tests
// ---------------------------------------------------------------------------

export const TriggerOpensDialog: Story = {
  name: 'Interaction: trigger opens the dialog with ARIA wiring',
  render: () => <ModalDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /open dialog/i });
    await expect(trigger).toHaveAttribute('data-slot', 'dialog-trigger');
    await userEvent.click(trigger);
    await nextFrame();

    const dialog = screen.getByRole('dialog', { name: /edit profile/i });
    await expect(dialog).toHaveAttribute('role', 'dialog');
    await expect(dialog).toHaveAttribute('tabindex', '-1');

    const title = dialog.querySelector('[data-slot="dialog-title"]');
    const description = dialog.querySelector('[data-slot="dialog-description"]');
    expect(title).not.toBeNull();
    expect(description).not.toBeNull();
    await expect(dialog).toHaveAttribute(
      'aria-labelledby',
      (title as HTMLElement).id,
    );
    await expect(dialog).toHaveAttribute(
      'aria-describedby',
      (description as HTMLElement).id,
    );

    // Base UI 1.8 modal dialogs hide the rest of the document with
    // `aria-hidden` instead of emitting `aria-modal`.
    await expect(dialog).not.toHaveAttribute('aria-modal');

    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    await expect(trigger).toHaveAttribute('aria-controls', dialog.id);

    // The trigger is inside the aria-hidden background while the dialog is open.
    await expect(
      screen.queryByRole('button', { name: /open dialog/i }),
    ).not.toBeInTheDocument();

    await userEvent.keyboard('{Escape}');
  },
};

export const InitialFocusMovesInside: Story = {
  name: 'Interaction: initial focus moves into the dialog',
  render: () => <EditProfileDialog />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /open dialog/i }));
    await nextFrame();

    const dialog = screen.getByRole('dialog', { name: /edit profile/i });
    expect(dialog.contains(document.activeElement)).toBe(true);
    await expect(document.activeElement).not.toBe(document.body);

    // Base UI focuses the first tabbable element inside the popup.
    const cancel = screen.getByRole('button', { name: /^cancel$/i });
    await expect(cancel).toHaveFocus();

    await userEvent.keyboard('{Escape}');
  },
};

export const EscapeClosesAndRestoresFocus: Story = {
  name: 'Interaction: Escape closes and restores focus to the trigger',
  render: () => <EditProfileDialog />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /open dialog/i });
    await userEvent.click(trigger);
    await nextFrame();

    await expect(screen.getByRole('dialog')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    await expect(trigger).toHaveFocus();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
};

export const CloseButtonCloses: Story = {
  name: 'Interaction: the DialogClose button closes',
  render: () => <EditProfileDialog />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /open dialog/i });
    await userEvent.click(trigger);
    await nextFrame();

    const closeButton = screen.getByRole('button', { name: 'Close' });
    await expect(closeButton).toHaveAttribute('data-slot', 'dialog-close');
    await userEvent.click(closeButton);

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    await expect(trigger).toHaveFocus();
  },
};

export const BackdropClickCloses: Story = {
  name: 'Interaction: clicking the backdrop closes (dismissable)',
  render: () => <EditProfileDialog />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /open dialog/i }));
    await nextFrame();

    await expect(screen.getByRole('dialog')).toBeInTheDocument();
    const overlay = document.querySelector('[data-slot="dialog-overlay"]');
    expect(overlay).not.toBeNull();
    const overlayEl = overlay as HTMLElement;

    // The overlay is the dialog's own backdrop, so a full user gesture on it
    // simulates a user pressing outside the content.
    await userEvent.click(overlayEl);

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  },
};

export const ModalBlocksBackground: Story = {
  name: 'Interaction: modal hides and blocks the page behind',
  render: () => <ModalDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /open dialog/i });
    await expect(canvas.getByRole('button', { name: /background action/i })).toBeInTheDocument();

    await userEvent.click(trigger);
    await nextFrame();

    const dialog = screen.getByRole('dialog', { name: /edit profile/i });

    // The background is hidden from assistive tech while the dialog is modal.
    await expect(
      screen.queryByRole('button', { name: /background action/i }),
    ).not.toBeInTheDocument();
    await expect(
      screen.queryByRole('button', { name: /open dialog/i }),
    ).not.toBeInTheDocument();
    expect(trigger.closest('[aria-hidden="true"]')).not.toBeNull();

    // The full-screen overlay is what absorbs pointer presses over the page.
    const overlay = document.querySelector('[data-slot="dialog-overlay"]');
    expect(overlay).not.toBeNull();
    const overlayEl = overlay as HTMLElement;
    const overlayStyle = window.getComputedStyle(overlayEl);
    const overlayRect = overlayEl.getBoundingClientRect();
    await expect(overlayStyle.position).toBe('fixed');
    await expect(overlayStyle.pointerEvents).not.toBe('none');
    expect(overlayRect.x).toBe(0);
    expect(overlayRect.y).toBe(0);
    expect(overlayRect.width).toBeGreaterThanOrEqual(window.innerWidth);
    expect(overlayRect.height).toBeGreaterThanOrEqual(window.innerHeight);

    // Focus is trapped inside the dialog.
    expect(dialog.contains(document.activeElement)).toBe(true);
    await userEvent.tab();
    await nextFrame();
    expect(dialog.contains(document.activeElement)).toBe(true);

    await userEvent.click(screen.getByRole('button', { name: /^cancel$/i }));
  },
};

export const FocusTrapStaysInside: Story = {
  name: 'Interaction: Tab cycles stay inside the dialog',
  render: () => <EditProfileDialog />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /open dialog/i }));
    await nextFrame();

    const dialog = screen.getByRole('dialog', { name: /edit profile/i });
    expect(dialog.contains(document.activeElement)).toBe(true);

    for (let i = 0; i < 6; i += 1) {
      await userEvent.tab();
      await nextFrame();
      expect(dialog.contains(document.activeElement)).toBe(true);
    }

    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  },
};

export const ControlledState: Story = {
  name: 'Interaction: controlled via open / onOpenChange',
  render: () => <ControlledInteractionDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /toggle controlled dialog/i });

    await expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await userEvent.click(trigger);
    await nextFrame();

    const dialog = screen.getByRole('dialog', { name: /controlled dialog/i });
    await expect(dialog).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /^cancel$/i }));
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    await expect(trigger).toHaveFocus();

    await userEvent.click(trigger);
    await nextFrame();
    await expect(screen.getByRole('dialog')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /^cancel$/i }));
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  },
};

export const UncontrolledDefaultOpen: Story = {
  name: 'Interaction: uncontrolled opens via defaultOpen',
  render: () => <EditProfileDialog defaultOpen />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(screen.getByRole('dialog')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );

    await userEvent.click(canvas.getByRole('button', { name: /open dialog/i }));
    await nextFrame();
    await expect(screen.getByRole('dialog')).toBeInTheDocument();
  },
};

export const OnOpenChangeFires: Story = {
  name: 'Interaction: onOpenChange reports state and reason',
  render: (args) => (
    <div style={demoRow}>
      <Dialog onOpenChange={args.onOpenChange}>
        <DialogTrigger render={<Button>Open dialog</Button>} />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click Save when you are done.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <Button>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const onOpenChangeSpy = args.onOpenChange as Mock;
    await userEvent.click(canvas.getByRole('button', { name: /open dialog/i }));
    await waitFor(() => expect(onOpenChangeSpy).toHaveBeenCalledTimes(1));
    const [opened, openDetails] = onOpenChangeSpy.mock.calls[0];
    await expect(opened).toBe(true);
    await expect(openDetails.reason).toBe('trigger-press');

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(onOpenChangeSpy).toHaveBeenCalledTimes(2));
    const [closed, closeDetails] = onOpenChangeSpy.mock.calls[1];
    await expect(closed).toBe(false);
    await expect(closeDetails.reason).toBe('escape-key');
  },
};

export const RtlInteraction: Story = {
  name: 'Interaction: opens and closes in RTL',
  render: () => <RtlDialog />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /فتح الحوار/ });
    await userEvent.click(trigger);
    await nextFrame();

    const dialog = screen.getByRole('dialog', { name: /تحرير الملف الشخصي/ });
    await expect(dialog).toHaveAttribute('dir', 'rtl');
    await expect(dialog).toHaveAttribute('aria-labelledby');
    await expect(dialog).toHaveAttribute('aria-describedby');
    expect(dialog.contains(document.activeElement)).toBe(true);

    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    await expect(trigger).toHaveFocus();
  },
};

export const DataSlotNames: Story = {
  name: 'Interaction: data-slot names per part',
  render: () => <EditProfileDialog defaultOpen />,
  play: async () => {
    await nextFrame();

    const dialog = screen.getByRole('dialog');
    await expect(dialog).toHaveAttribute('data-slot', 'dialog-content');
    await expect(dialog).toHaveAttribute('data-open');

    const trigger = document.querySelector('[data-slot="dialog-trigger"]');
    expect(trigger).not.toBeNull();
    await expect(trigger as HTMLElement).toHaveAttribute(
      'data-slot',
      'dialog-trigger',
    );

    const portal = document.querySelector('[data-slot="dialog-portal"]');
    expect(portal).not.toBeNull();
    await expect(portal as HTMLElement).toHaveAttribute(
      'data-slot',
      'dialog-portal',
    );

    const overlay = document.querySelector('[data-slot="dialog-overlay"]');
    expect(overlay).not.toBeNull();
    await expect(overlay as HTMLElement).toHaveAttribute(
      'data-slot',
      'dialog-overlay',
    );

    for (const slot of [
      'dialog-title',
      'dialog-description',
      'dialog-header',
      'dialog-footer',
    ]) {
      const part = dialog.querySelector(`[data-slot="${slot}"]`);
      expect(part).not.toBeNull();
      await expect(part as HTMLElement).toHaveAttribute('data-slot', slot);
    }

    const closeButtons = document.querySelectorAll('[data-slot="dialog-close"]');
    await expect(closeButtons).toHaveLength(2);
    for (const closeButton of Array.from(closeButtons)) {
      await expect(closeButton as HTMLElement).toHaveAttribute(
        'data-slot',
        'dialog-close',
      );
    }
  },
};