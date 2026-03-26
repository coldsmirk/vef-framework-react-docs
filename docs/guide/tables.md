---
sidebar_position: 5
title: Tables
---

# Tables

VEF has two table layers:

1. `@vef-framework/components` exports `Table`
2. `@vef-framework/starter` exports `ProTable`

Use `Table` when data only needs to be displayed.  
Use `ProTable` when query integration, pagination, column settings, operation columns, and selection state are needed.

## When `Table` Is Enough

Related helpers:

- `usePaginationProps()`
- `pageSizeOptions`

```tsx
import { Table, usePaginationProps } from "@vef-framework/components";

const pagination = usePaginationProps({
  total,
  paginationParams: {
    page: 1,
    size: 15
  }
});

<Table columns={columns} dataSource={rows} pagination={pagination} />;
```

## `ProTable` Is the Page-Level Table

`ProTable` combines:

- query functions
- paginated or non-paginated modes
- row selection state
- column settings
- operation columns
- header / footer slots

```tsx
import { ProTable } from "@vef-framework/starter";

<ProTable
  isPaginated
  columns={columns}
  queryFn={findUserPage}
  rowKey="id"
  queryParams={{ keyword }}
/>;
```

## Common `ProTable` Props

| Prop | Purpose |
| --- | --- |
| `columns` | Column definitions |
| `queryFn` | Data query function |
| `isPaginated` | Pagination toggle |
| `rowKey` | Row key |
| `queryParams` | Additional query params |
| `rowSelection` | Row selection support |
| `columnSettings` | Column settings and persistence |
| `operationColumn` | Row-level operation column |
| `header` | Table header slot |
| `footer` | Table footer slot |

## Persisted Column Settings

```tsx
<ProTable
  columnSettings={{ storageKey: "page.auth.user" }}
  ...
/>
```

If not needed:

```tsx
<ProTable columnSettings={false} ... />
```

## `ProTableSubscriber`

When footer content or a local action only needs table-local state, `ProTableSubscriber` is usually more suitable than introducing extra external state.

## `ProTable` and `CrudPage`

At a conceptual level, `CrudPage` is:

- `Page`
- `Crud`
- `ProTable`
- form modal or drawer handling

combined into one page-level abstraction.
