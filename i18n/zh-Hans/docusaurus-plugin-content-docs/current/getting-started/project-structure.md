---
sidebar_position: 3
title: 推荐目录结构
---

# 推荐目录结构

VEF 最适合按“页面场景”组织项目，而不是把所有 `components`、`hooks`、`services` 都堆成巨型公共目录。  
仓库中的示例应用 `playground` 采用了这一组织方式，可作为目录拆分参考。

本页说明的是标准目录骨架；关于命名规则、放置规则和禁止模式，请继续阅读 [应用项目规范](./application-project-conventions.md)。

## 推荐目录

```text
src/
  api/
    index.ts
    request.ts
  apis/
    auth/
    sys/
    md/
    pmr/
  helpers/
    config.ts
  hooks/
    use-upload/
  pages/
    __root.tsx
    _common/
      login.tsx
      access-denied.tsx
    _layout/
      route.ts
      index/
        route.tsx
      auth/
      sys/
      md/
      pmr/
  router/
    context.ts
    router.gen.ts
  main.ts
```

## 每个目录负责什么

| 目录 | 作用 | 推荐放什么 |
| --- | --- | --- |
| `api/` | 应用级 API 客户端能力 | `createApiClient()`、统一请求包装、公共 header |
| `apis/` | 领域 API 函数 | `findUserPage`、`createUser`、`refreshAuth` |
| `helpers/` | 与业务无关但与应用有关的工具 | 配置读取、环境变量包装 |
| `hooks/` | 页面复用 hooks | 上传、弹窗状态、组合逻辑 |
| `pages/` | 路由和页面主体 | `route.tsx`、页面组件、局部 helper |
| `router/` | router 实例与上下文 | `createRouter()`、`RouterContext` |

## 页面目录怎么拆

VEF 下一个典型 CRUD 页面通常这样拆:

```text
pages/_layout/auth/user/
  route.tsx
  helpers/
    index.ts
  components/
    basic-search.tsx
    form.tsx
```

这种拆法的好处是:

- `route.tsx` 只负责拼装 `CrudPage`
- `components/form.tsx` 只负责表单字段
- `components/basic-search.tsx` 只负责搜索区域
- `helpers/index.ts` 只负责 `createCrudKit()` 这类页面类型适配

## API 目录怎么拆

推荐按业务领域拆 `apis/`:

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

每个文件里只做两件事:

1. 定义接口类型
2. 导出 `createQueryFn()` / `createMutationFn()` 结果

## 基础启动骨架

从零搭建项目时，通常会先创建这些文件:

1. `src/main.ts`
2. `src/api/index.ts`
3. `src/router/context.ts`
4. `src/router/index.ts`
5. `src/pages/__root.tsx`
6. `src/pages/_layout/route.ts`
7. `src/pages/_common/login.tsx`
8. `src/pages/_common/access-denied.tsx`
