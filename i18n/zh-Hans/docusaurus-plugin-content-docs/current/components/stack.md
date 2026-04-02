---
sidebar_position: 12
---

# Stack 垂直堆叠

垂直 flex 布局容器，是 Ant Design `Flex` 组件 `vertical` 模式的便捷封装。

> **VEF 特有组件**，不属于 Ant Design。

## 何时使用

- 将子元素垂直排列并保持一致间距。
- 替代 `<div style={{ display: 'flex', flexDirection: 'column' }}>` 样板代码。

## 基础用法

```tsx
import { Stack } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <Stack gap="middle">
      <div>项目 1</div>
      <div>项目 2</div>
      <div>项目 3</div>
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
      <div>居中项目 1</div>
      <div>居中项目 2</div>
    </Stack>
  );
}
```

## API

`Stack` 继承所有 `Flex` 属性（除 `vertical` 和 `orientation`，已固定为垂直方向），另有：

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `gap` | `'small' \| 'middle' \| 'large' \| CSSProperties['gap']` | — | 子元素间距 |
| `align` | `CSSProperties['alignItems']` | — | 交叉轴对齐方式 |
| `justify` | `CSSProperties['justifyContent']` | — | 主轴对齐方式 |
| `wrap` | `CSSProperties['flexWrap']` | — | 换行方式 |
| `flex` | `CSSProperties['flex']` | — | flex 伸缩 |
| `className` | `string` | — | CSS 类名 |
| `style` | `CSSProperties` | — | 内联样式 |
| `ref` | `Ref<HTMLDivElement>` | — | DOM ref |

## 最佳实践

- 垂直布局使用 `Stack`，居中内容使用 [`Center`](./center)。
- 优先使用具名间距（`'small'`、`'middle'`、`'large'`）而非像素值，与设计系统保持一致。
