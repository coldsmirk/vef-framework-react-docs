---
sidebar_position: 8
title: API Integration
---

# API Integration

In VEF applications, request handling usually follows a clear path:

1. create a global client with `starter.createApiClient()`
2. define domain APIs with `apiClient.createQueryFn()` and `apiClient.createMutationFn()`
3. call them through `useQuery()` and `useMutation()` inside components
4. use `fetchQuery()` and `executeMutation()` outside React component scope

## Create a Global `apiClient`

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

## Define Query Functions

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
  ({ post }) => params => post("/api/user/create", {
    data: params
  })
);
```

## Inside Components

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

`starter.extractQueryParams()` is commonly used to split query input into business parameters, pagination, and sorting:

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

## Skip Authentication for Specific Requests

```ts
import { skipAuthenticationHeader, skipAuthenticationValue } from "@vef-framework/core";
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
