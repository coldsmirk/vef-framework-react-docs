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
    dictionaryQueryFn: findDataDict,
    fileBaseUrl: "https://cdn.example.com"
  }}
>
  <App />
</AppContextProvider>
```

在应用代码中，通常通过 `starter.createApp().render()` 来完成配置，而不是直接使用。

### `AppContext`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `hasPermission` | `(token: string) => boolean` | 权限检查函数 |
| `dictionaryQueryFn` | `QueryFunction<Record<string, DataOption[]>, string[]>` | 用于获取数据字典条目的查询函数；接收一个字典键数组，返回一个将每个键映射到其选项的记录 |
| `fileBaseUrl` | `string` | 文件访问的基础 URL |

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

在组件树中传播禁用状态，供表单和操作组件内部使用，以一次性禁用所有交互元素。

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

Select、树选择、级联选择等数据驱动组件所使用的基础类型：

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

在 `DataOption` 基础上扩展（去掉 `children`，并以携带拼音的元素类型重新声明）拼音字段，用于中文字符检索：

```ts
type DataOptionWithPinyin<T = {}, M = {}> = Except<DataOption<T, M>, "children"> & {
  labelPinyin: string;
  labelPinyinInitials: string;
  descriptionPinyin?: string;
  descriptionPinyinInitials?: string;
  children?: DataOptionWithPinyin<T, M>[];
};
```
