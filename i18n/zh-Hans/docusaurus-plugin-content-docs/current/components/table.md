---
title: "Table"
description: "功能丰富的数据表格组件，用于展示结构化的行数据。"
---

# Table

功能丰富的数据表格组件，用于展示结构化的行数据。

> **来源：** 在 `antd` 的 Table 基础上进行了 VEF 增强。完整文档：[Ant Design Table](https://ant.design/components/table/)

## VEF 增强功能

- **`flexHeight`** 属性：自动计算表格高度以填充其容器的剩余垂直空间，无需手动计算高度即可启用虚拟滚动。
- **`usePaginationProps`**：用于生成标准分页配置的 Hook。
- **`pageSizeOptions`**：预设的每页条数选项数组。

## 基础用法

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

## 弹性高度（自动填充容器）

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

## 行选择

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

## 可排序列

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

`usePaginationProps` 接受 `{ paginationParams, total }` 作为参数，并返回 `TablePaginationConfig`。需要单独处理 `onChange` 以更新 `paginationParams`。

## API

### TableProps

继承自 Ant Design 的 `TableProps`（移除了 `scroll` 属性——该功能由 `flexHeight` 在内部处理）。

| Prop | Type | Default | 说明 |
|------|------|---------|-------------|
| `flexHeight` | `boolean` | `true` | 自动计算表格高度以填充容器 |
| `rowKey` | `string \| (record) => string` | — | 行的唯一标识 |
| `columns` | `TableColumn[]` | — | 列定义 |
| `dataSource` | `TRow[]` | — | 数据数组 |
| `loading` | `boolean \| SpinProps` | `false` | 加载状态 |
| `pagination` | `TablePaginationConfig \| false` | — | 分页配置 |
| `rowSelection` | `TableRowSelection` | — | 行选择配置 |
| `expandable` | `ExpandableConfig` | — | 行展开配置 |
| `scroll` | — | — | 已移除；请改用 `flexHeight` |
| `onChange` | `(pagination, filters, sorter) => void` | — | 表格状态变化处理函数 |
| `onRow` | `(record) => EventHandlers` | — | 行事件处理函数 |
| `size` | `'large' \| 'medium' \| 'small'` | `'medium'` | 表格密度（`'middle'` 是 `'medium'` 的废弃别名） |
| `bordered` | `boolean` | `false` | 显示单元格边框 |
| `sticky` | `boolean \| { offsetHeader }` | `false` | 吸顶表头 |
| `striped` | `boolean` | `false` | 渲染斑马纹行（每隔一行添加淡色底纹）；可与 `rowClassName` 组合使用 |
| `virtual` | `boolean` | `false` | 启用虚拟滚动 |
| `summary` | `(data) => ReactNode` | — | 汇总行 |

> 只要开启了 `flexHeight`（默认开启），`sticky` 就会被强制禁用：`flexHeight` 内部的滚动容器已经使吸顶表头变得多余，因此该模式下始终会向 antd 的 `Table` 传入 `sticky={false}`。如果需要 antd 原生的吸顶行为，请设置 `flexHeight={false}`。

### TableColumn

继承自 Ant Design 的 `TableColumnType`，以下为关键字段：

| Prop | Type | 说明 |
|------|------|-------------|
| `title` | `ReactNode` | 列标题 |
| `dataIndex` | `string \| string[]` | 数据字段键 |
| `key` | `string` | 唯一列标识 |
| `width` | `number \| string` | 列宽 |
| `fixed` | `'left' \| 'right' \| boolean` | 固定列 |
| `sorter` | `boolean \| function` | 排序函数 |
| `filters` | `ColumnFilterItem[]` | 筛选选项 |
| `render` | `(value, record, index) => ReactNode` | 自定义单元格渲染函数 |
| `ellipsis` | `boolean \| { showTitle }` | 截断超出文本 |
| `align` | `'left' \| 'center' \| 'right'` | 单元格对齐方式 |

## 最佳实践

- 始终将 `rowKey` 设置为唯一字段，以避免 React key 警告。
- 在需要表格填充剩余空间的页面布局中使用 `flexHeight`。
- 对于大数据集（1000 行以上），使用 `virtual` 以提升渲染性能。
- 使用 `usePaginationProps` 以在整个应用中保持一致的分页配置。
