---
sidebar_position: 1
title: Core Package Overview
---

# Core Package Overview

`@vef-framework-react/core` is the runtime foundation of the framework. It does not contain UI components, but provides the infrastructure that all other packages depend on.

It covers eight areas:

1. HTTP client and request lifecycle
2. API client combining HTTP and React Query
3. React Query integration
4. Server-Sent Events (SSE)
5. State management (Zustand stores and Jotai atoms)
6. State machines (XState)
7. Context providers
8. Re-exports of motion, DnD, and Immer

## Suggested Reading Order

1. [HTTP and API Client](./http-and-api.md)
2. [Query and Mutation](./query.md)
3. [Store and Atom](./store-and-atom.md)
4. [Context Providers](./context.md)
5. [SSE, Motion, DnD, and Immer](./sse-motion-dnd-immer.md)

## Quick Reference

| Need | Export |
| --- | --- |
| Make HTTP requests | `HttpClient`, `createHttpClient` |
| Create API client | `createApiClient`, `ApiClient` |
| Query data | `useQuery`, `useInfiniteQuery` |
| Mutate data | `useMutation` |
| Global store | `createStore`, `createPersistedStore` |
| Component-scoped store | `createComponentStore` |
| Atom state | `atom`, `useAtom`, `useAtomValue`, `useSetAtom` |
| State machine | `createMachine`, `useActor` |
| App context | `AppContextProvider`, `useAppContext` |
| API client context | `ApiClientProvider`, `useApiClient` |
| SSE streaming | `SseClient`, `createSseClient` |
| Permission check | `checkPermission` |
| Immer mutation | `produce`, `useImmer` |
