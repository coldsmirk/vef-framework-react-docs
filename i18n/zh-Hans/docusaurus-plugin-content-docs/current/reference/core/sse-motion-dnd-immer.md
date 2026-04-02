---
sidebar_position: 6
title: SSE、Motion、DnD 与 Immer
---

# SSE、Motion、DnD 与 Immer

## SSE（Server-Sent Events）

`@vef-framework-react/core` 提供了基于 `@microsoft/fetch-event-source` 构建的 SSE 客户端，支持自动 Token 注入和重试。

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
    body: { message: "你好" }
  },
  {
    onOpen: response => console.log("已连接", response.status),
    onMessage: event => {
      console.log(event.data);
    },
    onError: error => console.error(error),
    onClose: () => console.log("已关闭")
  }
);

// 中止所有活跃流
sseClient.abort();
```

### `createSseClient`

创建 `SseClient` 的工厂函数：

```ts
import { createSseClient } from "@vef-framework-react/core";

const sseClient = createSseClient({
  getAuthTokens: () => tokenStore.getTokens()
});
```

### `SseClientOptions`

| 选项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `getAuthTokens` | `() => Awaitable<{ accessToken: string } \| undefined>` | — | 获取访问 Token |
| `enableRetry` | `boolean` | `true` | 启用自动重试 |
| `maxRetries` | `number` | `3` | 最大重试次数 |
| `showErrorMessage` | `(msg) => void` | — | 错误消息处理器 |
| `onTokenExpired` | `() => Awaitable<boolean>` | — | Token 刷新回调；返回 `true` 则重试 |

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

---

## Motion

从 `motion/react` 重导出，提供动画支持。

```tsx
import { motion, AnimatePresence, LayoutGroup, Reorder, MotionProvider } from "@vef-framework-react/core";

// 动画元素
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
>
  内容
</motion.div>

// 出现/消失动画
<AnimatePresence>
  {isVisible && <motion.div key="item">...</motion.div>}
</AnimatePresence>

// 可排序列表
<Reorder.Group values={items} onReorder={setItems}>
  {items.map(item => (
    <Reorder.Item key={item.id} value={item}>
      {item.name}
    </Reorder.Item>
  ))}
</Reorder.Group>
```

### `MotionProvider`

用 motion 功能配置包裹应用，由 `starter.App` 内部使用。

### 类型导出

- `MotionProps`
- `Variants`
- `Variant`
- `VariantLabels`
- `Transition`
- `TargetAndTransition`
- `ResolvedValues`

---

## 拖拽（Drag and Drop）

从 `@dnd-kit` 和 `@hello-pangea/dnd` 重导出，提供拖拽支持。

### dnd-kit（现代 API）

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

### 数组辅助函数

```ts
import { moveArrayItem, swapArrayItem, moveDragItem, swapDragItem } from "@vef-framework-react/core";

// 将索引 0 的元素移动到索引 2
const newItems = moveArrayItem(items, 0, 2);

// 交换索引 0 和 2 的元素
const newItems = swapArrayItem(items, 0, 2);
```

### 修饰器

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

### @hello-pangea/dnd（兼容旧版 API）

```tsx
import { DragDropContext, Droppable, Draggable } from "@vef-framework-react/core";
```

---

## Immer

从 `immer` 和 `use-immer` 重导出，用于不可变状态更新。

### `produce`

```ts
import { produce } from "@vef-framework-react/core";

const nextState = produce(state, draft => {
  draft.user.name = "张三";
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

### `currentState` 和 `originalState`

```ts
import { currentState, originalState } from "@vef-framework-react/core";

produce(state, draft => {
  const snapshot = currentState(draft);   // 当前 draft 值
  const base = originalState(draft);      // 原始基础值
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
