---
title: "DynamicIcon"
description: "根据图标名称字符串渲染 [Lucide](https://lucide.dev/) 图标，适用于存储在配置或数据库中的图标名称。"
---

# DynamicIcon

根据图标名称字符串渲染 [Lucide](https://lucide.dev/) 图标，适用于存储在配置或数据库中的图标名称。

> **VEF 专属组件。** 不属于 Ant Design 的一部分。

## 何时使用

- 图标名称存储在数据库或配置文件中的菜单项或导航条目。
- 根据用户自定义设置动态渲染图标。

## 基础用法

```tsx
import { DynamicIcon } from '@vef-framework-react/components';

export default function Demo() {
  return <DynamicIcon name="user" />;
}
```

## 根据数据动态渲染

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
          <DynamicIcon name={item.icon} />
          <span>{item.label}</span>
        </li>
      ))}
    </ul>
  );
}
```

## API

| Prop | Type | Default | 说明 |
|------|------|---------|-------------|
| `name` | `DynamicIconName` | required | Lucide 图标名称（kebab-case 格式） |
| `strokeWidth` | `number` | `2` | 描边宽度 |
| `className` | `string` | — | CSS 类名 |
| `style` | `CSSProperties` | — | 行内样式 |

图标的尺寸和颜色不可通过 props 配置——图标始终以 `1.2em` 渲染，并继承父级的 `color`。其余标准 Lucide 属性均受支持。

## 可用图标名称

`DynamicIconName` 是所有受支持的 Lucide 图标名称（kebab-case 格式）组成的联合类型。完整列表可通过导出的 `dynamicIconNames` Set 获取：

```tsx
import { dynamicIconNames } from '@vef-framework-react/components';

console.log([...dynamicIconNames]); // ['activity', 'airplay', ...]
```

## 最佳实践

- 仅当图标名称是动态的（来自数据/配置）时才使用 `DynamicIcon`。对于静态图标，直接从 `lucide-react` 导入以获得更好的 tree-shaking 效果。
- 将图标名称存入数据库前，应对照 `dynamicIconNames` 进行校验，以避免运行时错误。
