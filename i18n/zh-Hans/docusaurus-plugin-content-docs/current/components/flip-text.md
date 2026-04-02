---
sidebar_position: 26
---

# FlipText 翻转文字

使用 GSAP 实现逐字符翻转动画效果的文字组件。

> **VEF 特有组件**，不属于 Ant Design。

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
  动画文字
</FlipText>
```

## API

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `children` | `ReactNode` | 必填 | 文字内容 |
| `duration` | `number` | `0.6` | 每个字符的动画时长（秒） |
| `delayMultiple` | `number` | `0.08` | 字符间的交错延迟（秒） |
| `repeat` | `number` | `0` | 重复次数（`0` = 一次，`-1` = 无限） |
| `className` | `string` | — | CSS 类名 |
| `style` | `CSSProperties` | — | 内联样式 |
