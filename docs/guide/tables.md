---
title: Tables
description: When to reach for the display-only Table, the query-integrated ProTable, or the form-controlled EditableTable.
---

# Tables

VEF has three table layers, all exported from `@vef-framework-react/components`:

1. `Table` — display only
2. `ProTable` — page-level table integrated with query, pagination, selection, and column settings
3. `EditableTable` — a controlled form control for editing an array of rows inline

Between the first two, the decision comes down to one question: does the table own its own data fetching, or does the page already have the rows in hand? `EditableTable` is different in kind — it edits data instead of displaying it.

## When `Table` Is Enough

Use `Table` when data only needs to be displayed — the rows already exist in the component (from a parent query, a computed value, or a small static list) and the table itself has no fetching or pagination responsibility. Related helpers:

- `usePaginationProps()`
- `pageSizeOptions`

```tsx
import { Table, usePaginationProps } from "@vef-framework-react/components";

const pagination = usePaginationProps({
  total,
  paginationParams: {
    page: 1,
    size: 15
  }
});

<Table columns={columns} dataSource={rows} pagination={pagination} />;
```

## When `ProTable` Fits Better

Use `ProTable` when query integration, pagination, column settings, operation columns, or selection state are needed. `ProTable` combines a query function, paginated or non-paginated modes, row selection state, column settings, operation columns, and header/footer slots into one component:

```tsx
import { ProTable } from "@vef-framework-react/components";

<ProTable
  isPaginated
  columns={columns}
  queryFn={findUserPage}
  rowKey="id"
  queryParams={{ keyword }}
/>;
```

Because `queryFn` is the same shape used in [Data Fetching](./data-fetching.md), a query function written for `useQuery()` can usually back a `ProTable` without changes.

The full prop table — including `columnSettings`, `operationColumn`, `rowSelection`, and the rest — lives in [ProTable](../components/pro-table.md).

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

When footer content or a local action only needs table-local state, `ProTableSubscriber` is usually more suitable than introducing extra external state. See [ProTable](../components/pro-table.md) for its API.

## When Rows Are Edited Inline: `EditableTable`

`EditableTable` is a controlled form control, not a query component: `value` is the full row array, every edit / add / delete emits the next array through `onChange`, and no request is involved. One row edits at a time; each column defines a read slot (`renderView`) and an editor slot (`renderEditor`), with row-level validators. It is the right tool for embedded sub-lists — order lines inside a form, parameter rows in a config page — where the enclosing form submits the whole array.

Two defaults worth knowing when composing one into a page:

- The appended operation column has a fixed default width of **160px**, sized for the built-in action pair (Edit/Delete or Save/Cancel). When `renderRowActions` adds extra actions, widen it via `operationColumn.width`.
- The `locale` prop is forwarded to the underlying table (v2.12.0), so a compact empty state is a one-liner: `locale={{ emptyText: "暂无记录" }}`.

The full prop and column API lives in [EditableTable](../components/editable-table.md).

## `ProTable` and `CrudPage`

At a conceptual level, `CrudPage` is `Page` + `Crud` (`ProSearch` + `ProTable` + scene forms) combined into one page-level abstraction. If a page needs search, forms, and delete flows on top of the table, reach for `CrudPage` directly instead of composing `ProTable` by hand — see [CRUD Pages](./crud.md).
