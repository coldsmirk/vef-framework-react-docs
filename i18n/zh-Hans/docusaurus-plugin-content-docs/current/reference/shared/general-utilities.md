---
title: 通用工具与颜色辅助函数
description: "@vef-framework-react/shared 中颜色能力、缓存以及通用函数/对象/字符串/集合工具的签名。"
---

# 通用工具与颜色辅助函数

## 颜色能力

基于 `colord` 构建（附带 `names`、`mix`、`lab` 插件）。

| 导出 | 签名 | 描述 |
| --- | --- | --- |
| `isValidColor` | `(color: AnyColor) => boolean` | 颜色字符串/对象是否可解析。 |
| `toHexColor` | `(color: AnyColor) => string` | 转换为 `"#rrggbb"`。 |
| `toRgbColor` | `(color: AnyColor) => RgbaColor` | 转换为 `{ r, g, b, a }`。 |
| `toHslColor` | `(color: AnyColor) => HslaColor` | 转换为 `{ h, s, l, a }`。 |
| `toHsvColor` | `(color: AnyColor) => HsvaColor` | 转换为 `{ h, s, v, a }`。 |
| `getColorDifference` | `(firstColor: AnyColor, secondColor: AnyColor) => number` | 两个颜色之间的 Delta E 距离（数值越小越相近）。 |
| `convertHslToHex` | `(hslColor: HslColor) => string` | 将 HSL 对象转换为十六进制。 |
| `setColorAlpha` | `(color: AnyColor, alphaValue: number) => string` | 返回设置了 alpha 通道后的 `color`（以十六进制输出）。 |
| `mixColor` | `(baseColor: AnyColor, blendColor: AnyColor, blendRatio: number) => string` | 混合两种颜色（`blendRatio` 为 0 时纯基色，为 1 时纯混合色）。 |
| `convertTransparentToOpaque` | `(color: AnyColor, alphaValue: number, backgroundColor?: string) => string` | 将半透明颜色叠加到背景色上（默认背景色为 `"#ffffff"`），得到等效的不透明十六进制颜色。 |
| `isWhiteColor` | `(color: AnyColor) => boolean` | 颜色是否恰好为白色。 |
| `getColorName` | `(color: string) => string` | 从内置 `colorEntries` 表中查找最接近的命名颜色（先精确匹配，再按 RGB+HSL 距离）。 |
| `getColorPalette` | `(color: string) => Map<ColorNumber, string>` | 生成（并缓存，最多 100 条）一套与 `color` 的色相/饱和度匹配的完整 `50`–`950` 色阶，以最接近的内置 `colorPalettes` 色系为锚点。 |

### 数据常量

| 导出 | 类型 | 描述 |
| --- | --- | --- |
| `colorEntries` | `ColorEntry[]` | 支撑 `getColorName` 的 `[hex, name]` 查找表。 |
| `colorNameMap` | `Map<string, string>` | 以十六进制值为索引的 `colorEntries`，用于精确匹配查找。 |
| `colorPalettes` | `ColorPalette[]` | 内置的参考色系（`Red`、`Orange` 等），`getColorPalette` 会据此适配任意输入颜色。 |
| `colorPaletteMap` | `Map<PresetColor, Map<ColorNumber, string>>` | 按 kebab-case 色系名称、再按色板编号索引的 `colorPalettes`，可直接查找而无需重新生成色系。 |

## 函数与任务工具

| 导出 | 签名 | 描述 |
| --- | --- | --- |
| `AwaitableFnInvocationOptions<TResult, TContext>` | `{ onInvoke?; onSuccess?; onError?; onFinally? }` | `invokeAwaitableFn` 接受的生命周期钩子。 |
| `isAsyncFunction` | `(fn: Function) => fn is (...args: any[]) => Promise<any>` | 函数是否为 `async`（或异步生成器）。 |
| `invokeAwaitableFn` | `<TArgs, TResult, TContext>(fn, args: TArgs, options: AwaitableFnInvocationOptions<TResult, TContext>) => Promise<TResult>` | 调用 `fn(...args)` 并在其前后运行 `onInvoke` / `onSuccess` / `onError` / `onFinally` 钩子；同步（非 `Promise`）返回值会完全跳过这些钩子。 |
| `identity` | `<T>(value: T) => T` | 原样返回其参数。 |
| `createThrowNotImplementedFn` | `(feature?: string) => () => never` | 构建一个调用时抛出「未实现」错误的函数。 |
| `throwNotImplemented` | `(feature?: string) => never` | 立即抛出「未实现」错误。 |
| `generateId` | `() => string` | 返回一个 16 字符的 `cuid2` id。一旦 FingerprintJS 解析完成（异步、仅浏览器端），会带上从设备派生的指纹值；在此之前以及在非浏览器/测试环境中回退为固定指纹。 |
| `scheduleMicrotask` | `(task: () => void) => void` | 在微任务队列上运行 `task`（使用 `queueMicrotask`，不可用时回退到 `Promise.resolve().then`）。 |

## 缓存

| 导出 | 签名 | 描述 |
| --- | --- | --- |
| `lru` | `<T = any>(max?: number, ttl?: number, resetTTL?: boolean) => LRU<T>`（来自 `tiny-lru`） | 用于创建 O(1) LRU 缓存的工厂函数（默认 `max: 1000`、`ttl: 0` 表示不过期）。内部被 `getColorPalette` 使用。 |
| `LRU<T = any>` | `class LRU<T> { get, set, has, delete, clear, keys, values, entries, … }`（来自 `tiny-lru`） | `lru()` 所构造的缓存类；直接构造它会跳过 `lru()` 的参数校验。 |

## 字符串大小写与模板工具

| 导出 | 签名 | 描述 |
| --- | --- | --- |
| `constantCase` | `(value: string) => string` | 转换为 `CONSTANT_CASE`（通过 `snakeCase(value).toUpperCase()` 实现）。 |
| `stringify` | `(value: unknown, emptyForNullish?: boolean) => string` | 将任意值转换为可显示的字符串；默认情况下（`emptyForNullish: true`）`null`/`undefined` 变为 `""`，为 `false` 时则变为字面量 `"null"`/`"undefined"`。对象回退到 `JSON.stringify`，若其抛出异常则回退到 `String(value)`。 |

## `lib.ts` 中的通用工具

该模块从 [`radashi`](https://radashi.js.org/)（Radash 的一个分支）中重新导出部分工具，外加少量直接重新导出的项（`cloneDeep` 来自 `klona`，`decodeQueryString`/`encodeQueryString` 来自 `qs`），统一汇总在此处。

### 类型判断函数

除非另有说明，均为 `(value: unknown) => value is T`。

| 导出 | 描述 |
| --- | --- |
| `isArray` | 是否为数组。 |
| `isBigInt` | 是否为 `bigint`。 |
| `isBoolean` | 是否为 `boolean`。 |
| `isDate` | 是否为 `Date`。 |
| `isEmpty` | `(value: unknown) => boolean` —— 是否为空数组/字符串/对象/`Map`/`Set`/nullish 值。 |
| `isError` | 是否为 `Error`。 |
| `isFloat` | 是否为非整数 `number`。 |
| `isFunction` | 是否为 `Function`。 |
| `isInt` | 是否为整数 `number`（`Number.isInteger` 的窄类型版本）。 |
| `isIntString` | 是否为可与整数相互转换的字符串，例如 `"0"`。 |
| `isMap` | 是否为 `Map`。 |
| `isNullish` | 是否为 `null \| undefined`。 |
| `isNumber` | 是否为 `number`。 |
| `isObject` | 是否为任意非基本类型的 `object`。 |
| `isPlainObject` | 是否为纯 `{}` 风格对象（排除类实例、数组、`Map`/`Set` 等）。 |
| `isPrimitive` | `(value: unknown) => boolean` —— 是否为任意 JS 基本类型值。 |
| `isPromise` | 是否为 `PromiseLike<unknown>`。 |
| `isRegExp` | 是否为 `RegExp`。 |
| `isSet` | 是否为 `Set`。 |
| `isString` | 是否为 `string`。 |
| `isSymbol` | 是否为 `symbol`。 |
| `isUndefined` | 是否为 `undefined`。 |
| `isWeakMap` | 是否为 `WeakMap`。 |
| `isWeakSet` | 是否为 `WeakSet`。 |

### 对象工具

| 导出 | 签名 | 描述 |
| --- | --- | --- |
| `assign` | `<TInitial, TOverride>(initial: TInitial, override: TOverride) => Assign<TInitial, TOverride>` | 将 `override` 递归合并到 `initial` 上（纯对象深度合并，其他值直接替换）。 |
| `get` | `<TDefault = unknown>(value: any, path: string, defaultValue?: TDefault) => TDefault` | 从嵌套对象中读取一个点分路径，例如 `get(obj, "a.b.0.c")`。 |
| `omit` | `<T, TKeys extends keyof T>(obj: T, keys: readonly TKeys[]) => Omit<T, TKeys>` | 返回去掉指定键的浅拷贝。 |
| `pick` | `<T extends object, F>(obj: T, filter: F) => Pick<T, …>` | 返回仅包含指定键（或经键过滤谓词筛选）的浅拷贝。 |
| `set` | `<T extends object, K>(initial: T, path: string, value: K) => T` | 返回将点分路径 `path` 设置为 `value` 后的 `initial` 副本。 |
| `cloneDeep` | `<T>(value: T) => T`（来自 `klona`） | 深拷贝一个值（对象、数组、`Date`、`RegExp`、`Map`、`Set`）。 |

### 集合工具

| 导出 | 签名 | 描述 |
| --- | --- | --- |
| `first` | `<TArray, TDefault = undefined>(array: TArray, defaultValue?: TDefault) => …` | 第一个元素，为空时返回 `defaultValue`。 |
| `last` | `<TArray, TDefault = undefined>(array: TArray, defaultValue?: TDefault) => …` | 最后一个元素，为空时返回 `defaultValue`。 |
| `max` | `(array: readonly number[]) => number \| null`，或 `<T>(array: readonly T[], getter: (item: T) => number) => T` | 最大的数字，或 `getter()` 返回值最大的元素。 |
| `min` | `(array: readonly number[]) => number \| null`，或 `<T>(array: readonly T[], getter: (item: T) => number) => T` | 最小的数字，或 `getter()` 返回值最小的元素。 |
| `sum` | `(array: readonly number[]) => number`，或 `<T>(array: readonly T[], fn: (item: T) => number) => number` | 数字之和，或每项 `fn(item)` 的和。 |
| `unique` | `<T, K = T>(array: readonly T[], toKey?: (item: T) => K) => T[]` | 去重后的数组，按值或按派生键去重。 |
| `cluster` | `<T, Size extends number = 2>(array: readonly T[], size?: Size) => T[][]` | 将 `array` 按 `size`（默认 `2`）分组切块。 |

### 命名工具

| 导出 | 签名 | 描述 |
| --- | --- | --- |
| `camelCase` | `(str: string) => string` | 转换为 `camelCase`。 |
| `kebabCase` | `(str: string) => string` | 转换为 `kebab-case`。 |
| `pascalCase` | `(str: string) => string` | 转换为 `PascalCase`。 |
| `snakeCase` | `(str: string, options?) => string` | 转换为 `snake_case`。 |
| `capitalize` | `(str: string) => string` | 首字母大写。 |
| `trim` | `(str: string \| null \| undefined, charsToTrim?: string) => string` | 去除空白字符，或去除指定的字符集合。 |
| `template` | `(str: string, data: Record<string, any>, regex?: RegExp) => string` | 用 `data` 中的值插值 `{{key}}` 风格的占位符（可选自定义占位符 `regex`）。 |
| `similarity` | `(str1: string, str2: string) => number` | 两个字符串之间的相似度分值。 |

### 限流与记忆化

| 导出 | 签名 | 描述 |
| --- | --- | --- |
| `debounce` | `<TArgs extends any[]>({ delay, leading }, func: (...args: TArgs) => any) => DebounceFunction<TArgs>` | 带 `.cancel()` / `.flush()` / `.isPending()` 的防抖包装函数。 |
| `throttle` | `<TArgs extends any[]>({ interval, trailing }, func: (...args: TArgs) => any) => ThrottledFunction<TArgs>` | 节流包装函数。 |
| `memoize` | `<TArgs, TResult>(func: (...args: TArgs) => TResult, options?: MemoOptions<TArgs>) => (...args: TArgs) => TResult` | 按参数列表缓存 `func` 的结果。 |
| `once` | `<Args, Return, This>(fn: (this: This, ...args: Args) => Return) => (this: This, ...args: Args) => Return` | `fn` 最多运行一次；后续调用返回首次调用的结果。 |
| `noop` | `() => undefined` | 不执行任何操作。 |

### 数值转换

| 导出 | 签名 | 描述 |
| --- | --- | --- |
| `toFloat` | `(value: unknown) => number`，或 `<T>(value: unknown, defaultValue: T) => number \| T` | 解析为浮点数，无法解析时返回 `defaultValue`。 |
| `toInt` | `(value: unknown) => number`，或 `<T>(value: unknown, defaultValue: T) => number \| T` | 解析为整数，无法解析时返回 `defaultValue`。 |

### 查询字符串工具

| 导出 | 签名 | 描述 |
| --- | --- | --- |
| `decodeQueryString` | `(str: string) => object`（`qs.parse`） | 将查询字符串解析为嵌套对象。 |
| `encodeQueryString` | `(obj: object) => string`（`qs.stringify`） | 将对象序列化为查询字符串。 |

### 常量与占位函数

| 导出 | 签名 | 描述 |
| --- | --- | --- |
| `always` | `<T>(value: T) => () => T` | 构建一个始终返回 `value` 的函数。 |
| `alwaysTrue` | `() => true` | `always(true)`。 |
| `alwaysFalse` | `() => false` | `always(false)`。 |
