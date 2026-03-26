---
sidebar_position: 9
title: 错误处理
---

# 错误处理

VEF 的错误处理不是单点 API，而是一整条链路:

1. HTTP 层识别业务码和认证态
2. API 客户端触发消息通知或事件
3. router 层负责未认证或无权限跳转
4. 页面层只关心自己要不要额外兜底

## 请求层最关键的配置

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

这几个字段决定了框架如何理解一条请求是否成功、是否需要刷新 token、是否应该让用户重新登录。

## 业务错误和网络错误

你可以把错误大致分成两类理解:

- 业务错误: 接口返回了响应，但业务码不是成功码
- 网络错误: 超时、断网、4xx/5xx、请求根本没成功

VEF 的 `HttpClient` 会优先帮你处理前者，因此页面层通常不用重复写很多“如果 code !== 0 就 toast”的样板代码。

## 未认证和无权限

`starter.createApiClient()` 已经把这两个场景和 router 打通了:

- 未认证会触发 `onUnauthenticated`
- 无权限会触发 `onAccessDenied`

然后 `createRouter()` 会监听这两个事件并处理跳转。

## 登录页和刷新 token

登录和刷新 token 相关接口通常需要跳过自动鉴权 header:

```ts
import { skipAuthenticationHeader, skipAuthenticationValue } from "@vef-framework/core";

headers: {
  [skipAuthenticationHeader]: skipAuthenticationValue
}
```

## 路由错误兜底

VEF 的 `createRouter()` 已经默认配置了:

- `defaultPendingComponent`
- `defaultErrorComponent`
- `defaultNotFoundComponent`
- `defaultOnCatch`

所以即使页面忘了自己处理某些异常，整体上也不会直接白屏。

## 页面层什么时候自己处理错误

以下场景建议页面自己额外处理:

- 表单字段级错误提示
- 需要保留用户输入的失败重试
- 某个局部区域失败但不影响整页显示
- 批量操作后需要特殊反馈文案

## 推荐做法

- 不要在每个 API 调用后都手工重复 toast。
- 不要在页面里重新实现登录失效跳转。
- 把通用错误交给框架链路，把业务特例留给页面。
