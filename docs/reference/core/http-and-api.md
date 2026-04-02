---
sidebar_position: 2
title: HTTP and API Client
---

# HTTP and API Client

## `HttpClient`

The low-level HTTP client built on Axios. It handles:

- automatic token injection
- token refresh on 401 responses
- business error code detection
- file upload and download
- path parameter replacement

### Creating an `HttpClient`

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

| Option | Type | Description |
| --- | --- | --- |
| `baseUrl` | `string` | Base URL for all requests |
| `timeout` | `number` | Request timeout in ms |
| `okCode` | `MaybeArray<number>` | Business success code(s) |
| `tokenExpiredCode` | `MaybeArray<number>` | Token-expired code(s) |
| `getAuthTokens` | `() => Awaitable<AuthTokens \| undefined>` | Retrieve current tokens |
| `setAuthTokens` | `(tokens) => Awaitable<void>` | Persist refreshed tokens |
| `refreshToken` | `(tokens) => Awaitable<AuthTokens>` | Refresh token callback |
| `onUnauthenticated` | `() => Awaitable<void>` | Called when auth fails |
| `onAccessDenied` | `() => Awaitable<void>` | Called on 403 |
| `showInfoMessage` | `(msg) => void` | Info message handler |
| `showWarningMessage` | `(msg) => void` | Warning message handler |
| `showErrorMessage` | `(msg) => void` | Error message handler |

### HTTP Methods

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

All HTTP methods return `ApiResult<T>`:

```ts
interface ApiResult<T> {
  readonly code: number;
  readonly message: string;
  readonly data: T;
}
```

### Skipping Authentication

For requests that should not carry the Authorization header:

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

`ApiClient` combines `HttpClient` and `QueryClient` into a single object. In most projects, it is created once through `starter.createApiClient()` and shared across the application.

### `createApiClient` (core)

The core-level factory. In application code, prefer `starter.createApiClient()` which adds token storage, message feedback, and unauthenticated handling on top.

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

| Option | Type | Description |
| --- | --- | --- |
| `http` | `HttpClientOptions` | Options passed to `HttpClient` |
| `query` | `QueryClientOptions` | Options passed to `QueryClient` |

### `createQueryFn`

Creates a typed query function with automatic abort signal injection.

```ts
export const findUserPage = apiClient.createQueryFn(
  "find_user_page",
  http => async (params, pageParam, meta) => {
    const result = await http.post("/user/page", { data: params });
    return result.data;
  }
);
```

The returned function has a `.key` property for use in `queryKey` arrays:

```ts
useQuery({
  queryKey: [findUserPage.key, searchParams],
  queryFn: findUserPage
});
```

### `createMutationFn`

Creates a typed mutation function.

```ts
export const createUser = apiClient.createMutationFn(
  "create_user",
  http => params => http.post("/user/create", { data: params })
);
```

### `fetchQuery` and `prefetchQuery`

For imperative data fetching outside React components:

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

For imperative mutations outside React components:

```ts
await apiClient.executeMutation({
  mutationFn: login,
  params: { username, password }
});
```

### `QueryKey<TParams>`

The typed query key format used throughout the framework:

```ts
type QueryKey<TParams = never> = readonly [Key, ...If<IsNever<TParams>, [], [TParams]>];
```

### `MutationFunction<TData, TParams>`

Extends the TanStack mutation function with a `.key` property for matching in `useHasMutating`.

### `QueryFunction<TData, TParams, TPageParam>`

Extends the TanStack query function with a `.key` property for matching in `useHasFetching`.
