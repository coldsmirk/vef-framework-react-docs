---
title: 服务端推送
description: 如何接入 vef 服务端推送通道——一个应用级 PushClient、基于 usePushMessage 的类型化消息信封订阅，以及重连与登出生命周期。
---

# 服务端推送

有些 UI 需要在用户没有主动操作的情况下响应服务器上发生的事情：一条审批任务落入某人的收件箱、一个导入作业完成、管理员吊销了某个会话。vef 服务端推送（server push）通道正是为此而生——后端通过 WebSocket 向每个已连接的客户端推送小的 JSON 消息信封（envelope），**仅下行**（客户端永远不会通过这条通道向上发送应用消息）。

`@vef-framework-react/core` 提供客户端（`PushClient` / `createPushClient`），`@vef-framework-react/hooks` 提供 React 适配层（`usePushMessage`）。本页介绍如何把它们接入应用；详尽的 API——每个选项、状态与关闭码——见 [服务端推送（参考）](../reference/core/push.md)。

## 心智模型：是提示，不是状态

按服务器契约，这条通道的投递是**尽力而为**的。消息可能被错过（标签页正在重连、笔记本合上了盖子），因此要把每条推送消息当作实时*提示*，把可靠状态留在常规 API 后面：

- **应该：**收到 `"order.status_changed"` 时，使订单查询失效，让表格重新拉取。
- **不应该：**用 `message.payload` 直接修补行数据，并把它当作事实来源。

每条消息都以统一的线上信封 `PushMessage` 到达：

```ts
interface PushMessage<TPayload = unknown> {
  id: string;        // server-generated message id
  type: string;      // business-defined discriminator handlers subscribe on
  payload?: TPayload; // arbitrary JSON payload; absent when the server sent none
  time: string;      // server-side send time (RFC 3339)
}
```

`type` 是路由键——订阅者按类型注册，payload 的形态则是你的后端与处理器之间按类型约定的契约。

## 创建一个应用级客户端

推送通道的设计是**每个已登录用户一条连接**，由整个应用共享。请在模块作用域用 `createPushClient` 只创建一次客户端，并接好认证与两种终止性服务器信号：

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

构造客户端**不会**打开连接。请在登录成功后连接，在登出时关闭：

```ts
// after login succeeds (e.g. alongside your post-login navigation)
pushClient.connect();

// on logout — close() is the app-driven exit; it stops any reconnecting
pushClient.close();
```

`connect()` 可以安全地重复调用——只要会话仍然活跃（状态不是 `"idle"` 或 `"closed"`），它就是空操作，因此在可能执行两次的布局 effect 里调用它也没有问题。

## 订阅消息

`subscribe(type, handler)` 为某一种信封类型注册处理器，并返回取消订阅函数。特殊类型 `"*"` 会收到所有消息：

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

订阅注册表有三条在实践中重要的性质：

- **订阅与连接相互独立。**可以在 `connect()` 之前就订阅，订阅能跨越重连乃至 `close()`/`connect()` 循环——什么都不需要重新注册。
- **顺序：**对同一条消息，订阅其精确 `type` 的处理器先于 `"*"` 处理器运行。
- **payload 泛型是断言，不是校验。**`subscribe<OrderStatusPayload>` 只为你的处理器提供类型；客户端不会检查线上数据的形态。畸形帧会在任何处理器运行之前被丢弃：非字符串帧被静默丢弃；无法解析的 JSON 或缺少非空字符串 `type` 的帧则在打印一条控制台警告后丢弃。

## 在组件中订阅：`usePushMessage`

在 React 代码中，请使用 `@vef-framework-react/hooks` 的 `usePushMessage`，而不是手动调用 `subscribe`——它把订阅绑定到组件生命周期上，并在卸载时自动取消订阅：

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

每当 `client`、`type` 或 `handler` 的引用变化时，hook 都会重新订阅。内联箭头函数没问题——重新订阅的开销很低——但如果组件以很高的频率重渲染，请用 `useCallback` 稳定处理器，让这个 effect 保持安静。

## 重连的实际行为

传输层的断连（服务器重启、网络抖动）会自动重连；应用层的退出则不会。确切行为如下：

- 每次重试等待 `min(maxDelay, initialDelay * 2 ** attempts)`，再叠加最多 30% 的随机抖动，避免一批客户端在服务器重启后同时冲击服务器。默认值：`initialDelay` 1000 ms、`maxDelay` 30000 ms；连接一旦打开，尝试计数器就会重置。
- 每次重连尝试都会重新读取 `getAuthTokens`，因此期间刷新过的令牌会被自动使用。
- 两个关闭码是**终止性**的，永不重连：`4401`（会话被吊销或过期 → `onSessionInvalid`）和 `4429`（达到每用户连接上限 → `onConnectionRejected`）。
- `close()` 对本次会话同样是终止性的：它会取消任何待执行的重试，并停在 `"closed"` 状态。
- 传入 `reconnect: { enabled: false }` 可完全禁用自动重连。
- 客户端没有心跳——存活检测委托给服务器和 WebSocket 的关闭事件。

客户端在两次连接之间由服务器发出的消息会**丢失**——这正是处理器应当重新拉取数据、而不是累积 payload 的原因。

## 推送通道 vs SSE

`@vef-framework-react/core` 也提供了 SSE 客户端（`SseClient` / `createSseClient`）。二者解决的是不同的问题——不要用 SSE 来搭建通知系统，也不要用推送通道来流式传输单个响应：

| | `PushClient`（推送通道） | `SseClient`（SSE 辅助） |
| --- | --- | --- |
| 形态 | 一条长期存活的应用级 WebSocket | 每次 `stream()` 调用对应一个 HTTP 流式请求 |
| 方向 | 服务器发起的事件，仅下行 | 你发起的请求的响应流 |
| 寻址 | 按信封 `type` 路由，多订阅者 | 每个流一个 `onMessage` 处理器 |
| 认证 | 访问令牌放在 `__accessToken` 查询参数里，每次（重）连接重新读取 | `Authorization` 请求头，并带 `onTokenExpired` 刷新重试钩子 |
| 重试 | 带抖动的指数退避，直到遇到终止性关闭码 | 每个流有限次重试（`maxRetries`，默认 3） |
| 典型用途 | 通知、收件箱角标、缓存失效提示 | AI Token 流、单个请求的长时作业进度 |

参考级的对比见 [SSE 与 Push 对比](../reference/core/sse-motion-dnd-immer.md#sse-与-push-对比)。

## 端到端示例

一个"审批任务实时更新"的真实接线：一个模块作用域的客户端，由认证流程负责连接，被两个组件消费。

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

任务列表页本身完全不需要任何推送代码——使 `[findMyTaskPage.key]` 失效会让所有挂载中的、使用该键的查询重新拉取，因此表格、角标计数以及其它任何基于同一查询函数的内容都会一起更新。这就是推荐的分工方式：一个桥接组件负责连接生命周期与缓存失效；功能组件保持为纯粹的查询消费者。

## 推荐用法

- 每个应用只在模块作用域创建一个 `PushClient`；不要在组件内构造客户端。
- 登录后连接、登出时 `close()`——并把 `onSessionInvalid`（4401）当作来自服务器的登出信号。
- 让处理器使查询失效，而不是把 payload 写入状态；payload 是提示，不是记录本身。
- 像权限令牌一样为信封类型加命名空间（`approval.task_created`、`order.status_changed`），让通配符工具和日志过滤器保持可用。
- 若要流式传输单个长请求的输出（AI 响应、作业进度），请改用 SSE 客户端——见上表。
