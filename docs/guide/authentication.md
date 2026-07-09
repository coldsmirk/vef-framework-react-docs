---
title: Authentication
description: How login, token refresh, and logout are wired through createApiClient and the starter route helpers.
---

# Authentication

Authentication in VEF mainly involves three parts:

1. `createApiClient()` manages tokens and refresh logic
2. `createLoginRouteOptions()` defines the login route
3. `createLayoutRouteOptions()` protects authenticated application areas

The third part — how the layout route guards pages and loads menus — is covered in [Routing & Layout](./routing.md); this page focuses on login, token refresh, and logout.

## Wiring the Login Page

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { createLoginRouteOptions, LOGIN_ROUTE_ID } from "@vef-framework-react/starter";

import { apiClient } from "../../api";
import { login } from "../../apis/auth";

export const Route = createFileRoute(LOGIN_ROUTE_ID)(
  createLoginRouteOptions({
    onLogin: params => apiClient.executeMutation({ mutationFn: login, params })
  })
);
```

## What Happens After Login Succeeds

The built-in `Login` component from `starter` performs the following steps after `onLogin` resolves:

1. writes authenticated state (`isAuthenticated`, `authTokens`) into `useAppStore`
2. invalidates the router
3. navigates to `redirect` or the index route
4. shows a success notification

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

When a request fails with `tokenExpiredCode`, the underlying `HttpClient` refreshes the token once and queues concurrent requests behind that single refresh instead of firing one refresh per failed request. See [HTTP and API Client](../reference/core/http-and-api.md) for the full token-refresh contract.

## Logout

The remote logout action is typically implemented as a mutation and passed into the layout route through `onLogout`:

```ts
async function handleLogout() {
  await apiClient.executeMutation({
    mutationFn: logout
  });
}
```

Client-side logout cleanup — clearing `useAppStore`, navigating back to the login route, and invalidating the router — is then handled through `handleClientLogout()` and the router event chain, so page code does not need to reset authentication state manually.

## Login and Token-Refresh Requests Skip Auth Headers

Login and token-refresh endpoints usually need to skip automatic auth headers, since there is no valid token yet:

```ts
import { skipAuthenticationHeader, skipAuthenticationValue } from "@vef-framework-react/core";

headers: {
  [skipAuthenticationHeader]: skipAuthenticationValue
}
```

## Recommended Usage

- use `executeMutation()` for login and token refresh
- avoid introducing a separate store for authentication state — `useAppStore` already owns it
- keep route protection in the layout layer instead of repeating it on every page (see [Routing & Layout](./routing.md))
