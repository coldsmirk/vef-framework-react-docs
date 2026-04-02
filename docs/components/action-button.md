---
sidebar_position: 8
---

# ActionButton

A button with built-in async loading state management and optional confirmation dialog.

> **VEF-specific component.** Not part of Ant Design.

## When to Use

- Any button that triggers an async operation (API call, form submission, etc.).
- Buttons that require user confirmation before executing a destructive or irreversible action.

## Basic Usage

```tsx
import { ActionButton } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <ActionButton
      type="primary"
      onClick={async () => {
        await saveData();
      }}
    >
      Save
    </ActionButton>
  );
}
```

The button automatically shows a loading spinner while the `onClick` promise is pending. No manual `loading` state management needed.

## With Confirmation (Popover)

```tsx
import { ActionButton } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <ActionButton
      danger
      confirmable
      confirmTitle="Delete Record"
      confirmDescription="This action cannot be undone."
      onClick={async () => {
        await deleteRecord(id);
      }}
    >
      Delete
    </ActionButton>
  );
}
```

## With Confirmation (Dialog)

```tsx
import { ActionButton } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <ActionButton
      type="primary"
      confirmable
      confirmMode="dialog"
      confirmTitle="Submit Application"
      confirmDescription="Are you sure you want to submit?"
      onClick={async () => {
        await submitApplication();
      }}
    >
      Submit
    </ActionButton>
  );
}
```

## API

`ActionButton` extends all [`Button`](./button) props except `loading` and `onClick`, plus:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onClick` | `(e) => Awaitable<void>` | — | Click handler; supports async functions |
| `confirmable` | `boolean` | `false` | Show confirmation before executing `onClick` |
| `confirmMode` | `'popover' \| 'dialog'` | `'popover'` | Confirmation UI style |
| `confirmTitle` | `ReactNode` | `'确认提示'` | Confirmation dialog title |
| `confirmDescription` | `ReactNode` | `'确定要执行此操作吗？'` | Confirmation dialog description |

All other `Button` props (`type`, `size`, `danger`, `disabled`, `icon`, etc.) are supported.

## Comparison with Button

| Feature | `Button` | `ActionButton` |
|---------|----------|----------------|
| Async loading | Manual | Automatic |
| Confirm dialog | No | Built-in |
| Permission check | No | No (use `OperationButton`) |

## Best Practices

- Use `ActionButton` instead of `Button` for any operation that calls an API.
- Use `confirmable` for destructive actions (delete, reset, publish).
- Use `confirmMode="dialog"` for high-stakes confirmations that need more context.
- For table row actions with permission checks, use `OperationButton`.
