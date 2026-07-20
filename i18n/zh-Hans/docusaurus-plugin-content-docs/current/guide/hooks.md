---
title: Hooks
description: 完整的 VEF hook 目录 —— 权限检查、码集、服务端推送、上传、加载状态，以及深/浅比较辅助工具。
---

# Hooks

`@vef-framework-react/hooks` 并不只是一个杂项工具包。它主要提供在真实应用中会频繁出现、但又不适合放进组件或 store 里的页面级 hook，外加一小部分重新导出的第三方 hook，让业务代码有一个统一稳定的导入来源。精确的 TypeScript 签名见 [VEF Hooks](../reference/hooks/vef-hooks.md) 和 [上游直出 Hooks](../reference/hooks/upstream-hooks.md)；本篇是关于有哪些 hook、以及何时该用它们的目录。

## 首先应该了解的核心 hooks

| Hook | 用途 |
| --- | --- |
| `useCodeSetQuery` | 从应用的码集函数中拉取选项 |
| `useDataOptionsQuery` | 把任意的列表数据转换成统一的选项结构 |
| `usePushMessage` | 订阅服务端推送的消息信封，并自动清理 |
| `useCheckPermission` | 获取一个可复用的权限判断函数 |
| `useIsAuthorized` | 判断当前权限是否满足某个条件 |
| `useAuthorizedItems` | 按权限过滤配置项 |
| `useUpload` | 驱动一次可续传的分片上传 |
| `useHasFetching` | 判断某一类查询是否仍在加载 |
| `useHasMutating` | 判断某一类变更是否仍在执行 |

## `useCodeSetQuery`

一旦在 `createApp().render()` 中提供了 `appContext.codeSetQueryFn`，就可以用别名映射的方式请求码集。每个别名会成为解析结果上的一个 key：

```tsx
const { data, isFetching } = useCodeSetQuery({
  gender: "common.gender",
  status: "md.staff.status"
});

// data is `undefined` until the query resolves.
const genderOptions = data?.gender ?? [];
```

注意事项：

- `useCodeSetQuery(keys, options?)` 返回原生的 `UseQueryResult<TData>`；在请求成功完成之前，`data` 都是 `undefined`。
- `options.enabled` 用于推迟请求，例如在上游参数尚未就绪时。
- `options.select` 允许调用方对解析后的别名映射做二次加工。它的引用会被透传给 React Query，因此需要用模块作用域、`as const`、`useMemo` 或 `useCallback` 把 `keys` 和 `select` 稳定下来，避免每次渲染都让 memoization 失效。
- 键名可以通过 `Register['codeSetKeys']` 扩充被约束为类型化的联合类型——通常由 `vef gen:code-set-keys` 生成；见 [码集](./code-sets.md)。
- 典型的 select 用法优先使用 `useCodeSetOptionsSelect`（位于 `@vef-framework-react/components`，见 [码集](./code-sets.md)），它对 `useCodeSetQuery` 做了一层封装，按别名直接产出可以展开使用的 `SelectProps`。

:::info

`useCodeSetQuery` 是 `useDictionaryQuery` 更名后的新名称（尚未发布，位于 v2.12.0 之后）。完整的旧名到新名对照表见 [码集](./code-sets.md)。

:::

## `useDataOptionsQuery`

当后端数据还没有被整理成 `label`/`value` 形态时，这个 hook 提供了一层统一的转换。

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

它返回 `options`、查询状态字段，以及底层查询结果的其余部分。

## `usePushMessage`

在一个 `PushClient` 上订阅某种信封类型的服务端推送消息，并在卸载时自动取消订阅。传 `"*"` 可接收所有消息：

```tsx
import { usePushMessage } from "@vef-framework-react/hooks";

import { pushClient } from "../push-client";

usePushMessage<OrderStatusPayload>(pushClient, "order.status_changed", message => {
  console.log("Order updated:", message.payload);
});
```

客户端通常是用 `@vef-framework-react/core` 的 `createPushClient` 创建的应用级单例。每当 `client`、`type` 或处理器的引用变化时，订阅都会重新建立；在高频渲染的组件中请用 `useCallback` 稳定处理器。完整接线方式见 [服务端推送](./server-push.md)，客户端 API 见 [服务端推送（参考）](../reference/core/push.md)。

## 权限相关 Hooks

`useCheckPermission`、`useIsAuthorized` 和 `useAuthorizedItems` 与 `PermissionGate`、路由守卫共享同一套权限模型。它们的用法——命令式检查、渲染期检查、配置数组过滤——连同示例见[权限](./permissions.md)；精确签名见 [VEF Hooks](../reference/hooks/vef-hooks.md#权限-hooks)。

## `useUpload`

通过框架的存储 RPC 驱动一次分片、可续传的上传，并暴露一份响应式快照加上命令式的控制方法：

```tsx
const { upload, abort, progress, status, isUploading } = useUpload({
  onSuccess: result => console.log(result.key)
});

await upload(file);
```

`useUpload` 有意被限定为每个使用方只处理一次上传。如果需要并行的批量上传，请直接使用 `@vef-framework-react/core` 中无头的 `Uploader` 类。

如果需要一个绑定在表单里的上传字段，见 [Upload](../components/upload.md)；上面这种表单之外的大文件或可续传上传，则使用无头的 `useUpload`/`Uploader`。

## 加载状态 Hooks

### `useHasFetching`

```tsx
const isUserPageFetching = useHasFetching(findUserPage.key, searchParams);
```

### `useHasMutating`

```tsx
const isCreatingUser = useHasMutating(createUser.key);
```

这两个 hook 特别适合页面级的加载态协调、在请求进行中禁用操作，以及避免重复提交。

## 深比较与浅比较 Hooks

依赖数组中包含对象或数组时，会破坏 React 默认的引用相等判断。按它所包装的 hook 来选择对应的变体：

- 包装 `useMemo`，用 `useDeepMemo` / `useShallowMemo`
- 包装 `useCallback`，用 `useDeepCallback` / `useShallowCallback`
- 包装 `useEffect`（以及 `useLayoutEffect` / 同构 effect 变体），用 `useDeepEffect` / `useShallowEffect`
- 只需要稳定一个依赖数组本身、不包装其他 hook 时，用 `useDeepCompare` / `useShallowCompare`

优先使用浅比较的变体——它们成本更低——只有当依赖是按值变化而非按引用变化的嵌套对象或数组时，才转而使用深比较的变体。完整签名（包括 layout 和同构 effect 变体）见 [VEF Hooks](../reference/hooks/vef-hooks.md)。

## 事件与环境 Hooks

- 需要一个不产生过期闭包的 `document` 级别监听器，用 `useDocumentEvent`
- 订阅一个 `EventEmitter`（来自 `@vef-framework-react/shared`），用 `useEmitterEvent`
- 需要在稳定的回调内读取最新的 props/state，用 `useLatest`
- 滚动或 resize 这类高频更新，用 `useRafState` 批量处理状态
- 只创建一次值、并在多次渲染间保持稳定，用 `useSingleton`
- 响应式布局场景，用 `useViewportSize` 追踪原始视口尺寸，或用 `useBreakpoints` 解析已命名的断点

精确签名见 [VEF Hooks](../reference/hooks/vef-hooks.md)。

## 其它常用导出

`@vef-framework-react/hooks` 还重新导出了若干来自 Mantine 和 `react-hotkeys-hook` 的常用 hook，包括：

- `useDebouncedValue`、`useDebouncedCallback`、`useDebouncedState`
- `useElementSize`、`useResizeObserver`、`useIntersection`
- `useDocumentTitle`、`useMediaQuery`、`useColorScheme`、`useReducedMotion`
- `useInterval`、`useTimeout`、`usePrevious`、`useMutationObserverTarget`
- `useHotkeys`、`useHotkeysContext`、`useRecordHotkeys`、`HotkeysProvider`

它们的主要价值在于一致性：项目可以直接从框架的 hooks 层导入这些能力，而不必在业务代码中暴露多个独立的第三方入口。完整列表和上游文档链接见 [上游直出 Hooks](../reference/hooks/upstream-hooks.md)。
