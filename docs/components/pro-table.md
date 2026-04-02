---
sidebar_position: 105
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
          <OperationButton permTokens="user:edit" onClick={() => openEdit(row)}>
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

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `TableColumn<TRow>[]` | — | Column definitions |
| `rowKey` | `DeepKeys<TRow> \| (row) => Key` | — | Row key extractor |
| `queryFn` | `QueryFunction<PaginationResult<TRow>, ...>` | — | Data fetch function |
| `queryParams` | `TParams` | — | Additional query parameters |
| `queryEnabled` | `(params?) => boolean` | — | Whether to enable the query |
| `isPaginated` | `boolean` | `true` | Enable/disable pagination |
| `showSequenceColumn` | `boolean` | `true` | Show row number column |
| `virtual` | `boolean` | `false` | Enable virtual scrolling |
| `columnSettings` | `ColumnSettingsConfig \| false` | `{}` | Column visibility settings |
| `operationColumn` | `OperationColumnConfig<TRow>` | — | Per-row action column |
| `rowSelection` | `RowSelectionConfig<TRow> \| true` | — | Row selection config |
| `title` | `ReactNode` | — | Title above the table |
| `header` | `ReactNode` | — | Content above the title |
| `summary` | `ReactNode` | — | Content below the table |
| `footer` | `ReactNode` | — | Footer content |
| `onSelectedRowKeysChange` | `(keys, rows) => void` | — | Selection change callback |

### `ColumnSettingsConfig`

```ts
interface ColumnSettingsConfig {
  storageKey?: string; // persist to localStorage with this key
}
```

### `OperationColumnConfig<TRow>`

```ts
interface OperationColumnConfig<TRow> {
  width?: Length;
  title?: ReactNode;
  permTokens?: string[];
  render: (row: TRow, index: number) => ReactNode;
}
```

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
