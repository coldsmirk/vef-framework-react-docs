---
title: "EditableTable"
description: "A controlled, inline-editable table where editing, adding, and deleting rows are operations on a value array."
---

# EditableTable

A controlled, inline-editable table. One row edits at a time; editing, adding, and deleting rows are just operations on the controlled `value` array surfaced through `onChange`. Built on the base [`Table`](./table.md) and the VEF form module — there is no query or mutation involved.

> **VEF-specific component.** Not part of Ant Design.

## When to Use

- Editing an array of rows inline — e.g. line items on a form, or any small structured list bound to a single value — without a query/mutation round-trip per row.
- You want per-column read (`renderView`) and edit (`renderEditor`) slots, with type-safe field validators via `createEditableColumn`.
- Reach for [`Crud`](./crud.md) / [`ProTable`](./pro-table.md) instead when rows come from a paginated remote query with their own per-row API calls.

## Basic Usage

```tsx
import { createEditableColumn, EditableTable } from '@vef-framework-react/components';
import type { EditableColumn } from '@vef-framework-react/components';
import { useState } from 'react';

interface Row {
  id: string;
  name: string;
  age: number;
}

const columns: Array<EditableColumn<Row>> = [
  createEditableColumn<Row>('name', {
    title: 'Name',
    validators: { onChange: ({ value }) => (value ? undefined : 'Name required') },
    renderEditor: (field) => <field.Input noWrapper />,
  }),
  createEditableColumn<Row>('age', {
    title: 'Age',
    renderView: (value) => `${value} yo`,
    renderEditor: (field) => <field.InputNumber noWrapper />,
  }),
];

export default function Demo() {
  const [rows, setRows] = useState<Row[]>([
    { id: '1', name: 'Edward', age: 32 },
    { id: '2', name: 'Helena', age: 28 },
  ]);

  return (
    <EditableTable<Row>
      columns={columns}
      rowKey="id"
      value={rows}
      onChange={setRows}
    />
  );
}
```

## Adding and Deleting Rows

```tsx
<EditableTable<Row>
  columns={columns}
  rowKey="id"
  value={rows}
  creatable
  canDelete
  createRecord={() => ({ name: '', age: 18 })}
  onChange={setRows}
/>
```

`canEdit` and `canDelete` also accept a per-row predicate: `canDelete={(row) => row.age >= 18}`.

## Extra Row Actions

```tsx
<EditableTable<Row>
  columns={columns}
  rowKey="id"
  value={rows}
  renderRowActions={(row) => <a onClick={() => console.log(row)}>View</a>}
  onChange={setRows}
/>
```

## Operation Column Overrides

The appended operation column defaults to a fixed `160`px width (fitting the built-in two-button action pair). Widen it when `renderRowActions` adds extra actions:

```tsx
<EditableTable<Row>
  columns={columns}
  rowKey="id"
  value={rows}
  operationColumn={{ title: 'Actions', width: 220 }}
  onChange={setRows}
/>
```

## API

### EditableTableProps\<TRow\>

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `TRow[]` | required | Controlled row data |
| `onChange` | `(value: TRow[]) => void` | — | Emitted with the next array on every edit / add / delete |
| `columns` | `Array<EditableColumn<TRow>>` | required | Column definitions with `renderView` / `renderEditor` slots |
| `rowKey` | `DeepKeys<TRow> \| ((row: TRow) => string)` | `"key"` | Row identity: a field name or a function; provides stable identity for the editing row |
| `canEdit` | `boolean \| ((row: TRow) => boolean)` | `true` | Whether a row can enter edit mode |
| `canDelete` | `boolean \| ((row: TRow) => boolean)` | `false` | Whether a row can be deleted |
| `creatable` | `boolean` | — | Show the add-row button below the table |
| `createRecord` | `() => Partial<TRow>` | — | Factory for a new row's default values when adding |
| `renderRowActions` | `(row: TRow, index: number) => ReactNode` | — | Extra read-mode actions rendered before the built-in Edit / Delete buttons |
| `operationColumn` | `EditableOperationColumnConfig` | — | Operation column overrides (title / width / button labels) |
| `size` | `TableProps<TRow>["size"]` | — | Table density, forwarded to the underlying table |
| `pagination` | `TableProps<TRow>["pagination"]` | `false` | Client-side pagination config, forwarded to the underlying table |
| `locale` | `TableProps<TRow>["locale"]` | — | Table locale overrides (e.g. a compact `emptyText`), forwarded to the underlying table |

### EditableColumn\<TRow\>

Built via `createEditableColumn<TRow>(dataIndex, options)` — a type-safe factory that splits `options` into display fields, the two render slots, and `<form.AppField>` options (validators, listeners, …) for the editor.

| Field | Type | Description |
|-------|------|-------------|
| `dataIndex` | `DeepKeys<TRow>` | Data key of the column; doubles as the form field name while editing |
| `key` | `string` | Stable column identity; defaults to `dataIndex` |
| `editable` | `boolean` | Whether this column participates in editing; defaults to `true` |
| `title` | `ReactNode` | Column header |
| `width` / `minWidth` | `Length` | Column width constraints |
| `align` | `'left' \| 'center' \| 'right'` | Cell alignment |
| `fixed` | `'left' \| 'right' \| boolean` | Fixed column |
| `ellipsis` | `boolean \| { showTitle }` | Truncate overflow text |
| `className` | `string` | Cell class name |
| `renderView` | `(value: unknown, row: TRow, index: number) => ReactNode` | Read-only display slot; falls back to the raw value when omitted |
| `renderEditor` | `(field: typeof fieldComponents, context: EditFieldContext<TRow>) => ReactNode` | Editor slot; the column stays read-only when omitted |
| *(validators, listeners, …)* | — | Any `<form.AppField>` option accepted by `createField`, forwarded to the row's draft form |

`renderEditor`'s `field` argument is the same field-component dictionary used by `createField` (`field.Input`, `field.Select`, …); `context` carries `{ row, index, rowKey }`.

The slot types are exported as `RenderView<TRow>` and `RenderEditor<TRow>`, and `createEditableColumn`'s `options` as `EditableColumnOptions<TRow>`.

### EditableOperationColumnConfig

| Field | Type | Description |
|-------|------|-------------|
| `title` | `ReactNode` | Operation column header; defaults to `"操作"` |
| `width` | `Length` | Operation column width. Defaults to a fixed `160` px, which comfortably fits the built-in action pair — without a fixed width the flexing table would hand the operation column any leftover space. Widen it when `renderRowActions` adds extra actions |
| `texts` | `EditableRowActionsTexts` | Custom labels for the built-in row action buttons |

### EditableRowActionsTexts

| Field | Type | Description |
|-------|------|-------------|
| `edit` | `ReactNode` | Label for the Edit button |
| `save` | `ReactNode` | Label for the Save button |
| `cancel` | `ReactNode` | Label for the Cancel button |
| `delete` | `ReactNode` | Label for the Delete button |
