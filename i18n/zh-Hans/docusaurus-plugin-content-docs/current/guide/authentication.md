---
title: 认证
description: 登录、令牌刷新和登出是如何通过 createApiClient 和 starter 的路由辅助函数串联起来的。
---

# 认证

VEF 中的认证主要涉及三个部分：

1. `createApiClient()` 管理令牌与刷新逻辑
2. `createLoginRouteOptions()` 定义登录路由
3. `createLayoutRouteOptions()` 保护已认证的应用区域

第三部分——布局路由如何守护页面并加载菜单——在 [路由与布局](./routing.md) 中介绍；本篇聚焦于登录、令牌刷新和登出。

## 接入登录页

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { createLoginRouteOptions, LOGIN_ROUTE_ID } from "@vef-framework-react/starter";

import { apiClient } from "../../api";
import { login } from "../../apis/auth";

export const Route = createFileRoute(LOGIN_ROUTE_ID)(
  createLoginRouteOptions({
    onLogin: params => apiClient.executeMutation({ mutationFn: login, params })
  })
);
```

## 登录成功之后发生了什么

`starter` 内置的 `Login` 组件在 `onLogin` 完成后会执行以下步骤：

1. 把认证状态（`isAuthenticated`、`authTokens`）写入 `useAppStore`
2. 使 router 失效（invalidate）
3. 跳转到 `redirect` 或首页路由
4. 展示一条成功通知

## 令牌刷新

这是 `createApiClient()` 配置中的关键部分之一：

```ts
const apiClient = createApiClient({
  http: {
    baseUrl: "/api",
    tokenExpiredCode: 1002,
    async refreshToken(tokens) {
      return await apiClient.executeMutation({
        mutationFn: refreshAuth,
        params: tokens
      });
    }
  }
});
```

当一次请求因为 `tokenExpiredCode` 失败时，底层的 `HttpClient` 只会刷新一次令牌，并把并发请求排队在这次刷新之后，而不是每个失败的请求各自触发一次刷新。完整的令牌刷新约定见 [HTTP 与 API 客户端](../reference/core/http-and-api.md)。

## 登出

远程登出操作通常被实现为一个变更函数，并通过 `onLogout` 传给布局路由：

```ts
async function handleLogout() {
  await apiClient.executeMutation({
    mutationFn: logout
  });
}
```

客户端侧的登出清理——清空 `useAppStore`、跳转回登录路由、使 router 失效——由 `handleClientLogout()` 和路由事件链统一处理，因此页面代码不需要手动重置认证状态。

## 登录和令牌刷新请求会跳过认证 header

登录和令牌刷新接口通常需要跳过自动认证 header，因为此时还没有有效的令牌：

```ts
import { skipAuthenticationHeader, skipAuthenticationValue } from "@vef-framework-react/core";

headers: {
  [skipAuthenticationHeader]: skipAuthenticationValue
}
```

## 推荐用法

- 登录和令牌刷新使用 `executeMutation()`
- 避免为认证状态单独引入一个 store——`useAppStore` 已经承担了这个职责
- 把路由保护保留在布局层，而不是在每个页面重复实现（见 [路由与布局](./routing.md)）
