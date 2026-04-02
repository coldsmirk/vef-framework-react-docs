---
sidebar_position: 3
title: 查询与变更
---

# 查询与变更

`@vef-framework-react/core` 重导出了 TanStack React Query，并提供了 VEF 专属的类型包装和预配置的 `QueryClient`。

## `createQueryClient`

创建带有 mutation cache 和默认选项的 `QueryClient`。

```ts
import { createQueryClient } from "@vef-framework-react/core";

const queryClient = createQueryClient({
  staleTime: 5_000,
  gcTime: 300_000,
  showSuccessMessage: message => notification.success(message)
});
```

### `QueryClientOptions`

| 选项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `staleTime` | `number` | `5000` | 数据过期时间（毫秒） |
| `gcTime` | `number` | `300000` | 非活跃查询垃圾回收时间（毫秒） |
| `showSuccessMessage` | `(msg) => void` | — | 变更成功消息回调 |

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

## `useIsFetching` 和 `useIsMutating`

检查全局 fetch/mutation 状态的底层 hook。大多数情况下，优先使用 `@vef-framework-react/hooks` 中的 `useHasFetching` 和 `useHasMutating`，它们接受类型化的查询/变更键。

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

## `matchQuery` 和 `matchMutation`

用于缓存操作中过滤查询和变更的辅助函数：

```ts
import { matchQuery, matchMutation } from "@vef-framework-react/core";
```

## 类型导出

| 类型 | 说明 |
| --- | --- |
| `UseQueryResult<TData>` | `useQuery` 的结果类型 |
| `DefinedUseQueryResult<TData>` | 初始数据已定义时的结果类型 |
| `UseQueryOptions<TQueryFnData, TData, TParams>` | `useQuery` 的选项类型 |
| `DefinedInitialDataOptions` | 初始数据始终存在时的选项类型 |
| `UndefinedInitialDataOptions` | 初始数据可能不存在时的选项类型 |
| `UseInfiniteQueryOptions` | `useInfiniteQuery` 的选项类型 |
| `UseMutationResult<TData, TParams>` | `useMutation` 的结果类型 |
| `QueryKeyHashFunction` | 自定义查询键哈希函数类型 |
| `PlaceholderDataFunction` | `placeholderData` 回调类型 |
| `RefetchOptions` | `refetch()` 的选项类型 |
| `StaleTime` | `staleTime` 选项类型 |
| `MutationMeta` | 扩展后的变更元数据类型 |
| `QueryMeta` | 查询元数据类型 |
| `SkipQueryToken` | `skipQueryToken` 的类型 |
