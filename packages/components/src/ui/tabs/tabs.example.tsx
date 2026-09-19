import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";
import { semantic } from "@xeyy/tokens/theme.stylex";

const layout = stylex.create({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: "32px",
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  heading: {
    fontSize: "0.875rem",
    fontWeight: "500",
    color: semantic.foreground,
  },
  note: {
    fontSize: "0.75rem",
    color: semantic.mutedForeground,
  },
  panel: {
    backgroundColor: semantic.card,
    color: semantic.cardForeground,
    borderRadius: `calc(${semantic.radius} - 2px)`,
    border: "1px solid",
    borderColor: semantic.border,
    padding: "1rem",
  },
});

const options = [
  { value: "account", label: "Account" },
  { value: "password", label: "Password" },
  { value: "notifications", label: "Notifications" },
];

const settings = [
  { value: "general", label: "General", text: "Set the workspace name, language, and default plan for new members." },
  { value: "members", label: "Members", text: "Invite people and control which permissions each role can use." },
  { value: "billing", label: "Billing", text: "Manage your subscription, invoices, and payment methods." },
];

export function TabsExample() {
  const [value, setValue] = useState("account");

  return (
    <div {...stylex.props(layout.root)}>
      {/* Uncontrolled, horizontal */}
      <section {...stylex.props(layout.section)}>
        <h2 {...stylex.props(layout.heading)}>Default</h2>
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <div {...stylex.props(layout.panel)}>
              <strong>Overview</strong>
              <p>Recent activity across all of your projects, grouped by day.</p>
            </div>
          </TabsContent>
          <TabsContent value="activity">
            <div {...stylex.props(layout.panel)}>
              <strong>Activity</strong>
              <p>Every push, merge, and comment from the last thirty days.</p>
            </div>
          </TabsContent>
          <TabsContent value="settings">
            <div {...stylex.props(layout.panel)}>
              <strong>Settings</strong>
              <p>Profile, notifications, and team preferences live here.</p>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Controlled */}
      <section {...stylex.props(layout.section)}>
        <h2 {...stylex.props(layout.heading)}>Controlled (active: {value})</h2>
        <Tabs value={value} onValueChange={setValue}>
          <TabsList>
            {options.map((option) => (
              <TabsTrigger key={option.value} value={option.value}>
                {option.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {options.map((option) => (
            <TabsContent key={option.value} value={option.value}>
              <div {...stylex.props(layout.panel)}>
                <strong>{option.label}</strong>
                <p>Independent panel for the "{option.label}" option.</p>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </section>

      {/* Disabled trigger */}
      <section {...stylex.props(layout.section)}>
        <h2 {...stylex.props(layout.heading)}>Disabled</h2>
        <Tabs defaultValue="billing">
          <TabsList>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="shipping">Shipping</TabsTrigger>
            <TabsTrigger disabled value="gift">
              Gift card
            </TabsTrigger>
          </TabsList>
          <TabsContent value="billing">
            <div {...stylex.props(layout.panel)}>Billing panel.</div>
          </TabsContent>
          <TabsContent value="shipping">
            <div {...stylex.props(layout.panel)}>Shipping panel.</div>
          </TabsContent>
          <TabsContent value="gift">
            <div {...stylex.props(layout.panel)}>Gift card panel.</div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Vertical */}
      <section {...stylex.props(layout.section)}>
        <h2 {...stylex.props(layout.heading)}>Vertical</h2>
        <Tabs orientation="vertical" defaultValue="general">
          <TabsList>
            {settings.map((option) => (
              <TabsTrigger key={option.value} value={option.value}>
                {option.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {settings.map((option) => (
            <TabsContent key={option.value} value={option.value}>
              <div {...stylex.props(layout.panel)}>{option.text}</div>
            </TabsContent>
          ))}
        </Tabs>
      </section>

      <span {...stylex.props(layout.note)}>
        Keyboard: arrow keys navigate between tabs (inherited from Base UI).
      </span>
    </div>
  );
}