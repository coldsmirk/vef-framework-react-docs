---
sidebar_position: 17
---

# IconButton

An icon-only button with an optional tooltip.

> **VEF-specific component.** Not part of Ant Design.

## When to Use

- Compact action buttons in tables, toolbars, or cards where space is limited.
- When the icon is self-explanatory but a tooltip improves accessibility.

## Basic Usage

```tsx
import { IconButton } from '@vef-framework-react/components';
import { Pencil } from 'lucide-react';

export default function Demo() {
  return (
    <IconButton
      icon={<Pencil />}
      tip="Edit"
      onClick={() => console.log('edit')}
    />
  );
}
```

## With Tooltip Placement

```tsx
import { IconButton } from '@vef-framework-react/components';
import { Trash2 } from 'lucide-react';

export default function Demo() {
  return (
    <IconButton
      icon={<Trash2 />}
      tip="Delete"
      placement="bottom"
      onClick={() => console.log('delete')}
    />
  );
}
```

## Delayed Tooltip

```tsx
<IconButton
  icon={<Settings />}
  tip="Settings"
  tipDelay={500}
/>
```

## In a Table Column

```tsx
{
  title: 'Actions',
  width: 80,
  render: (_, record) => (
    <Space>
      <IconButton
        icon={<Pencil size={14} />}
        tip="Edit"
        onClick={() => openEdit(record)}
      />
      <IconButton
        icon={<Trash2 size={14} />}
        tip="Delete"
        onClick={() => confirmDelete(record)}
      />
    </Space>
  ),
}
```

## API

`IconButton` extends `Button` props except `icon`, `iconPosition`, `type`, `htmlType`, `autoInsertSpace`, `color`, `variant`, `ghost`, `danger`, and `block`. Plus:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `ReactElement<LucideProps>` | required | Lucide icon element |
| `tip` | `ReactNode` | — | Tooltip content |
| `tipDelay` | `number` | — | Tooltip show delay in milliseconds |
| `placement` | `TooltipPlacement` | — | Tooltip placement |
| `size` | `'large' \| 'middle' \| 'small'` | — | Button size |
| `disabled` | `boolean` | `false` | Disable the button |
| `loading` | `boolean` | `false` | Show loading state |
| `onClick` | `(e) => void` | — | Click handler |

## Best Practices

- Always provide a `tip` for accessibility — screen readers and keyboard users rely on it.
- Use Lucide icons from `lucide-react` (already a dependency of `@vef-framework-react/components`).
- For icon buttons that need permission checks, wrap with `PermissionGate` or use `OperationButton`.
