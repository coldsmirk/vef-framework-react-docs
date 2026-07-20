---
title: VEF Hooks
description: Signatures for every VEF-maintained hook in @vef-framework-react/hooks — permissions, data options, code sets, server push, upload, deep/shallow comparison, and more.
---

# VEF Hooks

This is the exhaustive, signature-level index of every hook `@vef-framework-react/hooks` maintains. For the narrative / when-to-use-what version, see [Hooks](../../guide/hooks.md). The package's other half — Mantine and hotkey hooks re-exported through the same entry — is indexed in [Upstream Hook Exports](./upstream-hooks.md).

## Permission Hooks

| Hook | Signature | Description |
| --- | --- | --- |
| `useCheckPermission` | `() => (requiredPermissions?: MaybeArray<string>, checkMode?: PermissionCheckMode) => boolean` | Returns a stable function for imperative permission checks (e.g. inside an event handler). |
| `useIsAuthorized` | `(requiredPermissions?: MaybeArray<string>, checkMode?: PermissionCheckMode) => boolean` | Checks permissions directly at render time — the hook form of `useCheckPermission()(...)`. |
| `useAuthorizedItems` | `<T extends PermissionAware>(items: T[]) => T[]` | Filters a config array down to the items the current user is authorized for. `PermissionAware` is `{ requiredPermissions?: MaybeArray<string>; checkMode?: PermissionCheckMode }` (default `checkMode: "any"`). |

All three read `hasPermission` from `AppContext` (see [Context Providers](../core/context.md)) and default to `() => true` when the app context does not provide one. Nullish `requiredPermissions` always pass.

## Code Set and Options Hooks

| Hook | Signature | Description |
| --- | --- | --- |
| `useCodeSetQuery` | `<const T extends CodeSetAliasMap, TData = CodeSetQueryData<T>>(keys: T, options?: UseCodeSetQueryOptions<T, TData>) => UseQueryResult<TData>` | Fetches host code set options through `appContext.codeSetQueryFn`, keyed by an alias map (e.g. `{ gender: "common.gender" }`); each alias becomes a key in the resolved `data`, defaulting to `[]` when the backend omits that code set. Throws if `codeSetQueryFn` is not configured. `data` follows React Query semantics — `undefined` until the query resolves. Renamed from `useDictionaryQuery`; see the [Code Sets guide](../../guide/code-sets.md). For select-input usage prefer `useCodeSetOptionsSelect` (from `@vef-framework-react/components`), which wraps this hook. |
| `resolveCodeSetKey` | `(value: CodeSetKeyValue) => string` | Extracts the code set key from a plain string or a `CodeSetKeyConfig` object (renamed from `resolveDictKey`). |
| `useDataOptionsQuery` | `<TQueryFnData, TData, TParams>(config: UseDataOptionsQueryOptions<TQueryFnData, TData, TParams>) => UseDataOptionsQueryResult<TData, DataOption<TData>>` (or `DataOptionWithPinyin<TData>` when `config.withPinyin` is `true`) | Runs `config.queryOptions` through `useQuery` and transforms the resolved array into `DataOption`s via configurable `labelKey` / `valueKey` / `disabledKey` / `descriptionKey` / `childrenKey` extractors (string path or function; defaults `"label"` / `"value"` / `"disabled"` / `"description"` / `"children"`), recursing into nested `children`. Returns `{ options, ...restOfQueryResult }` (all `useQuery` result fields except `data`). |

`useCodeSetQuery` behavior notes:

- The query key is `[codeSetQueryFn.key, sortedKeys]`, where `sortedKeys` is the deduplicated, sorted list of resolved code set keys — alias maps that resolve to the same key set share one cache entry.
- Results are cached with `staleTime: Infinity`; code sets are treated as static for the session.
- An empty `keys` map substitutes `skipQueryToken`, so the query never runs.
- `options.enabled` (default `true`) defers fetching, e.g. while upstream parameters are not ready.
- `options.select` reshapes the resolved alias map after alias resolution; its return value becomes `data`. It is forwarded into React Query's `select` memoization, so callers own the reference stability of both `keys` and `select` — hold them in module scope, `as const`, `useMemo`, or `useCallback` to avoid re-running the transform every render.

### Constraining Code Set Keys via `Register`

`Register` is the extension registry for hooks-package types: an empty interface a project augments through module augmentation. When the `codeSetKeys` member is declared, `CodeSetKey` narrows from `string` to that union — typos in code set keys become compile errors:

```ts
declare module "@vef-framework-react/hooks" {
  interface Register {
    codeSetKeys: "sys.menu.type" | "sys.user.gender";
  }
}
```

Future hook-level extensions will be added as members of the same registry (the `Register` augmentation member was renamed from `dictionaryKeys` to `codeSetKeys`).

### Types

| Type | Description |
| --- | --- |
| `CodeSetAliasMap` | `{ readonly [alias: string]: CodeSetKeyValue }` (array/index keys rejected) — the alias-map shape `useCodeSetQuery` accepts. |
| `CodeSetKey` | The code set key string type; resolves to `Register["codeSetKeys"]` when a project augments it, otherwise `string`. |
| `CodeSetKeyConfig` | `{ key: CodeSetKey; filterable?: boolean }` — a code set key with per-key overrides. |
| `CodeSetKeyValue` | `CodeSetKey \| CodeSetKeyConfig`. |
| `CodeSetQueryData<T>` | `Record<Extract<keyof T, string>, DataOption[]>` — the resolved shape of `useCodeSetQuery`'s `data`. |
| `Register` | Empty interface; augment via `declare module "@vef-framework-react/hooks"` to constrain `CodeSetKey` to a known union. |
| `UseCodeSetQueryOptions<T, TData>` | `{ enabled?: boolean; select?: (data: CodeSetQueryData<T>) => TData }`. |
| `FieldExtractor<TData, TValue>` | `string \| ((item: TData) => TValue)` — a dot-path or getter function. |
| `UseDataOptionsQueryOptions<TQueryFnData, TData, TParams>` | `{ queryOptions: UseQueryOptions<TQueryFnData[], TData[], TParams>; labelKey?; valueKey?; disabledKey?; descriptionKey?; childrenKey?; withPinyin?: boolean }`. |
| `UseDataOptionsQueryResult<TData, TOption>` | `Omit<UseQueryResult<TData[]>, "data"> & { options: TOption[] }`. |

## Server Push Hook

| Hook | Signature | Description |
| --- | --- | --- |
| `usePushMessage` | `<TPayload = unknown>(client: PushClient, type: string, handler: PushMessageHandler<TPayload>) => void` | Subscribes to server push messages of one envelope type with automatic cleanup (unsubscribes on unmount). Pass `"*"` as `type` to receive every message. |

`client` is typically an app-level singleton (see the [Server Push reference](../core/push.md) and the [Server Push guide](../../guide/server-push.md)). The subscription is re-created whenever `client`, `type`, or `handler` changes identity — keep `handler` stable (`useCallback`, or a module-level function) to avoid subscription churn.

```tsx
import { usePushMessage } from "@vef-framework-react/hooks";

function OrderBadge({ pushClient }) {
  usePushMessage(pushClient, "order.status_changed", message => {
    console.log("Order updated:", message.payload);
  });
}
```

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

`UseUploadOptions` mirrors [`UploaderOptions`](../core/storage.md#uploaderoptions) (from `core`) minus the fields React owns (`signal`, `onSessionOpened`), plus:

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `onProgress` | `(progress: UploadProgress) => void` | — | Fires on every aggregated progress tick |
| `onStatusChange` | `(status: UploadStatus) => void` | — | Fires on every `Uploader` status transition |
| `onSuccess` | `(result: UploadResult) => void` | — | Fires once when the upload completes successfully |
| `onError` | `(error: UploadError) => void` | — | Fires once on any terminal failure (including aborts) |
| `persistence` | `ResumablePersistence \| null` | `LocalStoragePersistence` | Persistence layer for resume records; pass `null` to disable resume entirely |
| `fingerprinter` | `FileFingerprinter` | `PrefixFingerprinter` when `crypto.subtle` is available, else `WeakFingerprinter` | File-identity strategy across sessions |
| `onResumeDetected` | `ResumeDecisionHandler` | discard | Decision handler when a resume candidate is found; the default discards (resuming the wrong file is worse than re-uploading) |

`UseUploadResult`:

| Field | Type | Description |
| --- | --- | --- |
| `upload` | `(file: File \| Blob, init?: UploadInit) => Promise<UploadResult>` | Starts a new upload, canceling any still in flight. Plain `Blob` inputs (no `File` metadata) bypass the resume planner and always upload fresh |
| `abort` | `() => void` | Cancels the in-flight upload (including the pre-launch resume-plan phase); no-op when idle/terminal |
| `reset` | `() => void` | Clears state and detaches the current `Uploader` |
| `status` | `UploadStatus` | Current status; `"idle"` between resets |
| `progress` | `UploadProgress` | Latest aggregated progress; zeroed between resets. On the resume path, the first emission starts at the already-completed bytes — treat it as the starting position, not a regression |
| `error` | `UploadError \| null` | Terminal error when status is `"failed"`; mutually exclusive with `result` |
| `result` | `UploadResult \| null` | Terminal result when status is `"succeeded"` |
| `isUploading` | `boolean` | Whether status is one of `initializing` / `uploading` / `completing` / `aborting` |

Behavior notes: the persisted resume record is written as soon as the backend confirms a session, dropped on success and on user abort (kept on failure so a retry can resume), and an in-flight upload is aborted automatically on unmount.

## Event and Environment Hooks

| Hook | Signature | Description |
| --- | --- | --- |
| `useDocumentEvent` | `<TType extends string>(type: TType, listener: TType extends keyof DocumentEventMap ? (this: Document, event: DocumentEventMap[TType]) => void : (this: Document, event: CustomEvent) => void, options?: boolean \| AddEventListenerOptions) => void` | Attaches a `document`-level event listener with automatic cleanup; known event names get their native event type, unknown names are typed as `CustomEvent`. The listener always sees its latest closure (no stale-closure risk, and no re-subscription when only the listener changes). |
| `useEmitterEvent` | `<TEvents extends Record<EventType, any>>(emitter: EventEmitter<TEvents>, eventType: keyof TEvents, eventListener: EventHandler<TEvents[keyof TEvents]>) => void` | Subscribes to a `shared` `EventEmitter` event with automatic cleanup. Re-subscribes when `emitter`, `eventType`, or `eventListener` changes identity — keep the listener stable. |
| `useLatest` | `<T>(value: T) => MutableRefObject<T>` | A ref that always holds the latest `value`, for reading current props/state inside a stable callback without adding it to a dependency array. |
| `useRafState` | `<T>(initialState: T \| (() => T)) => [T, Dispatch<SetStateAction<T>>]` | `useState` whose setter batches updates via `requestAnimationFrame` (a pending frame is canceled by the next set, and on unmount), for high-frequency updates (scroll, resize, pointer move). |
| `useSingleton` | `<T>(initializer: () => T) => RefObject<T>` | Creates a value once on first render (e.g. `new EventEmitter()`) and returns a stable ref to it (the initializer must not return `undefined`, which is treated as "not yet initialized"). |
| `useViewportSize` | `() => { width: number; height: number }` | Tracks `window.innerWidth` / `innerHeight`, updating on resize and orientation change with passive listeners, batched via `useRafState`. Returns `0 × 0` when `window` is unavailable (SSR). |
| `useBreakpoints` | `<T extends string>(breakpoints: Breakpoints<T>, options?: UseBreakpointsOptions<T>) => UseBreakpointsResult<T>` | Tracks which named breakpoints currently match, using `min-width` media queries. `Breakpoints<T> = Record<T, number \| string>` (numbers become `px`); include a `0`-width entry to cover the smallest viewports. |

`useBreakpoints` details:

- `UseBreakpointsResult<T>` is `{ current?: T; value?: number | string; matches: T[] }` — `current` is the largest matching breakpoint name, `value` its configured width, `matches` every matching name in ascending width order. All are empty/`undefined` when nothing matches.
- `UseBreakpointsOptions<T>` is `{ initialBreakpoint?: T; getInitialValueInEffect?: boolean }`. `initialBreakpoint` seeds the result during SSR (or until the effect runs); `getInitialValueInEffect` (default `false`) defers the first real measurement to an effect to avoid hydration mismatches.

## Query and Mutation State Hooks

| Hook | Signature | Description |
| --- | --- | --- |
| `useHasFetching` | `(key: string, params?: unknown) => boolean` | Whether any **active** query whose key starts with `[key]` (or `[key, params]` when `params` is given; non-exact match) is currently fetching. |
| `useHasMutating` | `(key: string) => boolean` | Whether any mutation whose key starts with `[key]` (non-exact match) is currently running. |

Both are especially useful for page-level loading coordination and disabling repeated actions while requests are running.
