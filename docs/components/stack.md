---
sidebar_position: 12
---

# Stack

A vertical flex layout container. A convenience wrapper around Ant Design's `Flex` with `vertical` preset.

> **VEF-specific component.** Not part of Ant Design.

## When to Use

- Stack children vertically with consistent spacing.
- Replace `<div style={{ display: 'flex', flexDirection: 'column' }}>` with a semantic component.

## Basic Usage

```tsx
import { Stack } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <Stack gap="middle">
      <div>Item 1</div>
      <div>Item 2</div>
      <div>Item 3</div>
    </Stack>
  );
}
```

## With Alignment

```tsx
import { Stack } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <Stack gap="small" align="center">
      <div>Centered Item 1</div>
      <div>Centered Item 2</div>
    </Stack>
  );
}
```

## API

`Stack` extends all `Flex` props except `vertical` and `orientation` (which are fixed to vertical), plus:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `gap` | `'small' \| 'middle' \| 'large' \| CSSProperties['gap']` | — | Gap between children |
| `align` | `CSSProperties['alignItems']` | — | Cross-axis alignment |
| `justify` | `CSSProperties['justifyContent']` | — | Main-axis alignment |
| `wrap` | `CSSProperties['flexWrap']` | — | Flex wrap |
| `flex` | `CSSProperties['flex']` | — | Flex grow/shrink |
| `className` | `string` | — | CSS class |
| `style` | `CSSProperties` | — | Inline style |
| `ref` | `Ref<HTMLDivElement>` | — | DOM ref |

## Best Practices

- Use `Stack` for vertical layouts and [`Center`](./center) for centered content.
- Prefer named gap sizes (`'small'`, `'middle'`, `'large'`) over pixel values for consistency with the design system.
