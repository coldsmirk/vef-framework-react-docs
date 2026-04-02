---
sidebar_position: 2
title: Quick Start
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
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    okCode: 0,
    tokenExpiredCode: 1002,
    timeout: 30_000,
    async refreshToken(tokens) {
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

## Step 3: Define Request Functions

VEF applications typically expose domain APIs through `apiClient.createQueryFn()` and `apiClient.createMutationFn()`.

```ts title="src/apis/auth.ts"
import type { AuthTokens } from "@vef-framework-react/core";
import type { LoginParams } from "@vef-framework-react/starter";

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
```

## Step 4: Create the Root and Layout Routes

```tsx title="src/pages/__root.tsx"
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

```tsx title="src/pages/_common/login.tsx"
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

```tsx title="src/pages/_common/access-denied.tsx"
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

import { routeTree } from "./routeTree.gen";
import { routerContext } from "./context";

const router = createRouter({
  history: "browser",
  routeTree,
  context: routerContext
});

export default router;
```

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
    dataDictQueryFn: undefined,
    fileBaseUrl: "/files"
  },
  appVersionNotification: {
    enabled: import.meta.env.PROD,
    checkInterval: 10 * 60
  }
});
```

## Step 8: Add a Real Page

```tsx title="src/pages/_layout/index/route.tsx"
import { createFileRoute } from "@tanstack/react-router";
import { Button, Card, Text } from "@vef-framework-react/components";
import { useQuery } from "@vef-framework-react/core";
import { Page } from "@vef-framework-react/components";

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
    <Page title="Home">
      <Card>
        <Text>{dashboard.data?.message ?? "Welcome to VEF"}</Text>
        <Button type="primary">Start Building</Button>
      </Card>
    </Page>
  );
}
```

## Next Reading

Continue with:

1. [Project Structure](./project-structure.md)
2. [Configuration](./configuration.md)
3. [Routing](../guide/routing.md)
4. [API Integration](../guide/api-integration.md)
