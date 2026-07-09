---
title: 错误处理
description: 业务错误、网络错误和路由级兜底如何在请求层、router 和页面代码之间协同工作。
---

# 错误处理

VEF 中的错误处理不是单一的 API，而是一条链路：

1. HTTP 层解读业务码和认证状态
2. API 客户端触发通知或事件
3. router 处理未认证和无权限的重定向
4. 页面代码决定是否需要额外的局部处理

## 关键的请求层配置

```ts
createApiClient({
  http: {
    baseUrl: "/api",
    okCode: 0,
    tokenExpiredCode: 1002,
    timeout: 30_000,
    refreshToken,
  }
});
```

这些字段决定了框架如何判断一次请求是否成功、令牌刷新行为，以及用户是否应该被送回登录页。完整的 `HttpClientOptions` 字段参考见 [HTTP 与 API 客户端](../reference/core/http-and-api.md)。

## 业务错误与网络错误

错误大致可以分为两类理解：

- 业务错误：请求返回了响应，但业务码表示失败
- 网络错误：超时、离线、4xx/5xx，或其他传输层失败

VEF 的 `HttpClient` 会替你处理第一种情况，这消除了大量重复的“if code !== 0 就弹提示”式页面逻辑。

## 未认证与无权限

`starter.createApiClient()` 已经把这两种情况桥接到了 router：

- 未认证状态触发 `onUnauthenticated`
- 无权限状态触发 `onAccessDenied`

`createRouter()` 监听这些事件并执行相应的跳转。

## 登录与令牌刷新

登录和令牌刷新接口通常需要跳过自动认证 header：

```ts
import { skipAuthenticationHeader, skipAuthenticationValue } from "@vef-framework-react/core";

headers: {
  [skipAuthenticationHeader]: skipAuthenticationValue
}
```

## 路由级兜底

`createRouter()` 已经提供了：

- `defaultPendingComponent`
- `defaultErrorComponent`
- `defaultNotFoundComponent`
- `defaultOnCatch`

因此即使某个页面没有提供显式的局部处理，应用依然有一条不会白屏的兜底路径。

## 什么时候页面代码应该自己处理错误

以下场景仍然适合由页面层局部处理：

- 表单字段级别的错误
- 需要保留用户输入的重试流程
- 某个局部失败不应影响整个页面
- 批量操作后需要定制反馈文案

## 推荐用法

- 避免在每次 API 调用后都重复手写提示
- 避免在页面组件内部重新实现登录过期跳转
- 把常见错误交给框架处理，让页面代码专注于业务特有的场景
