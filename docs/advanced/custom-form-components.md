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

## Practical Guidance

- Keep the `AppField` mental model intact.
- Let reuse happen at the field-composition layer instead of rebuilding form state.
- Combine existing fields first, and only add lower-level adapters when that is truly necessary.
