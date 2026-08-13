---
title: HTTP and API Client
description: HttpClient and ApiClient signatures, options, request lifecycle and token-refresh contracts, file fetching, and the query/mutation function factories.
---

# HTTP and API Client

## `HttpClient`

The low-level HTTP client built on Axios. It handles:

- automatic access-token injection (`Authorization: Bearer …`)
- coordinated token refresh on 401 responses (one shared refresh, abort-aware waiters)
- business error code detection on the response envelope
- authenticated file fetching and browser downloads
- path parameter substitution

### Obtaining an Instance

`HttpClient` can be created with the exported `createHttpClient` factory, but most applications should use `createApiClient` so the HTTP layer is paired with the framework's `QueryClient`. In that path you configure `HttpClientOptions` as `ApiClientOptions.http` and pass them to `createApiClient` (see below); the configured instance is then reachable through the [`HTTP_CLIENT` symbol](#accessing-the-underlying-clients).

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

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `baseUrl` | `string` | — (required) | Base URL of the API; absolute request URLs are still allowed and bypass it |
| `timeout` | `number` | `30000` | Request timeout in ms |
| `getAuthTokens` | `() => Awaitable<Readonly<AuthTokens> \| undefined>` | — | Retrieve current tokens; awaited before every authenticated request |
| `setAuthTokens` | `(tokens: Readonly<AuthTokens>) => Awaitable<void>` | — | Persist refreshed tokens (the object is frozen before it is passed) |
| `refreshToken` | `(tokens: Readonly<AuthTokens>) => Awaitable<Readonly<AuthTokens>>` | — | Refresh callback; receives the current tokens and must return new tokens, or reject on failure |
| `okCode` | `MaybeArray<number>` | `0` | Business success code(s) accepted on the response envelope |
| `tokenExpiredCode` | `MaybeArray<number>` | `[]` | Envelope code(s) on a 401 response that trigger the silent refresh flow |
| `onUnauthenticated` | `() => Awaitable<void>` | — | Called when authentication ultimately fails (401 without a refreshable code, or refresh failure) |
| `onAccessDenied` | `() => Awaitable<void>` | — | Called after a 403 response |
| `showInfoMessage` | `(message: string) => void` | — | Info message handler (falls back to `console.info`) |
| `showWarningMessage` | `(message: string) => void` | — | Warning message handler (falls back to `console.warn`); also used for business-code failures and 400/403 responses |
| `showErrorMessage` | `(message: string) => void` | — | Error message handler (falls back to `console.error`) |
| `defaultBodyEncoding` | `BodyEncoding` | — | Transport encoding applied to every request body by default. Individual requests override it (including `"none"` to opt out); absent means the body is sent verbatim |

### `BodyEncoding`

```ts
type BodyEncoding = "none" | "base64" | "gzip+base64";
```

How a request body is transport-encoded so a code-shaped payload (an integration adapter script, an envelope/auth script) survives middleboxes (WAF / proxy) that false-positive on it. The client adds the `X-Body-Encoding` header; the server's body-encoding middleware reverses it before parsing. Responses ride native HTTP gzip, so nothing changes on the response side.

| Value | Description |
| --- | --- |
| `"none"` | Send the body verbatim (also opts a single request out of a client-wide `defaultBodyEncoding`) |
| `"base64"` | Base64 of the UTF-8 JSON body |
| `"gzip+base64"` | Base64 of a gzip stream of the UTF-8 JSON body — smaller on the wire and still text-shaped. Falls back to `"base64"` when the runtime cannot gzip (`CompressionStream` unavailable) |

When the encoding is applied, the body is JSON-stringified (if not already a string), encoded, and sent as a text payload with the `X-Body-Encoding` header set to the applied encoding. The base64 encoding uses the native `Uint8Array#toBase64` where available, falling back to `btoa` for older runtimes. Multipart (`FormData`), binary (`Blob`), and array-buffer bodies are never encoded — only JSON-shaped payloads are.

### `AuthTokens`

```ts
interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}
```

| Field | Type | Description |
| --- | --- | --- |
| `accessToken` | `string` | The access token injected as `Authorization: Bearer …` |
| `refreshToken` | `string \| undefined` | The refresh token. **Optional since v2.10.0 (breaking)**: it is absent when the backend issues stateful **opaque-token sessions** — the session lives server-side with sliding expiration and there is no refresh round-trip, so the whole refresh flow (`refreshToken` callback, `tokenExpiredCode`) is simply not configured. Only JWT-mode backends return one. |

### Request Defaults

The underlying Axios instance is created with:

- `Content-Type: application/json` request header
- query params serialized with `qs` (`arrayFormat: "repeat"`, `skipNulls: true`)
- `responseType: "json"`, UTF-8 response encoding
- only 2xx statuses treated as success (`validateStatus`)
- `withCredentials: false`

### Request Lifecycle

Every request runs through the client's interceptors in this order:

1. **Refresh gate** — if a token refresh is in progress and the request does not [skip authentication](#skipping-authentication), the request waits for the refresh to settle (see the contract below). If the refresh fails, the request rejects without hitting the network.
2. **Token injection** — `getAuthTokens` is awaited; when it yields an `accessToken`, the `Authorization: Bearer …` header is set. Skip-auth requests bypass both steps and have the marker header stripped before sending.
3. **Path parameter substitution** — see [Path Parameters](#path-parameters).
4. **Response envelope validation** — for regular (non-file) requests, the response body must be a valid [`ApiResult`](#apiresultt) envelope (`code` number, `message` string, `data` present), otherwise a `TypeError("Invalid API response envelope")` is thrown. File requests made through [`requestFile`](#requestfile) / [`download`](#download) are handled in **raw mode** and skip envelope validation.
5. **Business code check** — if `result.code` does not match `okCode`, the message is surfaced through `showWarningMessage` and a [`BusinessError`](#isbusinesserror) is thrown carrying `code`, `message`, and `data`.

HTTP error statuses are handled as:

| Status | Behavior |
| --- | --- |
| 400 | Warning surfaced via `showWarningMessage` with the envelope message |
| 401 | Token refresh flow (below); when a silent refresh + retry succeeds, the retried response is returned to the original caller instead of the stale 401 |
| 403 | Warning surfaced via `showWarningMessage`, then `onAccessDenied` is awaited |
| other | Error surfaced via `showErrorMessage` with the envelope message |

When reading the envelope out of an **error** response, the client also accepts JSON delivered as a string, `Blob`, `ArrayBuffer`, or typed array (as happens for failed file requests), but refuses to parse bodies larger than 1 MiB. Canceled requests (`CanceledError`) rethrow untouched.

### Token Refresh Coordination

On a 401 whose envelope code matches `tokenExpiredCode`, the client publishes **one shared refresh operation** (`getAuthTokens → refreshToken → setAuthTokens`, with the new tokens frozen before persisting). The contract, as implemented:

- Concurrent new requests fired during the refresh wait through request-scoped, **abort-aware** waiters and resume with the renewed token. Canceling a waiting request (via its `signal`) cancels only that request — never the global refresh.
- After a successful refresh, the request whose 401 triggered the refresh retries with the renewed token, and its caller receives the retried response.
- If the refresh fails, `onUnauthenticated` is called **once** — even when the triggering caller was itself canceled in the meantime — and every waiting request rejects.
- A 401 received **while a refresh is already active** means the refresh request itself failed with 401; it throws immediately to avoid a deadlock.
- A 401 whose code does not match `tokenExpiredCode` (or with no envelope) skips refresh entirely and calls `onUnauthenticated` directly.
- Refresh requires all three of `getAuthTokens` / `refreshToken` / `setAuthTokens`; when any is missing, the refresh resolves as failed immediately.

#### `ensureTokenRefreshed`

```ts
public async ensureTokenRefreshed(triggerCallback = true): Promise<boolean>
```

Proactively runs (or joins) the shared token refresh. Useful for external code that manages its own requests — e.g. the fetch-based [SSE client](./sse-motion-dnd-immer.md#sseclient) uses it as its `onTokenExpired` handler. Returns `true` on success. `ensureTokenRefreshed(false)` suppresses the `onUnauthenticated` callback on failure, but only when this call **owns** the refresh cycle (a failure policy already chosen by an in-flight cycle is not overridden).

### HTTP Methods

All request methods accept [`RequestOptions`](#requestoptions) (`signal`, `headers`) plus the per-method fields shown below, and return the parsed [`ApiResult<R>`](#apiresultt) envelope.

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

`upload` sends `multipart/form-data` (Axios `postForm`) and reports progress through Axios upload-progress events. For chunked, resumable uploads against the framework's `sys/storage` backend, use [`Uploader`](./storage.md) instead.

**Body encoding**: `post` and `put` accept an optional `bodyEncoding` field on their options. When set (or when a `defaultBodyEncoding` is configured on the client), the JSON body is transport-encoded to survive middleboxes that false-positive on code-shaped payloads. See [`BodyEncoding`](#bodyencoding) for the encoding values and behavior.

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

Fetches a file as a `Blob` with the **full request semantics of the client** — Bearer injection, 401 refresh, path parameters, abort signal. This is the building block for authenticated file preview (e.g. a file-preview host fetching `priv/` objects).

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `method` | `"get" \| "post"` | `"get"` | HTTP method |
| `data` | `D` | — | Request body (`post` only) |
| `params` | `P` | — | Query / path parameters |
| `onProgress` | `(progress: ProgressEvent) => void` | — | Download-progress callback |
| `signal` | `GenericAbortSignal` | — | Abort signal (from `RequestOptions`) |
| `headers` | `RawAxiosRequestHeaders` | — | Extra headers (from `RequestOptions`) |

Behavior notes:

- The request runs in raw-response mode with `responseType: "arraybuffer"`; the body is normalized to a `Blob` tagged with the response's `Content-Type` (browser `Blob` bodies pass through; Node `ArrayBuffer` / typed-array bodies are copied safely).
- A 2xx response that actually carries the backend's JSON business envelope (≤ 1 MiB) is surfaced as a [`BusinessError`](#isbusinesserror) instead of being returned as file content.
- `filename` is parsed from the `Content-Disposition` response header — the RFC 5987 `filename*` parameter (UTF-8) takes precedence, falling back to the plain `filename` parameter — and is `undefined` when the server sends neither.

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

Fetches the file through [`requestFile`](#requestfile) (inheriting all of its options and semantics) and triggers a browser download via a temporary object URL and a synthetic anchor click; the object URL is revoked afterwards.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `filename` | `string \| ((filename: string) => string)` | server-provided name | Overrides the saved filename. The callback form receives the server-provided filename (or `"download"` when the server sends none) and returns the name to use. |

```ts
await http.download("/file/export", {
  params: { id: 1 },
  filename: name => `backup-${name}`
});
```

### Path Parameters

`:paramName` segments in the URL are substituted from `params` before the request is sent — `/users/:id` with `{ id: 123 }` becomes `/users/123`. The exact substitution rules:

- A parameter only counts at the **start of a path segment** (immediately after a `/`).
- The name must begin with a letter or underscore and may continue with word characters (regex: `/(?<=\/):(?<key>[A-Z_]\w*)/gi`).
- Consequently the port in an absolute URL (`https://host:9000/api`) and a colon inside a segment (`/time/12:30`) are **never** treated as parameters.
- A referenced parameter that is missing from `params`, or whose value is nullish, logs a console warning and substitutes the literal string `unknown`.
- Matched values are stringified with `String(value)`; the used keys are not removed from `params` (they are still serialized into the query string).

### Skipping Authentication

For requests that should not carry the `Authorization` header (login, public endpoints):

```ts
import { skipAuthenticationHeader, skipAuthenticationValue } from "@vef-framework-react/core";

await http.post("/auth/login", {
  data: credentials,
  headers: {
    [skipAuthenticationHeader]: skipAuthenticationValue
  }
});
```

`skipAuthenticationHeader` is `"X-Skip-Authentication"` and `skipAuthenticationValue` is `"1"`. A skip-auth request also bypasses waiting on an in-flight token refresh, and the marker header is stripped before the request leaves the client.

### `ApiResult<T>`

All regular HTTP methods return `ApiResult<T>`:

```ts
interface ApiResult<T = unknown> {
  readonly code: number;
  readonly message: string;
  readonly data: T;
}
```

### `HttpFileResponse`

Returned by [`requestFile`](#requestfile):

| Field | Type | Description |
| --- | --- | --- |
| `blob` | `Blob` | The file content |
| `filename` | `string \| undefined` | Filename parsed from `Content-Disposition`; absent when the server does not send one |

### `RequestOptions`

Common options accepted by every request method:

| Field | Type | Description |
| --- | --- | --- |
| `signal` | `GenericAbortSignal` | Abort signal for the request (also aborts waiting on a shared token refresh) |
| `headers` | `RawAxiosRequestHeaders` | Extra request headers |

### `ProgressEvent`

`type ProgressEvent = AxiosProgressEvent` — the Axios progress event (`loaded`, `total`, `progress`, …) passed to `onProgress` callbacks.

### `isBusinessError`

`BusinessError` is thrown when the response envelope carries a non-OK business code. It extends `Error` with:

| Field | Type | Description |
| --- | --- | --- |
| `name` | `"BusinessError"` | Error name |
| `code` | `number` (readonly) | The business error code from the envelope |
| `message` | `string` | The envelope message |
| `data` | `unknown` (readonly) | The original envelope `data` |

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

Errors therefore split into two families: `BusinessError` (API returned a non-OK business code) and network/Axios errors (4xx/5xx statuses, timeouts, cancellations).

---

## `ApiClient`

`ApiClient` combines `HttpClient` and `QueryClient` into a single object. In most projects, it is created once through `starter.createApiClient()` and shared across the application.

### `createApiClient` (core)

The core-level factory. In application code, prefer `starter.createApiClient()` which adds token storage, message feedback, and unauthenticated handling on top.

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

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `http` | `HttpClientOptions` | — (required) | Options passed to `HttpClient` |
| `query` | `QueryClientOptions` | — | Options passed to `QueryClient` (see [Query and Mutation](./query.md)) |

### Accessing the Underlying Clients

The wrapped clients are exposed through two exported symbols:

```ts
import { HTTP_CLIENT, QUERY_CLIENT } from "@vef-framework-react/core";

const http = apiClient[HTTP_CLIENT];   // Readonly<HttpClient>
const query = apiClient[QUERY_CLIENT]; // QueryClient
```

This is how, for example, [`Uploader`](./storage.md) and [`useUpload`](../hooks/vef-hooks.md#upload-hook) obtain the `HttpClient`.

### `createQueryFn`

Creates a typed query function with automatic abort-signal injection.

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

**Request lifecycle isolation (breaking since v2.11.0):** the `factory` runs **once per query execution**, and each handler receives an invocation-scoped `HttpClient` proxy whose request methods (`get`, `post`, `put`, `delete`, `upload`, `download`, `requestFile`) automatically carry that invocation's `AbortSignal`. When a request passes its own `signal` too, the two signals are combined — aborting either cancels the request. Because the factory re-runs per execution, it must be side-effect-free, must not retain state across executions, and cannot perform one-time setup; keep cross-request state and side effects outside the factory.

The returned function has a `.key` property for use in `queryKey` arrays:

```ts
useQuery({
  queryKey: [findUserPage.key, searchParams],
  queryFn: findUserPage
});
```

### `createMutationFn`

Creates a typed mutation function. Unlike `createQueryFn`, the factory is invoked **once at creation time** (mutations receive no framework-injected signal), so the same handler is reused across mutation executions.

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

### `fetchQuery` and `prefetchQuery`

For imperative data fetching outside React components. Both delegate to the wrapped `QueryClient` and accept TanStack `FetchQueryOptions` (minus `queryHash` / `queryKeyHashFn`, which the framework controls):

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

`fetchQuery` resolves with the data (and rejects on error); `prefetchQuery` resolves with `void` and never throws.

### `executeMutation`

For imperative mutations outside React components (login flows, event handlers). Builds the mutation on the shared mutation cache with `mutationKey: [mutationFn.key]`, so lifecycle callbacks (`onMutate`, `onSuccess`, …), [mutation meta](./query.md#mutation-meta-extensions), and `useHasMutating` matching still work:

```ts
await apiClient.executeMutation({
  mutationFn: login,
  params: { username, password }
});
```

The `params` field is typed after the mutation function: required when `TParams` is required, optional when optional, and forbidden when the mutation takes no parameters.

### `createApiRequest`

Builds an [`ApiRequest`](#apirequest) envelope for the framework's RPC-style endpoints. The three-argument form defaults `version` to `"v1"`; the four-argument form pins an explicit version:

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

The wire-level envelope every framework RPC call shares (e.g. the `sys/storage` upload protocol):

| Field | Type | Description |
| --- | --- | --- |
| `resource` | `string` | The resource the action targets (e.g. `"sys/storage"`) |
| `action` | `string` | The action to invoke on the resource (e.g. `"init_upload"`) |
| `version` | `string` | The action's compatibility version; `createApiRequest` defaults it to `"v1"` |
| `params` | `P \| undefined` | Per-call parameters; shape defined by the target action |
| `meta` | `M \| undefined` | Per-call metadata (e.g. pagination); shape defined by the target action |

### `QueryKey<TParams>`

The typed query key format used throughout the framework:

```ts
type QueryKey<TParams = never> = readonly [Key, ...If<IsNever<TParams>, [], [TParams]>];
```

### `MutationFunction<TData, TParams>`

Extends the TanStack mutation function with a `.key` property for matching in `useHasMutating`.

### `QueryFunction<TData, TParams, TPageParam>`

Extends the TanStack query function with a `.key` property for matching in `useHasFetching`.
