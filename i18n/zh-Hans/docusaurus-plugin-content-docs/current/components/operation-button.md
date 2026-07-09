---
title: "OperationButton"
description: "[`ActionButton`](./action-button) 与 [`PermissionGate`](./permission-gate) 的组合——内置异步加载、可选确认对话框，并具备基于权限的可见性控制的操作按钮。"
---

# OperationButton

[`ActionButton`](./action-button) 与 [`PermissionGate`](./permission-gate) 的组合——内置异步加载、可选确认对话框，并具备基于权限的可见性控制的操作按钮。

> **VEF 专属组件。** 不属于 Ant Design 的一部分。

## 何时使用

- 需要同时进行异步操作和权限校验的表格行操作按钮。
- 当用户缺少所需权限时应当隐藏的任意按钮。

## 基础用法

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

如果用户没有 `user:edit` 权限，该按钮将完全不会被渲染。

## 带确认

```tsx
<OperationButton
  requiredPermissions="user:delete"
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

## 在表格列中使用

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

`OperationButton` 继承了 `ActionButton` 的属性（`size`、`variant`、`type`、`danger` 除外），并叠加了 `PermissionGate` 的属性：

| Prop | Type | Default | 说明 |
|------|------|---------|-------------|
| `requiredPermissions` | `string \| string[]` | — | 所需的权限令牌 |
| `checkMode` | `'any' \| 'all'` | `'any'` | 权限校验模式 |
| `confirmable` | `boolean` | `false` | 执行前显示确认提示 |
| `confirmMode` | `'popover' \| 'dialog'` | `'popover'` | 确认框 UI 样式 |
| `confirmTitle` | `ReactNode` | `'确认提示'` | 确认标题 |
| `confirmDescription` | `ReactNode` | `'确定要执行此操作吗？'` | 确认描述文本 |
| `onClick` | `(e) => Awaitable<void>` | — | 异步点击事件处理函数 |

> 注意：`size`、`variant`、`type` 和 `danger` 由内部固定，无法被覆盖。

## 对比

| 特性 | `Button` | `ActionButton` | `OperationButton` |
|---------|----------|----------------|-------------------|
| 异步加载 | 手动 | 自动 | 自动 |
| 确认对话框 | 无 | 有 | 有 |
| 权限校验 | 无 | 无 | 有 |
