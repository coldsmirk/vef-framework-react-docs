---
sidebar_position: 104
---

# Upload 上传

文件上传组件，支持可选的图片裁剪功能。

> **来源：** 封装 `antd` Upload 并提供 VEF 图片裁剪增强。完整文档：[Ant Design Upload](https://ant.design/components/upload-cn/)

## VEF 增强说明

VEF 新增了 `enableCrop` 和 `cropperProps`，通过 `antd-img-crop` 在上传前进行图片裁剪。

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
      <button>点击上传</button>
    </Upload>
  );
}
```

## 图片上传带裁剪

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
      <div>+ 上传</div>
    </Upload>
  );
}
```

## 粘贴上传

```tsx
<Upload action="/api/upload" pastable>
  <button>上传或粘贴</button>
</Upload>
```

## API

继承 Ant Design `UploadProps`，另有：

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enableCrop` | `boolean` | `false` | 上传前启用图片裁剪 |
| `cropperProps` | `ImgCropProps`（不含 `children`） | — | 图片裁剪器配置 |
| `pastable` | `boolean` | `false` | 允许从剪贴板粘贴图片 |

其他属性请参阅 [Ant Design Upload 文档](https://ant.design/components/upload-cn/)。
