---
title: "Group"
description: "A horizontal flex layout container. A convenience wrapper around Ant Design's `Flex` with horizontal preset."
---

# Group

A horizontal flex layout container. A convenience wrapper around Ant Design's `Flex` with horizontal preset.

> **VEF-specific component.** Not part of Ant Design.

## When to Use

- Arrange children horizontally with consistent spacing.
- A semantic alternative to `<div style={{ display: 'flex', flexDirection: 'row' }}>`.

## Basic Usage

```tsx
import { Group } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <Group gap="small">
      <span>Label</span>
      <span>Value</span>
    </Group>
  );
}
```

## With Alignment

```tsx
import { Group } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <Group gap="middle" align="center">
      <Avatar />
      <span>Username</span>
    </Group>
  );
}
```

## API

`Group` extends all `Flex` props except `vertical`, `orientation` (fixed to horizontal), and `gap` (redefined below), plus:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `gap` | `'small' \| 'medium' \| 'middle' \| 'large' \| CSSProperties['gap']` | — | Gap between children |
| `align` | `CSSProperties['alignItems']` | — | Cross-axis alignment |
| `justify` | `CSSProperties['justifyContent']` | — | Main-axis alignment |
| `wrap` | `boolean \| CSSProperties['flexWrap']` | — | Flex wrap |
| `ref` | `Ref<HTMLDivElement>` | — | DOM ref |

## Best Practices

- Use `Group` for horizontal layouts, [`Stack`](./stack) for vertical, and [`Center`](./center) for centered content.
