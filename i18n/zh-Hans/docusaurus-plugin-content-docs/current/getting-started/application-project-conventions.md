---
sidebar_position: 4
title: 应用项目规范
---

# 应用项目规范

本页定义的是 VEF 应用项目必须遵守的组织规范。它约束的是使用框架构建的业务应用代码，包括像 `playground` 这样的应用项目；它不用于约束 monorepo 内部框架包的开发方式。

:::danger
所有新增的应用代码都必须遵守本页规范。修改既有功能时，变更范围内的文件也必须保持符合规范。这些内容不是建议，而是强制规则。
:::

:::tip
请先阅读 [推荐目录结构](./project-structure.md) 了解标准目录骨架，再阅读本页了解命名规则、放置规则和禁止模式。本页负责定义“必须怎么做”，不是只展示一个结构示例。
:::

## 适用范围与执行方式

- 本页规则只适用于使用 VEF Framework React 构建的应用项目。
- 应用代码必须基于框架公开导出的 API 编写，不得依赖框架内部实现或私有源码路径。
- 本页未定义的目录、文件和命名模式，不得默认提升为项目级约定。
- 页面私有逻辑必须优先就近放置，除非它已经跨多个路由域复用。
- 全局共享代码只能在确有跨域复用需求时提升，不得为了少写一两层相对路径就提前抽到全局目录。

## 标准应用目录结构

每个应用项目都必须以如下 `src/` 结构作为默认骨架：

```text
src/
  api/
    index.ts
    request.ts
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
    use-upload/
      index.ts
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

### 顶层目录职责约束

| 目录 | 必须放什么 | 禁止放什么 |
| --- | --- | --- |
| `src/api` | 应用级 API 客户端配置与通用请求封装 | 具体业务领域 API |
| `src/apis` | 按业务领域拆分的 API 文件 | 页面组件、路由文件、页面状态 |
| `src/pages` | 路由入口与页面局部实现 | 跨项目的杂项工具桶目录 |
| `src/router` | router 上下文、生成路由入口、router 导出 | 页面 UI、业务 API |
| `src/types` | 真正全局的应用类型 | 默认承接所有业务实体类型 |
| `src/hooks` | 跨多个路由域复用的全局 hook | 只被一个页面使用的 hook |
| `src/helpers` | 全局非 React helper | 页面私有 helper 或业务逻辑 |
| `src/styles` | 全局样式文件 | 页面局部 CSS Module |

### 根文件职责约束

- `src/main.ts` 只能负责应用启动、全局样式引入和 `createApp().render()` 调用。
- `src/pages/__root.ts` 只能定义根路由。
- `src/pages/_layout/route.ts` 只能定义共享布局路由。
- `src/pages/_common/*` 只能承接登录页、无权限页这类框架级公共路由。
- `src/router/index.ts` 必须作为 router 导出入口。
- `src/router/router.gen.ts` 是生成文件，禁止手工修改。

## 路由与页面目录规范

`pages/` 目录必须与路由层级保持一致。

### 路由入口规则

- 每一个可访问页面都必须拥有自己的页面目录。
- 每一个页面目录都必须暴露一个且只暴露一个路由入口文件，文件名必须是 `route.tsx` 或 `route.ts`。
- 传给 `createFileRoute()` 的路由路径必须与物理目录层级一致。
- 如果框架已经提供了 `INDEX_ROUTE_ID`、`LOGIN_ROUTE_ID`、`ACCESS_DENIED_ROUTE_ID` 这类常量，必须直接使用，不得重复手写等价字符串。

### `route.tsx` 职责规则

`route.tsx` 只能负责以下事情：

- 声明路由
- 拼装 `Page`、`CrudPage` 等页面壳组件
- 连接页面局部组件
- 在页面确实拥有局部状态时挂载页面自己的 store provider
- 把页面所需的 API 和局部 helper 接到页面壳上

`route.tsx` 不得负责以下事情：

- 直接内联大段表单字段定义
- 直接内联大段搜索区域定义
- 承载大段弹窗实现
- 混入多个无关 helper 函数
- 变成整页实现的杂糅文件

### 页面局部目录规则

一个典型页面目录必须按下面这种方式拆分：

```text
pages/_layout/auth/user/
  route.tsx
  components/
    basic-search.tsx
    form.tsx
  helpers/
    index.ts
```

具体放置规则如下：

- `components/` 只能放页面私有的 React UI 片段。
- `helpers/` 只能放页面私有 helper 工厂、scene 类型、列定义构造函数和页面局部的胶水逻辑。
- `styles/` 只能放当前页面自己的样式文件。
- `store.ts` 只有在当前页面确实拥有独立局部 store 时才能出现在页面目录根部。
- 页面私有逻辑不得随意提升到 `src/helpers`、`src/hooks` 或 `src/types`。

### 什么时候允许 `store.ts`

只有当下面三个条件同时成立时，页面目录下才允许出现 `store.ts`：

- 这份状态只属于当前页面
- 它不是可抽象成全局能力的通用状态
- 当前页面确实需要独立 provider 或局部事件协调

如果不满足这三个条件，就不要创建页面 store。

## API 层规范

API 层分为两级，这两级必须严格分开。

### `src/api/`

`src/api/` 只用于放应用级 API 基础设施。

- `src/api/index.ts` 必须负责创建并导出应用级 `apiClient`。
- `src/api/request.ts` 必须负责定义公共请求信封或通用请求构造函数。
- `src/api/` 不得放 `user.ts`、`role.ts`、`department.ts` 这类业务资源文件。

### `src/apis/`

`src/apis/` 只用于放业务领域 API，并且必须按业务域拆分：

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

每个 API 文件都必须满足以下规则：

- 一个文件只能对应一个资源，或一个强关联的资源聚合
- 领域实体类型、请求参数类型默认必须和对应 API 文件放在一起
- 查询函数和变更函数必须和服务它们的类型定义在同一文件中导出
- API 文件不得反向依赖页面组件、路由文件或页面 store

### API 命名规则

API 导出必须采用“动词在前、资源在后”的命名方式。

| 操作类型 | 必须使用的命名模式 | 示例 |
| --- | --- | --- |
| 分页查询 | `find<Resource>Page` | `findUserPage` |
| 列表或详情查询 | `find<Resource>` 或更具体的查询名 | `findConfigsByGroup` |
| 创建 | `create<Resource>` | `createUser` |
| 更新 | `update<Resource>` | `updateUser` |
| 保存 | `save<Resource>` | `saveConfigs` |
| 单个删除 | `delete<Resource>` | `deleteUser` |
| 批量删除 | `delete<Resources>` 或明确的复数名 | `deleteUsers` |
| 鉴权刷新 | `refresh<AuthOrToken>` | `refreshAuth` |

### API 导入规则

- 页面代码必须通过 `~apis` 使用应用 API。
- 应用级 API 基础设施必须通过 `~api` 使用。
- 当别名入口已经存在时，页面代码不得使用跨多层目录的相对路径直接导入 `src/apis/**`。

## 类型、hooks、helpers 与 store 放置规则

### 类型放置规则

- `src/types/` 只允许放真正全局的应用类型，例如配置、存储等跨域契约。
- 业务实体类型、请求参数类型、响应类型默认必须放在对应的 `src/apis/` 文件里。
- 页面专属的 scene 值类型、helper 类型、store 关联类型必须留在页面目录下，通常放在 `helpers/` 或 `store.ts` 周边。
- `src/types/` 不得演变成项目里所有 interface 的默认归宿。

### Hook 放置规则

- `src/hooks/` 只允许放跨多个路由域复用的全局 hook。
- 只被一个页面使用的 hook 必须留在页面目录下。
- 只被一个业务域使用的 hook 必须先留在该业务域，直到它真的跨域复用。
- `src/hooks/` 中公开给应用其余部分使用的 hook，必须通过 `src/hooks/index.ts` 暴露。

### Helper 放置规则

- `src/helpers/` 只允许放应用级非 React helper，例如配置读取、通用文本处理等。
- 像 `createCrudKit()` 绑定这类页面局部 helper，必须留在页面自己的 `helpers/` 目录下。
- 业务逻辑不得伪装成通用工具被塞进 `src/helpers/`。

## 命名规范

### 目录与文件命名

- 目录名必须使用 `kebab-case`。
- 文件名必须使用 `kebab-case`。
- 唯一允许跳出普通 kebab-case 的保留文件名只有框架入口类文件，例如 `__root.ts`、`route.ts`、`route.tsx`、`store.ts` 和 barrel 用的 `index.ts`。
- 页面样式目录如果单独存在，入口文件必须使用 `styles/index.module.scss`。

### 导出命名

- React 组件必须使用 `PascalCase`。
- Hook 必须使用 `camelCase`，并且必须以 `use` 开头。
- Store provider 如果承载上下文或 store 边界，名称必须使用 `PascalCase` 且以 `Provider` 结尾。
- Store hook 必须使用 `useXxxStore` 或 `useXxxPageStore`。
- 类型和接口必须使用 `PascalCase`。
- 只有真正的常量才允许使用 `UPPER_SNAKE_CASE`；其余值使用 `camelCase`。

### Barrel 文件规则

- `index.ts` 只能作为目录对外导出入口或 barrel 文件使用。
- `index.ts` 不得隐藏页面路由的主实现。
- `src/apis/index.ts`、`src/helpers/index.ts`、`src/hooks/index.ts`、`src/types/index.ts` 这类全局 barrel，只能重导出应用公共模块。

### 导入路径规则

- 共享的应用模块必须通过 `~api`、`~apis`、`~helpers`、`~hooks`、`~router`、`~types` 这类别名导入。
- 页面局部模块必须使用相对路径导入。
- 当别名已经存在时，不得继续使用很长的相对路径回跳到应用根目录。

## 样式与资源放置规范

### 样式规则

- 全局样式必须放在 `src/styles/index.scss`。
- 页面局部样式必须放在页面自己的目录内。
- 页面局部样式默认必须使用 CSS Modules。
- 设计取值必须优先使用框架 token、CSS 变量或主题 hook；当框架已经提供等价 token 时，不得在页面里散落硬编码主题十六进制值。

### 资源规则

- 需要通过 URL 直接访问的全局静态资源必须放在 `public/`。
- 页面私有资源必须就近放在对应页面或功能目录下。
- `public/` 不得成为只被单个页面使用的资源堆放目录。

## 禁止模式

以下模式在 VEF 应用项目中一律禁止：

- 默认创建 `src/services`、`src/utils`、`src/stores`、`src/common` 这类大而全的顶层杂项目录
- 用顶层 `src/components` 承载页面私有 UI
- 在一个 API 文件中混放多个业务域
- 把页面私有 helper 放进 `src/helpers`
- 把页面私有 hook 放进 `src/hooks`
- 没有跨项目需求却把业务实体类型统统搬进 `src/types`
- 把 `route.tsx` 写成整页所有实现的总文件
- 把页面私有样式写进 `src/styles/index.scss`
- 手工编辑 `router.gen.ts`

## 合规检查清单

在合并一个新页面或新功能之前，必须逐项确认以下内容：

- 路由目录是否与路由路径一致
- 路由入口是否保持轻量，只负责页面装配
- 页面私有 UI 是否都留在页面目录内
- API 是否定义在 `src/apis/<domain>/` 下
- 应用级基础设施是否留在 `src/api/`、`src/router/`、`src/helpers/`、`src/hooks/`、`src/types/` 中
- 命名是否符合大小写和动词模式要求
- 样式与资源是否都放在正确的位置

只要有任意一项答案是否定的，这份实现就还不合规。
