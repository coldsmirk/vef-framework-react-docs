---
title: Core Package Overview
description: What @vef-framework-react/core covers and the suggested reading order across its nine areas.
---

# Core Package Overview

`@vef-framework-react/core` is the runtime foundation of the framework. It does not contain UI components, but provides the infrastructure that all other packages depend on.

It covers nine areas:

1. HTTP client and request lifecycle
2. API client combining HTTP and React Query
3. Chunked, resumable file uploads (Storage / Uploader)
4. React Query integration
5. Server-Sent Events (SSE)
6. State management (Zustand stores and Jotai atoms)
7. State machines (XState)
8. Context providers
9. Re-exports of motion, DnD, and Immer

## Suggested Reading Order

1. [HTTP and API Client](./http-and-api.md)
2. [Storage and Uploads](./storage.md)
3. [Query and Mutation](./query.md)
4. [Store and Atom](./store-and-atom.md)
5. [Context Providers](./context.md)
6. [SSE, Motion, DnD, and Immer](./sse-motion-dnd-immer.md)

## Quick Reference

| Need | Export |
| --- | --- |
| Make HTTP requests | `HttpClient` |
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
| SSE streaming | `SseClient`, `createSseClient` |
| Permission check | `checkPermission` |
| Immer mutation | `produce`, `useImmer` |
