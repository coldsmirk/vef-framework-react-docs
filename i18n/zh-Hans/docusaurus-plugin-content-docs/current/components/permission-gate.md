---
sidebar_position: 16
---

# PermissionGate 权限门控

根据当前用户权限条件渲染内容。

> **VEF 特有组件**，不属于 Ant Design。

## 何时使用

- 根据权限令牌显示或隐藏 UI 元素。
- 为有权限和无权限的用户渲染不同内容。

## 基础用法

```tsx
import { PermissionGate } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <PermissionGate permTokens="user:create">
      <Button type="primary">新建用户</Button>
    </PermissionGate>
  );
}
```

如果用户没有 `user:create` 权限，则不渲染任何内容。

## 多权限（任意一个）

```tsx
<PermissionGate permTokens={['user:edit', 'user:admin']} checkMode="any">
  <Button>编辑</Button>
</PermissionGate>
```

用户拥有列表中**任意一个**权限时渲染。

## 多权限（全部满足）

```tsx
<PermissionGate permTokens={['report:view', 'report:export']} checkMode="all">
  <Button>导出报表</Button>
</PermissionGate>
```

用户拥有列表中**所有**权限时才渲染。

## 渲染 Prop 模式

```tsx
<PermissionGate permTokens="admin:access">
  {(hasPermission) => (
    <Button disabled={!hasPermission}>
      管理后台
    </Button>
  )}
</PermissionGate>
```

使用渲染 Prop 可以在无权限时禁用（而非隐藏）元素。

## API

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `permTokens` | `string \| string[]` | — | 要检查的权限令牌 |
| `checkMode` | `'any' \| 'all'` | `'any'` | 多个令牌的检查方式 |
| `children` | `ReactNode \| (hasPermission: boolean) => ReactNode` | — | 要渲染的内容 |

## 权限解析原理

`PermissionGate` 从 VEF 核心权限 Store（通过 `@vef-framework-react/core` 配置）读取当前用户的权限列表。权限令牌是由应用自定义的任意字符串。

## 最佳实践

- 使用 `PermissionGate` 隐藏整个 UI 区块，而不仅仅是单个按钮。
- 需要异步 loading 和确认对话框的按钮，使用 `OperationButton`（`ActionButton` + `PermissionGate` 的组合）。
- 保持权限令牌命名在前后端一致（推荐 `资源:操作` 格式，如 `user:create`）。
