---
sidebar_position: 29
---

# TypingAnimation

Animates text with a typewriter effect, revealing characters one by one.

> **VEF-specific component.** Not part of Ant Design.

## Basic Usage

```tsx
import { TypingAnimation } from '@vef-framework-react/components';

export default function Demo() {
  return <TypingAnimation>Hello, I am VEF Framework!</TypingAnimation>;
}
```

## With Delay

```tsx
<TypingAnimation delay={500} duration={80}>
  This text starts typing after 500ms...
</TypingAnimation>
```

## Trigger on Scroll

```tsx
<TypingAnimation startOnView>
  This text types when it enters the viewport.
</TypingAnimation>
```

## API

`TypingAnimation` extends all `motion.div` props, plus:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | — | Text content |
| `duration` | `number` | `100` | Delay between each character (ms) |
| `delay` | `number` | `0` | Delay before animation starts (ms) |
| `startOnView` | `boolean` | `false` | Start animation when element enters viewport |
| `className` | `string` | — | CSS class |
| `style` | `CSSProperties` | — | Inline style |
