---
title: Bootstrap and Routing
description: createApp, createApiClient, createRouter, and the route-option helper signatures.
---

# Bootstrap and Routing

## `createApp`

```ts
function createApp(options?: { strictMode?: boolean; useRouterContext?: UseRouterContext }): {
  render: (props: { apiClient: ApiClient; appContext: AppContext; router: Router; appVersionNotification?: AppVersionNotificationOptions; components?: ComponentDefaults; defaultTheme?: DefaultTheme }) => void;
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
  http: Pick<HttpClientOptions, "baseUrl" | "timeout" | "okCode" | "tokenExpiredCode" | "refreshToken" | "protectedBodyEncoding">;
  query?: Pick<QueryClientOptions, "gcTime" | "staleTime">;
}): ApiClient;
```

Extends `core.createApiClient()` with token storage (backed by `useAppStore`), unauthenticated handling, access-denied handling, and global message feedback (info/warning/error/success) wired to the components package's notification helpers.

## `createRouter`

```ts
interface RouterOptions<TRouteTree> {
  history: "hash" | "browser";
  routeTree: TRouteTree;
  context: RouterContext;
}

function createRouter<TRouteTree>(options: RouterOptions<TRouteTree>): Router;
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
type LoginRouteOptions =
  | (LoginProps & { component?: never })                                   // the framework's page
  | (Partial<Record<keyof LoginProps, never>> & { component: () => ReactNode }); // the application's own page

function createLoginRouteOptions(options: LoginRouteOptions): RouteOptions;
```

Login-route helper that handles redirect-aware login flow (`?redirect=` search param, skips the login page when already authenticated). Either pass the props the `Login` component renders with — see [Application Shell](./application-shell.md#login) — or `{ component }` to replace the page while keeping the route's redirect contract and already-authenticated guard. The custom component calls `useLoginFlow` itself.

The two members are exclusive by type: the custom-page member forbids every `LoginProps` key explicitly, because excess-property checking catches an inline object literal but not a pre-built value, where surplus props would be dropped in silence.

## `createSsoRouteOptions`

```ts
type SsoRouteOptions =
  | (SsoLoginProps & { component?: never })
  | (Partial<Record<keyof SsoLoginProps, never>> & { component: () => ReactNode });

function createSsoRouteOptions(options: SsoRouteOptions): RouteOptions;
```

Single-sign-on route helper for `/sso`. By default it renders `SsoLogin`; pass `{ component }` for a custom landing page that calls `useSsoLogin`. The route passes the gateway's query parameters through and deliberately does not bounce an already-authenticated visitor, because the handoff may name a different user. The two members are exclusive by type, as on the login route.

## `createAccessDeniedRouteOptions`

```ts
function createAccessDeniedRouteOptions(): RouteOptions;
```

Access-denied-route helper for unauthorized entry behavior (navigates back or to the index route).

## Event Helpers

- `dispatchCustomEvent<T>(type: string, options?: CustomEventInit<T>): boolean` — dispatches a `document`-level `CustomEvent`.
- `emitAccessDenied(): void` — signals the access-denied event that `createRouter` listens for.
- `emitUnauthenticated(): void` — signals the unauthenticated event that `createRouter` listens for.
- `clearIdentityState(): void` — drops the identity loaded for the previous session while leaving authentication state untouched; call it when a new session is established over an existing one, as a trust-login handoff can do.
- `handleClientLogout(router): void` — clears auth state and redirects to the login route.

## `setupAppVersionNotification`

```ts
function setupAppVersionNotification(options?: AppVersionNotificationOptions): (() => void) | undefined;
```

Polls the deployed `index.html` for a newer `<meta name="app-version">` (the value injected from `VEF_APP_VERSION` — see [Dev Package](../dev/overview.md#runtime-injected-vef_app_)) and shows a sticky update notification when the fetched version compares greater than the running one. When the page declares `<meta name="app-changelog">`, the changelog JSON (an `AppChangelog[]`) is fetched and the entry matching the new version is rendered into the notification. Polling pauses while the tab is hidden and re-checks immediately on return.

Returns a cleanup function that stops polling, or `undefined` when `enabled` is `false`. It is wired automatically by `createApp().render({ appVersionNotification })`; call it manually only outside that path.

`AppVersionNotificationOptions` fields:

| Option | Type | Default | Purpose |
| --- | --- | --- | --- |
| `enabled` | `boolean` | `false` | Master switch; the setup is a no-op (returns `undefined`) when off |
| `basePath` | `string` | `"/"` | Base path the deployed `index.html` and changelog JSON are fetched from (cache-busted) |
| `checkInterval` | `number` | `60` | Polling interval in **seconds**; `0` disables the timer (checks then only happen on tab-visibility changes) |
| `title` | `ReactNode` | built-in Chinese text | Notification title; the detected version is appended |
| `description` | `ReactNode` | built-in Chinese text | Leading notification body text |
| `confirmText` | `ReactNode` | built-in Chinese text | Confirm button label |
| `cancelText` | `ReactNode` | built-in Chinese text | Cancel button label |
| `onConfirm` | `() => void` | `location.reload()` | Confirm handler |
| `onCancel` | `() => void` | — | Cancel handler, called after the notification closes |

`AppChangelog` fields (one entry per released version in the changelog JSON):

| Field | Type | Default | Purpose |
| --- | --- | --- | --- |
| `version` | `string` | required | Version this entry describes; matched against the newly detected version |
| `date` | `string` | — | Release date, shown in the notification footer |
| `description` | `string` | — | Highlighted release summary |
| `changes` | `string[]` | — | Bullet list of changes |

## Route Constants

- `LOGIN_ROUTE_PATH` / `LOGIN_ROUTE_ID`
- `INDEX_ROUTE_PATH` / `INDEX_ROUTE_ID`
- `ACCESS_DENIED_ROUTE_PATH` / `ACCESS_DENIED_ROUTE_ID`
