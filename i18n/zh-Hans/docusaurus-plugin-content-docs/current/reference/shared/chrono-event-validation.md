---
title: 校验、时间、事件与安全
description: "@vef-framework-react/shared 中每个日期、格式化、相等性判断、错误堆栈、事件总线、安全与 Zod 导出的签名。"
---

# 校验、时间、事件与安全

## 日期与时间

构建在预配置好的 `dayjs` 之上（zh-CN 语言环境，启用 `localizedFormat` / `customParseFormat` / `duration` / `relativeTime` 插件）。

| Export | Signature | Description |
| --- | --- | --- |
| `Dayjs` | `type Dayjs = dayjs.Dayjs` | dayjs 实例类型的重新导出。 |
| `TemporalMode` | `"minute" \| "hour" \| "time" \| "date" \| "datetime" \| "week" \| "month" \| "quarter" \| "year"` | 时间选择器的粒度。 |
| `DEFAULT_DATE_FORMAT` | `"YYYY-MM-DD"` | 默认日期格式常量。 |
| `DEFAULT_TIME_FORMAT` | `"HH:mm:ss"` | 默认时间格式常量。 |
| `DEFAULT_DATETIME_FORMAT` | `"YYYY-MM-DD HH:mm:ss"` | 默认日期时间格式常量。 |
| `LOCALIZED_DATE_FORMAT` | `"LLdddd"` | dayjs 本地化格式 token，表示完整日期 + 星期。 |
| `LOCALIZED_DATETIME_FORMAT` | `"LLLL"` | dayjs 本地化格式 token，表示完整日期时间。 |
| `formatDuration` | `(value: number, unit?: DurationUnitType) => string` | 将时长（默认单位 `"seconds"`）格式化为易读的中文字符串，例如 `formatDuration(3600)` → `"1小时0分钟"`。 |
| `parseDate` | `(date: string \| Date, format?: string) => Dayjs` | 将日期字符串或 `Date` 解析为 `Dayjs` 实例；对 `Date` 类型输入会忽略 `format`，未提供 `format` 时使用 dayjs 的内置解析器（ISO 8601 及常见形态）。输入格式不正确时可能返回无效的 `Dayjs`——如果不确定输入形态，请使用 `tryParseDate`。 |
| `tryParseDate` | `(date: string) => Dayjs \| null` | 解析日期字符串：先对每种已知的日期时间格式做严格匹配，再对每种日期格式做严格匹配（`"YYYY-MM-DD"`、`"YYYY/MM/DD"`、`"YYYYMMDD"`、两位年份变体等），最后回退到 dayjs 的默认解析器；全部失败时返回 `null` 而不是无效的 `Dayjs`。 |
| `tryParseTime` | `(time: string) => Dayjs \| null` | 解析 dayjs 默认解析器会拒绝的纯时间字符串，按时间（`"HH:mm:ss"`、`"HH.mm.ss"`、`"HHmmss"`）、分钟（`"HH:mm"`、`"HH.mm"`、`"HHmm"`）与小时（`"HH"`）格式做严格匹配；解析失败时返回 `null`。 |
| `formatDate` | `(date: Dayjs, format?: string) => string` | 格式化一个 `Dayjs` 实例（默认格式为 `DEFAULT_DATETIME_FORMAT`）。 |
| `getNow` | `() => Dayjs` | 以 `Dayjs` 实例的形式返回当前时间。 |
| `getNowDateString` | `() => string` | 以 `"YYYY-MM-DD"` 格式表示的当前日期。 |
| `getNowTimeString` | `() => string` | 以 `"HH:mm:ss"` 格式表示的当前时间。 |
| `getNowDateTimeString` | `() => string` | 以 `"YYYY-MM-DD HH:mm:ss"` 格式表示的当前日期时间。 |
| `getLocalizedDateTime` | `(includeTime?: boolean) => string` | 以 zh-CN 本地化完整格式表示的当前日期时间（默认 `includeTime: true`）。 |
| `getTemporalFormats` | `<T extends TemporalMode>(mode: T) => readonly string[]` | 返回某个 `TemporalMode` 所接受的解析格式列表（例如 `getTemporalFormats("date")` → `["YYYY-MM-DD", "YYYY/MM/DD", …]`）。 |

## 格式化

| Export | Signature | Description |
| --- | --- | --- |
| `formatBytes` | `(bytes: number, decimals?: number) => string` | 将字节数格式化为带二进制（基于 1024）`B`/`KB`/`MB`/`GB`/`TB`/`PB` 单位后缀的形式，例如 `formatBytes(1536, 1)` → `"1.5 KB"`（默认 `decimals: 2`；末尾的零会被去掉；`0` → `"0 B"`）。 |
| `formatNumber` | `(num: number, decimals?: number) => string` | 将较大的数字格式化为带十进制（基于 1000）`K`/`M`/`B`/`T` 单位后缀的形式，例如 `formatNumber(1234567)` → `"1.23 M"`（默认 `decimals: 2`）。小于 `1000` 的数字原样返回，不带后缀。 |

## 相等性判断

| Export | Signature | Description |
| --- | --- | --- |
| `isShallowEqual` | `(value1: unknown, value2: unknown) => boolean` | 浅层相等判断：基本类型通过 `Object.is` 比较，`Map`/`Set`/普通对象/数组比较一层深度。 |
| `isDeepEqual` | `(value1: unknown, value2: unknown) => boolean` | 支持循环引用的深层相等判断；对 `Date`、`RegExp`、`Set`、`Map`、`ArrayBuffer`、类型化数组，以及自定义了 `valueOf`/`toString` 的对象做了特殊处理。 |

## 错误与堆栈辅助函数

构建在 `stacktrace-js` 之上。

| Export | Signature | Description |
| --- | --- | --- |
| `StackFrame` | `type StackFrame = stackTrace.StackFrame` | stacktrace-js 帧类型的重新导出。 |
| `parseErrorStack` | `(error: Error, filter?: (frame: StackFrame) => boolean) => Promise<StackFrame[]>` | 将 `Error` 的堆栈解析为帧数组，可选地进行过滤。 |
| `filterUserFrame` | `(stackFrame: StackFrame) => boolean` | 排除 `node_modules` 帧的帧过滤器。 |
| `getSanitizedErrorStack` | `(error: Error) => Promise<string>` | 将错误堆栈格式化为仅包含用户代码的文本（应用了 `filterUserFrame`），每帧一行，格式为 `at fn (file:line:col)`。 |
| `getCurrentStack` | `(filter?: (frame: StackFrame) => boolean) => Promise<StackFrame[]>` | 捕获当前调用栈。 |
| `getCurrentStackSync` | `(filter?: (frame: StackFrame) => boolean) => StackFrame[]` | `getCurrentStack` 的同步版本。 |

## 事件总线

构建在 `mitt` 之上。

| Export | Signature | Description |
| --- | --- | --- |
| `EventEmitter<TEvents>` | `class EventEmitter<TEvents extends Record<EventType, any>>` | 类型安全的事件发射器（成员见下方表格）。 |
| `createEventEmitter` | `<TEvents>() => EventEmitter<TEvents>` | 创建新 `EventEmitter` 实例的工厂函数。 |
| `EventHandler` | `type EventHandler<T> = Handler<T>`（来自 `mitt`） | `EventEmitter.on` 所接受的监听函数类型。 |
| `EventType` | `type EventType`（来自 `mitt`） | `EventEmitter` 使用的事件 key 约束（`string \| symbol`）。 |

`EventEmitter` 成员：

| Member | Signature | Description |
| --- | --- | --- |
| `on` | `(eventType, eventListener) => () => void` | 订阅；返回取消订阅函数。 |
| `emit` | `(eventType)` / `(eventType, eventPayload)` | 发出事件。仅当 `TEvents[eventType]` 允许 `undefined` 时才接受不带 payload 的重载。 |
| `off` | `(eventType, eventListener?) => void` | 移除一个监听器——省略 `eventListener` 时移除该类型的**所有**监听器。 |
| `clear` | `() => void` | 移除所有事件的所有监听器。 |
| `getAllListeners` | `() => EventHandlerMap<TEvents>` | 返回底层的 mitt 处理函数映射（用于调试）。 |

## 安全辅助函数

| Export | Signature | Description |
| --- | --- | --- |
| `obfuscateEncode` | `(plainText: string) => Uint8Array` | 使用固定的 16 字节 key 对字符串做 XOR 混淆；不具备密码学安全性，仅用于简单混淆。 |
| `obfuscateDecode` | `(encoded: Uint8Array \| number[]) => string` | `obfuscateEncode` 的逆操作。 |
| `obfuscateEncodeToHex` | `(plainText: string) => string` | `obfuscateEncode` 的结果，以十六进制编码。 |
| `obfuscateDecodeFromHex` | `(hexString: string) => string` | `obfuscateEncodeToHex` 的逆操作。 |
| `obfuscateEncodeToBase64` | `(plainText: string) => string` | `obfuscateEncode` 的结果，以 base64 编码。 |
| `obfuscateDecodeFromBase64` | `(base64String: string) => string` | `obfuscateEncodeToBase64` 的逆操作。 |
| `encryptUsingRSA` | `(value: string, publicKey: string) => string` | 使用 PEM 格式公钥对值做 RSA 加密（通过 `jsencrypt`）；输入无效或加密失败时抛出异常。 |
| `decryptUsingRSA` | `(value: string, privateKey: string) => string` | 使用 PEM 格式私钥对值做 RSA 解密；输入无效或解密失败时抛出异常。 |

## Zod 直出

一个项目级唯一的 `zod` 实例，预先配置好 `zh-CN` 语言环境（`z.config(zhCN())`），重新导出后所有包共享同一个已配置实例。

| Export | Description |
| --- | --- |
| `z` | 已配置好的 Zod 命名空间/工厂。 |
| `ZodError` | Zod 的校验错误类型。 |
| `ZodIssue` | `ZodError` 中的单条校验问题。 |
| `ZodSchema` | 基础 schema 类型。 |
| `ZodType` | 所有 Zod 类型的基础类型。 |
