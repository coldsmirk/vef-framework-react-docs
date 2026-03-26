---
sidebar_position: 8
title: API 集成
---

# API 集成

VEF 里“请求怎么写”有一条非常明确的推荐路径:

1. 用 `starter.createApiClient()` 创建全局客户端
2. 用 `apiClient.createQueryFn()` / `createMutationFn()` 定义领域 API
3. 组件里用 `useQuery()` / `useMutation()`
4. 非组件上下文里用 `fetchQuery()` / `executeMutation()`

## 先创建全局 `apiClient`

```ts
import { createApiClient } from "@vef-framework/starter";

export const apiClient = createApiClient({
  http: {
    baseUrl: "/api",
    okCode: 0,
    tokenExpiredCode: 1002,
    timeout: 30_000,
    async refreshToken(tokens) {
      return await apiClient.executeMutation({
        mutationFn: refreshAuth,
        params: tokens
      });
    }
  }
});
```

## 定义查询函数

```ts
export const findUserPage = apiClient.createQueryFn(
  "find_user_page",
  ({ post }) => async queryParams => {
    const result = await post("/api/user/page", {
      data: queryParams
    });

    return result.data;
  }
);
```

你会在整个项目里频繁看到这种写法:

```ts
useQuery({
  queryKey: [findUserPage.key, params],
  queryFn: findUserPage
});
```

## 定义 mutation 函数

```ts
export const createUser = apiClient.createMutationFn(
  "create_user",
  ({ post }) => params => post("/api/user/create", {
    data: params
  })
);
```

## 组件内: `useQuery()` 与 `useMutation()`

```tsx
import { useMutation, useQuery } from "@vef-framework/core";

const pageResult = useQuery({
  queryKey: [findUserPage.key, searchParams],
  queryFn: findUserPage
});

const createMutation = useMutation({
  mutationKey: [createUser.key],
  mutationFn: createUser
});
```

## 组件外: `fetchQuery()` 与 `executeMutation()`

```ts
function fetchUserInfo() {
  return apiClient.fetchQuery({
    queryKey: [getUserInfo.key, { appId: "admin" }],
    queryFn: getUserInfo
  });
}
```

```ts
await apiClient.executeMutation({
  mutationFn: login,
  params: loginValues
});
```

## 分页查询怎么写

`starter.extractQueryParams()` 是 VEF 里非常常见的辅助函数，专门用来从查询参数里拆分页、排序和业务参数。

```ts
import type { PaginatedQueryParams } from "@vef-framework/starter";

import { extractQueryParams } from "@vef-framework/starter";

export const findUserPage = apiClient.createQueryFn(
  "find_user_page",
  ({ post }) => async (queryParams: PaginatedQueryParams<UserSearch>) => {
    const { params, pagination } = extractQueryParams(queryParams);

    const result = await post("/api/user/page", {
      data: {
        ...params,
        pagination
      }
    });

    return result.data;
  }
);
```

## 跳过认证请求

```ts
import { skipAuthenticationHeader, skipAuthenticationValue } from "@vef-framework/core";
```

用法如下:

```ts
headers: {
  [skipAuthenticationHeader]: skipAuthenticationValue
}
```

## 推荐的 API 文件结构

一个领域 API 文件一般包含:

1. 领域实体接口
2. 搜索参数接口
3. `createQueryFn()` 导出的查询
4. `createMutationFn()` 导出的操作

不要把裸 `fetch` / `axios` 调用散落在页面里。把请求统一收口到 `apis/*`，后续接 `CrudPage`、权限提示、loading 统计和缓存复用都会顺很多。
