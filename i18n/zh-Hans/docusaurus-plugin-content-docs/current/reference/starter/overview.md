---
title: Starter 包概览
description: "@vef-framework-react/starter 涵盖的内容，以及在启动、路由与应用壳层之间的建议阅读顺序。"
---

# Starter 包概览

`@vef-framework-react/starter` 是将 VEF 打造成完整应用壳层的包。

它主要涵盖三个方面:

1. 应用启动（`createApp`、`createApiClient`）
2. 路由（`createRouter`、路由选项辅助函数）
3. 应用级状态（`useAppStore`、`useTabStore`、`useThemeStore`）

应用壳层本身——根应用、布局、登录及状态页（`App`、`Layout`、`Login`、`AccessDenied`、`Error`、`NotFound`、`NProgress` 及相关组件）——是**内部**实现：均未从该包导出。它完全通过上述函数进行配置；各函数所接受的选项形状参见[应用壳层](./application-shell.md)。唯一*确实*导出的壳层部件是内置的 `PasswordChangeChallenge` 登录挑战渲染器，由宿主自行注册——参见[登录挑战](./application-shell.md#登录挑战)。

页面级容器、表单弹窗、表格以及 CRUD 体系位于 `@vef-framework-react/components` 中——参见 [Components / CRUD](../../components/crud.md)。

## 建议阅读顺序

1. [启动与路由](./bootstrap-and-routing.md)
2. [应用壳层](./application-shell.md)
3. [Store 与类型](./stores-and-types.md)

## 常用导出

- `createApp`
- `createApiClient`
- `createRouter`
- `createRootRouteOptions`
- `createLayoutRouteOptions`
- `createLoginRouteOptions`
- `createAccessDeniedRouteOptions`
- `setupAppVersionNotification`
- `PasswordChangeChallenge` / `PASSWORD_CHANGE_CHALLENGE_TYPE`
- `useAppStore` / `useTabStore` / `useThemeStore`
