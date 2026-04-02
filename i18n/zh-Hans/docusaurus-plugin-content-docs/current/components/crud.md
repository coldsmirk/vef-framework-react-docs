---
sidebar_position: 106
---

# Crud 与 CrudPage

`Crud` 和 `CrudPage` 是 VEF 的标准 CRUD 抽象组件，将 `ProSearch`、`ProTable`、场景表单和删除变更整合为一个完整的 CRUD 状态模型。

> **VEF 专属组件。** 在 v2.1.6 中从 `@vef-framework-react/starter` 迁移到 `@vef-framework-react/components`。

## 适用场景

- 任何标准的列表 + 新建/编辑/删除页面。
- 需要完整页面布局外壳时使用 `CrudPage`。
- 嵌入自定义布局时使用 `Crud`。

## `createCrudKit`

使用 `Crud` 或 `CrudPage` 前，先调用 `createCrudKit` 固定页面的泛型类型：

```ts
import { createCrudKit } from '@vef-framework-react/components';

interface UserRow { id: number; name: string; status: string; }
interface UserSearch { name?: string; status?: string; }
interface UserSceneFormValues {
  create: { name: string; email: string; };
  update: { id: number; name: string; email: string; };
}

export const {
  useCrudStore,
  useSearchValues,
  useSelectedRows,
  ActionButtonGroup,
  OperationButtonGroup,
} = createCrudKit<UserRow, UserSearch, UserSceneFormValues>();
```

## `CrudPage` 用法

```tsx
import { CrudPage } from '@vef-framework-react/components';

export default function UserPage() {
  return (
    <CrudPage<UserRow, UserSearch, UserSceneFormValues>
      tableColumns={columns}
      rowKey="id"
      queryFn={findUserPage}
      formMutationFns={{
        create: createUser,
        update: updateUser,
      }}
      mutationMeta={key => ({ invalidates: [[findUserPage.key]] })}
      deleteMutationFn={deleteUser}
      basicSearch={<UserSearchFields />}
      renderForm={scene => <UserFormFields scene={scene} />}
      toolbarActions={<ActionButtonGroup ... />}
      operationColumn={{
        width: 120,
        render: row => <OperationButtonGroup row={row} ... />
      }}
    />
  );
}
```

## 表单场景

`TSceneFormValues` 是场景键到表单值类型的映射。内置场景为 `"create"` 和 `"update"`，也可以添加自定义场景：

```ts
interface UserSceneFormValues {
  create: CreateUserForm;
  update: UpdateUserForm;
  resetPassword: ResetPasswordForm; // 自定义场景
}
```

## 关键属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `tableColumns` | `TableColumn<TRow>[]` | 列定义 |
| `rowKey` | `DeepKeys<TRow> \| (row) => Key` | 行键提取器 |
| `queryFn` | `QueryFunction<PaginationResult<TRow>, ...>` | 数据获取函数 |
| `isPaginated` | `boolean` | 启用/禁用分页（默认：`true`） |
| `formMutationFns` | `CrudFormMutationFns<TSceneFormValues>` | 各场景的变更函数 |
| `deleteMutationFn` | `MutationFunction` | 单行删除 |
| `deleteManyMutationFn` | `MutationFunction` | 多行删除 |
| `mutationMeta` | `(key) => MutationMeta` | 变更元数据提供者 |
| `renderForm` | `(scene) => ReactNode` | 各场景的表单内容 |
| `basicSearch` | `ReactNode` | 内联搜索字段 |
| `advancedSearch` | `ReactNode` | 高级搜索字段 |
| `toolbarActions` | `ReactNode` | 工具栏操作按钮 |
| `operationColumn` | `OperationColumnConfig<TRow>` | 每行操作列 |
| `rowSelection` | `RowSelectionConfig<TRow> \| true` | 行选择 |
| `columnSettings` | `ColumnSettingsConfig \| false` | 列可见性 |
| `beforeFormSubmit` | `(scene, values) => Awaitable<values>` | 提交前转换 |
| `afterFormSubmit` | `(scene, values, result) => Awaitable<void>` | 提交后钩子 |

### `CrudPage` 专属属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `leftAside` | `ReactNode` | 左侧边栏 |
| `leftAsideWidth` | `AsideWidth` | 左侧边栏宽度 |
| `rightAside` | `ReactNode` | 右侧边栏 |
| `rightAsideWidth` | `AsideWidth` | 右侧边栏宽度 |
| `header` | `ReactNode` | 页头 |
| `headerPosition` | `'inside' \| 'outside'` | 页头位置 |
| `footer` | `ReactNode` | 页脚 |
| `footerPosition` | `'inside' \| 'outside'` | 页脚位置 |

## 表单显示模式

控制表单以 Modal 还是 Drawer 形式打开：

```tsx
// 默认：modal
<CrudPage formMode="modal" ... />

// 抽屉
<CrudPage formMode="drawer" formDrawerConfig={{ placement: 'right' }} ... />
```

## `CrudKit` 辅助工具

`createCrudKit` 的返回值提供：

- `useCrudStore` — 访问完整的 CRUD 状态
- `useSearchValues` — 当前搜索表单值
- `useSelectedRows` — 当前选中的行
- `ActionButtonGroup` — 带 CRUD 上下文的工具栏操作按钮
- `OperationButtonGroup` — 带 CRUD 上下文的每行操作按钮
