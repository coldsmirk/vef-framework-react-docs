---
sidebar_position: 5
---

# Table

A feature-rich data table for displaying rows of structured data.

> **Source:** Wraps `antd` Table with VEF enhancements. Full documentation: [Ant Design Table](https://ant.design/components/table/)

## VEF Enhancements

- **`flexHeight`** prop: automatically calculates table height to fill the remaining vertical space of its container, enabling virtual scrolling without manual height calculation.
- **`usePaginationProps`**: a hook that generates standard pagination config.
- **`pageSizeOptions`**: a preset array of page size options.

## Basic Usage

```tsx
import { Table } from '@vef-framework-react/components';
import type { TableColumn } from '@vef-framework-react/components';

interface User {
  id: number;
  name: string;
  age: number;
  email: string;
}

const columns: TableColumn<User>[] = [
  { title: 'Name', dataIndex: 'name', key: 'name' },
  { title: 'Age', dataIndex: 'age', key: 'age', width: 80 },
  { title: 'Email', dataIndex: 'email', key: 'email' },
];

const data: User[] = [
  { id: 1, name: 'Alice', age: 28, email: 'alice@example.com' },
  { id: 2, name: 'Bob', age: 32, email: 'bob@example.com' },
];

export default function Demo() {
  return (
    <Table<User>
      rowKey="id"
      columns={columns}
      dataSource={data}
    />
  );
}
```

## Flex Height (Auto-fill Container)

```tsx
import { Table, usePaginationProps } from '@vef-framework-react/components';

export default function Demo() {
  const [paginationParams, setPaginationParams] = useState({ page: 1, size: 15 });

  const pagination = usePaginationProps({
    total: 100,
    paginationParams,
  });

  return (
    // The parent must have a defined height
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        flexHeight   // fills remaining height automatically
        pagination={{
          ...pagination,
          onChange: (page, pageSize) => setPaginationParams({ page, size: pageSize }),
        }}
      />
    </div>
  );
}
```

## Row Selection

```tsx
import { Table } from '@vef-framework-react/components';
import type { TableRowSelection } from '@vef-framework-react/components';
import { useState } from 'react';

export default function Demo() {
  const [selectedKeys, setSelectedKeys] = useState<number[]>([]);

  const rowSelection: TableRowSelection<User> = {
    selectedRowKeys: selectedKeys,
    onChange: (keys) => setSelectedKeys(keys as number[]),
  };

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={data}
      rowSelection={rowSelection}
    />
  );
}
```

## Sortable Columns

```tsx
const columns: TableColumn<User>[] = [
  {
    title: 'Name',
    dataIndex: 'name',
    sorter: (a, b) => a.name.localeCompare(b.name),
  },
  {
    title: 'Age',
    dataIndex: 'age',
    sorter: (a, b) => a.age - b.age,
    defaultSortOrder: 'ascend',
  },
];
```

## `usePaginationProps`

```tsx
import { Table, usePaginationProps } from '@vef-framework-react/components';

const [paginationParams, setPaginationParams] = useState({ page: 1, size: 15 });

const pagination = usePaginationProps({
  total: 500,
  paginationParams,
});
```

`usePaginationProps` accepts `{ paginationParams, total }` and returns `TablePaginationConfig`. Handle `onChange` separately to update `paginationParams`.

## API

### TableProps

Extends Ant Design `TableProps` (with `scroll` prop removed — handled internally by `flexHeight`).

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `flexHeight` | `boolean` | `true` | Auto-calculate table height to fill container |
| `rowKey` | `string \| (record) => string` | — | Unique row key |
| `columns` | `TableColumn[]` | — | Column definitions |
| `dataSource` | `TRow[]` | — | Data array |
| `loading` | `boolean \| SpinProps` | `false` | Loading state |
| `pagination` | `TablePaginationConfig \| false` | — | Pagination config |
| `rowSelection` | `TableRowSelection` | — | Row selection config |
| `expandable` | `ExpandableConfig` | — | Row expand config |
| `scroll` | — | — | Removed; use `flexHeight` instead |
| `onChange` | `(pagination, filters, sorter) => void` | — | Table state change handler |
| `onRow` | `(record) => EventHandlers` | — | Row event handlers |
| `size` | `'large' \| 'middle' \| 'small'` | `'middle'` | Table density |
| `bordered` | `boolean` | `false` | Show cell borders |
| `sticky` | `boolean \| { offsetHeader }` | `false` | Sticky header |
| `virtual` | `boolean` | `false` | Enable virtual scrolling |
| `summary` | `(data) => ReactNode` | — | Summary row |

### TableColumn

Extends Ant Design `TableColumnType`, key fields:

| Prop | Type | Description |
|------|------|-------------|
| `title` | `ReactNode` | Column header |
| `dataIndex` | `string \| string[]` | Data field key |
| `key` | `string` | Unique column key |
| `width` | `number \| string` | Column width |
| `fixed` | `'left' \| 'right' \| boolean` | Fixed column |
| `sorter` | `boolean \| function` | Sort function |
| `filters` | `ColumnFilterItem[]` | Filter options |
| `render` | `(value, record, index) => ReactNode` | Custom cell renderer |
| `ellipsis` | `boolean \| { showTitle }` | Truncate overflow text |
| `align` | `'left' \| 'center' \| 'right'` | Cell alignment |

## Best Practices

- Always set `rowKey` to a unique field to avoid React key warnings.
- Use `flexHeight` in page layouts where the table should fill the remaining space.
- Use `virtual` for large datasets (1000+ rows) to improve rendering performance.
- Use `usePaginationProps` for consistent pagination configuration across the application.
