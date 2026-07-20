---
title: 应用壳层
description: 内部的根应用、布局、登录及状态页组件，以及用于配置它们的选项。
---

# 应用壳层

应用壳层——根应用、布局、登录及状态页——是 `@vef-framework-react/starter` **内部**的实现。`App`、`BaseLayout`、`Layout`、`Login`、`AccessDenied`、`Error`、`NotFound`、`RouterProvider`、`ThemeConfigProvider`、`NProgress` 均未从该包导出。它们由 `createApp()`、`createRouter()` 以及[启动与路由](./bootstrap-and-routing.md)中记录的路由选项辅助函数组装而成；本页记录的是这些函数所接受的选项形状。

页面级容器（`Page`、`FlexCard`）、表单弹窗（`FormModal`、`FormDrawer`）、表格抽象（`ProTable`）以及 CRUD 体系（`CrudPage`、`createCrudKit` 等）位于 `@vef-framework-react/components` 中——参见 [Components / CRUD](../../components/crud.md)。

## 根应用

`createApp().render(props)` 挂载内部的根组件，其组合顺序为：

`AppContextProvider` → `ApiClientProvider` → `MotionProvider` → `ThemeConfigProvider` → (`NProgress` + `RouterProvider`)

`render(props)` 接受：

| Prop | 类型 | 作用 |
| --- | --- | --- |
| `apiClient` | `ApiClient` | 提供给 `ApiClientProvider` |
| `appContext` | `AppContext` | 提供给 `AppContextProvider`（权限、码集、文件基础 URL） |
| `router` | `Router` | 来自 `createRouter()` 的实例，提供给内部的路由 provider |
| `appVersionNotification` | `AppVersionNotificationOptions` | 可选；用于接入 `setupAppVersionNotification` |

## 布局

由 `createLayoutRouteOptions()` 组装，在每个已认证路由中渲染。除了 `fetchUserInfo` / `beforeLoad` / `loader`（参见[启动与路由](./bootstrap-and-routing.md#createlayoutrouteoptions)）之外，它还会将以下展示选项原样转发给内部的布局壳层：

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

`AppItem` 字段：

| 字段 | 类型 | 默认值 | 作用 |
| --- | --- | --- | --- |
| `id` | `string` | 必填 | 稳定标识符，会回传给 `onAppChange` |
| `name` | `string` | 必填 | 显示名称 |
| `description` | `string` | — | 一句话描述（以 tooltip 形式展示） |
| `icon` | `ReactNode` | — | 可直接渲染的节点，在切换器磁贴中按原样渲染（一个 `<img>`、一个 `DynamicIcon` 等）——不是图标*名称*；见 v2.5.0 版本说明 |

内部的布局壳层是两层结构组合而成：`Layout`（菜单、用户区域、标签页系统、应用切换器）包裹着更底层的 `BaseLayout`（头部/标签页/侧边栏/页脚区域）。`BaseLayout` 没有独立的公开配置面——只能通过 `Layout` 间接触达。

## 登录

由 `createLoginRouteOptions(props)` 组装，它会用 `props`（类型为 `LoginProps`，专为此目的导出）渲染内部的 `Login` 组件，并处理带重定向感知的登录流程（`?redirect=` 查询参数、已认证时跳过登录页）。

| Prop | 类型 | 作用 |
| --- | --- | --- |
| `logo` | `ReactNode` | 角落处的品牌标识 |
| `title` | `string` | 页面标题 |
| `description` | `string` | 副标题 |
| `publicKey` | `string` | 存在该值时启用凭据的 RSA 加密（并可经由 `encrypt` 加密敏感的挑战应答） |
| `onLogin` | `(params: LoginParams) => Promise<LoginResult>` | 登录回调 |
| `onResolveChallenge` | `(params: ResolveChallengeParams) => Promise<LoginResult>` | 面向会发出多步登录挑战的后端（例如 TOTP、强制修改密码），须与 `challengeRenderers` 一起提供 |
| `challengeRenderers` | `LoginChallengeRenderers` | 每种挑战类型对应一个渲染器 |

`onResolveChallenge` 与 `challengeRenderers` 要么同时提供、要么都不提供：从不发出挑战的后端可以两者都省略。`LoginProps` 在类型层面强制了这一点。

### 登录挑战

挑战流水线完全位于内部 `Login` 组件之内：

1. `onLogin` 返回一个 `LoginResult`。当它携带的是 `challenge` + `challengeToken` 而不是 `tokens` 时，凭据表单会被替换为注册在 `challengeRenderers[challenge.type]` 下的渲染器。
2. 渲染器调用 `resolve(response)`；Login 组件将其转发为 `onResolveChallenge({ challengeToken, type, response })`。返回的 `LoginResult` 要么完成认证（`tokens`——更新 store 并执行 `?redirect=` 导航），要么串联下一个挑战。
3. `resolve` 被拒绝时，挑战会留在屏幕上，错误信息通过渲染器的 `error` prop 暴露（`BusinessError` 的消息原样展示；其它错误回退为通用提示）。错误会在下一次 `resolve` 时以及取消时自动清除。
4. `cancel()` 丢弃持有的挑战令牌并返回凭据表单——用户必须重新登录。
5. 未注册渲染器的挑战类型会显示内置的"不支持的挑战"提示，并附带返回登录的按钮。

每个渲染器都是一个 `LoginChallengeRenderer`——一个接收 `LoginChallengeRendererProps` 的普通渲染函数（由 `K` 参数化，`K` 是该渲染器所绑定的挑战类型）：

| Prop | 类型 | 作用 |
| --- | --- | --- |
| `challenge` | `Extract<LoginChallenge, { type: K }>` | 待处理的挑战：`type`、特定于挑战的 `data`，以及 `required` |
| `resolve` | `(response: ResolvedChallenges[K]["response"]) => Promise<void>` | 提交用户的应答；在得到的 `LoginResult` 应用完毕后才会 resolve |
| `cancel` | `() => void` | 放弃挑战并返回凭据表单 |
| `pending` | `boolean` | 是否有 `resolve` 调用正在进行（用于禁用提交按钮） |
| `error` | `string \| null \| undefined` | 最近一次失败的 `resolve` 的错误消息，用于内联展示 |
| `encrypt` | `((plaintext: string) => string) \| undefined` | 仅在配置了 `publicKey` 时存在；以与凭据相同的方案加密敏感应答。可能抛出异常——请在提交处理器中捕获 |

当项目扩充了 `Register['challenges']`（参见 [Store 与类型](./stores-and-types.md#扩展-userinfodetails)）后，`challenge.data` 与 `resolve` 的参数会按挑战类型收窄，并且 `LoginChallengeRenderers` 会强制穷尽性——每个已声明的挑战类型都必须有对应的渲染器。

### 内置渲染器：`PasswordChangeChallenge`

starter 附带一个内置渲染器，用于后端的强制修改密码挑战。导出如下：

| 导出 | 种类 | 作用 |
| --- | --- | --- |
| `PasswordChangeChallenge` | 组件 | 渲染器本体：收集并确认新密码，本地校验（两个字段均非空且一致），存在 `encrypt` 时用其加密，并把 resolve 失败（例如违反密码策略）与本地校验错误内联展示 |
| `PASSWORD_CHANGE_CHALLENGE_TYPE` | `"password_change"` 常量 | 挑战类型标识符，与后端的 `security.ChallengeTypePasswordChange` 对齐 |
| `PasswordChangeChallengeData` | 类型 | 挑战的 `data` 负载：`{ reason: PasswordChangeReason; meta?: Record<string, unknown> }` |
| `PasswordChangeReason` | `LiteralUnion<"first_login" \| "expired", string>` | 强制修改密码的原因；两个字面量是后端预定义的原因，会驱动与原因对应的副标题，其它任意字符串回退为通用副标题 |
| `PasswordChangeChallengeSpec` | 类型 | `Register['challenges']` 条目：`{ data: PasswordChangeChallengeData; response: string }`——应答是新密码，配置了 `publicKey` 时为密文，否则为明文 |
| `PasswordChangeChallengeProps` | 类型 | 该组件的 props（见下） |

`PasswordChangeChallengeProps`——其形状确保无论是否存在 `Register['challenges']` 扩充，都能赋值给 `LoginChallengeRenderers` 的条目（`challenge.data` 保持宽类型；`resolve` 保持窄类型）：

| Prop | 类型 | 默认值 | 作用 |
| --- | --- | --- | --- |
| `challenge` | `{ data?: unknown }` | 必填 | 服务端提供的 `PasswordChangeChallengeData`；被视为不可信的线上数据并做防御性读取 |
| `resolve` | `(response: string) => Promise<void>` | 必填 | 提交（可能已加密的）新密码 |
| `cancel` | `() => void` | 必填 | 返回凭据表单；`pending` 期间禁用 |
| `pending` | `boolean` | 必填 | resolve 调用的进行中状态 |
| `error` | `string \| null` | `undefined` | 内联展示的 resolve 失败信息（与本地校验错误并列） |
| `encrypt` | `(plaintext: string) => string` | `undefined` | 配置了 `publicKey` 时由 Login 组件提供；新密码在提交前会被加密 |

接线是宿主的职责——渲染器只是被导出，并不会自动注册：

```tsx title="src/pages/_common/login.tsx"
import { createFileRoute } from "@tanstack/react-router";
import {
  createLoginRouteOptions,
  LOGIN_ROUTE_ID,
  PASSWORD_CHANGE_CHALLENGE_TYPE,
  PasswordChangeChallenge,
  type LoginChallengeRenderers
} from "@vef-framework-react/starter";

const challengeRenderers: LoginChallengeRenderers = {
  [PASSWORD_CHANGE_CHALLENGE_TYPE]: PasswordChangeChallenge
};

export const Route = createFileRoute(LOGIN_ROUTE_ID)(
  createLoginRouteOptions({
    onLogin: handleLogin,
    onResolveChallenge: handleResolveChallenge,
    challengeRenderers
  })
);
```

```ts title="src/types/augmentation.ts"
import type { PASSWORD_CHANGE_CHALLENGE_TYPE, PasswordChangeChallengeSpec } from "@vef-framework-react/starter";

declare module "@vef-framework-react/starter" {
  interface Register {
    challenges: {
      [PASSWORD_CHANGE_CHALLENGE_TYPE]: PasswordChangeChallengeSpec;
    };
  }
}
```

要扩展这套挑战，在各自的挑战类型下添加项目自定义的渲染器组件（每个组件都接收 `LoginChallengeRendererProps`）；要替换内置 UI，则在 `PASSWORD_CHANGE_CHALLENGE_TYPE` 下注册一个不同的渲染器。

## 路由状态页

| 内部组件 | 由谁接入 |
| --- | --- |
| `AccessDenied` | `createAccessDeniedRouteOptions()` |
| `Error` | `createRouter()`（`defaultErrorComponent`）与 `createLayoutRouteOptions()`（`errorComponent`） |
| `NotFound` | `createRouter()`（`defaultNotFoundComponent`）与 `createLayoutRouteOptions()`（`notFoundComponent`） |

这三者均不接受公开配置选项。

## 路由加载指示器

`NProgress`（页面顶部的进度条）由根应用自动挂载，并由 `createRouter()` 的 `onBeforeLoad` / `onLoad` 路由事件驱动。它没有公开配置面。
