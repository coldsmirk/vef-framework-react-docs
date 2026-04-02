---
sidebar_position: 2
---

# Button

Triggers an operation when clicked.

> **Source:** Re-exported from `antd`. Full documentation: [Ant Design Button](https://ant.design/components/button/)

## When to Use

- To trigger a background operation.
- To trigger a navigation action.
- To submit a form.

## Basic Usage

```tsx
import { Button } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <Button type="primary" onClick={() => console.log('clicked')}>
      Primary Button
    </Button>
  );
}
```

## Button Types

```tsx
import { Button, Space } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <Space>
      <Button type="primary">Primary</Button>
      <Button>Default</Button>
      <Button type="dashed">Dashed</Button>
      <Button type="text">Text</Button>
      <Button type="link">Link</Button>
    </Space>
  );
}
```

## Sizes

```tsx
import { Button, Space } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <Space align="center">
      <Button type="primary" size="large">Large</Button>
      <Button type="primary">Default</Button>
      <Button type="primary" size="small">Small</Button>
    </Space>
  );
}
```

## Loading State

```tsx
import { Button } from '@vef-framework-react/components';
import { useState } from 'react';

export default function Demo() {
  const [loading, setLoading] = useState(false);

  return (
    <Button
      type="primary"
      loading={loading}
      onClick={() => {
        setLoading(true);
        setTimeout(() => setLoading(false), 2000);
      }}
    >
      Click to Load
    </Button>
  );
}
```

## Danger Button

```tsx
import { Button, Space } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <Space>
      <Button danger>Danger Default</Button>
      <Button type="primary" danger>Danger Primary</Button>
      <Button type="dashed" danger>Danger Dashed</Button>
    </Space>
  );
}
```

## API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `'primary' \| 'default' \| 'dashed' \| 'text' \| 'link'` | `'default'` | Button style type |
| `size` | `'large' \| 'middle' \| 'small'` | `'middle'` | Button size |
| `loading` | `boolean \| { delay?: number }` | `false` | Show loading state |
| `disabled` | `boolean` | `false` | Disable the button |
| `danger` | `boolean` | `false` | Set danger status |
| `ghost` | `boolean` | `false` | Make background transparent |
| `block` | `boolean` | `false` | Fit button width to parent |
| `icon` | `ReactNode` | — | Icon element |
| `iconPosition` | `'start' \| 'end'` | `'start'` | Icon position |
| `shape` | `'default' \| 'circle' \| 'round'` | `'default'` | Button shape |
| `href` | `string` | — | Redirect URL (renders as `<a>`) |
| `target` | `string` | — | Same as `<a>` target |
| `htmlType` | `'button' \| 'submit' \| 'reset'` | `'button'` | Native button type |
| `onClick` | `(event) => void` | — | Click handler |

> For async operations with automatic loading state and confirm dialogs, use [`ActionButton`](./action-button) instead.

## Best Practices

- Use `type="primary"` for the main call-to-action on a page. Avoid multiple primary buttons.
- Use `danger` for destructive actions like delete.
- For icon-only buttons with tooltips, use [`IconButton`](./icon-button).
- For buttons that need permission checks, use [`OperationButton`](./overview#vef-specific-components).
