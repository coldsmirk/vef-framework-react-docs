---
title: 权限
description: 路由守卫、PermissionGate 和命令式权限检查 hook 共享的权限模型。
---

# 权限

VEF 中的授权建立在一个简单的约定之上：应用提供 `appContext.hasPermission()`，页面、路由和组件都通过一小组共享的基础能力来消费这个判断结果。页面级访问和按钮级访问被有意分开处理——本篇涵盖这个模型的两个方面。

## 提供权限判断函数

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

框架中的每一次权限检查——路由守卫、`PermissionGate`，以及下面这些 hook——最终都会调用这个函数。

## `checkMode`

任何地方，只要一次检查接受不止一个权限令牌，它也会接受一个 `checkMode`：

- `"any"`（默认）：至少一个令牌匹配
- `"all"`：所有令牌都必须匹配

## 页面级访问：路由守卫

VEF 不鼓励在每个页面手写 `beforeLoad` 权限逻辑。守卫职责被集中在 `createLayoutRouteOptions()`（见 [路由与布局](./routing.md)）中，它会：

1. 把未认证用户重定向到登录页
2. 拉取用户信息和菜单树
3. 构建菜单路径映射
4. 检查当前路径是否属于已授权的菜单集合
5. 把无权限的路径重定向到 `/access-denied`

在后台应用中，路由访问通常由当前用户信息、菜单树、权限令牌和认证状态共同决定。把这些检查分散到各个页面文件中，往往会让后续的维护变得更困难——把认证和菜单守卫留在布局路由里，让业务页面专注于页面自身的行为。

## 按钮和区块级访问：`PermissionGate`

```tsx
import { PermissionGate } from "@vef-framework-react/components";

<PermissionGate requiredPermissions="sys:user:create">
  <Button type="primary">Create User</Button>
</PermissionGate>
```

当渲染结果（而不是隐藏与否）需要依赖权限判断结果时，`PermissionGate` 也支持函数式子节点：

```tsx
<PermissionGate requiredPermissions="sys:user:create">
  {hasPermission => <Button disabled={!hasPermission}>Create User</Button>}
</PermissionGate>
```

避免混用这两个层级：页面级访问属于路由守卫，按钮级访问属于 `PermissionGate`。

## 命令式权限检查

### `useCheckPermission`

返回一个可复用的函数，用于事件处理函数或派生逻辑内部的检查：

```tsx
const checkPermission = useCheckPermission();

if (checkPermission("sys:user:create")) {
  // ...
}
```

### `useIsAuthorized`

在渲染期间直接判断一个权限条件：

```tsx
const canEdit = useIsAuthorized(["sys:user:update", "sys:user:write"], "any");
```

## 过滤配置数组：`useAuthorizedItems`

菜单、按钮配置和操作列表往往是先声明，再过滤。`useAuthorizedItems()` 用于过滤一个数组，数组中每一项都带有 `requiredPermissions`（以及可选的 `checkMode`）：

```tsx
const visibleActions = useAuthorizedItems([
  { key: "create", requiredPermissions: "sys:user:create" },
  { key: "delete", requiredPermissions: "sys:user:delete" }
]);
```

## 引擎页面自带权限码

引擎页面（engine pages）各包以导出集合的形式附带了它们的后端权限码，与后端的 `RequiredPermission` 字符串逐字对应：

- `APPROVAL_PERMISSIONS`，来自 `@vef-framework-react/approval`
- `INTEGRATION_PERMISSIONS`，来自 `@vef-framework-react/integration`
- `CRON_PERMISSIONS`，来自 `@vef-framework-react/cron`

每个集合都按资源嵌套（`APPROVAL_PERMISSIONS.flow.publish` 即 `"approval.flow.publish"`，`CRON_PERMISSIONS.schedule.manage` 即 `"cron.schedule.manage"`，以此类推）。每个引擎管理页的权限门控都默认取用对应的条目，并可以通过其 `permissions` 属性覆盖——因此把引擎权限映射到自有令牌方案的宿主，只需按页面覆盖，而不必分叉页面。请在后端配好这些权限码；当宿主 UI 围绕引擎页面做组合时，在 `PermissionGate` / `useAuthorizedItems` 中复用同样的常量，而不是重复书写字符串。引擎包本身见 [引擎总览](../engines/overview.md)。

## 推荐用法

- 让页面代码消费权限，而不是再维护第二套权限来源
- 对细粒度的按钮或区块级门控使用 `PermissionGate`
- 对配置数组过滤使用 `useAuthorizedItems()`
- 把认证和菜单守卫留在布局路由中，而不是散落在各个页面
