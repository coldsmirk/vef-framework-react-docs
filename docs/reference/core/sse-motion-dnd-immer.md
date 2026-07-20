---
title: SSE, Motion, DnD, and Immer
description: SseClient options and events, plus the motion, drag-and-drop, and Immer re-exports.
---

# SSE, Motion, DnD, and Immer

## SSE (Server-Sent Events)

`@vef-framework-react/core` provides an SSE client built on `@microsoft/fetch-event-source` with automatic token injection and retry support.

### `SseClient`

```ts
import { SseClient } from "@vef-framework-react/core";

const sseClient = new SseClient({
  getAuthTokens: () => tokenStore.getTokens(),
  enableRetry: true,
  maxRetries: 3,
  showErrorMessage: message => notification.error(message),
  onTokenExpired: async () => {
    const refreshed = await http.ensureTokenRefreshed();
    return refreshed;
  }
});

await sseClient.stream(
  {
    url: "/api/chat/stream",
    method: "POST",
    body: { message: "Hello" }
  },
  {
    onOpen: response => console.log("Connected", response.status),
    onMessage: event => {
      console.log(event.data);
    },
    onError: error => console.error(error),
    onClose: () => console.log("Closed")
  }
);

// Abort all active streams
sseClient.abort();
```

### `createSseClient`

Factory function for creating an `SseClient`:

```ts
import { createSseClient } from "@vef-framework-react/core";

const sseClient = createSseClient({
  getAuthTokens: () => tokenStore.getTokens()
});
```

### `SseClientOptions`

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `getAuthTokens` | `() => Awaitable<{ accessToken: string } \| undefined>` | — | Retrieve access token |
| `enableRetry` | `boolean` | `true` | Enable automatic retries |
| `maxRetries` | `number` | `3` | Maximum retry attempts |
| `showErrorMessage` | `(msg) => void` | — | Error message handler |
| `onTokenExpired` | `() => Awaitable<boolean>` | — | Token refresh callback; return `true` to retry |

### `SseRequestConfig`

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `url` | `string` | — | Request URL |
| `method` | `"GET" \| "POST" \| "PUT" \| "DELETE"` | `"POST"` | HTTP method |
| `headers` | `Record<string, string>` | — | Request headers |
| `body` | `string \| object` | — | Request body |
| `signal` | `AbortSignal` | — | Abort signal |

### `SseMessageEvent`

| Field | Type | Description |
| --- | --- | --- |
| `id` | `string \| undefined` | Event ID |
| `event` | `string \| undefined` | Event type |
| `data` | `string` | Message data |

### Stream Behavior

- `stream(config, handlers)` returns a promise that resolves when the stream ends — normally, by abort, or after a reported auth failure — and rejects with the original error when the stream fails past its retry budget.
- Each `stream()` call runs a session statechart: one connection attempt, and on a 401 at open time, one token refresh via `onTokenExpired` followed by **one** retry. A refresh that returns `false` (or throws) ends the session with an `"Authentication failed: token expired"` error through `onError` / `showErrorMessage`.
- `getAuthTokens` injects `Authorization: Bearer …` unless the request already carries an `authorization` header.
- Non-401 open failures (`!response.ok`, or a `content-type` that is not `text/event-stream`) fail the attempt. Transport errors mid-stream retry inside the attempt up to `maxRetries` times when `enableRetry` is on (`Last-Event-ID` continuity and server-driven retry intervals are handled by `fetch-event-source`).
- Object bodies are JSON-serialized, defaulting the `Content-Type` header to `application/json` when not set; `method` defaults to `"POST"`.
- `abort()` cancels **all** active streams started by this client; a per-stream `config.signal` cancels just that stream.

### SSE vs Push

Both are server-to-client streaming channels; they serve different jobs:

| | `SseClient` | [`PushClient`](./push.md) |
| --- | --- | --- |
| Transport | HTTP + Server-Sent Events (fetch-based) | WebSocket (`vef.push` channel) |
| Scope | **Per-request** streaming: call `stream()` for one operation (e.g. an LLM chat response) and consume until it ends | **App-wide** singleton: one long-lived connection per logged-in user, carrying typed [`PushMessage`](./push.md#pushmessagetpayload--unknown) envelopes |
| Direction | Response stream of one request the client initiated | Downstream-only messages the server initiates at any time |
| Auth | `Authorization` header (fetch can set headers) | `__accessToken` query parameter (browser WebSockets cannot set headers) |
| Reliability | The stream *is* the payload | Best-effort hint — refetch reliable state through the regular API |
| Reconnect | Retries within one `stream()` session (bounded by `maxRetries`) | Jittered exponential backoff for the lifetime of the session, with terminal close codes (4401/4429) |

Use `SseClient` to consume one streamed response; use `PushClient` (with [`usePushMessage`](../hooks/vef-hooks.md#server-push-hook)) for server-initiated notifications. See [Server Push](./push.md).

---

## Motion

Re-exports from `motion/react` for animation support.

```tsx
import { motion, AnimatePresence, LayoutGroup, Reorder, MotionProvider } from "@vef-framework-react/core";

// Animated element
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
>
  Content
</motion.div>

// Presence animation
<AnimatePresence>
  {isVisible && <motion.div key="item">...</motion.div>}
</AnimatePresence>

// Reorderable list
<Reorder.Group values={items} onReorder={setItems}>
  {items.map(item => (
    <Reorder.Item key={item.id} value={item}>
      {item.name}
    </Reorder.Item>
  ))}
</Reorder.Group>
```

### `MotionProvider`

Wraps the application with `LazyMotion` (lazy-loaded `domMax` feature bundle) and `MotionConfig` (`reducedMotion: "user"`, default transition `{ duration: 0.2, ease: "easeInOut" }`, a generated style `nonce`). Used internally by `starter.App`.

Note that the `motion` namespace re-exported here is `motion/react-m` — the lightweight components whose animation features are loaded by `MotionProvider`. Rendering `motion.*` elements outside a `MotionProvider` leaves them without animation features.

### Other Motion Exports

- `useDragControls` — imperative drag-start control for `motion` drag gestures
- `useInView` — tracks whether a ref'd element is in the viewport

### Type Exports

- `MotionProps`
- `Variants`
- `Variant`
- `VariantLabels`
- `Transition`
- `TargetAndTransition`
- `ResolvedValues`

---

## Drag and Drop

Re-exports from `@dnd-kit` and `@hello-pangea/dnd` for drag-and-drop support.

### dnd-kit (modern API)

Components and hooks from `@dnd-kit/react` (plus `useSortable` from `@dnd-kit/react/sortable`):

```tsx
import {
  DragDropProvider,
  DragOverlay,
  useDraggable,
  useDroppable,
  useSortable,
  useDragOperation,
  PointerSensor,
  KeyboardSensor,
  useDragDropMonitor
} from "@vef-framework-react/core";

<DragDropProvider>
  <SortableList />
</DragDropProvider>
```

- `useDragOperation` — read-only access to the current drag operation (source, target, position)
- `useDragDropMonitor` — subscribe to drag lifecycle events from anywhere under the provider
- `defaultPreset` — the default plugin/sensor preset from `@dnd-kit/dom`
- `Feedback` — the `@dnd-kit/dom` ghost-rendering (drag feedback) plugin; types `FeedbackInput`, `FeedbackOptions`, `FeedbackType`
- `PointerActivationConstraints` — the pointer activation constraints (distance / delay) used to gate drag start

### Collision Detection

Collision detectors from `@dnd-kit/collision`, passed to `useDroppable({ collisionDetector })`:

```ts
import {
  closestCenter,
  closestCorners,
  defaultCollisionDetection,
  directionBiased,
  pointerDistance,
  pointerIntersection,
  shapeIntersection,
  CollisionPriority
} from "@vef-framework-react/core";
```

`CollisionPriority` (from `@dnd-kit/abstract`) is the priority-tier enum for `useDroppable({ collisionPriority })` — `Lowest = 0`, `Low = 1`, `Normal = 2`, `High = 3`, `Highest = 4`; nested drop zones sort by tier first, geometric distance second. The `CollisionDetector` type is also exported.

### Array Helpers

From `@dnd-kit/helpers` (renamed): `moveArrayItem`/`swapArrayItem` reorder plain arrays by index; `moveDragItem`/`swapDragItem` apply a drag event to an array (or record of arrays), typically inside `onDragOver`/`onDragEnd`.

```ts
import { moveArrayItem, swapArrayItem, moveDragItem, swapDragItem } from "@vef-framework-react/core";

// Move item from index 0 to index 2
const newItems = moveArrayItem(items, 0, 2);

// Swap items at index 0 and 2
const newItems = swapArrayItem(items, 0, 2);

// Apply a dnd-kit event to the items
onDragOver: event => setItems(items => moveDragItem(items, event));
```

### Modifiers

From `@dnd-kit/abstract/modifiers` (`AxisModifier`, `RestrictToHorizontalAxis`, `RestrictToVerticalAxis`, `SnapModifier`, plus the `restrictShapeToBoundingRectangle` helper) and `@dnd-kit/dom/modifiers` (`RestrictToElement`, `RestrictToWindow`):

```ts
import {
  RestrictToVerticalAxis,
  RestrictToHorizontalAxis,
  RestrictToWindow,
  RestrictToElement,
  SnapModifier,
  AxisModifier,
  restrictShapeToBoundingRectangle
} from "@vef-framework-react/core";
```

### dnd-kit Type Exports

`BeforeDragStartEvent`, `CollisionEvent`, `DragDropEventHandlers`, `DragStartEvent`, `DragMoveEvent`, `DragOverEvent`, `DragEndEvent`, `CollisionDetector`, `FeedbackInput`, `FeedbackOptions`, `FeedbackType`.

### @hello-pangea/dnd (legacy API)

```tsx
import { DragDropContext, Droppable, Draggable } from "@vef-framework-react/core";
```

The accompanying types are re-exported as well: `DragDropContextProps`, `DraggableProps` / `DroppableProps`, `DraggableProvided` / `DroppableProvided` (with `DraggableProvidedDraggableProps`, `DraggableProvidedDragHandleProps`, `DroppableProvidedProps`), `DraggableStateSnapshot` / `DroppableStateSnapshot`, `DraggableId` / `DroppableId`, `DraggableLocation`, `DraggableRubric`, `DraggableChildrenFn`, `DropResult`, and the responder types (`OnBeforeCaptureResponder`, `OnBeforeDragStartResponder`, `OnDragStartResponder`, `OnDragUpdateResponder`, `OnDragEndResponder`).

---

## Immer

Re-exports from `immer` and `use-immer` for immutable state updates. Importing this module configures Immer globally: `enableMapSet()` (drafts support `Map`/`Set`), `enablePatches()` (patch tracking for undo/redo/sync), and `setAutoFreeze(false)` (produced states are not frozen, trading mutation-bug detection for performance).

### `produce`

```ts
import { produce } from "@vef-framework-react/core";

const nextState = produce(state, draft => {
  draft.user.name = "Alice";
  draft.items.push({ id: 1 });
});
```

### `produceWithPatches`

```ts
import { produceWithPatches } from "@vef-framework-react/core";

const [nextState, patches, inversePatches] = produceWithPatches(state, draft => {
  draft.count += 1;
});
```

### `applyPatches`

```ts
import { applyPatches } from "@vef-framework-react/core";

const undoneState = applyPatches(nextState, inversePatches);
```

### `currentState` and `originalState`

```ts
import { currentState, originalState } from "@vef-framework-react/core";

produce(state, draft => {
  const snapshot = currentState(draft);   // current draft value
  const base = originalState(draft);      // original base value
});
```

### `useImmer`

```tsx
import { useImmer } from "@vef-framework-react/core";

const [state, updateState] = useImmer({ count: 0, name: "" });

updateState(draft => {
  draft.count += 1;
});
```

### `useImmerReducer`

```tsx
import { useImmerReducer } from "@vef-framework-react/core";

const [state, dispatch] = useImmerReducer(
  (draft, action) => {
    if (action.type === "increment") draft.count += 1;
  },
  { count: 0 }
);
```
