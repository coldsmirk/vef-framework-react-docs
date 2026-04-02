---
sidebar_position: 18
---

# DynamicIcon 动态图标

通过名称字符串渲染 [Lucide](https://lucide.dev/) 图标，适用于图标名称存储在配置或数据库中的场景。

> **VEF 特有组件**，不属于 Ant Design。

## 何时使用

- 菜单项或导航条目的图标名称存储在数据库或配置文件中。
- 根据用户自定义设置动态渲染图标。

## 基础用法

```tsx
import { DynamicIcon } from '@vef-framework-react/components';

export default function Demo() {
  return <DynamicIcon name="user" size={20} />;
}
```

## 从数据动态渲染

```tsx
import { DynamicIcon } from '@vef-framework-react/components';
import type { DynamicIconName } from '@vef-framework-react/components';

interface MenuItem {
  label: string;
  icon: DynamicIconName;
  path: string;
}

const menuItems: MenuItem[] = [
  { label: '仪表盘', icon: 'layout-dashboard', path: '/' },
  { label: '用户管理', icon: 'users', path: '/users' },
  { label: '系统设置', icon: 'settings', path: '/settings' },
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

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `name` | `DynamicIconName` | 必填 | Lucide 图标名称（kebab-case） |
| `size` | `number \| string` | `24` | 图标尺寸 |
| `color` | `string` | — | 图标颜色 |
| `strokeWidth` | `number` | `2` | 描边宽度 |
| `className` | `string` | — | CSS 类名 |
| `style` | `CSSProperties` | — | 内联样式 |

支持所有标准 Lucide 图标属性。

## 可用图标名称

`DynamicIconName` 是所有支持的 Lucide 图标名称（kebab-case）的联合类型。可通过 `dynamicIconNames` Set 导出获取完整列表：

```tsx
import { dynamicIconNames } from '@vef-framework-react/components';

console.log([...dynamicIconNames]); // ['activity', 'airplay', ...]
```

## 最佳实践

- 仅在图标名称是动态的（来自数据/配置）时使用 `DynamicIcon`。静态图标直接从 `lucide-react` 导入，以获得更好的 Tree-shaking 效果。
- 将图标名称存入数据库时，对照 `dynamicIconNames` 进行校验，防止运行时错误。
