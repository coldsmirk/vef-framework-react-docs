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

自 v2.11.0 起，请求生命周期按查询执行相互隔离（request lifecycle isolation，请求生命周期隔离）：外层工厂（`http => ...`）在**每次执行**时各运行一次，它接收到的 `http` 仅作用于本次调用——其中止信号就是这次查询的信号，因此取消一个查询永远不会中止另一个查询的请求，即使二者并发运行。两个实际影响：

- 保持工厂无副作用：它不得跨执行保留状态，也不得做一次性初始化（这类工作应放在模块作用域）。
- 查询取消（卸载、`queryClient.cancelQueries`）会自动传播到 HTTP 请求。如果你还在请求选项中传入了自己的 `signal`，二者会被**合并**——任何一个都能中止请求——而不是像早期版本那样由查询的信号取代你的信号。

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

## 带认证地获取文件

API 后面的文件没法用一个普通的 `<a href>` 获取——请求会在没有 Bearer 请求头的情况下发出去。`HttpClient` 为此提供了两个方法，都具备客户端完整的请求语义（令牌注入、401 刷新重试、路径参数、中止信号）：

- `requestFile(url, options?)` —— 获取文件并解析为 `{ blob, filename? }`（`HttpFileResponse`）；当服务器发送了 `Content-Disposition` 响应头时，`filename` 从中解析。适用于字节内容要在代码中消费的场景：预览、object URL、自定义持久化。
- `download(url, options?)` —— 调用 `requestFile` 并把 blob 作为下载交给浏览器。它额外的 `filename` 选项可覆盖保存文件名——传字符串直接替换，传函数则接收服务器提供的名字并返回最终名字。服务器没有提供文件名时，回退名为 `download`。

两者都接受 `method`（`"get"` 或 `"post"`，默认 `"get"`）、`data`、`params`、`onProgress`（下载进度回调），以及常规的 `signal` / `headers`。两者与其它请求方法一样经过代理，因此可以在查询函数和变更函数中使用——并且在查询函数中会参与自动取消：

```ts
export const exportUserList = apiClient.createMutationFn(
  "export_user_list",
  http => (params: UserSearch) => http.download("/api/user/export", {
    method: "post",
    data: params,
    filename: name => `users-${Date.now()}-${name}`
  })
);
```

```ts
// Rendering a protected image from a blob:
export const fetchAvatar = apiClient.createQueryFn(
  "fetch_avatar",
  http => async ({ userId }: { userId: string }) => {
    const { blob } = await http.requestFile("/api/user/:userId/avatar", {
      params: { userId }
    });

    return URL.createObjectURL(blob);
  }
);
```

错误处理已经替你考虑好了：当一个"文件"接口失败并返回后端的 JSON 业务信封而不是文件内容时，客户端会检测到这一点——包括在二进制响应体中——并抛出 `BusinessError` 并给出常规的警告反馈，而不是把一个 JSON 错误文件交给你（或保存下来）。

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
