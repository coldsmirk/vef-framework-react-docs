---
sidebar_position: 28
---

# SplitText

Animates text by splitting it into characters, words, or lines using GSAP.

> **VEF-specific component.** Not part of Ant Design.

## Basic Usage

```tsx
import { SplitText } from '@vef-framework-react/components';

export default function Demo() {
  return <SplitText text="Hello World" />;
}
```

## Word Split with Custom Animation

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

## Trigger on Scroll

```tsx
<SplitText
  text="Scroll to reveal this text"
  threshold={0.3}
/>
```

## API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `string` | required | Text content to animate |
| `tag` | `'h1' \| 'h2' \| 'h3' \| 'h4' \| 'h5' \| 'h6' \| 'p' \| 'span'` | `'p'` | HTML tag to render |
| `splitType` | `'chars' \| 'words' \| 'lines' \| 'words, chars'` | `'chars'` | How to split the text |
| `delay` | `number` | `100` | Delay between each unit animation (ms) |
| `duration` | `number` | `0.6` | Duration of each unit animation (seconds) |
| `ease` | `string \| function` | `'power3.out'` | GSAP easing function |
| `from` | `gsap.TweenVars` | `{ opacity: 0, y: 40 }` | Initial GSAP properties |
| `to` | `gsap.TweenVars` | `{ opacity: 1, y: 0 }` | Target GSAP properties |
| `threshold` | `number` | `0.1` | Intersection threshold to trigger animation (0–1) |
| `className` | `string` | — | CSS class |
