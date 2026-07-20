---
title: "Labels"
description: "Display, edit, and filter key-value labels — the shared suite behind approval flow labels and integration contract labels."
---

# Labels

Display, edit, and filter key-value labels. Labels are plain `Record<string, string>` maps attached to business entities (approval flows, integration contracts) and matched server-side by an AND-combined equality filter; this suite provides the display tags, the row editor, and the filter input for them, plus the parsing/validation helpers they share.

> **VEF-specific components.** Moved from `@vef-framework-react/approval` to `@vef-framework-react/components` in v2.12.0 — see the [migration note](#migrating-from-vef-framework-reactapproval) below.

## When to Use

- Show an entity's labels in a table column or detail view (`LabelsDisplay`).
- Let users edit a label map in a form (`LabelsEditor`).
- Filter a list by labels with `key=value` tag input (`LabelFilterSelect`).

## Displaying Labels

`LabelsDisplay` renders the map as compact tags — `key: value`, or the bare `key` when the value is an empty presence flag. An empty or absent map renders a secondary `-` placeholder:

```tsx
import { LabelsDisplay } from '@vef-framework-react/components';

// Renders the tags "app: crm" and "mobile".
<LabelsDisplay labels={{ app: 'crm', mobile: '' }} />
```

A typical table column:

```tsx
const columns = [
  // ...
  {
    title: 'Labels',
    dataIndex: 'labels',
    render: (labels: Record<string, string>) => <LabelsDisplay labels={labels} />
  }
];
```

## Editing Labels

`LabelsEditor` is a controlled key/value row editor that emits a plain `Record<string, string>`. It validates inline instead of through a form validator — pair it with [`Labeled`](./labeled.md) for the label-on-top layout, as the integration contract form does:

```tsx
import { Labeled, LabelsEditor, useFormContext } from '@vef-framework-react/components';

function ContractLabelsField() {
  const { AppField } = useFormContext<{ labels?: Record<string, string> }>();

  return (
    <AppField name="labels">
      {(field) => (
        <Labeled hint="Values may be left empty" label="Labels">
          <LabelsEditor value={field.state.value} onChange={field.handleChange} />
        </Labeled>
      )}
    </AppField>
  );
}
```

Behavior notes:

- **In-progress rows survive.** Rows are local state: a row with an empty key is kept on screen but excluded from the emitted map, and when the form echoes the emitted value back as `value`, the editor recognizes its own object and does not clobber the in-progress row. External `value` changes (e.g. a form reset) do resync the rows.
- **Inline validation.** A key that breaks the charset or length rules gets an error border and a shared danger-text explanation below the rows; the value is emitted anyway, and the backend rejects it at save with the same rule (see [Validation Rules](#validation-rules)).
- **Duplicate keys collapse.** The emitted map is keyed by label key, so two rows with the same key resolve to the last row's value.
- **Fixed UI copy.** Placeholders, the add-row button, and the validation message are currently fixed Chinese strings; there are no i18n props.

## Filtering by Labels

`LabelFilterSelect` is a compact filter input for search bars: pairs are typed as `key=value` tags (a bare `key` means an empty-value presence match) and emitted as the equality-filter map that label-carrying list queries accept, AND-combined by the backend. It renders a tags-mode [`Select`](./select.md) with the dropdown suppressed:

```tsx
import { LabelFilterSelect, useFormContext } from '@vef-framework-react/components';

function FlowSearchFields() {
  const { AppField } = useFormContext<{ labels?: Record<string, string> }>();

  return (
    <AppField name="labels">
      {(field) => (
        <LabelFilterSelect value={field.state.value} onChange={field.handleChange} />
      )}
    </AppField>
  );
}
```

When every tag is cleared it emits `undefined` rather than an empty map, so the search value disappears cleanly.

## Validation Rules

The editor client-side-mirrors the backend label validation (`orm.ValidateLabels`, shared by approval flow labels and integration contract labels). The point of validating early: an out-of-charset key (e.g. a dotted `app.id`) would be *stored* but silently never match the equality filter.

- Key: must match `LABEL_KEY_PATTERN` — `/^[A-Z0-9](?:[\w-]*[A-Z0-9])?$/i` — i.e. letters, digits, `-` and `_`, starting and ending with a letter or digit; max 63 characters.
- Value: max 256 characters, counted in characters (matching the backend's rune count), not bytes — 256 CJK characters are valid. Empty values are allowed and act as presence flags.

Both are exported for custom UIs:

```tsx
import { isValidLabel, LABEL_KEY_PATTERN } from '@vef-framework-react/components';

isValidLabel('app', 'crm');   // true
isValidLabel('app.id', 'x');  // false — dotted key would never match the filter
```

## Helpers

`parseLabelFilters` and `formatLabelFilters` convert between tag entries and the filter map (used by `LabelFilterSelect`, exported for custom filter UIs):

```tsx
import { formatLabelFilters, parseLabelFilters } from '@vef-framework-react/components';

parseLabelFilters(['app=crm', 'mobile']);   // { app: 'crm', mobile: '' }
parseLabelFilters([]);                      // undefined
formatLabelFilters({ app: 'crm', mobile: '' }); // ['app=crm', 'mobile']
```

- `parseLabelFilters(entries: string[]): Record<string, string> | undefined` — splits each entry on the *first* `=` (values may contain `=`), trims whitespace around keys and values, treats a bare key as an empty-value presence match, drops entries without a key, and returns `undefined` when nothing remains.
- `formatLabelFilters(labels: Record<string, string> | undefined): string[]` — the inverse; an empty value serializes back to the bare key.

## Migrating from `@vef-framework-react/approval`

In v2.12.0 the suite moved out of the approval package into shared components (breaking for approval consumers). Update imports:

```ts
// Before (≤ v2.11.x)
import { LabelsDisplay, LabelsEditor, LabelFilterSelect } from '@vef-framework-react/approval';

// After (v2.12.0+)
import { LabelsDisplay, LabelsEditor, LabelFilterSelect } from '@vef-framework-react/components';
```

Two exports were renamed to drop the flow-specific wording:

| Old export (`@vef-framework-react/approval`) | New export (`@vef-framework-react/components`) |
|----------------------------------------------|------------------------------------------------|
| `FLOW_LABEL_KEY_PATTERN` | `LABEL_KEY_PATTERN` |
| `isValidFlowLabel` | `isValidLabel` |

`parseLabelFilters`, `formatLabelFilters`, and all component/prop-type names are unchanged.

:::note
Unrelated export with a similar name: `semanticSceneLabels` (also exported from `@vef-framework-react/components`) is not part of this suite — it maps the semantic feedback scenes (`success` / `info` / `warning` / `error`) to their default titles for [Notifications & Messages](./notifications.md).
:::

## API

### LabelsDisplayProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `labels` | `Record<string, string>` | — | The label map to render. Each entry becomes a `key: value` tag (bare `key` when the value is `""`); an empty or absent map renders a secondary `-` |

### LabelsEditorProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `Record<string, string>` | — | The label map under edit. Changing it externally resyncs the rows, except when it is the object the editor itself just emitted (in-progress empty-key rows are preserved) |
| `onChange` | `(labels: Record<string, string>) => void` | — | Fires with the full emitted map on every row edit, add, or removal; rows with an empty key are excluded |
| `disabled` | `boolean` | — | Disable all inputs and the add/remove buttons |

### LabelFilterSelectProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `Record<string, string> \| undefined` | — | The current filter map, rendered as `key=value` tags (bare `key` for empty values). Required |
| `onChange` | `(labels: Record<string, string> \| undefined) => void` | — | Fires with the parsed filter map, or `undefined` when no valid entries remain. Required |
| `placeholder` | `string` | `"标签过滤，如 app=crm"` | Placeholder shown when empty |
| `style` | `CSSProperties` | — | Inline style, merged over the default `minWidth: 200` |

### Functions and Constants

| Export | Type | Description |
|--------|------|-------------|
| `LABEL_KEY_PATTERN` | `RegExp` | `/^[A-Z0-9](?:[\w-]*[A-Z0-9])?$/i` — the key charset the backend accepts |
| `isValidLabel` | `(key: string, value: string) => boolean` | Client-side mirror of the backend validation: key charset + max 63 chars, value max 256 characters (character count, not bytes) |
| `parseLabelFilters` | `(entries: string[]) => Record<string, string> \| undefined` | Parse `key=value` tag entries into a filter map; bare key ⇒ presence match; `undefined` when empty |
| `formatLabelFilters` | `(labels: Record<string, string> \| undefined) => string[]` | Serialize a filter map back into `key=value` entries |
