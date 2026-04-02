---
sidebar_position: 103
---

# FormDrawer

A drawer panel that combines form state, mutation execution, and submit/reset actions. Same API as `FormModal` but rendered as a side drawer.

> **VEF-specific component.** Moved from `@vef-framework-react/starter` to `@vef-framework-react/components` in v2.1.6.

## When to Use

- Create and edit forms that open in a side drawer.
- Forms that benefit from more vertical space than a modal provides.

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

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | `false` | Whether the drawer is visible |
| `title` | `ReactNode` | — | Drawer title |
| `width` | `string \| number` | — | Drawer width |
| `placement` | `DrawerProps['placement']` | — | Drawer placement |
| `resizable` | `boolean` | — | Whether the drawer is resizable |
| `defaultValues` | `TValues` | — | Initial form values |
| `disabled` | `boolean` | `false` | Disable the form |
| `mutationFn` | `MutationFunction<ApiResult<TData>, TValues>` | — | Mutation to execute on submit |
| `mutationMeta` | `MutationMeta` | — | Mutation metadata |
| `beforeSubmit` | `(values) => Awaitable<TValues>` | — | Transform values before submission |
| `afterSubmit` | `(values, data) => Awaitable<void>` | — | Called after successful submission |
| `onSubmit` | `(values) => Awaitable<void>` | — | Custom submit handler |
| `onReset` | `(defaultValues?) => void` | — | Called on form reset |
| `onClose` | `() => void` | — | Called when drawer closes |
| `renderActions` | `(formApi) => ReactNode` | — | Custom footer actions |
| `submitButtonProps` | `SubmitButtonProps` | — | Submit button customization |
| `resetButtonProps` | `ResetButtonProps \| false` | — | Reset button customization; `false` to hide |
| `children` | `ReactNode \| (formApi) => ReactNode` | — | Form content |
