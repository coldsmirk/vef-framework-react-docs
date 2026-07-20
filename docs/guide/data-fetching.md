---
title: Data Fetching
description: How VEF applications wire API requests through a shared apiClient, from query definition to component usage.
---

# Data Fetching

In VEF applications, request handling usually follows a clear path:

1. create a global client with `starter.createApiClient()`
2. define domain APIs with `apiClient.createQueryFn()` and `apiClient.createMutationFn()`
3. call them through `useQuery()` and `useMutation()` inside components
4. use `fetchQuery()` and `executeMutation()` outside React component scope

This page focuses on that workflow. For the full `HttpClientOptions` / `ApiClientOptions` tables and every method on `HttpClient`, see [HTTP and API Client](../reference/core/http-and-api.md).

## Create a Global `apiClient`

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

`starter.createApiClient()` adds token storage, unauthenticated/access-denied event wiring, and global message feedback on top of the core-level client — see [HTTP and API Client](../reference/core/http-and-api.md) for the complete option list and every field it accepts.

## Define Query Functions

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

Since v2.11.0, request lifecycles are isolated per query execution: the outer factory (`http => ...`) runs once **per execution**, and the `http` it receives is scoped to that invocation — its abort signal is this query's signal, so cancelling one query can never abort another query's request, even when they run concurrently. Two practical consequences:

- Keep the factory side-effect-free: it must not retain state across executions or perform one-time setup (module scope is the place for that).
- Query cancellation (unmount, `queryClient.cancelQueries`) propagates into the HTTP request automatically. If you also pass your own `signal` in request options, the two are **combined** — either one aborts the request — instead of the query's signal replacing yours as in earlier versions.

This pattern appears frequently in project code:

```ts
useQuery({
  queryKey: [findUserPage.key, params],
  queryFn: findUserPage
});
```

## Define Mutation Functions

```ts
export const createUser = apiClient.createMutationFn(
  "create_user",
  http => params => http.post("/api/user/create", {
    data: params
  })
);
```

## Inside Components

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

## Outside Components

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

## Paginated Queries

`starter.extractQueryParams()` is commonly used to split query input into business parameters, pagination, and sorting. The paginated shape itself — `PaginatedQueryParams<TSearch, TParams>` — is exported from `@vef-framework-react/components`, since it is also what `ProTable` and `CrudPage` expect their `queryFn` to accept:

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

Defining query functions this way means the same `findUserPage` can back a `useQuery()` call, a `ProTable`, or a `CrudPage` without reshaping parameters at each call site — see [Tables](./tables.md) and [CRUD Pages](./crud.md).

## Fetching Files with Authentication

Files behind the API cannot be fetched with a plain `<a href>` — the request would go out without the Bearer header. `HttpClient` has two methods for this, both with the full request semantics of the client (token injection, 401 refresh-and-retry, path parameters, abort signal):

- `requestFile(url, options?)` — fetches the file and resolves to `{ blob, filename? }` (`HttpFileResponse`); `filename` is parsed from the `Content-Disposition` response header when the server sends one. Use it when the bytes are consumed in code: previews, object URLs, custom persistence.
- `download(url, options?)` — calls `requestFile` and hands the blob to the browser as a download. Its extra `filename` option overrides the saved name — a string replaces it, and a function receives the server-provided name and returns the final one. Without a server filename, the fallback name is `download`.

Both accept `method` (`"get"` or `"post"`, default `"get"`), `data`, `params`, `onProgress` (download progress callback), and the usual `signal` / `headers`. Both are proxied like every other request method, so they work inside query and mutation functions — and in query functions they participate in automatic cancellation:

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

Error handling is taken care of: when a "file" endpoint fails and returns the backend's JSON business envelope instead of file content, the client detects it — including in binary response bodies — and throws a `BusinessError` with the usual warning feedback, rather than handing you (or saving) a JSON error file.

## Skip Authentication for Specific Requests

```ts
import { skipAuthenticationHeader, skipAuthenticationValue } from "@vef-framework-react/core";
```

```ts
headers: {
  [skipAuthenticationHeader]: skipAuthenticationValue
}
```

## Suggested API File Structure

A domain API file usually contains:

1. domain entity interfaces
2. search parameter interfaces
3. query functions exported through `createQueryFn()`
4. mutation functions exported through `createMutationFn()`

Avoid scattering raw `fetch` or `axios` calls across page code. Keeping requests under `apis/*` makes later integration with `CrudPage`, permission feedback, loading indicators, and cache reuse much cleaner.
