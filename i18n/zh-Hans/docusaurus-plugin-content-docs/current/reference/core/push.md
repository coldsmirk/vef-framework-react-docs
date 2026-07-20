---
title: 服务端推送
description: 面向 VEF 服务端推送通道的 PushClient——构造选项、连接生命周期、重连行为、subscribe 契约与全部推送类型。
---

# 服务端推送

`@vef-framework-react/core` 为 VEF 服务端推送通道（`vef.push`）提供了一个客户端——这是一条由后端**仅向下行**推送消息的 WebSocket 连接。按服务端契约，消息投递是尽力而为的：请把推送消息当作实时提示，并让可靠状态始终依托常规 API（收到通知后重新拉取，而不是把 payload 当作事实来源）。

React 订阅适配层参见 `@vef-framework-react/hooks` 中的 [`usePushMessage`](../hooks/vef-hooks.md#服务端推送-hook)。叙述性的完整介绍（后端配置、消息设计）参见[服务端推送指南](../../guide/server-push.md)。该通道与 SSE 客户端的差异参见 [SSE 与 Push 对比](./sse-motion-dnd-immer.md#sse-与-push-对比)。

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

构造客户端并不会打开连接——需要调用 [`connect()`](#connect) 启动。

### `PushClientOptions`

所有字段均为可选；`new PushClient()` 是合法的。

| 选项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `url` | `string` | `"/ws"` | 推送端点 URL。接受 `ws(s)://` 或 `http(s)://`（会被转换为 `ws(s)://`），可为绝对或相对地址（相对地址基于当前 origin 解析）。 |
| `getAuthTokens` | `() => Awaitable<Readonly<Pick<AuthTokens, "accessToken">> \| undefined>` | — | 获取鉴权令牌。访问令牌通过 `__accessToken` 查询参数携带——浏览器 WebSocket 无法设置 `Authorization` 请求头——并且在**每次**（重）连尝试时都会重新读取，因此刷新后的令牌会被自动使用。省略该选项（或未返回 `accessToken`）时，连接不携带令牌。 |
| `reconnect` | `PushReconnectOptions` | — | 重连退避配置（见下文）。 |
| `onSessionInvalid` | `(event: CloseEvent) => void` | — | 服务端以代码 `4401` 关闭连接（会话被吊销或已过期）时调用。客户端不会重连；应将用户引导至登出流程。 |
| `onConnectionRejected` | `(event: CloseEvent) => void` | — | 服务端以代码 `4429` 拒绝连接（单用户连接数上限）时调用。客户端不会自动重试。 |
| `onStatusChange` | `(status: PushStatus) => void` | — | 观察连接状态变化。仅在状态实际变化时触发（相同状态的更新会被去重）。 |

### `PushReconnectOptions`

只有传输层故障才会触发重连；终止性关闭码（`4401` / `4429`）与显式调用 `close()` 永远不会。

| 选项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `enabled` | `boolean` | `true` | 传输层连接丢失后是否重连。 |
| `initialDelay` | `number` | `1000` | 首次重试延迟（毫秒）；每次尝试翻倍。 |
| `maxDelay` | `number` | `30000` | 重试延迟的上限（毫秒）。 |

### 连接生命周期

客户端按如下方式在 [`PushStatus`](#pushstatus) 各状态之间转换：

1. **`"idle"`**——已构造，从未连接。
2. **`"connecting"`**——已调用 `connect()`：端点被解析为绝对 WebSocket URL，等待 `getAuthTokens` 完成，然后携带 `__accessToken` 查询参数中的访问令牌打开 socket。
3. **`"open"`**——socket 已打开；重连尝试计数器重置为 `0`。
4. **`"reconnecting"`**——连接在传输层丢失，已排定一次重试（见下文）。
5. **`"closed"`**——本次会话的终态：经由 `close()`、终止性关闭码（`4401` / `4429`），或在 `reconnect.enabled: false` 时的传输层丢失进入。可再次调用 `connect()` 开启新会话。

重连行为（按实际实现）：

- 每次重试等待 `min(maxDelay, initialDelay * 2 ** attempts)`，再加上最多 30% 的随机抖动（避免服务端重启后大批客户端步调一致地同时重连）。
- 尝试计数器每次重试递增，连接一旦打开即重置为 `0`。
- 每次重连尝试都会重新读取 `getAuthTokens`，因此期间刷新过的令牌会被使用。
- 客户端没有心跳机制：存活检测交给服务端与 WebSocket 的 close 事件。客户端只响应 `close`——不会发送 ping。

入站帧按如下方式分发：非字符串帧被忽略；`JSON.parse` 失败、或 `type` 不是非空字符串的字符串帧会被丢弃，并输出一条 `[vef-push]` 控制台警告。有效的消息信封会先投递给订阅了 `message.type` 的每个处理函数，再投递给每个 `"*"` 处理函数。

### 实例 API

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `status` | `PushStatus`（getter） | 当前连接状态。 |
| `connect()` | `() => void` | 打开连接。可安全地重复调用——除非状态为 `"idle"` 或 `"closed"`，否则是无操作（保留当前活跃会话）。会重置重连尝试计数器。 |
| `close()` | `() => void` | 关闭连接并停止重连（登出路径）。取消所有待执行的重连定时器，关闭 socket，并停在 `"closed"` 状态。 |
| `subscribe(type, handler)` | `<TPayload = unknown>(type: string, handler: PushMessageHandler<TPayload>) => () => void` | 为一种消息信封类型订阅处理函数；见下文。 |

#### `connect()`

打开连接是异步过程（会等待令牌读取完成），但 `connect()` 本身同步返回。如果在令牌仍在获取时调用了 `close()`，待执行的打开操作会被放弃。

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

契约：

- 处理函数以消息信封的 `type` 为键。特殊类型 `"*"` 会接收**每一条**消息；对同一条消息，先运行特定类型的处理函数，再运行 `"*"` 处理函数。
- 同一类型可以订阅多个处理函数；每个处理函数保存在一个集合中，因此对同一个函数订阅两次只会注册一次。
- 订阅与连接生命周期无关——可以在 `connect()` 之前订阅，订阅在重连以及 `close()`/`connect()` 循环之间保持有效。
- 返回值是取消订阅函数。调用它只移除该处理函数；当某个类型的最后一个处理函数取消订阅时，该类型在注册表中的条目会被清理。
- `TPayload` 是调用方的类型断言：客户端不校验 payload 的结构。

## `createPushClient`

构造函数的工厂形式：

```ts
import { createPushClient } from "@vef-framework-react/core";

const pushClient = createPushClient({ url: "/ws" });
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `options` | `PushClientOptions` | `{}` | 与 `PushClient` 构造函数相同的选项。 |

返回一个 `PushClient` 实例。

## 应用级单例示例

推送通道的设计是每个已登录用户一条连接，由整个应用共享。在模块作用域创建一次客户端，登录后连接，登出时关闭：

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

## 类型

### `PushMessage<TPayload = unknown>`

每条推送消息抵达时所采用的线路消息信封（一个 JSON 文本帧）：

```ts
interface PushMessage<TPayload = unknown> {
  id: string;
  type: string;
  payload?: TPayload;
  time: string;
}
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `string` | 服务端生成的消息 id，对所有接收者保持一致。 |
| `type` | `string` | 业务定义的判别字段，处理函数据此订阅。 |
| `payload` | `TPayload \| undefined` | 任意 JSON 载荷；服务端未发送时缺省。 |
| `time` | `string` | 服务端发送时间（RFC 3339）。 |

### `PushMessageHandler<TPayload = unknown>`

```ts
type PushMessageHandler<TPayload = unknown> = (message: PushMessage<TPayload>) => void;
```

### `PushStatus`

```ts
type PushStatus = "idle" | "connecting" | "open" | "reconnecting" | "closed";
```

### 关闭码常量

| 导出 | 值 | 说明 |
| --- | --- | --- |
| `PUSH_CLOSE_SESSION_INVALID` | `4401` | 该连接的登录会话已被吊销（登出、多端登录挤占、管理员踢出）或已过期。终止性：客户端不得重连，并应进入登出流程。 |
| `PUSH_CLOSE_TOO_MANY_CONNECTIONS` | `4429` | 已达到单用户连接数上限。终止性：在其他连接关闭之前，客户端不得重试。 |

### 类型导出

| 类型 | 说明 |
| --- | --- |
| `PushClientOptions` | `PushClient` 的构造选项。 |
| `PushReconnectOptions` | 重连退避配置。 |
| `PushMessage<TPayload>` | 线路消息信封。 |
| `PushMessageHandler<TPayload>` | `subscribe` 接受的处理函数类型。 |
| `PushStatus` | 连接生命周期状态联合类型。 |
