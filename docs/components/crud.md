---
sidebar_position: 106
---

# Crud and CrudPage

`Crud` and `CrudPage` are the standard CRUD abstractions in VEF. They combine `ProSearch`, `ProTable`, scene forms, and delete mutations into one cohesive component.

> **VEF-specific component.** Moved from `@vef-framework-react/starter` to `@vef-framework-react/components` in v2.1.6.

## When to Use

- Any standard list + create/edit/delete page.
- Use `CrudPage` when the page needs a full-page layout shell.
- Use `Crud` when embedding the CRUD block inside a custom layout.

## `createCrudKit`

Before using `Crud` or `CrudPage`, call `createCrudKit` to fix the generic types for the page:

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

## `CrudPage` Usage

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

## Form Scenes

`TSceneFormValues` is a map of scene key to form values type. The built-in scenes are `"create"` and `"update"`, but you can add custom scenes:

```ts
interface UserSceneFormValues {
  create: CreateUserForm;
  update: UpdateUserForm;
  resetPassword: ResetPasswordForm; // custom scene
}
```

## Key Props

| Prop | Type | Description |
|------|------|-------------|
| `tableColumns` | `TableColumn<TRow>[]` | Column definitions |
| `rowKey` | `DeepKeys<TRow> \| (row) => Key` | Row key extractor |
| `queryFn` | `QueryFunction<PaginationResult<TRow>, ...>` | Data fetch function |
| `isPaginated` | `boolean` | Enable/disable pagination (default: `true`) |
| `formMutationFns` | `CrudFormMutationFns<TSceneFormValues>` | Mutation per scene |
| `deleteMutationFn` | `MutationFunction` | Single-row delete |
| `deleteManyMutationFn` | `MutationFunction` | Multi-row delete |
| `mutationMeta` | `(key) => MutationMeta` | Mutation meta provider |
| `renderForm` | `(scene) => ReactNode` | Form content per scene |
| `basicSearch` | `ReactNode` | Inline search fields |
| `advancedSearch` | `ReactNode` | Advanced search fields |
| `toolbarActions` | `ReactNode` | Toolbar action buttons |
| `operationColumn` | `OperationColumnConfig<TRow>` | Per-row action column |
| `rowSelection` | `RowSelectionConfig<TRow> \| true` | Row selection |
| `columnSettings` | `ColumnSettingsConfig \| false` | Column visibility |
| `beforeFormSubmit` | `(scene, values) => Awaitable<values>` | Transform before submit |
| `afterFormSubmit` | `(scene, values, result) => Awaitable<void>` | After submit hook |

### `CrudPage`-only Props

| Prop | Type | Description |
|------|------|-------------|
| `leftAside` | `ReactNode` | Left aside panel |
| `leftAsideWidth` | `AsideWidth` | Left aside width |
| `rightAside` | `ReactNode` | Right aside panel |
| `rightAsideWidth` | `AsideWidth` | Right aside width |
| `header` | `ReactNode` | Page header |
| `headerPosition` | `'inside' \| 'outside'` | Header position |
| `footer` | `ReactNode` | Page footer |
| `footerPosition` | `'inside' \| 'outside'` | Footer position |

## Form Display Mode

Control whether the form opens in a modal or drawer:

```tsx
// Default: modal
<CrudPage formMode="modal" ... />

// Drawer
<CrudPage formMode="drawer" formDrawerConfig={{ placement: 'right' }} ... />
```

## `CrudKit` Helpers

The `createCrudKit` return value provides:

- `useCrudStore` — access the full CRUD state
- `useSearchValues` — current search form values
- `useSelectedRows` — currently selected rows
- `ActionButtonGroup` — toolbar action buttons with CRUD context
- `OperationButtonGroup` — per-row operation buttons with CRUD context
