---
title: "ActionGroup"
description: "根据声明式的配置数组渲染一组操作按钮，支持基于上下文的按钮可见性控制和权限校验。"
---

# ActionGroup

根据声明式的配置数组渲染一组操作按钮，支持基于上下文的按钮可见性控制和权限校验。

> **VEF 专属组件。** 不属于 Ant Design 的一部分。

## 何时使用

- 每行按钮各不相同的表格行操作列。
- 具有一组固定操作的工具栏。
- 任何希望以数据而非 JSX 方式定义按钮的场景。

## 基础用法

```tsx
import { ActionGroup } from '@vef-framework-react/components';
import type { ActionButtonConfig } from '@vef-framework-react/components';

const buttons: ActionButtonConfig[] = [
  {
    key: 'edit',
    label: 'Edit',
    onClick: async () => { await openEditModal(); },
  },
  {
    key: 'delete',
    label: 'Delete',
    danger: true,
    confirmable: true,
    confirmTitle: 'Delete Record',
    confirmDescription: 'This cannot be undone.',
    onClick: async () => { await deleteRecord(); },
  },
];

export default function Demo() {
  return <ActionGroup buttons={buttons} />;
}
```

## 上下文感知按钮

传入 `context` 属性（例如表格行记录）即可让按钮配置具备上下文感知能力：

```tsx
import { ActionGroup } from '@vef-framework-react/components';
import type { ActionButtonConfig } from '@vef-framework-react/components';

interface User {
  id: number;
  status: 'active' | 'inactive';
}

const buttons: ActionButtonConfig<User>[] = [
  {
    key: 'edit',
    label: 'Edit',
    onClick: async (ctx) => { await editUser(ctx.id); },
  },
  {
    key: 'activate',
    label: 'Activate',
    hidden: (ctx) => ctx.status === 'active',
    onClick: async (ctx) => { await activateUser(ctx.id); },
  },
  {
    key: 'deactivate',
    label: 'Deactivate',
    hidden: (ctx) => ctx.status === 'inactive',
    danger: true,
    onClick: async (ctx) => { await deactivateUser(ctx.id); },
  },
];

// In a table column render:
{
  title: 'Actions',
  render: (_, record) => (
    <ActionGroup<User> buttons={buttons} context={record} />
  ),
}
```

## 自定义包装器

```tsx
<ActionGroup
  buttons={buttons}
  renderWrapper={(buttonsNode) => (
    <div style={{ display: 'flex', gap: 4 }}>
      {buttonsNode}
    </div>
  )}
/>
```

## API

### ActionGroupProps

| Prop | Type | Default | 说明 |
|------|------|---------|-------------|
| `buttons` | `ActionButtonConfig<TContext>[]` | required | 按钮配置数组 |
| `size` | `'large' \| 'medium' \| 'small'` | — | 应用于所有按钮的尺寸（`'middle'` 是 `'medium'` 的废弃别名） |
| `context` | `TContext` | — | 传递给按钮回调函数的上下文值 |
| `renderWrapper` | `(buttonsNode: ReactNode) => ReactNode` | — | 自定义包装器渲染函数 |

### ActionButtonConfig

| Field | Type | Default | 说明 |
|-------|------|---------|-------------|
| `key` | `string` | required | 唯一标识 |
| `label` | `ReactNode` | — | 按钮文本 |
| `type` | `ButtonType` | — | 按钮类型 |
| `danger` | `boolean` | `false` | 危险样式 |
| `disabled` | `boolean \| (ctx) => boolean` | `false` | 禁用条件 |
| `hidden` | `boolean \| (ctx) => boolean` | `false` | 隐藏条件 |
| `confirmable` | `boolean` | `false` | 是否需要确认 |
| `confirmMode` | `'popover' \| 'dialog'` | `'popover'` | 确认框 UI 样式 |
| `confirmTitle` | `ReactNode` | — | 确认标题 |
| `confirmDescription` | `ReactNode` | — | 确认描述文本 |
| `requiredPermissions` | `string \| string[]` | — | 所需权限令牌 |
| `checkMode` | `'any' \| 'all'` | `'any'` | 权限校验模式 |
| `onClick` | `(ctx?: TContext) => Awaitable<void>` | — | 点击事件处理函数 |
| `icon` | `ReactNode` | — | 按钮图标 |

## 最佳实践

- 在组件外部定义按钮配置，避免每次渲染时重新创建。
- 使用 `hidden`（而非 `disabled`）来移除不适用于某条记录的按钮。
- 使用 `requiredPermissions` 自动隐藏用户没有权限的按钮。
