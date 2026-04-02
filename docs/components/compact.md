---
sidebar_position: 108
---

# Compact

A wrapper that compacts child components (inputs, buttons, etc.) into a seamless group.

> **Source:** Re-exported from `antd` (`Space.Compact`). Full documentation: [Ant Design Space Compact](https://ant.design/components/space/#Space.Compact)

## Basic Usage

```tsx
import { Compact, Input, Button } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <Compact>
      <Input placeholder="Search..." />
      <Button type="primary">Search</Button>
    </Compact>
  );
}
```

## API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'large' \| 'middle' \| 'small'` | `'middle'` | Size of child components |
| `direction` | `'horizontal' \| 'vertical'` | `'horizontal'` | Layout direction |
| `block` | `boolean` | `false` | Fit width to parent |
