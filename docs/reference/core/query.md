---
title: Query and Mutation
description: The VEF-flavored TanStack Query re-exports, QueryClientOptions, and mutation meta extensions.
---

# Query and Mutation

`@vef-framework-react/core` re-exports TanStack React Query with VEF-specific type wrappers and a pre-configured `QueryClient`.

## `QueryClientOptions`

`QueryClient` is not constructed directly — `createQueryClient` is an internal factory, not exported from the package root. Applications configure these options as `ApiClientOptions.query` and pass them to `createApiClient` (see [HTTP and API Client](./http-and-api.md)):

```ts
const queryOptions = {
  staleTime: 5_000,
  gcTime: 300_000,
  showSuccessMessage: message => notification.success(message)
};
```

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `staleTime` | `number` | `5000` | Time before data is considered stale (ms) |
| `gcTime` | `number` | `300000` | Time before inactive queries are garbage collected (ms) |
| `showSuccessMessage` | `(message: string) => void` | — | Callback to display mutation success messages (see the mutation cache behavior below) |

### Pre-Configured Defaults

The internal factory configures the `QueryClient` with these defaults (per-query/mutation options can still override them):

- **Queries**: `networkMode: "online"`, `retry: false`, `structuralSharing: true`, `throwOnError: false`, `refetchOnMount` / `refetchOnReconnect` / `refetchOnWindowFocus`: `true`, `retryOnMount: true`, `queryKeyHashFn: hashKey` (the `shared` stable hasher, so structurally-equal keys hash identically regardless of key order), and `experimental_prefetchInRender: true`.
- **Mutations**: `networkMode: "online"`, `retry: false`, `throwOnError: false`, and the same `gcTime`.
- **Mutation cache `onSuccess`**: when the finished mutation's `meta.invalidates` is set, every active-or-inactive query matching one of those keys (TanStack `matchQuery` semantics; already-stale queries are not re-invalidated) is invalidated. When `meta.shouldShowSuccessFeedback` is not `false` and the mutation result is a plain object with a `message` property, that message is passed to `showSuccessMessage`.

## `useQuery`

```ts
import { useQuery } from "@vef-framework-react/core";

const result = useQuery({
  queryKey: [findUserPage.key, searchParams],
  queryFn: findUserPage
});
```

## `useMutation`

```ts
import { useMutation } from "@vef-framework-react/core";

const mutation = useMutation({
  mutationKey: [createUser.key],
  mutationFn: createUser,
  meta: {
    invalidates: [[findUserPage.key]],
    shouldShowSuccessFeedback: true
  }
});
```

### Mutation Meta Extensions

VEF extends TanStack's `MutationMeta` with two fields:

| Field | Type | Description |
| --- | --- | --- |
| `invalidates` | `Array<QueryKey<never> \| QueryKey<unknown>>` | Query keys to invalidate on successful mutation |
| `shouldShowSuccessFeedback` | `boolean` | Whether to show the success message from the mutation response (default: `true`) |

## `useInfiniteQuery`

```ts
import { useInfiniteQuery } from "@vef-framework-react/core";

const result = useInfiniteQuery({
  queryKey: [findUserPage.key, searchParams],
  queryFn: findUserPage,
  initialPageParam: 1,
  getNextPageParam: (lastPage, pages) => pages.length + 1
});
```

## `useQueries`

```ts
import { useQueries } from "@vef-framework-react/core";

const results = useQueries({
  queries: [
    { queryKey: [findUserPage.key, params1], queryFn: findUserPage },
    { queryKey: [findRoleList.key], queryFn: findRoleList }
  ]
});
```

## `useMutationState`

```ts
import { useMutationState } from "@vef-framework-react/core";

const states = useMutationState({
  filters: { mutationKey: [createUser.key] }
});
```

## `useIsFetching` and `useIsMutating`

```ts
useIsFetching(filters?: QueryFilters): number
useIsMutating(filters?: MutationFilters): number
```

Low-level hooks returning the count of currently fetching queries / running mutations that match the filters. In most cases, prefer `useHasFetching` and `useHasMutating` from `@vef-framework-react/hooks` which accept typed query/mutation keys and return a `boolean`.

## `useQueryClient`

Returns the `QueryClient` provided by `ApiClientProvider` (which wraps children with TanStack's `QueryClientProvider`). Useful for cache operations (`invalidateQueries`, `setQueryData`, …) inside components; outside React, use `apiClient[QUERY_CLIENT]` instead.

## `useQueryErrorResetBoundary`

TanStack's error-boundary reset hook, re-exported unchanged: returns `{ reset, clearReset, isReset }` for coordinating query retries with an error boundary.

## `keepPreviousData`

```ts
import { keepPreviousData } from "@vef-framework-react/core";

useQuery({
  queryKey: [findUserPage.key, searchParams],
  queryFn: findUserPage,
  placeholderData: keepPreviousData
});
```

## `skipQueryToken`

```ts
import { skipQueryToken } from "@vef-framework-react/core";

useQuery({
  queryKey: [findUserPage.key, searchParams],
  queryFn: searchParams ? findUserPage : skipQueryToken
});
```

## `matchQuery` and `matchMutation`

Helpers for filtering queries and mutations in cache operations:

```ts
import { matchQuery, matchMutation } from "@vef-framework-react/core";
```

## Type Exports

| Type | Description |
| --- | --- |
| `UseQueryResult<TData>` | Result type of `useQuery` |
| `DefinedUseQueryResult<TData>` | Result type when initial data is defined |
| `UseQueryOptions<TQueryFnData, TData, TParams>` | Options for `useQuery` |
| `DefinedInitialDataOptions` | Options when initial data is always defined |
| `UndefinedInitialDataOptions` | Options when initial data may be undefined |
| `UseInfiniteQueryOptions` | Options for `useInfiniteQuery` |
| `UseMutationResult<TData, TParams>` | Result type of `useMutation` |
| `QueryKeyHashFunction` | Custom query key hash function type |
| `PlaceholderDataFunction` | Type for `placeholderData` callback |
| `RefetchOptions` | Options for `refetch()` |
| `StaleTime` | Type for `staleTime` option |
| `MutationMeta` | Extended mutation meta type |
| `QueryMeta` | Query meta type |
| `SkipQueryToken` | Type of `skipQueryToken` (TanStack's `SkipToken`, renamed) |
| `InitialDataFunction<T>` | Function form of `initialData` |
| `MutationFunctionContext` | Context object passed to mutation functions |
| `MutationScope` | Type of the `scope` mutation option (serial-execution scoping) |
| `RetryValue` | `boolean \| number \| ShouldRetryFunction` — type of the `retry` option |
| `ShouldRetryFunction` | `(failureCount: number, error: Error) => boolean` |
| `RetryDelayValue` | `number \| RetryDelayFunction` — type of the `retryDelay` option |
| `RetryDelayFunction` | `(failureCount: number, error: Error) => number` |

The VEF wrappers fix the error type to `Error` and the key type to [`QueryKey<TParams>`](./http-and-api.md#querykeytparams), so `useQuery` / `useMutation` calls do not need to spell out TanStack's five-generic forms.
