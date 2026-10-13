---
title: Store 与类型
description: app/tab/theme 三个 Zustand store，以及 @vef-framework-react/starter 导出的领域、用户和路由类型。
---

# Store 与类型

## Store 导出

- `useAppStore` —— 认证状态、当前用户信息、菜单映射与权限令牌；持久化（`isAuthenticated` / `custom` / `authTokens` 在刷新后保留）。
- `useTabStore` —— 支撑多标签页布局的已打开标签列表；持久化。
- `useThemeStore` —— 用户选择的配色方案和语义化颜色、菜单布局模式与布局开关；持久化。未设置的颜色与配色方案值跟随应用的 `defaultTheme`。

三者均通过 `createPersistedStore` 创建（参见 [Store 与 Atom](../core/store-and-atom.md)）——它们的状态类型不需要 `name` 字段，存储键改由持久化选项提供。

相关类型:

- `AppState`
- `Tab`
- `TabState`
- `ColorScheme` —— `"system" | "light" | "dark"`
- `ThemeColors` —— `Record<SemanticColor, string>`
- `DefaultTheme` —— `{ colorScheme?: ColorScheme; colors?: Partial<ThemeColors> }`
- `MenuLayoutMode` —— `"vertical" | "horizontal" | "mixed"`
- `ThemeState`

## API 与领域类型

实体标识:

- `Entity<TId = string>` —— 仅携带 `id` 的基础接口

独立的审计字段接口（用于组合主键或非 `id` 键控记录）:

- `CreationTracked<TId, TDate>` —— `createdAt` / `createdBy` / `createdByName`
- `FullTracked<TId, TDate>` —— 在 `CreationTracked` 基础上扩展 `updatedAt` / `updatedBy` / `updatedByName`

组合实体接口:

- `CreationAuditedEntity<TId, TDate>` —— `Entity` + `CreationTracked`
- `FullAuditedEntity<TId, TDate>` —— `Entity` + `FullTracked`

批量参数辅助类型:

- `Many<T>` —— 为批量创建/更新负载包装一个 `list: T[]`

## 用户与菜单类型

- `Gender` —— `"male" | "female" | "unknown"`
- `UserMenuType` —— `"directory" | "menu" | "view" | "report"`，通过 `LiteralUnion` 支持项目自定义扩展
- `UserMenu` —— `type` / `path` / `name` / `icon?` / `meta?` / `children?`
- `UserMenuMeta` —— 绑定到菜单路由的 `params?: Record<string, string>` 与 `search?: Record<string, string>`，以及在 `Register['menuMeta']` 上增补的任意键
- `UserInfo` —— `details` 类型通过 `Register` 增补点确定（见下文）
- `AppCustomState` —— `AppState.custom` 的形状；默认为 `AnyObject`，可经 `Register['appCustomState']` 收窄
- `ChallengeSpec` —— `{ data?: unknown; response: unknown }`，一种登录挑战类型的契约
- `ResolvedChallenges` —— 从 `Register['challenges']` 解析出的挑战类型注册表，未增补时为开放的 `Record<string, ChallengeSpec>`
- `Register` —— 空接口，各项目通过 `declare module` 增补，用于细化 `UserInfo['details']`、`AppState.custom`、`UserMenuMeta`、`loginParams` 以及登录挑战注册表。对于内置的 `password_change` 挑战，请在 `PASSWORD_CHANGE_CHALLENGE_TYPE` 下注册 `PasswordChangeChallengeSpec`——参见[登录挑战](./application-shell.md#登录挑战)
- `LoginParams` —— `PasswordLoginParams | TrustCodeLoginParams`，加上项目注册的登录机制
- `PasswordLoginParams` —— `{ type: "password"; principal: string; credentials: string }`
- `TrustCodeLoginParams` —— `{ type: "trust_code"; principal: string; credentials: string }`；`principal` 是发起方应用 id
- `UseLoginFlowOptions` —— `useLoginFlow` 接受的选项
- `SsoLoginFlow` —— `useSsoLogin` 返回的状态；`UseSsoLoginOptions` —— 它接受的选项；`SsoHandoffSearch` —— handoff 的查询参数（`Record<string, unknown>`）——参见[单点登录](./application-shell.md#单点登录)
- `LoginChallengeOutletProps` —— `LoginChallengeOutlet` 的 props
- `LoginRouteOptions` / `SsoRouteOptions` / `RouterOptions` —— `createLoginRouteOptions`、`createSsoRouteOptions` 与 `createRouter` 的选项——参见[启动与路由](./bootstrap-and-routing.md)
- `LoginChallengeAutoResolver` / `LoginChallengeAutoResolvers` —— 可选的按类型回调，用页面已有数据应答挑战
- `UserDetails` —— 当 `Register['userDetails']` 未被增补时的兜底形状（`Record<string, unknown>`）
- `OrderSpec` —— `{ column: string; direction: "asc" | "desc" }`

### `department_selection` 登录挑战

内置的 `department_selection` 登录挑战在挑战负载和每个部门条目上都携带一个自由格式的 `meta` 字段。框架本身仅传输这些数据；项目声明登录界面实际读取的键。不存在名为 `DepartmentSelectionChallengeMeta` 的导出类型——该形状通过 `Register['challenges']` 增补声明，并由 `ResolvedChallenges` 携带。

每个部门条目有一个可选的 `meta?: { orgId?: string; parentId?: string }`——`orgId` 标识该部门属于哪个组织，`parentId` 用于渲染树形结构。挑战级别的 `meta` 携带 `organizations`——部门所挂靠的组织层级——即 `meta?: { organizations?: Array<{ id: string; name: string; parentId?: string }> }`。

组织数据放在挑战级别的 `meta` 中，而不是作为额外的 `departments` 条目，因为 `departments` 列表中的每个条目都是可选的——把分组节点列在其中会使其成为可选项。

```ts
declare module "@vef-framework-react/starter" {
  interface Register {
    challenges: {
      department_selection: {
        data: {
          departments: Array<{
            id: string;
            name: string;
            meta?: { orgId?: string; parentId?: string };
          }>;
          meta?: {
            organizations?: Array<{ id: string; name: string; parentId?: string }>;
          };
        };
        response: string;
      };
    };
  }
}
```

### 扩展 `UserInfo.details`

`UserInfo.details` 通过 `Register` 接口解析，模式与 `@tanstack/react-query` 中 `mutationMeta` 的用法一致。在项目中增补一次，即可在 `UserInfo` 流经应用的所有位置获得强类型的用户属性:

```ts
// src/types/vef-augment.d.ts
declare module "@vef-framework-react/starter" {
  interface Register {
    userDetails: {
      department: string;
      organization: string;
    };
  }
}
```

完成此声明后，`userInfo.details.department` 在整个应用中都会被类型化为 `string`，且无需 fork 该框架。同一个 `Register` 接口也接受上述其他扩展点对应的 `appCustomState`、`menuMeta` 和 `challenges` 成员。

## 路由类型

- `RouterContext`

## Query 辅助函数

- `extractQueryParams`
- `noopMutationFn`
