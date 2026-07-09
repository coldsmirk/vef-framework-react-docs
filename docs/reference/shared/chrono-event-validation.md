---
title: Validation, Time, Events, and Security
description: Signatures for every date, formatting, equality, error-stack, event-bus, security, and Zod export in @vef-framework-react/shared.
---

# Validation, Time, Events, and Security

## Date and Time

Built on a pre-configured `dayjs` (zh-CN locale, `localizedFormat` / `customParseFormat` / `duration` / `relativeTime` plugins).

| Export | Signature | Description |
| --- | --- | --- |
| `Dayjs` | `type Dayjs = dayjs.Dayjs` | Re-export of dayjs's instance type. |
| `TemporalMode` | `"minute" \| "hour" \| "time" \| "date" \| "datetime" \| "week" \| "month" \| "quarter" \| "year"` | Temporal-picker granularity. |
| `DEFAULT_DATE_FORMAT` | `"YYYY-MM-DD"` | Default date format constant. |
| `DEFAULT_TIME_FORMAT` | `"HH:mm:ss"` | Default time format constant. |
| `DEFAULT_DATETIME_FORMAT` | `"YYYY-MM-DD HH:mm:ss"` | Default datetime format constant. |
| `LOCALIZED_DATE_FORMAT` | `"LLdddd"` | dayjs localized-format token for a full date + weekday. |
| `LOCALIZED_DATETIME_FORMAT` | `"LLLL"` | dayjs localized-format token for a full datetime. |
| `formatDuration` | `(value: number, unit?: DurationUnitType) => string` | Formats a duration (default unit `"seconds"`) as a human-readable Chinese string, e.g. `formatDuration(3600)` → `"1小时0分钟"`. |
| `parseDate` | `(date: string \| Date, format?: string) => Dayjs` | Parses a date string or `Date` into a `Dayjs` instance; `format` is ignored for `Date` inputs. May return an invalid `Dayjs` on bad input — use `tryParseDate` when the shape is unknown. |
| `tryParseDate` | `(date: string) => Dayjs \| null` | Parses a date string by trying every known date/datetime format; returns `null` instead of an invalid `Dayjs` on failure. |
| `tryParseTime` | `(time: string) => Dayjs \| null` | Parses a bare time-of-day string (e.g. `"08:08:00"`) that dayjs's default parser would reject; returns `null` on failure. |
| `formatDate` | `(date: Dayjs, format?: string) => string` | Formats a `Dayjs` instance (default format `DEFAULT_DATETIME_FORMAT`). |
| `getNow` | `() => Dayjs` | Returns the current time as a `Dayjs` instance. |
| `getNowDateString` | `() => string` | Current date as `"YYYY-MM-DD"`. |
| `getNowTimeString` | `() => string` | Current time as `"HH:mm:ss"`. |
| `getNowDateTimeString` | `() => string` | Current datetime as `"YYYY-MM-DD HH:mm:ss"`. |
| `getLocalizedDateTime` | `(includeTime?: boolean) => string` | Current datetime in the zh-CN localized full format (default `includeTime: true`). |
| `getTemporalFormats` | `<T extends TemporalMode>(mode: T) => readonly string[]` | Returns the accepted parse-format patterns for a `TemporalMode` (e.g. `getTemporalFormats("date")` → `["YYYY-MM-DD", "YYYY/MM/DD", …]`). |

## Formatting

| Export | Signature | Description |
| --- | --- | --- |
| `formatBytes` | `(bytes: number, decimals?: number) => string` | Formats a byte count as `"1.5 KB"`-style output (default `decimals: 2`). |
| `formatNumber` | `(num: number, decimals?: number) => string` | Formats a large number with a `K`/`M`/`B`/`T` unit suffix (default `decimals: 2`). |

## Equality

| Export | Signature | Description |
| --- | --- | --- |
| `isShallowEqual` | `(value1: unknown, value2: unknown) => boolean` | Shallow equality: primitives via `Object.is`, one level deep for `Map`/`Set`/plain objects/arrays. |
| `isDeepEqual` | `(value1: unknown, value2: unknown) => boolean` | Deep equality with circular-reference support; special-cases `Date`, `RegExp`, `Set`, `Map`, `ArrayBuffer`, typed arrays, and objects with custom `valueOf`/`toString`. |

## Error and Stack Helpers

Built on `stacktrace-js`.

| Export | Signature | Description |
| --- | --- | --- |
| `StackFrame` | `type StackFrame = stackTrace.StackFrame` | Re-export of stacktrace-js's frame type. |
| `parseErrorStack` | `(error: Error, filter?: (frame: StackFrame) => boolean) => Promise<StackFrame[]>` | Parses an `Error`'s stack into frames, optionally filtered. |
| `filterUserFrame` | `(stackFrame: StackFrame) => boolean` | Frame filter that excludes `node_modules` frames. |
| `getSanitizedErrorStack` | `(error: Error) => Promise<string>` | Formats an error's stack as user-code-only text (`filterUserFrame` applied), one `at fn (file:line:col)` line per frame. |
| `getCurrentStack` | `(filter?: (frame: StackFrame) => boolean) => Promise<StackFrame[]>` | Captures the current call stack. |
| `getCurrentStackSync` | `(filter?: (frame: StackFrame) => boolean) => StackFrame[]` | Synchronous version of `getCurrentStack`. |

## Event Bus

Built on `mitt`.

| Export | Signature | Description |
| --- | --- | --- |
| `EventEmitter<TEvents>` | `class EventEmitter<TEvents> { on, emit, off, clear, getAllListeners }` | Type-safe event emitter. `on(type, listener)` returns an unsubscribe function; `emit(type)` requires no payload when `TEvents[type]` allows `undefined`, otherwise `emit(type, payload)`. |
| `createEventEmitter` | `<TEvents>() => EventEmitter<TEvents>` | Factory for a new `EventEmitter` instance. |
| `EventHandler` | `type EventHandler<T> = Handler<T>` (from `mitt`) | The listener function type accepted by `EventEmitter.on`. |
| `EventType` | `type EventType` (from `mitt`) | The event-key constraint (`string \| symbol`) used by `EventEmitter`. |

## Security Helpers

| Export | Signature | Description |
| --- | --- | --- |
| `obfuscateEncode` | `(plainText: string) => Uint8Array` | XOR-obfuscates a string with a fixed 16-byte key; not cryptographic security, only casual obfuscation. |
| `obfuscateDecode` | `(encoded: Uint8Array \| number[]) => string` | Reverses `obfuscateEncode`. |
| `obfuscateEncodeToHex` | `(plainText: string) => string` | `obfuscateEncode`, hex-encoded. |
| `obfuscateDecodeFromHex` | `(hexString: string) => string` | Reverses `obfuscateEncodeToHex`. |
| `obfuscateEncodeToBase64` | `(plainText: string) => string` | `obfuscateEncode`, base64-encoded. |
| `obfuscateDecodeFromBase64` | `(base64String: string) => string` | Reverses `obfuscateEncodeToBase64`. |
| `encryptUsingRSA` | `(value: string, publicKey: string) => string` | RSA-encrypts (via `jsencrypt`) a value with a PEM public key; throws on invalid input or encryption failure. |
| `decryptUsingRSA` | `(value: string, privateKey: string) => string` | RSA-decrypts a value with a PEM private key; throws on invalid input or decryption failure. |

## Zod Re-Exports

A single project-wide `zod` instance, pre-configured with the `zh-CN` locale (`z.config(zhCN())`), re-exported so every package shares the same configured instance.

| Export | Description |
| --- | --- |
| `z` | The configured Zod namespace/factory. |
| `ZodError` | Zod's validation error type. |
| `ZodIssue` | A single validation issue within a `ZodError`. |
| `ZodSchema` | The base schema type. |
| `ZodType` | The base type for all Zod types. |
