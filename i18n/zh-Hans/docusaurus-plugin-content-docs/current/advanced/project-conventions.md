---
title: 应用项目规范
description: 每个 VEF 应用项目都必须遵循的强制性命名、放置和文件组织规则。
---

# 应用项目规范

本页定义了 VEF 应用项目的强制性规范。它适用于使用该框架构建的应用代码库，包括像 `playground` 这样组织的项目。它不定义 monorepo 内部框架包开发的规范。

:::danger
所有新的应用代码必须遵循本页规范。当修改一个已有区域时，被改动的文件必须在编辑范围内保持合规。这些规则不是可选的建议。
:::

:::tip
先阅读[项目结构](../getting-started/project-structure.md)了解基础目录地图。再阅读本页了解每个应用项目必须遵循的命名规则、放置规则和禁止使用的模式。
:::

## 适用范围与执行方式

- 这些规则只适用于使用 VEF Framework React 构建的应用项目。
- 应用代码必须使用框架导出的 API。禁止依赖框架内部实现或私有包源文件。
- 本页未定义的目录、文件或命名模式，默认情况下禁止被引入为项目级约定。
- 页面级的关注点必须保持局部，除非它被跨多个路由领域复用。
- 共享应用代码的提升必须是有意为之的决定。禁止仅仅为了减少一两个相对路径导入，就把代码移动到全局目录。

## 标准应用布局

每个应用项目必须从以下 `src/` 布局开始:

```text
src/
  api/
    index.ts
  apis/
    auth/
    md/
    pmr/
    sys/
    index.ts
  helpers/
    config.ts
    index.ts
  hooks/
    index.ts
  pages/
    __root.ts
    _common/
      access-denied.ts
      login.ts
    _layout/
      route.ts
      index/
        route.tsx
        styles/
          index.module.scss
      auth/
      md/
      pmr/
      sys/
  router/
    context.ts
    index.ts
    router.gen.ts
  styles/
    index.scss
  types/
    config.ts
    index.ts
  main.ts
```

### 顶层目录契约

| 目录 | 必须包含 | 禁止包含 |
| --- | --- | --- |
| `src/api` | 应用级 API 客户端设置和共享请求包装器 | 特定领域的业务 API |
| `src/apis` | 按领域分组的业务领域 API 文件 | 页面组件、路由模块、页面状态 |
| `src/pages` | 路由入口和页面级实现 | 跨项目的工具集合 |
| `src/router` | 路由上下文、生成的路由入口、路由导出 | 页面 UI、API 定义 |
| `src/types` | 仅限真正应用级的类型 | 默认存放的每个领域实体类型 |
| `src/hooks` | 应用级的可复用 hooks | 仅被单个页面或单个领域使用的 hooks |
| `src/helpers` | 应用级的非 React helper | 页面级 helper 或领域业务逻辑 |
| `src/styles` | 仅限全局样式表 | 页面级的 CSS Modules |

### 根文件契约

- `src/main.ts` 必须只负责启动应用、导入全局样式，并调用 `createApp().render()`。
- `src/pages/__root.ts` 必须只定义根路由。
- `src/pages/_layout/route.ts` 必须只定义共享布局路由。
- `src/pages/_common/*` 必须包含框架级的通用路由，例如登录页和拒绝访问页。
- `src/router/index.ts` 必须是路由导出入口。
- `src/router/router.gen.ts` 是生成产物，禁止被手动编辑。

## 路由与页面目录契约

`pages/` 目录必须与路由层级保持镜像对应。

### 路由入口规则

- 每个可路由的页面必须拥有自己的页面目录。
- 每个页面目录必须恰好暴露一个名为 `route.tsx` 或 `route.ts` 的路由入口文件。
- 传给 `createFileRoute()` 的路由路径必须与物理页面层级保持一致。
- 当框架已经定义了 `INDEX_ROUTE_ID`、`LOGIN_ROUTE_ID`、`ACCESS_DENIED_ROUTE_ID` 等路由 id 时，必须使用这些框架提供的路由 id。

### `route.tsx` 职责规则

`route.tsx` 必须只做以下事情:

- 声明路由
- 组装 `Page`、`CrudPage` 或其他页面外壳
- 连接页面级组件
- 当页面拥有局部状态时，连接页面级的 store provider
- 把页面级 API 函数和 helper 工厂接入页面外壳

`route.tsx` 禁止做以下事情:

- 内联定义大型表单字段树
- 内联定义大型搜索表单树
- 承载冗长的弹窗实现
- 包含多个互不相关的 helper 函数
- 变成整个页面的通用倾倒文件

### 页面级文件夹契约

一个典型的页面目录必须遵循以下拆分方式:

```text
pages/_layout/auth/user/
  route.tsx
  components/
    basic-search.tsx
    form.tsx
  helpers/
    index.ts
```

请遵循以下放置规则:

- `components/` 必须只包含页面级的 React UI 部件。
- `helpers/` 必须包含页面级的 helper 工厂、场景类型、列构建器和页面级工具胶水代码。
- `styles/` 必须只包含页面级的样式文件。
- `store.ts` 可以直接存在于页面目录下，但仅限于该页面拥有专属局部 store 的情况。
- 除非跨多个路由领域被复用，否则页面级关注点禁止被移动到 `src/helpers`、`src/hooks` 或 `src/types`。

### 何时允许使用 `store.ts`

只有当以下所有条件都成立时，才允许使用 `store.ts`:

- 该状态只属于一个页面
- 该状态不是可复用的框架级抽象
- 该页面需要专属的 provider 或局部事件协调

如果不满足这些条件，请不要创建页面 store。

## API 层契约

API 层分为两个层级，它们必须保持分离。

### `src/api/`

`src/api/` 专门用于应用级 API 基础设施。

- `src/api/index.ts` 必须创建并导出应用的 `apiClient`。
- `src/api/` 可以存放共享的请求信封构建器或通用请求 helper（例如 `src/api/request.ts`）。
- `src/api/` 禁止包含诸如 `user.ts`、`role.ts`、`department.ts` 之类的领域资源。

### `src/apis/`

`src/apis/` 专门用于领域 API，并且必须按业务领域分组:

```text
apis/
  auth/
    auth.ts
    menu.ts
    role.ts
    user.ts
  sys/
    app.ts
    audit-log.ts
    config.ts
  md/
    department.ts
    staff.ts
  pmr/
    document-type.ts
```

每个 API 文件必须遵循以下规则:

- 一个文件必须代表一个资源或一个紧密相关的聚合
- 领域实体类型和请求参数类型默认必须保留在对应的 API 文件中
- query 和 mutation 函数必须从它们所服务的领域类型所在的同一个文件导出
- 页面组件、路由文件和页面 store 禁止被导入到 API 文件中

### API 命名规则

API 导出必须使用"动词在前、资源明确"的命名方式。

| 操作 | 必需的命名模式 | 示例 |
| --- | --- | --- |
| 分页查询 | `find<Resource>Page` | `findUserPage` |
| 列表/详情查询 | `find<Resource>` 或一个明确的查询名 | `findConfigsByGroup` |
| 创建 mutation | `create<Resource>` | `createUser` |
| 更新 mutation | `update<Resource>` | `updateUser` |
| 保存 mutation | `save<Resource>` | `saveConfigs` |
| 单条删除 | `delete<Resource>` | `deleteUser` |
| 批量删除 | `delete<Resources>` 或一个明确的复数名 | `deleteUsers` |
| 认证刷新 | `refresh<AuthOrToken>` | `refreshAuth` |

### API 导入规则

- 页面代码必须通过 `~apis` 导入应用 API。
- 全局 API 基础设施必须通过 `~api` 导入。
- 当别名导出已经可用时，禁止使用从页面代码深入 `src/apis/**` 的相对路径导入。

## 类型、hooks、helper 与 store 的放置

### 类型放置规则

- `src/types/` 仅保留给真正应用级的类型，例如配置、存储或其他跨域契约。
- 领域实体类型、请求参数类型和响应类型必须存放在 `src/apis/` 下对应的 API 文件中。
- 页面特定的场景值、helper 类型和面向 store 的类型必须保留在页面目录中，通常放在 `helpers/` 下或与 `store.ts` 放在一起。
- `src/types/` 禁止变成项目中每一个接口的默认存放地。

### Hook 放置规则

- `src/hooks/` 仅保留给跨多个路由领域复用的 hooks。
- 仅被单个页面使用的 hook 必须保留在该页面目录下。
- 仅被单个领域使用的 hook 必须保留在该领域区域下，直到它变为跨领域使用。
- `src/hooks/` 必须通过 `src/hooks/index.ts` 导出公共应用 hooks。

### Helper 放置规则

- `src/helpers/` 仅保留给应用级的非 React helper，例如配置访问和通用文本 helper。
- 诸如 `createCrudKit()` 绑定之类的页面级 helper 工厂必须保留在该页面的 `helpers/` 目录下。
- 领域业务逻辑禁止被隐藏在 `src/helpers/` 中。

## 命名规则

### 目录和文件命名

- 目录必须使用 `kebab-case`。
- 文件必须使用 `kebab-case`。
- 唯一允许在常规 kebab-case 之外的保留文件名是框架入口名称，例如 `__root.ts`、`route.ts`、`route.tsx`、`store.ts` 和 barrel 文件 `index.ts`。
- 当页面拥有专属样式文件夹时，页面样式入口文件必须使用 `styles/index.module.scss`。

### 导出命名

- React 组件必须使用 `PascalCase`。
- Hooks 必须使用 `camelCase` 并以 `use` 开头。
- 当 store provider 渲染 context 或 store 边界时，必须使用 `PascalCase` 并以 `Provider` 结尾。
- Store hooks 必须使用 `useXxxStore` 或 `useXxxPageStore`。
- 类型和接口必须使用 `PascalCase`。
- 常量仅当它们是真正的常量时必须使用 `UPPER_SNAKE_CASE`；否则使用 `camelCase`。

### Barrel 文件规则

- `index.ts` 可以仅作为公共文件夹入口或 barrel 导出文件使用。
- `index.ts` 禁止隐藏一个页面路由的主要实现。
- 诸如 `src/apis/index.ts`、`src/helpers/index.ts`、`src/hooks/index.ts` 和 `src/types/index.ts` 之类的全局 barrel 必须只重新导出公共应用模块。

### 导入路径规则

- 共享应用模块必须通过诸如 `~api`、`~apis`、`~helpers`、`~router` 和 `~types` 之类的别名导入。
- 页面级模块必须使用相对路径导入。
- 当已经存在别名时，禁止使用回溯到应用根目录的长相对路径导入。

## 样式和资源放置

### 样式规则

- 全局样式必须存放在 `src/styles/index.scss` 中。
- 页面级样式必须保留在所属页面目录内。
- CSS Modules 必须是页面级样式的默认选择。
- 设计取值必须使用框架 token、CSS 变量或主题 hook。当已经存在导出的框架 token 时，原始主题十六进制值禁止散落在页面样式中。

### 资源规则

- 通过 URL 引用的应用级静态资源必须存放在 `public/` 中。
- 页面级资源必须保留在所属页面或功能附近。
- `public/` 禁止变成仅被单个页面使用的资源倾倒文件夹。

## 禁止使用的模式

以下模式在 VEF 应用项目中是被禁止的:

- 创建诸如 `src/services`、`src/utils`、`src/stores` 或 `src/common` 之类的通用顶层倾倒文件夹，作为不相关代码的默认存放地
- 为页面级 UI 创建顶层 `src/components` 文件夹
- 在一个 API 文件中放置多个业务领域
- 把仅供页面使用的 helper 放在 `src/helpers` 中
- 把仅供页面使用的 hook 放在 `src/hooks` 中
- 在没有跨项目需求的情况下，把领域实体类型移动到 `src/types` 中
- 把 `route.tsx` 变成整个页面的完整实现文件
- 把页面级 CSS 放入 `src/styles/index.scss`
- 手动编辑 `router.gen.ts`

## 合规检查清单

在合并一个新页面或新功能之前，请核对以下各项:

- 路由目录与路由路径匹配
- 路由入口足够精简，只负责组装页面
- 页面级 UI 保留在页面目录下
- API 定义在 `src/apis/<domain>/` 下
- 应用级基础设施保留在 `src/api/`、`src/router/`、`src/helpers/`、`src/hooks/` 和 `src/types/` 下
- 命名遵循所要求的大小写和动词模式
- 样式和资源被正确地放在同一目录下

如果任何一项的答案是否定的，那么该实现就还不合规。
