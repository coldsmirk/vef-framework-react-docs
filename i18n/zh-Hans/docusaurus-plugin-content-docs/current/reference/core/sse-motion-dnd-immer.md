---
title: SSE、Motion、DnD 与 Immer
description: "SseClient 的选项与事件，以及 motion、拖放和 Immer 的重导出。"
---

# SSE、Motion、DnD 与 Immer

## SSE（Server-Sent Events）

`@vef-framework-react/core` 提供了一个基于 `@microsoft/fetch-event-source` 构建的 SSE 客户端，支持自动令牌注入与重试。

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

用于创建 `SseClient` 的工厂函数：

```ts
import { createSseClient } from "@vef-framework-react/core";

const sseClient = createSseClient({
  getAuthTokens: () => tokenStore.getTokens()
});
```

### `SseClientOptions`

| 选项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `getAuthTokens` | `() => Awaitable<{ accessToken: string } \| undefined>` | — | 获取访问令牌 |
| `enableRetry` | `boolean` | `true` | 启用自动重试 |
| `maxRetries` | `number` | `3` | 最大重试次数 |
| `showErrorMessage` | `(msg) => void` | — | 错误消息处理器 |
| `onTokenExpired` | `() => Awaitable<boolean>` | — | 令牌刷新回调；返回 `true` 表示重试 |

### `SseRequestConfig`

| 选项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `url` | `string` | — | 请求 URL |
| `method` | `"GET" \| "POST" \| "PUT" \| "DELETE"` | `"POST"` | HTTP 方法 |
| `headers` | `Record<string, string>` | — | 请求头 |
| `body` | `string \| object` | — | 请求体 |
| `signal` | `AbortSignal` | — | 中止信号 |

### `SseMessageEvent`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `string \| undefined` | 事件 ID |
| `event` | `string \| undefined` | 事件类型 |
| `data` | `string` | 消息数据 |

### 流式行为

- `stream(config, handlers)` 返回一个 Promise，在流结束时 resolve——正常结束、被中止，或在报告鉴权失败之后——当流超出重试预算而失败时，以原始错误 reject。
- 每次 `stream()` 调用都运行一个会话状态图：一次连接尝试；若打开时收到 401，则通过 `onTokenExpired` 做一次令牌刷新，随后**仅重试一次**。刷新返回 `false`（或抛出）会以 `"Authentication failed: token expired"` 错误结束会话，并经由 `onError` / `showErrorMessage` 上报。
- `getAuthTokens` 会注入 `Authorization: Bearer …`，除非请求已携带 `authorization` 请求头。
- 非 401 的打开失败（`!response.ok`，或 `content-type` 不是 `text/event-stream`）会使该次尝试失败。流中途的传输错误在 `enableRetry` 开启时会在该次尝试内部重试，最多 `maxRetries` 次（`Last-Event-ID` 连续性与服务端下发的重试间隔由 `fetch-event-source` 处理）。
- 对象类型的请求体会被 JSON 序列化，未设置时 `Content-Type` 请求头默认为 `application/json`；`method` 默认为 `"POST"`。
- `abort()` 取消该客户端启动的**所有**活跃流；单个流的 `config.signal` 只取消该流。

### SSE 与 Push 对比

两者都是服务端到客户端的流式通道，但职责不同：

| | `SseClient` | [`PushClient`](./push.md) |
| --- | --- | --- |
| 传输 | HTTP + Server-Sent Events（基于 fetch） | WebSocket（`vef.push` 通道） |
| 作用范围 | **按请求**的流式传输：为单次操作调用 `stream()`（例如一次 LLM 聊天响应），消费到结束为止 | **应用级**单例：每个已登录用户一条长连接，承载类型化的 [`PushMessage`](./push.md#pushmessagetpayload--unknown) 消息信封 |
| 方向 | 客户端发起的单个请求的响应流 | 服务端可随时发起的、仅向下行的消息 |
| 鉴权 | `Authorization` 请求头（fetch 可以设置请求头） | `__accessToken` 查询参数（浏览器 WebSocket 无法设置请求头） |
| 可靠性 | 流本身*就是*载荷 | 尽力而为的提示——通过常规 API 重新拉取可靠状态 |
| 重连 | 在单次 `stream()` 会话内部重试（受 `maxRetries` 约束） | 会话生命周期内带抖动的指数退避，并有终止性关闭码（4401/4429） |

需要消费一次流式响应时用 `SseClient`；需要服务端主动通知时用 `PushClient`（配合 [`usePushMessage`](../hooks/vef-hooks.md#服务端推送-hook)）。参见[服务端推送](./push.md)。

---

## Motion

从 `motion/react` 重导出，提供动画支持。

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

用 `LazyMotion`（懒加载的 `domMax` 功能包）与 `MotionConfig`（`reducedMotion: "user"`、默认过渡 `{ duration: 0.2, ease: "easeInOut" }`、生成的样式 `nonce`）包裹应用。由 `starter.App` 内部使用。

注意：此处重导出的 `motion` 命名空间是 `motion/react-m`——即由 `MotionProvider` 加载动画功能的轻量组件。在 `MotionProvider` 之外渲染 `motion.*` 元素将得不到动画功能。

### 其他 Motion 导出

- `useDragControls`——对 `motion` 拖拽手势的命令式拖拽启动控制
- `useInView`——跟踪被 ref 引用的元素是否位于视口内

### 类型导出

- `MotionProps`
- `Variants`
- `Variant`
- `VariantLabels`
- `Transition`
- `TargetAndTransition`
- `ResolvedValues`

---

## 拖放

从 `@dnd-kit` 和 `@hello-pangea/dnd` 重导出，提供拖放支持。

### dnd-kit（现代 API）

来自 `@dnd-kit/react` 的组件与 hooks（外加来自 `@dnd-kit/react/sortable` 的 `useSortable`）：

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

- `useDragOperation`——以只读方式访问当前拖拽操作（source、target、position）
- `useDragDropMonitor`——在 provider 之下的任意位置订阅拖拽生命周期事件
- `defaultPreset`——来自 `@dnd-kit/dom` 的默认插件/传感器预设
- `Feedback`——`@dnd-kit/dom` 的幽灵渲染（拖拽反馈）插件；类型 `FeedbackInput`、`FeedbackOptions`、`FeedbackType`
- `PointerActivationConstraints`——用于控制拖拽启动门槛的指针激活约束（距离 / 延迟）

### 碰撞检测

来自 `@dnd-kit/collision` 的碰撞检测器，传给 `useDroppable({ collisionDetector })`：

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

`CollisionPriority`（来自 `@dnd-kit/abstract`）是 `useDroppable({ collisionPriority })` 的优先级枚举——`Lowest = 0`、`Low = 1`、`Normal = 2`、`High = 3`、`Highest = 4`；嵌套的放置区域先按优先级层级排序，再按几何距离排序。`CollisionDetector` 类型也一并导出。

### 数组辅助函数

来自 `@dnd-kit/helpers`（已重命名）：`moveArrayItem`/`swapArrayItem` 按索引对普通数组重新排序；`moveDragItem`/`swapDragItem` 将拖拽事件应用到一个数组（或数组的记录）上，通常在 `onDragOver`/`onDragEnd` 中使用。

```ts
import { moveArrayItem, swapArrayItem, moveDragItem, swapDragItem } from "@vef-framework-react/core";

// Move item from index 0 to index 2
const newItems = moveArrayItem(items, 0, 2);

// Swap items at index 0 and 2
const newItems = swapArrayItem(items, 0, 2);

// Apply a dnd-kit event to the items
onDragOver: event => setItems(items => moveDragItem(items, event));
```

### 修饰符

来自 `@dnd-kit/abstract/modifiers`（`AxisModifier`、`RestrictToHorizontalAxis`、`RestrictToVerticalAxis`、`SnapModifier`，以及 `restrictShapeToBoundingRectangle` 辅助函数）与 `@dnd-kit/dom/modifiers`（`RestrictToElement`、`RestrictToWindow`）：

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

### dnd-kit 类型导出

`BeforeDragStartEvent`、`CollisionEvent`、`DragDropEventHandlers`、`DragStartEvent`、`DragMoveEvent`、`DragOverEvent`、`DragEndEvent`、`CollisionDetector`、`FeedbackInput`、`FeedbackOptions`、`FeedbackType`。

### @hello-pangea/dnd（旧版 API）

```tsx
import { DragDropContext, Droppable, Draggable } from "@vef-framework-react/core";
```

配套类型也一并重导出：`DragDropContextProps`、`DraggableProps` / `DroppableProps`、`DraggableProvided` / `DroppableProvided`（含 `DraggableProvidedDraggableProps`、`DraggableProvidedDragHandleProps`、`DroppableProvidedProps`）、`DraggableStateSnapshot` / `DroppableStateSnapshot`、`DraggableId` / `DroppableId`、`DraggableLocation`、`DraggableRubric`、`DraggableChildrenFn`、`DropResult`，以及各响应器类型（`OnBeforeCaptureResponder`、`OnBeforeDragStartResponder`、`OnDragStartResponder`、`OnDragUpdateResponder`、`OnDragEndResponder`）。

---

## Immer

从 `immer` 和 `use-immer` 重导出，用于不可变状态更新。导入该模块会对 Immer 做全局配置：`enableMapSet()`（draft 支持 `Map`/`Set`）、`enablePatches()`（为撤销/重做/同步提供补丁跟踪），以及 `setAutoFreeze(false)`（产出的状态不会被冻结，以牺牲变更缺陷检测换取性能）。

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

### `currentState` 与 `originalState`

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
