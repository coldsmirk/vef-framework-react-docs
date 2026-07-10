---
title: "Input"
description: "用于获取用户单行文本输入的基础控件。"
---

# Input

用于获取用户单行文本输入的基础控件。

> **来源：** 直接从 `antd` 重新导出。完整文档：[Ant Design Input](https://ant.design/components/input/)

## 何时使用

- 需要用户输入单行文本时。
- 多行输入请使用 `TextArea`。
- 密码输入请使用 `Password`。
- 搜索场景请使用 `Search`。

## 基础用法

```tsx
import { Input } from '@vef-framework-react/components';

export default function Demo() {
  return <Input placeholder="Basic usage" />;
}
```

## 变体

```tsx
import { Input, Space } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Input placeholder="Outlined (default)" />
      <Input variant="filled" placeholder="Filled" />
      <Input variant="borderless" placeholder="Borderless" />
    </Space>
  );
}
```

## 前缀 / 后缀

```tsx
import { Input } from '@vef-framework-react/components';
import { Search } from 'lucide-react';

export default function Demo() {
  return (
    <Input
      prefix={<Search size={14} />}
      suffix={<span style={{ color: '#aaa' }}>USD</span>}
      placeholder="Enter amount"
    />
  );
}
```

## 密码框

```tsx
import { Input } from '@vef-framework-react/components';

export default function Demo() {
  return <Input.Password placeholder="Enter password" />;
}
```

## 文本域

```tsx
import { Input } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <Input.TextArea
      rows={4}
      placeholder="Enter description"
      maxLength={200}
      showCount
    />
  );
}
```

## 搜索框

```tsx
import { Input } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <Input.Search
      placeholder="Search..."
      onSearch={(value) => console.log(value)}
      style={{ width: 300 }}
    />
  );
}
```

## OTP 输入框

```tsx
import { Input } from '@vef-framework-react/components';

export default function Demo() {
  return <Input.OTP length={6} />;
}
```

## API

### Input

| Prop | Type | Default | 说明 |
|------|------|---------|-------------|
| `value` | `string` | — | 输入框的值（受控） |
| `defaultValue` | `string` | — | 初始值（非受控） |
| `placeholder` | `string` | — | 占位文本 |
| `disabled` | `boolean` | `false` | 禁用输入框 |
| `size` | `'large' \| 'medium' \| 'small'` | `'medium'` | 输入框尺寸（`'middle'` 是 `'medium'` 的废弃别名） |
| `variant` | `'outlined' \| 'filled' \| 'borderless'` | `'outlined'` | 视觉样式变体 |
| `prefix` | `ReactNode` | — | 输入框前置内容 |
| `suffix` | `ReactNode` | — | 输入框后置内容 |
| `addonBefore` | `ReactNode` | — | 输入框前置标签 |
| `addonAfter` | `ReactNode` | — | 输入框后置标签 |
| `allowClear` | `boolean \| { clearIcon: ReactNode }` | `false` | 显示清除按钮 |
| `maxLength` | `number` | — | 最大字符数 |
| `showCount` | `boolean` | `false` | 显示字数统计 |
| `status` | `'error' \| 'warning'` | — | 校验状态 |
| `onChange` | `(e: ChangeEvent) => void` | — | 内容变化回调 |
| `onPressEnter` | `(e: KeyboardEvent) => void` | — | 回车键回调 |

### Input.TextArea

继承所有 `Input` 属性，另有：

| Prop | Type | Default | 说明 |
|------|------|---------|-------------|
| `rows` | `number` | — | 行数 |
| `autoSize` | `boolean \| { minRows, maxRows }` | `false` | 高度自适应 |

### Input.Password

继承所有 `Input` 属性，另有：

| Prop | Type | Default | 说明 |
|------|------|---------|-------------|
| `visibilityToggle` | `boolean \| { visible, onVisibleChange }` | `true` | 显示/隐藏切换开关 |

## 最佳实践

- 始终为 `Input` 搭配可见的 label（或提供 `aria-label`），以满足无障碍访问要求。
- 搜索类输入框使用 `allowClear` 以提升用户体验。
- 表单场景下优先使用 [`Form`](./form) 的字段组件，它会自动处理取值绑定和校验：

```tsx
<form.AppField name="username">
  {(field) => <field.Input label="Username" />}
</form.AppField>
```
