---
sidebar_position: 20
---

# Group 水平布局

水平 flex 布局容器，是 Ant Design `Flex` 组件水平模式的便捷封装。

> **VEF 特有组件**，不属于 Ant Design。

## 基础用法

```tsx
import { Group } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <Group gap="small">
      <span>标签</span>
      <span>值</span>
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
      <span>用户名</span>
    </Group>
  );
}
```

## API

`Group` 继承所有 `Flex` 属性（除 `vertical` 和 `orientation`，已固定为水平方向），另有：

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `gap` | `'small' \| 'middle' \| 'large' \| CSSProperties['gap']` | — | 子元素间距 |
| `align` | `CSSProperties['alignItems']` | — | 交叉轴对齐方式 |
| `justify` | `CSSProperties['justifyContent']` | — | 主轴对齐方式 |
| `wrap` | `CSSProperties['flexWrap']` | — | 换行方式 |
| `ref` | `Ref<HTMLDivElement>` | — | DOM ref |

## 最佳实践

- 水平布局使用 `Group`，垂直布局使用 [`Stack`](./stack)，居中内容使用 [`Center`](./center)。
