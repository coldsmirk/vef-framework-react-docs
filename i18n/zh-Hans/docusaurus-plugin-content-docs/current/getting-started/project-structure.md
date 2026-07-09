---
title: 项目结构
description: VEF 应用标准的 src/ 目录地图，以及典型页面目录和 API 目录的拆分方式。
---

# 项目结构

当项目按页面场景组织，而不是按 `components`、`hooks`、`services` 这类大而全的共享目录组织时，VEF 的效果最好。  
示例应用 `playground` 遵循这一结构，可以作为参考。

本页说明标准的目录地图。强制性的命名规则、放置规则和禁止使用的模式定义在[项目规范](../advanced/project-conventions.md)中。

## 推荐布局

这是一个代表性的精简示例。完整的强制性 `src/` 布局——每个顶层目录的契约——见[项目规范](../advanced/project-conventions.md)。

```text
src/
  api/
    index.ts
  apis/
    auth/
    sys/
  helpers/
  hooks/
  pages/
    __root.ts
    _common/
      login.ts
      access-denied.ts
    _layout/
      route.ts
      auth/
      sys/
  router/
    context.ts
  main.ts
```

## 各目录的职责

| 目录 | 用途 | 典型内容 |
| --- | --- | --- |
| `api/` | 应用级 API 客户端设置 | `createApiClient()`、请求包装器、共享 header |
| `apis/` | 领域 API 函数 | `findUserPage`、`createUser`、`refreshAuth` |
| `helpers/` | 与具体领域无关的应用级工具 | 配置读取器、环境变量包装器 |
| `hooks/` | 可复用的页面级 hooks | 上传、弹窗状态、组合行为 |
| `pages/` | 路由入口和页面实现 | `route.tsx`、页面组件、局部 helper |
| `router/` | 路由器实例和路由上下文 | `createRouter()`、`RouterContext` |

## 典型页面目录拆分

一个典型的 CRUD 页面通常这样拆分:

```text
pages/_layout/auth/user/
  route.tsx
  helpers/
    index.ts
  components/
    basic-search.tsx
    form.tsx
```

这样能让职责保持清晰:

- `route.tsx` 只负责组装 `CrudPage`
- `components/form.tsx` 只负责渲染表单字段
- `components/basic-search.tsx` 只负责渲染搜索区域
- `helpers/index.ts` 只提供页面级的类型 helper，例如 `createCrudKit()`

## API 目录拆分

按领域拆分 `apis/` 通常效果不错:

```text
apis/
  auth/
    auth.ts
    user.ts
    role.ts
    menu.ts
  sys/
    app.ts
    audit-log.ts
  md/
    department.ts
    staff.ts
```

每个文件通常只做两件事:

1. 定义接口类型
2. 导出 `createQueryFn()` / `createMutationFn()` 的结果

## 基础启动文件

从零开始一个项目时，通常会先创建以下这些文件:

1. `src/main.ts`
2. `src/api/index.ts`
3. `src/router/context.ts`
4. `src/router/index.ts`
5. `src/pages/__root.ts`
6. `src/pages/_layout/route.ts`
7. `src/pages/_common/login.ts`
8. `src/pages/_common/access-denied.ts`

有了目录地图之后，自然的下一步是阅读[路由与布局](../guide/routing.md)。
