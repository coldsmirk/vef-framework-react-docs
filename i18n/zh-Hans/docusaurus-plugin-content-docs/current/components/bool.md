---
sidebar_position: 10
---

# Bool 布尔值

多种视觉形态的布尔值展示和输入组件。

> **VEF 特有组件**，不属于 Ant Design。

## 何时使用

- 在表单或表格中展示或编辑布尔值（`true`/`false`）。
- 希望在不改变数据模型的情况下切换单选、单选按钮、开关或复选框的展示形式。

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

默认形态为 `"switch"`（开关）。

## 四种形态

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
        启用功能
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
  trueLabel="是"
  falseLabel="否"
  onChange={(val) => console.log(val)}
/>
```

## 只读展示

```tsx
// 禁用 + 无 onChange = 只读展示
<Bool value={record.isActive} disabled />
```

## API

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `value` | `boolean` | — | 受控值 |
| `defaultValue` | `boolean` | — | 初始值（非受控） |
| `variant` | `'switch' \| 'radio' \| 'radio-button' \| 'checkbox'` | `'switch'` | 视觉形态 |
| `trueLabel` | `ReactNode` | `'是'` | `true` 状态的标签 |
| `falseLabel` | `ReactNode` | `'否'` | `false` 状态的标签 |
| `disabled` | `boolean` | `false` | 禁用交互 |
| `size` | `'large' \| 'middle' \| 'small'` | — | 组件尺寸 |
| `className` | `string` | — | CSS 类名 |
| `style` | `CSSProperties` | — | 内联样式 |
| `onChange` | `(value: boolean) => void` | — | 值变化回调 |
| `children` | `ReactNode` | — | 标签文字（用于 `checkbox` 形态） |

## 各形态行为说明

| 形态 | true 状态 | false 状态 |
|------|----------|-----------|
| `switch` | 开关打开，内部显示 `trueLabel` | 开关关闭，内部显示 `falseLabel` |
| `radio` | 第一个单选项选中 | 第二个单选项选中 |
| `radio-button` | 第一个按钮激活 | 第二个按钮激活 |
| `checkbox` | 勾选 | 未勾选 |

## 最佳实践

- 设置类开关使用 `variant="switch"`。
- 表单中两个选项都需要可见时使用 `variant="radio"` 或 `variant="radio-button"`。
- 行内同意或功能开关使用 `variant="checkbox"` 配合 `children`。
- 在表单中使用 `form.Field.Bool`，自动处理值绑定。
