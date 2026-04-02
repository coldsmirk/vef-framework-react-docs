---
sidebar_position: 9
---

# ActionGroup 操作组

从声明式配置数组渲染一组操作按钮，支持上下文感知的按钮显隐和权限检查。

> **VEF 特有组件**，不属于 Ant Design。

## 何时使用

- 表格行操作列，按钮因行数据不同而变化。
- 工具栏中有一组固定操作。
- 希望将按钮定义为数据而非 JSX 的场景。

## 基础用法

```tsx
import { ActionGroup } from '@vef-framework-react/components';
import type { ActionButtonConfig } from '@vef-framework-react/components';

const buttons: ActionButtonConfig[] = [
  {
    key: 'edit',
    label: '编辑',
    onClick: async () => { await openEditModal(); },
  },
  {
    key: 'delete',
    label: '删除',
    danger: true,
    confirmable: true,
    confirmTitle: '删除记录',
    confirmDescription: '此操作不可撤销。',
    onClick: async () => { await deleteRecord(); },
  },
];

export default function Demo() {
  return <ActionGroup buttons={buttons} />;
}
```

## 上下文感知按钮

传入 `context`（如表格行数据）使按钮配置感知上下文：

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
    label: '编辑',
    onClick: async (ctx) => { await editUser(ctx.id); },
  },
  {
    key: 'activate',
    label: '启用',
    hidden: (ctx) => ctx.status === 'active',
    onClick: async (ctx) => { await activateUser(ctx.id); },
  },
  {
    key: 'deactivate',
    label: '禁用',
    hidden: (ctx) => ctx.status === 'inactive',
    danger: true,
    onClick: async (ctx) => { await deactivateUser(ctx.id); },
  },
];

// 在表格列 render 中：
{
  title: '操作',
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

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `buttons` | `ActionButtonConfig<TContext>[]` | 必填 | 按钮配置数组 |
| `size` | `'large' \| 'middle' \| 'small'` | — | 应用于所有按钮的尺寸 |
| `context` | `TContext` | — | 传递给按钮回调的上下文值 |
| `renderWrapper` | `(buttonsNode: ReactNode) => ReactNode` | — | 自定义包装器渲染函数 |

### ActionButtonConfig

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `key` | `string` | 必填 | 唯一标识 |
| `label` | `ReactNode` | — | 按钮文字 |
| `type` | `ButtonType` | — | 按钮类型 |
| `danger` | `boolean` | `false` | 危险样式 |
| `disabled` | `boolean \| (ctx) => boolean` | `false` | 禁用条件 |
| `hidden` | `boolean \| (ctx) => boolean` | `false` | 隐藏条件 |
| `confirmable` | `boolean` | `false` | 需要确认 |
| `confirmMode` | `'popover' \ | 'dialog'` | `'popover'` | 确认 UI 样式 |
| `confirmTitle` | `ReactNode` | — | 确认标题 |
| `confirmDescription` | `ReactNode` | — | 确认描述 |
| `permTokens` | `string \| string[]` | — | 所需权限令牌 |
| `checkMode` | `'any' \| 'all'` | `'any'` | 权限检查模式 |
| `onClick` | `(ctx?: TContext) => Awaitable<void>` | — | 点击回调 |
| `icon` | `ReactNode` | — | 按钮图标 |

## 最佳实践

- 在组件外部定义按钮配置，避免每次渲染重新创建。
- 对不适用于某条记录的按钮使用 `hidden`（而非 `disabled`）。
- 使用 `permTokens` 自动隐藏用户无权限的按钮。
