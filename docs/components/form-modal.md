---
title: "FormModal"
description: "A modal dialog that combines form state, mutation execution, and submit/reset actions."
---

# FormModal

A modal dialog that combines form state, mutation execution, and submit/reset actions.

> **VEF-specific component.** Moved from `@vef-framework-react/starter` to `@vef-framework-react/components` in v2.1.6.

## When to Use

- Create and edit forms that open in a modal dialog.
- Any form that submits via a `MutationFunction`.

## Basic Usage

```tsx
import { FormModal } from '@vef-framework-react/components';

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
| `formComponent` | `ElementType` | `"form"` | Element type for the inner form wrapper |
| `formLayout` | `FormLayout` | — | Layout of the form items inside the modal — `layout` (`'horizontal' \| 'vertical'`), `labelAlign` and `labelWidth`. Defaults to the horizontal, right-aligned label layout (see [Form](./form.md)) |
| `mutationFn` | `MutationFunction<ApiResult<TData>, TValues>` | — | Mutation to execute on submit |
| `mutationMeta` | `MutationMeta` | — | Mutation metadata (e.g. `invalidates`) |
| `beforeSubmit` | `(values) => Awaitable<TValues>` | — | Transform values before submission |
| `afterSubmit` | `(values, data) => Awaitable<void>` | — | Called after successful submission |
| `onSubmit` | `(values) => Awaitable<void>` | — | Custom submit handler (alternative to `mutationFn`) |
| `onReset` | `(defaultValues?) => void` | — | Called on form reset |
| `onClose` | `() => void` | — | Called when modal closes |
| `renderActions` | `(formApi, defaults: { submitButton, resetButton }) => ReactNode` | — | Custom footer actions; `defaults` carries the default submit/reset buttons to reuse alongside custom ones; return `null` to hide footer |
| `submitButtonProps` | `Except<SubmitButtonProps, 'onSubmit' \| 'disabled' \| 'loading'>` | — | Submit button customization (only used when `renderActions` is not provided) |
| `resetButtonProps` | `Except<ResetButtonProps, 'onReset' \| 'disabled' \| 'loading'> \| false` | — | Reset button customization; `false` to hide (only used when `renderActions` is not provided) |
| `children` | `ReactNode \| (formApi) => ReactNode` | — | Form content |

```tsx
// Add a custom button alongside the defaults
renderActions={(formApi, { submitButton, resetButton }) => (
  <>
    <Button onClick={handleDraft}>Save Draft</Button>
    {resetButton}
    {submitButton}
  </>
)}
```
