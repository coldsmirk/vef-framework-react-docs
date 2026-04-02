---
sidebar_position: 13
---

# Center 居中布局

将子元素水平和垂直居中的 flex 布局容器。

> **VEF 特有组件**，不属于 Ant Design。

## 何时使用

- 在容器内居中内容（如空状态、加载指示器、主视觉区域）。
- 替代 `display: flex; justify-content: center; align-items: center` 样板代码。

## 基础用法

```tsx
import { Center } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <Center style={{ height: 200, background: '#f5f5f5' }}>
      <span>居中内容</span>
    </Center>
  );
}
```

## 带间距

```tsx
import { Center, Spin } from '@vef-framework-react/components';

export default function LoadingState() {
  return (
    <Center gap="small" style={{ height: '100%' }}>
      <Spin />
      <span>加载中...</span>
    </Center>
  );
}
```

## API

`Center` 继承所有 `Flex` 属性（除 `vertical`、`gap`、`justify`、`align`，已预设为居中），另有：

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `gap` | `'small' \| 'middle' \| 'large' \| CSSProperties['gap']` | — | 子元素间距 |
| `className` | `string` | — | CSS 类名 |
| `style` | `CSSProperties` | — | 内联样式 |
| `ref` | `Ref<HTMLDivElement>` | — | DOM ref |

## 最佳实践

- 空状态占位和加载屏幕使用 `Center`。
- 配合 `style={{ height: '100%' }}` 填充父容器。
