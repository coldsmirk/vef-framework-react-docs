---
sidebar_position: 17
---

# IconButton 图标按钮

带可选 Tooltip 的纯图标按钮。

> **VEF 特有组件**，不属于 Ant Design。

## 何时使用

- 表格、工具栏或卡片中空间有限的紧凑操作按钮。
- 图标含义明确但需要 Tooltip 提升无障碍体验时。

## 基础用法

```tsx
import { IconButton } from '@vef-framework-react/components';
import { Pencil } from 'lucide-react';

export default function Demo() {
  return (
    <IconButton
      icon={<Pencil />}
      tip="编辑"
      onClick={() => console.log('edit')}
    />
  );
}
```

## 自定义 Tooltip 位置

```tsx
import { IconButton } from '@vef-framework-react/components';
import { Trash2 } from 'lucide-react';

export default function Demo() {
  return (
    <IconButton
      icon={<Trash2 />}
      tip="删除"
      placement="bottom"
      onClick={() => console.log('delete')}
    />
  );
}
```

## 延迟显示 Tooltip

```tsx
<IconButton
  icon={<Settings />}
  tip="设置"
  tipDelay={500}
/>
```

## 在表格列中使用

```tsx
{
  title: '操作',
  width: 80,
  render: (_, record) => (
    <Space>
      <IconButton
        icon={<Pencil size={14} />}
        tip="编辑"
        onClick={() => openEdit(record)}
      />
      <IconButton
        icon={<Trash2 size={14} />}
        tip="删除"
        onClick={() => confirmDelete(record)}
      />
    </Space>
  ),
}
```

## API

`IconButton` 继承 `Button` 属性（除 `icon`、`iconPosition`、`type`、`htmlType`、`autoInsertSpace`、`color`、`variant`、`ghost`、`danger`、`block`），另有：

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `icon` | `ReactElement<LucideProps>` | 必填 | Lucide 图标元素 |
| `tip` | `ReactNode` | — | Tooltip 内容 |
| `tipDelay` | `number` | — | Tooltip 显示延迟（毫秒） |
| `placement` | `TooltipPlacement` | — | Tooltip 位置 |
| `size` | `'large' \| 'middle' \| 'small'` | — | 按钮尺寸 |
| `disabled` | `boolean` | `false` | 禁用状态 |
| `loading` | `boolean` | `false` | 加载状态 |
| `onClick` | `(e) => void` | — | 点击回调 |

## 最佳实践

- 始终提供 `tip`，满足无障碍要求——屏幕阅读器和键盘用户依赖它。
- 使用 `lucide-react` 中的 Lucide 图标（已是 `@vef-framework-react/components` 的依赖）。
- 需要权限检查的图标按钮，用 `PermissionGate` 包裹或使用 `OperationButton`。
