import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import { Button } from "../button/button";

const styles = stylex.create({
  layout: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },

  body: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
});

export function DialogExample() {
  const [open, setOpen] = useState(false);

  return (
    <div {...stylex.props(styles.layout)}>
      <Dialog>
        <DialogTrigger render={<Button>Open dialog</Button>} />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a project</DialogTitle>
            <DialogDescription>
              Give your project a name and a short description.
            </DialogDescription>
          </DialogHeader>
          <div {...stylex.props(styles.body)}>
            <p>A project must have a unique name in your workspace.</p>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <Button variant="destructive">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={<Button variant="outline">Open (controlled)</Button>} />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete record</DialogTitle>
            <DialogDescription>
              This dialog is controlled through the open / onOpenChange props.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <Button variant="destructive" onClick={() => setOpen(false)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger render={<Button variant="outline">Open (no close icon)</Button>} />
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Notice</DialogTitle>
            <DialogDescription>
              The corner close button is disabled here, so the dialog can only
              be dismissed from the footer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline">Dismiss</Button>} />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}