---
title: 配置速查
description: createApp、createApiClient、createRouter、路由选项辅助函数以及 defineViteConfig 的简明选项表。
---

# 配置速查

## `createApp(options?)`

| Option | Description |
| --- | --- |
| `strictMode` | 用 `StrictMode` 包裹应用 |
| `useRouterContext` | 合并额外的路由上下文 hook |

## `createApp().render(props)`

| Prop | Description |
| --- | --- |
| `apiClient` | 全局 API 客户端 |
| `router` | 路由实例 |
| `appContext` | 应用级上下文,例如权限、数据字典和文件基础 URL |
| `appVersionNotification` | 版本通知配置 |

## `createApiClient(options)`

| Field | Description |
| --- | --- |
| `http.baseUrl` | API 基础 URL |
| `http.timeout` | 请求超时时间 |
| `http.okCode` | 成功业务码 |
| `http.tokenExpiredCode` | Token 过期业务码 |
| `http.refreshToken` | 刷新 Token 函数 |
| `query.staleTime` | 查询过期时间 |
| `query.gcTime` | 查询垃圾回收时间 |

## `createRouter(options)`

| Field | Description |
| --- | --- |
| `history` | `hash` 或 `browser` |
| `routeTree` | TanStack Router 路由树 |
| `context` | `RouterContext` |

## 路由辅助函数

| API | Purpose |
| --- | --- |
| `createRootRouteOptions` | 根路由标题及文档标题处理 |
| `createLayoutRouteOptions` | 认证、菜单加载及守卫行为 |
| `createLoginRouteOptions` | 登录页路由辅助函数 |
| `createAccessDeniedRouteOptions` | 拒绝访问路由辅助函数 |

## `defineViteConfig(options)`

| Field | Description |
| --- | --- |
| `resolve` | 别名和导出条件 |
| `plugins` | 额外的 Vite 插件 |
| `autoEnhancePlugins` | 自动增强插件 |
| `routerHistory` | 路由历史类型 |
| `react` | React 插件配置 |
| `proxies` | 开发环境代理配置 |
