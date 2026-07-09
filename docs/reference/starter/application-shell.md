---
title: Application Shell
description: The internal root app, layout, login, and status-page components, and the options that configure them.
---

# Application Shell

The application shell — the root app, layout, login, and status pages — is **internal** to `@vef-framework-react/starter`. None of `App`, `BaseLayout`, `Layout`, `Login`, `AccessDenied`, `Error`, `NotFound`, `RouterProvider`, `ThemeConfigProvider`, or `NProgress` is exported from the package. They are assembled by `createApp()`, `createRouter()`, and the route-option helpers documented in [Bootstrap and Routing](./bootstrap-and-routing.md); this page documents the option shapes those functions accept.

Page-level containers (`Page`, `FlexCard`), form dialogs (`FormModal`, `FormDrawer`), table abstractions (`ProTable`), and the CRUD stack (`CrudPage`, `createCrudKit`, etc.) live in `@vef-framework-react/components` — see [Components / CRUD](../../components/crud.md).

## Root app

`createApp().render(props)` mounts the internal root component, which composes, in order:

`AppContextProvider` → `ApiClientProvider` → `MotionProvider` → `ThemeConfigProvider` → (`NProgress` + `RouterProvider`)

`render(props)` accepts:

| Prop | Type | Purpose |
| --- | --- | --- |
| `apiClient` | `ApiClient` | provided to `ApiClientProvider` |
| `appContext` | `AppContext` | provided to `AppContextProvider` (permissions, dictionaries, file base URL) |
| `router` | `Router` | the instance from `createRouter()`, provided to the internal router provider |
| `appVersionNotification` | `AppVersionNotificationOptions` | optional; wires `setupAppVersionNotification` |

## Layout

Assembled by `createLayoutRouteOptions()` and rendered for every authenticated route. Beyond `fetchUserInfo` / `beforeLoad` / `loader` (see [Bootstrap and Routing](./bootstrap-and-routing.md#createlayoutrouteoptions)), it forwards these display options straight through to the internal layout shell:

| Option | Type | Purpose |
| --- | --- | --- |
| `title` | `ReactNode` | shell title |
| `logo` | `ReactNode` | shell logo |
| `headerActions` | `ReactNode` | extra content in the header |
| `userMenuItems` | `UserMenuItem[]` | items appended to the user dropdown, before the built-in logout item |
| `onUserMenuClick` | `(key: string) => void` | called for clicks on any user menu item except the built-in `logout` key |
| `onLogout` | `() => Awaitable<void>` | logout callback |
| `apps` | `AppItem[]` | sub-applications shown in the app switcher; omit to hide it |
| `currentAppId` | `string` | id of the active app, highlighted in the switcher |
| `onAppChange` | `(appId: string) => Awaitable<void>` | called when the user picks a different app |

The internal layout shell is a two-layer composition: `Layout` (menu, user area, tab system, app switcher) wraps a lower-level `BaseLayout` (header/tabs/sidebar/footer regions). `BaseLayout` has no independent public configuration surface — it is only reachable through `Layout`.

## Login

Assembled by `createLoginRouteOptions(props)`, which renders the internal `Login` component with `props` (type `LoginProps`, exported for this purpose) and handles the redirect-aware login flow (`?redirect=` search param, skip-if-authenticated).

| Prop | Type | Purpose |
| --- | --- | --- |
| `logo` | `ReactNode` | brand mark in the corner |
| `title` | `string` | page title |
| `description` | `string` | subtitle |
| `publicKey` | `string` | enables RSA password encryption when present |
| `onLogin` | `(params: LoginParams) => Promise<LoginResult>` | login callback |
| `onResolveChallenge` | `(params: ResolveChallengeParams) => Promise<LoginResult>` | required together with `challengeRenderers` for backends that issue multi-step login challenges (e.g. TOTP, forced password change) |
| `challengeRenderers` | `LoginChallengeRenderers` | one renderer per challenge type; see `LoginChallengeRendererProps` for the props each renderer receives (`challenge`, `resolve`, `cancel`, `pending`, `error`, `encrypt`) |

`onResolveChallenge` and `challengeRenderers` are both-or-neither: a backend that never issues challenges omits both.

## Routing status pages

| Internal component | Wired by |
| --- | --- |
| `AccessDenied` | `createAccessDeniedRouteOptions()` |
| `Error` | `createRouter()` (`defaultErrorComponent`) and `createLayoutRouteOptions()` (`errorComponent`) |
| `NotFound` | `createRouter()` (`defaultNotFoundComponent`) and `createLayoutRouteOptions()` (`notFoundComponent`) |

None of the three take public configuration options.

## Route loading indicator

`NProgress` (a top-edge progress bar) is mounted automatically by the root app and driven by `createRouter()`'s `onBeforeLoad` / `onLoad` router events. It has no public configuration surface.
