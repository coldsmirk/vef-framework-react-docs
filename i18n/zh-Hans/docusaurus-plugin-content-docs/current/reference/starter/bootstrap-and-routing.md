---
sidebar_position: 2
title: 应用启动与路由
---

# 应用启动与路由

## `createApp`

创建应用实例，并负责把 `App` 渲染到 `#root`。

推荐场景:

- 应用唯一入口 `main.ts`
- 在测试或独立挂载时手工控制渲染和卸载

参数:

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `strictMode` | `boolean` | 是否包裹 `StrictMode` |
| `useRouterContext` | `UseRouterContext` | 额外路由上下文 hook |

实例方法:

| 方法 | 说明 |
| --- | --- |
| `render(props)` | 渲染应用 |
| `unmount()` | 卸载应用 |

## `createApiClient`

在 `core.createApiClient()` 之上接入了 token 存储、未认证处理、权限不足处理和全局消息提示。

关键配置:

| 字段 | 说明 |
| --- | --- |
| `http.baseUrl` | API 根地址 |
| `http.timeout` | 超时时间 |
| `http.okCode` | 成功业务码 |
| `http.tokenExpiredCode` | token 过期业务码 |
| `http.refreshToken` | 刷新 token 函数 |
| `query.staleTime` | query 新鲜时间 |
| `query.gcTime` | query 缓存回收时间 |

## `createRouter`

创建 VEF 约定好的 TanStack Router 实例。

参数:

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `history` | `"hash" \| "browser"` | 历史模式 |
| `routeTree` | `AnyRouteWithContext<RouterContext>` | 路由树 |
| `context` | `RouterContext` | 路由上下文 |

默认内建能力:

- pending / error / not-found 组件
- 进度条事件
- 标签页同步
- 未认证和无权限事件响应

## `createRootRouteOptions`

根路由辅助，主要负责文档标题策略。

参数:

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `appTitle` | `string` | 应用标题前缀 |

## `createLayoutRouteOptions`

后台布局页的核心辅助函数。

推荐场景:

- 所有需要登录后访问的业务页
- 统一加载用户信息与菜单
- 页面守卫

关键参数:

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `fetchUserInfo` | `() => Awaitable<UserInfo>` | 拉取用户信息 |
| `title` | `string` | 布局标题 |
| `onLogout` | `() => Awaitable<void>` | 退出登录 |

## `createLoginRouteOptions`

登录页辅助。负责:

- 校验 `redirect`
- 登录后跳回原页
- 已登录时避免重复进入登录页

## `createAccessDeniedRouteOptions`

无权限页辅助。负责无权限页初始导航策略。

## 事件 helper

| 导出 | 用途 |
| --- | --- |
| `dispatchCustomEvent` | 派发自定义事件 |
| `eventEmitter` | 全局事件总线 |
| `reloadPage` | 统一刷新页面 |
| `handleClientLogout` | 本地登出收尾 |

## 路由常量

| 常量 | 说明 |
| --- | --- |
| `LOGIN_ROUTE_PATH` / `LOGIN_ROUTE_ID` | 登录路由 |
| `INDEX_ROUTE_PATH` / `INDEX_ROUTE_ID` | 首页路由 |
| `ACCESS_DENIED_ROUTE_PATH` / `ACCESS_DENIED_ROUTE_ID` | 无权限路由 |
