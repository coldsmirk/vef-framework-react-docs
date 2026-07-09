---
title: "Loader"
description: "支持全屏或行内显示的加载指示器，可附带可选的描述文本。"
---

# Loader

支持全屏或行内显示的加载指示器，可附带可选的描述文本。

> **VEF 专属组件。** 不属于 Ant Design 的一部分。

## 何时使用

- 在页面或区块获取数据期间显示加载状态。
- 在路由切换期间用作全屏遮罩层。

## 基础用法

```tsx
import { Loader } from '@vef-framework-react/components';

export default function Demo() {
  return <Loader />;
}
```

## 带描述文本

```tsx
import { Loader } from '@vef-framework-react/components';

export default function Demo() {
  return <Loader description="Loading data, please wait..." />;
}
```

## 自定义尺寸

```tsx
import { Loader } from '@vef-framework-react/components';

export default function Demo() {
  return <Loader size="large" description="Initializing..." descriptionSize={16} />;
}
```

## 条件渲染

```tsx
import { Loader } from '@vef-framework-react/components';

export default function Page({ isLoading }: { isLoading: boolean }) {
  if (isLoading) {
    return <Loader description="Loading page..." />;
  }
  return <div>Page content</div>;
}
```

## API

| Prop | Type | Default | 说明 |
|------|------|---------|-------------|
| `size` | `'small' \| 'medium' \| 'default' \| 'large' \| number` | — | 加载图标尺寸 |
| `description` | `ReactNode` | — | 显示在加载图标下方的文本 |
| `descriptionSize` | `number` | — | 描述文本的字号（像素） |

## 最佳实践

- 页面级加载状态使用 `Loader`；行内/组件级加载使用 Ant Design 的 `Spin`。
- 提供 `description` 以便让用户了解当前正在加载的内容。
