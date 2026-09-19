import type { Meta, StoryObj } from '@storybook/react-vite';
import * as stylex from '@stylexjs/stylex';
import { useState } from 'react';
import { expect, fireEvent, fn, userEvent, within } from 'storybook/test';
import { Input } from '@xeyy/components';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
  parameters: {
    a11y: { test: 'error' },
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'file', 'tel', 'url', 'search', 'date'],
    },
  },
  args: {
    onChange: fn(),
    onValueChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const layout = stylex.create({
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    width: '320px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  row: {
    display: 'flex',
    gap: '8px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '16px',
    width: '720px',
  },
});

const consumerStyles = stylex.create({
  pill: {
    borderRadius: '9999px',
  },
});

function ControlledExample() {
  const [value, setValue] = useState('');
  return (
    <label {...stylex.props(layout.field)}>
      Controlled
      <Input value={value} onValueChange={setValue} placeholder="Type here…" />
    </label>
  );
}

function ControlledValueExample() {
  const [value, setValue] = useState('');
  return (
    <div style={{ width: '320px' }}>
      <label>
        Controlled
        <Input value={value} onValueChange={setValue} placeholder="Type here…" data-testid="controlled-input" />
      </label>
      <p data-testid="controlled-value">Current value: {value}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Visual stories — baseline states
// ---------------------------------------------------------------------------

export const Placeholder: Story = {
  args: { placeholder: 'Enter your name', 'aria-label': 'Name' },
};

export const WithValue: Story = {
  args: { defaultValue: 'Ada Lovelace', 'aria-label': 'Name' },
};

export const EmptyValue: Story = {
  args: { value: '', 'aria-label': 'Name' },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: 'locked@example.com',
    'aria-label': 'Email address',
  },
};

// ---------------------------------------------------------------------------
// Visual stories — one per type
// ---------------------------------------------------------------------------

export const TypeText: Story = {
  name: 'Type: text',
  args: { type: 'text', defaultValue: 'Hello', 'aria-label': 'Text' },
};

export const TypeEmail: Story = {
  name: 'Type: email',
  args: { type: 'email', defaultValue: 'you@example.com', 'aria-label': 'Email' },
};

export const TypePassword: Story = {
  name: 'Type: password',
  args: { type: 'password', defaultValue: 'hunter2', 'aria-label': 'Password' },
};

export const TypeNumber: Story = {
  name: 'Type: number',
  args: { type: 'number', defaultValue: '42', 'aria-label': 'Quantity' },
};

export const TypeFile: Story = {
  name: 'Type: file',
  args: { type: 'file', 'aria-label': 'Avatar' },
};

export const TypeTel: Story = {
  name: 'Type: tel',
  args: { type: 'tel', defaultValue: '+44 20 7946 0958', 'aria-label': 'Phone' },
};

export const TypeUrl: Story = {
  name: 'Type: url',
  args: { type: 'url', defaultValue: 'https://example.com', 'aria-label': 'Website' },
};

export const TypeSearch: Story = {
  name: 'Type: search',
  args: { type: 'search', placeholder: 'Search…', 'aria-label': 'Search' },
};

export const TypeDate: Story = {
  name: 'Type: date',
  args: { type: 'date', defaultValue: '2026-09-15', 'aria-label': 'Due date' },
};

export const AllTypes: Story = {
  name: 'All types',
  render: () => (
    <div {...stylex.props(layout.grid)}>
      <label {...stylex.props(layout.field)}>
        Text
        <Input type="text" placeholder="Text" />
      </label>
      <label {...stylex.props(layout.field)}>
        Email
        <Input type="email" placeholder="you@example.com" />
      </label>
      <label {...stylex.props(layout.field)}>
        Password
        <Input type="password" defaultValue="hunter2" />
      </label>
      <label {...stylex.props(layout.field)}>
        Number
        <Input type="number" defaultValue="42" />
      </label>
      <label {...stylex.props(layout.field)}>
        File
        <Input type="file" />
      </label>
      <label {...stylex.props(layout.field)}>
        Tel
        <Input type="tel" placeholder="+44 20 7946 0958" />
      </label>
      <label {...stylex.props(layout.field)}>
        URL
        <Input type="url" placeholder="https://example.com" />
      </label>
      <label {...stylex.props(layout.field)}>
        Search
        <Input type="search" placeholder="Search…" />
      </label>
      <label {...stylex.props(layout.field)}>
        Date
        <Input type="date" defaultValue="2026-09-15" />
      </label>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Visual stories — states, composition, RTL
// ---------------------------------------------------------------------------

export const Invalid: Story = {
  name: 'Invalid (aria-invalid)',
  render: () => (
    <label {...stylex.props(layout.field)}>
      Password
      <Input
        type="password"
        defaultValue="hunter2"
        aria-invalid="true"
        aria-describedby="password-hint"
      />
      <span id="password-hint">Too short — at least 12 characters required.</span>
    </label>
  ),
};

export const Focused: Story = {
  name: 'Focused (autoFocus)',
  args: {
    autoFocus: true,
    placeholder: 'Focused input',
    'aria-label': 'Name',
  },
};

export const ConsumerStyle: Story = {
  name: 'Consumer style: rounded pill',
  render: () => (
    <label {...stylex.props(layout.field)}>
      Rounded pill
      <Input placeholder="Rounded override" style={consumerStyles.pill} />
    </label>
  ),
};

export const Rtl: Story = {
  name: 'RTL (dir="rtl")',
  render: () => (
    <div dir="rtl" {...stylex.props(layout.row)}>
      <label {...stylex.props(layout.field)}>
        اسم
        <Input placeholder="اسم" />
      </label>
      <label {...stylex.props(layout.field)}>
        بريد إلكتروني
        <Input placeholder="بريد إلكتروني" aria-invalid="true" />
      </label>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Visual stories — realistic combinations
// ---------------------------------------------------------------------------

export const ControlledDemo: Story = {
  name: 'Controlled (value + onValueChange)',
  render: () => <ControlledExample />,
};

export const SearchField: Story = {
  name: 'Search field with hint',
  render: () => (
    <div {...stylex.props(layout.field)}>
      <label>
        Search
        <Input type="search" placeholder="Search components, tokens, docs…" />
      </label>
      <span>Press Enter to search.</span>
    </div>
  ),
};

export const LoginForm: Story = {
  name: 'Login form (email + password)',
  render: () => (
    <div {...stylex.props(layout.form)}>
      <label {...stylex.props(layout.field)}>
        Email
        <Input type="email" placeholder="you@example.com" name="email" autoComplete="email" />
      </label>
      <label {...stylex.props(layout.field)}>
        Password
        <Input
          type="password"
          placeholder="••••••••"
          name="password"
          autoComplete="current-password"
        />
      </label>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Interaction tests
// ---------------------------------------------------------------------------

export const TypingFiresOnValueChange: Story = {
  name: 'Interaction: typing updates value and fires callbacks',
  args: { placeholder: 'Email address', 'aria-label': 'Email address' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText(/email address/i);
    await userEvent.type(input, 'hello');
    await expect(input).toHaveValue('hello');
    await expect(args.onValueChange).toHaveBeenLastCalledWith('hello', expect.anything());
    await expect(args.onChange).toHaveBeenCalled();
  },
};

export const DisabledBlocksInteraction: Story = {
  name: 'Interaction: disabled blocks focus',
  args: {
    disabled: true,
    defaultValue: 'locked@example.com',
    'aria-label': 'Email address',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText(/email address/i);
    await expect(input).toBeDisabled();
    await fireEvent.click(input);
    await expect(input).not.toHaveFocus();
  },
};

export const ClickFocusesInput: Story = {
  name: 'Interaction: click focuses the input',
  args: { placeholder: 'Search…', 'aria-label': 'Search' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText(/search/i);
    await userEvent.click(input);
    await expect(input).toHaveFocus();
  },
};

export const TabFocusesInput: Story = {
  name: 'Interaction: Tab focuses the input',
  args: { placeholder: 'Search…', 'aria-label': 'Search' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText(/search/i);
    await userEvent.tab();
    await expect(input).toHaveFocus();
  },
};

export const DataSlotPresent: Story = {
  name: 'Interaction: data-slot=input',
  args: { placeholder: 'Enter your name', 'aria-label': 'Name' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText(/name/i);
    await expect(input).toHaveAttribute('data-slot', 'input');
  },
};

export const AttributesPassthrough: Story = {
  name: 'Interaction: name/id/aria-label passthrough',
  args: {
    name: 'email',
    id: 'email-field',
    'aria-label': 'Email address',
    placeholder: 'you@example.com',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText(/email address/i);
    await expect(input).toHaveAttribute('name', 'email');
    await expect(input).toHaveAttribute('id', 'email-field');
    await expect(input).toHaveAttribute('aria-label', 'Email address');
  },
};

export const AriaInvalidRenders: Story = {
  name: 'Interaction: aria-invalid renders',
  args: { 'aria-invalid': 'true', defaultValue: 'Invalid value', 'aria-label': 'Email' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText(/email/i);
    await expect(input).toHaveAttribute('aria-invalid', 'true');
  },
};

export const ControlledValueUpdates: Story = {
  name: 'Interaction: controlled value follows onValueChange',
  render: () => <ControlledValueExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByTestId('controlled-input');
    await userEvent.type(input, 'hi');
    await expect(input).toHaveValue('hi');
    await expect(canvas.getByTestId('controlled-value')).toHaveTextContent(/current value: hi/i);
  },
};