---
title: 上下文提供者
description: AppContextProvider、ApiClientProvider、DisabledProvider、createContextWithSelector 及其携带的通用类型。
---

# 上下文提供者

`@vef-framework-react/core` 提供了多个 React 上下文提供者和 Hook，构成应用运行时的上下文层。

## `AppContextProvider` 和 `useAppContext`

VEF 应用上下文携带组件和 Hook 所依赖的应用级配置。

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

在应用代码中，通常通过 `starter.createApp().render()` 来完成配置，而不是直接使用。

### `AppContext`

所有字段均为可选；默认的上下文值为 `{}`。

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `hasPermission` | `(token: string) => boolean` | — | 判断用户是否有权访问由权限 token 标识的资源，例如 `hasPermission("user:query")`。消费方（权限 Hooks、`checkPermission` 的调用者）将缺失该函数视为“始终允许”。 |
| `codeSetQueryFn` | `QueryFunction<Record<string, DataOption[]>, string[]>` | — | 用于获取宿主码集条目的查询函数（由 `dictionaryQueryFn` 重命名而来）。接收一个码集 key 数组，返回一个将每个 key 映射到其选项的记录。由 [`useCodeSetQuery`](../hooks/vef-hooks.md#码集与选项-hooks) 消费，未配置该字段时后者会抛出异常。参见[码集指南](../../guide/code-sets.md)。 |
| `fileBaseUrl` | `string` | — | 文件访问的基础 URL（由文件渲染组件拼接到相对文件 key 之前）。 |

### `useAppContext`

```tsx
import { useAppContext } from "@vef-framework-react/core";

const { hasPermission, fileBaseUrl } = useAppContext();
```

---

## `ApiClientProvider` 和 `useApiClient`

向 React 树提供 `ApiClient` 实例，同时用 TanStack 的 `QueryClientProvider` 包裹子组件。

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

在 `ApiClientProvider` 之外使用会抛出异常。

---

## `DisabledProvider` 和 `useDisabled`

在组件树中传播禁用状态（`boolean`，默认 `false`），供表单和操作组件内部使用，以一次性禁用所有交互元素。

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

创建一个基于选择器订阅的 React 上下文，以避免不必要的重新渲染。

```ts
createContextWithSelector<TValue>(defaultValue: TValue): SelectorContextResult<TValue>
```

返回 `{ Provider, useContext }`。`Provider` 接受一个普通的 `value` prop；消费方仅在其选中的切片变化时重新渲染（通过 `useSyncExternalStore` 以 `Object.is` 比较）。不带选择器调用 `useContext()` 返回完整的上下文值。

```ts
import { createContextWithSelector } from "@vef-framework-react/core";

const { Provider, useContext: useMyContext } = createContextWithSelector<MyState>({
  count: 0,
  name: ""
});

// In component
const count = useMyContext(state => state.count);
```

### 类型导出

| 类型 | 说明 |
| --- | --- |
| `AppContext` | VEF 应用上下文接口 |
| `SelectorContextProviderProps<T>` | 选择器上下文提供者的 Props |
| `SelectorContextResult<T>` | `createContextWithSelector` 的返回类型 |
| `UseSelectorContext<T>` | `createContextWithSelector` 返回的 Hook 类型 |

---

## `checkPermission`

用于在 React 组件之外进行命令式权限检查的工具函数。

```ts
checkPermission(
  hasPermission: (token: string) => boolean,
  requiredPermissions?: MaybeArray<string>,
  checkMode: PermissionCheckMode = "any"
): boolean
```

当 `requiredPermissions` 为空值（nullish）时返回 `true`（不要求任何权限即视为允许访问）。单个字符串会被当作只有一个元素的数组处理。

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

- `"any"`：只要有一个 token 匹配即通过
- `"all"`：仅当所有 token 都匹配才通过

---

## 通用类型

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

Select、树选择、级联选择等数据驱动组件所使用的基础类型。`T` 用于向选项合并额外的自定义字段；`M` 用于约束 `meta` 字段的类型：

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

在 `DataOption` 基础上扩展（去掉 `children`，并以携带拼音的元素类型重新声明）拼音字段，用于中文字符检索：

```ts
type DataOptionWithPinyin<T = EmptyObject, M extends AnyObject = AnyObject> = Except<DataOption<T, M>, "children"> & {
  labelPinyin: string;
  labelPinyinInitials: string;
  descriptionPinyin?: string;
  descriptionPinyinInitials?: string;
  children?: Array<DataOptionWithPinyin<T, M>>;
};
```
