---
title: "Group"
description: "横向 flex 布局容器，是对 Ant Design `Flex` 组件横向预设的便捷封装。"
---

# Group

横向 flex 布局容器，是对 Ant Design `Flex` 组件横向预设的便捷封装。

> **VEF 专属组件。** 不属于 Ant Design 的一部分。

## 何时使用

- 将子元素横向排列，并保持一致的间距。
- `<div style={{ display: 'flex', flexDirection: 'row' }}>` 的语义化替代方案。

## 基础用法

```tsx
import { Group } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <Group gap="small">
      <span>Label</span>
      <span>Value</span>
    </Group>
  );
}
```

## 带对齐方式

```tsx
import { Group } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <Group gap="middle" align="center">
      <Avatar />
      <span>Username</span>
    </Group>
  );
}
```

## API

`Group` 继承了除 `vertical`、`orientation`（已固定为横向）和 `gap`（在下方重新定义）之外的所有 `Flex` 属性，并新增：

| Prop | Type | Default | 说明 |
|------|------|---------|-------------|
| `gap` | `'small' \| 'medium' \| 'large' \| CSSProperties['gap']` | `'small'` | 子元素间距 |
| `align` | `CSSProperties['alignItems']` | `'center'` | 交叉轴对齐方式 |
| `justify` | `CSSProperties['justifyContent']` | — | 主轴对齐方式 |
| `wrap` | `boolean \| CSSProperties['flexWrap']` | — | 换行方式 |
| `ref` | `Ref<HTMLDivElement>` | — | DOM ref |

## 最佳实践

- 横向布局使用 `Group`，纵向布局使用 [`Stack`](./stack)，居中内容使用 [`Center`](./center)。
