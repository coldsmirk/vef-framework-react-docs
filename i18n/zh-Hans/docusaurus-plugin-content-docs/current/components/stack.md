---
title: "Stack"
description: "纵向 flex 布局容器，是对 Ant Design `Flex` 组件 `vertical` 预设的便捷封装。"
---

# Stack

纵向 flex 布局容器，是对 Ant Design `Flex` 组件 `vertical` 预设的便捷封装。

> **VEF 专属组件。** 不属于 Ant Design 的一部分。

## 何时使用

- 将子元素纵向排列，并保持一致的间距。
- 用语义化组件替代 `<div style={{ display: 'flex', flexDirection: 'column' }}>`。

## 基础用法

```tsx
import { Stack } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <Stack gap="middle">
      <div>Item 1</div>
      <div>Item 2</div>
      <div>Item 3</div>
    </Stack>
  );
}
```

## 带对齐方式

```tsx
import { Stack } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <Stack gap="small" align="center">
      <div>Centered Item 1</div>
      <div>Centered Item 2</div>
    </Stack>
  );
}
```

## API

props 类型以 `StackProps` 导出。

`Stack` 继承了除 `vertical`、`orientation`（已固定为纵向）和 `gap`（在下方重新定义）之外的所有 `Flex` 属性，并新增：

| Prop | Type | Default | 说明 |
|------|------|---------|-------------|
| `gap` | `'small' \| 'medium' \| 'middle' \| 'large' \| CSSProperties['gap']` | `'small'` | 子元素间距 |
| `align` | `CSSProperties['alignItems']` | — | 交叉轴对齐方式 |
| `justify` | `CSSProperties['justifyContent']` | — | 主轴对齐方式 |
| `wrap` | `boolean \| CSSProperties['flexWrap']` | — | 换行方式 |
| `flex` | `CSSProperties['flex']` | — | flex 伸缩 |
| `className` | `string` | — | CSS 类名 |
| `style` | `CSSProperties` | — | 内联样式 |
| `ref` | `Ref<HTMLDivElement>` | — | DOM ref |

## 最佳实践

- 纵向布局使用 `Stack`，居中内容使用 [`Center`](./center)。
- 优先使用具名间距（`'small'`、`'medium'`、`'large'`）而非像素值，以与设计系统保持一致。
