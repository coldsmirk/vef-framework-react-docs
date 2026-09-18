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

## Storage-Key Control

`StoredFileUpload` is the controlled core shared by form upload fields. Its value is one storage object key for a single-file control (`maxCount` at its default of `1`) or an array of keys for a multi-file control. It hydrates saved keys into an upload list, resolves their original filenames through the storage registry, and emits `null` or `[]` when the matching value is cleared.

```tsx
import { StoredFileUpload } from '@vef-framework-react/components';

export default function Demo() {
  return <StoredFileUpload maxCount={3} value={['priv/2026/09/01/a.pdf']} onChange={console.log} />;
}
```

Use `FileUpload` when you want to control antd's `fileList` yourself; use `StoredFileUpload` when your persistent value is storage keys.

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

### StoredFileUploadProps

Extends `FileUploadProps`, replacing `fileList` / `defaultFileList` / `onChange` with:

| Prop | Type | Description |
|------|------|-------------|
| `value` | `StoredFileValue` | A storage object key, an array of keys, or the empty shape (`null` / `undefined` / `[]`) |
| `onChange` | `(value: StoredFileValue) => void` | Emits one key when `maxCount` is `1`, otherwise an array of keys |

### UploadedFileMeta

Patched onto the Ant Design `UploadFile` once a file finishes uploading — read it off `fileList` items after `onChange`:

| Field | Type | Description |
|-------|------|-------------|
| `key` | `string` | Object key (e.g. `priv/2026/05/12/abc.png`) |
| `sourceUrl` | `string` | Resolved source URL — composed from `fileBaseUrl` unless `resolveFileUrl` is supplied. Deliberately kept separate from antd's navigable `UploadFile.url`, so authenticated files are never rendered as native list links (see [Upload — Authenticated Files](./upload.md#authenticated-files-and-url-isolation)) |
| `fileName` | `string` | Original client-supplied filename echoed back by the backend |

Previews of non-image files dispatch to the app's [file-preview host](./file-preview.md) through the shared `Upload` preview chain.
