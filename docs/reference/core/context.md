---
title: Context Providers
description: AppContextProvider, ApiClientProvider, DisabledProvider, createContextWithSelector, and the common types they carry.
---

# Context Providers

`@vef-framework-react/core` provides several React context providers and hooks that form the application's runtime context layer.

## `AppContextProvider` and `useAppContext`

The VEF app context carries application-wide configuration that components and hooks depend on.

```tsx
import { AppContextProvider } from "@vef-framework-react/core";

<AppContextProvider
  value={{
    hasPermission: token => permissionStore.has(token),
    codeSetQueryFn: findCodeSets,
    fileBaseUrl: "https://cdn.example.com"
  }}
>
  <App />
</AppContextProvider>
```

In application code, this is usually set up through `starter.createApp().render()` rather than directly.

### `AppContext`

All fields are optional; the default context value is `{}`.

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `hasPermission` | `(token: string) => boolean` | — | Whether the user is authorized to access the resource identified by the permission token, e.g. `hasPermission("user:query")`. Consumers (the permission hooks, `checkPermission` callers) treat a missing function as "always allowed". |
| `codeSetQueryFn` | `QueryFunction<Record<string, DataOption[]>, string[]>` | — | Query function for fetching host code set entries (renamed from `dictionaryQueryFn`). Accepts an array of code set keys and returns a record mapping each key to its options. Consumed by [`useCodeSetQuery`](../hooks/vef-hooks.md#code-set-and-options-hooks), which throws when this field is not configured. See the [Code Sets guide](../../guide/code-sets.md). |
| `fileBaseUrl` | `string` | — | Base URL for file access (prepended to relative file keys by file-rendering components). |

### `useAppContext`

```tsx
import { useAppContext } from "@vef-framework-react/core";

const { hasPermission, fileBaseUrl } = useAppContext();
```

---

## `ApiClientProvider` and `useApiClient`

Provides the `ApiClient` instance to the React tree. Also wraps children with TanStack's `QueryClientProvider`.

```tsx
import { ApiClientProvider } from "@vef-framework-react/core";

<ApiClientProvider value={apiClient}>
  <App />
</ApiClientProvider>
```

### `useApiClient`

```tsx
import { useApiClient } from "@vef-framework-react/core";

const apiClient = useApiClient();

// Imperative fetch inside an event handler
const data = await apiClient.fetchQuery({
  queryKey: [getUserInfo.key],
  queryFn: getUserInfo
});
```

Throws if used outside `ApiClientProvider`.

---

## `DisabledProvider` and `useDisabled`

Propagates a disabled state (`boolean`, default `false`) through the component tree. Used internally by form and action components to disable all interactive elements at once.

```tsx
import { DisabledProvider } from "@vef-framework-react/core";

<DisabledProvider value={isSubmitting}>
  <FormFields />
</DisabledProvider>
```

```tsx
import { useDisabled } from "@vef-framework-react/core";

const disabled = useDisabled();
```

---

## `createContextWithSelector`

Creates a React context with selector-based subscription to avoid unnecessary re-renders.

```ts
createContextWithSelector<TValue>(defaultValue: TValue): SelectorContextResult<TValue>
```

Returns `{ Provider, useContext }`. `Provider` takes a plain `value` prop; consumers re-render only when their selected slice changes (`Object.is` comparison via `useSyncExternalStore`). Calling `useContext()` without a selector returns the full value.

```ts
import { createContextWithSelector } from "@vef-framework-react/core";

const { Provider, useContext: useMyContext } = createContextWithSelector<MyState>({
  count: 0,
  name: ""
});

// In component
const count = useMyContext(state => state.count);
```

### Type Exports

| Type | Description |
| --- | --- |
| `AppContext` | The VEF app context interface |
| `SelectorContextProviderProps<T>` | Props for the selector context provider |
| `SelectorContextResult<T>` | Return type of `createContextWithSelector` |
| `UseSelectorContext<T>` | Hook type returned by `createContextWithSelector` |

---

## `checkPermission`

Utility function for imperative permission checks outside React components.

```ts
checkPermission(
  hasPermission: (token: string) => boolean,
  requiredPermissions?: MaybeArray<string>,
  checkMode: PermissionCheckMode = "any"
): boolean
```

Returns `true` when `requiredPermissions` is nullish (nothing required means access is allowed). A single string is treated as a one-element array.

```ts
import { checkPermission } from "@vef-framework-react/core";

const canCreate = checkPermission(
  hasPermission,
  ["sys:user:create"],
  "any"
);
```

### `PermissionCheckMode`

```ts
type PermissionCheckMode = "any" | "all";
```

- `"any"`: passes if at least one token matches
- `"all"`: passes only if all tokens match

---

## Common Types

### `PaginationParams`

```ts
interface PaginationParams {
  page?: number;  // default: 1
  size?: number;  // default: 15
}
```

### `PaginationResult<T>`

```ts
interface PaginationResult<T> {
  readonly total: number;
  readonly items: T[];
}
```

### `DataOption<T, M>`

Base type for select, tree-select, cascader, and other data-driven components. `T` merges additional custom fields into the option; `M` types the `meta` field:

```ts
type DataOption<T = EmptyObject, M extends AnyObject = AnyObject> = T & {
  label: string;          // display text
  value: Key;             // unique identifier
  disabled?: boolean;     // default: false
  description?: string;   // additional help text
  meta?: M;               // additional metadata
  children?: Array<DataOption<T, M>>; // tree-like structures (TreeSelect, Cascader)
};
```

### `DataOptionWithPinyin<T, M>`

Extends `DataOption` (minus `children`, which is redeclared with the pinyin-carrying element type) with pinyin fields for Chinese character search:

```ts
type DataOptionWithPinyin<T = EmptyObject, M extends AnyObject = AnyObject> = Except<DataOption<T, M>, "children"> & {
  labelPinyin: string;
  labelPinyinInitials: string;
  descriptionPinyin?: string;
  descriptionPinyinInitials?: string;
  children?: Array<DataOptionWithPinyin<T, M>>;
};
```
