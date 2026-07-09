---
title: 表格
description: 何时使用纯展示型的 Table，何时使用与查询集成的 ProTable。
---

# 表格

VEF 有两层表格能力，都从 `@vef-framework-react/components` 导出：

1. `Table` —— 仅做展示
2. `ProTable` —— 页面级表格，已经把查询、分页、选择和列设置集成在一起

在两者之间做选择，归结为一个问题：这张表格是自己负责数据请求，还是页面已经拿到了行数据？

## 什么时候 `Table` 就够了

当数据只需要展示——行数据已经存在于组件中（来自父级查询、计算值，或一份简单的静态列表），且表格本身不承担请求或分页职责时，使用 `Table`。相关辅助工具：

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

## 什么时候 `ProTable` 更合适

当需要查询集成、分页、列设置、操作列或选择状态时，使用 `ProTable`。`ProTable` 把查询函数、分页或非分页模式、行选择状态、列设置、操作列以及页头/页脚插槽整合进了一个组件：

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

由于 `queryFn` 与 [数据请求](./data-fetching.md) 中使用的形态相同，一个为 `useQuery()` 编写的查询函数通常无需改动即可直接支撑 `ProTable`。

完整的属性表——包括 `columnSettings`、`operationColumn`、`rowSelection` 等——见 [ProTable](../components/pro-table.md)。

## 持久化列设置

```tsx
<ProTable
  columnSettings={{ storageKey: "page.auth.user" }}
  ...
/>
```

如果不需要：

```tsx
<ProTable columnSettings={false} ... />
```

## `ProTableSubscriber`

当页脚内容或某个局部操作只需要读取表格内部状态时，`ProTableSubscriber` 通常比引入额外的外部状态更合适。它的 API 见 [ProTable](../components/pro-table.md)。

## `ProTable` 与 `CrudPage`

从概念上讲，`CrudPage` 就是把 `Page` 加上 `Crud`（`ProSearch` + `ProTable` + 场景表单）组合成的一个页面级抽象。如果页面在表格之上还需要搜索、表单和删除流程，直接使用 `CrudPage`，而不是手动组合 `ProTable`——见 [CRUD 页面](./crud.md)。
