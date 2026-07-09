---
title: 查询与变更
description: "VEF 风格的 TanStack Query 重导出、QueryClientOptions 与 mutation meta 扩展。"
---

# 查询与变更

`@vef-framework-react/core` 重导出了 TanStack React Query，并提供了 VEF 专属的类型包装与预配置的 `QueryClient`。

## `QueryClientOptions`

`QueryClient` 不能直接构造——`createQueryClient` 是一个内部工厂函数，并未从包根导出。应用代码应将这些选项配置为 `ApiClientOptions.query`，并传递给 `createApiClient`（参见 [HTTP 与 API 客户端](./http-and-api.md)）：

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
| `showSuccessMessage` | `(msg) => void` | — | 用于显示变更成功消息的回调 |

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
| `invalidates` | `QueryKey[]` | 变更成功后需要失效的查询键 |
| `shouldShowSuccessFeedback` | `boolean` | 是否显示成功消息（默认：`true`） |

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

用于检查全局 fetch/mutation 状态的底层 hook。多数情况下，优先使用来自 `@vef-framework-react/hooks` 的 `useHasFetching` 和 `useHasMutating`，它们接受类型化的查询/变更键。

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
| `SkipQueryToken` | `skipQueryToken` 的类型 |
