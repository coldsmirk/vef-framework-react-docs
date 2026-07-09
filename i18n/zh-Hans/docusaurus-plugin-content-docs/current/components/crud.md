---
title: "Crud 与 CrudPage"
description: "标准的列表 + 搜索 + 场景表单 + 删除 CRUD 抽象，将 ProSearch、ProTable 与场景表单整合为一个状态模型。"
---

# Crud 与 CrudPage

`Crud` 和 `CrudPage` 是 VEF 中标准的 CRUD 抽象组件，将 `ProSearch`、`ProTable`、场景表单和删除 mutation 整合为一个统一的状态模型。

> **VEF 专属组件。** 已在 v2.1.6 中从 `@vef-framework-react/starter` 迁移至 `@vef-framework-react/components`。

## 何时使用

- 任何标准的列表 + 新建/编辑/删除页面。
- 当页面需要完整的页面布局外壳时使用 `CrudPage`（它组合了 `Page` + `Crud`）。
- 当需要将 CRUD 区块嵌入自定义布局时使用 `Crud`。

## `createCrudKit`

在使用 `Crud` 或 `CrudPage` 之前，先调用 `createCrudKit` 将页面的泛型类型（`TRow`、`TSearchValues`、`TSceneFormValues`）固定为一个可复用的本地工具集：

```ts
import type { CrudBasicSceneFormValues } from '@vef-framework-react/components';

import { createCrudKit } from '@vef-framework-react/components';

interface UserRow { id: number; name: string; status: string; }
interface UserSearch { name?: string; status?: string; }
type UserSceneFormValues = CrudBasicSceneFormValues<CreateUserParams, UpdateUserParams>;

export const {
  useCrudStore,
  useSearchValues,
  useSelectedRows,
  ActionButtonGroup,
  OperationButtonGroup,
} = createCrudKit<UserRow, UserSearch, UserSceneFormValues>();
```

`CrudBasicSceneFormValues<TCreate, TUpdate>` 是常见 `{ create: TCreate; update: TUpdate }` 场景映射的简写——当页面只需要内置的 `create`/`update` 场景时可以使用它。

## `CrudPage` 用法

```tsx
import { ActionButton, CrudPage, Icon, OperationButton } from '@vef-framework-react/components';
import { EditIcon, PlusIcon, TrashIcon } from 'lucide-react';

import { ActionButtonGroup, OperationButtonGroup } from './helpers';

function OperationColumn({ row }: { row: UserRow }) {
  return (
    <OperationButtonGroup selector={state => [state.openForm, state.delete, state.refetchQuery] as const}>
      {([openForm, deleteRow, refetchQuery]) => (
        <>
          <OperationButton icon={<Icon component={EditIcon} />} onClick={() => openForm({ scene: 'update', values: row })}>
            Edit
          </OperationButton>
          <OperationButton
            confirmable
            danger
            icon={<Icon component={TrashIcon} />}
            onClick={async () => {
              await deleteRow(row);
              refetchQuery();
            }}
          >
            Delete
          </OperationButton>
        </>
      )}
    </OperationButtonGroup>
  );
}

function ToolbarActions() {
  return (
    <ActionButtonGroup selector={state => state.openForm}>
      {openForm => (
        <ActionButton type="primary" onClick={() => openForm({ scene: 'create' })}>
          Create
        </ActionButton>
      )}
    </ActionButtonGroup>
  );
}

export default function UserPage() {
  return (
    <CrudPage<UserRow, UserSearch, UserSceneFormValues>
      basicSearch={<UserSearchFields />}
      deleteMutationFn={deleteUser}
      formMutationFns={{ create: createUser, update: updateUser }}
      mutationMeta={key => ({ invalidates: [[findUserPage.key]] })}
      operationColumn={{ width: 120, render: row => <OperationColumn row={row} /> }}
      queryFn={findUserPage}
      renderForm={scene => <UserFormFields scene={scene} />}
      rowKey="id"
      tableColumns={columns}
      toolbarActions={<ToolbarActions />}
    />
  );
}
```

`ActionButtonGroup` 和 `OperationButtonGroup` 是指向 CRUD store 的上下文选择器：`selector` 用于挑选调用方所需的 `CrudState` 切片（通常是 `openForm`、`delete`、`refetchQuery`），`children` 则是接收所选值的渲染函数。这样可以避免工具栏和行内操作因无关的 store 变化而重新渲染。

## 表单场景

`TSceneFormValues` 是场景键到表单值类型的映射。内置场景为 `"create"` 和 `"update"`，但你也可以添加自定义场景：

```ts
interface UserSceneFormValues {
  create: CreateUserForm;
  update: UpdateUserForm;
  resetPassword: ResetPasswordForm; // custom scene
}
```

`renderForm(scene)` 接收当前激活的场景键，使单个表单组件可以据此分支处理（例如仅在 `create` 场景下才需要的密码字段）。

## 打开表单与表单显示模式

`Crud`/`CrudPage` 上没有 `formMode` 属性。表单是以 modal 还是 drawer 形式呈现（以及 drawer 的位置）是按每次调用决定的，通过向 `openForm` 传入 `mode`/`drawerConfig` 来指定——可通过工具集的 `useCrudStore`（或如上文所示的 `ActionButtonGroup`/`OperationButtonGroup` 选择器）从 CRUD store 中读取：

```tsx
const openForm = useCrudStore(state => state.openForm);

// Modal (default)
openForm({ scene: 'create' });

// Drawer
openForm({ scene: 'update', values: row, mode: 'drawer', drawerConfig: { placement: 'right' } });
```

## 行为说明

- `delete` 或 `deleteMany` 成功后，`Crud` 会自动清除内部选择状态——依赖 `selectedRows` 的工具栏按钮会自动重新禁用。
- `formActionsRenderers[scene]` 接收 `(formApi, defaults)`，其中 `defaults` 暴露了框架默认的 `submitButton` 和 `resetButton`，使自定义操作布局也能保留标准按钮：

```tsx
formActionsRenderers={{
  create: (_formApi, { submitButton, resetButton }) => (
    <Group gap="small">
      {resetButton}
      {submitButton}
    </Group>
  )
}}
```

## API

### 关键属性（`Crud` 与 `CrudPage`）

`Crud`（以及封装它的 `CrudPage`）在 `isPaginated` 上接受一个可辨识联合类型：当值为 `true` 或省略时，`queryFn` 必须返回 `PaginationResult<TRow>`；当值为 `false` 时，则必须返回 `TRow[]`。

| Prop | Type | 说明 |
|------|------|-------------|
| `queryFn` | `QueryFunction<PaginationResult<TRow> \| TRow[], ...>` | 列表查询函数；返回值的形状取决于 `isPaginated` |
| `isPaginated` | `boolean` | 启用/禁用分页（默认：`true`） |
| `tableColumns` | `TableColumn<TRow>[]` | 列定义 |
| `rowKey` | `DeepKeys<TRow> \| (row) => Key` | 行键提取器 |
| `storageKey` | `string` | 将搜索状态持久化到 `sessionStorage`；请为每个 `Crud` 实例指定唯一的 key |
| `tableSize` | `'large' \| 'medium' \| 'small'` | 表格密度（`'middle'` 是 `'medium'` 的废弃别名） |
| `columnSettings` | `ColumnSettingsConfig \| false` | 列可见性设置（默认：`{}`） |
| `operationColumn` | `OperationColumnConfig<TRow>` | 每行操作列 |
| `showSequenceColumn` | `boolean` | 显示行号列（默认：`true`） |
| `virtual` | `boolean` | 启用虚拟滚动（默认：`false`） |
| `striped` | `boolean` | 斑马纹行（默认：`false`） |
| `onRowClick` | `(row, index, event) => void` | 行点击处理函数（在操作列内部会被忽略） |
| `title` | `ReactNode` | 表格上方的标题 |
| `summary` | `ReactNode` | 表格下方的内容 |
| `rowSelection` | `RowSelectionConfig<TRow> \| true` | 行选择配置 |
| `defaultSearchValues` | `Partial<TSearchValues>` | 初始搜索表单值 |
| `basicSearch` | `ReactNode` | 内联搜索字段 |
| `advancedSearch` | `ReactNode` | 高级（可折叠）搜索字段 |
| `sceneDefaultFormValues` | `PartialDeep<TSceneFormValues>` | 各场景的默认表单值 |
| `formComponent` | `ElementType` | 场景表单内层包装器的元素类型（默认：`"div"`） |
| `renderForm` | `(scene) => ReactNode` | 各场景的表单内容 |
| `beforeFormSubmit` | `(scene, values) => Awaitable<values>` | 提交前转换表单值 |
| `afterFormSubmit` | `(scene, values, result) => Awaitable<void>` | 提交成功后调用 |
| `formMutationFns` | `CrudFormMutationFns<TSceneFormValues>` | 各场景的提交 mutation |
| `formActionsRenderers` | `CrudFormActionsRenderers<TSceneFormValues>` | 各场景的自定义页脚操作渲染器，接收 `(formApi, defaults)` |
| `deleteMutationFn` | `MutationFunction` | 单行删除 |
| `deleteManyMutationFn` | `MutationFunction` | 批量删除 |
| `mutationMeta` | `(mutationKey) => MutationMeta` | mutation 元数据提供者（例如查询失效） |
| `toolbarActions` | `ReactNode` | 工具栏操作按钮 |
| `queryEnabled` | `(params?) => boolean` | 列表查询是否应当执行 |
| `queryParams` | `TParams` | 额外的查询参数，变化时会触发重新获取数据 |

### `CrudPage` 专属属性

`CrudPage` 在上述所有 `Crud` 属性的基础上，新增了 `Page` 的布局属性：

| Prop | Type | 说明 |
|------|------|-------------|
| `leftAside` | `ReactNode` | 左侧边栏面板 |
| `leftAsideWidth` | `AsideWidth` | 左侧边栏宽度 |
| `rightAside` | `ReactNode` | 右侧边栏面板 |
| `rightAsideWidth` | `AsideWidth` | 右侧边栏宽度 |
| `header` | `ReactNode` | 页头 |
| `headerClassName` | `string` | 页头类名 |
| `headerPosition` | `'inside' \| 'outside'` | 页头位置（默认：`"inside"`） |
| `footer` | `ReactNode` | 页脚 |
| `footerClassName` | `string` | 页脚类名 |
| `footerPosition` | `'inside' \| 'outside'` | 页脚位置（默认：`"inside"`） |

### `createCrudKit` / `CrudKit`

`createCrudKit<TRow, TSearchValues, TSceneFormValues>()` 返回一个 `CrudKit`：

| 辅助工具 | 用途 |
| --- | --- |
| `useCrudStore` | 用于读取（并从中选择）完整 CRUD 状态的类型化 hook，涵盖 `openForm`、`closeForm`、`delete`、`deleteMany`、`refetchQuery`、`searchValues`、`selectedRowKeys`/`selectedRows` |
| `useSearchValues` | 读取当前搜索表单值 |
| `useSelectedRows` | 读取当前选中的行模型 |
| `ActionButtonGroup` | 工具栏级别的按钮组；通过 `selector` + render-prop 形式的 `children` 接入 CRUD store |
| `OperationButtonGroup` | 行级别的操作按钮组；采用相同的 selector/children 模式 |

### CRUD 类型

| 类型 | 用途 |
| --- | --- |
| `CrudBasicFormScene` | 内置场景字面量：`"create" \| "update"` |
| `CrudFormScene<TSceneFormValues>` | 场景键类型，派生自 `TSceneFormValues` |
| `CrudBasicSceneFormValues<TCreate, TUpdate>` | `{ create: TCreate; update: TUpdate }` 的简写 |
| `CrudFormMutationFns<TSceneFormValues>` | 场景键到其提交 `MutationFunction` 的映射 |
| `CrudFormActionsRenderers<TSceneFormValues>` | 场景键到自定义页脚操作渲染器的映射 |
| `CrudFormMode` | `"modal" \| "drawer"`——传递给 `openForm({ mode })`，并非组件属性 |
| `CrudFormDrawerConfig` | `{ placement?: DrawerProps["placement"] }`——传递给 `openForm({ drawerConfig })` |
| `CrudProps<TRow, TSearchValues, TSceneFormValues, TParams>` | `Crud` 的属性（在 `isPaginated` 上的可辨识联合类型） |
| `CrudPageProps<TRow, TSearchValues, TSceneFormValues, TParams>` | `CrudPage` 的属性（`CrudProps` + `Page` 的布局属性） |
| `CrudKit<TRow, TSearchValues, TSceneFormValues>` | `createCrudKit()` 的返回类型 |

## 最佳实践

- 每个页面只调用一次 `createCrudKit()`（通常放在与路由同目录的 `helpers/index.ts` 中），并导出别名后的工具集——不要在每个使用点内联重新推导泛型。
- 通过带 `selector` 的 `ActionButtonGroup`/`OperationButtonGroup` 驱动工具栏和行内操作，而不是读取整个 store，以避免无关的重新渲染。
- 使用 `renderForm(scene)` 按场景分支表单布局，而不是维护独立的 create/update 表单组件。
- 需要将 CRUD 嵌入现有自定义布局时使用 `Crud`（不含 `Page`）；独立路由则使用 `CrudPage`。
