---
title: Store 与类型
description: app/tab/theme 三个 Zustand store，以及 @vef-framework-react/starter 导出的领域、用户和路由类型。
---

# Store 与类型

## Store 导出

- `useAppStore` —— 认证状态、当前用户信息、菜单映射与权限令牌；持久化（`isAuthenticated` / `custom` / `authTokens` 在刷新后保留）。
- `useTabStore` —— 支撑多标签页布局的已打开标签列表；持久化。
- `useThemeStore` —— 配色方案、语义主题颜色、菜单布局模式与布局开关；持久化。

三者均通过 `createPersistedStore` 创建（参见 [Store 与 Atom](../core/store-and-atom.md)）——它们的状态类型不需要 `name` 字段，存储键改由持久化选项提供。

相关类型:

- `AppState`
- `Tab`
- `TabState`
- `ColorScheme` —— `"system" | "light" | "dark"`
- `ThemeColors` —— `Record<SemanticColor, string>`
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
- `Register` —— 空接口，各项目通过 `declare module` 增补，用于细化 `UserInfo['details']`、`AppState.custom`、`UserMenuMeta` 以及登录挑战注册表
- `UserDetails` —— 当 `Register['userDetails']` 未被增补时的兜底形状（`Record<string, unknown>`）
- `OrderSpec` —— `{ column: string; direction: "asc" | "desc" }`

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
