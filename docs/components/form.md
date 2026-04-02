---
sidebar_position: 6
---

# Form

A type-safe, headless form system built on [`@tanstack/react-form`](https://tanstack.com/form), integrated with Ant Design field components.

> **Note:** VEF does **not** re-export Ant Design's `Form` component. Instead, it provides `useForm` — a fully type-safe form hook with built-in field components.

## When to Use

- Any data entry form in a VEF application.
- When you need type-safe form state with TypeScript inference.
- When you need validation, async submission, and field-level error display.

## Basic Usage

```tsx
import { useForm } from '@vef-framework-react/components';

interface LoginForm {
  username: string;
  password: string;
}

export default function LoginPage() {
  const form = useForm<LoginForm>({
    defaultValues: {
      username: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      await login(value);
    },
  });

  return (
    <form.Form layout="vertical">
      <form.AppField
        name="username"
        validators={{ onChange: ({ value }) => !value ? 'Required' : undefined }}
      >
        {(field) => (
          <field.Input label="Username" placeholder="Enter username" />
        )}
      </form.AppField>

      <form.AppField name="password">
        {(field) => (
          <field.Password label="Password" placeholder="Enter password" />
        )}
      </form.AppField>

      <form.SubmitButton>Login</form.SubmitButton>
    </form.Form>
  );
}
```

## Available Field Components

All field components are accessed via `field.*` inside a `form.AppField` render function:

| Field Component | Description |
|----------------|-------------|
| `field.Input` | Text input |
| `field.Password` | Password input |
| `field.TextArea` | Multi-line text |
| `field.InputNumber` | Numeric input |
| `field.Select` | Dropdown selector |
| `field.TreeSelect` | Tree-based selector |
| `field.AutoComplete` | Auto-complete input |
| `field.Cascader` | Cascading selector |
| `field.DatePicker` | Date picker |
| `field.DateRangePicker` | Date range picker |
| `field.TimePicker` | Time picker |
| `field.TimeRangePicker` | Time range picker |
| `field.Checkbox` | Single checkbox |
| `field.CheckboxGroup` | Checkbox group |
| `field.Radio` | Radio group |
| `field.Bool` | Boolean input (switch/radio/checkbox) |
| `field.Switch` | — (use `field.Bool` with `variant="switch"`) |
| `field.Slider` | Slider input |
| `field.Rate` | Star rating |
| `field.ColorPicker` | Color picker |
| `field.Mentions` | Mentions input |
| `field.Transfer` | Transfer list |
| `field.Upload` | File upload |

## Validation

```tsx
<form.AppField
  name="email"
  validators={{
    onChange: ({ value }) => {
      if (!value) return 'Email is required';
      if (!/\S+@\S+\.\S+/.test(value)) return 'Invalid email';
      return undefined;
    },
    onBlurAsync: async ({ value }) => {
      const taken = await checkEmailTaken(value);
      return taken ? 'Email already in use' : undefined;
    },
  }}
>
  {(field) => <field.Input label="Email" />}
</form.AppField>
```

## Form Layout

```tsx
// Horizontal layout with label width
<form.Form layout="horizontal">
  <form.AppField name="name">
    {(field) => (
      <field.Input label="Name" labelWidth={100} />
    )}
  </form.AppField>
</form.Form>

// Inline layout
<form.Form layout="inline">
  ...
</form.Form>
```

## Field Groups

Use `withFieldGroup` to create reusable groups of fields:

```tsx
import { withFieldGroup } from '@vef-framework-react/components';

const AddressGroup = withFieldGroup<{ city: string; zip: string }>(
  ({ form }) => (
    <>
      <form.AppField name="city">
        {(field) => <field.Input label="City" />}
      </form.AppField>
      <form.AppField name="zip">
        {(field) => <field.Input label="ZIP" />}
      </form.AppField>
    </>
  )
);
```

## `createFormOptions`

Use `createFormOptions` to define reusable form configurations:

```tsx
import { createFormOptions } from '@vef-framework-react/components';

const loginFormOptions = createFormOptions<LoginForm>({
  defaultValues: { username: '', password: '' },
  onSubmit: async ({ value }) => { /* ... */ },
});

// In component:
const form = useForm(loginFormOptions);
```

## API

### `useForm(options)`

Accepts all [`@tanstack/react-form` FormOptions](https://tanstack.com/form/latest/docs/reference/formApi), returns a `FormApi` with additional VEF field components.

| Option | Type | Description |
|--------|------|-------------|
| `defaultValues` | `TFormData` | Initial form values |
| `onSubmit` | `({ value }) => Promise<void>` | Submit handler |
| `onSubmitInvalid` | `({ value, formApi }) => void` | Called when submit fails validation |
| `validators` | `FormValidators` | Form-level validators |

### `FormItemProps` (shared by all field components)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `ReactNode` | — | Field label |
| `labelWidth` | `number` | — | Label width in pixels |
| `labelAlign` | `'left' \| 'right'` | — | Label text alignment |
| `layout` | `'horizontal' \| 'vertical' \| 'inline'` | — | Override form layout |
| `extra` | `ReactNode` | — | Extra hint below field |
| `required` | `boolean` | — | Show required marker |
| `noWrapper` | `boolean` | `false` | Render without form item wrapper |

### `form.Form` Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `layout` | `'horizontal' \| 'vertical' \| 'inline'` | `'horizontal'` | Form layout |
| `onSubmit` | `(e) => void` | — | Native form submit (handled automatically) |

## Best Practices

- Define `defaultValues` with the full shape of your form data for proper TypeScript inference.
- Use `validators.onChange` for immediate feedback and `validators.onBlurAsync` for server-side checks.
- Use `form.SubmitButton` instead of a plain `Button` — it automatically disables during submission and shows loading state.
- Use `form.ResetButton` to reset the form to `defaultValues`.
