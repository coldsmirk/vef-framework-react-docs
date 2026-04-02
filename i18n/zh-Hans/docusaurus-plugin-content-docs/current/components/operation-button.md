---
sidebar_position: 19
---

# OperationButton 操作按钮

[`ActionButton`](./action-button) 与 [`PermissionGate`](./permission-gate) 的组合——内置异步 loading、可选确认对话框和权限可见性控制的操作按钮。

> **VEF 特有组件**，不属于 Ant Design。

## 何时使用

- 需要同时进行异步操作和权限检查的表格行操作按钮。
- 用户缺少所需权限时应隐藏的按钮。

## 基础用法

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
      编辑
    </OperationButton>
  );
}
```

用户没有 `user:edit` 权限时，按钮不会渲染。

## 带确认

```tsx
<OperationButton
  permTokens="user:delete"
  danger
  confirmable
  confirmTitle="删除用户"
  confirmDescription="此操作不可撤销。"
  onClick={async () => {
    await deleteUser(id);
  }}
>
  删除
</OperationButton>
```

## 在表格列中使用

```tsx
{
  title: '操作',
  render: (_, record) => (
    <Space>
      <OperationButton
        permTokens="user:edit"
        onClick={async () => openEdit(record)}
      >
        编辑
      </OperationButton>
      <OperationButton
        permTokens="user:delete"
        danger
        confirmable
        onClick={async () => deleteUser(record.id)}
      >
        删除
      </OperationButton>
    </Space>
  ),
}
```

## API

`OperationButton` 继承 `ActionButton` 属性（除 `size`、`variant`、`type`、`danger`）以及 `PermissionGate` 属性：

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `permTokens` | `string \| string[]` | — | 所需权限令牌 |
| `checkMode` | `'any' \| 'all'` | `'any'` | 权限检查模式 |
| `confirmable` | `boolean` | `false` | 执行前显示确认提示 |
| `confirmMode` | `'popover' \ | 'dialog'` | `'popover'` | 确认 UI 样式 |
| `confirmTitle` | `ReactNode` | `'确认提示'` | 确认标题 |
| `confirmDescription` | `ReactNode` | `'确定要执行此操作吗？'` | 确认描述 |
| `onClick` | `(e) => Awaitable<void>` | — | 异步点击回调 |

> 注意：`size`、`variant`、`type`、`danger` 由内部固定，不可覆盖。

## 对比

| 特性 | `Button` | `ActionButton` | `OperationButton` |
|------|----------|----------------|-------------------|
| 异步 loading | 手动 | 自动 | 自动 |
| 确认对话框 | 无 | 有 | 有 |
| 权限检查 | 无 | 无 | 有 |
