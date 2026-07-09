---
title: 数据请求
description: VEF 应用如何通过共享的 apiClient 组织 API 请求，从查询定义到组件内使用。
---

# 数据请求

在 VEF 应用中，请求处理通常遵循一条清晰的路径：

1. 用 `starter.createApiClient()` 创建一个全局客户端
2. 用 `apiClient.createQueryFn()` 和 `apiClient.createMutationFn()` 定义领域 API
3. 在组件内通过 `useQuery()` 和 `useMutation()` 调用它们
4. 在 React 组件作用域之外使用 `fetchQuery()` 和 `executeMutation()`

本篇聚焦于这一工作流。完整的 `HttpClientOptions` / `ApiClientOptions` 选项表以及 `HttpClient` 上的每个方法，见 [HTTP 与 API 客户端](../reference/core/http-and-api.md)。

## 创建全局 `apiClient`

```ts
import { createApiClient } from "@vef-framework-react/starter";

export const apiClient = createApiClient({
  http: {
    baseUrl: "/api",
    okCode: 0,
    tokenExpiredCode: 1002,
    async refreshToken(tokens) {
      return await apiClient.executeMutation({
        mutationFn: refreshAuth,
        params: tokens
      });
    }
  }
});
```

`starter.createApiClient()` 在 core 层客户端之上增加了令牌存储、未认证/无权限事件接入，以及全局消息反馈——完整的选项列表和每个字段的说明见 [HTTP 与 API 客户端](../reference/core/http-and-api.md)。

## 定义查询函数

```ts
export const findUserPage = apiClient.createQueryFn(
  "find_user_page",
  http => async queryParams => {
    const result = await http.post("/api/user/page", {
      data: queryParams
    });

    return result.data;
  }
);
```

这种写法在项目代码中会频繁出现：

```ts
useQuery({
  queryKey: [findUserPage.key, params],
  queryFn: findUserPage
});
```

## 定义变更函数

```ts
export const createUser = apiClient.createMutationFn(
  "create_user",
  http => params => http.post("/api/user/create", {
    data: params
  })
);
```

## 在组件内使用

```tsx
import { useMutation, useQuery } from "@vef-framework-react/core";

const pageResult = useQuery({
  queryKey: [findUserPage.key, searchParams],
  queryFn: findUserPage
});

const createMutation = useMutation({
  mutationKey: [createUser.key],
  mutationFn: createUser
});
```

## 在组件之外使用

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

## 分页查询

`starter.extractQueryParams()` 常用于将查询入参拆分为业务参数、分页和排序。分页形态本身——`PaginatedQueryParams<TSearch, TParams>`——由 `@vef-framework-react/components` 导出，因为这也是 `ProTable` 和 `CrudPage` 对其 `queryFn` 所期望的入参形态：

```ts
import type { PaginatedQueryParams } from "@vef-framework-react/components";

import { extractQueryParams } from "@vef-framework-react/starter";

export const findUserPage = apiClient.createQueryFn(
  "find_user_page",
  http => async (queryParams: PaginatedQueryParams<UserSearch>) => {
    const { params, pagination, sort } = extractQueryParams(queryParams);

    const result = await http.post("/api/user/page", {
      data: {
        ...params,
        pagination,
        sort
      }
    });

    return result.data;
  }
);
```

以这种方式定义查询函数，意味着同一个 `findUserPage` 既可以支撑 `useQuery()` 调用，也可以直接用于 `ProTable` 或 `CrudPage`，而不需要在每个调用点重新组织参数——见 [表格](./tables.md) 和 [CRUD 页面](./crud.md)。

## 为特定请求跳过认证

```ts
import { skipAuthenticationHeader, skipAuthenticationValue } from "@vef-framework-react/core";
```

```ts
headers: {
  [skipAuthenticationHeader]: skipAuthenticationValue
}
```

## 建议的 API 文件结构

一个领域 API 文件通常包含：

1. 领域实体接口
2. 搜索参数接口
3. 通过 `createQueryFn()` 导出的查询函数
4. 通过 `createMutationFn()` 导出的变更函数

避免在页面代码中散落原始的 `fetch` 或 `axios` 调用。把请求统一放在 `apis/*` 下，能让后续与 `CrudPage`、权限反馈、加载态指示以及缓存复用的集成更加干净。
