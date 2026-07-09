---
title: "ProTable"
description: "一个页面级的表格抽象组件，内置查询、分页、行选择、列设置和操作列功能。"
---

# ProTable

一个页面级的表格抽象组件，内置查询、分页、行选择、列设置和操作列功能。

> **VEF 专属组件。** 已在 v2.1.6 中从 `@vef-framework-react/starter` 迁移至 `@vef-framework-react/components`。

## 何时使用

- 任何需要查询 + 分页 + 行操作的数据列表页面。
- 需要列显隐控制或虚拟滚动的表格。

## 基础用法

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

## 非分页模式

```tsx
<ProTable<User, UserSearchParams>
  isPaginated={false}
  columns={columns}
  rowKey="id"
  queryFn={findUserList}
/>
```

## 带行选择

```tsx
<ProTable
  columns={columns}
  rowKey="id"
  queryFn={findUserPage}
  rowSelection={true}
  onSelectedRowKeysChange={(keys, rows) => setSelected(rows)}
/>
```

## 命令式 Ref

```tsx
import { useRef } from 'react';
import type { ProTableRef } from '@vef-framework-react/components';

const tableRef = useRef<ProTableRef>(null);

// Manually refetch
tableRef.current?.refetch();

<ProTable ref={tableRef} ... />
```

## API

| Prop | Type | Default | 说明 |
|------|------|---------|-------------|
| `columns` | `TableColumn<TRow>[]` | — | 列定义 |
| `rowKey` | `DeepKeys<TRow> \| (row) => Key` | — | 行 key 提取器 |
| `queryFn` | `QueryFunction<PaginationResult<TRow>, ...>` | — | 数据获取函数 |
| `queryParams` | `TParams` | — | 额外的查询参数 |
| `queryEnabled` | `(params?) => boolean` | — | 是否启用查询 |
| `isPaginated` | `boolean` | `true` | 启用/禁用分页 |
| `showSequenceColumn` | `boolean` | `true` | 显示行号列 |
| `virtual` | `boolean` | `false` | 启用虚拟滚动 |
| `striped` | `boolean` | `false` | 渲染斑马纹行 |
| `columnSettings` | `ColumnSettingsConfig \| false` | `{}` | 列显隐设置 |
| `operationColumn` | `OperationColumnConfig<TRow>` | — | 每行的操作列 |
| `rowSelection` | `RowSelectionConfig<TRow> \| true` | — | 行选择配置 |
| `selectedRowKeys` | `Key[]` | — | 受控的已选行 key |
| `size` | `'large' \| 'medium' \| 'small'` | — | 表格密度（`'middle'` 是 `'medium'` 的废弃别名） |
| `title` | `ReactNode` | — | 表格上方的标题 |
| `header` | `ReactNode` | — | 标题上方的内容 |
| `summary` | `ReactNode` | — | 表格下方的内容 |
| `footer` | `ReactNode` | — | 页脚内容 |
| `className` | `string` | — | 表格容器的类名 |
| `style` | `CSSProperties` | — | 表格容器的内联样式 |
| `onRowClick` | `(row, index, event) => void` | — | 行点击处理函数（操作列内部会忽略该事件） |
| `onSelectedRowKeysChange` | `(keys, rows) => void` | — | 选择变化回调函数 |

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
  requiredPermissions?: string[];
  render: (row: TRow, index: number) => ReactNode;
}
```

`requiredPermissions` 会在当前用户不持有所列权限令牌中的任何一个时，隐藏整个操作列（包括表头）。

### `ProTableSubscriber`

从组件外部订阅表格的加载事件：

```tsx
import { ProTableSubscriber } from '@vef-framework-react/components';

<ProTableSubscriber
  tableRef={tableRef}
  onLoading={() => setLoading(true)}
  onLoaded={() => setLoading(false)}
/>
```
