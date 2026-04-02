---
sidebar_position: 104
---

# Upload

File upload component with optional image cropping support.

> **Source:** Wraps `antd` Upload with VEF image crop enhancement. Full documentation: [Ant Design Upload](https://ant.design/components/upload/)

## VEF Enhancement

VEF adds `enableCrop` and `cropperProps` to enable inline image cropping via `antd-img-crop` before upload.

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

## API

Extends Ant Design `UploadProps`, plus:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `enableCrop` | `boolean` | `false` | Enable image cropping before upload |
| `cropperProps` | `ImgCropProps` (without `children`) | — | Image cropper configuration |
| `pastable` | `boolean` | `false` | Allow pasting images from clipboard |

For all other props, see [Ant Design Upload documentation](https://ant.design/components/upload/).
