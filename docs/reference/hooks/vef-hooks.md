---
title: VEF Hooks
description: Signatures for every VEF-maintained hook in @vef-framework-react/hooks — permissions, data options, dictionaries, upload, deep/shallow comparison, and more.
---

# VEF Hooks

This is the exhaustive, signature-level index of every hook `@vef-framework-react/hooks` maintains. For the narrative / when-to-use-what version, see [Hooks](../../guide/hooks.md).

## Permission Hooks

| Hook | Signature | Description |
| --- | --- | --- |
| `useCheckPermission` | `() => (requiredPermissions?: MaybeArray<string>, checkMode?: PermissionCheckMode) => boolean` | Returns a stable function for imperative permission checks (e.g. inside an event handler). |
| `useIsAuthorized` | `(requiredPermissions?: MaybeArray<string>, checkMode?: PermissionCheckMode) => boolean` | Checks permissions directly at render time — the hook form of `useCheckPermission()(...)`. |
| `useAuthorizedItems` | `<T extends PermissionAware>(items: T[]) => T[]` | Filters a config array down to the items the current user is authorized for. `PermissionAware` is `{ requiredPermissions?: MaybeArray<string>; checkMode?: PermissionCheckMode }` (default `checkMode: "any"`). |

All three read `hasPermission` from `AppContext` (see [Context Providers](../core/context.md)) and default to `() => true` when the app context does not provide one.

## Data and Options Hooks

| Hook | Signature | Description |
| --- | --- | --- |
| `useDictionaryQuery` | `<const T extends DictionaryAliasMap, TData = DictionaryQueryData<T>>(keys: T, options?: UseDictionaryQueryOptions<T, TData>) => UseQueryResult<TData>` | Fetches data-dictionary options through `appContext.dictionaryQueryFn`, keyed by an alias map (e.g. `{ gender: "common.gender" }`); each alias becomes a key in the resolved `data`. Throws if `dictionaryQueryFn` is not configured. `data` follows React Query semantics — `undefined` until the query resolves. `options.enabled` defers fetching; `options.select` reshapes the resolved alias map (its identity is forwarded to React Query's `select`, so stabilize it to avoid re-running on every render). For select-input usage prefer `useDictionaryOptionsSelect` (from `@vef-framework-react/components`), which wraps this hook. |
| `resolveDictKey` | `(value: DictionaryKeyValue) => string` | Extracts the dictionary key from a plain string or a `DictionaryKeyConfig` object. |
| `useDataOptionsQuery` | `<TQueryFnData, TData, TParams>(config: UseDataOptionsQueryOptions<TQueryFnData, TData, TParams>) => UseDataOptionsQueryResult<TData, DataOption<TData>>` (or `DataOptionWithPinyin<TData>` when `config.withPinyin` is `true`) | Runs `config.queryOptions` through `useQuery` and transforms the resolved array into `DataOption`s via configurable `labelKey` / `valueKey` / `disabledKey` / `descriptionKey` / `childrenKey` extractors (string path or function), recursing into nested `children`. Returns `{ options, ...restOfQueryResult }` (all `useQuery` result fields except `data`). |

### Types

| Type | Description |
| --- | --- |
| `DictionaryAliasMap` | `{ [alias: string]: DictionaryKeyValue }` (no array/index keys) — the alias-map shape `useDictionaryQuery` accepts. |
| `DictionaryKey` | The dictionary key string type; narrows to `Register['dictionaryKeys']` when a project augments it, otherwise `string`. |
| `DictionaryKeyConfig` | `{ key: DictionaryKey; filterable?: boolean }` — a dictionary key with per-key overrides. |
| `DictionaryKeyValue` | `DictionaryKey \| DictionaryKeyConfig`. |
| `DictionaryQueryData<T>` | `Record<Extract<keyof T, string>, DataOption[]>` — the resolved shape of `useDictionaryQuery`'s `data`. |
| `Register` | Empty interface; augment via `declare module "@vef-framework-react/hooks"` to constrain `DictionaryKey` to a known union. |
| `UseDictionaryQueryOptions<T, TData>` | `{ enabled?: boolean; select?: (data: DictionaryQueryData<T>) => TData }`. |
| `FieldExtractor<TData, TValue>` | `string \| ((item: TData) => TValue)` — a dot-path or getter function. |
| `UseDataOptionsQueryOptions<TQueryFnData, TData, TParams>` | `{ queryOptions: UseQueryOptions<TQueryFnData[], TData[], TParams>; labelKey?; valueKey?; disabledKey?; descriptionKey?; childrenKey?; withPinyin?: boolean }`. |
| `UseDataOptionsQueryResult<TData, TOption>` | `Omit<UseQueryResult<TData[]>, "data"> & { options: TOption[] }`. |

## Deep / Shallow Comparison Hooks

Drop-in replacements for the built-in dependency-array hooks when dependencies are objects/arrays that change identity but not value. All are built on `useDeepCompare` / `useShallowCompare`, which increment an internal signal only when the array differs (deeply or shallowly); `undefined` dependencies always signal a change, matching `useEffect(() => {})` with no array.

| Hook | Signature | Description |
| --- | --- | --- |
| `useDeepCompare` | `(dependencies?: DependencyList) => readonly [number]` | The primitive the `useDeep*` family builds on; returns a one-element signal tuple usable as a dependency array. |
| `useDeepCallback` | `<T extends Function>(callback: T, dependencies: DependencyList) => T` | `useCallback` with deep dependency comparison. |
| `useDeepEffect` | `(effect: EffectCallback, dependencies?: DependencyList) => void` | `useEffect` with deep dependency comparison. |
| `useDeepIsomorphicEffect` | `(effect: EffectCallback, dependencies?: DependencyList) => void` | `useLayoutEffect` on the client / `useEffect` on the server, with deep dependency comparison. |
| `useDeepLayoutEffect` | `(effect: EffectCallback, dependencies?: DependencyList) => void` | `useLayoutEffect` with deep dependency comparison. |
| `useDeepMemo` | `<T>(factory: () => T, dependencies: DependencyList) => T` | `useMemo` with deep dependency comparison. |
| `useShallowCompare` | `(dependencies?: DependencyList) => readonly [number]` | The primitive the `useShallow*` family builds on. |
| `useShallowCallback` | `<T extends Function>(callback: T, dependencies: DependencyList) => T` | `useCallback` with shallow dependency comparison. |
| `useShallowEffect` | `(effect: EffectCallback, dependencies?: DependencyList) => void` | `useEffect` with shallow dependency comparison. |
| `useShallowIsomorphicEffect` | `(effect: EffectCallback, dependencies?: DependencyList) => void` | `useLayoutEffect` on the client / `useEffect` on the server, with shallow dependency comparison. |
| `useShallowLayoutEffect` | `(effect: EffectCallback, dependencies?: DependencyList) => void` | `useLayoutEffect` with shallow dependency comparison. |
| `useShallowMemo` | `<T>(factory: () => T, dependencies: DependencyList) => T` | `useMemo` with shallow dependency comparison. |

## Upload Hook

| Hook | Signature | Description |
| --- | --- | --- |
| `useUpload` | `(options?: UseUploadOptions) => UseUploadResult` | React adapter over core's chunked, resumable `Uploader`, scoped to one in-flight upload per consumer (calling `upload()` again cancels the previous run). For parallel/batch uploads, use `Uploader` from `@vef-framework-react/core` directly. |

`UseUploadOptions` mirrors `UploaderOptions` (from `core`) minus the fields React owns, plus `onProgress` / `onStatusChange` / `onSuccess` / `onError` callbacks, `persistence` (a `ResumablePersistence`, defaulting to `LocalStoragePersistence`; pass `null` to disable resume), `fingerprinter` (defaults to `PrefixFingerprinter` when `crypto.subtle` is available, else `WeakFingerprinter`), and `onResumeDetected`.

`UseUploadResult` is `{ upload: (file: File | Blob, init?: UploadInit) => Promise<UploadResult>; abort: () => void; reset: () => void; status: UploadStatus; progress: UploadProgress; error: UploadError | null; result: UploadResult | null; isUploading: boolean }`.

## Event and Environment Hooks

| Hook | Signature | Description |
| --- | --- | --- |
| `useDocumentEvent` | `<TType extends string>(type: TType, listener: (this: Document, event: DocumentEventMap[TType] \| CustomEvent) => void, options?: boolean \| AddEventListenerOptions) => void` | Attaches a `document`-level event listener with automatic cleanup; the listener always sees its latest closure (no stale-closure risk). |
| `useEmitterEvent` | `<TEvents>(emitter: EventEmitter<TEvents>, eventType: keyof TEvents, eventListener: EventHandler<TEvents[keyof TEvents]>) => void` | Subscribes to a `shared` `EventEmitter` event with automatic cleanup. |
| `useLatest` | `<T>(value: T) => MutableRefObject<T>` | A ref that always holds the latest `value`, for reading current props/state inside a stable callback without adding it to a dependency array. |
| `useRafState` | `<T>(initialState: T \| (() => T)) => [T, Dispatch<SetStateAction<T>>]` | `useState` whose setter batches updates via `requestAnimationFrame`, for high-frequency updates (scroll, resize, pointer move). |
| `useSingleton` | `<T>(initializer: () => T) => RefObject<T>` | Creates a value once on first render (e.g. `new EventEmitter()`) and returns a stable ref to it. |
| `useViewportSize` | `() => { width: number; height: number }` | Tracks `window.innerWidth` / `innerHeight`, updating on resize and orientation change (via `useRafState`). |
| `useBreakpoints` | `<T extends string>(breakpoints: Breakpoints<T>, options?: UseBreakpointsOptions<T>) => UseBreakpointsResult<T>` | Tracks which named breakpoints currently match, using `min-width` media queries. `Breakpoints<T> = Record<T, number \| string>`; include a `0`-width entry to cover the smallest viewports. Returns `{ current, value, matches }` — `current` is the largest matching breakpoint name. `options`: `{ initialBreakpoint?: T; getInitialValueInEffect?: boolean }` (SSR hydration control). |

## Query and Mutation State Hooks

| Hook | Signature | Description |
| --- | --- | --- |
| `useHasFetching` | `(key: string, params?: unknown) => boolean` | Whether any active query matching `key` (and `params`, if given) is currently fetching. |
| `useHasMutating` | `(key: string) => boolean` | Whether any active mutation matching `key` is currently running. |

Both are especially useful for page-level loading coordination and disabling repeated actions while requests are running.
