---
title: "FileUpload"
description: "分片、可续传的上传组件，接入框架自身的存储协议。"
---

# FileUpload

[`Upload`](./upload.md) 的分片上传变体，接入框架的 `sys/storage` 资源。每个文件都会交给自己独立的 `Uploader` 实例（来自 `@vef-framework-react/core`）处理，因此 Ant Design 的并发文件调度可以开箱即用。

> **VEF 专属组件。** 封装了 [`Upload`](./upload.md)，将 `customRequest` 替换为运行框架分片存储协议的实现，而非单次不透明的 `action` POST 请求。

## 何时使用

- 需要通过框架的可续传分片存储协议上传文件——具备分片并发数与重试次数的精细控制——而非单次请求上传。
- 仍然需要 `Upload` 的拖拽、图片卡片、粘贴上传和图片裁剪等能力；`FileUpload` 会原样转发除 `customRequest` / `action` / `method` / `data` / `headers` 之外的所有属性，这几项由它自己接管。
- 当后端不是框架自身的存储服务时，改用带有自定义 `action` 或 `customRequest` 的原生 [`Upload`](./upload.md)。

`FileUpload` 需要组件树中存在 `ApiClientProvider`（以及用于 URL 解析的 `AppContextProvider`）——它内部会调用 `useApiClient()` 和 `useAppContext()`。

## 基础用法

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

## 进度与错误处理

```tsx
<FileUpload
  onUploadProgress={(file, progress) => console.log(file.name, progress.percent)}
  onUploadSuccess={(file, result) => console.log('uploaded', result.key)}
  onUploadError={(file, error) => console.error('failed', file.name, error)}
/>
```

## 公开上传

```tsx
// Lands the object under `pub/` instead of `priv/`. Requires the backend's
// `vef.storage.allow_public_uploads` to be enabled.
<FileUpload public />
```

## 解析自定义访问 URL

```tsx
<FileUpload
  resolveFileUrl={(key) => `https://cdn.example.com/${key}`}
/>
```

## 表单集成

在 `<form.AppField>` 中使用 `field.Upload` 字段组件，它封装了 `FileUpload` 并接管 `fileList` / `onChange`——字段值默认为存储 key 数组；仅当 `maxCount` 为 1 时才是单个 key 字符串：

```tsx
<form.AppField name="attachments">
  {(field) => <field.Upload label="Attachments" maxCount={3} />}
</form.AppField>
```

## API

### FileUploadProps

继承 Ant Design 的 `UploadProps`（参见 [`Upload`](./upload.md)），但去除了 `customRequest`、`action`、`method`、`data`、`headers`，并新增：

| Prop | 类型 | 默认值 | 说明 |
|------|------|---------|-------------|
| `public` | `boolean` | `false` | 将对象存放于 `pub/` 而非 `priv/`；需要后端启用 `vef.storage.allow_public_uploads` |
| `apiPath` | `string` | `"/api"` | 覆盖 RPC 入口 URL |
| `resource` | `string` | `"sys/storage"` | 覆盖 RPC 资源名 |
| `version` | `string` | `"v1"` | 覆盖 RPC 版本号 |
| `partConcurrency` | `UploaderOptions["partConcurrency"]` | `3` | 单文件的分片并发数 |
| `maxPartRetries` | `UploaderOptions["maxPartRetries"]` | `3` | 单个分片的重试次数上限 |
| `resolveFileUrl` | `(key: string) => string` | 由 `useAppContext` 提供的 `${fileBaseUrl}/${key}` | 将对象 key 解析为访问 URL |
| `onUploadProgress` | `(file: File, progress: UploadProgress) => void` | — | 文件每次聚合进度更新时触发 |
| `onUploadSuccess` | `(file: File, result: UploadResult) => void` | — | 文件上传成功后触发 |
| `onUploadError` | `(file: File, error: UploadError) => void` | — | 文件终止性失败（包括中止）时触发 |

其余所有属性（`listType`、`maxCount`、`enableCrop`、`pastable`、`multiple`、`accept`、`beforeUpload` 等）参见 [`Upload`](./upload.md) 文档。

### UploadedFileMeta

文件上传完成后会被附加到 Ant Design 的 `UploadFile` 上——在 `onChange` 之后从 `fileList` 项中读取：

| 字段 | 类型 | 说明 |
|-------|------|-------------|
| `key` | `string` | 对象 key（例如 `priv/2026/05/12/abc.png`） |
| `sourceUrl` | `string` | 解析后的源 URL——由 `fileBaseUrl` 组合而成，除非提供了 `resolveFileUrl`。有意与 antd 可导航的 `UploadFile.url` 分开存放，确保带鉴权的文件绝不会被渲染成原生列表链接（见 [Upload——鉴权文件](./upload.md#鉴权文件与-url-隔离)） |
| `fileName` | `string` | 后端回传的客户端原始文件名 |

非图片文件的预览会经由共享的 `Upload` 预览链路派发到应用的[文件预览宿主](./file-preview.md)。
