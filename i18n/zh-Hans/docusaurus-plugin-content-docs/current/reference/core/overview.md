---
sidebar_position: 1
title: Core 包概览
---

# Core 包概览

`@vef-framework-react/core` 是框架的运行时基础包，不包含 UI 组件，但提供了所有其他包所依赖的基础设施。

它涵盖八个领域：

1. HTTP 客户端与请求生命周期
2. 结合 HTTP 和 React Query 的 API 客户端
3. React Query 集成
4. Server-Sent Events（SSE）
5. 状态管理（Zustand store 和 Jotai atom）
6. 状态机（XState）
7. Context Provider
8. motion、DnD 和 Immer 的重导出

## 建议阅读顺序

1. [HTTP 与 API 客户端](./http-and-api.md)
2. [查询与变更](./query.md)
3. [Store 与 Atom](./store-and-atom.md)
4. [Context Provider](./context.md)
5. [SSE、Motion、DnD 与 Immer](./sse-motion-dnd-immer.md)

## 快速参考

| 需求 | 导出 |
| --- | --- |
| 发起 HTTP 请求 | `HttpClient`、`createHttpClient` |
| 创建 API 客户端 | `createApiClient`、`ApiClient` |
| 查询数据 | `useQuery`、`useInfiniteQuery` |
| 变更数据 | `useMutation` |
| 全局 store | `createStore`、`createPersistedStore` |
| 组件级 store | `createComponentStore` |
| Atom 状态 | `atom`、`useAtom`、`useAtomValue`、`useSetAtom` |
| 状态机 | `createMachine`、`useActor` |
| 应用上下文 | `AppContextProvider`、`useAppContext` |
| API 客户端上下文 | `ApiClientProvider`、`useApiClient` |
| SSE 流式传输 | `SseClient`、`createSseClient` |
| 权限检查 | `checkPermission` |
| Immer 不可变更新 | `produce`、`useImmer` |
