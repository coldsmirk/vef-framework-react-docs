---
title: "ProTable"
description: "A page-level table abstraction with built-in query, pagination, row selection, column settings, and operation columns."
---

# ProTable

A page-level table abstraction with built-in query, pagination, row selection, column settings, and operation columns.

> **VEF-specific component.** Moved from `@vef-framework-react/starter` to `@vef-framework-react/components` in v2.1.6.

## When to Use

- Any data list page that needs query + pagination + row actions.
- Tables that need column visibility control or virtual scrolling.

## Basic Usage

```tsx
import { ProTable } from '@vef-framework-react/components';
import type { TableColumn } from '@vef-framework-react/components';

interface User {
  id: number;
  name: string;
  status: string;
}

const columns: TableColumn<User>[] = [
  { title: 'Name', dataIndex: 'name' },
  { title: 'Status', dataIndex: 'status' },
];

export default function UserTable() {
  return (
    <ProTable<User, UserSearchParams>
      columns={columns}
      rowKey="id"
      queryFn={findUserPage}
      queryParams={searchParams}
      operationColumn={{
        width: 120,
        render: (row) => (
          <OperationButton requiredPermissions="user:edit" onClick={() => openEdit(row)}>
            Edit
          </OperationButton>
        )
      }}
    />
  );
}
```

## Non-Paginated Mode

```tsx
<ProTable<User, UserSearchParams>
  isPaginated={false}
  columns={columns}
  rowKey="id"
  queryFn={findUserList}
/>
```

## With Row Selection

```tsx
<ProTable
  columns={columns}
  rowKey="id"
  queryFn={findUserPage}
  rowSelection={true}
  onSelectedRowKeysChange={(keys, rows) => setSelected(rows)}
/>
```

## Imperative Ref

```tsx
import { useRef } from 'react';
import type { ProTableRef } from '@vef-framework-react/components';

const tableRef = useRef<ProTableRef>(null);

// Manually refetch
tableRef.current?.refetch();

<ProTable ref={tableRef} ... />
```

## API

`rowKey`, `showSequenceColumn`, and `striped` can be defaulted application-wide through [`ConfigProvider.components.ProTable`](./config-provider.md#application-component-defaults). A prop passed to this table still wins.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `TableColumn<TRow>[]` | — | Column definitions |
| `rowKey` | `DeepKeys<TRow> \| (row) => Key` | —, overridable by `ConfigProvider.components.ProTable` | Row key extractor |
| `queryFn` | `QueryFunction<PaginationResult<TRow>, ...>` | — | Data fetch function |
| `queryParams` | `TParams` | — | Additional query parameters |
| `queryEnabled` | `(params?) => boolean` | — | Whether to enable the query |
| `isPaginated` | `boolean` | `true` | Enable/disable pagination |
| `showSequenceColumn` | `boolean` | `true`, overridable by `ConfigProvider.components.ProTable` | Show row number column |
| `virtual` | `boolean` | `false` | Enable virtual scrolling |
| `striped` | `boolean` | `false`, overridable by `ConfigProvider.components.ProTable` | Render zebra-striped rows |
| `columnSettings` | `ColumnSettingsConfig \| false` | `{}` | Column visibility settings |
| `operationColumn` | `OperationColumnConfig<TRow>` | — | Per-row action column |
| `rowSelection` | `RowSelectionConfig<TRow> \| true` | — | Row selection config |
| `selectedRowKeys` | `Key[]` | — | Controlled selected row keys |
| `size` | `'large' \| 'medium' \| 'small'` | — | Table density (`'middle'` is a deprecated alias for `'medium'`) |
| `title` | `ReactNode` | — | Title above the table |
| `header` | `ReactNode` | — | Content above the title |
| `summary` | `ReactNode` | — | Content below the table |
| `footer` | `ReactNode` | — | Footer content |
| `className` | `string` | — | Class for the table container |
| `style` | `CSSProperties` | — | Inline style for the table container |
| `onRowClick` | `(row, index, event) => void` | — | Row click handler (ignored inside the operation column) |
| `onSelectedRowKeysChange` | `(keys, rows) => void` | — | Selection change callback |

### `ColumnSettingsConfig`

```ts
interface ColumnSettingsConfig {
  storageKey?: string; // persist to localStorage with this key
}
```

### `OperationColumnConfig<TRow>`

| Field | Type | Description |
|-------|------|-------------|
| `width` | `Length` | Column width. No built-in default — set a fixed width so the end-fixed column doesn't absorb leftover table space; the framework convention is `160` px for a two-button action pair (which is also [`EditableTable`](./editable-table.md)'s default) |
| `title` | `ReactNode` | Column header title; defaults to `"操作"`. The column-settings icon is rendered next to it when column settings are enabled |
| `requiredPermissions` | `string[]` | Permission tokens required to display the operation column |
| `render` | `(row: TRow, index: number) => ReactNode` | Render the operation cell for a row (required) |

`requiredPermissions` hides the entire operation column (header included) when the current user doesn't hold any of the listed permission tokens. The operation column is always fixed to the end of the table.

### `RowSelectionConfig<TRow>`

Passed as `rowSelection` (or pass `true` for all defaults):

| Field | Type | Description |
|-------|------|-------------|
| `rowSelectDisabled` | `(model: TRow) => boolean` | Disable selection for rows where the function returns `true` |
| `checkStrictly` | `boolean` | Check table rows precisely, with parent and children selection not associated |
| `hideSelectAll` | `boolean` | Hide the select-all checkbox in the header |
| `preserveSelectedRowKeys` | `boolean` | Keep selection keys even when the key no longer exists in `dataSource` |
| `defaultSelectedRowKeys` | `Key[]` | The initially selected row keys |

### `ProTableRef`

| Member | Type | Description |
|--------|------|-------------|
| `refetch` | `() => void` | Manually trigger a data refetch (e.g. after external changes) |
| `onLoading` | `(callback: () => void) => () => void` | Register a callback invoked when the table starts loading; returns an unsubscribe function |
| `onLoaded` | `(callback: () => void) => () => void` | Register a callback invoked when the table finishes loading; returns an unsubscribe function |

### `ProTableSubscriber`

Subscribe to table loading events from outside the component:

```tsx
import { ProTableSubscriber } from '@vef-framework-react/components';

<ProTableSubscriber
  tableRef={tableRef}
  onLoading={() => setLoading(true)}
  onLoaded={() => setLoading(false)}
/>
```
