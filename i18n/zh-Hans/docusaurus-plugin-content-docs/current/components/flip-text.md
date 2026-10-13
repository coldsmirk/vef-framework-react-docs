---
title: "FlipText"
description: "使用 Motion 实现逐字符翻转的文字动画效果。"
---

# FlipText

使用 [Motion](https://motion.dev/)（经 `@vef-framework-react/core` 重导出）实现逐字符翻转的文字动画效果。

> **VEF 专属组件。** 不属于 Ant Design。

## 基础用法

```tsx
import { FlipText } from '@vef-framework-react/components';

export default function Demo() {
  return <FlipText>Hello World</FlipText>;
}
```

## 自定义动画

```tsx
<FlipText duration={0.4} delayMultiple={0.05} repeat={2}>
  Animated Text
</FlipText>
```

## API

props 类型以 `FlipTextProps` 导出。

| Prop | Type | Default | 说明 |
|------|------|---------|-------------|
| `children` | `ReactNode` | required | 文本内容 |
| `duration` | `number` | `0.6` | 每个字符的动画时长（秒） |
| `delayMultiple` | `number` | `0.08` | 字符间的交错延迟（秒） |
| `repeat` | `number` | `0` | 重复次数（`0` 表示一次，`-1` 表示无限循环） |
| `className` | `string` | — | CSS 类名 |
| `style` | `CSSProperties` | — | 内联样式 |
