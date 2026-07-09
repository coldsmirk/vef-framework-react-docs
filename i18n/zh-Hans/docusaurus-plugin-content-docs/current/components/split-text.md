---
title: "SplitText"
description: "使用 GSAP 将文本拆分为字符、单词或行来实现动画效果。"
---

# SplitText

使用 GSAP 将文本拆分为字符、单词或行来实现动画效果。

> **VEF 专属组件。** 不属于 Ant Design。

## 基础用法

```tsx
import { SplitText } from '@vef-framework-react/components';

export default function Demo() {
  return <SplitText text="Hello World" />;
}
```

## 按单词拆分并自定义动画

```tsx
<SplitText
  tag="h1"
  text="Welcome to VEF Framework"
  splitType="words"
  duration={0.8}
  delay={80}
  from={{ opacity: 0, y: 60 }}
  to={{ opacity: 1, y: 0 }}
/>
```

## 滚动触发

```tsx
<SplitText
  text="Scroll to reveal this text"
  threshold={0.3}
/>
```

## API

| Prop | Type | Default | 说明 |
|------|------|---------|-------------|
| `text` | `string` | required | 要执行动画的文本内容 |
| `tag` | `'h1' \| 'h2' \| 'h3' \| 'h4' \| 'h5' \| 'h6' \| 'p' \| 'span'` | `'p'` | 要渲染的 HTML 标签 |
| `splitType` | `'chars' \| 'words' \| 'lines' \| 'words, chars'` | `'chars'` | 文本的拆分方式 |
| `delay` | `number` | `100` | 每个单元动画之间的延迟（毫秒） |
| `duration` | `number` | `0.6` | 每个单元动画的时长（秒） |
| `ease` | `string \| function` | `'power3.out'` | GSAP 缓动函数 |
| `from` | `gsap.TweenVars` | `{ opacity: 0, y: 40 }` | 初始 GSAP 属性 |
| `to` | `gsap.TweenVars` | `{ opacity: 1, y: 0 }` | 目标 GSAP 属性 |
| `threshold` | `number` | `0.1` | 触发动画的交叉阈值（0–1） |
| `rootMargin` | `string` | `'-100px'` | 滚动触发器的根边距 |
| `textAlign` | `CSSProperties['textAlign']` | `'center'` | 文本对齐方式 |
| `className` | `string` | — | CSS 类名 |
| `onLetterAnimationComplete` | `() => void` | — | 所有动画完成时触发的回调 |
