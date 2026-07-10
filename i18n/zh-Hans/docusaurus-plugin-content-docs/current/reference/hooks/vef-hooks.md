---
title: VEF Hooks
description: "@vef-framework-react/hooks 中每个由 VEF 维护的 hook 的签名——权限、数据选项、字典、上传、深/浅比较等。"
---

# VEF Hooks

这里是 `@vef-framework-react/hooks` 维护的每个 hook 的详尽签名级索引。若需要叙述性的“何时用什么”版本，请参阅 [Hooks](../../guide/hooks.md)。该包的另一半——经同一入口重新导出的 Mantine 与快捷键 hooks——收录在[上游 Hook 导出](./upstream-hooks.md)中。

## 权限 Hooks

| Hook | Signature | Description |
| --- | --- | --- |
| `useCheckPermission` | `() => (requiredPermissions?: MaybeArray<string>, checkMode?: PermissionCheckMode) => boolean` | 返回一个稳定的函数，用于执行命令式的权限检查（例如在事件处理器内部）。 |
| `useIsAuthorized` | `(requiredPermissions?: MaybeArray<string>, checkMode?: PermissionCheckMode) => boolean` | 在渲染阶段直接检查权限——即 `useCheckPermission()(...)` 的 hook 形式。 |
| `useAuthorizedItems` | `<T extends PermissionAware>(items: T[]) => T[]` | 将配置数组过滤为当前用户有权限访问的项。`PermissionAware` 为 `{ requiredPermissions?: MaybeArray<string>; checkMode?: PermissionCheckMode }`（默认 `checkMode: "any"`）。 |

这三个 hook 都从 `AppContext` 中读取 `hasPermission`（参见 [上下文提供者](../core/context.md)），当应用上下文未提供该函数时默认使用 `() => true`。

## 数据与选项 Hooks

| Hook | Signature | Description |
| --- | --- | --- |
| `useDictionaryQuery` | `<const T extends DictionaryAliasMap, TData = DictionaryQueryData<T>>(keys: T, options?: UseDictionaryQueryOptions<T, TData>) => UseQueryResult<TData>` | 通过 `appContext.dictionaryQueryFn` 获取数据字典选项，以别名映射（例如 `{ gender: "common.gender" }`）为 key；每个别名都会成为解析后 `data` 中的一个 key。若未配置 `dictionaryQueryFn` 则抛出异常。`data` 遵循 React Query 语义——在查询完成前为 `undefined`。`options.enabled` 用于推迟发起请求；`options.select` 用于对解析后的别名映射做二次处理（其引用会被透传给 React Query 的 `select`，因此需要稳定该引用以避免每次渲染都重新执行）。在下拉选择场景中，优先使用对该 hook 做了封装的 `useDictionaryOptionsSelect`（来自 `@vef-framework-react/components`）。 |
| `resolveDictKey` | `(value: DictionaryKeyValue) => string` | 从纯字符串或 `DictionaryKeyConfig` 对象中提取字典 key。 |
| `useDataOptionsQuery` | `<TQueryFnData, TData, TParams>(config: UseDataOptionsQueryOptions<TQueryFnData, TData, TParams>) => UseDataOptionsQueryResult<TData, DataOption<TData>>`（或当 `config.withPinyin` 为 `true` 时的 `DataOptionWithPinyin<TData>`） | 将 `config.queryOptions` 传入 `useQuery` 执行，并通过可配置的 `labelKey` / `valueKey` / `disabledKey` / `descriptionKey` / `childrenKey` 提取器（字符串路径或函数）将解析后的数组转换为 `DataOption`，并递归处理嵌套的 `children`。返回 `{ options, ...restOfQueryResult }`（`useQuery` 结果中除 `data` 外的所有字段）。 |

### 类型

| 类型 | 说明 |
| --- | --- |
| `DictionaryAliasMap` | `{ [alias: string]: DictionaryKeyValue }`（不含数组/索引 key）——`useDictionaryQuery` 接受的别名映射结构。 |
| `DictionaryKey` | 字典 key 的字符串类型；当项目扩展了它时会收窄为 `Register['dictionaryKeys']`，否则为 `string`。 |
| `DictionaryKeyConfig` | `{ key: DictionaryKey; filterable?: boolean }`——带有单 key 级别覆盖项的字典 key。 |
| `DictionaryKeyValue` | `DictionaryKey \| DictionaryKeyConfig`。 |
| `DictionaryQueryData<T>` | `Record<Extract<keyof T, string>, DataOption[]>`——`useDictionaryQuery` 中 `data` 解析后的结构。 |
| `Register` | 空接口；可通过 `declare module "@vef-framework-react/hooks"` 扩展它，将 `DictionaryKey` 约束为一个已知的联合类型。 |
| `UseDictionaryQueryOptions<T, TData>` | `{ enabled?: boolean; select?: (data: DictionaryQueryData<T>) => TData }`。 |
| `FieldExtractor<TData, TValue>` | `string \| ((item: TData) => TValue)`——点路径字符串或取值函数。 |
| `UseDataOptionsQueryOptions<TQueryFnData, TData, TParams>` | `{ queryOptions: UseQueryOptions<TQueryFnData[], TData[], TParams>; labelKey?; valueKey?; disabledKey?; descriptionKey?; childrenKey?; withPinyin?: boolean }`。 |
| `UseDataOptionsQueryResult<TData, TOption>` | `Omit<UseQueryResult<TData[]>, "data"> & { options: TOption[] }`。 |

## 深/浅比较 Hooks

当依赖项是引用会变但值不变的对象/数组时，可直接替换内置的依赖数组 hooks。它们都构建在 `useDeepCompare` / `useShallowCompare` 之上，两者仅在数组发生（深层或浅层）差异时才递增内部信号；`undefined` 依赖项始终视为发生变化，与不传数组的 `useEffect(() => {})` 行为一致。

| Hook | Signature | Description |
| --- | --- | --- |
| `useDeepCompare` | `(dependencies?: DependencyList) => readonly [number]` | `useDeep*` 系列所基于的基础函数；返回一个可用作依赖数组的单元素信号元组。 |
| `useDeepCallback` | `<T extends Function>(callback: T, dependencies: DependencyList) => T` | 带深层依赖比较的 `useCallback`。 |
| `useDeepEffect` | `(effect: EffectCallback, dependencies?: DependencyList) => void` | 带深层依赖比较的 `useEffect`。 |
| `useDeepIsomorphicEffect` | `(effect: EffectCallback, dependencies?: DependencyList) => void` | 客户端使用 `useLayoutEffect`、服务端使用 `useEffect`，并带深层依赖比较。 |
| `useDeepLayoutEffect` | `(effect: EffectCallback, dependencies?: DependencyList) => void` | 带深层依赖比较的 `useLayoutEffect`。 |
| `useDeepMemo` | `<T>(factory: () => T, dependencies: DependencyList) => T` | 带深层依赖比较的 `useMemo`。 |
| `useShallowCompare` | `(dependencies?: DependencyList) => readonly [number]` | `useShallow*` 系列所基于的基础函数。 |
| `useShallowCallback` | `<T extends Function>(callback: T, dependencies: DependencyList) => T` | 带浅层依赖比较的 `useCallback`。 |
| `useShallowEffect` | `(effect: EffectCallback, dependencies?: DependencyList) => void` | 带浅层依赖比较的 `useEffect`。 |
| `useShallowIsomorphicEffect` | `(effect: EffectCallback, dependencies?: DependencyList) => void` | 客户端使用 `useLayoutEffect`、服务端使用 `useEffect`，并带浅层依赖比较。 |
| `useShallowLayoutEffect` | `(effect: EffectCallback, dependencies?: DependencyList) => void` | 带浅层依赖比较的 `useLayoutEffect`。 |
| `useShallowMemo` | `<T>(factory: () => T, dependencies: DependencyList) => T` | 带浅层依赖比较的 `useMemo`。 |

## 上传 Hook

| Hook | Signature | Description |
| --- | --- | --- |
| `useUpload` | `(options?: UseUploadOptions) => UseUploadResult` | 对 core 中支持分片、可续传的 `Uploader` 的 React 适配层，每个使用方同一时刻只作用于一个进行中的上传（再次调用 `upload()` 会取消上一次的执行）。如需并行/批量上传，请直接使用 `@vef-framework-react/core` 中的 `Uploader`。 |

`UseUploadOptions` 对应 `UploaderOptions`（来自 `core`），去掉了由 React 接管的字段，并新增了 `onProgress` / `onStatusChange` / `onSuccess` / `onError` 回调、`persistence`（一个 `ResumablePersistence`，默认使用 `LocalStoragePersistence`；传入 `null` 可禁用续传）、`fingerprinter`（当 `crypto.subtle` 可用时默认使用 `PrefixFingerprinter`，否则使用 `WeakFingerprinter`），以及 `onResumeDetected`。

`UseUploadResult` 为 `{ upload: (file: File | Blob, init?: UploadInit) => Promise<UploadResult>; abort: () => void; reset: () => void; status: UploadStatus; progress: UploadProgress; error: UploadError | null; result: UploadResult | null; isUploading: boolean }`。

## 事件与环境 Hooks

| Hook | Signature | Description |
| --- | --- | --- |
| `useDocumentEvent` | `<TType extends string>(type: TType, listener: (this: Document, event: DocumentEventMap[TType] \| CustomEvent) => void, options?: boolean \| AddEventListenerOptions) => void` | 添加一个 `document` 级别的事件监听器，并自动清理；监听器始终能看到最新的闭包（不存在闭包过期问题）。 |
| `useEmitterEvent` | `<TEvents>(emitter: EventEmitter<TEvents>, eventType: keyof TEvents, eventListener: EventHandler<TEvents[keyof TEvents]>) => void` | 订阅一个 `shared` 的 `EventEmitter` 事件，并自动清理。 |
| `useLatest` | `<T>(value: T) => MutableRefObject<T>` | 始终持有最新 `value` 的 ref，用于在稳定的回调函数内部读取当前 props/state，而无需将其加入依赖数组。 |
| `useRafState` | `<T>(initialState: T \| (() => T)) => [T, Dispatch<SetStateAction<T>>]` | 其 setter 通过 `requestAnimationFrame` 批量处理更新的 `useState`，适用于高频更新场景（滚动、resize、指针移动）。 |
| `useSingleton` | `<T>(initializer: () => T) => RefObject<T>` | 仅在首次渲染时创建一次值（例如 `new EventEmitter()`），并返回指向它的稳定 ref。 |
| `useViewportSize` | `() => { width: number; height: number }` | 跟踪 `window.innerWidth` / `innerHeight`，在 resize 和屏幕方向变化时更新（基于 `useRafState`）。 |
| `useBreakpoints` | `<T extends string>(breakpoints: Breakpoints<T>, options?: UseBreakpointsOptions<T>) => UseBreakpointsResult<T>` | 使用 `min-width` 媒体查询，跟踪当前匹配的命名断点。`Breakpoints<T> = Record<T, number \| string>`；需包含一个宽度为 `0` 的条目以覆盖最小的视口。返回 `{ current, value, matches }`——`current` 为当前匹配的最大断点名称。`options`：`{ initialBreakpoint?: T; getInitialValueInEffect?: boolean }`（用于控制 SSR 水合）。 |

## Query 与 Mutation 状态 Hooks

| Hook | Signature | Description |
| --- | --- | --- |
| `useHasFetching` | `(key: string, params?: unknown) => boolean` | 是否存在匹配 `key`（以及 `params`，如果提供）的活跃 query 正在请求中。 |
| `useHasMutating` | `(key: string) => boolean` | 是否存在匹配 `key` 的活跃 mutation 正在执行中。 |

两者都特别适用于页面级的加载状态协调，以及在请求进行期间禁用重复操作。
