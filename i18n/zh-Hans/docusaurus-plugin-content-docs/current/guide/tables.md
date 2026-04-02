---
sidebar_position: 5
title: 表格
---

# 表格

VEF 里有两层表格能力:

1. `@vef-framework-react/components` 的 `Table`
2. `@vef-framework-react/starter` 的 `ProTable`

如果你只是展示数据，用 `Table` 即可。  
如果你要接查询、分页、列设置、操作列、选择状态，优先用 `ProTable`。

## `Table` 适合什么场景

配套工具:

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

## `ProTable` 是页面级表格

`ProTable` 把这些事情接在一起了:

- 查询函数
- 分页或非分页模式
- 选中行状态
- 列显示设置
- 操作列
- header / footer 插槽

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

## 最常用的 `ProTable` 参数

| 参数 | 作用 |
| --- | --- |
| `columns` | 列定义 |
| `queryFn` | 数据查询函数 |
| `isPaginated` | 是否分页，默认分页 |
| `rowKey` | 行主键 |
| `queryParams` | 附加查询参数 |
| `rowSelection` | 开启行选择 |
| `columnSettings` | 列设置与持久化 |
| `operationColumn` | 行级操作列 |
| `header` | 表格头部插槽 |
| `footer` | 表格底部插槽 |

## 列设置持久化

```tsx
<ProTable
  columnSettings={{ storageKey: "page.auth.user" }}
  ...
/>
```

不需要时:

```tsx
<ProTable columnSettings={false} ... />
```

## `ProTableSubscriber`

如果 footer 或某个局部按钮只需要读取表格内部状态，不要自己再绕一层外部状态管理。直接用 `ProTableSubscriber` 订阅就行。

## `ProTable` 和 `CrudPage` 的关系

`CrudPage` 本质上是:

- `Page`
- `Crud`
- `ProTable`
- 表单弹窗或抽屉

的一层组合封装。
