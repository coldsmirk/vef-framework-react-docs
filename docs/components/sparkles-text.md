---
sidebar_position: 27
---

# SparklesText

Renders text with animated sparkle particles around it.

> **VEF-specific component.** Not part of Ant Design.

## Basic Usage

```tsx
import { SparklesText } from '@vef-framework-react/components';

export default function Demo() {
  return <SparklesText>✨ Magic Text</SparklesText>;
}
```

## Custom Sparkle Count

```tsx
<SparklesText sparklesCount={20}>Sparkly!</SparklesText>
```

## API

`SparklesText` extends all `div` element props, plus:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `sparklesCount` | `number` | `10` | Number of sparkle particles |
| `children` | `ReactNode` | — | Text content |
| `className` | `string` | — | CSS class |
| `style` | `CSSProperties` | — | Inline style |
