---
sidebar_position: 21
---

# Icon 图标

用于渲染以 prop 形式传入的 Lucide 图标组件的包装器。

> **VEF 特有组件**，不属于 Ant Design。

## 基础用法

```tsx
import { Icon } from '@vef-framework-react/components';
import { Settings } from 'lucide-react';

export default function Demo() {
  return <Icon component={Settings} size={20} color="#666" />;
}
```

## 动态图标组件

```tsx
import { Icon } from '@vef-framework-react/components';
import { User, Settings, Bell } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface NavItem {
  label: string;
  IconComponent: LucideIcon;
}

const navItems: NavItem[] = [
  { label: '个人资料', IconComponent: User },
  { label: '系统设置', IconComponent: Settings },
  { label: '消息通知', IconComponent: Bell },
];

export default function Nav() {
  return (
    <ul>
      {navItems.map((item) => (
        <li key={item.label}>
          <Icon component={item.IconComponent} size={16} />
          <span>{item.label}</span>
        </li>
      ))}
    </ul>
  );
}
```

## API

`Icon` 继承所有 Lucide `LucideProps`（除 `size`、`color`、`children`），另有：

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `component` | `ComponentType<LucideProps>` | 必填 | 要渲染的 Lucide 图标组件 |
| `size` | `number \| string` | `24` | 图标尺寸 |
| `color` | `string` | — | 图标颜色 |
| `strokeWidth` | `number` | `2` | 描边宽度 |
| `className` | `string` | — | CSS 类名 |
| `style` | `CSSProperties` | — | 内联样式 |

## 最佳实践

- 图标组件以 prop 形式传入时使用 `Icon`；静态图标直接从 `lucide-react` 导入使用。
- 图标名称以字符串存储时，使用 [`DynamicIcon`](./dynamic-icon)。
