---
sidebar_position: 3
title: Query and Mutation
---

# Query and Mutation

`@vef-framework-react/core` re-exports TanStack React Query with VEF-specific type wrappers and a pre-configured `QueryClient`.

## `createQueryClient`

Creates a `QueryClient` with mutation cache and default options.

```ts
import { createQueryClient } from "@vef-framework-react/core";

const queryClient = createQueryClient({
  staleTime: 5_000,
  gcTime: 300_000,
  showSuccessMessage: message => notification.success(message)
});
```

### `QueryClientOptions`

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `staleTime` | `number` | `5000` | Time before data is considered stale (ms) |
| `gcTime` | `number` | `300000` | Time before inactive queries are garbage collected (ms) |
| `showSuccessMessage` | `(msg) => void` | — | Callback to display mutation success messages |

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
| `invalidates` | `QueryKey[]` | Query keys to invalidate on successful mutation |
| `shouldShowSuccessFeedback` | `boolean` | Whether to show success message (default: `true`) |

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

Low-level hooks for checking global fetch/mutation state. In most cases, prefer `useHasFetching` and `useHasMutating` from `@vef-framework-react/hooks` which accept typed query/mutation keys.

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
| `SkipQueryToken` | Type of `skipQueryToken` |
