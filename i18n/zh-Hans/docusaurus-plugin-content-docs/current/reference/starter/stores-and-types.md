---
sidebar_position: 5
title: Store、常量与类型
---

# Store、常量与类型

## Store 导出

| 导出 | 用途 |
| --- | --- |
| `useAppStore` | 登录状态、菜单、权限点、用户信息等应用状态 |
| `useTabStore` | 标签页状态 |
| `useThemeStore` | 主题状态 |

对应类型:

| 类型 | 用途 |
| --- | --- |
| `AppState` | 应用 store 状态 |
| `Tab` / `TabState` | 标签页类型 |
| `ColorScheme` / `ThemeColors` / `ThemeState` | 主题状态类型 |

## 常量导出

| 常量 | 用途 |
| --- | --- |
| `RELOAD_PAGE_EVENT` | 刷新页面事件名 |
| `ACCESS_DENIED_EVENT` | 无权限事件名 |
| `UNAUTHENTICATED_EVENT` | 未认证事件名 |
| `STORAGE_KEY_PREFIX_STORE` / `STORAGE_KEY_SUFFIX_STORE` | store 存储 key 片段 |
| `SYMBOL_PAGINATION` | 分页参数内部 key |
| `SYMBOL_SORT` | 排序参数内部 key |

## API / 领域类型

| 类型 | 推荐场景 |
| --- | --- |
| `IdEntity` | 仅有 id 的基础实体 |
| `CreatedEntity` | 带创建信息的实体 |
| `AuditedEntity` | 带创建和更新审计字段的实体 |
| `Many<T>` | 批量提交参数 |

## 用户和菜单类型

| 类型 | 推荐场景 |
| --- | --- |
| `Gender` | 用户性别枚举 |
| `UserMenuType` | 菜单节点类型 |
| `UserMenu` | 菜单树节点 |
| `UserInfo` | 当前登录用户 |
| `OrderSpec` | 排序字段描述 |

## 路由类型

| 类型 | 推荐场景 |
| --- | --- |
| `RouterContext` | 根路由与 router 上下文类型 |

## 查询辅助

| 导出 | 用途 |
| --- | --- |
| `extractQueryParams` | 从查询对象里拆出业务参数、分页和排序 |
| `noopMutationFn` | 需要占位 mutation 时的空实现 |
