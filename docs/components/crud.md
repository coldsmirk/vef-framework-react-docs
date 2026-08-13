---
title: "Crud and CrudPage"
description: "The standard list + search + scene-form + delete CRUD abstraction, combining ProSearch, ProTable, and scene forms into one state model."
---

# Crud and CrudPage

`Crud` and `CrudPage` are the standard CRUD abstractions in VEF. They combine `ProSearch`, `ProTable`, scene forms, and delete mutations into one cohesive state model.

> **VEF-specific component.** Moved from `@vef-framework-react/starter` to `@vef-framework-react/components` in v2.1.6.

## When to Use

- Any standard list + create/edit/delete page.
- Use `CrudPage` when the page needs a full-page layout shell (it composes `Page` + `Crud`).
- Use `Crud` when embedding the CRUD block inside a custom layout.

## `createCrudKit`

Before using `Crud` or `CrudPage`, call `createCrudKit` to fix the page's generic types (`TRow`, `TSearchValues`, `TSceneFormValues`) into a reusable local toolkit:

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

`CrudBasicSceneFormValues<TCreate, TUpdate>` is a shorthand for the common `{ create: TCreate; update: TUpdate }` scene map — use it when the page only needs the built-in `create`/`update` scenes.

## `CrudPage` Usage

```tsx
import { ActionButton, CrudPage, Icon, OperationButton } from '@vef-framework-react/components';
import { EditIcon, TrashIcon } from 'lucide-react';

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
            color="danger"
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

`ActionButtonGroup` and `OperationButtonGroup` are context selectors into the CRUD store: `selector` picks the slice of `CrudState` the caller needs (typically `openForm`, `delete`, `refetchQuery`), and `children` is a render function that receives the selected value(s). This keeps toolbar and row actions from re-rendering on unrelated store changes.

## Form Scenes

`TSceneFormValues` is a map of scene key to form values type. The built-in scenes are `"create"` and `"update"`, but you can add custom scenes:

```ts
interface UserSceneFormValues {
  create: CreateUserForm;
  update: UpdateUserForm;
  resetPassword: ResetPasswordForm; // custom scene
}
```

`renderForm(scene)` receives the active scene key so a single form component can branch on it (e.g. a password field required only on `create`).

## Opening Forms and Form Display Mode

There is no `formMode` prop on `Crud`/`CrudPage`. The form's modal-vs-drawer mode (and drawer placement) are decided per invocation, by passing `mode`/`drawerConfig` to `openForm` — read from the CRUD store via the kit's `useCrudStore` (or the `ActionButtonGroup`/`OperationButtonGroup` selector, as above):

```tsx
const openForm = useCrudStore(state => state.openForm);

// Modal (default)
openForm({ scene: 'create' });

// Drawer
openForm({ scene: 'update', values: row, mode: 'drawer', drawerConfig: { placement: 'right' } });
```

`openForm` accepts:

| Option | Type | Description |
|--------|------|-------------|
| `scene` | `CrudFormScene<TSceneFormValues>` | The scene to open (required) |
| `values` | `Partial<TSceneFormValues[TScene]>` | Initial form values for this invocation (e.g. the row being edited), merged over `sceneDefaultFormValues` |
| `title` | `ReactNode` | Form title; defaults to `"创建"` / `"修改"` for the built-in scenes |
| `width` | `Length \| Partial<Record<Breakpoint, Length>>` | Form width — a fixed length or a responsive per-breakpoint map. Defaults to a responsive map from `95vw` (`xxs`) down to `40vw` (`xxl`) |
| `mode` | `CrudFormMode` | `"modal"` (default) or `"drawer"` |
| `drawerConfig` | `CrudFormDrawerConfig` | Drawer-only options: `placement` (default `"right"`) |

## Behavior Notes

- After `delete` or `deleteMany` succeed, `Crud` automatically clears the internal selection state — toolbar buttons that depend on `selectedRows` re-disable on their own.
- Closing the scene form (via the store's `closeForm`, the modal/drawer close icon, or programmatically) resets the form state, so the next `openForm` starts from fresh values — edits made in a previous invocation are discarded.
- `formActionsRenderers[scene]` receives `(formApi, defaults)`, where `defaults` exposes the framework's default `submitButton` and `resetButton` so custom action layouts can keep the standard buttons:

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

### Key Props (`Crud` and `CrudPage`)

`Crud` (and `CrudPage`, which wraps it) accepts a discriminated union on `isPaginated`: when `true` or omitted, `queryFn` must return a `PaginationResult<TRow>`; when `false`, it must return `TRow[]`.

| Prop | Type | Description |
|------|------|-------------|
| `queryFn` | `QueryFunction<PaginationResult<TRow> \| TRow[], ...>` | List query function; return shape depends on `isPaginated` |
| `isPaginated` | `boolean` | Enable/disable pagination (default: `true`) |
| `tableColumns` | `TableColumn<TRow>[]` | Column definitions |
| `rowKey` | `DeepKeys<TRow> \| (row) => Key` | Row key extractor |
| `storageKey` | `string` | Persists search state to `sessionStorage`; give each `Crud` instance a unique key |
| `tableSize` | `'large' \| 'medium' \| 'small'` | Table density (`'middle'` is a deprecated alias for `'medium'`) |
| `columnSettings` | `ColumnSettingsConfig \| false` | Column visibility settings (default: `{}`) |
| `operationColumn` | `OperationColumnConfig<TRow>` | Per-row action column |
| `showSequenceColumn` | `boolean` | Show row number column (default: `true`) |
| `virtual` | `boolean` | Enable virtual scrolling (default: `false`) |
| `striped` | `boolean` | Zebra-striped rows (default: `false`) |
| `onRowClick` | `(row, index, event) => void` | Row click handler (ignored inside the operation column) |
| `title` | `ReactNode` | Title above the table |
| `summary` | `ReactNode` | Content below the table |
| `rowSelection` | `RowSelectionConfig<TRow> \| true` | Row selection config |
| `defaultSearchValues` | `Partial<TSearchValues>` | Initial search form values |
| `basicSearch` | `ReactNode` | Inline search fields |
| `advancedSearch` | `ReactNode` | Advanced (collapsible) search fields |
| `sceneDefaultFormValues` | `PartialDeep<TSceneFormValues>` | Default form values per scene |
| `formComponent` | `ElementType` | Element type for the scene form's inner wrapper (default: `"div"`) |
| `formLayout` | `FormLayout` | Layout of the form items inside the scene form modal/drawer — `layout`, `labelAlign`, `labelWidth` (see [Form](./form.md)). Defaults to the horizontal layout |
| `renderForm` | `(scene) => ReactNode` | Form content per scene |
| `beforeFormSubmit` | `(scene, values) => Awaitable<values>` | Transform values before submit |
| `afterFormSubmit` | `(scene, values, result) => Awaitable<void>` | Called after a successful submit |
| `formMutationFns` | `CrudFormMutationFns<TSceneFormValues>` | Submit mutation per scene |
| `formActionsRenderers` | `CrudFormActionsRenderers<TSceneFormValues>` | Custom footer action renderer per scene, receives `(formApi, defaults)` |
| `deleteMutationFn` | `MutationFunction<ApiResult<unknown>, TRow>` | Single-row delete mutation, wired to the store's `delete` action |
| `deleteManyMutationFn` | `MutationFunction<ApiResult<unknown>, TRow[]>` | Batch delete mutation, wired to the store's `deleteMany` action |
| `mutationMeta` | `(mutationKey: string) => MutationMeta \| undefined` | Mutation meta provider (e.g. query invalidation), called with each mutation's key |
| `toolbarActions` | `ReactNode` | Toolbar action buttons |
| `queryEnabled` | `(params?) => boolean` | Whether the list query should run |
| `queryParams` | `TParams` | Additional query parameters that trigger a refetch when changed |

### `CrudPage`-only Props

`CrudPage` adds `Page`'s layout props on top of every `Crud` prop above:

| Prop | Type | Description |
|------|------|-------------|
| `leftAside` | `ReactNode` | Left aside panel |
| `leftAsideWidth` | `AsideWidth` | Left aside width |
| `rightAside` | `ReactNode` | Right aside panel |
| `rightAsideWidth` | `AsideWidth` | Right aside width |
| `header` | `ReactNode` | Page header |
| `headerClassName` | `string` | Header class name |
| `headerPosition` | `'inside' \| 'outside'` | Header position (default: `"inside"`) |
| `footer` | `ReactNode` | Page footer |
| `footerClassName` | `string` | Footer class name |
| `footerPosition` | `'inside' \| 'outside'` | Footer position (default: `"inside"`) |

### `createCrudKit` / `CrudKit`

`createCrudKit<TRow, TSearchValues, TSceneFormValues>()` returns a `CrudKit`:

| Helper | Purpose |
| --- | --- |
| `useCrudStore` | Typed hook to read (and select from) the full CRUD state, including `openForm`, `closeForm`, `delete`, `deleteMany`, `refetchQuery`, `searchValues`, `selectedRowKeys`/`selectedRows` |
| `useSearchValues` | Read the current search form values |
| `useSelectedRows` | Read the currently selected row models |
| `ActionButtonGroup` | Toolbar-level button group; `selector` + render-prop `children` into the CRUD store |
| `OperationButtonGroup` | Row-level operation button group; same selector/children pattern |

### CRUD Types

| Type | Purpose |
| --- | --- |
| `CrudBasicFormScene` | The built-in scene literal: `"create" \| "update"` |
| `CrudFormScene<TSceneFormValues>` | The scene key type, derived from `TSceneFormValues` |
| `CrudBasicSceneFormValues<TCreate, TUpdate>` | Shorthand for `{ create: TCreate; update: TUpdate }` |
| `CrudFormMutationFns<TSceneFormValues>` | Map of scene key to its submit `MutationFunction` |
| `CrudFormActionsRenderers<TSceneFormValues>` | Map of scene key to a custom footer action renderer |
| `CrudFormMode` | `"modal" \| "drawer"` — passed to `openForm({ mode })`, not a component prop |
| `CrudFormDrawerConfig` | `{ placement?: DrawerProps["placement"] }` — passed to `openForm({ drawerConfig })` |
| `CrudProps<TRow, TSearchValues, TSceneFormValues, TParams>` | `Crud` props (discriminated union on `isPaginated`) |
| `CrudPageProps<TRow, TSearchValues, TSceneFormValues, TParams>` | `CrudPage` props (`CrudProps` + `Page` layout props) |
| `CrudKit<TRow, TSearchValues, TSceneFormValues>` | Return type of `createCrudKit()` |

## Best Practices

- Call `createCrudKit()` once per page (typically in a `helpers/index.ts` colocated with the route) and export the aliased kit — don't re-derive generics inline at every usage site.
- Drive toolbar and row actions through `ActionButtonGroup`/`OperationButtonGroup` with a `selector`, rather than reading the whole store, to avoid unrelated re-renders.
- Use `renderForm(scene)` to branch form layout by scene instead of maintaining separate create/update form components.
- Reach for `Crud` (without `Page`) when embedding CRUD inside an existing custom layout; use `CrudPage` for standalone routes.
