---
title: "Form"
description: "A type-safe, headless form system built on [`@tanstack/react-form`](https://tanstack.com/form), integrated with Ant Design field components."
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
  // The form data type is inferred from `defaultValues` (annotate it rather
  // than passing explicit generics — `useForm` has one generic per validator slot).
  const form = useForm({
    defaultValues: { username: '', password: '' } as LoginForm,
    onSubmit: async ({ value }) => {
      await login(value);
    },
  });

  return (
    <form.AppForm>
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
    </form.AppForm>
  );
}
```

`form.AppForm` is the form-context provider: the built-in form components (`form.Form`, `form.SubmitButton`, `form.ResetButton`) and `useFormContext` must be rendered inside it. `form.AppField` binds one field and exposes the field components through its render prop.

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
| `field.Bool` | Boolean input (switch/radio/checkbox, `variant` prop selects which; defaults to `"switch"`) |
| `field.Slider` | Slider input |
| `field.Rate` | Star rating |
| `field.ColorPicker` | Color picker |
| `field.CodeEditor` | Code editor |
| `field.IconPicker` | Icon picker |
| `field.Mentions` | Mentions input |
| `field.Transfer` | Transfer list |
| `field.Upload` | File upload |

> There is no separate `field.Switch` key. For a switch-style boolean input, use `field.Bool` (its `variant` prop defaults to `"switch"`).

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

`form.Form` establishes the layout context for every field item inside it: `layout` (`'horizontal' | 'vertical'`), `labelAlign`, and `labelWidth`. The defaults are the horizontal, right-aligned layout with a `100`px label column. Individual field items can override any of these via their own `FormItemProps`:

```tsx
// Vertical layout for the whole form
<form.Form layout="vertical">
  <form.AppField name="name">
    {(field) => <field.Input label="Name" />}
  </form.AppField>
</form.Form>

// Horizontal layout with a wider label column
<form.Form layout="horizontal" labelWidth={140}>
  <form.AppField name="name">
    {(field) => <field.Input label="Name" />}
  </form.AppField>
</form.Form>
```

The same three settings form the `FormLayout` type, which [`FormModal`](./form-modal.md), [`FormDrawer`](./form-drawer.md), and [`Crud`](./crud.md) accept as their `formLayout` prop:

```ts
interface FormLayout {
  layout?: 'horizontal' | 'vertical';
  labelAlign?: 'left' | 'right';
  labelWidth?: number;
}
```

## Field Groups

Use `withFieldGroup` to create reusable groups of fields bound to a sub-tree of the form values. It takes `{ defaultValues, render, props? }`; `render` receives a `group` API whose `AppField` names are relative to where the group is mounted:

```tsx
import { withFieldGroup } from '@vef-framework-react/components';

const AddressGroup = withFieldGroup({
  defaultValues: { city: '', zip: '' },
  render: ({ group }) => (
    <>
      <group.AppField name="city">
        {(field) => <field.Input label="City" />}
      </group.AppField>
      <group.AppField name="zip">
        {(field) => <field.Input label="ZIP" />}
      </group.AppField>
    </>
  ),
});

// Mount the group on any form whose values contain a matching sub-tree:
<AddressGroup form={form} fields="shippingAddress" />
```

## `createFormOptions`

Use `createFormOptions` to define reusable form configurations:

```tsx
import { createFormOptions } from '@vef-framework-react/components';

const loginFormOptions = createFormOptions({
  defaultValues: { username: '', password: '' } as LoginForm,
  onSubmit: async ({ value }) => { /* ... */ },
});

// In component:
const form = useForm(loginFormOptions);
```

## API

### `useForm(options)`

Accepts all [`@tanstack/react-form` FormOptions](https://tanstack.com/form/latest/docs/reference/formApi), returns a `FormApi` extended with the VEF form components (`Form`, `SubmitButton`, `ResetButton` under `form.*` / `form.AppForm`), the field components (under `form.AppField`'s render prop), and the `createField` helper.

| Option | Type | Description |
|--------|------|-------------|
| `defaultValues` | `TFormData` | Initial form values |
| `onSubmit` | `({ value }) => Promise<void>` | Submit handler |
| `onSubmitInvalid` | `({ value, formApi }) => void` | Called when submit fails validation |
| `validators` | `FormValidators` | Form-level validators |

### `FormItemProps` (shared by all field components)

Every field component accepts its wrapped control's own props plus these form-item props (`FieldComponentProps<TFieldProps> = TFieldProps & FormItemProps`):

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `ReactNode` | — | Field label |
| `labelWidth` | `number` | inherited from the form layout (default `100`) | Label width in pixels |
| `labelAlign` | `'left' \| 'right'` | inherited (default `'right'`) | Label text alignment |
| `layout` | `'horizontal' \| 'vertical'` | inherited (default `'horizontal'`) | Override the form layout for this item |
| `extra` | `ReactNode` | — | Extra hint below field |
| `required` | `boolean` | — | Show required marker |
| `noWrapper` | `boolean` | `false` | Render the bare control without the form-item wrapper (label/error scaffolding) — used in search bars and table editors |

### `form.Form` Props

A polymorphic layout/context provider — it renders a native `<form>` by default and provides the layout and disabled contexts. When rendering a native `<form>`, submit and reset events are wired to the form API automatically (`preventDefault` + `handleSubmit()` / `reset()`); `onSubmit` / `onSubmitCapture` are excluded from the props.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `layout` | `'horizontal' \| 'vertical'` | `'horizontal'` | Form item layout |
| `labelAlign` | `'left' \| 'right'` | `'right'` | Label text alignment |
| `labelWidth` | `number` | `100` | Label column width in pixels |
| `disabled` | `boolean` | `false` | Disable every field inside (provided through context) |
| `component` | `ElementType` | `"form"` | Element type to render; non-`form` elements skip the native submit/reset wiring |
| *(rest)* | `ComponentPropsWithoutRef<TComponent>` | — | Any prop of the rendered element (`className`, `style`, …) |

### `form.SubmitButton` Props

A [`Button`](./button.md) bound to the form state: it renders `type="primary"` with `htmlType="submit"`, shows a loading state while the form `isSubmitting`, and disables itself while the form `canSubmit` is `false` or the surrounding form is disabled.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onSubmit` | `() => void` | — | Click handler; only needed outside a native `<form>` (e.g. wire it to `form.handleSubmit`) |
| `children` | `ReactNode` | `'提交'` | Button label |
| *(rest)* | `ButtonProps` except `htmlType` / `onClick` / `onClickCapture` | — | Any other Button prop (`icon`, `size`, `danger`, …) |

### `form.ResetButton` Props

A [`Button`](./button.md) with `htmlType="reset"`, disabled while the form `isSubmitting` or the surrounding form is disabled.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onReset` | `() => void` | — | Click handler; only needed outside a native `<form>` (e.g. wire it to `form.reset`) |
| `children` | `ReactNode` | `'重置'` | Button label |
| *(rest)* | `ButtonProps` except `htmlType` / `onClick` / `onClickCapture` | — | Any other Button prop |

### `useFormContext<TFormData>()`

Read the nearest form API from context — used by field components rendered outside the `form.*` render props, e.g. search fields inside [`ProSearch`](./pro-search.md) or custom form actions. Returns the same `FormApi` as `useForm`, typed by the `TFormData` you pass.

### `useFormStore(form.store, selector)`

Re-export of TanStack Form's `useStore` for subscribing to form state slices (values, errors, `canSubmit`, …) with render optimization:

```tsx
const username = useFormStore(form.store, (state) => state.values.username);
```

### `withForm` / `withFieldGroup`

Re-exports of TanStack Form's HOCs, pre-bound to the VEF field and form components. `withForm` builds a reusable form component around shared form options; `withFieldGroup` builds a reusable group of fields for a value sub-tree (see Field Groups above).

### `form.createField` / `restoreFieldOptions`

`form.createField(name, options)` defines a field as data — for building form definitions as homogeneous arrays (e.g. a config-driven form engine). `options` extends every bound `<form.AppField>` option (`validators`, `listeners`, `defaultValue`, `asyncDebounceMs`, `mode`, …) plus:

| Option | Type | Description |
|--------|------|-------------|
| `render` | `(field: typeof fieldComponents) => ReactNode` | The render-prop body, scoped to the injected field components |
| `renderMeta` | `TMeta extends AnyObject` | Arbitrary metadata consumed by the surrounding map (e.g. layout span, visibility) |

It returns a `FormFieldItem<TFormData, TMeta>`: `{ name, fieldOptions?, render, renderMeta? }`, where `fieldOptions` is type-erased (`ErasedFieldOptions<TFormData>`) so items with different field names can live in one array. At the render site, `restoreFieldOptions(item.fieldOptions)` restores them for spreading:

```tsx
items.map((item) => (
  <form.AppField key={item.name} name={item.name} {...restoreFieldOptions(item.fieldOptions)}>
    {item.render}
  </form.AppField>
));
```

## Best Practices

- Define `defaultValues` with the full shape of your form data for proper TypeScript inference.
- Use `validators.onChange` for immediate feedback and `validators.onBlurAsync` for server-side checks.
- Use `form.SubmitButton` instead of a plain `Button` — it automatically disables during submission and shows loading state.
- Use `form.ResetButton` to reset the form to `defaultValues`.
