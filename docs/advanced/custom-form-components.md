---
title: Custom Form Components
description: Compose reusable form pieces with withForm, withFieldGroup, and useFormContext instead of building a parallel form system.
---

# Custom Form Components

VEF does not require every form to stay limited to built-in fields, or to be written as one flat component.  
When a form needs to be split up or a field set reused, the preferred path is to extend the existing form system rather than build a parallel one outside `useForm()`.

## Existing Extension Points

The form layer in `@vef-framework-react/components` exposes three composition APIs, re-exported from TanStack Form's `createFormHook()`:

- `useFormContext` — reads the form instance a parent component already created, so a child component can render fields without receiving the form as a prop. This is the one used most often; see [Forms](../guide/forms.md).
- `withForm` — binds a render function to a specific form shape ahead of time, so a large form can be split into components without losing field type-checking on `name`.
- `withFieldGroup` — binds a render function to a reusable slice of form values (a field group), so the same sub-form (an address, a contact block) can be mounted at different paths in different parent forms.

## Common Extension Patterns

The most common extension directions are:

1. combine existing fields into a business-oriented section
2. wrap an existing field with more domain-specific behavior

For example, splitting a form section out with `useFormContext()`:

```tsx
function UserBaseFields() {
  const { AppField } = useFormContext<UserFormValues>();

  return (
    <>
      <AppField name="name">
        {field => <field.Input label="Name" required />}
      </AppField>

      <AppField name="remark">
        {field => <field.TextArea label="Remark" />}
      </AppField>
    </>
  );
}
```

Reach for `withFieldGroup` instead of `useFormContext()` when the same field set needs to be reusable across more than one form shape — `useFormContext()` only works inside a form that already provides the exact type it asks for, while a field group can be mounted against any form that has a matching slice of values.

## Building New Field Controls

The `field.*` map (`field.Input`, `field.Select`, ...) is fixed inside the framework: `@vef-framework-react/components` calls TanStack Form's `createFormHook()` once with the built-in field components. There is no registration API — an application cannot add its own entries to `field.*`, and the internal `withFormItem` wrapper that gives built-in fields their label and validation chrome is not exported.

The supported pattern is a plain controlled component wired up inside the `AppField` render prop. The `field` argument the render prop receives is not just a namespace for `field.Input` and friends — it is the full TanStack field API:

- `field.state.value` — the current value
- `field.handleChange(value)` — write a new value (runs `onChange` validators)
- `field.handleBlur()` — mark the field as touched (runs `onBlur` validators)
- `field.state.meta` — validation state: `errors`, `isValid`, `isValidating`

### A Worked Example

A severity picker for an alert rule. The control itself is an ordinary `value` / `onChange` component with no form dependency:

```tsx
import { Button, Group } from "@vef-framework-react/components";

const LEVELS = ["low", "medium", "high"] as const;
type Severity = (typeof LEVELS)[number];

interface SeverityPickerProps {
  value?: Severity | null;
  onChange: (value: Severity) => void;
  onBlur?: () => void;
}

function SeverityPicker({ value, onChange, onBlur }: SeverityPickerProps) {
  return (
    <Group>
      {LEVELS.map(level => (
        <Button
          key={level}
          type={value === level ? "primary" : "default"}
          onBlur={onBlur}
          onClick={() => onChange(level)}
        >
          {level}
        </Button>
      ))}
    </Group>
  );
}
```

Wiring it into a form is the same `AppField` usage as any built-in field — validators, `listeners`, and `Subscribe` all compose unchanged:

```tsx
import { Alert, useFormContext } from "@vef-framework-react/components";
import { z } from "@vef-framework-react/shared";

function AlertRuleFields() {
  const { AppField } = useFormContext<AlertRuleFormValues>();

  return (
    <AppField
      name="severity"
      validators={{ onChange: z.enum(["low", "medium", "high"], "Required") }}
    >
      {field => (
        <SeverityPicker
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={field.handleChange}
        />
      )}
    </AppField>
  );
}
```

### Labels and Error Display

A custom control renders without the `Form.Item` chrome that built-in fields get, so the shared `FormItemProps` (`label`, `labelWidth`, ...) documented in [Form](../components/form.md) do not apply — render a label as part of the control, or alongside it. Validation state is available on the same field API:

```tsx
{field => (
  <>
    <SeverityPicker
      value={field.state.value}
      onBlur={field.handleBlur}
      onChange={field.handleChange}
    />

    {!field.state.meta.isValid && (
      <Alert title={field.state.meta.errors[0]?.message} type="error" />
    )}
  </>
)}
```

When the same control plus wiring recurs across forms, extract it exactly like any other field set — a section component built on `useFormContext()`, or a `withFieldGroup` when it must mount into more than one form shape.

## Practical Guidance

- Keep the `AppField` mental model intact.
- Let reuse happen at the field-composition layer instead of rebuilding form state.
- Combine existing fields first, and only add lower-level adapters when that is truly necessary.
