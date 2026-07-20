---
title: "Bool"
description: "一个支持多种视觉样式的布尔值展示与输入组件。"
---

# Bool

一个支持多种视觉样式的布尔值展示与输入组件。

> **VEF 专属组件。** 不属于 Ant Design 的一部分。

## 何时使用

- 在表单或表格中展示或编辑布尔值（`true`/`false`）。
- 在不改变数据模型的前提下，需要在单选框、单选按钮、开关或复选框等展现形式之间切换时。

## 基础用法

```tsx
import { Bool } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <Bool
      value={true}
      onChange={(val) => console.log(val)}
    />
  );
}
```

默认变体为 `"switch"`。

## 变体

```tsx
import { Bool, Space } from '@vef-framework-react/components';
import { useState } from 'react';

export default function Demo() {
  const [val, setVal] = useState(true);

  return (
    <Space direction="vertical">
      <Bool variant="switch" value={val} onChange={setVal} />
      <Bool variant="radio" value={val} onChange={setVal} />
      <Bool variant="radio-button" value={val} onChange={setVal} />
      <Bool variant="checkbox" value={val} onChange={setVal}>
        Enable feature
      </Bool>
    </Space>
  );
}
```

## 自定义标签

```tsx
<Bool
  variant="radio"
  value={true}
  trueLabel="Yes"
  falseLabel="No"
  onChange={(val) => console.log(val)}
/>
```

## 只读展示

```tsx
// Disabled + no onChange = display-only
<Bool value={record.isActive} disabled />
```

## API

| Prop | Type | Default | 说明 |
|------|------|---------|-------------|
| `value` | `boolean` | — | 受控值 |
| `defaultValue` | `boolean` | — | 初始值（非受控） |
| `variant` | `'switch' \| 'radio' \| 'radio-button' \| 'checkbox'` | `'switch'` | 视觉变体 |
| `trueLabel` | `ReactNode` | `'是'` | `true` 状态对应的标签 |
| `falseLabel` | `ReactNode` | `'否'` | `false` 状态对应的标签 |
| `disabled` | `boolean` | `false` | 禁用交互 |
| `size` | `'large' \| 'medium' \| 'small'` | — | 组件尺寸 |
| `className` | `string` | — | CSS 类名 |
| `style` | `CSSProperties` | — | 内联样式 |
| `onChange` | `(value: boolean) => void` | — | 变化回调函数 |
| `children` | `ReactNode` | — | 标签文本（用于 `switch` / `checkbox` 变体） |

## 变体行为

| Variant | True State | False State |
|---------|-----------|-------------|
| `switch` | 开关打开，内部显示 `trueLabel` | 开关关闭，内部显示 `falseLabel` |
| `radio` | 选中第一个单选项 | 选中第二个单选项 |
| `radio-button` | 第一个按钮处于激活状态 | 第二个按钮处于激活状态 |
| `checkbox` | 已勾选 | 未勾选 |

## 最佳实践

- 用于设置开关时，使用 `variant="switch"`。
- 需要同时展示两个选项的表单场景，使用 `variant="radio"` 或 `variant="radio-button"`。
- 需要内联的确认勾选或功能开关时，配合 `children` 使用 `variant="checkbox"`。
- 在表单中，请使用 [`Form`](./form) 字段组件，它会自动处理值绑定：

```tsx
<form.AppField name="isActive">
  {(field) => <field.Bool label="Active" />}
</form.AppField>
```
