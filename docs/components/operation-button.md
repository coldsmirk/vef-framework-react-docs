---
title: "OperationButton"
description: "A combination of [`ActionButton`](./action-button) and [`PermissionGate`](./permission-gate) — an action button with built-in async loading, optional confirmation dialog, and permission-based visibility."
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
      requiredPermissions="user:edit"
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
  requiredPermissions="user:delete"
  color="danger"
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
        requiredPermissions="user:edit"
        onClick={async () => openEdit(record)}
      >
        Edit
      </OperationButton>
      <OperationButton
        requiredPermissions="user:delete"
        color="danger"
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

The props type is exported as `OperationButtonProps`.

`OperationButton` extends [`ActionButton`](./action-button.md) props (except `size`, `variant`, `type`, and `danger`, which are removed) plus the permission props of [`PermissionGate`](./permission-gate.md):

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `requiredPermissions` | `string \| string[]` | — | Required permission token(s); when empty, the button renders without a permission gate |
| `checkMode` | `'any' \| 'all'` | `'any'` | Permission check mode |
| `confirmable` | `boolean` | `false` | Show confirmation before executing |
| `confirmMode` | `'popover' \| 'dialog'` | `'popover'` | Confirmation UI style |
| `confirmTitle` | `ReactNode` | `'确认提示'` | Confirmation title |
| `confirmDescription` | `ReactNode` | `'确定要执行此操作吗？'` | Confirmation description |
| `color` | `ButtonColor` | — | Button color (e.g. `'primary'`, `'danger'`) — use this instead of the removed `type` / `danger` props |
| `onClick` | `(e) => Awaitable<void>` | — | Async click handler |

> Note: `size` and `variant` are fixed internally (`size="small"`, `variant="filled"`, sized to fit table rows) and cannot be overridden; `type` and `danger` are removed from the props — style through `color`.

## Comparison

| Feature | `Button` | `ActionButton` | `OperationButton` |
|---------|----------|----------------|-------------------|
| Async loading | Manual | Auto | Auto |
| Confirm dialog | No | Yes | Yes |
| Permission check | No | No | Yes |
