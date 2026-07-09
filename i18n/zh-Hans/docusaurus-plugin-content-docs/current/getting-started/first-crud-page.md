---
title: 你的第一个 CRUD 页面
description: 使用 CrudPage 和 createCrudKit，把快速开始中的骨架变成一个可用的页面——搜索、表格、创建/编辑表单和删除。
---

# 你的第一个 CRUD 页面

[快速开始](./quick-start.md)最后停在了一个静态页面。几乎没有真实应用会止步于此——每个 VEF 项目接下来都需要一个能列出记录、让用户搜索，并让用户创建、编辑和删除记录的页面。

本页要构建的正是这样一个页面: 一个带有搜索框、表格、创建/编辑表单，以及单条和批量删除功能的**产品（Products）**页面。它组合了来自 `@vef-framework-react/components` 的四个构建块:

- `apiClient.createQueryFn()` / `createMutationFn()` —— 页面调用的领域 API 函数
- `createCrudKit()` —— 页面级、强类型的一组 hooks 和组件
- `useFormContext()` + `AppField` —— 搜索框和创建/编辑表单
- `CrudPage` —— 把上面所有内容组装成一个页面的组件

读完本页，你将掌握 VEF 应用中每一个"列表+表单"页面所使用的模式，并得到一个形如[项目结构](./project-structure.md)中所描述的页面目录。

下面的代码通过 `~api` 和 `~apis` 路径别名而不是相对路径来导入共享模块——这是当页面目录层级超过一到两层之后所使用的约定。（完整的别名列表见[项目规范](../advanced/project-conventions.md)——这是留待以后阅读的可选深入内容，不是跟上本页所必需的。）`defineViteConfig()` 已经解析了 `tsconfig.json` 中的路径映射，所以只需要在 `tsconfig.json` 中添加别名即可:

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

## 第一步: 定义领域 API 函数

每个领域都拥有自己在 `src/apis/` 下的文件。该文件保存实体类型、请求参数类型，以及 query/mutation 函数——不包含其他内容。

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

`findProductPage` 使用 `extractQueryParams()` 把 `CrudPage` 发送的组合查询输入（搜索值 + 分页 + 排序）拆分成后端所期望的各个部分。这一模式在[数据请求](../guide/data-fetching.md)中有完整介绍。

## 第二步: 创建页面级 CRUD 工具集

`createCrudKit()` 把页面的行（row）、搜索（search）和表单场景（form-scene）类型锁定成一个可复用的强类型工具集。每个 CRUD 页面都定义自己的工具集，通常放在路由旁边的 `helpers/` 文件夹中。

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

`CrudBasicSceneFormValues<TCreate, TUpdate>` 是针对最常见情形——恰好只有 `create` 和 `update` 两个表单场景——的简写形式。第五步中的路由只用到了 `ProductOperationButtonGroup` 和 `ProductActionButtonGroup`；其余三个 hook 是为那些需要在按钮组之外获取搜索值或已选中行的页面级组件准备的（例如一个结果汇总组件）。

## 第三步: 构建搜索字段

搜索区域只是一个绑定到 `ProductSearch` 的表单。`CrudPage` 会渲染它，并自动把它的值传给 `queryFn`。

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

`useFormContext()` 读取的是 `CrudPage` 已经创建好的表单实例——这里没有调用 `useForm()`。这一拆分在[表单](../guide/forms.md)中有详细介绍。

## 第四步: 构建表单

创建/编辑表单是同一类组件，绑定到创建/更新参数类型。

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

## 第五步: 组装页面

所有内容都在 `route.tsx` 中汇聚在一起: 表格列，以及一个连接了 API 函数、搜索和表单组件，以及第二步中 CRUD 工具集的 `CrudPage`。

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

有几点值得注意:

- `renderForm={scene => <Form scene={scene} />}` 为 `create` 和 `update` 渲染同一个表单组件；`CrudPage` 会告诉它当前处于哪个场景。
- `sceneDefaultFormValues={{ create: { isActive: true } }}` 会把新产品预填为激活状态，而不影响 update 场景。
- `ProductOperationButtonGroup` 和 `ProductActionButtonGroup` 使用 `selector` 只拉取每个按钮组所需要的 CRUD 状态（`openForm`、`delete`、`deleteMany`、`refetchQuery`、`selectedRows`、`isQueryFetching`）——这正是第二步中那个强类型工具集的实际用法。
- 单条删除或批量删除成功后，`CrudPage` 会自动清空行选中状态；"Delete Selected" 按钮会因为通过同一个 selector 读取 `selectedRows` 而自动重新变为禁用状态。

现在该路由可以在已认证布局下通过 `/products` 访问。`CrudPage` 及其属性的完整说明见 [CRUD 页面](../guide/crud.md)；它所组合的表格和表单部分分别在[表格](../guide/tables.md)和[表单](../guide/forms.md)中有详细介绍。

## 第六步: 这些文件放在哪里

上面的四个文件构成了一个页面目录:

```text
pages/_layout/products/
  route.tsx
  helpers/
    index.ts
  components/
    basic-search.tsx
    form.tsx
```

这与[项目结构](./project-structure.md)中为每个 CRUD 页面描述的拆分方式完全一致: `route.tsx` 只组装页面，`components/` 存放页面级 UI，`helpers/` 存放页面级 CRUD 工具集。这里的任何内容都不需要移动到共享目录——除非其他页面也开始复用它，否则它就一直留在 `products` 页面本地。

## 你刚刚构建了什么

四个小文件，各自只承担一项职责，组合成了这样一个页面:

- 获取一个支持搜索过滤、分页的产品列表
- 让用户通过同一个表单组件创建和编辑产品
- 删除单条记录或一批选中的记录，并带有确认步骤
- 持久化列设置，并让工具栏/行操作自动与 CRUD 状态保持同步

这就是 VEF 应用中大多数业务页面的形态。新页面通常只意味着一个新的 `apis/*` 文件、一个新的页面目录，以及同样的四件套组合——而不是新的抽象。

## 后续阅读

1. [工程配置](./configuration.md)
2. [项目结构](./project-structure.md)
3. [表单](../guide/forms.md) —— 完整的字段目录和校验模式
4. [表格](../guide/tables.md) —— `Table` 与 `ProTable` 的区别，以及各自的适用场景
5. [CRUD 页面](../guide/crud.md) —— 完整的 `CrudPage` 属性参考和行为说明
