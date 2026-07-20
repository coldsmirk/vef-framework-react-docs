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
| `appContext` | `AppContext` | provided to `AppContextProvider` (permissions, code sets, file base URL) |
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

`AppItem` fields:

| Field | Type | Default | Purpose |
| --- | --- | --- | --- |
| `id` | `string` | required | stable identifier, handed back to `onAppChange` |
| `name` | `string` | required | display name |
| `description` | `string` | — | one-line description (shown as a tooltip) |
| `icon` | `ReactNode` | — | render-ready node, rendered as-is in the switcher tile (an `<img>`, a `DynamicIcon`, …) — not an icon *name*; see the v2.5.0 release note |

The internal layout shell is a two-layer composition: `Layout` (menu, user area, tab system, app switcher) wraps a lower-level `BaseLayout` (header/tabs/sidebar/footer regions). `BaseLayout` has no independent public configuration surface — it is only reachable through `Layout`.

## Login

Assembled by `createLoginRouteOptions(props)`, which renders the internal `Login` component with `props` (type `LoginProps`, exported for this purpose) and handles the redirect-aware login flow (`?redirect=` search param, skip-if-authenticated).

| Prop | Type | Purpose |
| --- | --- | --- |
| `logo` | `ReactNode` | brand mark in the corner |
| `title` | `string` | page title |
| `description` | `string` | subtitle |
| `publicKey` | `string` | enables RSA encryption of credentials (and sensitive challenge responses via `encrypt`) when present |
| `onLogin` | `(params: LoginParams) => Promise<LoginResult>` | login callback |
| `onResolveChallenge` | `(params: ResolveChallengeParams) => Promise<LoginResult>` | required together with `challengeRenderers` for backends that issue multi-step login challenges (e.g. TOTP, forced password change) |
| `challengeRenderers` | `LoginChallengeRenderers` | one renderer per challenge type |

`onResolveChallenge` and `challengeRenderers` are both-or-neither: a backend that never issues challenges omits both. `LoginProps` enforces this at the type level.

### Login challenges

The challenge pipeline lives entirely inside the internal `Login` component:

1. `onLogin` returns a `LoginResult`. When it carries `challenge` + `challengeToken` instead of `tokens`, the credentials form is swapped for the renderer registered under `challengeRenderers[challenge.type]`.
2. The renderer calls `resolve(response)`; the Login component forwards it as `onResolveChallenge({ challengeToken, type, response })`. The returned `LoginResult` either completes authentication (`tokens` — the store is updated and the `?redirect=` navigation runs) or chains the next challenge.
3. A rejected `resolve` keeps the challenge on screen and surfaces the error message through the renderer's `error` prop (a `BusinessError` message verbatim; anything else falls back to a generic prompt). The error clears automatically on the next `resolve` and on cancel.
4. `cancel()` discards the held challenge token and returns to the credentials form — the user must log in again.
5. A challenge type with no registered renderer shows a built-in "unsupported challenge" notice with a back-to-login button.

Each renderer is a `LoginChallengeRenderer` — a plain render function receiving `LoginChallengeRendererProps` (parameterised by `K`, the challenge type the renderer is bound to):

| Prop | Type | Purpose |
| --- | --- | --- |
| `challenge` | `Extract<LoginChallenge, { type: K }>` | the pending challenge: `type`, challenge-specific `data`, and `required` |
| `resolve` | `(response: ResolvedChallenges[K]["response"]) => Promise<void>` | submit the user's answer; resolves once the resulting `LoginResult` has been applied |
| `cancel` | `() => void` | abandon the challenge and return to the credentials form |
| `pending` | `boolean` | whether a `resolve` call is in flight (disable submit buttons) |
| `error` | `string \| null \| undefined` | message from the most recent failed `resolve`, for inline display |
| `encrypt` | `((plaintext: string) => string) \| undefined` | present only when `publicKey` is configured; encrypts sensitive responses with the same scheme as the credentials. May throw — catch in the submit handler |

When a project augments `Register['challenges']` (see [Stores and Types](./stores-and-types.md#extending-userinfodetails)), `challenge.data` and the `resolve` argument narrow per challenge type, and `LoginChallengeRenderers` enforces exhaustiveness — every declared challenge type must have a renderer.

### Built-in renderer: `PasswordChangeChallenge`

The starter ships one built-in renderer, for the backend's forced password-change challenge. Exports:

| Export | Kind | Purpose |
| --- | --- | --- |
| `PasswordChangeChallenge` | component | the renderer: collects and confirms the new password, validates locally (both fields non-empty and matching), encrypts through `encrypt` when present, and surfaces resolve failures (e.g. a password-policy violation) and local validation errors inline |
| `PASSWORD_CHANGE_CHALLENGE_TYPE` | `"password_change"` constant | the challenge type identifier, aligned with the backend's `security.ChallengeTypePasswordChange` |
| `PasswordChangeChallengeData` | type | the challenge `data` payload: `{ reason: PasswordChangeReason; meta?: Record<string, unknown> }` |
| `PasswordChangeReason` | `LiteralUnion<"first_login" \| "expired", string>` | why the change is forced; the two literals are the backend's predefined reasons and drive a reason-specific subtitle, any other string falls back to a generic one |
| `PasswordChangeChallengeSpec` | type | the `Register['challenges']` entry: `{ data: PasswordChangeChallengeData; response: string }` — the response is the new password, encrypted when a `publicKey` is configured, plaintext otherwise |
| `PasswordChangeChallengeProps` | type | the component's props (below) |

`PasswordChangeChallengeProps` — shaped to stay assignable to `LoginChallengeRenderers` entries both with and without a `Register['challenges']` augmentation (`challenge.data` stays wide; `resolve` stays narrow):

| Prop | Type | Default | Purpose |
| --- | --- | --- | --- |
| `challenge` | `{ data?: unknown }` | required | the server-provided `PasswordChangeChallengeData`; treated as untrusted wire data and read defensively |
| `resolve` | `(response: string) => Promise<void>` | required | submits the (possibly encrypted) new password |
| `cancel` | `() => void` | required | back to the credentials form; disabled while `pending` |
| `pending` | `boolean` | required | in-flight state of the resolve call |
| `error` | `string \| null` | `undefined` | resolve failure shown inline (alongside local validation errors) |
| `encrypt` | `(plaintext: string) => string` | `undefined` | provided by the Login component when a `publicKey` is configured; the new password is encrypted before submission |

Wiring it up is the host's job — the renderer is exported, not auto-registered:

```tsx title="src/pages/_common/login.tsx"
import { createFileRoute } from "@tanstack/react-router";
import {
  createLoginRouteOptions,
  LOGIN_ROUTE_ID,
  PASSWORD_CHANGE_CHALLENGE_TYPE,
  PasswordChangeChallenge,
  type LoginChallengeRenderers
} from "@vef-framework-react/starter";

const challengeRenderers: LoginChallengeRenderers = {
  [PASSWORD_CHANGE_CHALLENGE_TYPE]: PasswordChangeChallenge
};

export const Route = createFileRoute(LOGIN_ROUTE_ID)(
  createLoginRouteOptions({
    onLogin: handleLogin,
    onResolveChallenge: handleResolveChallenge,
    challengeRenderers
  })
);
```

```ts title="src/types/augmentation.ts"
import type { PASSWORD_CHANGE_CHALLENGE_TYPE, PasswordChangeChallengeSpec } from "@vef-framework-react/starter";

declare module "@vef-framework-react/starter" {
  interface Register {
    challenges: {
      [PASSWORD_CHANGE_CHALLENGE_TYPE]: PasswordChangeChallengeSpec;
    };
  }
}
```

To extend the set, add project-defined renderer components under their own challenge types (each receives `LoginChallengeRendererProps`); to replace the built-in UI, register a different renderer under `PASSWORD_CHANGE_CHALLENGE_TYPE`.

## Routing status pages

| Internal component | Wired by |
| --- | --- |
| `AccessDenied` | `createAccessDeniedRouteOptions()` |
| `Error` | `createRouter()` (`defaultErrorComponent`) and `createLayoutRouteOptions()` (`errorComponent`) |
| `NotFound` | `createRouter()` (`defaultNotFoundComponent`) and `createLayoutRouteOptions()` (`notFoundComponent`) |

None of the three take public configuration options.

## Route loading indicator

`NProgress` (a top-edge progress bar) is mounted automatically by the root app and driven by `createRouter()`'s `onBeforeLoad` / `onLoad` router events. It has no public configuration surface.
