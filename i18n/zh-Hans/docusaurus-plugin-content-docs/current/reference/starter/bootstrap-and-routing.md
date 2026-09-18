---
title: 启动与路由
description: createApp、createApiClient、createRouter 以及路由选项辅助函数的签名。
---

# 启动与路由

## `createApp`

```ts
function createApp(options?: { strictMode?: boolean; useRouterContext?: UseRouterContext }): {
  render: (props: { apiClient: ApiClient; appContext: AppContext; router: Router; appVersionNotification?: AppVersionNotificationOptions; components?: ComponentDefaults; defaultTheme?: DefaultTheme }) => void;
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
  http: Pick<HttpClientOptions, "baseUrl" | "timeout" | "okCode" | "tokenExpiredCode" | "refreshToken" | "protectedBodyEncoding">;
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

登录路由辅助函数，处理带重定向感知的登录流程（`?redirect=` 查询参数，已认证时跳过登录页）。`props` 与 `Login` 组件渲染时使用的形状相同——参见[应用壳层](./application-shell.md#登录)。

也可以传入 `{ component }` 来替换页面，同时保留路由的 redirect 契约与已认证守卫。自定义组件自行调用 `useLoginFlow`；默认页面的 props 不能与 `component` 同时传入。

## `createSsoRouteOptions`

```ts
function createSsoRouteOptions(options: SsoLoginProps | { component: () => ReactNode }): RouteOptions;
```

`/sso` 的单点登录路由辅助函数。默认渲染 `SsoLogin`；传入 `{ component }` 可换成调用 `useSsoLogin` 的自定义落地页。该路由原样透传网关查询参数，并有意不在已认证时直接跳转，因为 handoff 可能指向另一个用户。

## `createAccessDeniedRouteOptions`

```ts
function createAccessDeniedRouteOptions(): RouteOptions;
```

拒绝访问路由辅助函数，用于未授权访问行为（返回上一页或跳转到首页路由）。

## 事件辅助函数

- `dispatchCustomEvent<T>(type: string, options?: CustomEventInit<T>): boolean` —— 派发一个 `document` 级别的 `CustomEvent`。
- `emitAccessDenied(): void` —— 触发 `createRouter` 所监听的拒绝访问事件。
- `emitUnauthenticated(): void` —— 触发 `createRouter` 所监听的未认证事件。
- `clearIdentityState(): void` —— 丢弃上一会话加载的身份，但保留认证状态；在既有会话之上建立新会话时调用，例如信任登录交接可能出现的场景。
- `handleClientLogout(router): void` —— 清除认证状态并重定向到登录路由。

## `setupAppVersionNotification`

```ts
function setupAppVersionNotification(options?: AppVersionNotificationOptions): (() => void) | undefined;
```

轮询已部署的 `index.html`，检查是否出现更新的 `<meta name="app-version">`（该值注入自 `VEF_APP_VERSION`——参见 [Dev 包](../dev/overview.md#运行时注入vef_app_)），当拉取到的版本比当前运行版本更高时，显示一条常驻的更新通知。当页面声明了 `<meta name="app-changelog">` 时，会拉取更新日志 JSON（一个 `AppChangelog[]`），并把与新版本匹配的条目渲染进通知。标签页隐藏时暂停轮询，回到前台时立即重新检查。

返回一个停止轮询的清理函数；`enabled` 为 `false` 时返回 `undefined`。它由 `createApp().render({ appVersionNotification })` 自动接入；只有在该路径之外才需要手动调用。

`AppVersionNotificationOptions` 字段:

| 选项 | 类型 | 默认值 | 用途 |
| --- | --- | --- | --- |
| `enabled` | `boolean` | `false` | 总开关；关闭时该设置是空操作（返回 `undefined`） |
| `basePath` | `string` | `"/"` | 拉取已部署 `index.html` 和更新日志 JSON 的基础路径（带缓存穿透） |
| `checkInterval` | `number` | `60` | 轮询间隔，单位为**秒**；`0` 禁用定时器（此后只在标签页可见性变化时检查） |
| `title` | `ReactNode` | 内置中文文案 | 通知标题；检测到的版本号会追加在后面 |
| `description` | `ReactNode` | 内置中文文案 | 通知正文的开头文案 |
| `confirmText` | `ReactNode` | 内置中文文案 | 确认按钮文案 |
| `cancelText` | `ReactNode` | 内置中文文案 | 取消按钮文案 |
| `onConfirm` | `() => void` | `location.reload()` | 确认处理器 |
| `onCancel` | `() => void` | — | 取消处理器，在通知关闭后调用 |

`AppChangelog` 字段（更新日志 JSON 中每个已发布版本对应一个条目）:

| 字段 | 类型 | 默认值 | 用途 |
| --- | --- | --- | --- |
| `version` | `string` | 必填 | 该条目描述的版本；与新检测到的版本进行匹配 |
| `date` | `string` | — | 发布日期，显示在通知底部 |
| `description` | `string` | — | 高亮显示的发布摘要 |
| `changes` | `string[]` | — | 变更点列表 |

## 路由常量

- `LOGIN_ROUTE_PATH` / `LOGIN_ROUTE_ID`
- `INDEX_ROUTE_PATH` / `INDEX_ROUTE_ID`
- `ACCESS_DENIED_ROUTE_PATH` / `ACCESS_DENIED_ROUTE_ID`
