---
sidebar_position: 25
---

# Keyboard

Renders keyboard shortcut keys with consistent styling.

> **VEF-specific component.** Not part of Ant Design.

## Basic Usage

```tsx
import { Keyboard } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <span>
      Press <Keyboard>Ctrl</Keyboard> + <Keyboard>K</Keyboard> to search
    </span>
  );
}
```

## Sizes

```tsx
import { Keyboard, Space } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <Space>
      <Keyboard size="small">Esc</Keyboard>
      <Keyboard>Enter</Keyboard>
      <Keyboard size="large">Space</Keyboard>
    </Space>
  );
}
```

## API

`Keyboard` extends all native `<kbd>` element props, plus:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'small' \| 'middle' \| 'large'` | `'middle'` | Key size |
| `children` | `ReactNode` | — | Key label |
| `className` | `string` | — | CSS class |
| `style` | `CSSProperties` | — | Inline style |
