---
title: "GenericSelect"
description: "Abstract base for popup-driven selection controls — the antd Select trigger with an arbitrary popup body."
---

# GenericSelect

The abstract base for popup-driven selection controls: an Ant Design `Select`-styled trigger whose dropdown body is swapped for an arbitrary surface. It owns the styled trigger (selected-value display, size/status/variant/clear/disabled), the controlled open state, the in-trigger search box, and the popup container; a concrete component supplies only the popup body and how a value renders.

> **VEF-specific component.** Not part of Ant Design. It is the foundation [`IconPicker`](./icon-picker.md) is built on.

## When to Use

- Building a custom dropdown-style selection control — an icon grid, a data-table picker, a color-swatch picker — that needs `Select`'s trigger affordances (value display, size/status/variant, clear button, search box) but a non-list popup surface.
- Reach for [`Select`](./select.md) directly when a flat option list is enough; reach for `GenericSelect` when the popup body is a custom widget.

## Basic Usage

```tsx
import { GenericSelect } from '@vef-framework-react/components';
import type { GenericSelectPopupApi } from '@vef-framework-react/components';
import { useState } from 'react';

function ColorPopup({ value, select, close }: GenericSelectPopupApi<string>) {
  return (
    <div style={{ display: 'flex', gap: 8, padding: 8 }}>
      {['red', 'green', 'blue'].map((color) => (
        <button
          key={color}
          style={{ background: color, width: 24, height: 24 }}
          onClick={() => {
            select(color);
            close();
          }}
        />
      ))}
    </div>
  );
}

export default function Demo() {
  const [color, setColor] = useState<string | null>(null);

  return (
    <GenericSelect<string>
      placeholder="Pick a color"
      value={color}
      renderLabel={(value) => value}
      renderPopup={(api) => <ColorPopup {...api} />}
      onChange={setColor}
    />
  );
}
```

## The Popup API

`renderPopup` receives a `GenericSelectPopupApi` object so the popup body never touches the underlying antd `Select`:

| Member | Type | Description |
|--------|------|-------------|
| `value` | `TValue \| null` | The currently selected value, for highlighting the active option |
| `keyword` | `string` | The debounced search keyword typed into the trigger, `""` when not searching |
| `open` | `boolean` | Whether the popup is currently open — useful for deferring expensive work until first open |
| `select` | `(value: TValue) => void` | Commit a value; forwards to `onChange`. Does **not** close the popup |
| `close` | `() => void` | Close the popup without changing the value |

## Custom Label Rendering

```tsx
<GenericSelect<string>
  value={value}
  renderLabel={(value) => <strong>{value}</strong>}
  renderPopup={renderPopup}
  onChange={setValue}
/>
```

## Controlled Open State

```tsx
const [isOpen, setIsOpen] = useState(false);

<GenericSelect<string>
  open={isOpen}
  renderPopup={renderPopup}
  onOpenChange={setIsOpen}
/>
```

## API

### GenericSelectProps\<TValue\>

`TValue` is the selectable value type, forwarded to the underlying antd `Select` — it must be a `string` or `number`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `TValue \| null` | — | The selected value; `null`/`undefined` renders the placeholder |
| `onChange` | `(value: TValue \| null) => void` | — | Fired when a value is committed from the popup, or `null` when cleared |
| `onBlur` | `() => void` | — | Fired when the trigger loses focus |
| `open` | `boolean` | — | Controlled open state of the popup |
| `defaultOpen` | `boolean` | `false` | Initial open state for uncontrolled mode; ignored when `open` is provided |
| `onOpenChange` | `(open: boolean) => void` | — | Fired when the popup opens or closes |
| `renderPopup` | `(api: GenericSelectPopupApi<TValue>) => ReactNode` | required | Render the popup body |
| `renderLabel` | `(value: TValue) => ReactNode` | raw value | Render the selected value inside the trigger |
| `searchable` | `boolean` | `true` | Show the search box in the trigger and forward the keyword to the popup |
| `placeholder` | `ReactNode` | — | Placeholder shown when no value is selected |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Density preset |
| `status` | `'error' \| 'warning'` | — | Validation status |
| `variant` | `'outlined' \| 'filled' \| 'borderless' \| 'underlined'` | `'outlined'` | Visual variant of the trigger |
| `disabled` | `boolean` | `false` | Disable the control |
| `allowClear` | `boolean` | `false` | Show a clear button that resets the value to `null` |
| `loading` | `boolean` | `false` | Render the trigger in a loading state |
| `suffixIcon` | `ReactNode` | — | Custom suffix icon; overridden by a search icon while open and `searchable` |
| `prefix` | `ReactNode` | — | Content rendered before the value inside the trigger |
| `getPopupContainer` | `(triggerNode: HTMLElement) => HTMLElement` | `document.body` | Element the popup renders into |
| `popupMatchSelectWidth` | `boolean \| number` | `false` | Whether the popup width matches the trigger width |
| `popupClassName` | `string` | — | Additional class on the popup root |
| `className` | `string` | — | Additional class on the trigger |
| `style` | `CSSProperties` | — | Inline style on the trigger |

### GenericSelectRef

| Member | Type | Description |
|--------|------|-------------|
| `focus` | `() => void` | Move focus into the trigger |
| `blur` | `() => void` | Remove focus from the trigger |

### GenericSelectStatus / GenericSelectVariant

```ts
type GenericSelectStatus = "error" | "warning";
type GenericSelectVariant = "outlined" | "filled" | "borderless" | "underlined";
```
