---
sidebar_position: 3
---

# Input 输入框

通过鼠标或键盘输入内容的基础表单域。

> **来源：** 直接从 `antd` 重新导出。完整文档：[Ant Design Input](https://ant.design/components/input-cn/)

## 何时使用

- 需要用户输入单行文本时。
- 多行文本使用 `TextArea`。
- 密码输入使用 `Password`。
- 搜索场景使用 `Search`。

## 基础用法

```tsx
import { Input } from '@vef-framework-react/components';

export default function Demo() {
  return <Input placeholder="基础用法" />;
}
```

## 三种形态

```tsx
import { Input, Space } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Input placeholder="线框型（默认）" />
      <Input variant="filled" placeholder="填充型" />
      <Input variant="borderless" placeholder="无边框" />
    </Space>
  );
}
```

## 前缀/后缀

```tsx
import { Input } from '@vef-framework-react/components';
import { Search } from 'lucide-react';

export default function Demo() {
  return (
    <Input
      prefix={<Search size={14} />}
      suffix={<span style={{ color: '#aaa' }}>元</span>}
      placeholder="输入金额"
    />
  );
}
```

## 密码框

```tsx
import { Input } from '@vef-framework-react/components';

export default function Demo() {
  return <Input.Password placeholder="请输入密码" />;
}
```

## 文本域

```tsx
import { Input } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <Input.TextArea
      rows={4}
      placeholder="请输入描述"
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
      placeholder="搜索..."
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

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `value` | `string` | — | 输入框内容（受控） |
| `defaultValue` | `string` | — | 初始内容（非受控） |
| `placeholder` | `string` | — | 占位文本 |
| `disabled` | `boolean` | `false` | 禁用状态 |
| `size` | `'large' \| 'middle' \| 'small'` | `'middle'` | 控件大小 |
| `variant` | `'outlined' \| 'filled' \| 'borderless'` | `'outlined'` | 形态变体 |
| `prefix` | `ReactNode` | — | 带有前缀图标的输入框 |
| `suffix` | `ReactNode` | — | 带有后缀图标的输入框 |
| `addonBefore` | `ReactNode` | — | 带标签的输入框，设置前置标签 |
| `addonAfter` | `ReactNode` | — | 带标签的输入框，设置后置标签 |
| `allowClear` | `boolean \| { clearIcon: ReactNode }` | `false` | 可以点击清除图标删除内容 |
| `maxLength` | `number` | — | 最大长度 |
| `showCount` | `boolean` | `false` | 是否展示字数 |
| `status` | `'error' \| 'warning'` | — | 设置校验状态 |
| `onChange` | `(e: ChangeEvent) => void` | — | 输入框内容变化时的回调 |
| `onPressEnter` | `(e: KeyboardEvent) => void` | — | 按下回车的回调 |

### Input.TextArea

继承 `Input` 所有属性，另有：

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `rows` | `number` | — | 行数 |
| `autoSize` | `boolean \| { minRows, maxRows }` | `false` | 自适应内容高度 |

### Input.Password

继承 `Input` 所有属性，另有：

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `visibilityToggle` | `boolean \| { visible, onVisibleChange }` | `true` | 是否显示切换按钮 |

## 最佳实践

- 始终为 `Input` 配置 `label` 或在 `Form.Item` 中使用，以满足无障碍要求。
- 搜索类输入框使用 `allowClear` 提升用户体验。
- 在表单中优先使用 `useForm` 的字段组件（`form.Field.Input`、`form.Field.TextArea` 等），可自动处理校验。
