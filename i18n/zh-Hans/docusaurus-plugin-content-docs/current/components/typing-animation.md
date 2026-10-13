---
title: "TypingAnimation"
description: "使用打字机效果逐字符显示文本动画。"
---

# TypingAnimation

使用打字机效果逐字符显示文本动画。

> **VEF 专属组件。** 不属于 Ant Design。

## 基础用法

```tsx
import { TypingAnimation } from '@vef-framework-react/components';

export default function Demo() {
  return <TypingAnimation>Hello, I am VEF Framework!</TypingAnimation>;
}
```

## 延迟启动

```tsx
<TypingAnimation delay={500} duration={80}>
  This text starts typing after 500ms...
</TypingAnimation>
```

## 滚动触发

```tsx
<TypingAnimation startOnView>
  This text types when it enters the viewport.
</TypingAnimation>
```

## API

props 类型以 `TypingAnimationProps` 导出。

`TypingAnimation` 继承所有 `motion.div` 属性，并新增：

| Prop | Type | Default | 说明 |
|------|------|---------|-------------|
| `children` | `ReactNode` | — | 文本内容 |
| `duration` | `number` | `100` | 每个字符之间的延迟（毫秒） |
| `delay` | `number` | `0` | 动画开始前的延迟（毫秒） |
| `startOnView` | `boolean` | `false` | 元素进入视口时开始动画 |
| `className` | `string` | — | CSS 类名 |
| `style` | `CSSProperties` | — | 内联样式 |
