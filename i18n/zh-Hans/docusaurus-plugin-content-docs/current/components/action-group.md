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
    color: 'danger',
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
    color: 'danger',
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

标注为*可计算*的字段既接受静态值，也接受 `(context: TContext) => value` 函数；仅在给定上下文类型时才能使用函数形式。

| Field | Type | Default | 说明 |
|-------|------|---------|-------------|
| `key` | `string` | required | 唯一标识 |
| `label` | `string` | required | 按钮文本；也会被插值到默认确认描述中 |
| `color` | `ButtonColor` | — | 按钮颜色（例如 `'primary'`、`'danger'`），转发给底层的 `ActionButton` |
| `variant` | `ButtonVariant` | — | 按钮变体（例如 `'solid'`、`'outlined'`、`'filled'`、`'text'`、`'link'`），转发给底层的 `ActionButton` |
| `icon` | `ReactNode` | — | 按钮图标 |
| `disabled` | `boolean \| (ctx: TContext) => boolean` | `false` | 禁用条件（*可计算*） |
| `hidden` | `boolean \| (ctx: TContext) => boolean` | `false` | 隐藏条件（*可计算*） |
| `confirmable` | `boolean \| (ctx: TContext) => boolean` | `false` | 是否需要确认（*可计算*） |
| `confirmMode` | `'popover' \| 'dialog'` 或 `(ctx) => ...` | `'popover'` | 确认框 UI 样式（*可计算*） |
| `confirmTitle` | `ReactNode` 或 `(ctx) => ReactNode` | `'确认提示'` | 确认标题（*可计算*） |
| `confirmDescription` | `ReactNode` 或 `(ctx) => ReactNode` | `` `确定要${label}吗？` `` | 确认描述文本（*可计算*） |
| `requiredPermissions` | `string[]` | — | 权限令牌；未通过校验的按钮会被过滤掉 |
| `checkMode` | `'any' \| 'all'` | `'any'` | 权限校验模式 |
| `onClick` | `(context: TContext) => Awaitable<void>` | required | 点击事件处理函数；接收按钮组的 `context`（未给定上下文类型时无参数） |

## 最佳实践

- 在组件外部定义按钮配置，避免每次渲染时重新创建。
- 使用 `hidden`（而非 `disabled`）来移除不适用于某条记录的按钮。
- 使用 `requiredPermissions` 自动隐藏用户没有权限的按钮。
