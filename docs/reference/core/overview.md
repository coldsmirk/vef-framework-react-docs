---
title: Core Package Overview
description: What @vef-framework-react/core covers and the suggested reading order across its ten areas.
---

# Core Package Overview

`@vef-framework-react/core` is the runtime foundation of the framework. It does not contain UI components, but provides the infrastructure that all other packages depend on.

It covers ten areas:

1. HTTP client and request lifecycle
2. API client combining HTTP and React Query
3. Chunked, resumable file uploads (Storage / Uploader)
4. React Query integration
5. Server push channel (WebSocket)
6. Server-Sent Events (SSE)
7. State management (Zustand stores and Jotai atoms)
8. State machines (XState)
9. Context providers
10. Re-exports of motion, DnD, and Immer

All of these areas are exported from the package root, including the `state` (Jotai) and `state-machine` (XState) modules — both are public API, documented on the [Store and Atom](./store-and-atom.md) page.

## Suggested Reading Order

1. [HTTP and API Client](./http-and-api.md)
2. [Storage and Uploads](./storage.md)
3. [Query and Mutation](./query.md)
4. [Store and Atom](./store-and-atom.md) — Zustand stores, Jotai atoms, XState machines
5. [Context Providers](./context.md)
6. [Server Push](./push.md)
7. [SSE, Motion, DnD, and Immer](./sse-motion-dnd-immer.md)

## Quick Reference

| Need | Export |
| --- | --- |
| Make HTTP requests | `HttpClient` |
| Fetch/download authenticated files | `HttpClient.requestFile`, `HttpClient.download` |
| Chunked/resumable file upload | `Uploader`, `uploadFile` |
| Create API client | `createApiClient`, `ApiClient` |
| Query data | `useQuery`, `useInfiniteQuery` |
| Mutate data | `useMutation` |
| Global store | `createStore`, `createPersistedStore` |
| Component-scoped store | `createComponentStore` |
| Atom state | `atom`, `useAtom`, `useAtomValue`, `useSetAtom` |
| State machine | `createMachine`, `useActor` |
| App context | `AppContextProvider`, `useAppContext` |
| API client context | `ApiClientProvider`, `useApiClient` |
| Server push messages | `PushClient`, `createPushClient` |
| SSE streaming | `SseClient`, `createSseClient` |
| Permission check | `checkPermission` |
| Immer mutation | `produce`, `useImmer` |
