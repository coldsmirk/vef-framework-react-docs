---
title: 启动与路由
description: createApp、createApiClient、createRouter 以及路由选项辅助函数的签名。
---

# 启动与路由

## `createApp`

```ts
function createApp(options?: { strictMode?: boolean; useRouterContext?: UseRouterContext }): {
  render: (props: { apiClient: ApiClient; appContext: AppContext; router: Router; appVersionNotification?: AppVersionNotificationOptions }) => void;
  unmount: () => void;
};
```

创建一个应用实例。`render()` 将（内部的）应用根组件挂载到 `#root`；`unmount()` 将其卸载。

典型场景:

- `main.tsx` 中的主应用入口
- 在隔离环境（例如微前端宿主、测试）中受控地渲染与卸载

## `createApiClient`

```ts
function createApiClient(options: {
  http: Pick<HttpClientOptions, "baseUrl" | "timeout" | "okCode" | "tokenExpiredCode" | "refreshToken">;
  query?: Pick<QueryClientOptions, "gcTime" | "staleTime">;
}): ApiClient;
```

在 `core.createApiClient()` 的基础上扩展了令牌存储（基于 `useAppStore`）、未认证处理、拒绝访问处理，以及接入 components 包通知辅助函数的全局消息反馈（info/warning/error/success）。

## `createRouter`

```ts
function createRouter<TRouteTree>(options: {
  history: "hash" | "browser";
  routeTree: TRouteTree;
  context: RouterContext;
}): Router;
```

创建 VEF 定制版的 TanStack Router 实例。同时接入路由进度事件（`nProgressEventEmitter`）、默认的 pending/error/not-found 组件，以及事件驱动的未认证/拒绝访问处理（在 `emitUnauthenticated` / `emitAccessDenied` 时执行导航）。

## `createRootRouteOptions`

```ts
function createRootRouteOptions(props: { appTitle: string }): RouteOptions;
```

聚焦于文档标题行为（`${appTitle} | ${activeMenuName}`）的根路由辅助函数。

## `createLayoutRouteOptions`

```ts
function createLayoutRouteOptions<TBeforeLoadContext = {}, TLoaderData = void>(options: {
  fetchUserInfo: () => Awaitable<UserInfo>;
  beforeLoad?: (args: LayoutBeforeLoadArgs) => Awaitable<TBeforeLoadContext | void>;
  loader?: (args: LayoutLoaderArgs<TBeforeLoadContext>) => Awaitable<TLoaderData>;
  // plus the layout's own display options: title, logo, headerActions, userMenuItems,
  // onUserMenuClick, onLogout, apps, currentAppId, onAppChange — see Application Shell
}): RouteOptions;
```

布局路由辅助函数，用于:

- 已认证应用区域（未认证时重定向到登录路由）
- 菜单加载与权限感知导航（`fetchUserInfo` 填充 `useAppStore`；未映射的路由重定向到拒绝访问路由）
- 退出登录与用户菜单的接入，原样转发给内部的布局壳层

## `createLoginRouteOptions`

```ts
function createLoginRouteOptions(props: LoginProps): RouteOptions;
```

登录路由辅助函数，处理带重定向感知的登录流程（`?redirect=` 查询参数，已认证时跳过登录页）。`props` 与内部 `Login` 组件渲染时使用的形状相同——参见 [Application Shell](./application-shell.md#登录)。

## `createAccessDeniedRouteOptions`

```ts
function createAccessDeniedRouteOptions(): RouteOptions;
```

拒绝访问路由辅助函数，用于未授权访问行为（返回上一页或跳转到首页路由）。

## 事件辅助函数

- `dispatchCustomEvent<T>(type: string, options?: CustomEventInit<T>): boolean` —— 派发一个 `document` 级别的 `CustomEvent`。
- `emitAccessDenied(): void` —— 触发 `createRouter` 所监听的拒绝访问事件。
- `emitUnauthenticated(): void` —— 触发 `createRouter` 所监听的未认证事件。
- `handleClientLogout(router): void` —— 清除认证状态并重定向到登录路由。

## 路由常量

- `LOGIN_ROUTE_PATH` / `LOGIN_ROUTE_ID`
- `INDEX_ROUTE_PATH` / `INDEX_ROUTE_ID`
- `ACCESS_DENIED_ROUTE_PATH` / `ACCESS_DENIED_ROUTE_ID`
