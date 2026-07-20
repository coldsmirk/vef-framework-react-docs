---
title: 认证
description: 登录、两种会话风格（JWT 刷新与不透明令牌）、登录挑战和登出是如何通过 createApiClient 和 starter 的路由辅助函数串联起来的。
---

# 认证

VEF 中的认证主要涉及三个部分：

1. `createApiClient()` 管理令牌与 401 行为
2. `createLoginRouteOptions()` 定义登录路由（包括多步登录挑战）
3. `createLayoutRouteOptions()` 保护已认证的应用区域

第三部分——布局路由如何守护页面并加载菜单——在 [路由与布局](./routing.md) 中介绍；本篇聚焦于登录、会话和登出。

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

`onLogin` 解析为一个 `LoginResult`。当它携带 `tokens` 时，内置的 `Login` 组件完成整个流程：

1. 把认证状态（`isAuthenticated`、`authTokens`）写入 `useAppStore`
2. 使 router 失效（invalidate）
3. 跳转到 `redirect` 搜索参数指向的位置（默认为首页路由）
4. 展示一条成功通知

当结果携带的是 `challenge` 时，流程会暂停——见下文的 [登录挑战](#登录挑战)。

## 两种会话风格

`AuthTokens`——存储在 `useAppStore` 中、由 HTTP 层消费的形态——是 `{ accessToken: string; refreshToken?: string }`。`refreshToken` 之所以是可选的，是刻意为之：VEF 后端以两种风格之一签发会话，客户端的接线方式也随之不同。

:::warning[v2.10.0 中的破坏性变更]

`AuthTokens.refreshToken` 从必填改为可选。如果你的代码直接读取 `tokens.refreshToken`（自定义刷新调用、令牌持久化），现在必须处理 `undefined`。

:::

### JWT 会话（访问令牌 + 刷新令牌）

后端同时返回两个令牌；访问令牌按计时过期，并通过一次刷新往返来续期。请在客户端上同时配置 `tokenExpiredCode` 和 `refreshToken`：

```ts
const apiClient = createApiClient({
  http: {
    baseUrl: "/api",
    tokenExpiredCode: 1002,
    async refreshToken(tokens) {
      // tokens are the current AuthTokens; return the new pair.
      return await apiClient.executeMutation({
        mutationFn: refreshAuth,
        params: tokens
      });
    }
  }
});
```

**HTTP 客户端在 401 时做什么：**当响应的业务码与 `tokenExpiredCode` 匹配时，它只运行*一次*共享刷新——并发请求会排队在这一次刷新之后，而不是各自触发一次——然后用新的访问令牌重试原始请求。如果刷新本身失败（或者 401 恰好发生在正在失败的那次刷新期间），客户端就会放弃，展示"登录已过期"反馈，并触发 `onUnauthenticated`，starter 会把它桥接到路由器的返回登录页跳转。

### 不透明令牌会话（仅访问令牌）

后端只返回一个 `accessToken`——它是指向服务端会话状态的不透明句柄（opaque token，不透明令牌），采用滑动过期。客户端没有任何东西可刷新，因此**不要**配置 `refreshToken`（也不要配置 `tokenExpiredCode`）：

```ts
const apiClient = createApiClient({
  http: {
    baseUrl: "/api"
    // no tokenExpiredCode, no refreshToken — the server slides the session
  }
});
```

**HTTP 客户端在 401 时做什么：**由于没有可匹配的 `tokenExpiredCode`（也没有配置刷新），任何 401 都会直达 `onUnauthenticated`——用户被送回登录页。对这种风格来说这正是正确行为：401 意味着服务端会话已经消失，客户端没有任何操作能把它救回来。

其余一切——从 `getAuthTokens` 注入 Bearer 请求头、推送通道的令牌查询参数、登出清理——在两种风格下的工作方式完全一致。完整的令牌刷新约定见 [HTTP 与 API 客户端](../reference/core/http-and-api.md)。

## 登录挑战

有些后端无法一步完成登录：它们会返回一个用户必须先完成的*挑战*（challenge，登录挑战）——强制修改密码、TOTP、选择部门。starter 的 `Login` 组件为此内置了一条流水线。

### 流水线

`LoginResult` 就是协议。每次 `onLogin` / `onResolveChallenge` 调用要么返回令牌（完成），要么返回下一个挑战：

```ts
interface LoginResult {
  message?: string;
  tokens?: AuthTokens;          // set when authentication completed
  challengeToken?: string;      // set with `challenge`: carries intermediate state
  challenge?: LoginChallenge;   // the pending challenge ({ type, data, required })
}
```

当结果携带挑战时，`Login` 组件会在 `challengeRenderers` 中查找为 `challenge.type` 注册的渲染器，并用它替换掉凭据表单。渲染器会收到：

- `challenge` —— 类型标识与用于展示的挑战特定 `data`
- `resolve(response)` —— 提交用户的应答；组件会调用你的 `onResolveChallenge({ challengeToken, type, response })` 并应用返回的 `LoginResult`（下一个挑战，或令牌与跳转）
- `cancel()` —— 放弃挑战并返回凭据表单（挑战令牌被丢弃；用户重新登录）
- `pending` —— 是否有一次 `resolve` 调用正在进行（用于禁用提交按钮）
- `error` —— 最近一次失败的 `resolve` 返回的消息（例如密码被拒绝）；下次尝试和取消时会清空
- `encrypt(plaintext)` —— 仅当登录页收到了 `publicKey` 时存在；用与凭据相同的 RSA 方案加密敏感应答

如果到达的挑战类型没有注册渲染器，组件会展示内置的"不支持的挑战"警告和返回登录按钮——它绝不会渲染出一个坏掉的界面。

### 接入挑战

`onResolveChallenge` 与 `challengeRenderers` 必须成对提供（能签发挑战的服务器同时需要传输与呈现两部分）：

```tsx
import type { LoginChallengeRenderers, ResolveChallengeParams } from "@vef-framework-react/starter";

import {
  createLoginRouteOptions,
  PASSWORD_CHANGE_CHALLENGE_TYPE,
  PasswordChangeChallenge
} from "@vef-framework-react/starter";

const challengeRenderers: LoginChallengeRenderers = {
  [PASSWORD_CHANGE_CHALLENGE_TYPE]: PasswordChangeChallenge
};

export const Route = createFileRoute(LOGIN_ROUTE_ID)(
  createLoginRouteOptions({
    publicKey: RSA_PUBLIC_KEY,
    onLogin: params => apiClient.executeMutation({ mutationFn: login, params }),
    onResolveChallenge: (params: ResolveChallengeParams) =>
      apiClient.executeMutation({ mutationFn: resolveChallenge, params }),
    challengeRenderers
  })
);
```

### 内置的 `password_change` 渲染器

starter 开箱提供一个渲染器：`PasswordChangeChallenge`，对应后端的强制修改密码挑战（类型 `"password_change"`，以 `PASSWORD_CHANGE_CHALLENGE_TYPE` 导出）。它收集并确认新密码，在配置了 `publicKey` 时通过 `encrypt` 加密，把 resolve 失败（例如违反密码策略）内联展示出来，并根据服务器提供的原因（`first_login`、`expired` 或宿主自定义字符串）调整副标题。

### 为挑战注册表提供类型

在 starter 包中扩充 `Register['challenges']`，可以让渲染器注册表变得完备（每个声明的挑战类型都必须有渲染器），并收窄每个渲染器的 `challenge.data` / `resolve` 载荷。内置渲染器附带了配套的 spec 类型：

```ts
import type { PASSWORD_CHANGE_CHALLENGE_TYPE, PasswordChangeChallengeSpec } from "@vef-framework-react/starter";

declare module "@vef-framework-react/starter" {
  interface Register {
    challenges: {
      [PASSWORD_CHANGE_CHALLENGE_TYPE]: PasswordChangeChallengeSpec;
      // Custom challenge types follow the same { data; response } spec shape:
      totp: { response: string };
    };
  }
}
```

为自定义类型编写渲染器就是写一个消费上述 props 的普通组件——框架不强加任何外观，因此它可以自由匹配登录页的样式。完整的 prop 形态（`LoginProps`、`LoginChallengeRendererProps`、`LoginChallengeRenderers`）见 [应用外壳](../reference/starter/application-shell.md)。

## 登出

远程登出操作通常被实现为一个变更函数，并通过 `onLogout` 传给布局路由：

```ts
async function handleLogout() {
  await apiClient.executeMutation({
    mutationFn: logout
  });
}
```

客户端侧的登出清理——清空 `useAppStore`、跳转回登录路由、使 router 失效——由 `handleClientLogout()` 和路由事件链统一处理，因此页面代码不需要手动重置认证状态。如果应用使用了 [服务端推送通道](./server-push.md)，登出时也要对推送客户端调用 `close()`。

## 登录和令牌刷新请求会跳过认证 header

登录和令牌刷新接口通常需要跳过自动认证 header，因为此时还没有有效的令牌：

```ts
import { skipAuthenticationHeader, skipAuthenticationValue } from "@vef-framework-react/core";

headers: {
  [skipAuthenticationHeader]: skipAuthenticationValue
}
```

## 推荐用法

- 登录、挑战应答和令牌刷新使用 `executeMutation()`
- 让客户端配置与后端的会话风格匹配——对不透明令牌后端配置 `refreshToken` 只是推迟了那次不可避免的重新登录
- 避免为认证状态单独引入一个 store——`useAppStore` 已经承担了这个职责
- 把路由保护保留在布局层，而不是在每个页面重复实现（见 [路由与布局](./routing.md)）
