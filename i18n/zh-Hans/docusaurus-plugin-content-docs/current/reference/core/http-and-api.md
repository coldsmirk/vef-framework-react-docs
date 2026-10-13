---
title: HTTP 与 API 客户端
description: HttpClient 与 ApiClient 的签名、选项、请求生命周期与令牌刷新契约、文件获取，以及查询/变更函数工厂。
---

# HTTP 与 API 客户端

## `HttpClient`

基于 Axios 构建的底层 HTTP 客户端，负责处理：

- 自动注入访问令牌（`Authorization: Bearer …`）
- 401 响应时协调式的令牌刷新（一次共享刷新，等待方可感知中止）
- 响应信封上的业务错误码检测
- 可选的 JSON 请求与响应 body AES-GCM 强制保护
- 带鉴权的文件获取与浏览器下载
- 路径参数替换

### 获取实例

`HttpClient` 不直接构造——`createHttpClient` 是内部工厂函数，不从包根导出（根仅将 `HttpClient` 作为**类型**导出）。应用通过将 `HttpClientOptions` 配置为 `ApiClientOptions.http` 并传递给 `createApiClient`（见下文）；随后可通过 [`HTTP_CLIENT` symbol](#访问底层客户端) 获取配置好的实例。

```ts
const httpOptions = {
  baseUrl: "/api",
  timeout: 30_000,
  okCode: 0,
  tokenExpiredCode: 1002,
  getAuthTokens: () => tokenStore.getTokens(),
  setAuthTokens: tokens => tokenStore.setTokens(tokens),
  refreshToken: async tokens => {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tokens)
    });
    return response.json();
  },
  onUnauthenticated: () => router.navigate({ to: "/login" }),
  showErrorMessage: message => notification.error(message)
};
```

### `HttpClientOptions`

| 选项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `baseUrl` | `string` | —（必填） | API 的基础 URL；请求仍可使用绝对 URL，此时会绕过它 |
| `timeout` | `number` | `30000` | 请求超时时间（毫秒） |
| `getAuthTokens` | `() => Awaitable<Readonly<AuthTokens> \| undefined>` | — | 获取当前令牌；每次带鉴权的请求发出前都会等待其完成 |
| `setAuthTokens` | `(tokens: Readonly<AuthTokens>) => Awaitable<void>` | — | 持久化刷新后的令牌（对象在传入前会被冻结） |
| `refreshToken` | `(tokens: Readonly<AuthTokens>) => Awaitable<Readonly<AuthTokens>>` | — | 刷新回调；接收当前令牌，必须返回新令牌，失败时应 reject |
| `okCode` | `MaybeArray<number>` | `0` | 响应信封上可接受的业务成功码 |
| `tokenExpiredCode` | `MaybeArray<number>` | `[]` | 401 响应中触发静默刷新流程的信封错误码 |
| `onUnauthenticated` | `() => Awaitable<void>` | — | 鉴权最终失败时调用（401 且无可刷新的错误码，或刷新失败） |
| `onAccessDenied` | `() => Awaitable<void>` | — | 403 响应后调用 |
| `showInfoMessage` | `(message: string) => void` | — | 信息提示处理函数（缺省回退到 `console.info`） |
| `showWarningMessage` | `(message: string) => void` | — | 警告提示处理函数（缺省回退到 `console.warn`）；也用于业务码失败和 400/403 响应 |
| `showErrorMessage` | `(message: string) => void` | — | 错误提示处理函数（缺省回退到 `console.error`） |
| `defaultBodyEncoding` | `BodyEncoding` | — | 默认应用于每个请求体的传输编码。单个请求可以用 `"none"` 覆盖（即退出默认编码）；未设置时请求体原样发送 |
| `protectedBodyEncoding` | `ProtectedBodyEncodingOptions` | — | 启用 JSON body 的强制双向 AES-GCM 保护。设置后优先于 `defaultBodyEncoding` 和单请求 `bodyEncoding`，且不能用 `"none"` 退出 |

### `BodyEncoding`

```ts
type BodyEncoding = "none" | "base64" | "gzip+base64";
```

请求体的传输编码方式，用于确保代码形态的负载（集成适配器脚本、信封/认证脚本）能通过对其产生误报的中间件（WAF / 代理）。客户端会添加 `X-Body-Encoding` 请求头；服务端的 body-encoding 中间件会在解析前将其还原。响应端走原生 HTTP gzip，故响应侧无变化。

| 值 | 说明 |
| --- | --- |
| `"none"` | 原样发送请求体（也可用于让单个请求退出客户端全局的 `defaultBodyEncoding`） |
| `"base64"` | 对 UTF-8 JSON 请求体做 base64 编码 |
| `"gzip+base64"` | 先 gzip 再 base64 编码 UTF-8 JSON 请求体——线上体积更小，且仍为文本形态。运行时无法 gzip（`CompressionStream` 不可用）时回退为 `"base64"` |

编码生效时，请求体会先 JSON 序列化（若非字符串），编码后以文本负载加上 `X-Body-Encoding` 请求头发送。base64 编码优先使用原生 `Uint8Array#toBase64`，不可用时回退到 `btoa`。`multipart`（`FormData`）、二进制（`Blob`）和数组缓冲区请求体永远不会被编码——仅 JSON 形态的负载会。

### Protected body transport

```ts
type ProtectedBodyEncoding = "aes-gcm+base64";

interface ProtectedBodyEncodingOptions {
  encoding: ProtectedBodyEncoding;
  key: string;
}
```

当 Go 后端以 `aes-gcm+base64` 启用 `vef.api.body_encoding` 时，在前端配置
`protectedBodyEncoding`。key 使用 standard base64，长度必须是 16、24 或 32
字节。本客户端不支持 SM4。

运行时提供 `crypto.subtle` 时，客户端用原生 Web Crypto API 执行 AES-GCM；
否则改用可移植实现（`@noble/ciphers`）（自 v2.23.0 起）。浏览器只在安全上下文
（HTTPS、`localhost`）中提供 `crypto.subtle`，没有这个回退，以纯 HTTP 提供的
页面连客户端都无法构造。两种实现产出的字节完全相同，nonce 的来源
`crypto.getRandomValues` 在两种上下文中都可用。

```ts
const apiClient = createApiClient({
  http: {
    baseUrl: "/api",
    protectedBodyEncoding: {
      encoding: "aes-gcm+base64",
      key: "standard-base64-key"
    }
  }
});
```

wire body 是 standard base64，内容依次为新生成的 12 字节随机 nonce、AES-GCM
ciphertext 以及 16 字节 tag。请求携带
`X-Body-Encoding: aes-gcm+base64`；如果 JSON/信封响应缺少标记或标记不匹配，
客户端会直接拒绝，而不是接受明文降级。multipart 与二进制 body 保持原生格式。

这个传输层带认证且线上非明文，但不能替代 HTTPS：下发到浏览器代码的对称
key 是可以被提取的，没有 TLS 时，链路上的任何人都能从打包产物里读出它——能在
纯 HTTP 下工作，并不等于在纯 HTTP 下安全。后端还必须通过 CORS expose
`X-Body-Encoding`。

### `AuthTokens`

```ts
interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `accessToken` | `string` | 以 `Authorization: Bearer …` 形式注入的访问令牌 |
| `refreshToken` | `string \| undefined` | 刷新令牌。**自 v2.10.0 起为可选（破坏性变更）**：当后端签发有状态的**不透明令牌会话**时不存在该字段——会话保存在服务端并采用滑动过期，没有刷新往返，因此整个刷新流程（`refreshToken` 回调、`tokenExpiredCode`）根本无需配置。只有 JWT 模式的后端才会返回它。 |

### 请求默认值

底层 Axios 实例创建时带有以下配置：

- 请求头 `Content-Type: application/json`
- 查询参数用 `qs` 序列化（`arrayFormat: "repeat"`、`skipNulls: true`）
- `responseType: "json"`，UTF-8 响应编码
- 仅 2xx 状态视为成功（`validateStatus`）
- `withCredentials: false`

### 请求生命周期

每个请求都会按以下顺序经过客户端的拦截器：

1. **刷新闸门**——如果一次令牌刷新正在进行，且该请求没有[跳过鉴权](#跳过鉴权)，则请求会等待刷新完成（契约见下文）。若刷新失败，请求在触达网络之前即被拒绝。
2. **令牌注入**——等待 `getAuthTokens` 完成；当返回值包含 `accessToken` 时，设置 `Authorization: Bearer …` 请求头。跳过鉴权的请求会绕过这两步，且标记请求头在发送前会被剥除。
3. **路径参数替换**——参见[路径参数](#路径参数)。
4. **响应信封校验**——对常规（非文件）请求，响应体必须是有效的 [`ApiResult`](#apiresultt) 信封（`code` 为数字、`message` 为字符串、`data` 存在），否则抛出 `TypeError("Invalid API response envelope")`。通过 [`requestFile`](#requestfile) / [`download`](#download) 发起的文件请求以**原始模式**处理，跳过信封校验。
5. **业务码检查**——如果 `result.code` 与 `okCode` 不匹配，则通过 `showWarningMessage` 提示消息，并抛出携带 `code`、`message` 与 `data` 的 [`BusinessError`](#isbusinesserror)。

HTTP 错误状态的处理方式如下：

| 状态 | 行为 |
| --- | --- |
| 400 | 通过 `showWarningMessage` 以信封消息发出警告提示 |
| 401 | 令牌刷新流程（见下文）；当静默刷新 + 重试成功时，重试后的响应会返回给原始调用方，而不是过期的 401 |
| 403 | 通过 `showWarningMessage` 发出警告提示，然后等待 `onAccessDenied` 完成 |
| 其他 | 通过 `showErrorMessage` 以信封消息发出错误提示 |

从**错误**响应中读取信封时，客户端还接受以字符串、`Blob`、`ArrayBuffer` 或类型化数组形式承载的 JSON（文件请求失败时会出现这种情况），但拒绝解析大于 1 MiB 的响应体。被取消的请求（`CanceledError`）会原样重新抛出。

### 令牌刷新协调

当 401 响应的信封错误码与 `tokenExpiredCode` 匹配时，客户端会发布**一次共享的刷新操作**（`getAuthTokens → refreshToken → setAuthTokens`，新令牌在持久化前会被冻结）。契约（按实际实现）：

- 刷新期间发起的新并发请求，会通过请求作用域、**可感知中止**的等待器等待刷新完成，然后携带更新后的令牌继续。取消一个等待中的请求（通过其 `signal`）只会取消该请求——绝不会取消全局刷新。
- 刷新成功后，触发刷新的那个 401 请求会携带更新后的令牌重试，其调用方收到的是重试后的响应。
- 若刷新失败，`onUnauthenticated` 只会被调用**一次**——即使触发方自身在此期间已被取消——并且所有等待中的请求都会被拒绝。
- **刷新已在进行中**时收到的 401，意味着刷新请求本身以 401 失败；它会立即抛出以避免死锁。
- 错误码与 `tokenExpiredCode` 不匹配（或没有信封）的 401 会完全跳过刷新，直接调用 `onUnauthenticated`。
- 刷新要求 `getAuthTokens` / `refreshToken` / `setAuthTokens` 三者齐备；缺少任何一个时，刷新立即以失败结束。

#### `ensureTokenRefreshed`

```ts
public async ensureTokenRefreshed(triggerCallback = true): Promise<boolean>
```

主动执行（或加入）共享的令牌刷新。适用于自行管理请求的外部代码——例如基于 fetch 的 [SSE 客户端](./sse-motion-dnd-immer.md#sseclient)将其用作 `onTokenExpired` 处理函数。成功时返回 `true`。`ensureTokenRefreshed(false)` 会在失败时抑制 `onUnauthenticated` 回调，但仅当本次调用**拥有**该刷新周期时生效（不会覆盖进行中的刷新周期已选定的失败策略）。

### HTTP 方法

所有请求方法都接受 [`RequestOptions`](#requestoptions)（`signal`、`headers`）以及下方所示的各方法专属字段，并返回解析后的 [`ApiResult<R>`](#apiresultt) 信封。

```ts
// GET — get<R = unknown, P = unknown>(url, options?: RequestOptions & { params?: P })
const result = await http.get<UserInfo>("/user/info", { params: { id: 1 } });

// POST — post<R = unknown, D = unknown, P = unknown>(url, options?: RequestOptions & { data?: D; params?: P; bodyEncoding?: BodyEncoding })
const result = await http.post<CreateResult>("/user/create", { data: payload });

// PUT — put<R = unknown, D = unknown, P = unknown>(url, options?: RequestOptions & { data?: D; params?: P; bodyEncoding?: BodyEncoding })
const result = await http.put<void>("/user/update", { data: payload });

// DELETE — delete<R = unknown, P = unknown>(url, options?: RequestOptions & { params?: P })
const result = await http.delete<void>("/user/delete", { params: { id: 1 } });

// Upload — upload<R = unknown, P = unknown>(url, options?: RequestOptions & {
//   params?: P; data: FormData; onProgress?: (event: ProgressEvent) => void
// })
const result = await http.upload<UploadResult>("/file/upload", {
  data: formData,
  onProgress: event => console.log(event.loaded / event.total)
});
```

`upload` 发送 `multipart/form-data`（Axios `postForm`），并通过 Axios 上传进度事件报告进度。若需面向框架 `sys/storage` 后端的分片、可断点续传上传，请改用 [`Uploader`](./storage.md)。

**请求体编码**：`post` 和 `put` 在选项上接受可选的 `bodyEncoding` 字段。设置后（或客户端配置了 `defaultBodyEncoding` 时），JSON 请求体会被传输编码，以通过对其代码形态产生误报的中间件。参见 [`BodyEncoding`](#bodyencoding) 了解编码值及行为。

### `requestFile`

```ts
public async requestFile<D = unknown, P = unknown>(
  url: string,
  options?: RequestOptions & {
    method?: "get" | "post";
    data?: D;
    params?: P;
    onProgress?: (progress: ProgressEvent) => void;
  }
): Promise<HttpFileResponse>
```

以 `Blob` 形式获取文件，并具备**客户端完整的请求语义**——Bearer 注入、401 刷新、路径参数、中止信号。这是带鉴权文件预览（例如文件预览宿主获取 `priv/` 对象）的构建基石。

| 选项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `method` | `"get" \| "post"` | `"get"` | HTTP 方法 |
| `data` | `D` | — | 请求体（仅 `post`） |
| `params` | `P` | — | 查询 / 路径参数 |
| `onProgress` | `(progress: ProgressEvent) => void` | — | 下载进度回调 |
| `signal` | `GenericAbortSignal` | — | 中止信号（来自 `RequestOptions`） |
| `headers` | `RawAxiosRequestHeaders` | — | 额外请求头（来自 `RequestOptions`） |

行为说明：

- 请求以原始响应模式运行，`responseType: "arraybuffer"`；响应体会被规范化为带有响应 `Content-Type` 标记的 `Blob`（浏览器的 `Blob` 响应体直接透传；Node 的 `ArrayBuffer` / 类型化数组响应体会被安全复制）。
- 一个实际携带后端 JSON 业务信封（≤ 1 MiB）的 2xx 响应，会以 [`BusinessError`](#isbusinesserror) 的形式抛出，而不是作为文件内容返回。
- `filename` 从 `Content-Disposition` 响应头解析——RFC 5987 的 `filename*` 参数（UTF-8）优先，其次回退到普通的 `filename` 参数——服务端两者都未发送时为 `undefined`。

```ts
const { blob, filename } = await http.requestFile("/file/preview", {
  params: { id: 1 },
  signal: controller.signal
});
```

### `download`

```ts
public async download<D = unknown, P = unknown>(
  url: string,
  options?: RequestOptions & {
    method?: "get" | "post";
    data?: D;
    params?: P;
    onProgress?: (progress: ProgressEvent) => void;
    filename?: string | ((filename: string) => string);
  }
): Promise<void>
```

通过 [`requestFile`](#requestfile) 获取文件（继承其全部选项与语义），并借助临时对象 URL 与合成的锚点点击触发浏览器下载；对象 URL 事后会被回收。

| 选项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `filename` | `string \| ((filename: string) => string)` | 服务端提供的文件名 | 覆盖保存的文件名。回调形式接收服务端提供的文件名（服务端未发送时为 `"download"`），返回实际使用的名称。 |

```ts
await http.download("/file/export", {
  params: { id: 1 },
  filename: name => `backup-${name}`
});
```

### 路径参数

URL 中的 `:paramName` 片段会在请求发送前由 `params` 替换——`/users/:id` 配合 `{ id: 123 }` 会变成 `/users/123`。确切的替换规则：

- 参数仅在**路径片段起始处**（紧跟 `/` 之后）才算数。
- 参数名必须以字母或下划线开头，后续可为单词字符（正则：`/(?<=\/):(?<key>[A-Z_]\w*)/gi`）。
- 因此，绝对 URL 中的端口（`https://host:9000/api`）和片段内部的冒号（`/time/12:30`）**永远不会**被当作参数。
- 被引用的参数在 `params` 中缺失、或其值为空值（nullish）时，会输出一条控制台警告，并以字面量字符串 `unknown` 替换。
- 匹配到的值用 `String(value)` 字符串化；已使用的 key 不会从 `params` 中移除（它们仍会被序列化进查询字符串）。

### 跳过鉴权

对于不应携带 `Authorization` 请求头的请求（登录、公开端点）：

```ts
import { skipAuthenticationHeader, skipAuthenticationValue } from "@vef-framework-react/core";

await http.post("/auth/login", {
  data: credentials,
  headers: {
    [skipAuthenticationHeader]: skipAuthenticationValue
  }
});
```

`skipAuthenticationHeader` 为 `"X-Skip-Authentication"`，`skipAuthenticationValue` 为 `"1"`。跳过鉴权的请求也不会等待进行中的令牌刷新，且标记请求头会在请求离开客户端之前被剥除。

### `ApiResult<T>`

所有常规 HTTP 方法都返回 `ApiResult<T>`：

```ts
interface ApiResult<T = unknown> {
  readonly code: number;
  readonly message: string;
  readonly data: T;
}
```

### `HttpFileResponse`

由 [`requestFile`](#requestfile) 返回：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `blob` | `Blob` | 文件内容 |
| `filename` | `string \| undefined` | 从 `Content-Disposition` 解析出的文件名；服务端未发送时缺省 |

### `RequestOptions`

每个请求方法都接受的通用选项：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `signal` | `GenericAbortSignal` | 请求的中止信号（也会中止对共享令牌刷新的等待） |
| `headers` | `RawAxiosRequestHeaders` | 额外请求头 |

### `ProgressEvent`

`type ProgressEvent = AxiosProgressEvent`——传给 `onProgress` 回调的 Axios 进度事件（`loaded`、`total`、`progress` 等）。

### `isBusinessError`

当响应信封携带非成功业务码时抛出 `BusinessError`。它在 `Error` 基础上扩展了：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `name` | `"BusinessError"` | 错误名称 |
| `code` | `number`（只读） | 信封中的业务错误码 |
| `message` | `string` | 信封消息 |
| `data` | `unknown`（只读） | 信封中原始的 `data` |

```ts
import { isBusinessError } from "@vef-framework-react/core";

try {
  await http.post("/user/create", { data: payload });
} catch (error) {
  if (isBusinessError(error)) {
    // error.code, error.message, error.data are available
  }
}
```

因此错误分为两族：`BusinessError`（API 返回了非成功业务码）与网络/Axios 错误（4xx/5xx 状态、超时、取消）。

---

## `ApiClient`

`ApiClient` 将 `HttpClient` 和 `QueryClient` 组合为单一对象。在大多数项目中，它通过 `starter.createApiClient()` 创建一次，并在整个应用中共享。

### `createApiClient`（core）

core 层级的工厂函数。在应用代码中，优先使用 `starter.createApiClient()`，它在此基础上增加了令牌存储、消息反馈和未鉴权处理。

```ts
import { createApiClient } from "@vef-framework-react/core";

const apiClient = createApiClient({
  http: {
    baseUrl: "/api",
    okCode: 0
  },
  query: {
    staleTime: 5_000,
    gcTime: 300_000
  }
});
```

### `ApiClientOptions`

| 选项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `http` | `HttpClientOptions` | —（必填） | 传递给 `HttpClient` 的选项 |
| `query` | `QueryClientOptions` | — | 传递给 `QueryClient` 的选项（参见[查询与变更](./query.md)） |

### 访问底层客户端

被包装的两个客户端通过两个导出的 symbol 暴露：

```ts
import { HTTP_CLIENT, QUERY_CLIENT } from "@vef-framework-react/core";

const http = apiClient[HTTP_CLIENT];   // Readonly<HttpClient>
const query = apiClient[QUERY_CLIENT]; // QueryClient
```

例如，[`Uploader`](./storage.md) 和 [`useUpload`](../hooks/vef-hooks.md#上传-hook) 正是通过这种方式获取 `HttpClient` 的。

### `createQueryFn`

创建一个带有自动 abort signal 注入的类型化查询函数。

```ts
export const findUserPage = apiClient.createQueryFn(
  "find_user_page",
  http => async (params, pageParam, meta) => {
    const result = await http.post("/user/page", { data: params });
    return result.data;
  }
);
```

```ts
createQueryFn<TResult = unknown, TParams = never, TPageParam = never>(
  key: string,
  factory: (http: Readonly<HttpClient>) => (
    queryParams: TParams,
    pageParam: TPageParam,
    meta?: QueryMeta
  ) => Awaitable<TResult>
): QueryFunction<TResult, TParams, TPageParam>
```

**请求生命周期隔离（自 v2.11.0 起的破坏性变更）：** `factory` 在**每次查询执行时运行一次**，每个处理函数收到的是一个以本次调用为作用域的 `HttpClient` 代理，其请求方法（`get`、`post`、`put`、`delete`、`upload`、`download`、`requestFile`）自动携带本次调用的 `AbortSignal`。当某个请求还传入了自己的 `signal` 时，两个信号会被合并——中止任意一个都会取消该请求。由于 factory 每次执行都会重新运行，它必须无副作用、不得在多次执行之间保留状态、也不能执行一次性的初始化；跨请求状态与副作用应放在 factory 之外。

返回的函数带有 `.key` 属性，可用于 `queryKey` 数组：

```ts
useQuery({
  queryKey: [findUserPage.key, searchParams],
  queryFn: findUserPage
});
```

### `createMutationFn`

创建一个类型化的变更函数。与 `createQueryFn` 不同，factory 在**创建时仅调用一次**（变更不会收到框架注入的信号），因此同一个处理函数会在多次变更执行之间复用。

```ts
createMutationFn<TResult = unknown, TParams = never>(
  key: string,
  factory: (http: Readonly<HttpClient>) => (params: TParams) => Awaitable<TResult>
): MutationFunction<TResult, TParams>
```

```ts
export const createUser = apiClient.createMutationFn(
  "create_user",
  http => params => http.post("/user/create", { data: params })
);
```

### `fetchQuery` 和 `prefetchQuery`

用于在 React 组件之外进行命令式数据获取。两者都委托给被包装的 `QueryClient`，并接受 TanStack 的 `FetchQueryOptions`（除去由框架控制的 `queryHash` / `queryKeyHashFn`）：

```ts
const userInfo = await apiClient.fetchQuery({
  queryKey: [getUserInfo.key, { id: 1 }],
  queryFn: getUserInfo
});

await apiClient.prefetchQuery({
  queryKey: [getUserInfo.key, { id: 1 }],
  queryFn: getUserInfo
});
```

`fetchQuery` 以数据 resolve（出错时 reject）；`prefetchQuery` 以 `void` resolve 且从不抛出。

### `executeMutation`

用于在 React 组件之外进行命令式变更（登录流程、事件处理器）。它在共享的 mutation 缓存上以 `mutationKey: [mutationFn.key]` 构建变更，因此生命周期回调（`onMutate`、`onSuccess` 等）、[mutation meta](./query.md#mutation-meta-扩展) 以及 `useHasMutating` 的匹配仍然生效：

```ts
await apiClient.executeMutation({
  mutationFn: login,
  params: { username, password }
});
```

`params` 字段的类型随变更函数而定：`TParams` 必填时它必填，可选时它可选，变更不接受参数时则禁止传入。

### `createApiRequest`

为框架的 RPC 风格端点构建 [`ApiRequest`](#apirequest) 信封。三参数形式将 `version` 默认为 `"v1"`；四参数形式则固定显式版本：

```ts
import { createApiRequest } from "@vef-framework-react/core";

// Default version ("v1")
createApiRequest("sys/storage", "abort_upload", { claimId });

// Explicit version
createApiRequest("sys/storage", "init_upload", "v2", { filename, size });
```

```ts
function createApiRequest<P extends object, M extends object>(
  resource: string,
  action: string,
  params?: P,
  meta?: M
): ApiRequest<P, M>;
function createApiRequest<P extends object, M extends object>(
  resource: string,
  action: string,
  version: string,
  params?: P,
  meta?: M
): ApiRequest<P, M>;
```

### `ApiRequest`

框架所有 RPC 调用（例如 `sys/storage` 上传协议）共享的线路级信封：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `resource` | `string` | 动作所针对的资源（例如 `"sys/storage"`） |
| `action` | `string` | 要在该资源上调用的动作（例如 `"init_upload"`） |
| `version` | `string` | 动作的兼容版本；`createApiRequest` 默认为 `"v1"` |
| `params` | `P \| undefined` | 每次调用的参数；结构由目标动作定义 |
| `meta` | `M \| undefined` | 每次调用的元数据（例如分页）；结构由目标动作定义 |

### `QueryKey<TParams>`

框架中通用的类型化查询键格式：

```ts
type QueryKey<TParams = never> = readonly [Key, ...If<IsNever<TParams>, [], [TParams]>];
```

### `MutationFunction<TData, TParams>`

在 TanStack 的变更函数基础上扩展了 `.key` 属性，用于 `useHasMutating` 中的匹配。

### `QueryFunction<TData, TParams, TPageParam>`

在 TanStack 的查询函数基础上扩展了 `.key` 属性，用于 `useHasFetching` 中的匹配。
