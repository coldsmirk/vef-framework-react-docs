---
sidebar_position: 1
title: 配置速查
---

# 配置速查

## `createApp(options?)`

| 参数 | 说明 |
| --- | --- |
| `strictMode` | 是否包裹 `StrictMode` |
| `useRouterContext` | 合并额外路由上下文的 hook |

## `createApp().render(props)`

| 参数 | 说明 |
| --- | --- |
| `apiClient` | 全局 API 客户端 |
| `router` | Router 实例 |
| `appContext` | 权限、数据字典、文件地址等上下文 |
| `appVersionNotification` | 版本提醒配置 |

## `createApiClient(options)`

| 字段 | 说明 |
| --- | --- |
| `http.baseUrl` | API 根地址 |
| `http.timeout` | 超时时间 |
| `http.okCode` | 成功业务码 |
| `http.tokenExpiredCode` | token 过期业务码 |
| `http.refreshToken` | 刷新 token 函数 |
| `query.staleTime` | query 新鲜时间 |
| `query.gcTime` | query 回收时间 |

## `createRouter(options)`

| 字段 | 说明 |
| --- | --- |
| `history` | `hash` 或 `browser` |
| `routeTree` | TanStack Router 生成的路由树 |
| `context` | `RouterContext` |

## 路由辅助

| API | 用途 |
| --- | --- |
| `createRootRouteOptions` | 根路由标题与文档标题 |
| `createLayoutRouteOptions` | 登录态、菜单、权限守卫 |
| `createLoginRouteOptions` | 登录页 |
| `createAccessDeniedRouteOptions` | 无权限页 |

## `defineViteConfig(options)`

| 字段 | 说明 |
| --- | --- |
| `resolve` | alias 与 conditions |
| `plugins` | 额外 Vite 插件 |
| `autoEnhancePlugins` | 自动增强插件 |
| `routerHistory` | 路由 history 类型 |
| `react` | React 插件配置 |
| `proxies` | 开发代理 |
