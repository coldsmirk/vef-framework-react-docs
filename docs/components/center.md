---
sidebar_position: 13
---

# Center

A flex layout container that centers its children both horizontally and vertically.

> **VEF-specific component.** Not part of Ant Design.

## When to Use

- Center content within a container (e.g. empty states, loading indicators, hero sections).
- Replace `display: flex; justify-content: center; align-items: center` boilerplate.

## Basic Usage

```tsx
import { Center } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <Center style={{ height: 200, background: '#f5f5f5' }}>
      <span>Centered Content</span>
    </Center>
  );
}
```

## With Gap

```tsx
import { Center } from '@vef-framework-react/components';
import { Spin } from '@vef-framework-react/components';

export default function LoadingState() {
  return (
    <Center gap="small" style={{ height: '100%' }}>
      <Spin />
      <span>Loading...</span>
    </Center>
  );
}
```

## API

`Center` extends all `Flex` props except `vertical`, `gap`, `justify`, and `align` (which are preset to center), plus:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `gap` | `'small' \| 'middle' \| 'large' \| CSSProperties['gap']` | — | Gap between children |
| `className` | `string` | — | CSS class |
| `style` | `CSSProperties` | — | Inline style |
| `ref` | `Ref<HTMLDivElement>` | — | DOM ref |

## Best Practices

- Use `Center` for empty state placeholders and loading screens.
- Combine with `style={{ height: '100%' }}` to fill the parent container.
