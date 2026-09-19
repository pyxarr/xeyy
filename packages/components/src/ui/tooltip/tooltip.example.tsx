import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { Button } from "../button/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

const layout = stylex.create({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: "32px",
  },
  row: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "24px",
  },
  state: {
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    color: "oklch(0.556 0 0)",
  },
});

export function TooltipExample() {
  const [open, setOpen] = useState(false);

  return (
    <div {...stylex.props(layout.root)}>
      {/* Provider group: hover one tooltip, then the next opens instantly */}
      <TooltipProvider delay={0}>
        <div {...stylex.props(layout.row)}>
          <Tooltip>
            <TooltipTrigger render={<Button>Hover me</Button>} />
            <TooltipContent>Adds this item to your library.</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              delay={300}
              closeDelay={150}
              render={<Button variant="outline">Slow open</Button>}
            />
            <TooltipContent>
              Opens after 300ms and stays for 150ms after leaving.
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              disabled
              render={<Button variant="secondary" disabled>No tooltip</Button>}
            />
            <TooltipContent>This content never appears.</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

      {/* A second, independent provider group */}
      <TooltipProvider delay={0}>
        <div {...stylex.props(layout.row)}>
          <Tooltip>
            <TooltipTrigger
              render={<Button variant="ghost">Bottom, start-aligned</Button>}
            />
            <TooltipContent side="bottom" align="start">
              Flips and re-aligns to stay on screen.
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={<Button variant="ghost">Right side</Button>}
            />
            <TooltipContent side="right" sideOffset={8}>
              Positioned to the right with extra offset.
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

      {/* Controlled */}
      <div {...stylex.props(layout.row)}>
        <Tooltip open={open} onOpenChange={setOpen}>
          <TooltipTrigger render={<Button variant="outline">Controlled</Button>} />
          <TooltipContent>
            Toggles in sync with the external open state.
          </TooltipContent>
        </Tooltip>
        <Button onClick={() => setOpen((value) => !value)}>Toggle</Button>
        <span {...stylex.props(layout.state)}>
          {open ? "open" : "closed"}
        </span>
      </div>

      {/* RTL */}
      <div dir="rtl" {...stylex.props(layout.row)}>
        <Tooltip>
          <TooltipTrigger render={<Button>تلميح</Button>} />
          <TooltipContent>عرض تلميح باللغة العربية.</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}