---
sidebar_position: 27
---

# SparklesText 闪光文字

在文字周围渲染动态闪光粒子效果。

> **VEF 特有组件**，不属于 Ant Design。

## 基础用法

```tsx
import { SparklesText } from '@vef-framework-react/components';

export default function Demo() {
  return <SparklesText>✨ 魔法文字</SparklesText>;
}
```

## 自定义闪光数量

```tsx
<SparklesText sparklesCount={20}>闪闪发光！</SparklesText>
```

## API

`SparklesText` 继承所有 `div` 元素属性，另有：

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `sparklesCount` | `number` | `10` | 闪光粒子数量 |
| `children` | `ReactNode` | — | 文字内容 |
| `className` | `string` | — | CSS 类名 |
| `style` | `CSSProperties` | — | 内联样式 |
