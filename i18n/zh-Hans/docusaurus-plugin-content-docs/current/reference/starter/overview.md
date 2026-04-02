---
sidebar_position: 1
title: Starter 包概览
---

# Starter 包概览

`@vef-framework-react/starter` 是将 VEF 变成完整应用外壳的包。

它主要涵盖两个方面：

1. 应用启动与路由
2. 应用外壳组件（布局、登录、错误页面）

> **注意（v2.1.6）：** `Page`、`FlexCard`、`FormModal`、`FormDrawer`、`ProSearch`、`ProTable`、`Crud`、`CrudPage` 和 `createCrudKit` 已从 `starter` 迁移到 `@vef-framework-react/components`。

## 建议阅读顺序

1. [启动与路由](./bootstrap-and-routing.md)
2. [页面布局与表单容器](./page-layout.md)
3. [CRUD 与表格栈](./crud.md)
4. [Store、常量与类型](./stores-and-types.md)

## 常用导出

- `createApp`
- `createApiClient`
- `createRouter`
- `createRootRouteOptions`
- `createLayoutRouteOptions`
- `setupAppVersionNotification`
