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
