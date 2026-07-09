---
title: "IconPicker"
description: "A searchable popup grid for choosing a lucide icon, built on GenericSelect."
---

# IconPicker

A searchable popup grid for choosing a [lucide-react](https://lucide.dev/) icon, built on [`GenericSelect`](./generic-select.md).

> **VEF-specific component.** Not part of Ant Design.

## When to Use

- Letting a user pick an icon (e.g. for a menu item, category, or dashboard tile) from the full lucide-react icon set, with search.
- The stored value is a plain kebab-case string (e.g. `"layout-dashboard"`) that survives a JSON round-trip and is later rendered elsewhere through [`DynamicIcon`](./dynamic-icon.md) — no icon component references are persisted.
- An unknown or stale icon name (e.g. from data migrated across a lucide version bump) falls back to a placeholder glyph instead of breaking the UI.

## Basic Usage

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

## Rendering the Picked Icon

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

## Sizes, Status, Variant

```tsx
<IconPicker size="small" />
<IconPicker status="error" />
<IconPicker variant="filled" />
```

## Form Integration

Use the `field.IconPicker` field component inside `<form.AppField>`, which owns `value` / `onChange` / `onBlur`:

```tsx
<form.AppField name="icon">
  {(field) => <field.IconPicker label="Icon" />}
</form.AppField>
```

## API

### IconPickerProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `IconPickerValue \| null` | — | The selected icon name; `null`/`undefined` when unset |
| `defaultValue` | `IconPickerValue` | — | Initial value for uncontrolled mode; ignored when `value` is provided |
| `onChange` | `(value: IconPickerValue \| null) => void` | — | Fired when an icon is picked, or `null` when cleared |
| `onBlur` | `() => void` | — | Fired when the control loses focus |
| `placeholder` | `ReactNode` | — | Placeholder shown when no icon is selected |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Density preset |
| `status` | `'error' \| 'warning'` | — | Validation status |
| `variant` | `'outlined' \| 'filled' \| 'borderless' \| 'underlined'` | `'outlined'` | Visual variant of the trigger |
| `disabled` | `boolean` | `false` | Disable the control |
| `allowClear` | `boolean` | `true` | Show a clear button |
| `getPopupContainer` | `(triggerNode: HTMLElement) => HTMLElement` | `document.body` | Element the popup renders into |
| `className` | `string` | — | Additional class on the trigger |
| `style` | `CSSProperties` | — | Inline style on the trigger |

### IconPickerValue

```ts
type IconPickerValue = DynamicIconName | (string & {});
```

Accepts any known lucide icon name (with editor autocomplete) as well as a bare `string`, since persisted/backend data is an untyped icon name that may not be in the current lucide set.

### IconPickerRef

Identical to `GenericSelectRef`:

| Member | Type | Description |
|--------|------|-------------|
| `focus` | `() => void` | Move focus into the trigger |
| `blur` | `() => void` | Remove focus from the trigger |
