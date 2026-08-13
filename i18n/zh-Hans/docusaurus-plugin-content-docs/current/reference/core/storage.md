---
title: 存储与文件上传
description: Uploader 及其选项，以及断点续传所依赖的持久化与指纹计算原语。
---

# 存储与文件上传

`@vef-framework-react/core` 提供了一个基于框架 `sys/storage` 后端资源构建的分片、可断点续传的文件上传客户端。它负责分片切分、有限并发的分片上传、带退避的重试，以及（可选启用的）跨页面刷新恢复中断上传。

关于 React Hook 适配层，参见 `@vef-framework-react/hooks` 中的 [`useUpload`](../hooks/vef-hooks.md#上传-hook)——它为最常见的单任务上传场景封装了本页的全部能力。若需并行/批量上传，请直接使用 `Uploader`。

## `Uploader`

驱动单个文件完成后端 `sys/storage` 资源暴露的四步协议（`init_upload → upload_part* → complete_upload`）。**一次性使用**：已完成或已失败的运行无法重新启动——每个文件都应创建一个全新的 `Uploader`。

```tsx
import { HTTP_CLIENT, Uploader, useApiClient } from "@vef-framework-react/core";

const apiClient = useApiClient();
const http = apiClient[HTTP_CLIENT];

const uploader = new Uploader(http, file, {
  onProgress: progress => console.log(progress.percent),
  onStatusChange: status => console.log(status)
});

const result = await uploader.start();
// result: { bucket, key, eTag, size, contentType, lastModified, originalFilename, metadata? }
```

### 构造函数

```ts
new Uploader(http: Readonly<HttpClient>, file: Blob, options?: UploaderOptions)
```

`http` 是从 `apiClient[HTTP_CLIENT]` 获取的 `HttpClient`（参见 [HTTP 与 API 客户端](./http-and-api.md)）。当 `file` 是普通 `Blob` 而非 `File` 时，必须通过 `options.init.filename` 提供文件名。

### `UploaderOptions`

| 选项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `apiPath` | `string` | `"/api"` | RPC 入口 URL |
| `resource` | `string` | `"sys/storage"` | RPC 资源名 |
| `version` | `string` | `"v1"` | RPC 版本 |
| `init` | `UploadInit` | — | 后端会话的初始化时覆盖项 |
| `partConcurrency` | `number` | `3` | 并行上传的最大分片数 |
| `maxPartRetries` | `number` | `3` | 每个分片的重试预算（首次尝试计为 1 次） |
| `retryBaseDelay` | `number` | `500` | 分片重试指数退避的基础延迟（毫秒） |
| `retryMaxDelay` | `number` | `8000` | 单次重试的最大等待延迟（毫秒） |
| `signal` | `AbortSignal` | — | 外部中止信号，与上传器内部的控制器组合生效 |
| `onProgress` | `(progress: UploadProgress) => void` | — | 每次分片进度更新时调用 |
| `onStatusChange` | `(status: UploadStatus) => void` | — | 每次 `UploadStatus` 变化时调用 |
| `onSessionOpened` | `(session: UploadSessionSnapshot) => void` | — | 后端确认上传会话（无论是新建还是续传）后调用一次 |

### `UploadInit`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `filename` | `string` | 覆盖原始文件名；默认为 `file.name` |
| `contentType` | `string` | 覆盖声明的 MIME 类型；默认为 `file.type` |
| `public` | `boolean` | 为 `true` 时对象落入 `pub/`（匿名可读），否则落入 `priv/`（需鉴权读取） |

### `UploadProgress`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `loaded` | `number` | 已确认的字节数（不会超过 `total`） |
| `total` | `number` | 文件总字节数 |
| `partsCompleted` | `number` | 后端已完全接受的分片数 |
| `partsTotal` | `number` | 上传计划中的分片总数 |
| `percent` | `number` | `loaded / total`，四舍五入为整数百分比 |

### `UploadStatus`

```ts
type UploadStatus =
  | "idle"
  | "initializing"
  | "uploading"
  | "completing"
  | "aborting"
  | "succeeded"
  | "failed"
  | "aborted";
```

状态转换是线性的，直至到达终态（`succeeded`、`failed`、`aborted`）。

### `UploadResult`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `bucket` | `string` | 后端存储桶名称 |
| `key` | `string` | 对象键（带 `pub/` 或 `priv/` 前缀） |
| `eTag` | `string` | 后端分配的 ETag |
| `size` | `number` | 最终对象大小（字节） |
| `contentType` | `string` | 存储的内容类型 |
| `lastModified` | `string` | ISO-8601 时间戳 |
| `originalFilename` | `string` | 上传过程中跟踪的文件名 |
| `metadata` | `Record<string, string> \| undefined` | 后端附加的元数据 |

### 实例 API

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `status` | `UploadStatus`（getter） | 当前生命周期状态 |
| `progress` | `UploadProgress`（getter） | 最新的聚合进度快照 |
| `start(plan?)` | `(plan?: ResumePlan) => Promise<UploadResult>` | 启动上传；重复调用返回同一个 Promise。传入 `{ kind: "resume", ... }` 形态的计划（见下文）可跳过 `init_upload`，续传此前的会话 |
| `abort()` | `() => Promise<void>` | 取消进行中的上传，并尽力中止后端会话；在任何状态下调用都是安全的 |

### `uploadFile`

构造 `Uploader` 并立即启动它的便捷包装函数：

```ts
import { uploadFile } from "@vef-framework-react/core";

const result = await uploadFile(http, file, { onProgress: p => console.log(p.percent) });
```

当 UI 需要调用 `abort()` 或独立于返回的 Promise 观察 `status` 变化时，请直接使用 `Uploader` 类。

## 续传中断的上传

续传能力是可选启用的，涉及两个关注点：在本地持久化 `ResumeRecord`，以及在决定是否续传前向后端确认哪些分片已经上传成功。

### `resolveResumePlan`

根据给定的文件指纹计算 `ResumePlan`：查找持久化的记录，对照系统时钟和后端实时的 `list_parts` 结果进行校验，并将结果交给调用方提供的决策处理函数。

```ts
import { LocalStoragePersistence, PrefixFingerprinter, resolveResumePlan } from "@vef-framework-react/core";

const persistence = new LocalStoragePersistence();
const fingerprinter = new PrefixFingerprinter();
const fingerprint = await fingerprinter.fingerprint(file);

const plan = await resolveResumePlan({
  fingerprint,
  persistence,
  ctx: { http, apiPath: "/api", resource: "sys/storage", version: "v1" },
  onResumeDetected: async candidate => {
    const resume = window.confirm(`Resume uploading ${candidate.record.key}?`);
    return resume ? { kind: "resume" } : { kind: "discard" };
  }
});

const result = await uploader.start(plan);
```

如果未提供 `onResumeDetected` 处理函数，默认决策为 `{ kind: "discard" }`——续传错文件远比一次多余的全新上传更糟糕。

### `ResolveResumeInputs`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `fingerprint` | `string` | 文件的稳定标识，由 `FileFingerprinter` 计算得出 |
| `persistence` | `ResumablePersistence` | 续传记录的读写来源 |
| `ctx` | `ProtocolContext` | `{ http, apiPath, resource, version }`——与 `Uploader` 内部构建的形状相同 |
| `onResumeDetected` | `ResumeDecisionHandler` | 可选；默认始终丢弃 |
| `signal` | `GenericAbortSignal` | 用于正在进行的 `list_parts` / abort 调用的可选取消信号 |

### `ResumePlan`

```ts
type ResumePlan =
  | { kind: "fresh" }
  | {
      kind: "resume";
      claimId: string;
      key: string;
      partSize: number;
      partCount: number;
      expiresAt: string;
      completedParts: readonly ListedPart[];
    };
```

### `ResumeCandidate` 与 `ResumeDecision`

| 类型 | 形状 | 说明 |
| --- | --- | --- |
| `ResumeCandidate` | `{ record: ResumeRecord; completedParts: ListedPart[] }` | 传递给 `onResumeDetected`；`completedParts` 是实时的 `list_parts` 结果，而非持久化记录本身 |
| `ResumeDecision` | `{ kind: "resume" } \| { kind: "discard" }` | 调用方的选择 |
| `ResumeDecisionHandler` | `(candidate: ResumeCandidate) => Promise<ResumeDecision>` | 处理函数类型 |

## 持久化

### `ResumablePersistence`

`ResumeRecord` 值的可插拔存储接口。

```ts
interface ResumablePersistence {
  load: (fingerprint: string) => Promise<ResumeRecord | null>;
  save: (record: ResumeRecord) => Promise<void>;
  remove: (fingerprint: string) => Promise<void>;
}
```

### `LocalStoragePersistence`

默认实现，基于 `window.localStorage`。

```ts
import { LocalStoragePersistence } from "@vef-framework-react/core";

const persistence = new LocalStoragePersistence(); // keys namespaced under "__VEF_UPLOAD_RESUME__"
```

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| constructor | `(keyPrefix?: string)` | 存储键的命名空间前缀（默认 `"__VEF_UPLOAD_RESUME__"`） |
| `clearAll()` | `() => Promise<void>` | 丢弃该实例拥有的全部记录（按其键前缀匹配）；在退出登录/切换账号时调用 |

### `ResumeRecord`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `fingerprint` | `string` | 查找键，由 `FileFingerprinter` 计算得出 |
| `claimId` | `string` | 服务端分配的 claim ID |
| `key` | `string` | 后端分配的对象键 |
| `partSize` | `number` | 后端权威的分片大小 |
| `partCount` | `number` | 计划的分片总数 |
| `expiresAt` | `string` | ISO-8601 过期时间 |
| `savedAt` | `number` | 记录最后写入时的 `Date.now()` |

## 指纹计算

### `FileFingerprinter`

```ts
interface FileFingerprinter {
  fingerprint: (file: File) => Promise<string>;
}
```

| 实现 | 依据 | 说明 |
| --- | --- | --- |
| `WeakFingerprinter` | `name:size:lastModified` | 同步、始终可用；若内容变化但未改变文件名/大小/修改时间，会发生碰撞 |
| `PrefixFingerprinter` | `WeakFingerprinter` 的字段加上文件前 4 MiB 的 SHA-256（窗口大小可通过构造函数的 `prefixBytes` 参数覆盖） | 需要 `crypto.subtle`；不可用时会同步抛出异常——此时应回退到 `WeakFingerprinter` |

## 常量与错误

| 导出 | 值 | 说明 |
| --- | --- | --- |
| `STORAGE_API_PATH` | `"/api"` | 默认 `apiPath` |
| `STORAGE_RESOURCE` | `"sys/storage"` | 上传协议 RPC 的默认 `resource` |
| `STORAGE_FILE_RESOURCE` | `"sys/storage/file"` | 文件解析 RPC（`resolveFiles`）的默认 `resource` |
| `STORAGE_VERSION` | `"v1"` | 默认 `version` |
| `PUBLIC_PREFIX` | `"pub/"` | 匿名可读对象的键前缀 |
| `PRIVATE_PREFIX` | `"priv/"` | 需鉴权读取对象的键前缀 |

| 错误 | 继承自 | 触发时机 |
| --- | --- | --- |
| `UploadError` | `Error` | 所有存储错误的基类；`instanceof UploadError` 可用于区分上传器故障 |
| `UploadAbortedError` | `UploadError` | 调用方（或外部信号）取消了进行中的上传 |
| `UploadProtocolError` | `UploadError` | 协议 RPC（`init_upload` / `complete_upload` / `abort_upload` / `list_parts`）发生不可恢复的失败；携带 `action` |
| `UploadPartError` | `UploadError` | 某个分片在超过 `maxPartRetries` 后仍然失败；携带 `partNumber` 和 `attempts` |

## 类型导出

| 类型 | 说明 |
| --- | --- |
| `UploaderOptions` | `Uploader` 的构造选项 |
| `UploadInit` | 初始化时的 filename/contentType/public 覆盖项 |
| `UploadProgress` | 聚合进度快照 |
| `UploadStatus` | 生命周期状态联合类型 |
| `UploadResult` | 上传成功的结果 |
| `UploadSessionSnapshot` | 传递给 `onSessionOpened` 的 `{ claimId, key, partSize, partCount, expiresAt }` |
| `ResumablePersistence` | 持久化接口 |
| `ResumeRecord` | 单条持久化的续传记录 |
| `FileFingerprinter` | 指纹计算接口 |
| `ResolveResumeInputs` | `resolveResumePlan` 的输入 |
| `ResumeCandidate` | 传递给 `onResumeDetected` 的 `{ record, completedParts }` |
| `ResumeDecision` | `{ kind: "resume" } \| { kind: "discard" }` |
| `ResumeDecisionHandler` | `(candidate: ResumeCandidate) => Promise<ResumeDecision>` |
| `ResumePlan` | `{ kind: "fresh" }` 或完整的续传会话形状 |

此外还导出了更底层的协议函数（`initUpload`、`uploadPart`、`listParts`、`completeUpload`、`abortUpload`）及其请求/响应类型（`InitUploadParams`、`InitUploadResponse`、`UploadPartResponse`、`ListedPart`、`ListPartsResponse`、`CompleteUploadResponse`、`ObjectInfo`、`ProtocolContext`），供需要基于同一后端协议构建自定义上传流程的调用方使用。
