---
title: 应用壳层
description: 内部的根应用、布局、登录及状态页组件，以及用于配置它们的选项。
---

# 应用壳层

应用壳层——根应用、布局、登录及状态页——是 `@vef-framework-react/starter` **内部**的实现。`App`、`BaseLayout`、`Layout`、`Login`、`AccessDenied`、`Error`、`NotFound`、`RouterProvider`、`ThemeConfigProvider`、`NProgress` 均未从该包导出。它们由 `createApp()`、`createRouter()` 以及 [Bootstrap and Routing](./bootstrap-and-routing.md) 中记录的路由选项辅助函数组装而成；本页记录的是这些函数所接受的选项形状。

页面级容器（`Page`、`FlexCard`）、表单弹窗（`FormModal`、`FormDrawer`）、表格抽象（`ProTable`）以及 CRUD 体系（`CrudPage`、`createCrudKit` 等）位于 `@vef-framework-react/components` 中——参见 [Components / CRUD](../../components/crud.md)。

## 根应用

`createApp().render(props)` 挂载内部的根组件，其组合顺序为：

`AppContextProvider` → `ApiClientProvider` → `MotionProvider` → `ThemeConfigProvider` → (`NProgress` + `RouterProvider`)

`render(props)` 接受：

| Prop | 类型 | 作用 |
| --- | --- | --- |
| `apiClient` | `ApiClient` | 提供给 `ApiClientProvider` |
| `appContext` | `AppContext` | 提供给 `AppContextProvider`（权限、字典、文件基础 URL） |
| `router` | `Router` | 来自 `createRouter()` 的实例，提供给内部的路由 provider |
| `appVersionNotification` | `AppVersionNotificationOptions` | 可选；用于接入 `setupAppVersionNotification` |

## 布局

由 `createLayoutRouteOptions()` 组装，在每个已认证路由中渲染。除了 `fetchUserInfo` / `beforeLoad` / `loader`（参见 [Bootstrap and Routing](./bootstrap-and-routing.md#createlayoutrouteoptions)）之外，它还会将以下展示选项原样转发给内部的布局壳层：

| 选项 | 类型 | 作用 |
| --- | --- | --- |
| `title` | `ReactNode` | 壳层标题 |
| `logo` | `ReactNode` | 壳层 logo |
| `headerActions` | `ReactNode` | 头部区域的额外内容 |
| `userMenuItems` | `UserMenuItem[]` | 附加到用户下拉菜单、位于内置退出登录项之前的项 |
| `onUserMenuClick` | `(key: string) => void` | 点击除内置 `logout` 键之外的任意用户菜单项时调用 |
| `onLogout` | `() => Awaitable<void>` | 退出登录回调 |
| `apps` | `AppItem[]` | 应用切换器中展示的子应用；省略则隐藏切换器 |
| `currentAppId` | `string` | 当前激活应用的 id，会在切换器中高亮显示 |
| `onAppChange` | `(appId: string) => Awaitable<void>` | 用户切换到另一个应用时调用 |

内部的布局壳层是两层结构组合而成：`Layout`（菜单、用户区域、标签页系统、应用切换器）包裹着更底层的 `BaseLayout`（头部/标签页/侧边栏/页脚区域）。`BaseLayout` 没有独立的公开配置面——只能通过 `Layout` 间接触达。

## 登录

由 `createLoginRouteOptions(props)` 组装，它会用 `props`（类型为 `LoginProps`，专为此目的导出）渲染内部的 `Login` 组件，并处理带重定向感知的登录流程（`?redirect=` 查询参数、已认证时跳过登录页）。

| Prop | 类型 | 作用 |
| --- | --- | --- |
| `logo` | `ReactNode` | 角落处的品牌标识 |
| `title` | `string` | 页面标题 |
| `description` | `string` | 副标题 |
| `publicKey` | `string` | 存在该值时启用 RSA 密码加密 |
| `onLogin` | `(params: LoginParams) => Promise<LoginResult>` | 登录回调 |
| `onResolveChallenge` | `(params: ResolveChallengeParams) => Promise<LoginResult>` | 与 `challengeRenderers` 配合使用，用于处理需要多步登录挑战的后端（例如 TOTP、强制修改密码） |
| `challengeRenderers` | `LoginChallengeRenderers` | 每种挑战类型对应一个渲染器；各渲染器所接收的 props（`challenge`、`resolve`、`cancel`、`pending`、`error`、`encrypt`）见 `LoginChallengeRendererProps` |

`onResolveChallenge` 与 `challengeRenderers` 要么同时提供、要么都不提供：从不发出挑战的后端可以两者都省略。

## 路由状态页

| 内部组件 | 由谁接入 |
| --- | --- |
| `AccessDenied` | `createAccessDeniedRouteOptions()` |
| `Error` | `createRouter()`（`defaultErrorComponent`）与 `createLayoutRouteOptions()`（`errorComponent`） |
| `NotFound` | `createRouter()`（`defaultNotFoundComponent`）与 `createLayoutRouteOptions()`（`notFoundComponent`） |

这三者均不接受公开配置选项。

## 路由加载指示器

`NProgress`（页面顶部的进度条）由根应用自动挂载，并由 `createRouter()` 的 `onBeforeLoad` / `onLoad` 路由事件驱动。它没有公开配置面。
