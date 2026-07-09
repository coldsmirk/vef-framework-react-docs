---
title: Your First CRUD Page
description: Turn the Quick Start skeleton into a working page — search, a table, a create/edit form, and delete — using CrudPage and createCrudKit.
---

# Your First CRUD Page

[Quick Start](./quick-start.md) ended with one static page. Almost no real application stops there — the next thing every VEF project needs is a page that lists records, lets a user search them, and lets a user create, edit, and delete them.

This page builds exactly that: a **Products** page with a search box, a table, a create/edit form, and single and batch delete. It composes four building blocks from `@vef-framework-react/components`:

- `apiClient.createQueryFn()` / `createMutationFn()` — the domain API functions the page calls
- `createCrudKit()` — a page-local, strongly typed set of hooks and components
- `useFormContext()` + `AppField` — the search box and the create/edit form
- `CrudPage` — the component that wires all of the above into one page

By the end, you will have the pattern used by every list-and-form page in a VEF application, and a page directory shaped like the one in [Project Structure](./project-structure.md).

The code below imports shared modules through the `~api` and `~apis` path aliases instead of relative paths — the convention used once a page directory is more than one or two levels deep. (The full alias list lives in [Project Conventions](../advanced/project-conventions.md) — an optional deep dive for later, not required to follow this page.) `defineViteConfig()` already resolves `tsconfig.json` path mappings, so only `tsconfig.json` needs the aliases added:

```json title="tsconfig.json"
{
  "compilerOptions": {
    "paths": {
      "~api": ["./src/api"],
      "~apis": ["./src/apis"]
    }
  }
}
```

## Step 1: Define the Domain API Functions

Every domain gets its own file under `src/apis/`. It holds the entity type, the request parameter types, and the query/mutation functions — nothing else.

```ts title="src/apis/products.ts"
import type { PaginatedQueryParams } from "@vef-framework-react/components";

import { extractQueryParams } from "@vef-framework-react/starter";

import { apiClient } from "~api";

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  isActive: boolean;
  createdAt: string;
}

export interface ProductSearch {
  keyword?: string;
}

export interface ProductCreateParams {
  name: string;
  category: string;
  price: number;
  isActive: boolean;
}

export interface ProductUpdateParams extends ProductCreateParams {
  id: string;
}

export const findProductPage = apiClient.createQueryFn(
  "find_product_page",
  http => async (queryParams: PaginatedQueryParams<ProductSearch>) => {
    const { params, pagination } = extractQueryParams(queryParams);

    const result = await http.post("/api/product/page", {
      data: { ...params, pagination }
    });

    return result.data;
  }
);

export const createProduct = apiClient.createMutationFn(
  "create_product",
  http => (params: ProductCreateParams) => http.post("/api/product/create", { data: params })
);

export const updateProduct = apiClient.createMutationFn(
  "update_product",
  http => (params: ProductUpdateParams) => http.post("/api/product/update", { data: params })
);

export const deleteProduct = apiClient.createMutationFn(
  "delete_product",
  http => (row: Product) => http.post("/api/product/delete", { data: { id: row.id } })
);

export const deleteProducts = apiClient.createMutationFn(
  "delete_products",
  http => (rows: Product[]) => http.post("/api/product/delete-batch", { data: { ids: rows.map(row => row.id) } })
);
```

`findProductPage` uses `extractQueryParams()` to split the combined query input `CrudPage` sends (search values + pagination + sort) into the pieces the backend expects. This pattern is covered in full in [Data Fetching](../guide/data-fetching.md).

## Step 2: Create the Page-Local CRUD Kit

`createCrudKit()` locks the page's row, search, and form-scene types into a reusable, typed toolkit. Every CRUD page defines its own kit, usually next to the route in a `helpers/` folder.

```ts title="src/pages/_layout/products/helpers/index.ts"
import type { CrudBasicSceneFormValues } from "@vef-framework-react/components";
import type { Product, ProductCreateParams, ProductSearch, ProductUpdateParams } from "~apis";

import { createCrudKit } from "@vef-framework-react/components";

export type ProductFormSceneValues = CrudBasicSceneFormValues<ProductCreateParams, ProductUpdateParams>;

export const {
  useCrudStore: useProductPageStore,
  useSearchValues: useProductSearchValues,
  useSelectedRows: useProductSelectedRows,
  OperationButtonGroup: ProductOperationButtonGroup,
  ActionButtonGroup: ProductActionButtonGroup
} = createCrudKit<Product, ProductSearch, ProductFormSceneValues>();
```

`CrudBasicSceneFormValues<TCreate, TUpdate>` is a shorthand for the common case of exactly two form scenes, `create` and `update`. The route in Step 5 only reaches for `ProductOperationButtonGroup` and `ProductActionButtonGroup` — the other three hooks exist for page-local components that need search values or the selected rows outside a button group (a results summary, for example).

## Step 3: Build the Search Field

The search area is just a form bound to `ProductSearch`. `CrudPage` renders it and feeds its values into `queryFn` automatically.

```tsx title="src/pages/_layout/products/components/basic-search.tsx"
import type { ProductSearch } from "~apis";

import { useFormContext } from "@vef-framework-react/components";

export function BasicSearch() {
  const { AppField } = useFormContext<ProductSearch>();

  return (
    <AppField name="keyword">
      {field => <field.Input noWrapper placeholder="Search by name" />}
    </AppField>
  );
}
```

`useFormContext()` reads the form instance `CrudPage` already created — there is no `useForm()` call here. This split is covered in [Forms](../guide/forms.md).

## Step 4: Build the Form

The create/edit form is the same kind of component, bound to the create/update parameter types.

```tsx title="src/pages/_layout/products/components/form.tsx"
import type { CrudBasicFormScene } from "@vef-framework-react/components";
import type { ProductCreateParams, ProductUpdateParams } from "~apis";

import { Grid, useFormContext } from "@vef-framework-react/components";
import { z } from "@vef-framework-react/shared";

export interface FormProps {
  scene: CrudBasicFormScene;
}

const categoryOptions = [
  { label: "Electronics", value: "electronics" },
  { label: "Apparel", value: "apparel" },
  { label: "Other", value: "other" }
];

const validators = {
  name: z.string("Required").min(2, "At least 2 characters").max(64, "At most 64 characters"),
  category: z.string("Required"),
  price: z.number("Required").min(0, "Must be zero or more"),
  isActive: z.boolean("Required")
};

// `scene` is unused here because every field is identical between create and
// update. When a field genuinely differs by scene (a password required only
// on create, for example), branch on it — see Guides -> CRUD Pages.
export function Form({ scene: _scene }: FormProps) {
  const { AppField } = useFormContext<ProductCreateParams | ProductUpdateParams>();

  return (
    <Grid columnGap="small">
      <Grid.Item span={12}>
        <AppField name="name" validators={{ onBlur: validators.name }}>
          {field => <field.Input required label="Name" />}
        </AppField>
      </Grid.Item>

      <Grid.Item span={12}>
        <AppField name="category" validators={{ onChange: validators.category }}>
          {field => <field.Select required label="Category" options={categoryOptions} />}
        </AppField>
      </Grid.Item>

      <Grid.Item span={12}>
        <AppField name="price" validators={{ onBlur: validators.price }}>
          {field => <field.InputNumber required label="Price" min={0} />}
        </AppField>
      </Grid.Item>

      <Grid.Item span={12}>
        <AppField name="isActive" validators={{ onChange: validators.isActive }}>
          {field => (
            <field.Bool
              required
              falseLabel="Inactive"
              label="Status"
              trueLabel="Active"
              variant="radio"
            />
          )}
        </AppField>
      </Grid.Item>
    </Grid>
  );
}
```

## Step 5: Assemble the Page

Everything comes together in `route.tsx`: the table columns, and a `CrudPage` wired to the API functions, the search and form components, and the CRUD kit from Step 2.

```tsx title="src/pages/_layout/products/route.tsx"
import type { TableColumn } from "@vef-framework-react/components";
import type { Product } from "~apis";

import { createFileRoute } from "@tanstack/react-router";
import { ActionButton, CrudPage, Icon, OperationButton, Tag } from "@vef-framework-react/components";
import { EditIcon, PlusIcon, TrashIcon } from "lucide-react";
import { createProduct, deleteProduct, deleteProducts, findProductPage, updateProduct } from "~apis";

import { BasicSearch } from "./components/basic-search";
import { Form } from "./components/form";
import { ProductActionButtonGroup, ProductOperationButtonGroup } from "./helpers";

export const Route = createFileRoute("/_layout/products")({
  component: RouteComponent
});

function renderIsActive(value: boolean) {
  return value
    ? <Tag color="success">Active</Tag>
    : <Tag color="default">Inactive</Tag>;
}

const tableColumns: Array<TableColumn<Product>> = [
  { title: "Name", dataIndex: "name", width: 200 },
  { title: "Category", dataIndex: "category", width: 140 },
  { title: "Price", dataIndex: "price", width: 120, align: "right" },
  { title: "Status", dataIndex: "isActive", width: 100, align: "center", render: renderIsActive },
  { title: "Created At", dataIndex: "createdAt", width: 180 }
];

function RouteComponent() {
  return (
    <CrudPage
      rowSelection
      basicSearch={<BasicSearch />}
      columnSettings={{ storageKey: "page.products" }}
      deleteManyMutationFn={deleteProducts}
      deleteMutationFn={deleteProduct}
      queryFn={findProductPage}
      renderForm={scene => <Form scene={scene} />}
      rowKey="id"
      tableColumns={tableColumns}
      formMutationFns={{
        create: createProduct,
        update: updateProduct
      }}
      sceneDefaultFormValues={{
        create: { isActive: true }
      }}
      operationColumn={{
        render(row) {
          return (
            <ProductOperationButtonGroup selector={state => [state.openForm, state.delete, state.refetchQuery] as const}>
              {([openForm, deleteRow, refetchQuery]) => (
                <>
                  <OperationButton
                    color="primary"
                    icon={<Icon component={EditIcon} />}
                    onClick={() => openForm({ scene: "update", values: row })}
                  >
                    Edit
                  </OperationButton>

                  <OperationButton
                    confirmable
                    color="danger"
                    confirmDescription="Delete this product?"
                    icon={<Icon component={TrashIcon} />}
                    onClick={async () => {
                      try {
                        await deleteRow(row);
                        refetchQuery();
                      } catch {}
                    }}
                  >
                    Delete
                  </OperationButton>
                </>
              )}
            </ProductOperationButtonGroup>
          );
        }
      }}
      toolbarActions={(
        <ProductActionButtonGroup selector={state => [state.openForm, state.isQueryFetching, state.selectedRows, state.deleteMany, state.refetchQuery] as const}>
          {([openForm, isFetching, selectedRows, deleteMany, refetchQuery]) => (
            <>
              <ActionButton
                icon={<Icon component={PlusIcon} />}
                type="primary"
                onClick={() => openForm({ scene: "create" })}
              >
                New Product
              </ActionButton>

              <ActionButton
                confirmable
                danger
                confirmDescription="Delete the selected products?"
                confirmMode="dialog"
                disabled={isFetching || selectedRows.length === 0}
                icon={<Icon component={TrashIcon} />}
                onClick={async () => {
                  try {
                    await deleteMany(selectedRows);
                    refetchQuery();
                  } catch {}
                }}
              >
                Delete Selected
              </ActionButton>
            </>
          )}
        </ProductActionButtonGroup>
      )}
    />
  );
}
```

A few things worth noticing:

- `renderForm={scene => <Form scene={scene} />}` renders the same form component for both `create` and `update`; `CrudPage` tells it which scene is active.
- `sceneDefaultFormValues={{ create: { isActive: true } }}` pre-fills new products as active, without touching the update scene.
- `ProductOperationButtonGroup` and `ProductActionButtonGroup` use a `selector` to pull only the CRUD state each button group needs (`openForm`, `delete`, `deleteMany`, `refetchQuery`, `selectedRows`, `isQueryFetching`) — this is the typed kit from Step 2 in action.
- After a delete or batch delete succeeds, `CrudPage` clears the row selection automatically; the "Delete Selected" button re-disables itself because it reads `selectedRows` through the same selector.

The route is now reachable at `/products` under the authenticated layout. `CrudPage` and its props are covered in full in [CRUD Pages](../guide/crud.md); the table and form pieces it composes are covered in [Tables](../guide/tables.md) and [Forms](../guide/forms.md).

## Step 6: Where This File Lives

The four files above form one page directory:

```text
pages/_layout/products/
  route.tsx
  helpers/
    index.ts
  components/
    basic-search.tsx
    form.tsx
```

This is the same split [Project Structure](./project-structure.md) describes for every CRUD page: `route.tsx` only assembles the page, `components/` holds page-local UI, and `helpers/` holds the page-local CRUD kit. Nothing here needs to move to a shared directory — it stays local to the `products` page unless another page starts reusing it.

## What You Just Built

Four small files, each with one job, add up to a page that:

- fetches a search-filtered, paginated product list
- lets a user create and edit products through the same form component
- deletes a single row or a batch of selected rows, with a confirmation step
- persists column settings and keeps toolbar/row actions in sync with CRUD state automatically

This is the shape of most business pages in a VEF application. New pages usually mean a new `apis/*` file, a new page directory, and the same four-piece composition — not new abstractions.

## Next Reading

1. [Configuration](./configuration.md)
2. [Project Structure](./project-structure.md)
3. [Forms](../guide/forms.md) — the full field catalog and validation patterns
4. [Tables](../guide/tables.md) — `Table` vs `ProTable`, and when to reach for each
5. [CRUD Pages](../guide/crud.md) — the complete `CrudPage` prop reference and behavior notes
