---
title: HTTP 与 API 客户端
description: HttpClient 与 ApiClient 的签名、选项，以及查询/变更函数工厂。
---

# HTTP 与 API 客户端

## `HttpClient`

基于 Axios 构建的底层 HTTP 客户端，负责处理：

- 自动令牌注入
- 401 响应时的令牌刷新
- 业务错误码检测
- 文件上传与下载
- 路径参数替换

### `HttpClientOptions`

`HttpClient` 不能直接构造——`createHttpClient` 是一个内部工厂函数，并未从包根导出。应用代码应将这些选项配置为 `ApiClientOptions.http`，并传递给 `createApiClient`（见下文）：

```ts
const httpOptions = {
  baseUrl: "/api",
  timeout: 30_000,
  okCode: 0,
  tokenExpiredCode: 1002,
  getAuthTokens: () => tokenStore.getTokens(),
  setAuthTokens: tokens => tokenStore.setTokens(tokens),
  refreshToken: async tokens => {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tokens)
    });
    return response.json();
  },
  onUnauthenticated: () => router.navigate({ to: "/login" }),
  showErrorMessage: message => notification.error(message)
};
```

| 选项 | 类型 | 说明 |
| --- | --- | --- |
| `baseUrl` | `string` | 所有请求的基础 URL |
| `timeout` | `number` | 请求超时时间（毫秒） |
| `okCode` | `MaybeArray<number>` | 业务成功码 |
| `tokenExpiredCode` | `MaybeArray<number>` | 令牌过期码 |
| `getAuthTokens` | `() => Awaitable<AuthTokens \| undefined>` | 获取当前令牌 |
| `setAuthTokens` | `(tokens) => Awaitable<void>` | 持久化刷新后的令牌 |
| `refreshToken` | `(tokens) => Awaitable<AuthTokens>` | 令牌刷新回调 |
| `onUnauthenticated` | `() => Awaitable<void>` | 鉴权失败时调用 |
| `onAccessDenied` | `() => Awaitable<void>` | 403 时调用 |
| `showInfoMessage` | `(msg) => void` | 信息提示处理函数 |
| `showWarningMessage` | `(msg) => void` | 警告提示处理函数 |
| `showErrorMessage` | `(msg) => void` | 错误提示处理函数 |

### HTTP 方法

```ts
// GET
const result = await http.get<UserInfo>("/user/info", { params: { id: 1 } });

// POST
const result = await http.post<CreateResult>("/user/create", { data: payload });

// PUT
const result = await http.put<void>("/user/update", { data: payload });

// DELETE
const result = await http.delete<void>("/user/delete", { params: { id: 1 } });

// Upload
const result = await http.upload<UploadResult>("/file/upload", {
  data: formData,
  onProgress: event => console.log(event.loaded / event.total)
});

// Download
await http.download("/file/export", {
  params: { id: 1 },
  filename: "export.xlsx"
});
```

### `ApiResult<T>`

所有 HTTP 方法都返回 `ApiResult<T>`：

```ts
interface ApiResult<T> {
  readonly code: number;
  readonly message: string;
  readonly data: T;
}
```

### 跳过鉴权

对于不应携带 Authorization 请求头的请求：

```ts
import { skipAuthenticationHeader, skipAuthenticationValue } from "@vef-framework-react/core";

await http.post("/auth/login", {
  data: credentials,
  headers: {
    [skipAuthenticationHeader]: skipAuthenticationValue
  }
});
```

### `isBusinessError`

```ts
import { isBusinessError } from "@vef-framework-react/core";

try {
  await http.post("/user/create", { data: payload });
} catch (error) {
  if (isBusinessError(error)) {
    // error.code, error.message are available
  }
}
```

---

## `ApiClient`

`ApiClient` 将 `HttpClient` 和 `QueryClient` 组合为单一对象。在大多数项目中，它通过 `starter.createApiClient()` 创建一次，并在整个应用中共享。

### `createApiClient`（core）

core 层级的工厂函数。在应用代码中，优先使用 `starter.createApiClient()`，它在此基础上增加了令牌存储、消息反馈和未鉴权处理。

```ts
import { createApiClient } from "@vef-framework-react/core";

const apiClient = createApiClient({
  http: {
    baseUrl: "/api",
    okCode: 0
  },
  query: {
    staleTime: 5_000,
    gcTime: 300_000
  }
});
```

### `ApiClientOptions`

| 选项 | 类型 | 说明 |
| --- | --- | --- |
| `http` | `HttpClientOptions` | 传递给 `HttpClient` 的选项 |
| `query` | `QueryClientOptions` | 传递给 `QueryClient` 的选项 |

### `createQueryFn`

创建一个带有自动 abort signal 注入的类型化查询函数。

```ts
export const findUserPage = apiClient.createQueryFn(
  "find_user_page",
  http => async (params, pageParam, meta) => {
    const result = await http.post("/user/page", { data: params });
    return result.data;
  }
);
```

返回的函数带有 `.key` 属性，可用于 `queryKey` 数组：

```ts
useQuery({
  queryKey: [findUserPage.key, searchParams],
  queryFn: findUserPage
});
```

### `createMutationFn`

创建一个类型化的变更函数。

```ts
export const createUser = apiClient.createMutationFn(
  "create_user",
  http => params => http.post("/user/create", { data: params })
);
```

### `fetchQuery` 和 `prefetchQuery`

用于在 React 组件之外进行命令式数据获取：

```ts
const userInfo = await apiClient.fetchQuery({
  queryKey: [getUserInfo.key, { id: 1 }],
  queryFn: getUserInfo
});

await apiClient.prefetchQuery({
  queryKey: [getUserInfo.key, { id: 1 }],
  queryFn: getUserInfo
});
```

### `executeMutation`

用于在 React 组件之外进行命令式变更：

```ts
await apiClient.executeMutation({
  mutationFn: login,
  params: { username, password }
});
```

### `QueryKey<TParams>`

框架中通用的类型化查询键格式：

```ts
type QueryKey<TParams = never> = readonly [Key, ...If<IsNever<TParams>, [], [TParams]>];
```

### `MutationFunction<TData, TParams>`

在 TanStack 的变更函数基础上扩展了 `.key` 属性，用于 `useHasMutating` 中的匹配。

### `QueryFunction<TData, TParams, TPageParam>`

在 TanStack 的查询函数基础上扩展了 `.key` 属性，用于 `useHasFetching` 中的匹配。
