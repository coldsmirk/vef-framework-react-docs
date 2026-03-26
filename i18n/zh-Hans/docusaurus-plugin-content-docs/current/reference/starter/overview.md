---
sidebar_position: 1
title: Starter 包总览
---

# Starter 包总览

`@vef-framework/starter` 是把 VEF 真正“拼成一个应用”的那层包。

它主要负责四件事:

1. 应用启动
2. 路由与布局
3. 页面级通用组件
4. CRUD 场景抽象

## 推荐阅读顺序

1. [应用启动与路由](./bootstrap-and-routing.md)
2. [页面、布局与表单容器](./page-layout.md)
3. [CRUD 与表格体系](./crud.md)
4. [Store、常量与类型](./stores-and-types.md)

## 包内最常用导出

| 导出 | 用途 |
| --- | --- |
| `createApp` | 启动应用 |
| `createApiClient` | 创建应用级 API 客户端 |
| `createRouter` | 创建路由实例 |
| `createRootRouteOptions` | 根路由 |
| `createLayoutRouteOptions` | 布局和守卫 |
| `Page` | 普通业务页容器 |
| `ProTable` | 页面级表格 |
| `CrudPage` | 标准 CRUD 页面 |
| `createCrudKit` | 页面局部 CRUD 类型工具 |
