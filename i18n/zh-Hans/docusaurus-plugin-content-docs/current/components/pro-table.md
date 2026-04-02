---
sidebar_position: 105
---

# ProTable

内置查询、分页、行选择、列设置和操作列的页面级表格抽象组件。

> **VEF 专属组件。** 在 v2.1.6 中从 `@vef-framework-react/starter` 迁移到 `@vef-framework-react/components`。

## 适用场景

- 任何需要查询 + 分页 + 行操作的数据列表页面。
- 需要列可见性控制或虚拟滚动的表格。

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
  { title: '姓名', dataIndex: 'name' },
  { title: '状态', dataIndex: 'status' },
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
            编辑
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

## 行选择

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

// 手动刷新
tableRef.current?.refetch();

<ProTable ref={tableRef} ... />
```

## API

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `columns` | `TableColumn<TRow>[]` | — | 列定义 |
| `rowKey` | `DeepKeys<TRow> \| (row) => Key` | — | 行键提取器 |
| `queryFn` | `QueryFunction<PaginationResult<TRow>, ...>` | — | 数据获取函数 |
| `queryParams` | `TParams` | — | 额外查询参数 |
| `queryEnabled` | `(params?) => boolean` | — | 是否启用查询 |
| `isPaginated` | `boolean` | `true` | 启用/禁用分页 |
| `showSequenceColumn` | `boolean` | `true` | 显示序号列 |
| `virtual` | `boolean` | `false` | 启用虚拟滚动 |
| `columnSettings` | `ColumnSettingsConfig \| false` | `{}` | 列可见性设置 |
| `operationColumn` | `OperationColumnConfig<TRow>` | — | 每行操作列 |
| `rowSelection` | `RowSelectionConfig<TRow> \| true` | — | 行选择配置 |
| `title` | `ReactNode` | — | 表格上方标题 |
| `header` | `ReactNode` | — | 标题上方内容 |
| `summary` | `ReactNode` | — | 表格下方汇总 |
| `footer` | `ReactNode` | — | 底部内容 |
| `onSelectedRowKeysChange` | `(keys, rows) => void` | — | 选择变化回调 |

### `ProTableSubscriber`

从组件外部订阅表格加载事件：

```tsx
import { ProTableSubscriber } from '@vef-framework-react/components';

<ProTableSubscriber
  tableRef={tableRef}
  onLoading={() => setLoading(true)}
  onLoaded={() => setLoading(false)}
/>
```
