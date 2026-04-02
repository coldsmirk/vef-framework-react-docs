---
sidebar_position: 6
title: SSE, Motion, DnD, and Immer
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

Wraps the application with motion feature configuration. Used internally by `starter.App`.

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

```tsx
import {
  DragDropProvider,
  DragOverlay,
  useDraggable,
  useDroppable,
  useSortable,
  PointerSensor,
  KeyboardSensor,
  useDragDropMonitor
} from "@vef-framework-react/core";

<DragDropProvider>
  <SortableList />
</DragDropProvider>
```

### Array Helpers

```ts
import { moveArrayItem, swapArrayItem, moveDragItem, swapDragItem } from "@vef-framework-react/core";

// Move item from index 0 to index 2
const newItems = moveArrayItem(items, 0, 2);

// Swap items at index 0 and 2
const newItems = swapArrayItem(items, 0, 2);
```

### Modifiers

```ts
import {
  RestrictToVerticalAxis,
  RestrictToHorizontalAxis,
  RestrictToWindow,
  RestrictToElement,
  SnapModifier,
  AxisModifier
} from "@vef-framework-react/core";
```

### @hello-pangea/dnd (legacy API)

```tsx
import { DragDropContext, Droppable, Draggable } from "@vef-framework-react/core";
```

---

## Immer

Re-exports from `immer` and `use-immer` for immutable state updates.

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
