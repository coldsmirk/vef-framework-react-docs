---
title: "Upload"
description: "File upload component with optional image cropping support."
---

# Upload

File upload component with optional image cropping support.

> **Source:** Wraps `antd` Upload with VEF image crop enhancement. Full documentation: [Ant Design Upload](https://ant.design/components/upload/)

## VEF Enhancement

VEF wraps `antd` Upload with several behaviors:

- `enableCrop` and `cropperProps` enable inline image cropping via `antd-img-crop` before upload (with reset, rotation, and zoom controls on by default).
- A default upload trigger when no `children` are passed: a primary "上传" button (disabled once `maxCount` is reached), or a plus icon for `listType="picture-card"` / `"picture-circle"` (hidden once `maxCount` is reached).
- A default preview chain that shows images in a built-in [`Image`](https://ant.design/components/image/) modal and dispatches every other file type to the app's [file-preview host](./file-preview.md).
- Preview-source isolation for authenticated files: file URLs are never rendered as native links by the antd list.
- `pastable` defaults to `true` (antd defaults to `false`).

## Basic Usage

```tsx
import { Upload } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <Upload
      action="/api/upload"
      listType="text"
      onChange={(info) => console.log(info)}
    >
      <button>Click to Upload</button>
    </Upload>
  );
}
```

## Image Upload with Crop

```tsx
import { Upload } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <Upload
      action="/api/upload"
      listType="picture-card"
      enableCrop
      cropperProps={{ aspectRatio: 1 }}
      maxCount={1}
    >
      <div>+ Upload</div>
    </Upload>
  );
}
```

## Paste to Upload

```tsx
<Upload action="/api/upload" pastable>
  <button>Upload or Paste</button>
</Upload>
```

## Preview Behavior

When the user clicks a list item's preview action, `Upload` runs this chain (an explicit `onPreview` prop bypasses it entirely):

1. **Images** (decided by MIME type, then filename extension, then URL — never by antd's generated thumbnail) open in a built-in `Image` preview modal. Files without a URL fall back to a base64 data URL read from the local bytes.
2. **Everything else** is normalized into a `FilePreviewTarget` via `toFilePreviewTarget(file)` and dispatched to the nearest [`FilePreviewProvider`](./file-preview.md). If the host's `canPreview(target)` returns `false`, or no provider is mounted, a "该文件暂不支持预览" warning is shown.

The framework never opens a file URL directly, because it cannot prove the URL is anonymously readable — rendering and fetching are the preview host's responsibility. See [FilePreview](./file-preview.md) for implementing the provider/host side.

## Authenticated Files and URL Isolation

antd renders `UploadFile.url` as a native `<a>` link in the file list and uses it in its default download fallback — which leaks authenticated URLs into the DOM. VEF's `Upload` prevents that:

- Before reaching antd, each file's `url` is moved behind an internal marker, so the list renders plain text instead of links. Your original `url` is restored on the file objects passed to every callback (`onChange`, `onPreview`, `onRemove`, `onDownload`, `isImageUrl`, `iconRender`, `itemRender`, and the `showUploadList` render options), so application code is unaffected.
- URLs attached by a `customRequest` success handler are isolated the same way.
- Files uploaded through the framework's chunked storage protocol carry `UploadedFileMeta` (`key` / `sourceUrl` / `fileName`) instead: `sourceUrl` is kept separate from antd's navigable `url` on purpose. Use `UploadFile.thumbUrl` only for an application-approved presentation thumbnail.
- `onDownload` without a handler shows a "该文件暂不支持下载" warning instead of navigating.

## API

Extends Ant Design `UploadProps`, plus:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `enableCrop` | `boolean` | `false` | Enable image cropping before upload |
| `cropperProps` | `Except<ImgCropProps, 'children'>` | `{ showReset: true, rotationSlider: true, zoomSlider: true }` | Image cropper configuration, merged over the defaults |
| `pastable` | `boolean` | `true` | Allow pasting images from clipboard (VEF flips antd's default of `false`) |

For all other props, see [Ant Design Upload documentation](https://ant.design/components/upload/).

### UploadedFileMeta

Per-file storage metadata stamped onto antd `UploadFile`s by the upload family: [`FileUpload`](./file-upload.md) patches it onto the origin `File` when a chunked upload completes, and the form `UploadField` stamps it when hydrating stored keys. Preview targeting and form fields read storage keys back through this shape.

| Field | Type | Description |
|-------|------|-------------|
| `key` | `string` | Storage object key (e.g. `priv/2026/05/12/abc.png`) |
| `sourceUrl` | `string` | Resolved source URL for fetching the stored object. Kept separate from antd's navigable `UploadFile.url` so authenticated files are never exposed as native list links |
| `fileName` | `string` | Original client-supplied filename echoed back by the backend |

### toFilePreviewTarget

```ts
function toFilePreviewTarget(file: UploadFile): FilePreviewTarget;
```

Normalizes an antd `UploadFile` into the framework's [file-preview contract](./file-preview.md). This is the single place that knows where the upload family stores its metadata — `UploadedFileMeta` on the list entry, local bytes on `originFileObj` — so preview hosts never need to inspect `UploadFile` themselves. Use it when triggering the preview host manually (e.g. from a custom `itemRender`).
