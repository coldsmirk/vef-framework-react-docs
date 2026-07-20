---
title: "FilePreview"
description: "文件预览契约——应用通过 FilePreviewProvider 安装预览宿主，上传组件将规范化的预览目标派发给它。"
---

# FilePreview

文件预览契约。框架不捆绑任何查看器库，自身也从不渲染文档查看器——应用通过 `FilePreviewProvider` 安装一个*预览宿主*，提供预览入口的组件（[`Upload`](./upload.md) 及其上层的一切：[`FileUpload`](./file-upload.md)、表单字段 `field.Upload`）会把非图片文件规范化为 `FilePreviewTarget` 派发给它。

> **VEF 专属 API。** 契约于 v2.11.0 引入，同时引入下文描述的鉴权预览源隔离。

## 何时使用

- 在布局根部用一个 provider，把文档查看器（Office/PDF 查看对话框、新标签页、侧边面板——由你决定）接入应用中的每一个上传列表。
- 通过 `useFilePreview` 和 `toFilePreviewTarget` 从你自己的组件触发同一个宿主。
- 没有 provider 时，图片预览仍然可用（内置的 [`Image`](https://ant.design/components/image/) 弹窗）；非图片文件则会显示"暂不支持预览"的警告消息。

## Upload 如何派发预览

当用户点击上传列表条目的预览、且没有显式设置 `onPreview` 属性时（显式的 `onPreview` 会绕过整条链路），`Upload` 执行如下默认链路：

1. **图片**在内置的 `Image` 弹窗中打开——使用文件的源 URL，或在尚无 URL 时用本地字节生成的 base64 data URL。
2. **其余一切**用 `toFilePreviewTarget(file)` 规范化后交给最近的 `FilePreviewProvider`：如果 `handler.canPreview?.(target)` 返回 `true`（或未提供 `canPreview`），框架调用 `handler.openPreview(target)` 后就此结束——获取字节和渲染完全是宿主的职责。
3. **没有 provider，或宿主拒绝**——显示一条警告消息（"该文件暂不支持预览"）。框架有意不回退到在浏览器中打开文件 URL，因为它无法证明该 URL 可匿名读取（列表的下载操作在未设置 `onDownload` 时遵循同样的策略）。

## 安装宿主

在经过鉴权的布局外层挂载一次 provider，并交给它一个 memo 化的 handler：

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

## 获取文件字节

`FilePreviewTarget` 会把上传家族对该文件所知的一切告诉宿主，但*如何取得字节由宿主决定*。推荐顺序：

1. `target.file`——本地 `File` 字节，对待上传、上传中和上传失败的文件，以及本次会话内上传完成的文件均存在。直接使用即可。
2. `target.key` / `target.url`——已存储的对象。请通过满足你鉴权要求的通道解析：对于经框架存储协议存储的文件，用 `HttpClient.requestFile(url)` 请求 `target.url`，它会携带 Bearer 令牌、在 401 令牌刷新后存活，并暴露 `Content-Disposition` 中的文件名（见 [HTTP 与 API 客户端](../reference/core/http-and-api.md)）。除非你确定 `target.url` 可匿名读取，否则切勿把它交给查看器自己的 URL 模式或浏览器。

## 鉴权预览源隔离

自 v2.11.0 起，上传家族会让*源 URL*（用于获取字节的 URL）远离 Ant Design 的列表渲染器——否则 antd 会把 `UploadFile.url` 渲染成原生链接，并在其默认下载回退中使用它，把带鉴权的 URL 泄漏为打不开或未授权的浏览器跳转：

- 经 [`FileUpload`](./file-upload.md) 上传或由表单字段 `field.Upload` 水合的文件，其获取 URL 存放在 `sourceUrl`（`UploadedFileMeta` 上），绝不会出现在 antd 可见的 `url` 上。
- 对确实带有 `url` 的普通 `UploadFile`，`Upload` 会在交给 antd 的对象上剥掉它，并在公开回调边界（`onChange`、`onPreview`、`onDownload`、`onRemove` 以及各 render props）恢复——你的代码看到的文件对象不变，而 antd 永远不会把该 URL 渲染成链接。
- `toFilePreviewTarget` 能同时读穿这两种机制，因此无论文件来自哪里，`target.url` 始终是真实的源 URL。

## 宿主集成示例

playground 集成了 [`@file-viewer/react`](https://www.npmjs.com/package/@file-viewer/react) 作为全局预览宿主——一个接收应用内所有非图片预览的弹窗。精简版如下：

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

完整的 playground 宿主（框架仓库中的 `playground/src/components/file-viewer-preview-host.tsx`）还额外做了：懒加载查看器 bundle、中止过期的请求、强制 100 MB 大小上限（请求前对照 `target.size` 检查、请求中对照下载进度检查）、跟随应用的深浅色主题，并在错误态提供重试/重新加载/下载操作——生产环境的宿主值得照做。

## API

### FilePreviewProviderProps

| Prop | Type | Default | 说明 |
|------|------|---------|-------------|
| `handler` | `FilePreviewHandler` | — | 应用的预览宿主。必填。嵌套的 provider 会遮蔽外层——派发始终去往最近的一个 |
| `children` | `ReactNode` | — | 应将预览派发到该宿主的子树 |

### FilePreviewHandler

预览宿主需要实现的契约：

| 成员 | 类型 | 默认值 | 说明 |
|--------|------|---------|-------------|
| `canPreview` | `(target: FilePreviewTarget) => boolean` | 视为 `true` | 宿主能否预览该目标。必须廉价且同步（不发网络请求）——每次派发都会执行。返回 `false` 时，框架改为显示"暂不支持预览"的警告 |
| `openPreview` | `(target: FilePreviewTarget) => void` | — | 打开该目标的预览。必填。仅做同步派发——获取字节和渲染都在宿主内部进行 |

### FilePreviewTarget

框架对用户请求预览的文件的规范化描述。字节已在本地时优先用 `file`，否则通过带鉴权的通道解析 `key` 或 `url`：

| 成员 | 类型 | 默认值 | 说明 |
|--------|------|---------|-------------|
| `filename` | `string` | — | 含扩展名的显示名称。必填——多数查看器靠它推断文件格式 |
| `contentType` | `string` | — | 已知时的 MIME 类型。本地文件会暴露它；从存储 key 水合的文件通常没有 |
| `size` | `number` | — | 已知时的文件字节大小——适合在请求前做大小上限检查 |
| `file` | `File` | — | 可用时的本地文件内容：待上传、上传中和上传失败的文件，以及本次会话内上传完成的文件 |
| `key` | `string` | — | 经框架分片存储协议上传的文件的存储对象 key（例如 `priv/2026/05/12/abc.docx`） |
| `url` | `string` | — | 已知时的解析后获取 URL——已存储对象由 `fileBaseUrl` 拼出，或原样取自 Ant Design 的 `UploadFile` |

### Hook 与函数

| 导出 | 类型 | 说明 |
|--------|------|-------------|
| `useFilePreview` | `() => FilePreviewHandler \| null` | 读取最近的文件预览宿主，未安装时返回 `null`——供想自行派发预览的自定义组件使用 |
| `toFilePreviewTarget` | `(file: UploadFile) => FilePreviewTarget` | 把 Ant Design 的 `UploadFile` 规范化为预览契约。它是唯一知道上传家族把元数据存在哪里的地方（列表条目上的 `UploadedFileMeta`、`originFileObj` 上的本地字节）——请使用它而不是自行检视 `UploadFile` |
