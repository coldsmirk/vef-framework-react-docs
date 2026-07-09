---
title: General Utilities and Color Helpers
description: Signatures for the color helpers, cache, and general-purpose function/object/string/collection utilities in @vef-framework-react/shared.
---

# General Utilities and Color Helpers

## Color Helpers

Built on `colord` (with the `names`, `mix`, and `lab` plugins).

| Export | Signature | Description |
| --- | --- | --- |
| `isValidColor` | `(color: AnyColor) => boolean` | Whether a color string/object is parseable. |
| `toHexColor` | `(color: AnyColor) => string` | Converts to `"#rrggbb"`. |
| `toRgbColor` | `(color: AnyColor) => RgbaColor` | Converts to `{ r, g, b, a }`. |
| `toHslColor` | `(color: AnyColor) => HslaColor` | Converts to `{ h, s, l, a }`. |
| `toHsvColor` | `(color: AnyColor) => HsvaColor` | Converts to `{ h, s, v, a }`. |
| `getColorDifference` | `(firstColor: AnyColor, secondColor: AnyColor) => number` | Delta E distance between two colors (lower = more similar). |
| `convertHslToHex` | `(hslColor: HslColor) => string` | Converts an HSL object to hex. |
| `setColorAlpha` | `(color: AnyColor, alphaValue: number) => string` | Returns `color` with its alpha channel set (hex output). |
| `mixColor` | `(baseColor: AnyColor, blendColor: AnyColor, blendRatio: number) => string` | Mixes two colors (`blendRatio` 0 = pure base, 1 = pure blend). |
| `convertTransparentToOpaque` | `(color: AnyColor, alphaValue: number, backgroundColor?: string) => string` | Flattens a translucent color onto a background (default background `"#ffffff"`) into an equivalent opaque hex color. |
| `isWhiteColor` | `(color: AnyColor) => boolean` | Whether a color is exactly white. |
| `getColorName` | `(color: string) => string` | Nearest named color from the built-in `colorEntries` table (exact match first, then RGB+HSL distance). |
| `getColorPalette` | `(color: string) => Map<ColorNumber, string>` | Generates (and caches, up to 100 entries) a full `50`–`950` swatch ramp matched to `color`'s hue/saturation, anchored on the nearest built-in `colorPalettes` family. |

### Data constants

| Export | Type | Description |
| --- | --- | --- |
| `colorEntries` | `ColorEntry[]` | The `[hex, name]` lookup table backing `getColorName`. |
| `colorNameMap` | `Map<string, string>` | `colorEntries` indexed by hex for exact-match lookups. |
| `colorPalettes` | `ColorPalette[]` | The built-in reference palette families (`Red`, `Orange`, …) `getColorPalette` adapts to match an arbitrary input color. |
| `colorPaletteMap` | `Map<PresetColor, Map<ColorNumber, string>>` | `colorPalettes` indexed by kebab-case palette name, then by swatch number, for direct lookup without re-deriving a palette. |

## Function and Task Helpers

| Export | Signature | Description |
| --- | --- | --- |
| `AwaitableFnInvocationOptions<TResult, TContext>` | `{ onInvoke?; onSuccess?; onError?; onFinally? }` | Lifecycle hooks accepted by `invokeAwaitableFn`. |
| `isAsyncFunction` | `(fn: Function) => fn is (...args: any[]) => Promise<any>` | Whether a function is `async` (or an async generator). |
| `invokeAwaitableFn` | `<TArgs, TResult, TContext>(fn, args: TArgs, options: AwaitableFnInvocationOptions<TResult, TContext>) => Promise<TResult>` | Calls `fn(...args)` and runs `onInvoke` / `onSuccess` / `onError` / `onFinally` hooks around it; synchronous (non-`Promise`) returns skip the hooks entirely. |
| `identity` | `<T>(value: T) => T` | Returns its argument unchanged. |
| `createThrowNotImplementedFn` | `(feature?: string) => () => never` | Builds a function that throws a "not implemented" error when called. |
| `throwNotImplemented` | `(feature?: string) => never` | Throws a "not implemented" error immediately. |
| `generateId` | `() => string` | Returns a 16-character `cuid2` id. Fingerprinted with a device-derived value once FingerprintJS resolves (async, browser-only); falls back to a fixed fingerprint until then and in non-browser/test environments. |
| `scheduleMicrotask` | `(task: () => void) => void` | Runs `task` on the microtask queue (`queueMicrotask`, falling back to `Promise.resolve().then`). |

## Cache

| Export | Signature | Description |
| --- | --- | --- |
| `lru` | `<T = any>(max?: number, ttl?: number, resetTTL?: boolean) => LRU<T>` (from `tiny-lru`) | Factory for an O(1) LRU cache (default `max: 1000`, `ttl: 0` = no expiration). Used internally by `getColorPalette`. |
| `LRU<T = any>` | `class LRU<T> { get, set, has, delete, clear, keys, values, entries, … }` (from `tiny-lru`) | The cache class `lru()` constructs; constructing it directly skips `lru()`'s parameter validation. |

## String Case and Template Helpers

| Export | Signature | Description |
| --- | --- | --- |
| `constantCase` | `(value: string) => string` | Converts to `CONSTANT_CASE` (via `snakeCase(value).toUpperCase()`). |
| `stringify` | `(value: unknown, emptyForNullish?: boolean) => string` | Converts any value to a display string; `null`/`undefined` become `""` by default (`emptyForNullish: true`), or the literal `"null"`/`"undefined"` when `false`. Falls back to `JSON.stringify` for objects, `String(value)` if that throws. |

## Common Utilities from `lib.ts`

This module re-exports selected utilities from [`radashi`](https://radashi.js.org/) (a Radash fork), plus a few direct re-exports (`cloneDeep` from `klona`, `decodeQueryString`/`encodeQueryString` from `qs`), gathered into one place.

### Type Predicates

All `(value: unknown) => value is T` unless noted.

| Export | Description |
| --- | --- |
| `isArray` | Array. |
| `isBigInt` | `bigint`. |
| `isBoolean` | `boolean`. |
| `isDate` | `Date`. |
| `isEmpty` | `(value: unknown) => boolean` — empty array/string/object/`Map`/`Set`/nullish. |
| `isError` | `Error`. |
| `isFloat` | A non-integer `number`. |
| `isFunction` | `Function`. |
| `isInt` | A `number` that is an integer (`Number.isInteger` with a narrower type). |
| `isIntString` | A string that round-trips through an integer, e.g. `"0"`. |
| `isMap` | `Map`. |
| `isNullish` | `null \| undefined`. |
| `isNumber` | `number`. |
| `isObject` | Any non-primitive `object`. |
| `isPlainObject` | A plain `{}`-style object (excludes class instances, arrays, `Map`/`Set`, …). |
| `isPrimitive` | `(value: unknown) => boolean` — any JS primitive. |
| `isPromise` | `PromiseLike<unknown>`. |
| `isRegExp` | `RegExp`. |
| `isSet` | `Set`. |
| `isString` | `string`. |
| `isSymbol` | `symbol`. |
| `isUndefined` | `undefined`. |
| `isWeakMap` | `WeakMap`. |
| `isWeakSet` | `WeakSet`. |

### Object Helpers

| Export | Signature | Description |
| --- | --- | --- |
| `assign` | `<TInitial, TOverride>(initial: TInitial, override: TOverride) => Assign<TInitial, TOverride>` | Recursively merges `override` onto `initial` (plain objects merge deeply; other values are replaced). |
| `get` | `<TDefault = unknown>(value: any, path: string, defaultValue?: TDefault) => TDefault` | Reads a dot-path from a nested object, e.g. `get(obj, "a.b.0.c")`. |
| `omit` | `<T, TKeys extends keyof T>(obj: T, keys: readonly TKeys[]) => Omit<T, TKeys>` | Returns a shallow copy without the given keys. |
| `pick` | `<T extends object, F>(obj: T, filter: F) => Pick<T, …>` | Returns a shallow copy with only the given keys (or a key-filter predicate). |
| `set` | `<T extends object, K>(initial: T, path: string, value: K) => T` | Returns a copy of `initial` with the dot-path `path` set to `value`. |
| `cloneDeep` | `<T>(value: T) => T` (from `klona`) | Deep-clones a value (objects, arrays, `Date`, `RegExp`, `Map`, `Set`). |

### Collection Helpers

| Export | Signature | Description |
| --- | --- | --- |
| `first` | `<TArray, TDefault = undefined>(array: TArray, defaultValue?: TDefault) => …` | First element, or `defaultValue` when empty. |
| `last` | `<TArray, TDefault = undefined>(array: TArray, defaultValue?: TDefault) => …` | Last element, or `defaultValue` when empty. |
| `max` | `(array: readonly number[]) => number \| null`, or `<T>(array: readonly T[], getter: (item: T) => number) => T` | Largest number, or the item with the largest `getter()` value. |
| `min` | `(array: readonly number[]) => number \| null`, or `<T>(array: readonly T[], getter: (item: T) => number) => T` | Smallest number, or the item with the smallest `getter()` value. |
| `sum` | `(array: readonly number[]) => number`, or `<T>(array: readonly T[], fn: (item: T) => number) => number` | Sum of the numbers, or of `fn(item)` per item. |
| `unique` | `<T, K = T>(array: readonly T[], toKey?: (item: T) => K) => T[]` | De-duplicated array, by value or by a derived key. |
| `cluster` | `<T, Size extends number = 2>(array: readonly T[], size?: Size) => T[][]` | Chunks `array` into groups of `size` (default `2`). |

### Naming Helpers

| Export | Signature | Description |
| --- | --- | --- |
| `camelCase` | `(str: string) => string` | Converts to `camelCase`. |
| `kebabCase` | `(str: string) => string` | Converts to `kebab-case`. |
| `pascalCase` | `(str: string) => string` | Converts to `PascalCase`. |
| `snakeCase` | `(str: string, options?) => string` | Converts to `snake_case`. |
| `capitalize` | `(str: string) => string` | Uppercases the first character. |
| `trim` | `(str: string \| null \| undefined, charsToTrim?: string) => string` | Trims whitespace, or the given character set. |
| `template` | `(str: string, data: Record<string, any>, regex?: RegExp) => string` | Interpolates `{{key}}`-style placeholders from `data` (custom placeholder `regex` optional). |
| `similarity` | `(str1: string, str2: string) => number` | String-similarity score between two strings. |

### Rate-Limiting and Memoization

| Export | Signature | Description |
| --- | --- | --- |
| `debounce` | `<TArgs extends any[]>({ delay, leading }, func: (...args: TArgs) => any) => DebounceFunction<TArgs>` | Debounced wrapper with `.cancel()` / `.flush()` / `.isPending()`. |
| `throttle` | `<TArgs extends any[]>({ interval, trailing }, func: (...args: TArgs) => any) => ThrottledFunction<TArgs>` | Throttled wrapper. |
| `memoize` | `<TArgs, TResult>(func: (...args: TArgs) => TResult, options?: MemoOptions<TArgs>) => (...args: TArgs) => TResult` | Caches `func`'s result by argument list. |
| `once` | `<Args, Return, This>(fn: (this: This, ...args: Args) => Return) => (this: This, ...args: Args) => Return` | Runs `fn` at most once; later calls return the first call's result. |
| `noop` | `() => undefined` | Does nothing. |

### Numeric Conversion

| Export | Signature | Description |
| --- | --- | --- |
| `toFloat` | `(value: unknown) => number`, or `<T>(value: unknown, defaultValue: T) => number \| T` | Parses a float, or returns `defaultValue` when unparsable. |
| `toInt` | `(value: unknown) => number`, or `<T>(value: unknown, defaultValue: T) => number \| T` | Parses an integer, or returns `defaultValue` when unparsable. |

### Query-String Helpers

| Export | Signature | Description |
| --- | --- | --- |
| `decodeQueryString` | `(str: string) => object` (`qs.parse`) | Parses a query string into a nested object. |
| `encodeQueryString` | `(obj: object) => string` (`qs.stringify`) | Serializes an object into a query string. |

### Constants and Placeholders

| Export | Signature | Description |
| --- | --- | --- |
| `always` | `<T>(value: T) => () => T` | Builds a function that always returns `value`. |
| `alwaysTrue` | `() => true` | `always(true)`. |
| `alwaysFalse` | `() => false` | `always(false)`. |
