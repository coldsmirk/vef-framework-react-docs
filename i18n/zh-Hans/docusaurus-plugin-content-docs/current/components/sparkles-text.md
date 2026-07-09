---
title: "SparklesText"
description: "在文本周围渲染动态闪烁粒子效果。"
---

# SparklesText

在文本周围渲染动态闪烁粒子效果。

> **VEF 专属组件。** 不属于 Ant Design。

## 基础用法

```tsx
import { SparklesText } from '@vef-framework-react/components';

export default function Demo() {
  return <SparklesText>✨ Magic Text</SparklesText>;
}
```

## 自定义粒子数量

```tsx
<SparklesText sparklesCount={20}>Sparkly!</SparklesText>
```

## API

`SparklesText` 继承所有 `div` 元素属性，并新增：

| Prop | Type | Default | 说明 |
|------|------|---------|-------------|
| `sparklesCount` | `number` | `10` | 闪烁粒子的数量 |
| `children` | `ReactNode` | — | 文本内容 |
| `className` | `string` | — | CSS 类名 |
| `style` | `CSSProperties` | — | 内联样式 |
