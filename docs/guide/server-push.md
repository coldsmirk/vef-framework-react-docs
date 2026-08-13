---
title: Server Push
description: How to wire the VEF server push channel — one app-level PushClient, typed envelope subscriptions with usePushMessage, and reconnect/logout lifecycle.
---

# Server Push

Some UI needs to react to things that happen on the server without the user asking: an approval task lands in someone's inbox, an import job finishes, an admin revokes a session. The VEF server push channel exists for exactly this — the backend pushes small JSON envelopes to every connected client over a WebSocket, **downstream only** (the client never sends application messages up this channel).

`@vef-framework-react/core` ships the client (`PushClient` / `createPushClient`), and `@vef-framework-react/hooks` ships the React adapter (`usePushMessage`). This page covers how to wire them into an application; the exhaustive API — every option, status, and close code — lives in [Server Push (reference)](../reference/core/push.md).

## The Mental Model: Hints, Not State

Delivery on this channel is **best-effort** by the server contract. A message can be missed (the tab was reconnecting, the laptop lid was closed), so treat every push message as a real-time *hint* and keep the reliable state behind the regular API:

- **Do:** on `"order.status_changed"`, invalidate the order query so the table refetches.
- **Don't:** patch the row from `message.payload` and trust it as the source of truth.

Every message arrives in one wire envelope, `PushMessage`:

```ts
interface PushMessage<TPayload = unknown> {
  id: string;        // server-generated message id
  type: string;      // business-defined discriminator handlers subscribe on
  payload?: TPayload; // arbitrary JSON payload; absent when the server sent none
  time: string;      // server-side send time (RFC 3339)
}
```

`type` is the routing key — subscribers register per type, and the payload shape is a per-type contract between your backend and your handlers.

## Create One App-Level Client

The push channel is designed as **one connection per logged-in user**, shared by the whole app. Create the client once at module scope with `createPushClient`, and wire authentication and the two terminal server signals:

```ts
// src/push-client.ts
import { createPushClient } from "@vef-framework-react/core";
import { showWarningMessage } from "@vef-framework-react/components";
import { emitUnauthenticated, useAppStore } from "@vef-framework-react/starter";

export const pushClient = createPushClient({
  // Default is "/ws"; http(s) URLs are converted to ws(s) automatically.
  url: "/ws",
  // Re-read on every (re)connect attempt, so a refreshed access token is
  // picked up automatically. The token travels in the `__accessToken` query
  // parameter because a browser WebSocket cannot set an Authorization header.
  getAuthTokens: () => useAppStore.getState().authTokens,
  onSessionInvalid: () => {
    // Close code 4401: the login session was revoked or expired. The client
    // will not reconnect — fire the same unauthenticated event the HTTP
    // client uses, and let the router's event chain handle the redirect.
    emitUnauthenticated();
  },
  onConnectionRejected: () => {
    // Close code 4429: per-user connection cap reached. No automatic retry.
    showWarningMessage("实时通知不可用: 连接数已达上限");
  },
  onStatusChange: status => console.debug("[push]", status)
});
```

Constructing the client does **not** open a connection. Connect after login succeeds and close on logout:

```ts
// after login succeeds (e.g. alongside your post-login navigation)
pushClient.connect();

// on logout — close() is the app-driven exit; it stops any reconnecting
pushClient.close();
```

`connect()` is safe to call repeatedly — it is a no-op while a session is active (any status other than `"idle"` or `"closed"`), so calling it from a layout effect that can run twice is fine.

## Subscribe to Messages

`subscribe(type, handler)` registers a handler for one envelope type and returns the unsubscribe function. The special type `"*"` receives every message:

```ts
interface OrderStatusPayload {
  orderId: string;
  status: "paid" | "shipped" | "cancelled";
}

const unsubscribe = pushClient.subscribe<OrderStatusPayload>(
  "order.status_changed",
  message => {
    // message is PushMessage<OrderStatusPayload>
    console.log(message.payload?.orderId, message.payload?.status);
  }
);

// A wildcard audit/debug tap:
const unsubscribeAll = pushClient.subscribe("*", message => {
  console.debug("push:", message.type, message.id);
});

unsubscribe();
```

Three properties of the subscription registry matter in practice:

- **Subscriptions are independent of the connection.** You can subscribe before `connect()`, and subscriptions survive reconnects and even `close()`/`connect()` cycles — nothing needs re-registering.
- **Ordering:** for a given message, handlers subscribed to its exact `type` run before `"*"` handlers.
- **The payload generic is an assertion, not validation.** `subscribe<OrderStatusPayload>` types your handler; the client does not check the wire shape. Malformed frames are dropped before any handler runs: non-string frames are discarded silently, while invalid JSON or a missing/empty string `type` is discarded with a console warning.

## Subscribing from Components: `usePushMessage`

In React code, use `usePushMessage` from `@vef-framework-react/hooks` instead of calling `subscribe` manually — it ties the subscription to the component lifecycle and unsubscribes on unmount:

```tsx
import { usePushMessage } from "@vef-framework-react/hooks";
import { useQueryClient } from "@vef-framework-react/core";

import { pushClient } from "../push-client";
import { findOrderPage } from "../apis/order";

function OrderTableLive() {
  const queryClient = useQueryClient();

  usePushMessage<OrderStatusPayload>(pushClient, "order.status_changed", () => {
    // Best-effort hint: refetch the reliable state instead of trusting payload
    void queryClient.invalidateQueries({ queryKey: [findOrderPage.key] });
  });

  return null;
}
```

The hook re-subscribes whenever `client`, `type`, or the `handler` identity changes. An inline arrow function is fine — re-subscribing is cheap — but if the component re-renders at high frequency, stabilize the handler with `useCallback` to keep the effect quiet.

## Reconnection, as Implemented

Transport-level losses (server restart, network blip) reconnect automatically; application-level exits do not. The exact behavior:

- Each retry waits `min(maxDelay, initialDelay * 2 ** attempts)` plus up to 30% random jitter, so a fleet of clients does not stampede the server after a restart. Defaults: `initialDelay` 1000 ms, `maxDelay` 30000 ms; the attempt counter resets once a connection opens.
- Every reconnect attempt re-reads `getAuthTokens`, so a token refreshed in the meantime is used automatically.
- Two close codes are **terminal** and never reconnect: `4401` (session revoked or expired → `onSessionInvalid`) and `4429` (per-user connection cap → `onConnectionRejected`).
- `close()` is also terminal for the session: it cancels any pending retry and settles at `"closed"`.
- Pass `reconnect: { enabled: false }` to disable automatic reconnection entirely.
- There is no client-side heartbeat — liveness is delegated to the server and the WebSocket close event.

Messages sent by the server while the client is between connections are **lost** — which is why handlers should refetch rather than accumulate payloads.

## Push Channel vs SSE

`@vef-framework-react/core` also ships an SSE client (`SseClient` / `createSseClient`). They solve different problems — do not reach for SSE to build notifications, and do not stream a single response over push:

| | `PushClient` (push channel) | `SseClient` (SSE helpers) |
| --- | --- | --- |
| Shape | One long-lived app-level WebSocket | One HTTP streaming request per `stream()` call |
| Direction | Server-initiated events, downstream only | Response stream of a request you initiated |
| Addressing | Envelope `type` routing, many subscribers | One `onMessage` handler per stream |
| Auth | Access token in the `__accessToken` query parameter, re-read per (re)connect | `Authorization` header, with an `onTokenExpired` refresh-and-retry hook |
| Retry | Jittered exponential backoff until terminal close codes | Bounded retries per stream (`maxRetries`, default 3) |
| Typical use | Notifications, inbox badges, cache invalidation hints | AI token streams, long-running job progress for one request |

See [SSE vs Push](../reference/core/sse-motion-dnd-immer.md#sse-vs-push) for the reference-level comparison.

## End-to-End Example

A realistic wiring for "approval tasks update live": one module-scope client, connected by the auth flow, consumed by two components.

```ts
// src/push-client.ts — the app-level singleton (see above)
export const pushClient = createPushClient({
  getAuthTokens: () => useAppStore.getState().authTokens
});
```

```tsx
// src/components/push-bridge.tsx — mount once inside the authenticated layout
import { useQueryClient } from "@vef-framework-react/core";
import { showInfoMessage } from "@vef-framework-react/components";
import { usePushMessage } from "@vef-framework-react/hooks";
import { useEffect } from "react";

import { findMyTaskPage } from "../apis/approval";
import { pushClient } from "../push-client";

interface TaskCreatedPayload {
  taskId: string;
  flowName: string;
}

export function PushBridge() {
  // The authenticated layout mounting is the "login succeeded" signal.
  useEffect(() => {
    pushClient.connect();
    return () => pushClient.close();
  }, []);

  usePushMessage<TaskCreatedPayload>(pushClient, "approval.task_created", message => {
    showInfoMessage(`新的审批任务: ${message.payload?.flowName ?? ""}`);
  });

  const queryClient = useQueryClient();

  usePushMessage(pushClient, "approval.task_created", () => {
    void queryClient.invalidateQueries({ queryKey: [findMyTaskPage.key] });
  });

  return null;
}
```

The task list page itself needs no push code at all — invalidating `[findMyTaskPage.key]` makes every mounted query for that key refetch, so the table, the badge count, and anything else backed by the same query function update together. That is the recommended division of labor: one bridge component owns connection lifecycle and cache invalidation; feature components stay pure query consumers.

## Recommended Usage

- Create exactly one `PushClient` per app, at module scope; do not construct clients inside components.
- Connect after login, `close()` on logout — and treat `onSessionInvalid` (4401) as a logout signal from the server.
- Let handlers invalidate queries instead of writing payloads into state; the payload is a hint, not the record.
- Namespace envelope types like permission tokens (`approval.task_created`, `order.status_changed`) so wildcard tooling and log filters stay usable.
- For streaming one long request's output (AI responses, job progress), use the SSE client instead — see the table above.
