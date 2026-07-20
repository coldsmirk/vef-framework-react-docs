---
title: "FilePreview"
description: "The file-preview contract — the application installs a preview host with FilePreviewProvider, and upload components dispatch normalized preview targets to it."
---

# FilePreview

The file-preview contract. The framework bundles no viewer library and never renders a document viewer itself — instead the application installs a *preview host* with `FilePreviewProvider`, and components that offer a preview affordance ([`Upload`](./upload.md) and everything built on it: [`FileUpload`](./file-upload.md), the `field.Upload` form field) dispatch non-image files to it as normalized `FilePreviewTarget`s.

> **VEF-specific API.** Contract introduced in v2.11.0, together with the authenticated preview-source isolation described below.

## When to Use

- Wire a document viewer (Office/PDF viewer dialog, a new tab, a side panel — your choice) into every upload list in the app with one provider at the layout root.
- Trigger the same host from your own components via `useFilePreview` and `toFilePreviewTarget`.
- Without a provider, image previews still work (built-in [`Image`](https://ant.design/components/image/) modal); non-image files show a "preview not supported" warning message instead.

## How Upload Dispatches Previews

When the user clicks preview on an upload-list entry and no explicit `onPreview` prop is set (an explicit `onPreview` bypasses the whole chain), `Upload` runs this default chain:

1. **Images** open in the built-in `Image` modal — from the file's source URL, or a base64 data URL generated from local bytes when no URL exists yet.
2. **Everything else** is normalized with `toFilePreviewTarget(file)` and offered to the nearest `FilePreviewProvider`: if `handler.canPreview?.(target)` returns `true` (or `canPreview` is omitted), the framework calls `handler.openPreview(target)` and is done — fetching and rendering are entirely the host's job.
3. **No provider, or the host declines** — a warning message ("该文件暂不支持预览") is shown. The framework deliberately never falls back to opening the file URL in the browser, because it cannot prove the URL is anonymously readable (the same policy applies to the list's download action when no `onDownload` is set).

## Installing a Host

Mount the provider once, around the authenticated layout, and hand it a memoized handler:

```tsx
import type { FilePreviewHandler } from '@vef-framework-react/components';
import { FilePreviewProvider } from '@vef-framework-react/components';

const handler: FilePreviewHandler = {
  // Cheap, synchronous capability check — no network here.
  canPreview: (target) => target.filename.toLowerCase().endsWith('.pdf'),
  // Synchronous dispatch: kick off fetching/rendering, return immediately.
  openPreview: (target) => {
    openPdfDialog(target);
  }
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <FilePreviewProvider handler={handler}>{children}</FilePreviewProvider>;
}
```

## Resolving the Bytes

`FilePreviewTarget` tells the host everything the upload family knows about the file, but *how the bytes are obtained is up to the host*. The recommended order:

1. `target.file` — local `File` bytes, present for pending, uploading, and failed files, plus files uploaded in the current session. Use them directly.
2. `target.key` / `target.url` — stored objects. Resolve through a channel that satisfies your authentication requirements: for files stored through the framework's storage protocol, fetch `target.url` with `HttpClient.requestFile(url)`, which carries the Bearer token, survives a 401 token refresh, and surfaces the `Content-Disposition` filename (see [HTTP & API](../reference/core/http-and-api.md)). Never hand `target.url` to a viewer's own URL mode or to the browser unless you know it is anonymously readable.

## Authenticated Preview-Source Isolation

Since v2.11.0 the upload family keeps *source URLs* (URLs meant for fetching bytes) out of Ant Design's list renderer, which would otherwise render `UploadFile.url` as a native link and use it in its default download fallback — leaking authenticated URLs as dead or unauthorized browser navigations:

- Files uploaded through [`FileUpload`](./file-upload.md) or hydrated by the `field.Upload` form field carry their fetch URL as `sourceUrl` (on `UploadedFileMeta`), never as the antd-visible `url`.
- For plain `UploadFile`s that do have a `url`, `Upload` strips it from the object handed to antd and restores it at public callback boundaries (`onChange`, `onPreview`, `onDownload`, `onRemove`, and the render props), so your code sees the file unchanged while antd never renders the URL as a link.
- `toFilePreviewTarget` reads through both mechanisms, so `target.url` is always the real source URL regardless of where the file came from.

## Host Integration Example

The playground integrates [`@file-viewer/react`](https://www.npmjs.com/package/@file-viewer/react) as the global preview host — a modal that receives every non-image preview in the app. A condensed version:

```tsx
import type { FilePreviewHandler, FilePreviewTarget } from '@vef-framework-react/components';
import type { PropsWithChildren, ReactElement } from 'react';

import { FileViewer } from '@file-viewer/react';
import { FilePreviewProvider, Modal, showErrorMessage } from '@vef-framework-react/components';
import { HTTP_CLIENT, useApiClient } from '@vef-framework-react/core';
import { useCallback, useMemo, useState } from 'react';

const PREVIEWABLE_EXTENSIONS = new Set(['pdf', 'docx', 'xlsx', 'pptx']);

function getExtension(filename: string): string {
  const dotIndex = filename.lastIndexOf('.');
  return dotIndex === -1 ? '' : filename.slice(dotIndex + 1).toLowerCase();
}

interface PreviewState {
  target: FilePreviewTarget;
  file: Blob;
}

export function FileViewerPreviewHost({ children }: PropsWithChildren): ReactElement {
  const http = useApiClient()[HTTP_CLIENT];
  const [preview, setPreview] = useState<PreviewState | null>(null);

  const openPreview = useCallback((target: FilePreviewTarget) => {
    void (async () => {
      try {
        // Local bytes first (pending / failed / just-uploaded files); stored
        // objects go through the authenticated client so the request carries
        // the Bearer token and survives a 401 refresh.
        const file = target.file
          ?? (await http.requestFile(target.url!)).blob;

        setPreview({ target, file });
      } catch (error) {
        showErrorMessage(`Preview failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    })();
  }, [http]);

  const handler = useMemo<FilePreviewHandler>(() => ({
    canPreview: (target) => PREVIEWABLE_EXTENSIONS.has(getExtension(target.filename)),
    openPreview
  }), [openPreview]);

  return (
    <FilePreviewProvider handler={handler}>
      {children}

      <Modal
        centered
        destroyOnHidden
        footer={null}
        open={preview !== null}
        title={preview?.target.filename}
        width="min(80vw, 1680px)"
        onCancel={() => setPreview(null)}
      >
        {preview && (
          // The viewer fills its container — give it an explicit height.
          <div style={{ height: 'min(78vh, 880px)' }}>
            <FileViewer file={preview.file} filename={preview.target.filename} />
          </div>
        )}
      </Modal>
    </FilePreviewProvider>
  );
}
```

The full playground host (`playground/src/components/file-viewer-preview-host.tsx` in the framework repo) additionally lazy-loads the viewer bundle, aborts stale fetches, enforces a 100 MB size cap (checked against `target.size` before fetching and against download progress during it), follows the app's dark/light theme, and offers retry/reload/download actions in its error state — worth mirroring in production hosts.

## API

### FilePreviewProviderProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `handler` | `FilePreviewHandler` | — | The application's preview host. Required. Nested providers shadow outer ones — dispatch goes to the nearest |
| `children` | `ReactNode` | — | Subtree that should dispatch previews to this host |

### FilePreviewHandler

The contract a preview host implements:

| Member | Type | Default | Description |
|--------|------|---------|-------------|
| `canPreview` | `(target: FilePreviewTarget) => boolean` | treated as `true` | Whether the host can preview the target. Must be cheap and synchronous (no network) — it runs on every dispatch. When it returns `false`, the framework shows its "not supported" warning instead |
| `openPreview` | `(target: FilePreviewTarget) => void` | — | Open the preview for the target. Required. Synchronous dispatch only — fetching and rendering happen inside the host |

### FilePreviewTarget

The framework-normalized description of a file the user asked to preview. Prefer `file` when bytes are already local, then resolve `key` or `url` through an authenticated channel:

| Member | Type | Default | Description |
|--------|------|---------|-------------|
| `filename` | `string` | — | Display name including the extension. Required — most viewers derive the file format from it |
| `contentType` | `string` | — | MIME type when known. Local files expose it; files hydrated from a storage key usually do not |
| `size` | `number` | — | File size in bytes when known — useful for size caps before fetching |
| `file` | `File` | — | Local file content when available: pending, uploading, and failed files, plus files uploaded in the current session |
| `key` | `string` | — | Storage object key for files uploaded through the framework's chunked storage protocol (e.g. `priv/2026/05/12/abc.docx`) |
| `url` | `string` | — | Resolved fetch URL when known — composed from `fileBaseUrl` for stored objects, or taken from the Ant Design `UploadFile` as-is |

### Hooks and Functions

| Export | Type | Description |
|--------|------|-------------|
| `useFilePreview` | `() => FilePreviewHandler \| null` | Read the nearest file-preview host, or `null` when none is installed — for custom components that want to dispatch previews themselves |
| `toFilePreviewTarget` | `(file: UploadFile) => FilePreviewTarget` | Normalize an Ant Design `UploadFile` into the preview contract. The single place that knows where the upload family stores its metadata (`UploadedFileMeta` on the list entry, local bytes on `originFileObj`) — use it instead of inspecting `UploadFile` yourself |
