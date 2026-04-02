---
sidebar_position: 6
title: Hooks
---

# Hooks

`@vef-framework-react/hooks` 不是“杂项工具箱”，它主要补的是页面层会高频遇到、但又不适合塞进组件或 store 的能力。

## 最值得优先掌握的 hooks

| Hook | 解决什么问题 |
| --- | --- |
| `useDataDictQuery` | 从应用上下文的数据字典函数拉选项 |
| `useDataOptionsQuery` | 把任意列表数据转换为统一选项结构 |
| `useCheckPermission` | 拿到一个可复用的权限判断函数 |
| `useIsAuthorized` | 直接判断当前权限是否满足 |
| `useAuthorizedItems` | 过滤带权限要求的配置项 |
| `useHasFetching` | 判断某类 query 是否还在加载 |
| `useHasMutating` | 判断某类 mutation 是否还在执行 |

## `useDataDictQuery`

只要你在 `createApp().render()` 里提供了 `appContext.dataDictQueryFn`，就可以这样用:

```tsx
const genderQuery = useDataDictQuery({
  dataDictKey: "common.gender"
});
```

它非常适合:

- 枚举下拉
- 状态字典
- 系统级基础选项

## `useDataOptionsQuery`

当后端返回的不是 `label/value` 标准结构时，用这个 hook 统一转换最省事。

```tsx
const roleOptions = useDataOptionsQuery({
  queryOptions: {
    queryKey: [findRoleOptions.key],
    queryFn: findRoleOptions
  },
  labelKey: "name",
  valueKey: "id"
});
```

它会返回:

- `options`
- 查询状态字段
- 原始 query 的其它结果能力

## 权限相关 hooks

### `useCheckPermission`

```tsx
const checkPermission = useCheckPermission();

if (checkPermission("sys:user:create")) {
  // ...
}
```

### `useIsAuthorized`

```tsx
const canEdit = useIsAuthorized(["sys:user:update", "sys:user:write"], "any");
```

### `useAuthorizedItems`

特别适合菜单、按钮配置、操作列表这类“先声明数组，再按权限过滤”的场景。

```tsx
const visibleActions = useAuthorizedItems([
  { key: "create", permTokens: "sys:user:create" },
  { key: "delete", permTokens: "sys:user:delete" }
]);
```

## 加载状态 hooks

### `useHasFetching`

```tsx
const isUserPageFetching = useHasFetching(findUserPage.key, searchParams);
```

### `useHasMutating`

```tsx
const isCreatingUser = useHasMutating(createUser.key);
```

这两个 hook 很适合:

- 页面级 loading 联动
- 按钮禁用态
- 避免重复提交

## 其它常用导出

`@vef-framework-react/hooks` 还整理并复导出了不少来自 Mantine、AI SDK、热键库的能力，常见的包括:

- `useDebouncedValue`
- `useElementSize`
- `useDocumentTitle`
- `useInterval`
- `useMediaQuery`
- `useHotkeys`
- `useChat`

它们的价值主要在于: 你可以统一从框架层拿，而不必在业务项目里自己散装组织依赖入口。
