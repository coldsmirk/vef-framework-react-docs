---
title: "Center"
description: "将子元素水平和垂直方向都居中的 flex 布局容器。"
---

# Center

将子元素水平和垂直方向都居中的 flex 布局容器。

> **VEF 专属组件。** 不属于 Ant Design 的一部分。

## 何时使用

- 在容器内居中显示内容（如空状态、加载指示器、主视觉区域）。
- 替代 `display: flex; justify-content: center; align-items: center` 样板代码。

## 基础用法

```tsx
import { Center } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <Center style={{ height: 200, background: '#f5f5f5' }}>
      <span>Centered Content</span>
    </Center>
  );
}
```

## 带间距

```tsx
import { Center } from '@vef-framework-react/components';
import { Spin } from '@vef-framework-react/components';

export default function LoadingState() {
  return (
    <Center gap="small" style={{ height: '100%' }}>
      <Spin />
      <span>Loading...</span>
    </Center>
  );
}
```

## API

`Center` 继承了除 `vertical`、`gap`、`justify` 和 `align`（已预设为居中）之外的所有 `Flex` 属性，并新增：

| Prop | Type | Default | 说明 |
|------|------|---------|-------------|
| `gap` | `'small' \| 'medium' \| 'middle' \| 'large' \| CSSProperties['gap']` | — | 子元素间距 |
| `className` | `string` | — | CSS 类名 |
| `style` | `CSSProperties` | — | 内联样式 |
| `ref` | `Ref<HTMLDivElement>` | — | DOM ref |

## 最佳实践

- 空状态占位和加载界面使用 `Center`。
- 配合 `style={{ height: '100%' }}` 填充父容器。
