---
sidebar_position: 26
---

# FlipText

Animates text with a character-by-character flip effect using GSAP.

> **VEF-specific component.** Not part of Ant Design.

## Basic Usage

```tsx
import { FlipText } from '@vef-framework-react/components';

export default function Demo() {
  return <FlipText>Hello World</FlipText>;
}
```

## Custom Animation

```tsx
<FlipText duration={0.4} delayMultiple={0.05} repeat={2}>
  Animated Text
</FlipText>
```

## API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | required | Text content |
| `duration` | `number` | `0.6` | Animation duration per character (seconds) |
| `delayMultiple` | `number` | `0.08` | Stagger delay between characters (seconds) |
| `repeat` | `number` | `0` | Number of times to repeat (`0` = once, `-1` = infinite) |
| `className` | `string` | — | CSS class |
| `style` | `CSSProperties` | — | Inline style |
