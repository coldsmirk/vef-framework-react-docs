---
sidebar_position: 6
title: Hooks
---

# Hooks

`@vef-framework-react/hooks` is not just a miscellaneous utilities package. It mainly provides page-level hooks that appear frequently in real applications but do not fit naturally inside components or stores.

## Core Hooks to Know First

| Hook | Purpose |
| --- | --- |
| `useDataDictQuery` | Fetch options from the application data-dictionary function |
| `useDataOptionsQuery` | Convert arbitrary list data into a normalized options shape |
| `useCheckPermission` | Get a reusable permission-check function |
| `useIsAuthorized` | Check whether current permissions satisfy a condition |
| `useAuthorizedItems` | Filter configuration items by permission |
| `useHasFetching` | Check whether a class of queries is still loading |
| `useHasMutating` | Check whether a class of mutations is still running |

## `useDataDictQuery`

Once `appContext.dataDictQueryFn` is provided in `createApp().render()`, it can be used like this:

```tsx
const genderQuery = useDataDictQuery({
  dataDictKey: "common.gender"
});
```

Typical cases:

- enum selects
- status dictionaries
- shared system options

## `useDataOptionsQuery`

When backend data is not already shaped as `label/value`, this hook provides a consistent conversion layer.

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

It returns:

- `options`
- query state fields
- the rest of the underlying query result

## Permission Hooks

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

This is especially useful for menus, button configs, and action lists that are declared first and filtered later.

```tsx
const visibleActions = useAuthorizedItems([
  { key: "create", permTokens: "sys:user:create" },
  { key: "delete", permTokens: "sys:user:delete" }
]);
```

## Loading-State Hooks

### `useHasFetching`

```tsx
const isUserPageFetching = useHasFetching(findUserPage.key, searchParams);
```

### `useHasMutating`

```tsx
const isCreatingUser = useHasMutating(createUser.key);
```

These two hooks are especially useful for:

- page-level loading coordination
- disabling actions while requests are running
- avoiding duplicate submissions

## Other Frequently Used Exports

`@vef-framework-react/hooks` also re-exports several widely used hooks from Mantine, the AI SDK, and hotkey libraries, including:

- `useDebouncedValue`
- `useElementSize`
- `useDocumentTitle`
- `useInterval`
- `useMediaQuery`
- `useHotkeys`
- `useChat`

Their main value is consistency: the project can import these capabilities from the framework layer instead of exposing several separate third-party entry points in business code.
