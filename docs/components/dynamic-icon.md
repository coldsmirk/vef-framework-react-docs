---
sidebar_position: 18
---

# DynamicIcon

Renders a [Lucide](https://lucide.dev/) icon by name string, useful for icon names stored in configuration or database.

> **VEF-specific component.** Not part of Ant Design.

## When to Use

- Menu items or navigation entries where the icon name is stored in a database or config file.
- Dynamic icon rendering based on user-defined settings.

## Basic Usage

```tsx
import { DynamicIcon } from '@vef-framework-react/components';

export default function Demo() {
  return <DynamicIcon name="user" size={20} />;
}
```

## Dynamic from Data

```tsx
import { DynamicIcon } from '@vef-framework-react/components';
import type { DynamicIconName } from '@vef-framework-react/components';

interface MenuItem {
  label: string;
  icon: DynamicIconName;
  path: string;
}

const menuItems: MenuItem[] = [
  { label: 'Dashboard', icon: 'layout-dashboard', path: '/' },
  { label: 'Users', icon: 'users', path: '/users' },
  { label: 'Settings', icon: 'settings', path: '/settings' },
];

export default function SideMenu() {
  return (
    <ul>
      {menuItems.map((item) => (
        <li key={item.path}>
          <DynamicIcon name={item.icon} size={16} />
          <span>{item.label}</span>
        </li>
      ))}
    </ul>
  );
}
```

## API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `DynamicIconName` | required | Lucide icon name (kebab-case) |
| `size` | `number \| string` | `24` | Icon size |
| `color` | `string` | — | Icon color |
| `strokeWidth` | `number` | `2` | Stroke width |
| `className` | `string` | — | CSS class |
| `style` | `CSSProperties` | — | Inline style |

All standard Lucide icon props are supported.

## Available Icon Names

`DynamicIconName` is a union type of all supported Lucide icon names (kebab-case). The full list is available via the `dynamicIconNames` Set export:

```tsx
import { dynamicIconNames } from '@vef-framework-react/components';

console.log([...dynamicIconNames]); // ['activity', 'airplay', ...]
```

## Best Practices

- Use `DynamicIcon` only when the icon name is dynamic (from data/config). For static icons, import directly from `lucide-react` for better tree-shaking.
- Validate icon names against `dynamicIconNames` when storing them in a database to prevent runtime errors.
