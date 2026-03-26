---
sidebar_position: 1
title: Configuration Quick Reference
---

# Configuration Quick Reference

## `createApp(options?)`

| Option | Description |
| --- | --- |
| `strictMode` | Wraps the application with `StrictMode` |
| `useRouterContext` | Merges an additional router-context hook |

## `createApp().render(props)`

| Prop | Description |
| --- | --- |
| `apiClient` | Global API client |
| `router` | Router instance |
| `appContext` | App-level context such as permissions, dictionaries, and file base URL |
| `appVersionNotification` | Version-notification configuration |

## `createApiClient(options)`

| Field | Description |
| --- | --- |
| `http.baseUrl` | API base URL |
| `http.timeout` | Request timeout |
| `http.okCode` | Successful business code |
| `http.tokenExpiredCode` | Token-expired business code |
| `http.refreshToken` | Refresh-token function |
| `query.staleTime` | Query stale time |
| `query.gcTime` | Query garbage-collection time |

## `createRouter(options)`

| Field | Description |
| --- | --- |
| `history` | `hash` or `browser` |
| `routeTree` | TanStack Router route tree |
| `context` | `RouterContext` |

## Route Helpers

| API | Purpose |
| --- | --- |
| `createRootRouteOptions` | Root route title and document-title handling |
| `createLayoutRouteOptions` | Authentication, menu loading, and guard behavior |
| `createLoginRouteOptions` | Login page route helper |
| `createAccessDeniedRouteOptions` | Access-denied route helper |

## `defineViteConfig(options)`

| Field | Description |
| --- | --- |
| `resolve` | Aliases and export conditions |
| `plugins` | Additional Vite plugins |
| `autoEnhancePlugins` | Auto-enhancement plugins |
| `routerHistory` | Router history type |
| `react` | React plugin configuration |
| `proxies` | Development proxy configuration |
