---
title: "PermissionGate"
description: "根据当前用户的权限有条件地渲染内容。"
---

# PermissionGate

根据当前用户的权限有条件地渲染内容。

> **VEF 专属组件。** 不属于 Ant Design 的一部分。

## 何时使用

- 根据权限令牌显示或隐藏 UI 元素。
- 为拥有和不拥有特定权限的用户渲染不同内容。

## 基础用法

```tsx
import { PermissionGate } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <PermissionGate requiredPermissions="user:create">
      <Button type="primary">Create User</Button>
    </PermissionGate>
  );
}
```

如果用户没有 `user:create` 权限，则不会渲染任何内容。

## 多个权限（任一满足）

```tsx
<PermissionGate requiredPermissions={['user:edit', 'user:admin']} checkMode="any">
  <Button>Edit</Button>
</PermissionGate>
```

只要用户拥有列出权限中的**任意一个**，即会渲染。

## 多个权限（全部满足）

```tsx
<PermissionGate requiredPermissions={['report:view', 'report:export']} checkMode="all">
  <Button>Export Report</Button>
</PermissionGate>
```

只有当用户拥有**全部**列出的权限时才会渲染。

## 渲染属性模式

```tsx
<PermissionGate requiredPermissions="admin:access">
  {(hasPermission) => (
    <Button disabled={!hasPermission}>
      Admin Panel
    </Button>
  )}
</PermissionGate>
```

使用渲染属性可以有条件地禁用（而非隐藏）元素。

## API

| Prop | Type | Default | 说明 |
|------|------|---------|-------------|
| `requiredPermissions` | `string \| string[]` | — | 待校验的权限令牌 |
| `checkMode` | `'any' \| 'all'` | `'any'` | 多个令牌的校验方式 |
| `children` | `ReactNode \| (hasPermission: boolean) => ReactNode` | — | 待渲染的内容 |

## 权限解析方式

`PermissionGate` 从 VEF core 的权限存储（通过 `@vef-framework-react/core` 配置）中读取当前用户的权限列表。权限令牌是由你的应用自行定义的任意字符串。

## 最佳实践

- 使用 `PermissionGate` 隐藏整个 UI 区块，而不仅仅是单个按钮。
- 对于同时需要异步加载和确认对话框的按钮，使用 `OperationButton`（它结合了 `ActionButton` 和 `PermissionGate`）。
- 保持前后端的权限令牌命名一致（例如采用 `resource:action` 格式）。
