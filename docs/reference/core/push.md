---
title: Server Push
description: PushClient for the VEF server push channel — constructor options, connection lifecycle, reconnect behavior, subscribe contract, and every push type.
---

# Server Push

`@vef-framework-react/core` provides a client for the VEF server push channel (`vef.push`) — a WebSocket connection the backend uses to push messages **downstream only**. Delivery is best-effort by the server contract: treat push messages as the real-time hint, and keep reliable state behind the regular API (refetch on notification rather than trusting the payload as the source of truth).

For the React subscription adapter, see [`usePushMessage`](../hooks/vef-hooks.md#server-push-hook) in `@vef-framework-react/hooks`. For the narrative walkthrough (backend setup, message design), see [Server Push](../../guide/server-push.md). For how this channel differs from the SSE client, see [SSE vs Push](./sse-motion-dnd-immer.md#sse-vs-push).

## `PushClient`

```ts
import { PushClient } from "@vef-framework-react/core";

const pushClient = new PushClient({
  url: "/ws",
  getAuthTokens: () => tokenStore.getTokens(),
  onSessionInvalid: () => authStore.logout(),
  onConnectionRejected: () => notification.warning("Too many active connections"),
  onStatusChange: status => console.log("[push]", status)
});
```

Constructing the client does not open a connection — call [`connect()`](#connect) to start.

### `PushClientOptions`

All fields are optional; `new PushClient()` is valid.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `url` | `string` | `"/ws"` | Push endpoint URL. Accepts `ws(s)://` or `http(s)://` (converted to `ws(s)://`), absolute or relative (resolved against the current origin). |
| `getAuthTokens` | `() => Awaitable<Readonly<Pick<AuthTokens, "accessToken">> \| undefined>` | — | Retrieves auth tokens. The access token rides the `__accessToken` query parameter — a browser WebSocket cannot set an `Authorization` header — and is re-read on **every** (re)connect attempt, so a refreshed token is picked up automatically. When omitted (or no `accessToken` is returned), the connection is opened without a token. |
| `reconnect` | `PushReconnectOptions` | — | Reconnect backoff configuration (see below). |
| `onSessionInvalid` | `(event: CloseEvent) => void` | — | Called when the server closes with code `4401` (session revoked or expired). The client will not reconnect; route the user to the logged-out flow. |
| `onConnectionRejected` | `(event: CloseEvent) => void` | — | Called when the server refuses the connection with code `4429` (per-user connection cap). The client will not retry automatically. |
| `onStatusChange` | `(status: PushStatus) => void` | — | Observes connection status transitions. Only fires on actual changes (same-status updates are deduplicated). |

### `PushReconnectOptions`

Only transport-level failures reconnect; terminal close codes (`4401` / `4429`) and an explicit `close()` never do.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `enabled` | `boolean` | `true` | Whether to reconnect after a transport-level loss. |
| `initialDelay` | `number` | `1000` | First retry delay in milliseconds; doubles per attempt. |
| `maxDelay` | `number` | `30000` | Upper bound for the retry delay in milliseconds. |

### Connection Lifecycle

The client moves through the [`PushStatus`](#pushstatus) states as follows:

1. **`"idle"`** — constructed, never connected.
2. **`"connecting"`** — `connect()` was called: the endpoint is resolved to an absolute WebSocket URL, `getAuthTokens` is awaited, and the socket is opened with the access token in the `__accessToken` query parameter.
3. **`"open"`** — the socket opened; the reconnect attempt counter resets to `0`.
4. **`"reconnecting"`** — the connection was lost at the transport level and a retry is scheduled (see below).
5. **`"closed"`** — terminal for this session: reached via `close()`, a terminal close code (`4401` / `4429`), or a transport loss with `reconnect.enabled: false`. `connect()` may be called again to start a new session.

Reconnect behavior, as implemented:

- Each retry waits `min(maxDelay, initialDelay * 2 ** attempts)` plus up to 30% random jitter (so a fleet of clients does not reconnect in lockstep after a server restart).
- The attempt counter increments per retry and resets to `0` once a connection opens.
- Every reconnect attempt re-reads `getAuthTokens`, so a token refreshed in the meantime is used.
- There is no client-side heartbeat: liveness is delegated to the server side and the WebSocket close event. The client reacts to `close` — it does not send pings.

Incoming frames are dispatched as follows: non-string frames are ignored; string frames that fail `JSON.parse`, or whose `type` is not a non-empty string, are dropped with a `[vef-push]` console warning. Valid envelopes are delivered to every handler subscribed to `message.type`, then to every `"*"` handler.

### Instance API

| Member | Type | Description |
| --- | --- | --- |
| `status` | `PushStatus` (getter) | Current connection status. |
| `connect()` | `() => void` | Opens the connection. Safe to call repeatedly — it is a no-op unless status is `"idle"` or `"closed"` (an active session is kept). Resets the reconnect attempt counter. |
| `close()` | `() => void` | Closes the connection and stops reconnecting (the logout path). Cancels any pending reconnect timer, closes the socket, and settles at `"closed"`. |
| `subscribe(type, handler)` | `<TPayload = unknown>(type: string, handler: PushMessageHandler<TPayload>) => () => void` | Subscribes a handler to messages of one envelope type; see below. |

#### `connect()`

Opening is asynchronous (the token read is awaited), but `connect()` itself returns synchronously. If `close()` is called while the token is still being fetched, the pending open is abandoned.

#### `subscribe`

```ts
const unsubscribe = pushClient.subscribe<OrderStatusPayload>(
  "order.status_changed",
  message => {
    console.log(message.id, message.time, message.payload);
  }
);

// Wildcard: receives every message regardless of type
const unsubscribeAll = pushClient.subscribe("*", message => {
  console.log("push:", message.type);
});

unsubscribe();
```

Contract:

- Handlers are keyed by envelope `type`. The special type `"*"` receives **every** message; for a given message, type-specific handlers run before `"*"` handlers.
- Multiple handlers may subscribe to the same type; each is held in a set, so subscribing the same function twice registers it once.
- Subscribing is independent of the connection lifecycle — you can subscribe before `connect()` and subscriptions survive reconnects and `close()`/`connect()` cycles.
- The return value is the unsubscribe function. Calling it removes only that handler; when the last handler of a type unsubscribes, the type's registry entry is cleaned up.
- `TPayload` is a caller-side assertion: the client does not validate payload shapes.

## `createPushClient`

Factory form of the constructor:

```ts
import { createPushClient } from "@vef-framework-react/core";

const pushClient = createPushClient({ url: "/ws" });
```

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| `options` | `PushClientOptions` | `{}` | Same options as the `PushClient` constructor. |

Returns a `PushClient` instance.

## App-Singleton Example

The push channel is designed to be one connection per logged-in user, shared by the whole app. Create the client once at module scope, connect after login, and close on logout:

```ts
// src/push-client.ts
import { createPushClient } from "@vef-framework-react/core";

import { authStore } from "./auth-store";

export const pushClient = createPushClient({
  url: "/ws",
  getAuthTokens: () => authStore.getTokens(),
  onSessionInvalid: () => {
    // 4401: session revoked or expired — do not reconnect, log out locally
    authStore.logout();
  },
  onConnectionRejected: () => {
    // 4429: per-user connection cap reached — tell the user, do not retry
    notification.warning("Real-time updates unavailable: too many active connections");
  }
});
```

```ts
// login / logout flow
async function onLoginSuccess() {
  pushClient.connect();
}

function onLogout() {
  pushClient.close();
}
```

```tsx
// Any component: subscribe with automatic cleanup
import { usePushMessage } from "@vef-framework-react/hooks";

import { pushClient } from "../push-client";

function OrderBadge() {
  usePushMessage(pushClient, "order.status_changed", message => {
    // Best-effort hint: refetch the reliable state instead of trusting payload
    queryClient.invalidateQueries({ queryKey: [findOrderPage.key] });
  });

  return null;
}
```

## Types

### `PushMessage<TPayload = unknown>`

The wire envelope every push message arrives in (one JSON text frame):

```ts
interface PushMessage<TPayload = unknown> {
  id: string;
  type: string;
  payload?: TPayload;
  time: string;
}
```

| Field | Type | Description |
| --- | --- | --- |
| `id` | `string` | Server-generated message id, stable across recipients. |
| `type` | `string` | Business-defined discriminator handlers subscribe on. |
| `payload` | `TPayload \| undefined` | Arbitrary JSON payload; absent when the server sent none. |
| `time` | `string` | Server-side send time (RFC 3339). |

### `PushMessageHandler<TPayload = unknown>`

```ts
type PushMessageHandler<TPayload = unknown> = (message: PushMessage<TPayload>) => void;
```

### `PushStatus`

```ts
type PushStatus = "idle" | "connecting" | "open" | "reconnecting" | "closed";
```

### Close-Code Constants

| Export | Value | Description |
| --- | --- | --- |
| `PUSH_CLOSE_SESSION_INVALID` | `4401` | The connection's login session was revoked (logout, concurrent-login eviction, administrative kick) or expired. Terminal: the client must not reconnect and should enter its logged-out flow. |
| `PUSH_CLOSE_TOO_MANY_CONNECTIONS` | `4429` | The per-user connection cap was reached. Terminal: the client must not retry until another connection closes. |

### Type Exports

| Type | Description |
| --- | --- |
| `PushClientOptions` | Constructor options for `PushClient`. |
| `PushReconnectOptions` | Reconnect backoff configuration. |
| `PushMessage<TPayload>` | The wire envelope. |
| `PushMessageHandler<TPayload>` | Handler function type accepted by `subscribe`. |
| `PushStatus` | Connection lifecycle status union. |
