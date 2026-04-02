---
sidebar_position: 19
---

# OperationButton

A combination of [`ActionButton`](./action-button) and [`PermissionGate`](./permission-gate) — an action button with built-in async loading, optional confirmation dialog, and permission-based visibility.

> **VEF-specific component.** Not part of Ant Design.

## When to Use

- Table row action buttons that require both async operations and permission checks.
- Any button that should be hidden when the user lacks the required permission.

## Basic Usage

```tsx
import { OperationButton } from '@vef-framework-react/components';
import { Pencil } from 'lucide-react';

export default function Demo() {
  return (
    <OperationButton
      permTokens="user:edit"
      icon={<Pencil size={14} />}
      onClick={async () => {
        await editUser(id);
      }}
    >
      Edit
    </OperationButton>
  );
}
```

If the user lacks `user:edit` permission, the button is not rendered at all.

## With Confirmation

```tsx
<OperationButton
  permTokens="user:delete"
  danger
  confirmable
  confirmTitle="Delete User"
  confirmDescription="This action cannot be undone."
  onClick={async () => {
    await deleteUser(id);
  }}
>
  Delete
</OperationButton>
```

## In a Table Column

```tsx
{
  title: 'Actions',
  render: (_, record) => (
    <Space>
      <OperationButton
        permTokens="user:edit"
        onClick={async () => openEdit(record)}
      >
        Edit
      </OperationButton>
      <OperationButton
        permTokens="user:delete"
        danger
        confirmable
        onClick={async () => deleteUser(record.id)}
      >
        Delete
      </OperationButton>
    </Space>
  ),
}
```

## API

`OperationButton` extends `ActionButton` props (except `size`, `variant`, `type`, `danger`) plus `PermissionGate` props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `permTokens` | `string \| string[]` | — | Required permission token(s) |
| `checkMode` | `'any' \| 'all'` | `'any'` | Permission check mode |
| `confirmable` | `boolean` | `false` | Show confirmation before executing |
| `confirmMode` | `'popover' \| 'dialog'` | `'popover'` | Confirmation UI style |
| `confirmTitle` | `ReactNode` | `'确认提示'` | Confirmation title |
| `confirmDescription` | `ReactNode` | `'确定要执行此操作吗？'` | Confirmation description |
| `onClick` | `(e) => Awaitable<void>` | — | Async click handler |

> Note: `size`, `variant`, `type`, and `danger` are fixed internally and cannot be overridden.

## Comparison

| Feature | `Button` | `ActionButton` | `OperationButton` |
|---------|----------|----------------|-------------------|
| Async loading | Manual | Auto | Auto |
| Confirm dialog | No | Yes | Yes |
| Permission check | No | No | Yes |
