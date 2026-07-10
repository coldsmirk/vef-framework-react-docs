---
title: Hooks
description: The full VEF hook catalog — permission checks, data dictionaries, uploads, loading state, and deep/shallow comparison helpers.
---

# Hooks

`@vef-framework-react/hooks` is not just a miscellaneous utilities package. It mainly provides page-level hooks that appear frequently in real applications but do not fit naturally inside components or stores, plus a small set of re-exported third-party hooks so business code has one stable import source. For exact TypeScript signatures, see [VEF Hooks](../reference/hooks/vef-hooks.md) and [Upstream Hook Exports](../reference/hooks/upstream-hooks.md); this page is the catalog of what exists and when to reach for it.

## Core Hooks to Know First

| Hook | Purpose |
| --- | --- |
| `useDictionaryQuery` | Fetch options from the application data-dictionary function |
| `useDataOptionsQuery` | Convert arbitrary list data into a normalized options shape |
| `useCheckPermission` | Get a reusable permission-check function |
| `useIsAuthorized` | Check whether current permissions satisfy a condition |
| `useAuthorizedItems` | Filter configuration items by permission |
| `useUpload` | Drive a single resumable chunked upload |
| `useHasFetching` | Check whether a class of queries is still loading |
| `useHasMutating` | Check whether a class of mutations is still running |

## `useDictionaryQuery`

Once `appContext.dictionaryQueryFn` is provided in `createApp().render()`, dictionaries can be requested using an alias map. Each alias becomes a key on the resolved data:

```tsx
const { data, isFetching } = useDictionaryQuery({
  gender: "common.gender",
  status: "user.status"
});

// data is `undefined` until the query resolves.
const genderOptions = data?.gender ?? [];
```

Notes:

- `useDictionaryQuery(keys, options?)` returns a native `UseQueryResult<TData>`; `data` is `undefined` until the request finishes successfully.
- `options.enabled` defers the request, e.g. while upstream parameters are not ready.
- `options.select` lets callers reshape the resolved alias map. Its identity is forwarded to React Query, so stabilize `keys` and `select` with module scope, `as const`, `useMemo`, or `useCallback` to avoid invalidating memoization on every render.
- For typical select usage prefer `useDictionaryOptionsSelect` (in `@vef-framework-react/components`, see [Data Dictionaries](./data-dictionaries.md)), which wraps `useDictionaryQuery` and produces ready-to-spread `SelectProps` per alias.

## `useDataOptionsQuery`

When backend data is not already shaped as `label`/`value`, this hook provides a consistent conversion layer.

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

It returns `options`, query state fields, and the rest of the underlying query result.

## Permission Hooks

`useCheckPermission`, `useIsAuthorized`, and `useAuthorizedItems` share one permission model with `PermissionGate` and route guards. Their usage — imperative checks, render-time checks, and config-array filtering — is documented with examples in [Permissions](./permissions.md); exact signatures live in [VEF Hooks](../reference/hooks/vef-hooks.md#permission-hooks).

## `useUpload`

Drives a single chunked, resumable upload through the framework's storage RPC and exposes a reactive snapshot plus imperative controls:

```tsx
const { upload, abort, progress, status, isUploading } = useUpload({
  onSuccess: result => console.log(result.key)
});

await upload(file);
```

`useUpload` is intentionally scoped to one upload per consumer. For batch uploads running in parallel, use the headless `Uploader` class from `@vef-framework-react/core` directly.

For a form-attached upload field, see [Upload](../components/upload.md); reach for the headless `useUpload`/`Uploader` shown above for large or resumable uploads outside a form.

## Loading-State Hooks

### `useHasFetching`

```tsx
const isUserPageFetching = useHasFetching(findUserPage.key, searchParams);
```

### `useHasMutating`

```tsx
const isCreatingUser = useHasMutating(createUser.key);
```

These two hooks are especially useful for page-level loading coordination, disabling actions while requests are running, and avoiding duplicate submissions.

## Deep and Shallow Comparison Hooks

Dependency arrays that contain objects or arrays defeat React's default reference equality. Reach for one of these instead, matched to the hook it wraps:

- for `useMemo`, use `useDeepMemo` / `useShallowMemo`
- for `useCallback`, use `useDeepCallback` / `useShallowCallback`
- for `useEffect` (and the `useLayoutEffect` / isomorphic-effect variants), use `useDeepEffect` / `useShallowEffect`
- to stabilize a dependency array directly, without wrapping another hook, use `useDeepCompare` / `useShallowCompare`

Reach for the shallow variants first — they are cheaper — and only move to the deep variants when dependencies are nested objects or arrays that change by value, not by reference. See [VEF Hooks](../reference/hooks/vef-hooks.md) for the full signature list, including the layout and isomorphic effect variants.

## Event and Environment Hooks

- for a `document`-level listener that never sees a stale closure, use `useDocumentEvent`
- to subscribe to an `EventEmitter` (from `@vef-framework-react/shared`), use `useEmitterEvent`
- to read the latest prop/state value inside a stable callback, use `useLatest`
- for high-frequency updates like scroll or resize, batch state with `useRafState`
- to create a value once and keep it stable across renders, use `useSingleton`
- for responsive layout, track raw viewport size with `useViewportSize` or resolve named breakpoints with `useBreakpoints`

See [VEF Hooks](../reference/hooks/vef-hooks.md) for exact signatures.

## Other Frequently Used Exports

`@vef-framework-react/hooks` also re-exports several widely used hooks from Mantine and `react-hotkeys-hook`, including:

- `useDebouncedValue`, `useDebouncedCallback`, `useDebouncedState`
- `useElementSize`, `useResizeObserver`, `useIntersection`
- `useDocumentTitle`, `useMediaQuery`, `useColorScheme`, `useReducedMotion`
- `useInterval`, `useTimeout`, `usePrevious`, `useMutationObserverTarget`
- `useHotkeys`, `useHotkeysContext`, `useRecordHotkeys`, `HotkeysProvider`

Their main value is consistency: the project can import these capabilities from the framework's hooks layer instead of exposing several separate third-party entry points in business code. See [Upstream Hook Exports](../reference/hooks/upstream-hooks.md) for the complete list and upstream documentation links.
