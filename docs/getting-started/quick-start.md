---
title: Quick Start
description: Wire up Vite, the API client, the router, and a first route to get a minimal VEF application running.
---

# Quick Start

This page walks through a minimal but realistic VEF application skeleton. After reading it, the main application flow should be much easier to recognize:

1. how the application entry is written
2. how `apiClient` is created
3. how `router` is created
4. how pages access framework capabilities

## Minimal Running Flow

```mermaid
sequenceDiagram
    participant Main as main.ts
    participant Starter as createApp
    participant Router as createRouter
    participant API as createApiClient
    participant Page as Route Component

    Main->>API: createApiClient(...)
    Main->>Router: createRouter(...)
    Main->>Starter: createApp().render(...)
    Starter->>Router: RouterProvider
    Starter->>API: ApiClientProvider
    Router->>Page: render route component
    Page->>API: useQuery / useMutation
```

## Step 1: Configure Vite

```ts title="vite.config.ts"
import { defineViteConfig } from "@vef-framework-react/dev";

export default defineViteConfig({
  react: {
    useCompiler: true
  }
});
```

## Step 2: Create the API Client

The `createApiClient()` export from `starter` already wires token storage, unauthenticated handling, access-denied handling, and global message feedback.  
In most applications, only the HTTP-related configuration needs to be added.

```ts title="src/api/index.ts"
import { createApiClient } from "@vef-framework-react/starter";

export const apiClient = createApiClient({
  http: {
    // Injected from VEF_APP_API_BASE_URL by the dev plugin (see Configuration)
    baseUrl: __VEF_APP_CONFIG__.VEF_APP_API_BASE_URL,
    okCode: 0,
    tokenExpiredCode: 1002,
    timeout: 30_000,
    async refreshToken(tokens) {
      // JWT-mode backends return a refresh token; since v2.10.0 the field is
      // optional, so guard it before the exchange.
      if (!tokens.refreshToken) {
        throw new Error("No refresh token");
      }

      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: tokens.refreshToken })
      });

      return await response.json();
    }
  },
  query: {
    staleTime: 60_000,
    gcTime: 10 * 60_000
  }
});
```

`AuthTokens.refreshToken` is optional: backends that issue stateful opaque-token sessions (server-side sliding expiration) return no refresh token — on such a backend, omit the `refreshToken` callback entirely and expired sessions go straight to the unauthenticated flow.

## Step 3: Define Request Functions

VEF applications typically expose domain APIs through `apiClient.createQueryFn()` and `apiClient.createMutationFn()`.

```ts title="src/apis/auth.ts"
import type { AuthTokens } from "@vef-framework-react/core";
import type { LoginParams, UserInfo } from "@vef-framework-react/starter";

import { apiClient } from "../api";

export const login = apiClient.createMutationFn(
  "login",
  http => async (params: LoginParams) => {
    const result = await http.post<AuthTokens>("/api/login", {
      data: params
    });

    return {
      message: result.message,
      tokens: result.data
    };
  }
);

export const logout = apiClient.createMutationFn(
  "logout",
  http => () => http.post("/api/logout")
);

export const getUserInfo = apiClient.createQueryFn(
  "get_user_info",
  http => async () => {
    const result = await http.get<UserInfo>("/api/user/info");
    return result.data;
  }
);
```

## Step 4: Create the Root and Layout Routes

```ts title="src/pages/__root.ts"
import type { RouterContext } from "@vef-framework-react/starter";

import { createRootRouteWithContext } from "@tanstack/react-router";
import { createRootRouteOptions } from "@vef-framework-react/starter";

export const Route = createRootRouteWithContext<RouterContext>()(
  createRootRouteOptions({
    appTitle: "VEF Demo"
  })
);
```

```tsx title="src/pages/_layout/route.tsx"
import type { UserInfo } from "@vef-framework-react/starter";

import { createFileRoute } from "@tanstack/react-router";
import { createLayoutRouteOptions, INDEX_ROUTE_ID } from "@vef-framework-react/starter";

import { apiClient } from "../api";
import { getUserInfo, logout } from "../apis/auth";

async function handleLogout(): Promise<void> {
  await apiClient.executeMutation({
    mutationFn: logout
  });
}

function fetchUserInfo(): Promise<UserInfo> {
  return apiClient.fetchQuery({
    queryKey: [getUserInfo.key, { appId: "admin" }],
    queryFn: getUserInfo
  });
}

export const Route = createFileRoute(INDEX_ROUTE_ID)(
  createLayoutRouteOptions({
    title: "VEF Demo",
    onLogout: handleLogout,
    fetchUserInfo
  })
);
```

## Step 5: Create Login and Access-Denied Routes

```ts title="src/pages/_common/login.ts"
import { createFileRoute } from "@tanstack/react-router";
import { createLoginRouteOptions, LOGIN_ROUTE_ID } from "@vef-framework-react/starter";

import { apiClient } from "../api";
import { login } from "../apis/auth";

export const Route = createFileRoute(LOGIN_ROUTE_ID)(
  createLoginRouteOptions({
    onLogin: params => apiClient.executeMutation({ mutationFn: login, params })
  })
);
```

```ts title="src/pages/_common/access-denied.ts"
import { createFileRoute } from "@tanstack/react-router";
import { ACCESS_DENIED_ROUTE_ID, createAccessDeniedRouteOptions } from "@vef-framework-react/starter";

export const Route = createFileRoute(ACCESS_DENIED_ROUTE_ID)(
  createAccessDeniedRouteOptions()
);
```

## Step 6: Create the Router

```ts title="src/router/context.ts"
import type { RouterContext } from "@vef-framework-react/starter";

export const routerContext: RouterContext = {
  router: undefined!
};
```

```ts title="src/router/index.ts"
import { createRouter } from "@vef-framework-react/starter";

import { routeTree } from "./router.gen";
import { routerContext } from "./context";

const router = createRouter({
  history: "browser",
  routeTree,
  context: routerContext
});

export default router;
```

`src/router/router.gen.ts` is the route tree generated by the router plugin that `defineViteConfig` enables. It is created and kept up to date automatically while the dev server runs — never edit it by hand.

## Step 7: Render the Application

```ts title="src/main.ts"
import { createApp } from "@vef-framework-react/starter";

import { apiClient } from "./api";
import router from "./router";

createApp().render({
  apiClient,
  router,
  appContext: {
    hasPermission(token) {
      return token.startsWith("demo:");
    },
    codeSetQueryFn: undefined,
    fileBaseUrl: "/files"
  },
  appVersionNotification: {
    enabled: import.meta.env.PROD,
    checkInterval: 10 * 60
  }
});
```

`codeSetQueryFn` is the host's code set lookup (option lists keyed by strings such as `"sys.user.gender"`); leave it `undefined` until the backend exposes one — see [Code Sets](../guide/code-sets.md).

## Step 8: Add a Real Page

First, define a dashboard API query:

```ts title="src/apis/dashboard.ts"
import { apiClient } from "../api";

export const getDashboard = apiClient.createQueryFn(
  "get_dashboard",
  http => async () => {
    const result = await http.get<{ message: string }>("/api/dashboard");
    return result.data;
  }
);
```

Then wire it into a route:

```tsx title="src/pages/_layout/index/route.tsx"
import { createFileRoute } from "@tanstack/react-router";
import { Button, Card, Page, Text, Title } from "@vef-framework-react/components";
import { useQuery } from "@vef-framework-react/core";

import { getDashboard } from "../../../apis/dashboard";

export const Route = createFileRoute("/_layout/")({
  component: RouteComponent
});

function RouteComponent() {
  const dashboard = useQuery({
    queryKey: [getDashboard.key],
    queryFn: getDashboard
  });

  return (
    <Page margin>
      <Title level={3}>Home</Title>
      <Card>
        <Text>{dashboard.data?.message ?? "Welcome to VEF"}</Text>
        <Button type="primary">Start Building</Button>
      </Card>
    </Page>
  );
}
```

## Next Reading

The skeleton above renders a page, but it doesn't yet talk to a real list, form, or table. Continue with:

1. [Your First CRUD Page](./first-crud-page.md) — turn this skeleton into a working list-and-form page
2. [Configuration](./configuration.md)
3. [Project Structure](./project-structure.md)
4. [Routing & Layout](../guide/routing.md)
5. [Data Fetching](../guide/data-fetching.md)
