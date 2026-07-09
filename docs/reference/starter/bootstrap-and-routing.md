---
title: Bootstrap and Routing
description: createApp, createApiClient, createRouter, and the route-option helper signatures.
---

# Bootstrap and Routing

## `createApp`

```ts
function createApp(options?: { strictMode?: boolean; useRouterContext?: UseRouterContext }): {
  render: (props: { apiClient: ApiClient; appContext: AppContext; router: Router; appVersionNotification?: AppVersionNotificationOptions }) => void;
  unmount: () => void;
};
```

Creates an application instance. `render()` mounts the (internal) application root into `#root`; `unmount()` tears it down.

Typical cases:

- the main application entry in `main.tsx`
- controlled render and unmount in isolated environments (e.g. micro-frontend hosts, tests)

## `createApiClient`

```ts
function createApiClient(options: {
  http: Pick<HttpClientOptions, "baseUrl" | "timeout" | "okCode" | "tokenExpiredCode" | "refreshToken">;
  query?: Pick<QueryClientOptions, "gcTime" | "staleTime">;
}): ApiClient;
```

Extends `core.createApiClient()` with token storage (backed by `useAppStore`), unauthenticated handling, access-denied handling, and global message feedback (info/warning/error/success) wired to the components package's notification helpers.

## `createRouter`

```ts
function createRouter<TRouteTree>(options: {
  history: "hash" | "browser";
  routeTree: TRouteTree;
  context: RouterContext;
}): Router;
```

Creates the VEF-flavored TanStack Router instance. It also wires route-progress events (`nProgressEventEmitter`), fallback pending/error/not-found components, and event-driven unauthenticated / access-denied handling (navigates on `emitUnauthenticated` / `emitAccessDenied`).

## `createRootRouteOptions`

```ts
function createRootRouteOptions(props: { appTitle: string }): RouteOptions;
```

Root-route helper focused on document-title behavior (`${appTitle} | ${activeMenuName}`).

## `createLayoutRouteOptions`

```ts
function createLayoutRouteOptions<TBeforeLoadContext = {}, TLoaderData = void>(options: {
  fetchUserInfo: () => Awaitable<UserInfo>;
  beforeLoad?: (args: LayoutBeforeLoadArgs) => Awaitable<TBeforeLoadContext | void>;
  loader?: (args: LayoutLoaderArgs<TBeforeLoadContext>) => Awaitable<TLoaderData>;
  // plus the layout's own display options: title, logo, headerActions, userMenuItems,
  // onUserMenuClick, onLogout, apps, currentAppId, onAppChange — see Application Shell
}): RouteOptions;
```

Layout-route helper for:

- authenticated application areas (redirects to the login route when not authenticated)
- menu loading and permission-aware navigation (`fetchUserInfo` populates `useAppStore`; unmapped routes redirect to the access-denied route)
- logout and user-menu wiring, passed straight through to the internal layout shell

## `createLoginRouteOptions`

```ts
function createLoginRouteOptions(props: LoginProps): RouteOptions;
```

Login-route helper that handles redirect-aware login flow (`?redirect=` search param, skips the login page when already authenticated). `props` is the same shape the internal `Login` component renders with — see [Application Shell](./application-shell.md#login).

## `createAccessDeniedRouteOptions`

```ts
function createAccessDeniedRouteOptions(): RouteOptions;
```

Access-denied-route helper for unauthorized entry behavior (navigates back or to the index route).

## Event Helpers

- `dispatchCustomEvent<T>(type: string, options?: CustomEventInit<T>): boolean` — dispatches a `document`-level `CustomEvent`.
- `emitAccessDenied(): void` — signals the access-denied event that `createRouter` listens for.
- `emitUnauthenticated(): void` — signals the unauthenticated event that `createRouter` listens for.
- `handleClientLogout(router): void` — clears auth state and redirects to the login route.

## Route Constants

- `LOGIN_ROUTE_PATH` / `LOGIN_ROUTE_ID`
- `INDEX_ROUTE_PATH` / `INDEX_ROUTE_ID`
- `ACCESS_DENIED_ROUTE_PATH` / `ACCESS_DENIED_ROUTE_ID`
