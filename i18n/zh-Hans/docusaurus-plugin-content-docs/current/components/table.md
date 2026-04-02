---
sidebar_position: 5
---

# Table 表格

展示行列数据的功能丰富的数据表格。

> **来源：** 封装 `antd` Table 并提供 VEF 增强。完整文档：[Ant Design Table](https://ant.design/components/table-cn/)

## VEF 增强说明

- **`flexHeight` 属性**：自动计算表格高度以填充容器剩余垂直空间，无需手动计算高度即可启用虚拟滚动。
- **`usePaginationProps`**：生成标准分页配置的 Hook。
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
  { title: '姓名', dataIndex: 'name', key: 'name' },
  { title: '年龄', dataIndex: 'age', key: 'age', width: 80 },
  { title: '邮箱', dataIndex: 'email', key: 'email' },
];

const data: User[] = [
  { id: 1, name: '张三', age: 28, email: 'zhangsan@example.com' },
  { id: 2, name: '李四', age: 32, email: 'lisi@example.com' },
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

## 自适应高度（flexHeight）

```tsx
import { Table, usePaginationProps } from '@vef-framework-react/components';

export default function Demo() {
  const [paginationParams, setPaginationParams] = useState({ page: 1, size: 15 });

  const pagination = usePaginationProps({
    total: 100,
    paginationParams,
  });

  return (
    // 父容器需要有明确的高度
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        flexHeight   // 自动填充剩余高度
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
    title: '姓名',
    dataIndex: 'name',
    sorter: (a, b) => a.name.localeCompare(b.name),
  },
  {
    title: '年龄',
    dataIndex: 'age',
    sorter: (a, b) => a.age - b.age,
    defaultSortOrder: 'ascend',
  },
];
```

## `usePaginationProps`

```tsx
import { Table, usePaginationProps, pageSizeOptions } from '@vef-framework-react/components';

const [paginationParams, setPaginationParams] = useState({ page: 1, size: 15 });

const pagination = usePaginationProps({
  total: 500,
  paginationParams,
});
```

`usePaginationProps` 接受 `{ paginationParams, total }` 并返回 `TablePaginationConfig`。`onChange` 需要在外部单独处理以更新 `paginationParams`。

## API

### TableProps

继承 Ant Design `TableProps`（移除了 `scroll` 属性，由 `flexHeight` 内部处理）。

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `flexHeight` | `boolean` | `true` | 自动计算表格高度以填充容器 |
| `rowKey` | `string \| (record) => string` | — | 表格行 key 的取值 |
| `columns` | `TableColumn[]` | — | 表格列的配置描述 |
| `dataSource` | `TRow[]` | — | 数据数组 |
| `loading` | `boolean \| SpinProps` | `false` | 页面是否加载中 |
| `pagination` | `TablePaginationConfig \| false` | — | 分页器配置 |
| `rowSelection` | `TableRowSelection` | — | 列表项是否可选择 |
| `expandable` | `ExpandableConfig` | — | 配置展开属性 |
| `scroll` | — | — | 已移除，请使用 `flexHeight` |
| `onChange` | `(pagination, filters, sorter) => void` | — | 分页、排序、筛选变化时触发 |
| `onRow` | `(record) => EventHandlers` | — | 设置行属性 |
| `size` | `'large' \| 'middle' \| 'small'` | `'middle'` | 表格大小 |
| `bordered` | `boolean` | `false` | 是否展示外边框和列边框 |
| `sticky` | `boolean \| { offsetHeader }` | `false` | 设置粘性头部和滚动条 |
| `virtual` | `boolean` | `false` | 支持虚拟列表 |
| `summary` | `(data) => ReactNode` | — | 总结栏 |

### TableColumn

继承 Ant Design `TableColumnType`，主要字段：

| 属性 | 类型 | 说明 |
|------|------|------|
| `title` | `ReactNode` | 列头显示文字 |
| `dataIndex` | `string \| string[]` | 列数据在数据项中对应的路径 |
| `key` | `string` | React 需要的 key |
| `width` | `number \| string` | 列宽度 |
| `fixed` | `'left' \| 'right' \| boolean` | 列是否固定 |
| `sorter` | `boolean \| function` | 排序函数 |
| `filters` | `ColumnFilterItem[]` | 表头的筛选菜单项 |
| `render` | `(value, record, index) => ReactNode` | 生成复杂数据的渲染函数 |
| `ellipsis` | `boolean \| { showTitle }` | 超过宽度将自动省略 |
| `align` | `'left' \| 'center' \| 'right'` | 设置列的对齐方式 |

## 最佳实践

- 始终设置 `rowKey` 为唯一字段，避免 React key 警告。
- 在页面布局中使用 `flexHeight`，让表格自动填充剩余空间。
- 数据量超过 1000 行时使用 `virtual` 虚拟滚动提升渲染性能。
- 使用 `usePaginationProps` 保持全应用分页配置一致。
