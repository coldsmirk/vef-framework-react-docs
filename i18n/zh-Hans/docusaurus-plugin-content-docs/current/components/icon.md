---
title: "Icon"
description: "用于渲染 Lucide 图标组件的包装组件，可保持统一的尺寸和样式。"
---

# Icon

用于渲染 Lucide 图标组件的包装组件，可保持统一的尺寸和样式。

> **VEF 专属组件。** 不属于 Ant Design 的一部分。

## 何时使用

- 渲染通过属性传入的 Lucide 图标组件。
- 在整个应用中为图标应用统一的尺寸和颜色。

## 基础用法

```tsx
import { Icon } from '@vef-framework-react/components';
import { Settings } from 'lucide-react';

export default function Demo() {
  return <Icon component={Settings} />;
}
```

## 动态图标组件

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

`Icon` 继承了 Lucide 的全部 `LucideProps` 属性（`size`、`color` 和 `children` 除外），并新增以下属性：

| Prop | Type | Default | 说明 |
|------|------|---------|-------------|
| `component` | `ComponentType<LucideProps>` | — | 要渲染的 Lucide 图标组件，与 `iconNode` 互斥，二者需二选一 |
| `iconNode` | `IconNode` | — | 要渲染的原始 Lucide 图标节点数据，与 `component` 互斥，二者需二选一 |
| `strokeWidth` | `number` | `2` | 描边宽度 |
| `className` | `string` | — | CSS 类名 |
| `style` | `CSSProperties` | — | 行内样式 |

图标的尺寸和颜色不可通过 props 配置——图标始终以 `1.2em` 渲染，并继承父级的 `color`。

## 最佳实践

- 当图标组件是通过属性传入时使用 `Icon`。对于静态图标，直接导入并使用 Lucide 组件即可。
- 对于以字符串形式存储的图标名称，请改用 [`DynamicIcon`](./dynamic-icon)。
