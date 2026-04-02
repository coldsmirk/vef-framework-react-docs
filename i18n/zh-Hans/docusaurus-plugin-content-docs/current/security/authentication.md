---
sidebar_position: 1
title: 认证
---

# 认证

VEF 的认证链路主要由三部分组成:

1. `createApiClient()` 维护 token 和刷新逻辑
2. `createLoginRouteOptions()` 承载登录页
3. `createLayoutRouteOptions()` 保护登录后页面

## 登录页怎么接

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

## 登录成功后做了什么

`starter` 内置的 `Login` 组件会在 `onLogin` 成功后:

1. 把登录状态写入 `useAppStore`
2. 写入 token
3. 让 router 失效并重算
4. 跳回 `redirect` 或首页
5. 弹成功通知

## 刷新 token

这是 `createApiClient()` 配置里最关键的一环:

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

## 登出

推荐把真正的远程登出做成 mutation，然后交给布局路由的 `onLogout` 使用:

```ts
async function handleLogout() {
  await apiClient.executeMutation({
    mutationFn: logout
  });
}
```

客户端本地登出收尾由 `handleClientLogout()` 和 router 事件链统一处理。

## 推荐实践

- 登录与刷新 token 一律走 `executeMutation()`
- 认证状态不要自己另起一套 store
- 登录保护交给布局路由，不要每页重复判断
