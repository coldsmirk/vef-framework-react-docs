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

根应用与布局壳层（`App`、`BaseLayout`、`Layout`、`AccessDenied`、`Error`、`NotFound`、`RouterProvider`、`NProgress`）是**内部**实现，并通过上述函数配置；参见[应用壳层](./application-shell.md)。登录相关能力面向自定义页面导出：`Login`、`SsoLogin`、`LoginChallengeOutlet`、`useLoginFlow`、`useSsoLogin`、挑战渲染器及其类型。`ThemeConfigProvider` 也面向自定义壳层导出。

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
- `createSsoRouteOptions`
- `createAccessDeniedRouteOptions`
- `setupAppVersionNotification`
- `PasswordChangeChallenge` / `PASSWORD_CHANGE_CHALLENGE_TYPE`
- `Login` / `SsoLogin` / `useLoginFlow` / `useSsoLogin`
- `useAppStore` / `useTabStore` / `useThemeStore`
