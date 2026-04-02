---
sidebar_position: 3
---

# Input

A basic widget for getting user input as a text field.

> **Source:** Re-exported from `antd`. Full documentation: [Ant Design Input](https://ant.design/components/input/)

## When to Use

- A user needs to input a single line of text.
- Use `TextArea` for multi-line input.
- Use `Password` for password fields.
- Use `Search` for search fields.

## Basic Usage

```tsx
import { Input } from '@vef-framework-react/components';

export default function Demo() {
  return <Input placeholder="Basic usage" />;
}
```

## Variants

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

## With Prefix / Suffix

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

## Password

```tsx
import { Input } from '@vef-framework-react/components';

export default function Demo() {
  return <Input.Password placeholder="Enter password" />;
}
```

## TextArea

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

## Search

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

## OTP Input

```tsx
import { Input } from '@vef-framework-react/components';

export default function Demo() {
  return <Input.OTP length={6} />;
}
```

## API

### Input

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | — | Input value (controlled) |
| `defaultValue` | `string` | — | Initial value (uncontrolled) |
| `placeholder` | `string` | — | Placeholder text |
| `disabled` | `boolean` | `false` | Disable the input |
| `size` | `'large' \| 'middle' \| 'small'` | `'middle'` | Input size |
| `variant` | `'outlined' \| 'filled' \| 'borderless'` | `'outlined'` | Visual variant |
| `prefix` | `ReactNode` | — | Content before input |
| `suffix` | `ReactNode` | — | Content after input |
| `addonBefore` | `ReactNode` | — | Label before input box |
| `addonAfter` | `ReactNode` | — | Label after input box |
| `allowClear` | `boolean \| { clearIcon: ReactNode }` | `false` | Show clear button |
| `maxLength` | `number` | — | Max character count |
| `showCount` | `boolean` | `false` | Show character count |
| `status` | `'error' \| 'warning'` | — | Validation status |
| `onChange` | `(e: ChangeEvent) => void` | — | Change handler |
| `onPressEnter` | `(e: KeyboardEvent) => void` | — | Enter key handler |

### Input.TextArea

Inherits all `Input` props, plus:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `rows` | `number` | — | Number of rows |
| `autoSize` | `boolean \| { minRows, maxRows }` | `false` | Auto-resize height |

### Input.Password

Inherits all `Input` props, plus:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `visibilityToggle` | `boolean \| { visible, onVisibleChange }` | `true` | Show/hide toggle |

## Best Practices

- Always pair `Input` with a `label` or use it inside a `Form.Item` for accessibility.
- Use `allowClear` for search-like inputs to improve UX.
- For form usage, prefer the `useForm` field components (`form.Field.Input`, `form.Field.TextArea`, etc.) which handle validation automatically.
