---
title: Core 包概览
description: "@vef-framework-react/core 涵盖的内容，以及其十个领域的建议阅读顺序。"
---

# Core 包概览

`@vef-framework-react/core` 是框架的运行时基础。它不包含 UI 组件，但提供了所有其他包所依赖的基础设施。

它涵盖十个领域：

1. HTTP 客户端与请求生命周期
2. 结合 HTTP 与 React Query 的 API 客户端
3. 分片、可断点续传的文件上传（Storage / Uploader）
4. React Query 集成
5. 服务端推送通道（WebSocket）
6. Server-Sent Events（SSE）
7. 状态管理（Zustand store 与 Jotai atom）
8. 状态机（XState）
9. Context Provider
10. motion、DnD 与 Immer 的重导出

所有这些领域都从包根导出，包括 `state`（Jotai）与 `state-machine`（XState）模块——两者都是公共 API，收录在 [Store 与 Atom](./store-and-atom.md) 页面中。

## 建议阅读顺序

1. [HTTP 与 API 客户端](./http-and-api.md)
2. [存储与文件上传](./storage.md)
3. [查询与变更](./query.md)
4. [Store 与 Atom](./store-and-atom.md)——Zustand store、Jotai atom、XState 状态机
5. [Context Provider](./context.md)
6. [服务端推送](./push.md)
7. [SSE、Motion、DnD 与 Immer](./sse-motion-dnd-immer.md)

## 快速参考

| 需求 | 导出 |
| --- | --- |
| 发起 HTTP 请求 | `HttpClient` |
| 获取/下载带鉴权的文件 | `HttpClient.requestFile`、`HttpClient.download` |
| 分片/断点续传上传 | `Uploader`、`uploadFile` |
| 创建 API 客户端 | `createApiClient`、`ApiClient` |
| 查询数据 | `useQuery`、`useInfiniteQuery` |
| 变更数据 | `useMutation` |
| 全局 store | `createStore`、`createPersistedStore` |
| 组件级 store | `createComponentStore` |
| Atom 状态 | `atom`、`useAtom`、`useAtomValue`、`useSetAtom` |
| 状态机 | `createMachine`、`useActor` |
| 应用上下文 | `AppContextProvider`、`useAppContext` |
| API 客户端上下文 | `ApiClientProvider`、`useApiClient` |
| 服务端推送消息 | `PushClient`、`createPushClient` |
| SSE 流式传输 | `SseClient`、`createSseClient` |
| 权限检查 | `checkPermission` |
| Immer 不可变更新 | `produce`、`useImmer` |
