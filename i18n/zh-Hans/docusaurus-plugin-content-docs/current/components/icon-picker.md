---
title: "IconPicker"
description: "用于选择 lucide 图标的可搜索弹出网格，构建于 GenericSelect 之上。"
---

# IconPicker

用于选择 [lucide-react](https://lucide.dev/) 图标的可搜索弹出网格，构建于 [`GenericSelect`](./generic-select.md) 之上。

> **VEF 专属组件。** 并非 Ant Design 的一部分。

## 何时使用

- 需要让用户从完整的 lucide-react 图标集中选择一个图标（例如菜单项、分类或仪表盘卡片的图标），并支持搜索。
- 存储的值是一个纯粹的短横线命名字符串（例如 `"layout-dashboard"`），可以在 JSON 往返中保持不变，之后再通过 [`DynamicIcon`](./dynamic-icon.md) 在其他位置渲染——不会持久化任何图标组件的引用。
- 未知或过期的图标名称（例如数据在 lucide 版本升级后迁移而来）会回退为占位图形，而不会破坏界面。

## 基础用法

```tsx
import { IconPicker } from '@vef-framework-react/components';
import { useState } from 'react';

export default function Demo() {
  const [icon, setIcon] = useState<string | null>(null);

  return (
    <IconPicker
      placeholder="Select an icon"
      value={icon}
      onChange={setIcon}
    />
  );
}
```

## 渲染已选图标

```tsx
import { DynamicIcon, IconPicker } from '@vef-framework-react/components';
import { useState } from 'react';

export default function Demo() {
  const [icon, setIcon] = useState<string | null>('house');

  return (
    <>
      <IconPicker value={icon} onChange={setIcon} />
      {icon && <DynamicIcon name={icon} />}
    </>
  );
}
```

## 尺寸、状态与变体

```tsx
<IconPicker size="small" />
<IconPicker status="error" />
<IconPicker variant="filled" />
```

## 表单集成

在 `<form.AppField>` 中使用 `field.IconPicker` 字段组件，`value` / `onChange` / `onBlur` 由表单接管：

```tsx
<form.AppField name="icon">
  {(field) => <field.IconPicker label="Icon" />}
</form.AppField>
```

## API

### IconPickerProps

| Prop | 类型 | 默认值 | 说明 |
|------|------|---------|-------------|
| `value` | `IconPickerValue \| null` | — | 已选中的图标名称；未设置时为 `null`/`undefined` |
| `defaultValue` | `IconPickerValue` | — | 非受控模式下的初始值；提供 `value` 时忽略 |
| `onChange` | `(value: IconPickerValue \| null) => void` | — | 选中图标时触发，清除时为 `null` |
| `onBlur` | `() => void` | — | 控件失焦时触发 |
| `placeholder` | `ReactNode` | — | 未选中图标时显示的占位内容 |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | 密度预设 |
| `status` | `'error' \| 'warning'` | — | 校验状态 |
| `variant` | `'outlined' \| 'filled' \| 'borderless' \| 'underlined'` | `'outlined'` | 触发器的视觉变体 |
| `disabled` | `boolean` | `false` | 禁用控件 |
| `allowClear` | `boolean` | `true` | 显示清除按钮 |
| `getPopupContainer` | `(triggerNode: HTMLElement) => HTMLElement` | `document.body` | 弹出层渲染到的容器元素 |
| `className` | `string` | — | 触发器上的附加类名 |
| `style` | `CSSProperties` | — | 触发器上的内联样式 |

### IconPickerValue

```ts
type IconPickerValue = DynamicIconName | (string & {});
```

接受任意已知的 lucide 图标名称（编辑器可自动补全），同时也接受任意 `string`，因为持久化/后端数据中的图标名称是无类型的，可能不在当前 lucide 图标集中。

### IconPickerRef

与 `GenericSelectRef` 相同：

| 成员 | 类型 | 说明 |
|--------|------|-------------|
| `focus` | `() => void` | 将焦点移入触发器 |
| `blur` | `() => void` | 移除触发器焦点 |
