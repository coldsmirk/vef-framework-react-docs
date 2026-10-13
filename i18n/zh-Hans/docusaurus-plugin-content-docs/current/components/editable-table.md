---
title: "EditableTable"
description: "受控的行内可编辑表格，编辑、新增、删除行都是对值数组的操作。"
---

# EditableTable

受控的行内可编辑表格。同一时间只有一行处于编辑状态；编辑、新增、删除行都只是对受控的 `value` 数组进行操作，并通过 `onChange` 输出结果。构建于底层的 [`Table`](./table.md) 与 VEF 表单模块之上——不涉及任何查询或 mutation。

> **VEF 专属组件。** 并非 Ant Design 的一部分。

## 何时使用

- 需要行内编辑一个数组——例如表单中的明细行，或任何绑定到单一值的小型结构化列表——而不需要为每行单独进行查询/mutation 往返。
- 需要为每一列提供只读（`renderView`）与编辑（`renderEditor`）两种渲染插槽，并通过 `createEditableColumn` 获得类型安全的字段校验器。
- 当数据行来自带分页的远程查询、且每行拥有自己的 API 调用时，应改用 [`Crud`](./crud.md) / [`ProTable`](./pro-table.md)。

## 基础用法

```tsx
import { createEditableColumn, EditableTable } from '@vef-framework-react/components';
import type { EditableColumn } from '@vef-framework-react/components';
import { useState } from 'react';

interface Row {
  id: string;
  name: string;
  age: number;
}

const columns: Array<EditableColumn<Row>> = [
  createEditableColumn<Row>('name', {
    title: 'Name',
    validators: { onChange: ({ value }) => (value ? undefined : 'Name required') },
    renderEditor: (field) => <field.Input noWrapper />,
  }),
  createEditableColumn<Row>('age', {
    title: 'Age',
    renderView: (value) => `${value} yo`,
    renderEditor: (field) => <field.InputNumber noWrapper />,
  }),
];

export default function Demo() {
  const [rows, setRows] = useState<Row[]>([
    { id: '1', name: 'Edward', age: 32 },
    { id: '2', name: 'Helena', age: 28 },
  ]);

  return (
    <EditableTable<Row>
      columns={columns}
      rowKey="id"
      value={rows}
      onChange={setRows}
    />
  );
}
```

## 新增与删除行

```tsx
<EditableTable<Row>
  columns={columns}
  rowKey="id"
  value={rows}
  creatable
  canDelete
  createRecord={() => ({ name: '', age: 18 })}
  onChange={setRows}
/>
```

`canEdit` 与 `canDelete` 也接受逐行的判断函数：`canDelete={(row) => row.age >= 18}`。

## 额外的行操作

```tsx
<EditableTable<Row>
  columns={columns}
  rowKey="id"
  value={rows}
  renderRowActions={(row) => <a onClick={() => console.log(row)}>View</a>}
  onChange={setRows}
/>
```

## 操作列覆盖

追加的操作列默认使用固定的 `160`px 宽度（恰好容纳内置的两个操作按钮）。当 `renderRowActions` 增加了额外操作时，请把它加宽：

```tsx
<EditableTable<Row>
  columns={columns}
  rowKey="id"
  value={rows}
  operationColumn={{ title: 'Actions', width: 220 }}
  onChange={setRows}
/>
```

## API

### EditableTableProps\<TRow\>

| Prop | 类型 | 默认值 | 说明 |
|------|------|---------|-------------|
| `value` | `TRow[]` | 必填 | 受控的行数据 |
| `onChange` | `(value: TRow[]) => void` | — | 每次编辑/新增/删除时都会带上下一份数组触发 |
| `columns` | `Array<EditableColumn<TRow>>` | 必填 | 带有 `renderView` / `renderEditor` 插槽的列定义 |
| `rowKey` | `DeepKeys<TRow> \| ((row: TRow) => string)` | `"key"` | 行标识：字段名或函数；为正在编辑的行提供稳定标识 |
| `canEdit` | `boolean \| ((row: TRow) => boolean)` | `true` | 某行是否可以进入编辑模式 |
| `canDelete` | `boolean \| ((row: TRow) => boolean)` | `false` | 某行是否可以被删除 |
| `creatable` | `boolean` | — | 在表格下方显示新增行按钮 |
| `createRecord` | `() => Partial<TRow>` | — | 新增行时生成默认值的工厂函数 |
| `renderRowActions` | `(row: TRow, index: number) => ReactNode` | — | 渲染在内置编辑/删除按钮之前的额外只读态操作 |
| `operationColumn` | `EditableOperationColumnConfig` | — | 操作列覆盖（标题/宽度/按钮文案） |
| `size` | `TableProps<TRow>["size"]` | — | 表格密度，转发给底层表格 |
| `pagination` | `TableProps<TRow>["pagination"]` | `false` | 客户端分页配置，转发给底层表格 |
| `locale` | `TableProps<TRow>["locale"]` | — | 表格文案覆盖（例如更紧凑的 `emptyText`），转发给底层表格 |

### EditableColumn\<TRow\>

通过 `createEditableColumn<TRow>(dataIndex, options)` 构建——这是一个类型安全的工厂函数，会把 `options` 拆分为展示字段、两个渲染插槽，以及供编辑器使用的 `<form.AppField>` 选项（校验器、监听器等）。

| 字段 | 类型 | 说明 |
|-------|------|-------------|
| `dataIndex` | `DeepKeys<TRow>` | 该列的数据 key；编辑时同时作为表单字段名 |
| `key` | `string` | 稳定的列标识；默认等于 `dataIndex` |
| `editable` | `boolean` | 该列是否参与编辑；默认为 `true` |
| `title` | `ReactNode` | 列标题 |
| `width` / `minWidth` | `Length` | 列宽约束 |
| `align` | `'left' \| 'center' \| 'right'` | 单元格对齐方式 |
| `fixed` | `'left' \| 'right' \| boolean` | 固定列 |
| `ellipsis` | `boolean \| { showTitle }` | 溢出文本截断 |
| `className` | `string` | 单元格类名 |
| `renderView` | `(value: unknown, row: TRow, index: number) => ReactNode` | 只读展示插槽；未提供时回退为原始值 |
| `renderEditor` | `(field: typeof fieldComponents, context: EditFieldContext<TRow>) => ReactNode` | 编辑插槽；未提供时该列保持只读 |
| *（校验器、监听器等）* | — | `createField` 所接受的任意 `<form.AppField>` 选项，会转发给该行的草稿表单 |

`renderEditor` 的 `field` 参数与 `createField` 所用的字段组件字典相同（`field.Input`、`field.Select` 等）；`context` 携带 `{ row, index, rowKey }`。

两个插槽的类型以 `RenderView<TRow>` 与 `RenderEditor<TRow>` 导出，`createEditableColumn` 的 `options` 类型以 `EditableColumnOptions<TRow>` 导出。

### EditableOperationColumnConfig

| 字段 | 类型 | 说明 |
|-------|------|-------------|
| `title` | `ReactNode` | 操作列标题；默认为 `"操作"` |
| `width` | `Length` | 操作列宽度。默认固定为 `160` px，足以容纳内置的两个操作按钮——若不固定宽度，弹性布局的表格会把所有剩余空间都分给操作列。当 `renderRowActions` 增加了额外操作时请加宽 |
| `texts` | `EditableRowActionsTexts` | 内置行操作按钮的自定义文案 |

### EditableRowActionsTexts

| 字段 | 类型 | 说明 |
|-------|------|-------------|
| `edit` | `ReactNode` | 编辑按钮文案 |
| `save` | `ReactNode` | 保存按钮文案 |
| `cancel` | `ReactNode` | 取消按钮文案 |
| `delete` | `ReactNode` | 删除按钮文案 |
