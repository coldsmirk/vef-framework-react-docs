---
sidebar_position: 2
title: 授权
---

# 授权

VEF 的授权能力建立在一个简单约定上: 应用通过 `appContext.hasPermission()` 提供权限判断函数，页面与组件只消费它。

## 应用入口怎么提供权限函数

```ts
createApp().render({
  appContext: {
    hasPermission(token) {
      return currentPermTokenSet.has(token);
    }
  },
  ...
});
```

## 直接判断权限

### `useCheckPermission`

```tsx
const checkPermission = useCheckPermission();

if (checkPermission("sys:user:create")) {
  // ...
}
```

### `useIsAuthorized`

```tsx
const canEdit = useIsAuthorized(["sys:user:update", "sys:user:write"], "any");
```

## 组件级权限控制

```tsx
import { PermissionGate } from "@vef-framework/components";

<PermissionGate permTokens="sys:user:create">
  <Button type="primary">新增用户</Button>
</PermissionGate>
```

## 配置项过滤

当你先声明一组菜单、按钮或操作项，再按权限筛选时，最适合用 `useAuthorizedItems()`:

```tsx
const actions = useAuthorizedItems([
  { key: "create", permTokens: "sys:user:create" },
  { key: "delete", permTokens: "sys:user:delete" }
]);
```

## `checkMode`

权限判断支持:

- `any`: 命中一个即可
- `all`: 必须全部满足

这在组合权限时很有用。

## 推荐实践

- 页面层只消费权限，不自行维护权限来源
- 细粒度按钮权限优先用 `PermissionGate`
- 配置数组过滤优先用 `useAuthorizedItems()`
