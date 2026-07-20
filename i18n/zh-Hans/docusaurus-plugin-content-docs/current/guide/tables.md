---
title: 表格
description: 何时使用纯展示型的 Table、与查询集成的 ProTable，或表单受控的 EditableTable。
---

# 表格

VEF 有三层表格能力，都从 `@vef-framework-react/components` 导出：

1. `Table` —— 仅做展示
2. `ProTable` —— 页面级表格，已经把查询、分页、选择和列设置集成在一起
3. `EditableTable` —— 用于内联编辑一组行数据的受控表单控件

在前两者之间做选择，归结为一个问题：这张表格是自己负责数据请求，还是页面已经拿到了行数据？`EditableTable` 则在类别上就不同——它编辑数据，而不是展示数据。

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

## 行数据需要内联编辑时：`EditableTable`

`EditableTable` 是一个受控表单控件，而不是查询组件：`value` 是完整的行数组，每次编辑/新增/删除都会通过 `onChange` 发出下一份数组，全程不涉及任何请求。同一时刻只有一行处于编辑态；每一列都定义一个只读插槽（`renderView`）和一个编辑器插槽（`renderEditor`），并支持行级校验器。它适合内嵌子列表的场景——表单里的订单行、配置页里的参数行——由外层表单统一提交整个数组。

把它组合进页面时，有两个默认值值得了解：

- 追加的操作列默认固定宽度为 **160px**，按内置的一对操作（编辑/删除或保存/取消）设定。当 `renderRowActions` 增加额外操作时，请通过 `operationColumn.width` 加宽。
- `locale` 属性会转发给底层表格（v2.12.0），因此一个紧凑的空状态只需一行：`locale={{ emptyText: "暂无记录" }}`。

完整的属性与列 API 见 [EditableTable](../components/editable-table.md)。

## `ProTable` 与 `CrudPage`

从概念上讲，`CrudPage` 就是把 `Page` 加上 `Crud`（`ProSearch` + `ProTable` + 场景表单）组合成的一个页面级抽象。如果页面在表格之上还需要搜索、表单和删除流程，直接使用 `CrudPage`，而不是手动组合 `ProTable`——见 [CRUD 页面](./crud.md)。
