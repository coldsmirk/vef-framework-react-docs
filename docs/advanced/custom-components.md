---
sidebar_position: 1
title: Form Extensions and Custom Components
---

# Form Extensions and Custom Components

VEF does not require every form to stay limited to built-in fields.  
When the built-in field set is not enough, the preferred path is to extend the existing form system rather than build a parallel one outside `useForm()`.

## Existing Extension Points

The form layer in `@vef-framework/components` exposes:

- `withForm`
- `withFieldGroup`
- `useFormContext`

These APIs make it possible to keep the current form context, validation model, and layout behavior while extending the field surface.

## Common Extension Patterns

The most common extension directions are:

1. combine existing fields into a business-oriented section
2. wrap an existing field with more domain-specific behavior

For example:

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

## Practical Guidance

- Keep the `AppField` mental model intact.
- Let reuse happen at the field-composition layer instead of rebuilding form state.
- Combine existing fields first, and only add lower-level adapters when that is truly necessary.
