---
sidebar_position: 10
---

# Bool

A boolean value display and input component with multiple visual variants.

> **VEF-specific component.** Not part of Ant Design.

## When to Use

- Display or edit a boolean (`true`/`false`) value in a form or table.
- When you want to switch between radio, radio-button, switch, or checkbox presentation without changing the data model.

## Basic Usage

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

Default variant is `"switch"`.

## Variants

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

## Custom Labels

```tsx
<Bool
  variant="radio"
  value={true}
  trueLabel="Yes"
  falseLabel="No"
  onChange={(val) => console.log(val)}
/>
```

## Read-only Display

```tsx
// Disabled + no onChange = display-only
<Bool value={record.isActive} disabled />
```

## API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `boolean` | — | Controlled value |
| `defaultValue` | `boolean` | — | Initial value (uncontrolled) |
| `variant` | `'switch' \| 'radio' \| 'radio-button' \| 'checkbox'` | `'switch'` | Visual variant |
| `trueLabel` | `ReactNode` | `'是'` | Label for `true` state |
| `falseLabel` | `ReactNode` | `'否'` | Label for `false` state |
| `disabled` | `boolean` | `false` | Disable interaction |
| `size` | `'large' \| 'middle' \| 'small'` | — | Component size |
| `className` | `string` | — | CSS class |
| `style` | `CSSProperties` | — | Inline style |
| `onChange` | `(value: boolean) => void` | — | Change handler |
| `children` | `ReactNode` | — | Label text (for `checkbox` variant) |

## Variant Behavior

| Variant | True State | False State |
|---------|-----------|-------------|
| `switch` | Switch on, shows `trueLabel` inside | Switch off, shows `falseLabel` inside |
| `radio` | First radio selected | Second radio selected |
| `radio-button` | First button active | Second button active |
| `checkbox` | Checked | Unchecked |

## Best Practices

- Use `variant="switch"` for settings toggles.
- Use `variant="radio"` or `variant="radio-button"` in forms where both options should be visible.
- Use `variant="checkbox"` with `children` for inline consent or feature flags.
- In forms, use `form.Field.Bool` which handles value binding automatically.
