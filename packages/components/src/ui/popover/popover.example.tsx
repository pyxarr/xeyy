import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "./popover";
import { Button } from "../button/button";
import { Input } from "../input/input";

const layout = stylex.create({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: "2rem",
  },

  row: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "2rem",
  },
});

const share = stylex.create({
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "0.625rem",
  },
});

function SharePopover() {
  const [invited, setInvited] = useState(false);

  return (
    <Popover>
      <PopoverTrigger render={<Button>Share</Button>} />
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Share project</PopoverTitle>
          <PopoverDescription>
            {invited
              ? "Invite sent. They'll get an email with access."
              : "Invite a collaborator to join this project."}
          </PopoverDescription>
        </PopoverHeader>
        <form
          {...stylex.props(share.form)}
          onSubmit={(event) => {
            event.preventDefault();
            setInvited(true);
          }}
        >
          <Input aria-label="Email address" placeholder="name@example.com" />
          <Button type="submit" size="sm">
            Send invite
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}

export function PopoverExample() {
  const [open, setOpen] = useState(false);

  return (
    <div {...stylex.props(layout.root)}>
      <div {...stylex.props(layout.row)}>
        <Popover>
          <PopoverTrigger>
            <Button variant="outline">Profile</Button>
          </PopoverTrigger>
          <PopoverContent>
            <PopoverHeader>
              <PopoverTitle>Account</PopoverTitle>
              <PopoverDescription>
                Manage your profile and team notification preferences.
              </PopoverDescription>
            </PopoverHeader>
            <Button size="sm" variant="ghost">
              Sign out
            </Button>
          </PopoverContent>
        </Popover>

        <SharePopover />
      </div>

      <div {...stylex.props(layout.row)}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger>
            <Button variant="outline">Controlled</Button>
          </PopoverTrigger>
          <PopoverContent>
            <PopoverHeader>
              <PopoverTitle>Controlled popover</PopoverTitle>
              <PopoverDescription>
                {open
                  ? "Popover is currently open."
                  : "Popover is currently closed."}
              </PopoverDescription>
            </PopoverHeader>
            <Button size="sm" onClick={() => setOpen(false)}>
              Close
            </Button>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger>
            <Button variant="secondary">Open on top</Button>
          </PopoverTrigger>
          <PopoverContent side="top" align="start" sideOffset={8}>
            <PopoverHeader>
              <PopoverTitle>Placement</PopoverTitle>
              <PopoverDescription>
                Anchored above the trigger and aligned to its start edge.
              </PopoverDescription>
            </PopoverHeader>
          </PopoverContent>
        </Popover>
      </div>

      <div dir="rtl" {...stylex.props(layout.row)}>
        <Popover>
          <PopoverTrigger>
            <Button>القائمة</Button>
          </PopoverTrigger>
          <PopoverContent>
            <PopoverHeader>
              <PopoverTitle>الحساب</PopoverTitle>
              <PopoverDescription>
                إدارة ملفك الشخصي وتفضيلاتك.
              </PopoverDescription>
            </PopoverHeader>
            <Button size="sm" variant="ghost">
              تسجيل الخروج
            </Button>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}