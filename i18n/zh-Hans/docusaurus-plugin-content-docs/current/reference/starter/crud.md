---
sidebar_position: 4
title: CRUD 与表格体系
---

# CRUD 与表格体系

## `ProSearch`

搜索表单容器，负责基础搜索区、高级搜索区、搜索按钮和重置逻辑。

关键 Props:

| Prop | 类型 | 说明 |
| --- | --- | --- |
| `defaultValues` | `TValues` | 初始搜索值 |
| `basicSearch` | `ReactNode` | 基础搜索区域 |
| `advancedSearch` | `ReactNode` | 高级搜索区域 |
| `extra` | `ReactNode` | 左侧扩展内容 |
| `onSearch` | `(values) => void` | 搜索回调 |
| `onReset` | `(defaultValues) => void` | 重置回调 |
| `defaultAdvancedSearchVisible` | `boolean` | 默认展开高级搜索 |
| `advancedSearchVisible` | `boolean` | 受控展开状态 |

## `ProTable`

页面级表格容器。

关键 Props:

| Prop | 类型 | 说明 |
| --- | --- | --- |
| `columns` | `Array<TableColumn<TRow>>` | 列定义 |
| `queryFn` | `QueryFunction` | 查询函数 |
| `isPaginated` | `boolean` | 是否分页 |
| `rowKey` | `DeepKeys \| fn` | 行主键 |
| `columnSettings` | `false \| { storageKey?: string }` | 列设置与持久化 |
| `rowSelection` | `true \| RowSelectionConfig` | 行选择 |
| `queryParams` | `TParams` | 额外查询参数 |
| `operationColumn` | `OperationColumnConfig` | 行操作列 |
| `header` / `footer` | `ReactNode` | 顶部和底部插槽 |

相关导出:

| 导出 | 用途 |
| --- | --- |
| `ProTableSubscriber` | 订阅表格内部状态 |
| `OperationButtonGroup` | 行级操作按钮组 |
| `ParamsWithPagination` | 分页参数类型 |
| `ParamsWithSort` | 排序参数类型 |
| `RowSelectionConfig` | 选中配置 |
| `ProTableRef` | 表格 ref 类型 |
| `ProTableState` | 表格内部状态类型 |

## `Crud`

在 `ProSearch`、`ProTable`、场景表单和删除 mutation 之上再包一层，提供一整套 CRUD 页面内部状态。

## `CrudPage`

`Page + Crud` 的组合页，是标准后台列表页首选。

关键 Props:

| Prop | 类型 | 说明 |
| --- | --- | --- |
| `tableColumns` | `Array<TableColumn<TRow>>` | 表格列 |
| `queryFn` | `QueryFunction` | 列表查询 |
| `basicSearch` / `advancedSearch` | `ReactNode` | 搜索区域 |
| `renderForm` | `(scene) => ReactNode` | 表单场景渲染 |
| `formMutationFns` | `CrudFormMutationFns` | create / update 等提交函数 |
| `deleteMutationFn` | `MutationFunction` | 单条删除 |
| `deleteManyMutationFn` | `MutationFunction` | 批量删除 |
| `toolbarActions` | `ReactNode` | 工具栏 |
| `operationColumn` | `OperationColumnConfig` | 行操作列 |
| `sceneDefaultFormValues` | `PartialDeep<TSceneFormValues>` | 各场景默认值 |

## `createCrudKit`

把页面的 `TRow`、`TSearchValues`、`TSceneFormValues` 泛型固化成一组本地可复用工具。

返回值:

| 返回值 | 用途 |
| --- | --- |
| `useCrudStore` | 读取当前 CRUD 内部状态 |
| `useSearchValues` | 读取当前搜索值 |
| `useSelectedRows` | 读取当前选中行 |
| `ActionButtonGroup` | 工具栏级按钮组 |
| `OperationButtonGroup` | 行操作按钮组 |

## CRUD 类型导出

| 类型 | 用途 |
| --- | --- |
| `CrudBasicFormScene` | 基础场景，如 create / update |
| `CrudFormScene` | 场景键类型 |
| `CrudBasicSceneFormValues` | 基础场景值映射 |
| `CrudFormMutationFns` | 场景提交函数映射 |
| `CrudProps` / `CrudPageProps` | CRUD 组件 Props |
| `CrudKit` | `createCrudKit()` 返回类型 |
