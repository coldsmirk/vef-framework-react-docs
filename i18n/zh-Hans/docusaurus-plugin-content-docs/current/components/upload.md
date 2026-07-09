---
title: "Upload"
description: "支持可选图片裁剪功能的文件上传组件。"
---

# Upload

支持可选图片裁剪功能的文件上传组件。

> **来源：** 基于 `antd` 的 Upload 封装，并增加了 VEF 图片裁剪增强功能。完整文档：[Ant Design Upload](https://ant.design/components/upload/)

## VEF 增强

VEF 新增了 `enableCrop` 和 `cropperProps`，可在上传前通过 `antd-img-crop` 实现内联图片裁剪。

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

## API

在 Ant Design `UploadProps` 基础上扩展了以下属性：

| Prop | Type | Default | 说明 |
|------|------|---------|-------------|
| `enableCrop` | `boolean` | `false` | 上传前启用图片裁剪 |
| `cropperProps` | `ImgCropProps` (without `children`) | — | 图片裁剪器配置 |
| `pastable` | `boolean` | `true` | 允许从剪贴板粘贴图片（VEF 将 antd 默认的 `false` 改为了 `true`） |

其余属性请参阅 [Ant Design Upload 文档](https://ant.design/components/upload/)。
