---
sidebar_position: 102
---

# FormModal

A modal dialog that combines form state, mutation execution, and submit/reset actions.

> **VEF-specific component.** Moved from `@vef-framework-react/starter` to `@vef-framework-react/components` in v2.1.6.

## When to Use

- Create and edit forms that open in a modal dialog.
- Any form that submits via a `MutationFunction`.

## Basic Usage

```tsx
import { FormModal, useForm } from '@vef-framework-react/components';

interface UserForm {
  name: string;
  email: string;
}

export default function CreateUserModal({ open, onClose }) {
  return (
    <FormModal<UserForm>
      open={open}
      title="Create User"
      defaultValues={{ name: '', email: '' }}
      mutationFn={createUser}
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
    </FormModal>
  );
}
```

## API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | `false` | Whether the modal is visible |
| `title` | `ReactNode` | — | Modal title |
| `width` | `string \| number` | — | Modal width |
| `draggable` | `boolean` | `true` | Whether the modal can be dragged |
| `defaultValues` | `TValues` | — | Initial form values |
| `disabled` | `boolean` | `false` | Disable the form |
| `mutationFn` | `MutationFunction<ApiResult<TData>, TValues>` | — | Mutation to execute on submit |
| `mutationMeta` | `MutationMeta` | — | Mutation metadata (e.g. `invalidates`) |
| `beforeSubmit` | `(values) => Awaitable<TValues>` | — | Transform values before submission |
| `afterSubmit` | `(values, data) => Awaitable<void>` | — | Called after successful submission |
| `onSubmit` | `(values) => Awaitable<void>` | — | Custom submit handler (alternative to `mutationFn`) |
| `onReset` | `(defaultValues?) => void` | — | Called on form reset |
| `onClose` | `() => void` | — | Called when modal closes |
| `renderActions` | `(formApi) => ReactNode` | — | Custom footer actions; return `null` to hide footer |
| `submitButtonProps` | `SubmitButtonProps` | — | Submit button customization |
| `resetButtonProps` | `ResetButtonProps \| false` | — | Reset button customization; `false` to hide |
| `children` | `ReactNode \| (formApi) => ReactNode` | — | Form content |
