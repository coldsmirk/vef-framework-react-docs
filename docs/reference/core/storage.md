---
title: Storage and Uploads
description: Uploader, its options, and the resumable-upload persistence and fingerprinting primitives it works with.
---

# Storage and Uploads

`@vef-framework-react/core` provides a chunked, resumable file-upload client built against the framework's `sys/storage` backend resource. It handles multipart splitting, bounded-concurrency part uploads, retry-with-backoff, and — opt-in — resuming an interrupted upload across page reloads.

For the React-hook adapter, see [`useUpload`](../hooks/vef-hooks.md#upload-hook) in `@vef-framework-react/hooks`; it wraps everything on this page for the common single-in-flight-upload case. Reach for `Uploader` directly for parallel/batch uploads.

## `Uploader`

Drives one file through the four-step protocol (`init_upload → upload_part* → complete_upload`) exposed by the backend's `sys/storage` resource. **One-shot**: a completed or failed run cannot be restarted — create a fresh `Uploader` per file.

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

### Constructor

```ts
new Uploader(http: Readonly<HttpClient>, file: Blob, options?: UploaderOptions)
```

`http` is the `HttpClient` obtained from `apiClient[HTTP_CLIENT]` (see [HTTP and API Client](./http-and-api.md)). `file.name` is required when `file` is a plain `Blob` rather than a `File` — set it via `options.init.filename`.

### `UploaderOptions`

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `apiPath` | `string` | `"/api"` | RPC entrypoint URL |
| `resource` | `string` | `"sys/storage"` | RPC resource name |
| `version` | `string` | `"v1"` | RPC version |
| `init` | `UploadInit` | — | Init-time overrides for the backend session |
| `partConcurrency` | `number` | `3` | Maximum parts uploaded in parallel |
| `maxPartRetries` | `number` | `3` | Retry budget per part (the initial attempt counts as 1) |
| `retryBaseDelay` | `number` | `500` | Base delay (ms) for exponential per-part retry backoff |
| `retryMaxDelay` | `number` | `8000` | Maximum delay (ms) any single retry will wait |
| `signal` | `AbortSignal` | — | External abort signal, combined with the uploader's internal controller |
| `onProgress` | `(progress: UploadProgress) => void` | — | Invoked after every part progress tick |
| `onStatusChange` | `(status: UploadStatus) => void` | — | Invoked on every `UploadStatus` transition |
| `onSessionOpened` | `(session: UploadSessionSnapshot) => void` | — | Invoked once the backend has confirmed an upload session (fresh or resumed) |

### `UploadInit`

| Field | Type | Description |
| --- | --- | --- |
| `filename` | `string` | Overrides the original filename; defaults to `file.name` |
| `contentType` | `string` | Overrides the declared MIME type; defaults to `file.type` |
| `public` | `boolean` | Lands the object under `pub/` (anonymous-readable) when `true`, `priv/` (authenticated reads) otherwise |

### `UploadProgress`

| Field | Type | Description |
| --- | --- | --- |
| `loaded` | `number` | Bytes acknowledged so far (never exceeds `total`) |
| `total` | `number` | Total file size in bytes |
| `partsCompleted` | `number` | Number of parts fully accepted by the backend |
| `partsTotal` | `number` | Total number of parts in the upload plan |
| `percent` | `number` | `loaded / total`, rounded to an integer percentage |

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

Transitions are linear up to a terminal state (`succeeded`, `failed`, `aborted`).

### `UploadResult`

| Field | Type | Description |
| --- | --- | --- |
| `bucket` | `string` | Backend bucket name |
| `key` | `string` | Object key (prefixed `pub/` or `priv/`) |
| `eTag` | `string` | Backend-assigned ETag |
| `size` | `number` | Final object size in bytes |
| `contentType` | `string` | Stored content type |
| `lastModified` | `string` | ISO-8601 timestamp |
| `originalFilename` | `string` | The filename tracked through the upload |
| `metadata` | `Record<string, string> \| undefined` | Backend-attached metadata |

### Instance API

| Member | Type | Description |
| --- | --- | --- |
| `status` | `UploadStatus` (getter) | Current lifecycle status |
| `progress` | `UploadProgress` (getter) | Latest aggregated progress snapshot |
| `start(plan?)` | `(plan?: ResumePlan) => Promise<UploadResult>` | Starts the upload; repeat calls return the original promise. Pass a `{ kind: "resume", ... }` plan (see below) to skip `init_upload` and resume a prior session |
| `abort()` | `() => Promise<void>` | Cancels an in-flight upload and best-effort aborts the backend session; safe to call from any state |

### `uploadFile`

Convenience wrapper that constructs an `Uploader` and immediately starts it:

```ts
import { uploadFile } from "@vef-framework-react/core";

const result = await uploadFile(http, file, { onProgress: p => console.log(p.percent) });
```

Use the `Uploader` class directly when the UI needs to call `abort()` or observe `status` transitions independently of the returned promise.

## Resuming an Interrupted Upload

Resume support is opt-in and splits into two concerns: persisting a `ResumeRecord` locally, and asking the backend which parts already landed before deciding whether to resume.

### `resolveResumePlan`

Computes a `ResumePlan` for a given file fingerprint: looks up the persisted record, validates it against the wall clock and the backend's live `list_parts`, and hands the result to a caller-supplied decision handler.

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

Without an `onResumeDetected` handler, the default decision is `{ kind: "discard" }` — a resume that picks the wrong file is worse than a redundant fresh upload.

### `ResolveResumeInputs`

| Field | Type | Description |
| --- | --- | --- |
| `fingerprint` | `string` | Stable identifier for the file, computed by a `FileFingerprinter` |
| `persistence` | `ResumablePersistence` | Where the resume record is read from / written to |
| `ctx` | `ProtocolContext` | `{ http, apiPath, resource, version }` — same shape `Uploader` builds internally |
| `onResumeDetected` | `ResumeDecisionHandler` | Optional; defaults to always discarding |
| `signal` | `GenericAbortSignal` | Optional cancellation signal for the in-flight `list_parts` / abort calls |

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

### `ResumeCandidate` and `ResumeDecision`

| Type | Shape | Description |
| --- | --- | --- |
| `ResumeCandidate` | `{ record: ResumeRecord; completedParts: ListedPart[] }` | Passed to `onResumeDetected`; `completedParts` is the live `list_parts` result, not the persisted record |
| `ResumeDecision` | `{ kind: "resume" } \| { kind: "discard" }` | The caller's choice |
| `ResumeDecisionHandler` | `(candidate: ResumeCandidate) => Promise<ResumeDecision>` | The handler type |

## Persistence

### `ResumablePersistence`

Pluggable storage for `ResumeRecord` values.

```ts
interface ResumablePersistence {
  load: (fingerprint: string) => Promise<ResumeRecord | null>;
  save: (record: ResumeRecord) => Promise<void>;
  remove: (fingerprint: string) => Promise<void>;
}
```

### `LocalStoragePersistence`

The default implementation, backed by `window.localStorage`.

```ts
import { LocalStoragePersistence } from "@vef-framework-react/core";

const persistence = new LocalStoragePersistence(); // keys namespaced under "__VEF_UPLOAD_RESUME__"
```

| Member | Type | Description |
| --- | --- | --- |
| constructor | `(keyPrefix?: string)` | Namespace prefix for stored keys (default `"__VEF_UPLOAD_RESUME__"`) |
| `clearAll()` | `() => Promise<void>` | Drops every record this instance owns (matched by its key prefix); call on logout / account switch |

### `ResumeRecord`

| Field | Type | Description |
| --- | --- | --- |
| `fingerprint` | `string` | Lookup key, computed by a `FileFingerprinter` |
| `claimId` | `string` | Server-assigned claim ID |
| `key` | `string` | Object key the backend assigned |
| `partSize` | `number` | Backend-authoritative part size |
| `partCount` | `number` | Total number of parts planned |
| `expiresAt` | `string` | ISO-8601 expiry |
| `savedAt` | `number` | `Date.now()` when the record was last written |

## Fingerprinting

### `FileFingerprinter`

```ts
interface FileFingerprinter {
  fingerprint: (file: File) => Promise<string>;
}
```

| Implementation | Basis | Notes |
| --- | --- | --- |
| `WeakFingerprinter` | `name:size:lastModified` | Synchronous, always available; collides if content changes without touching name/size/mtime |
| `PrefixFingerprinter` | `WeakFingerprinter`'s fields plus the SHA-256 of the file's first 4 MiB (window size overridable via the constructor's `prefixBytes` param) | Requires `crypto.subtle`; throws synchronously if unavailable — fall back to `WeakFingerprinter` in that case |

## Constants and Errors

| Export | Value | Description |
| --- | --- | --- |
| `STORAGE_API_PATH` | `"/api"` | Default `apiPath` |
| `STORAGE_RESOURCE` | `"sys/storage"` | Default `resource` |
| `STORAGE_VERSION` | `"v1"` | Default `version` |
| `PUBLIC_PREFIX` | `"pub/"` | Object-key prefix for anonymous-readable objects |
| `PRIVATE_PREFIX` | `"priv/"` | Object-key prefix for authenticated-read objects |

| Error | Extends | Thrown when |
| --- | --- | --- |
| `UploadError` | `Error` | Base class for every storage error; `instanceof UploadError` discriminates uploader failures |
| `UploadAbortedError` | `UploadError` | The caller (or an external signal) cancels an in-flight upload |
| `UploadProtocolError` | `UploadError` | A protocol RPC (`init_upload` / `complete_upload` / `abort_upload` / `list_parts`) fails unrecoverably; carries `action` |
| `UploadPartError` | `UploadError` | A single part fails past `maxPartRetries`; carries `partNumber` and `attempts` |

## Type Exports

| Type | Description |
| --- | --- |
| `UploaderOptions` | Constructor options for `Uploader` |
| `UploadInit` | Init-time filename/contentType/public overrides |
| `UploadProgress` | Aggregated progress snapshot |
| `UploadStatus` | Lifecycle status union |
| `UploadResult` | Successful-upload result |
| `UploadSessionSnapshot` | `{ claimId, key, partSize, partCount, expiresAt }` passed to `onSessionOpened` |
| `ResumablePersistence` | Persistence interface |
| `ResumeRecord` | One persisted resume record |
| `FileFingerprinter` | Fingerprinting interface |
| `ResolveResumeInputs` | Inputs to `resolveResumePlan` |
| `ResumeCandidate` | `{ record, completedParts }` passed to `onResumeDetected` |
| `ResumeDecision` | `{ kind: "resume" } \| { kind: "discard" }` |
| `ResumeDecisionHandler` | `(candidate: ResumeCandidate) => Promise<ResumeDecision>` |
| `ResumePlan` | `{ kind: "fresh" }` or the full resume-session shape |

Also exported: the lower-level protocol functions (`initUpload`, `uploadPart`, `listParts`, `completeUpload`, `abortUpload`) and their request/response types (`InitUploadParams`, `InitUploadResponse`, `UploadPartResponse`, `ListedPart`, `ListPartsResponse`, `CompleteUploadResponse`, `ObjectInfo`, `ProtocolContext`) for callers building a custom upload flow on the same backend protocol.
