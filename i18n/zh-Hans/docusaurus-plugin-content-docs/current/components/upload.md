---
title: "Upload"
description: "支持可选图片裁剪功能的文件上传组件。"
---

# Upload

支持可选图片裁剪功能的文件上传组件。

> **来源：** 基于 `antd` 的 Upload 封装，并增加了 VEF 图片裁剪增强功能。完整文档：[Ant Design Upload](https://ant.design/components/upload/)

## VEF 增强

VEF 在 `antd` Upload 之上封装了以下行为：

- `enableCrop` 和 `cropperProps` 通过 `antd-img-crop` 在上传前提供内联图片裁剪（默认开启重置、旋转和缩放控件）。
- 未传 `children` 时提供默认上传触发器：一个 primary 的"上传"按钮（达到 `maxCount` 后禁用），或在 `listType="picture-card"` / `"picture-circle"` 时的加号图标（达到 `maxCount` 后隐藏）。
- 默认预览链路：图片在内置的 [`Image`](https://ant.design/components/image/) 弹窗中展示，其余所有文件类型派发到应用的[文件预览宿主](./file-preview.md)。
- 针对带鉴权文件的预览源隔离：文件 URL 绝不会被 antd 列表渲染成原生链接。
- `pastable` 默认为 `true`（antd 默认为 `false`）。

## 基础用法

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

## 带裁剪功能的图片上传

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

## 粘贴上传

```tsx
<Upload action="/api/upload" pastable>
  <button>Upload or Paste</button>
</Upload>
```

## 预览行为

当用户点击列表项的预览操作时，`Upload` 执行如下链路（显式传入 `onPreview` 属性会完全绕过它）：

1. **图片**（先按 MIME 类型判定，其次是文件扩展名，再次是 URL——绝不依据 antd 生成的缩略图）在内置的 `Image` 预览弹窗中打开。没有 URL 的文件回退为从本地字节读出的 base64 data URL。
2. **其余一切**经 `toFilePreviewTarget(file)` 规范化为 `FilePreviewTarget`，派发给最近的 [`FilePreviewProvider`](./file-preview.md)。若宿主的 `canPreview(target)` 返回 `false`，或没有挂载 provider，则显示"该文件暂不支持预览"的警告。

框架绝不会直接打开文件 URL，因为它无法证明该 URL 可匿名读取——获取字节和渲染是预览宿主的职责。provider/宿主一侧的实现见 [FilePreview](./file-preview.md)。

## 鉴权文件与 URL 隔离

antd 会把 `UploadFile.url` 在文件列表中渲染成原生 `<a>` 链接，并在其默认下载回退中使用它——这会把带鉴权的 URL 泄漏到 DOM 里。VEF 的 `Upload` 阻止了这一点：

- 在到达 antd 之前，每个文件的 `url` 都被移到内部标记之后，因此列表渲染的是纯文本而非链接。传给每个回调（`onChange`、`onPreview`、`onRemove`、`onDownload`、`isImageUrl`、`iconRender`、`itemRender` 以及 `showUploadList` 的渲染选项）的文件对象上会恢复你原本的 `url`，应用代码不受影响。
- 由 `customRequest` 成功处理器附加的 URL 同样会被隔离。
- 经框架分片存储协议上传的文件改为携带 `UploadedFileMeta`（`key` / `sourceUrl` / `fileName`）：`sourceUrl` 被有意与 antd 可导航的 `url` 分开存放。`UploadFile.thumbUrl` 只应用于应用认可的展示缩略图。
- 未提供处理器时，`onDownload` 会显示"该文件暂不支持下载"的警告，而不是发起跳转。

## API

在 Ant Design `UploadProps` 基础上扩展了以下属性：

| Prop | Type | Default | 说明 |
|------|------|---------|-------------|
| `enableCrop` | `boolean` | `false` | 上传前启用图片裁剪 |
| `cropperProps` | `Except<ImgCropProps, 'children'>` | `{ showReset: true, rotationSlider: true, zoomSlider: true }` | 图片裁剪器配置，合并覆盖在默认值之上 |
| `pastable` | `boolean` | `true` | 允许从剪贴板粘贴图片（VEF 将 antd 默认的 `false` 改为了 `true`） |

其余属性请参阅 [Ant Design Upload 文档](https://ant.design/components/upload/)。

### UploadedFileMeta

上传家族盖在 antd `UploadFile` 上的逐文件存储元数据：[`FileUpload`](./file-upload.md) 在分片上传完成时把它补到原始 `File` 上，表单的 `UploadField` 在水合已存储的 key 时盖上它。预览目标定位和表单字段都通过这一形状读回存储 key。

| 字段 | 类型 | 说明 |
|-------|------|-------------|
| `key` | `string` | 存储对象 key（例如 `priv/2026/05/12/abc.png`） |
| `sourceUrl` | `string` | 用于获取已存储对象的解析后源 URL。与 antd 可导航的 `UploadFile.url` 分开存放，确保带鉴权的文件绝不会以原生列表链接的形式暴露 |
| `fileName` | `string` | 后端回传的客户端原始文件名 |

若要在上传组件之外将存储 key 解析回其记录的元数据（原始文件名、内容类型、大小、上传状态）——例如在列表或只读表单中——请使用 `@vef-framework-react/hooks` 中的 [`useStoredFileNames`](../reference/hooks/vef-hooks.md#存储文件名解析)。

### toFilePreviewTarget

```ts
function toFilePreviewTarget(file: UploadFile): FilePreviewTarget;
```

把 antd 的 `UploadFile` 规范化为框架的[文件预览契约](./file-preview.md)。它是唯一知道上传家族把元数据存在哪里的地方——列表条目上的 `UploadedFileMeta`、`originFileObj` 上的本地字节——因此预览宿主永远不需要自行检视 `UploadFile`。手动触发预览宿主时（例如在自定义 `itemRender` 中）请使用它。
