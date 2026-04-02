---
sidebar_position: 15
---

# Loader 加载器

带可选描述文字的全屏或内联加载指示器。

> **VEF 特有组件**，不属于 Ant Design。

## 何时使用

- 页面或区块正在获取数据时展示加载状态。
- 路由切换时作为全屏遮罩层。

## 基础用法

```tsx
import { Loader } from '@vef-framework-react/components';

export default function Demo() {
  return <Loader />;
}
```

## 带描述文字

```tsx
import { Loader } from '@vef-framework-react/components';

export default function Demo() {
  return <Loader description="数据加载中，请稍候..." />;
}
```

## 自定义尺寸

```tsx
import { Loader } from '@vef-framework-react/components';

export default function Demo() {
  return <Loader size="large" description="初始化中..." descriptionSize={16} />;
}
```

## 条件渲染

```tsx
import { Loader } from '@vef-framework-react/components';

export default function Page({ isLoading }: { isLoading: boolean }) {
  if (isLoading) {
    return <Loader description="页面加载中..." />;
  }
  return <div>页面内容</div>;
}
```

## API

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `size` | `'small' \| 'default' \| 'large' \| number` | — | 加载图标尺寸 |
| `description` | `ReactNode` | — | 加载图标下方的文字 |
| `descriptionSize` | `number` | — | 描述文字字号（像素） |

## 最佳实践

- 页面级加载状态使用 `Loader`；组件级内联加载使用 Ant Design 的 `Spin`。
- 提供 `description` 让用户了解正在加载的内容。
