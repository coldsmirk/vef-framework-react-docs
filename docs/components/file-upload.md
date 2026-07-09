---
title: "FileUpload"
description: "Chunked, resumable upload variant of Upload, wired to the framework's storage protocol."
---

# FileUpload

A chunked-upload variant of [`Upload`](./upload.md) wired to the framework's `sys/storage` resource. Each file is handed to its own `Uploader` instance from `@vef-framework-react/core`, so Ant Design's concurrent file dispatch works out of the box.

> **VEF-specific component.** Wraps [`Upload`](./upload.md), overriding `customRequest` to run the framework's chunked storage protocol instead of a single opaque `action` POST.

## When to Use

- Uploading files through the framework's resumable, chunked storage protocol — with per-part concurrency and retry control — rather than a single-request upload.
- You still want `Upload`'s drag-drop, picture-card, paste, and image-crop affordances; `FileUpload` forwards everything except `customRequest` / `action` / `method` / `data` / `headers`, which it owns.
- Reach for plain [`Upload`](./upload.md) with your own `action` or `customRequest` when the backend isn't the framework's storage service.

`FileUpload` requires an `ApiClientProvider` (and `AppContextProvider` for URL resolution) in the tree — it calls `useApiClient()` and `useAppContext()` internally.

## Basic Usage

```tsx
import { FileUpload } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <FileUpload
      listType="picture-card"
      onUploadSuccess={(file, result) => console.log(result.key)}
    >
      <div>+ Upload</div>
    </FileUpload>
  );
}
```

## Progress and Error Handling

```tsx
<FileUpload
  onUploadProgress={(file, progress) => console.log(file.name, progress.percent)}
  onUploadSuccess={(file, result) => console.log('uploaded', result.key)}
  onUploadError={(file, error) => console.error('failed', file.name, error)}
/>
```

## Public Uploads

```tsx
// Lands the object under `pub/` instead of `priv/`. Requires the backend's
// `vef.storage.allow_public_uploads` to be enabled.
<FileUpload public />
```

## Resolving a Custom Fetch URL

```tsx
<FileUpload
  resolveFileUrl={(key) => `https://cdn.example.com/${key}`}
/>
```

## Form Integration

Use the `field.Upload` field component inside `<form.AppField>`, which wraps `FileUpload` and owns `fileList` / `onChange` — the field value is an array of storage keys by default, becoming a single key string only when `maxCount` is 1:

```tsx
<form.AppField name="attachments">
  {(field) => <field.Upload label="Attachments" maxCount={3} />}
</form.AppField>
```

## API

### FileUploadProps

Extends Ant Design `UploadProps` (see [`Upload`](./upload.md)) minus `customRequest`, `action`, `method`, `data`, `headers`, plus:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `public` | `boolean` | `false` | Land the object under `pub/` instead of `priv/`; requires `vef.storage.allow_public_uploads` on the backend |
| `apiPath` | `string` | `"/api"` | Override the RPC entrypoint URL |
| `resource` | `string` | `"sys/storage"` | Override the RPC resource name |
| `version` | `string` | `"v1"` | Override the RPC version |
| `partConcurrency` | `UploaderOptions["partConcurrency"]` | `3` | Per-file part concurrency |
| `maxPartRetries` | `UploaderOptions["maxPartRetries"]` | `3` | Per-part retry budget |
| `resolveFileUrl` | `(key: string) => string` | `${fileBaseUrl}/${key}` from `useAppContext` | Resolve an object key into a fetch URL |
| `onUploadProgress` | `(file: File, progress: UploadProgress) => void` | — | Fires on each aggregated progress tick of a file |
| `onUploadSuccess` | `(file: File, result: UploadResult) => void` | — | Fires when a file completes successfully |
| `onUploadError` | `(file: File, error: UploadError) => void` | — | Fires when a file fails terminally (including aborts) |

For all other props (`listType`, `maxCount`, `enableCrop`, `pastable`, `multiple`, `accept`, `beforeUpload`, …), see the [`Upload`](./upload.md) documentation.

### UploadedFileMeta

Patched onto the Ant Design `UploadFile` once a file finishes uploading — read it off `fileList` items after `onChange`:

| Field | Type | Description |
|-------|------|-------------|
| `key` | `string` | Object key (e.g. `priv/2026/05/12/abc.png`) |
| `url` | `string` | Resolved fetch URL — composed from `fileBaseUrl` unless `resolveFileUrl` is supplied |
| `fileName` | `string` | Original client-supplied filename echoed back by the backend |
