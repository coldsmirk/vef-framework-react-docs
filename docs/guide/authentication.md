---
title: Authentication
description: How login, the two session styles (JWT refresh vs opaque tokens), login challenges, and logout are wired through createApiClient and the starter route helpers.
---

# Authentication

Authentication in VEF mainly involves three parts:

1. `createApiClient()` manages tokens and the 401 behavior
2. `createLoginRouteOptions()` defines the login route (including multi-step login challenges)
3. `createLayoutRouteOptions()` protects authenticated application areas

The third part — how the layout route guards pages and loads menus — is covered in [Routing & Layout](./routing.md); this page focuses on login, sessions, and logout.

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

`onLogin` resolves to a `LoginResult`. When it carries `tokens`, the built-in `Login` component finishes the flow:

1. writes authenticated state (`isAuthenticated`, `authTokens`) into `useAppStore`
2. invalidates the router
3. navigates to the `redirect` search param (default: the index route)
4. shows a success notification

When the result carries a `challenge` instead, the flow pauses — see [Login Challenges](#login-challenges) below.

## Two Session Styles

`AuthTokens` — the shape stored in `useAppStore` and consumed by the HTTP layer — is `{ accessToken: string; refreshToken?: string }`. The optional `refreshToken` is deliberate: VEF backends issue sessions in one of two styles, and the client wiring differs.

:::warning[Breaking change in v2.10.0]

`AuthTokens.refreshToken` changed from required to optional. If your code reads `tokens.refreshToken` directly (custom refresh calls, token persistence), it must now handle `undefined`.

:::

### JWT sessions (access + refresh token)

The backend returns both tokens; the access token expires on a timer and is renewed via a refresh round-trip. Configure both `tokenExpiredCode` and `refreshToken` on the client:

```ts
const apiClient = createApiClient({
  http: {
    baseUrl: "/api",
    tokenExpiredCode: 1002,
    async refreshToken(tokens) {
      // tokens are the current AuthTokens; return the new pair.
      return await apiClient.executeMutation({
        mutationFn: refreshAuth,
        params: tokens
      });
    }
  }
});
```

**What the HTTP client does on 401:** when the response's business code matches `tokenExpiredCode`, it runs *one* shared refresh — concurrent requests queue behind that single refresh instead of firing one each — then retries the original request(s) with the new access token. If the refresh itself fails (or a 401 arrives while a refresh is already the one failing), the client gives up, shows "登录已过期" feedback, and triggers `onUnauthenticated`, which the starter bridges to the router's back-to-login redirect.

### Opaque-token sessions (access token only)

The backend returns only an `accessToken` — an opaque handle to server-side session state with sliding expiration. There is nothing to refresh from the client, so do **not** configure `refreshToken` (or `tokenExpiredCode`):

```ts
const apiClient = createApiClient({
  http: {
    baseUrl: "/api"
    // no tokenExpiredCode, no refreshToken — the server slides the session
  }
});
```

**What the HTTP client does on 401:** with no `tokenExpiredCode` to match (and no refresh configured), any 401 goes straight to `onUnauthenticated` — the user is sent back to login. That is the correct behavior for this style: a 401 means the server-side session is gone, and no client-side action can revive it.

Everything else — Bearer-header injection from `getAuthTokens`, the push channel's token query parameter, logout cleanup — works identically in both styles. See [HTTP and API Client](../reference/core/http-and-api.md) for the full token-refresh contract.

## Login Challenges

Some backends do not finish login in one step: they respond with a *challenge* the user must complete first — a forced password change, TOTP, a department selection. The starter's `Login` component has a built-in pipeline for this.

### The pipeline

`LoginResult` is the protocol. Each `onLogin` / `onResolveChallenge` call returns either tokens (done) or the next challenge:

```ts
interface LoginResult {
  message?: string;
  tokens?: AuthTokens;          // set when authentication completed
  challengeToken?: string;      // set with `challenge`: carries intermediate state
  challenge?: LoginChallenge;   // the pending challenge ({ type, data, required })
}
```

When a result carries a challenge, the `Login` component looks up the renderer registered for `challenge.type` in `challengeRenderers` and swaps the credentials form for it. The renderer receives:

- `challenge` — the type identifier and challenge-specific `data` to display
- `resolve(response)` — submits the user's answer; the component calls your `onResolveChallenge({ challengeToken, type, response })` and applies the resulting `LoginResult` (next challenge, or tokens and navigation)
- `cancel()` — abandons the challenge and returns to the credentials form (the challenge token is discarded; the user logs in again)
- `pending` — whether a `resolve` call is in flight (disable the submit button)
- `error` — the message from the most recent failed `resolve` (e.g. a rejected password); cleared on the next attempt and on cancel
- `encrypt(plaintext)` — present only when the login page received a `publicKey`; encrypts sensitive responses with the same RSA scheme as the credentials

If a challenge arrives whose type has no registered renderer, the component shows a built-in "unsupported challenge" warning with a back-to-login button — it never renders a broken screen.

### Wiring challenges

`onResolveChallenge` and `challengeRenderers` are required together (a server that can issue challenges needs both a transport and a presenter):

```tsx
import type { LoginChallengeRenderers, ResolveChallengeParams } from "@vef-framework-react/starter";

import {
  createLoginRouteOptions,
  PASSWORD_CHANGE_CHALLENGE_TYPE,
  PasswordChangeChallenge
} from "@vef-framework-react/starter";

const challengeRenderers: LoginChallengeRenderers = {
  [PASSWORD_CHANGE_CHALLENGE_TYPE]: PasswordChangeChallenge
};

export const Route = createFileRoute(LOGIN_ROUTE_ID)(
  createLoginRouteOptions({
    publicKey: RSA_PUBLIC_KEY,
    onLogin: params => apiClient.executeMutation({ mutationFn: login, params }),
    onResolveChallenge: (params: ResolveChallengeParams) =>
      apiClient.executeMutation({ mutationFn: resolveChallenge, params }),
    challengeRenderers
  })
);
```

### The built-in `password_change` renderer

The starter ships one renderer out of the box: `PasswordChangeChallenge`, for the backend's forced password-change challenge (type `"password_change"`, exported as `PASSWORD_CHANGE_CHALLENGE_TYPE`). It collects and confirms the new password, encrypts it via `encrypt` when a `publicKey` is configured, surfaces resolve failures (e.g. a password-policy violation) inline, and adapts its subtitle to the server-provided reason (`first_login`, `expired`, or a host-defined string).

### Typing the challenge registry

Augment `Register['challenges']` in the starter package so the renderer registry is exhaustive (every declared challenge type must have a renderer) and each renderer's `challenge.data` / `resolve` payloads are narrowed. The built-in renderer ships a matching spec type:

```ts
import type { PASSWORD_CHANGE_CHALLENGE_TYPE, PasswordChangeChallengeSpec } from "@vef-framework-react/starter";

declare module "@vef-framework-react/starter" {
  interface Register {
    challenges: {
      [PASSWORD_CHANGE_CHALLENGE_TYPE]: PasswordChangeChallengeSpec;
      // Custom challenge types follow the same { data; response } spec shape:
      totp: { response: string };
    };
  }
}
```

Writing a renderer for a custom type is a plain component that consumes the props above — the framework imposes no chrome, so it can match the login page's look freely. The full prop shapes (`LoginProps`, `LoginChallengeRendererProps`, `LoginChallengeRenderers`) are documented in [Application Shell](../reference/starter/application-shell.md).

## Logout

The remote logout action is typically implemented as a mutation and passed into the layout route through `onLogout`:

```ts
async function handleLogout() {
  await apiClient.executeMutation({
    mutationFn: logout
  });
}
```

Client-side logout cleanup — clearing `useAppStore`, navigating back to the login route, and invalidating the router — is then handled through `handleClientLogout()` and the router event chain, so page code does not need to reset authentication state manually. If the app uses the [server push channel](./server-push.md), also `close()` the push client on logout.

## Login and Token-Refresh Requests Skip Auth Headers

Login and token-refresh endpoints usually need to skip automatic auth headers, since there is no valid token yet:

```ts
import { skipAuthenticationHeader, skipAuthenticationValue } from "@vef-framework-react/core";

headers: {
  [skipAuthenticationHeader]: skipAuthenticationValue
}
```

## Recommended Usage

- use `executeMutation()` for login, challenge resolution, and token refresh
- match the client config to the backend's session style — configuring `refreshToken` against an opaque-token backend just delays the inevitable re-login
- avoid introducing a separate store for authentication state — `useAppStore` already owns it
- keep route protection in the layout layer instead of repeating it on every page (see [Routing & Layout](./routing.md))
