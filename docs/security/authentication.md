---
sidebar_position: 1
title: Authentication
---

# Authentication

Authentication in VEF mainly involves three parts:

1. `createApiClient()` manages tokens and refresh logic
2. `createLoginRouteOptions()` defines the login route
3. `createLayoutRouteOptions()` protects authenticated application areas

## Wiring the Login Page

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { createLoginRouteOptions, LOGIN_ROUTE_ID } from "@vef-framework/starter";

import { apiClient } from "../../api";
import { login } from "../../apis/auth";

export const Route = createFileRoute(LOGIN_ROUTE_ID)(
  createLoginRouteOptions({
    onLogin: params => apiClient.executeMutation({ mutationFn: login, params })
  })
);
```

## What Happens After Login Succeeds

The built-in `Login` component from `starter` performs the following steps after `onLogin` succeeds:

1. writes authenticated state into `useAppStore`
2. stores tokens
3. invalidates the router
4. navigates to `redirect` or the index route
5. shows a success notification

## Token Refresh

This is one of the key parts of `createApiClient()` configuration:

```ts
const apiClient = createApiClient({
  http: {
    baseUrl: "/api",
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

## Logout

The remote logout action is typically implemented as a mutation and passed into the layout route through `onLogout`:

```ts
async function handleLogout() {
  await apiClient.executeMutation({
    mutationFn: logout
  });
}
```

Client-side logout cleanup is then handled through `handleClientLogout()` and the router event chain.

## Recommended Usage

- use `executeMutation()` for login and token refresh
- avoid introducing a separate store for authentication state
- keep route protection in the layout layer instead of repeating it on every page
