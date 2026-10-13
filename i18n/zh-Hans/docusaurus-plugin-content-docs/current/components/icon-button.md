---
title: "IconButton"
description: "仅包含图标的按钮，支持可选的提示信息。"
---

# IconButton

仅包含图标的按钮，支持可选的提示信息。

> **VEF 专属组件。** 不属于 Ant Design 的一部分。

## 何时使用

- 表格、工具栏或卡片等空间有限场景下的紧凑型操作按钮。
- 图标含义已足够清晰，但提示信息能进一步提升可访问性时。

## 基础用法

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

## 自定义提示框位置

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

## 延迟显示提示框

```tsx
<IconButton
  icon={<Settings />}
  tip="Settings"
  tipDelay={500}
/>
```

## 在表格列中使用

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

props 类型以 `IconButtonProps` 导出。

`IconButton` 继承了 `Button` 的属性（`icon`、`iconPosition`、`type`、`htmlType`、`autoInsertSpace`、`color`、`variant`、`ghost`、`danger` 和 `block` 除外），并新增以下属性：

| Prop | Type | Default | 说明 |
|------|------|---------|-------------|
| `icon` | `ReactElement<LucideProps>` | required | Lucide 图标元素 |
| `tip` | `ReactNode` | — | 提示框内容 |
| `tipDelay` | `number` | — | 提示框显示延迟（毫秒） |
| `placement` | `TooltipPlacement` | — | 提示框弹出位置 |
| `size` | `'large' \| 'medium' \| 'small'` | `'medium'` | 按钮尺寸（`'middle'` 是 `'medium'` 的废弃别名） |
| `disabled` | `boolean` | `false` | 禁用按钮 |
| `loading` | `boolean` | `false` | 显示加载状态 |
| `onClick` | `(e) => void` | — | 点击事件处理函数 |

## 最佳实践

- 务必提供 `tip` 以保证可访问性——屏幕阅读器和键盘用户都依赖它。
- 使用来自 `lucide-react` 的 Lucide 图标（`@vef-framework-react/components` 已依赖该库）。
- 对于需要权限校验的图标按钮，使用 `PermissionGate` 包裹，或直接使用 `OperationButton`。
