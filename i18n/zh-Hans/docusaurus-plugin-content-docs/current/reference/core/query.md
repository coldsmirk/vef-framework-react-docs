---
title: 查询与变更
description: "VEF 风格的 TanStack Query 重导出、QueryClientOptions 与 mutation meta 扩展。"
---

# 查询与变更

`@vef-framework-react/core` 重导出了 TanStack React Query，并提供了 VEF 专属的类型包装与预配置的 `QueryClient`。

## `QueryClientOptions`

`QueryClient` 可以通过导出的 `createQueryClient` 工厂函数创建，但大多数应用应使用 `createApiClient`，以便查询层与框架的 `HttpClient` 配对。在该路径中，将这些选项配置为 `ApiClientOptions.query` 并传递给 `createApiClient`（参见 [HTTP 与 API 客户端](./http-and-api.md)）：

```ts
const queryOptions = {
  staleTime: 5_000,
  gcTime: 300_000,
  showSuccessMessage: message => notification.success(message)
};
```

| 选项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `staleTime` | `number` | `5000` | 数据被视为过期前的时间（毫秒） |
| `gcTime` | `number` | `300000` | 非活跃查询被垃圾回收前的时间（毫秒） |
| `showSuccessMessage` | `(message: string) => void` | — | 用于显示变更成功消息的回调（见下文 mutation 缓存行为） |

### 预配置默认值

内部工厂以如下默认值配置 `QueryClient`（单个查询/变更的选项仍可覆盖）：

- **查询**：`networkMode: "online"`、`retry: false`、`structuralSharing: true`、`throwOnError: false`、`refetchOnMount` / `refetchOnReconnect` / `refetchOnWindowFocus` 均为 `true`、`retryOnMount: true`、`queryKeyHashFn: hashKey`（来自 `shared` 的稳定哈希器，使结构相同的键无论 key 顺序如何都哈希一致），以及 `experimental_prefetchInRender: true`。
- **变更**：`networkMode: "online"`、`retry: false`、`throwOnError: false`，以及相同的 `gcTime`。
- **Mutation 缓存 `onSuccess`**：当完成的变更设置了 `meta.invalidates` 时，与其中任一键匹配的每个查询（无论活跃与否；TanStack `matchQuery` 语义；已过期的查询不会被重复失效）都会被失效。当 `meta.shouldShowSuccessFeedback` 不为 `false` 且变更结果是带有 `message` 属性的普通对象时，该消息会被传给 `showSuccessMessage`。

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

### Mutation Meta 扩展

VEF 在 TanStack 的 `MutationMeta` 基础上扩展了两个字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `invalidates` | `Array<QueryKey<never> \| QueryKey<unknown>>` | 变更成功后需要失效的查询键 |
| `shouldShowSuccessFeedback` | `boolean` | 是否显示变更响应中的成功消息（默认：`true`） |

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

## `useIsFetching` 与 `useIsMutating`

```ts
useIsFetching(filters?: QueryFilters): number
useIsMutating(filters?: MutationFilters): number
```

底层 hook，返回匹配过滤条件的、当前正在请求的查询数 / 正在运行的变更数。多数情况下，优先使用来自 `@vef-framework-react/hooks` 的 `useHasFetching` 和 `useHasMutating`，它们接受类型化的查询/变更键并返回 `boolean`。

## `useQueryClient`

返回由 `ApiClientProvider`（它用 TanStack 的 `QueryClientProvider` 包裹子组件）提供的 `QueryClient`。适用于在组件内进行缓存操作（`invalidateQueries`、`setQueryData` 等）；在 React 之外，请改用 `apiClient[QUERY_CLIENT]`。

## `useQueryErrorResetBoundary`

TanStack 的错误边界重置 hook，原样重导出：返回 `{ reset, clearReset, isReset }`，用于协调查询重试与错误边界。

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

## `matchQuery` 与 `matchMutation`

用于在缓存操作中过滤查询和变更的辅助函数：

```ts
import { matchQuery, matchMutation } from "@vef-framework-react/core";
```

## 类型导出

| 类型 | 说明 |
| --- | --- |
| `UseQueryResult<TData>` | `useQuery` 的结果类型 |
| `DefinedUseQueryResult<TData>` | 初始数据已定义时的结果类型 |
| `UseQueryOptions<TQueryFnData, TData, TParams>` | `useQuery` 的选项类型 |
| `DefinedInitialDataOptions` | 初始数据始终已定义时的选项类型 |
| `UndefinedInitialDataOptions` | 初始数据可能未定义时的选项类型 |
| `UseInfiniteQueryOptions` | `useInfiniteQuery` 的选项类型 |
| `UseMutationResult<TData, TParams>` | `useMutation` 的结果类型 |
| `QueryKeyHashFunction` | 自定义查询键哈希函数类型 |
| `PlaceholderDataFunction` | `placeholderData` 回调的类型 |
| `RefetchOptions` | `refetch()` 的选项类型 |
| `StaleTime` | `staleTime` 选项的类型 |
| `MutationMeta` | 扩展后的变更元数据类型 |
| `QueryMeta` | 查询元数据类型 |
| `SkipQueryToken` | `skipQueryToken` 的类型（TanStack 的 `SkipToken`，重命名） |
| `InitialDataFunction<T>` | `initialData` 的函数形式 |
| `MutationFunctionContext` | 传给变更函数的上下文对象 |
| `MutationScope` | `scope` 变更选项的类型（串行执行作用域） |
| `RetryValue` | `boolean \| number \| ShouldRetryFunction`——`retry` 选项的类型 |
| `ShouldRetryFunction` | `(failureCount: number, error: Error) => boolean` |
| `RetryDelayValue` | `number \| RetryDelayFunction`——`retryDelay` 选项的类型 |
| `RetryDelayFunction` | `(failureCount: number, error: Error) => number` |

VEF 的包装将错误类型固定为 `Error`、键类型固定为 [`QueryKey<TParams>`](./http-and-api.md#querykeytparams)，因此调用 `useQuery` / `useMutation` 时无需写出 TanStack 的五泛型形式。
