---
title: "Icon"
description: "A wrapper component for rendering Lucide icon components with consistent sizing and styling."
---

# Icon

A wrapper component for rendering Lucide icon components with consistent sizing and styling.

> **VEF-specific component.** Not part of Ant Design.

## When to Use

- Render a Lucide icon component passed as a prop.
- Apply consistent sizing and color to icons across the application.

## Basic Usage

```tsx
import { Icon } from '@vef-framework-react/components';
import { Settings } from 'lucide-react';

export default function Demo() {
  return <Icon component={Settings} />;
}
```

## Dynamic Icon Component

```tsx
import { Icon } from '@vef-framework-react/components';
import type { IconProps } from '@vef-framework-react/components';
import { User, Settings, Bell } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface NavItem {
  label: string;
  IconComponent: LucideIcon;
}

const navItems: NavItem[] = [
  { label: 'Profile', IconComponent: User },
  { label: 'Settings', IconComponent: Settings },
  { label: 'Notifications', IconComponent: Bell },
];

export default function Nav() {
  return (
    <ul>
      {navItems.map((item) => (
        <li key={item.label}>
          <Icon component={item.IconComponent} />
          <span>{item.label}</span>
        </li>
      ))}
    </ul>
  );
}
```

## API

`Icon` extends all Lucide `LucideProps` except `size`, `color`, and `children`, plus:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `component` | `ComponentType<LucideProps>` | — | The Lucide icon component to render. Mutually exclusive with `iconNode` — exactly one of the two is required. |
| `iconNode` | `IconNode` | — | Raw Lucide icon node data to render. Mutually exclusive with `component` — exactly one of the two is required. |
| `strokeWidth` | `number` | `2` | Stroke width |
| `className` | `string` | — | CSS class |
| `style` | `CSSProperties` | — | Inline style |

Icon size and color are not configurable via props — the icon always renders at `1.2em` and inherits `color` from its parent.

## Best Practices

- Use `Icon` when the icon component is passed as a prop. For static icons, import and use Lucide components directly.
- For icon names stored as strings, use [`DynamicIcon`](./dynamic-icon) instead.
