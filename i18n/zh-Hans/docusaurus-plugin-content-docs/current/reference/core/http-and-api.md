---
sidebar_position: 2
title: HTTP 与 API 客户端
---

# HTTP 与 API 客户端

## `HttpClient`

基于 Axios 构建的底层 HTTP 客户端，负责处理：

- 自动注入 Token
- 401 响应时自动刷新 Token
- 业务错误码检测
- 文件上传与下载
- 路径参数替换

### 创建 `HttpClient`

```ts
import { createHttpClient } from "@vef-framework-react/core";

const http = createHttpClient({
  baseUrl: "/api",
  timeout: 30_000,
  okCode: 0,
  tokenExpiredCode: 1002,
  getAuthTokens: () => tokenStore.getTokens(),
  setAuthTokens: tokens => tokenStore.setTokens(tokens),
  refreshToken: async tokens => {
    const result = await http.post("/auth/refresh", { data: tokens });
    return result.data;
  },
  onUnauthenticated: () => router.navigate({ to: "/login" }),
  showErrorMessage: message => notification.error(message)
});
```

### `HttpClientOptions`

| 选项 | 类型 | 说明 |
| --- | --- | --- |
| `baseUrl` | `string` | 所有请求的基础 URL |
| `timeout` | `number` | 请求超时时间（毫秒） |
| `okCode` | `MaybeArray<number>` | 业务成功码 |
| `tokenExpiredCode` | `MaybeArray<number>` | Token 过期码 |
| `getAuthTokens` | `() => Awaitable<AuthTokens \| undefined>` | 获取当前 Token |
| `setAuthTokens` | `(tokens) => Awaitable<void>` | 持久化刷新后的 Token |
| `refreshToken` | `(tokens) => Awaitable<AuthTokens>` | Token 刷新回调 |
| `onUnauthenticated` | `() => Awaitable<void>` | 认证失败时调用 |
| `onAccessDenied` | `() => Awaitable<void>` | 403 时调用 |
| `showInfoMessage` | `(msg) => void` | 信息消息处理器 |
| `showWarningMessage` | `(msg) => void` | 警告消息处理器 |
| `showErrorMessage` | `(msg) => void` | 错误消息处理器 |

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

// 上传文件
const result = await http.upload<UploadResult>("/file/upload", {
  data: formData,
  onProgress: event => console.log(event.loaded / event.total)
});

// 下载文件
await http.download("/file/export", {
  params: { id: 1 },
  filename: "export.xlsx"
});
```

### `ApiResult<T>`

所有 HTTP 方法均返回 `ApiResult<T>`：

```ts
interface ApiResult<T> {
  readonly code: number;
  readonly message: string;
  readonly data: T;
}
```

### 跳过认证

对于不需要携带 Authorization 头的请求：

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
    // 可访问 error.code、error.message
  }
}
```

---

## `ApiClient`

`ApiClient` 将 `HttpClient` 和 `QueryClient` 组合为一个对象。在大多数项目中，通过 `starter.createApiClient()` 创建一次后在整个应用中共享。

### `createApiClient`（core 层）

核心层工厂函数。在应用代码中，优先使用 `starter.createApiClient()`，它在此基础上增加了 Token 存储、消息反馈和未认证处理。

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

创建带有自动 abort signal 注入的类型化查询函数。

```ts
export const findUserPage = apiClient.createQueryFn(
  "find_user_page",
  http => async (params, pageParam, meta) => {
    const result = await http.post("/user/page", { data: params });
    return result.data;
  }
);
```

返回的函数带有 `.key` 属性，用于 `queryKey` 数组：

```ts
useQuery({
  queryKey: [findUserPage.key, searchParams],
  queryFn: findUserPage
});
```

### `createMutationFn`

创建类型化的变更函数。

```ts
export const createUser = apiClient.createMutationFn(
  "create_user",
  http => params => http.post("/user/create", { data: params })
);
```

### `fetchQuery` 和 `prefetchQuery`

在 React 组件外部进行命令式数据获取：

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

在 React 组件外部进行命令式变更：

```ts
await apiClient.executeMutation({
  mutationFn: login,
  params: { username, password }
});
```

### `QueryKey<TParams>`

框架中使用的类型化查询键格式：

```ts
type QueryKey<TParams = never> = readonly [Key, ...If<IsNever<TParams>, [], [TParams]>];
```

### `MutationFunction<TData, TParams>`

扩展了 TanStack 变更函数，增加了 `.key` 属性，用于 `useHasMutating` 匹配。

### `QueryFunction<TData, TParams, TPageParam>`

扩展了 TanStack 查询函数，增加了 `.key` 属性，用于 `useHasFetching` 匹配。
