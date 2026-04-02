---
sidebar_position: 5
title: Context Provider
---

# Context Provider

`@vef-framework-react/core` 提供了多个 React context provider 和 hook，构成应用的运行时上下文层。

## `AppContextProvider` 和 `useAppContext`

VEF 应用上下文承载了组件和 hook 所依赖的全局配置。

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

在应用代码中，通常通过 `starter.createApp().render()` 来设置，而不是直接使用。

### `AppContext`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `hasPermission` | `(token: string) => boolean` | 权限检查函数 |
| `dataDictQueryFn` | `QueryFunction<DataOption[], string>` | 数据字典查询函数 |
| `fileBaseUrl` | `string` | 文件访问基础 URL |

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

// 在事件处理器中命令式获取数据
const data = await apiClient.fetchQuery({
  queryKey: [getUserInfo.key],
  queryFn: getUserInfo
});
```

在 `ApiClientProvider` 外部使用时会抛出错误。

---

## `DisabledProvider` 和 `useDisabled`

通过组件树传播禁用状态。表单和操作组件内部使用此机制一次性禁用所有交互元素。

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

创建支持选择器订阅的 React context，避免不必要的重渲染。

```ts
import { createContextWithSelector } from "@vef-framework-react/core";

const { Provider, useContext: useMyContext } = createContextWithSelector<MyState>({
  count: 0,
  name: ""
});

// 在组件中
const count = useMyContext(state => state.count);
```

### 类型导出

| 类型 | 说明 |
| --- | --- |
| `AppContext` | VEF 应用上下文接口 |
| `SelectorContextProviderProps<T>` | 选择器 context provider 的 props 类型 |
| `SelectorContextResult<T>` | `createContextWithSelector` 的返回类型 |
| `UseSelectorContext<T>` | `createContextWithSelector` 返回的 hook 类型 |

---

## `checkPermission`

在 React 组件外部进行命令式权限检查的工具函数。

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

- `"any"`：至少一个 token 匹配即通过
- `"all"`：所有 token 都匹配才通过

---

## 通用类型

### `PaginationParams`

```ts
interface PaginationParams {
  page?: number;  // 默认：1
  size?: number;  // 默认：15
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

select、tree-select、cascader 等数据驱动组件的基础类型：

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

扩展了 `DataOption`，增加拼音字段以支持中文字符搜索：

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
