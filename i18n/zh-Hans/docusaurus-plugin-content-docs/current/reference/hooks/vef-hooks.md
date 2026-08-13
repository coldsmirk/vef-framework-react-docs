---
title: VEF Hooks
description: "@vef-framework-react/hooks 中每个由 VEF 维护的 hook 的签名——权限、数据选项、码集、服务端推送、上传、深/浅比较等。"
---

# VEF Hooks

这里是 `@vef-framework-react/hooks` 维护的每个 hook 的详尽签名级索引。若需要叙述性的“何时用什么”版本，请参阅 [Hooks](../../guide/hooks.md)。该包的另一半——经同一入口重新导出的 Mantine 与快捷键 hooks——收录在[上游 Hook 导出](./upstream-hooks.md)中。

## 权限 Hooks

| Hook | Signature | Description |
| --- | --- | --- |
| `useCheckPermission` | `() => (requiredPermissions?: MaybeArray<string>, checkMode?: PermissionCheckMode) => boolean` | 返回一个稳定的函数，用于执行命令式的权限检查（例如在事件处理器内部）。 |
| `useIsAuthorized` | `(requiredPermissions?: MaybeArray<string>, checkMode?: PermissionCheckMode) => boolean` | 在渲染阶段直接检查权限——即 `useCheckPermission()(...)` 的 hook 形式。 |
| `useAuthorizedItems` | `<T extends PermissionAware>(items: T[]) => T[]` | 将配置数组过滤为当前用户有权限访问的项。`PermissionAware` 为 `{ requiredPermissions?: MaybeArray<string>; checkMode?: PermissionCheckMode }`（默认 `checkMode: "any"`）。 |

这三个 hook 都从 `AppContext` 中读取 `hasPermission`（参见[上下文提供者](../core/context.md)），当应用上下文未提供该函数时默认使用 `() => true`。空值（nullish）的 `requiredPermissions` 始终通过。

## 码集与选项 Hooks

| Hook | Signature | Description |
| --- | --- | --- |
| `useCodeSetQuery` | `<const T extends CodeSetAliasMap, TData = CodeSetQueryData<T>>(keys: T, options?: UseCodeSetQueryOptions<T, TData>) => UseQueryResult<TData>` | 通过 `appContext.codeSetQueryFn` 获取宿主码集选项，以别名映射（例如 `{ gender: "common.gender" }`）为键；每个别名都会成为解析后 `data` 中的一个 key，当后端未返回对应码集时默认为 `[]`。若未配置 `codeSetQueryFn` 则抛出异常。`data` 遵循 React Query 语义——在查询完成前为 `undefined`。由 `useDictionaryQuery` 重命名而来；参见[码集指南](../../guide/code-sets.md)。在下拉选择场景中，优先使用对该 hook 做了封装的 `useCodeSetOptionsSelect`（来自 `@vef-framework-react/components`）。 |
| `resolveCodeSetKey` | `(value: CodeSetKeyValue) => string` | 从纯字符串或 `CodeSetKeyConfig` 对象中提取码集 key（由 `resolveDictKey` 重命名而来）。 |
| `useDataOptionsQuery` | `<TQueryFnData, TData, TParams>(config: UseDataOptionsQueryOptions<TQueryFnData, TData, TParams>) => UseDataOptionsQueryResult<TData, DataOption<TData>>`（或当 `config.withPinyin` 为 `true` 时的 `DataOptionWithPinyin<TData>`） | 将 `config.queryOptions` 传入 `useQuery` 执行，并通过可配置的 `labelKey` / `valueKey` / `disabledKey` / `descriptionKey` / `childrenKey` 提取器（字符串路径或函数；默认 `"label"` / `"value"` / `"disabled"` / `"description"` / `"children"`）将解析后的数组转换为 `DataOption`，并递归处理嵌套的 `children`。返回 `{ options, ...restOfQueryResult }`（`useQuery` 结果中除 `data` 外的所有字段）。 |

`useCodeSetQuery` 行为说明：

- 查询键为 `[codeSetQueryFn.key, sortedKeys]`，其中 `sortedKeys` 是解析后的码集 key 去重并排序后的列表——解析到相同 key 集合的别名映射共享同一个缓存条目。
- 结果以 `staleTime: Infinity` 缓存；码集在会话期间被视为静态数据。
- 空的 `keys` 映射会替换为 `skipQueryToken`，因此查询永远不会执行。
- `options.enabled`（默认 `true`）用于推迟发起请求，例如上游参数尚未就绪时。
- `options.select` 在别名解析完成后对解析结果做二次处理；其返回值成为 `data`。它会被透传给 React Query 的 `select` 记忆化机制，因此 `keys` 与 `select` 的引用稳定性由调用方负责——将它们放在模块作用域、使用 `as const`、`useMemo` 或 `useCallback`，避免每次渲染都重新执行转换。

### 通过 `Register` 约束码集 Key

`Register` 是 hooks 包类型的扩展注册表：一个空接口，项目可通过模块扩充（module augmentation）对其扩展。声明了 `codeSetKeys` 成员后，`CodeSetKey` 会从 `string` 收窄为该联合类型——码集 key 中的拼写错误将成为编译错误：

```ts
declare module "@vef-framework-react/hooks" {
  interface Register {
    codeSetKeys: "sys.menu.type" | "sys.user.gender";
  }
}
```

未来 hook 层面的扩展会作为同一注册表的成员加入（该 `Register` 扩充成员已由 `dictionaryKeys` 重命名为 `codeSetKeys`）。

### 类型

| 类型 | 说明 |
| --- | --- |
| `CodeSetAliasMap` | `{ readonly [alias: string]: CodeSetKeyValue }`（不含数组/索引 key）——`useCodeSetQuery` 接受的别名映射结构。 |
| `CodeSetKey` | 码集 key 的字符串类型；当项目扩充了它时会收窄为 `Register["codeSetKeys"]`，否则为 `string`。 |
| `CodeSetKeyConfig` | `{ key: CodeSetKey; filterable?: boolean }`——带有单 key 级别覆盖项的码集 key。 |
| `CodeSetKeyValue` | `CodeSetKey \| CodeSetKeyConfig`。 |
| `CodeSetQueryData<T>` | `Record<Extract<keyof T, string>, DataOption[]>`——`useCodeSetQuery` 中 `data` 解析后的结构。 |
| `Register` | 空接口；可通过 `declare module "@vef-framework-react/hooks"` 做模块扩充，将 `CodeSetKey` 约束为一个已知的联合类型。 |
| `UseCodeSetQueryOptions<T, TData>` | `{ enabled?: boolean; select?: (data: CodeSetQueryData<T>) => TData }`。 |
| `FieldExtractor<TData, TValue>` | `string \| ((item: TData) => TValue)`——点路径字符串或取值函数。 |
| `UseDataOptionsQueryOptions<TQueryFnData, TData, TParams>` | `{ queryOptions: UseQueryOptions<TQueryFnData[], TData[], TParams>; labelKey?; valueKey?; disabledKey?; descriptionKey?; childrenKey?; withPinyin?: boolean }`。 |
| `UseDataOptionsQueryResult<TData, TOption>` | `Omit<UseQueryResult<TData[]>, "data"> & { options: TOption[] }`。 |

## 服务端推送 Hook

| Hook | Signature | Description |
| --- | --- | --- |
| `usePushMessage` | `<TPayload = unknown>(client: PushClient, type: string, handler: PushMessageHandler<TPayload>) => void` | 订阅一种消息信封类型的服务端推送消息，并自动清理（卸载时取消订阅）。将 `type` 传为 `"*"` 可接收所有消息。 |

`client` 通常是应用级单例（参见[服务端推送参考](../core/push.md)与[服务端推送指南](../../guide/server-push.md)）。每当 `client`、`type` 或 `handler` 的引用变化时都会重建订阅——请保持 `handler` 稳定（`useCallback` 或模块级函数），避免订阅反复重建。

```tsx
import { usePushMessage } from "@vef-framework-react/hooks";

function OrderBadge({ pushClient }) {
  usePushMessage(pushClient, "order.status_changed", message => {
    console.log("Order updated:", message.payload);
  });
}
```

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

`UseUploadOptions` 对应 [`UploaderOptions`](../core/storage.md#uploaderoptions)（来自 `core`），去掉了由 React 接管的字段（`signal`、`onProgress`、`onStatusChange`、`onSessionOpened`），并新增：

| 选项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `onProgress` | `(progress: UploadProgress) => void` | — | 每次聚合进度更新时触发 |
| `onStatusChange` | `(status: UploadStatus) => void` | — | 每次 `Uploader` 状态转换时触发 |
| `onSuccess` | `(result: UploadResult) => void` | — | 上传成功完成时触发一次 |
| `onError` | `(error: UploadError) => void` | — | 任意终态失败（包括中止）时触发一次 |
| `persistence` | `ResumablePersistence \| null` | `LocalStoragePersistence` | 续传记录的持久化层；传入 `null` 可完全禁用续传 |
| `fingerprinter` | `FileFingerprinter` | `crypto.subtle` 可用时为 `PrefixFingerprinter`，否则为 `WeakFingerprinter` | 跨会话的文件身份识别策略 |
| `onResumeDetected` | `ResumeDecisionHandler` | 丢弃 | 发现续传候选时的决策处理函数；默认选择丢弃（续传错误的文件比重新上传更糟糕） |

`UseUploadResult`：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `upload` | `(file: File \| Blob, init?: UploadInit) => Promise<UploadResult>` | 启动一次新上传，并取消仍在进行中的上传。普通 `Blob` 输入（没有 `File` 元数据）会绕过续传规划器，始终重新上传 |
| `abort` | `() => void` | 取消进行中的上传（包括启动前的续传规划阶段）；空闲/终态时为无操作 |
| `reset` | `() => void` | 清空状态并解绑当前的 `Uploader` |
| `status` | `UploadStatus` | 当前状态；两次重置之间为 `"idle"` |
| `progress` | `UploadProgress` | 最新的聚合进度；重置之间归零。在续传路径上，首次进度从已完成的字节数开始——应把它当作起始位置，而不是进度回退 |
| `error` | `UploadError \| null` | 状态为 `"failed"` 时的终态错误；与 `result` 互斥 |
| `result` | `UploadResult \| null` | 状态为 `"succeeded"` 时的终态结果 |
| `isUploading` | `boolean` | 状态是否为 `initializing` / `uploading` / `completing` / `aborting` 之一 |

行为说明：持久化的续传记录在后端确认会话后立即写入，上传成功与用户中止时删除（失败时保留，以便重试可以续传）；组件卸载时会自动中止进行中的上传。

## 事件与环境 Hooks

| Hook | Signature | Description |
| --- | --- | --- |
| `useDocumentEvent` | `<TType extends string>(type: TType, listener: TType extends keyof DocumentEventMap ? (this: Document, event: DocumentEventMap[TType]) => void : (this: Document, event: CustomEvent) => void, options?: boolean \| AddEventListenerOptions) => void` | 添加一个 `document` 级别的事件监听器，并自动清理；已知事件名获得对应的原生事件类型，未知事件名按 `CustomEvent` 处理。监听器始终能看到最新的闭包（不存在闭包过期问题，且仅监听器变化时不会重新订阅）。 |
| `useEmitterEvent` | `<TEvents extends Record<EventType, any>>(emitter: EventEmitter<TEvents>, eventType: keyof TEvents, eventListener: EventHandler<TEvents[keyof TEvents]>) => void` | 订阅一个 `shared` 的 `EventEmitter` 事件，并自动清理。当 `emitter`、`eventType` 或 `eventListener` 的引用变化时会重新订阅——请保持监听器稳定。 |
| `useLatest` | `<T>(value: T) => MutableRefObject<T>` | 始终持有最新 `value` 的 ref，用于在稳定的回调函数内部读取当前 props/state，而无需将其加入依赖数组。 |
| `useRafState` | `<T>(initialState: T \| (() => T)) => [T, Dispatch<SetStateAction<T>>]` | 其 setter 通过 `requestAnimationFrame` 批量处理更新的 `useState`（待执行的帧会被下一次 set 以及卸载取消），适用于高频更新场景（滚动、resize、指针移动）。 |
| `useSingleton` | `<T>(initializer: () => T) => RefObject<T>` | 仅在首次渲染时创建一次值（例如 `new EventEmitter()`），并返回指向它的稳定 ref（初始化函数不得返回 `undefined`，该值会被视为“尚未初始化”）。 |
| `useViewportSize` | `() => { width: number; height: number }` | 跟踪 `window.innerWidth` / `innerHeight`，在 resize 和屏幕方向变化时通过被动监听器更新，并经 `useRafState` 批量处理。`window` 不可用（SSR）时返回 `0 × 0`。 |
| `useBreakpoints` | `<T extends string>(breakpoints: Breakpoints<T>, options?: UseBreakpointsOptions<T>) => UseBreakpointsResult<T>` | 使用 `min-width` 媒体查询，跟踪当前匹配的命名断点。`Breakpoints<T> = Record<T, number \| string>`（数字会转为 `px`）；需包含一个宽度为 `0` 的条目以覆盖最小的视口。 |

`useBreakpoints` 细节：

- `UseBreakpointsResult<T>` 为 `{ current?: T; value?: number | string; matches: T[] }`——`current` 是当前匹配的最大断点名称，`value` 是其配置的宽度，`matches` 是按宽度升序排列的所有匹配名称。无匹配时均为空/`undefined`。
- `UseBreakpointsOptions<T>` 为 `{ initialBreakpoint?: T; getInitialValueInEffect?: boolean }`。`initialBreakpoint` 用于在 SSR 期间（或 effect 运行前）为结果提供种子值；`getInitialValueInEffect`（默认 `false`）将首次真实测量推迟到 effect 中，以避免水合不一致。

## Query 与 Mutation 状态 Hooks

| Hook | Signature | Description |
| --- | --- | --- |
| `useHasFetching` | `(key: string, params?: unknown) => boolean` | 是否有键以 `[key]`（提供 `params` 时为 `[key, params]`；非精确匹配）开头的**活跃**查询正在请求中。 |
| `useHasMutating` | `(key: string) => boolean` | 是否有键以 `[key]` 开头（非精确匹配）的变更正在执行中。 |

两者都特别适用于页面级的加载状态协调，以及在请求进行期间禁用重复操作。

## 存储文件名解析

| Hook | Signature | Description |
| --- | --- | --- |
| `useStoredFileNames` | `(keys: readonly string[]) => Record<string, ResolvedFile>` | 将存储对象 key 解析为后端在上传时记录的文件元数据——原始文件名、内容类型、大小、上传状态及时间戳。结果以 `staleTime: Infinity` 无限期缓存；key 在发起请求前会去重并排序，使带新数组的重渲染命中同一缓存条目。 |

业务模型只保存存储 key（`priv/2026/08/04/<uuid>.pdf`），因此没有这个 hook，重新打开的表单或列表只能显示生成的对象名。该 hook 通过 `resolveFiles` core API 读回记录的原始文件名。

行为说明：

- 该 hook 通过 `useApiClient` 从上下文读取 `apiClient`，并在内部创建类型化的查询函数，因此消费组件无需自行管理 `ApiClient` 或 `QueryClient`。
- 调用方无权读取的 key 以及后端无记录的 key 会直接从结果映射中缺失——解析是装饰，不是门禁。请求失败时返回空映射。
- 空的或全部为假值的 key 数组是空操作（`enabled: false`），返回 `{}` 且不发起请求。

```tsx
import { useStoredFileNames } from "@vef-framework-react/hooks";

function FileList({ keys }: { keys: string[] }) {
  const names = useStoredFileNames(keys);

  return (
    <ul>
      {keys.map(key => (
        <li key={key}>{names[key]?.originalFilename ?? key}</li>
      ))}
    </ul>
  );
}
```

### `ResolvedFile`

结果映射中每个已解析条目的形状：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `key` | `string` | 存储对象 key |
| `originalFilename` | `string` | 上传时记录的客户端原始文件名 |
| `contentType` | `string` | MIME 类型 |
| `size` | `number` | 文件大小（字节） |
| `status` | `"uploaded" \| "claimed" \| "deleted"` | 存储生命周期状态 |
| `uploadedAt` | `string` | 上传时间戳 |
| `uploadedBy` | `string` | 上传者标识 |
