---
title: "Compact"
description: "A wrapper that compacts child components (inputs, buttons, etc.) into a seamless group."
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

The props type is exported as `CompactProps`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'large' \| 'medium' \| 'small'` | `'medium'` | Size of child components (`'middle'` is a deprecated alias for `'medium'`) |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Layout direction |
| `vertical` | `boolean` | `false` | Shorthand for `orientation="vertical"` |
| `direction` | `'horizontal' \| 'vertical'` | `'horizontal'` | **Deprecated.** Use `orientation` instead |
| `block` | `boolean` | `false` | Fit width to parent |
