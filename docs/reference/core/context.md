---
sidebar_position: 5
title: Context Providers
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
    dataDictQueryFn: findDataDict,
    fileBaseUrl: "https://cdn.example.com"
  }}
>
  <App />
</AppContextProvider>
```

In application code, this is usually set up through `starter.createApp().render()` rather than directly.

### `AppContext`

| Field | Type | Description |
| --- | --- | --- |
| `hasPermission` | `(token: string) => boolean` | Permission check function |
| `dataDictQueryFn` | `QueryFunction<DataOption[], string>` | Data dictionary query function |
| `fileBaseUrl` | `string` | Base URL for file access |

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

Propagates a disabled state through the component tree. Used internally by form and action components to disable all interactive elements at once.

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

Base type for select, tree-select, cascader, and other data-driven components:

```ts
type DataOption<T = {}, M = {}> = T & {
  label: string;
  value: Key;
  disabled?: boolean;
  description?: string;
  meta?: M;
  children?: DataOption<T, M>[];
};
```

### `DataOptionWithPinyin<T, M>`

Extends `DataOption` with pinyin fields for Chinese character search:

```ts
type DataOptionWithPinyin<T = {}, M = {}> = {
  label: string;
  value: Key;
  labelPinyin: string;
  labelPinyinInitials: string;
  descriptionPinyin?: string;
  descriptionPinyinInitials?: string;
  children?: DataOptionWithPinyin<T, M>[];
};
```
