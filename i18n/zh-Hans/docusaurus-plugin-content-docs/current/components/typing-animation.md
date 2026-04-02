---
sidebar_position: 29
---

# TypingAnimation 打字动画

逐字符显示文字的打字机效果动画组件。

> **VEF 特有组件**，不属于 Ant Design。

## 基础用法

```tsx
import { TypingAnimation } from '@vef-framework-react/components';

export default function Demo() {
  return <TypingAnimation>你好，我是 VEF Framework！</TypingAnimation>;
}
```

## 带延迟

```tsx
<TypingAnimation delay={500} duration={80}>
  500ms 后开始打字...
</TypingAnimation>
```

## 滚动触发

```tsx
<TypingAnimation startOnView>
  进入视口时开始打字动画。
</TypingAnimation>
```

## API

`TypingAnimation` 继承所有 `motion.div` 属性，另有：

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `children` | `ReactNode` | — | 文字内容 |
| `duration` | `number` | `100` | 每个字符的间隔（毫秒） |
| `delay` | `number` | `0` | 动画开始前的延迟（毫秒） |
| `startOnView` | `boolean` | `false` | 元素进入视口时才开始动画 |
| `className` | `string` | — | CSS 类名 |
| `style` | `CSSProperties` | — | 内联样式 |
