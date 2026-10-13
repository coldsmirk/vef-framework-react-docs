---
title: "FormDrawer"
description: "A drawer panel that combines form state, mutation execution, and submit/reset actions. Same API as `FormModal` but rendered as a side drawer."
---

# FormDrawer

A drawer panel that combines form state, mutation execution, and submit/reset actions. Same API as `FormModal` but rendered as a side drawer.

> **VEF-specific component.** Moved from `@vef-framework-react/starter` to `@vef-framework-react/components` in v2.1.6.

## When to Use

- Create and edit forms that open in a side drawer.
- Forms that benefit from more vertical space than a modal provides.

Form content taller than the drawer scrolls inside the drawer body; the body's bottom padding is kept after the last field, so scrolled to the end the content never sits flush against the footer actions.

## Basic Usage

```tsx
import { FormDrawer } from '@vef-framework-react/components';

interface UserForm {
  name: string;
  email: string;
}

export default function EditUserDrawer({ open, onClose }) {
  return (
    <FormDrawer<UserForm>
      open={open}
      title="Edit User"
      width={480}
      mutationFn={updateUser}
      mutationMeta={{ invalidates: [[findUserPage.key]] }}
      afterSubmit={() => onClose()}
      onClose={onClose}
    >
      {(form) => (
        <>
          <form.AppField name="name">
            {(field) => <field.Input label="Name" required />}
          </form.AppField>
          <form.AppField name="email">
            {(field) => <field.Input label="Email" required />}
          </form.AppField>
        </>
      )}
    </FormDrawer>
  );
}
```

## API

The props type is exported as `FormDrawerProps`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | `false` | Whether the drawer is visible |
| `title` | `ReactNode` | — | Drawer title |
| `width` | `string \| number` | — | Drawer width |
| `placement` | `DrawerProps['placement']` | `'right'` | Drawer placement |
| `resizable` | `boolean` | — | Whether the drawer is resizable |
| `defaultValues` | `TValues` | — | Initial form values |
| `disabled` | `boolean` | `false` | Disable the form |
| `formComponent` | `ElementType` | `"form"` | Element type for the inner form wrapper |
| `formLayout` | `FormLayout` | — | Layout of the form items inside the drawer — `layout` (`'horizontal' \| 'vertical'`), `labelAlign` and `labelWidth`. Defaults to the horizontal, right-aligned label layout (see [Form](./form.md)) |
| `mutationFn` | `MutationFunction<ApiResult<TData>, TValues>` | — | Mutation to execute on submit |
| `mutationMeta` | `MutationMeta` | — | Mutation metadata |
| `beforeSubmit` | `(values) => Awaitable<TValues>` | — | Transform values before submission |
| `afterSubmit` | `(values, data) => Awaitable<void>` | — | Called after successful submission |
| `onSubmit` | `(values) => Awaitable<void>` | — | Custom submit handler |
| `onReset` | `(defaultValues?) => void` | — | Called on form reset |
| `onClose` | `() => void` | — | Called when drawer closes |
| `renderActions` | `(formApi, defaults: { submitButton, resetButton }) => ReactNode` | — | Custom footer actions; `defaults` carries the default submit/reset buttons to reuse alongside custom ones; return `null` to hide footer |
| `submitButtonProps` | `Except<SubmitButtonProps, 'onSubmit' \| 'disabled' \| 'loading'>` | — | Submit button customization — applied to the default footer, and to `defaults.submitButton` when `renderActions` is provided |
| `resetButtonProps` | `Except<ResetButtonProps, 'onReset' \| 'disabled' \| 'loading'> \| false` | — | Reset button customization; `false` hides it — applied to the default footer, and to `defaults.resetButton` when `renderActions` is provided (which `false` leaves empty) |
| `children` | `ReactNode \| (formApi) => ReactNode` | — | Form content |
