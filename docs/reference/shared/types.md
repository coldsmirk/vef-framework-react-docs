---
title: Type Utilities
description: Signatures for every color, deep-key, and general type utility exported by @vef-framework-react/shared.
---

# Type Utilities

## Color Types

| Type | Description |
| --- | --- |
| `ColorEntry = [hex: string, name: string]` | One `[hex, name]` tuple entry used to build the named-color lookup table. |
| `ColorNumber = 50 \| 100 \| 200 \| 300 \| 400 \| 500 \| 600 \| 700 \| 800 \| 900 \| 950` | The swatch-weight keys used across every palette. |
| `ColorSwatch { number: ColorNumber; hex: string }` | One weighted swatch in a palette. |
| `ColorPalette { name: string; swatches: ColorSwatch[] }` | A named family of swatches. |
| `ColorSwatchWithDelta extends ColorSwatch { delta: number }` | A swatch annotated with its Delta E distance from a reference color. |
| `NearestColorPalette extends ColorPalette { nearestSwatch: ColorSwatchWithDelta; nearestLightnessSwatch: ColorSwatchWithDelta }` | The nearest-palette match result used internally by `getColorPalette`. |
| `MatchedColorPalette extends ColorPalette { colorMap: Map<ColorNumber, string>; main: ColorSwatch; matched: ColorSwatch }` | The full generated-palette result, keyed by swatch number (`main` is swatch `500`). |
| `ColorPaletteObject` | The `colorPalettes` array reshaped as an object: `{ [kebab-case name]: { [swatch number]: hex } }`. |
| `PresetColor` | Union of every built-in palette name in kebab-case (e.g. `"red"`, `"orange"`), derived from `colorPalettes`. |

## Deep Keys

| Type | Description |
| --- | --- |
| `DeepKeys<T, TDepth extends any[] = []>` | Union of every dot-notation property path in `T` (nested objects, tuples, and arrays), up to 5 levels deep; `Date` is treated as a leaf. Useful for table `dataIndex`, form field paths, and other type-safe deep-object access. |

## General Type Utilities

VEF-defined:

| Type | Description |
| --- | --- |
| `Builtin = Primitive \| Function \| Date \| Error \| RegExp` | The set of types `PartialDeep`/`RequiredDeep`-style recursive utilities stop recursing into. |
| `Key = string` | The canonical option/row key type used across data-driven components. |
| `Awaitable<T> = T \| Promise<T>` | A value or a promise of that value. |
| `MaybeArray<T> = T \| T[]` | A value or an array of that value. |
| `MaybeNullish<T> = T \| null \| undefined` | A value, `null`, or `undefined`. |
| `MaybeUndefined<T> = T \| undefined` | A value or `undefined`. |
| `MaybeNull<T> = T \| null` | A value or `null`. |
| `IsString<T> = T extends string ? true : false` | Boolean type-guard for whether `T` is a `string`. |
| `Not<A extends boolean>` | Inverts a boolean literal type (`Not<true>` is `false`). |
| `EmptyObject` (interface) | The empty-object type (`{}`), distinct from `Record<string, unknown>`. |
| `AnyObject = Record<keyof any, any>` | An object type with no key or value constraint. |
| `RenameKey<T, TOldKey extends keyof T, TNewKey extends string>` | Renames one key of an object type, keeping its value type and every other key unchanged. |
| `NonFunctionGuard<T> = T extends Function ? never : T` | Resolves to `never` when `T` is a function type, otherwise `T`. |
| `OmitSymbol<T>` | Omits all `symbol` keys from an object type. |

Re-exported from [`type-fest`](https://github.com/sindresorhus/type-fest) (imported once, configured, and re-exported so every package resolves the same version):

| Type | Description |
| --- | --- |
| `And<A, B>` | Boolean type for whether two given boolean types are both `true`. |
| `Or<A, B>` | Boolean type for whether either of two given boolean types is `true`. |
| `If<TCondition, TThen, TElse>` | Resolves to `TThen` or `TElse` depending on whether `TCondition` is `true` or `false`. |
| `Except<ObjectType, KeysType>` | Like `Omit`, but only allows keys that actually exist on `ObjectType`. |
| `DistributedOmit<ObjectType, KeysType>` | `Omit` that distributes over a union instead of collapsing it to the members' common keys. |
| `DistributedPick<ObjectType, KeysType>` | `Pick` that distributes over a union instead of collapsing it to the members' common keys. |
| `HasOptionalKeys<T>` | Boolean type for whether `T` has any optional fields. |
| `HasRequiredKeys<T>` | Boolean type for whether `T` has any required fields. |
| `IsAny<T>` | Boolean type for whether `T` is `any`. |
| `IsNever<T>` | Boolean type for whether `T` is `never`. |
| `IsNull<T>` | Boolean type for whether `T` is `null`. |
| `IsUnknown<T>` | Boolean type for whether `T` is `unknown`. |
| `IsUndefined<T>` | Boolean type for whether `T` is `undefined`. |
| `IsNullable<T>` | Boolean type for whether `T` includes `null`. |
| `IsOptional<T>` | Boolean type for whether `T` includes `undefined`. |
| `IsEqual<A, B>` | Boolean type for whether two given types are equal. |
| `IsFloat<T>` | Boolean type for whether the given number literal is a float (e.g. `1.5`). |
| `IsInteger<T>` | Boolean type for whether the given number literal is an integer. |
| `IsLiteral<T>` | Boolean type for whether `T` is any literal type (string, number, boolean, or symbol). |
| `IsStringLiteral<T>` | Boolean type for whether `T` is a `string` literal type. |
| `IsNumericLiteral<T>` | Boolean type for whether `T` is a `number` or `bigint` literal type. |
| `IsBooleanLiteral<T>` | Boolean type for whether `T` is a `true` or `false` literal type. |
| `IsSymbolLiteral<T>` | Boolean type for whether `T` is a `symbol` literal type. |
| `IsTuple<T>` | Boolean type for whether an array type is a fixed-length tuple rather than a regular array. |
| `IsOptionalKeyOf<T, Key>` | Boolean type for whether `Key` is an optional key of `T`. |
| `IsRequiredKeyOf<T, Key>` | Boolean type for whether `Key` is a required key of `T`. |
| `IsReadonlyKeyOf<T, Key>` | Boolean type for whether `Key` is a readonly key of `T`. |
| `IsWritableKeyOf<T, Key>` | Boolean type for whether `Key` is a writable (non-readonly) key of `T`. |
| `IterableElement<TIterable>` | The element type yielded by an `Iterable` / `AsyncIterable` (arrays, `Set`, `Map`, generators, streams, …). |
| `KebabCase<S>` | Converts a string literal type to `kebab-case`. |
| `LiteralUnion<LiteralType, BaseType>` | A union of literal types plus a base primitive type, without losing IDE autocompletion for the literals. |
| `NonEmptyObject<T>` | An object type with at least one non-optional key. |
| `NonEmptyString<T>` | Matches any non-empty string literal. |
| `NonEmptyTuple<T>` | Matches any non-empty tuple. |
| `OptionalKeysOf<T>` | Extracts all optional keys from `T`. |
| `RequiredKeysOf<T>` | Extracts all required keys from `T`. |
| `OverrideProperties<TSource, TOverride>` | Overrides existing properties of `TSource`, requiring every overridden key to already exist (stricter than `Merge`). |
| `PartialDeep<T>` | Recursively makes every property of `T` optional. |
| `RequiredDeep<T>` | Recursively makes every property of `T` required. |
| `Primitive` | Union of every JS primitive value type (`string \| number \| bigint \| boolean \| symbol \| null \| undefined`). |
| `SetOptional<T, Keys>` | Makes the given keys optional, leaving the rest of `T` unchanged. |
| `SetRequired<T, Keys>` | Makes the given keys required, leaving the rest of `T` unchanged. |
| `SetReadonly<T, Keys>` | Makes the given keys readonly, leaving the rest of `T` unchanged. |
| `SetFieldType<T, Keys, Type>` | Changes the value type of the given keys, leaving the rest of `T` unchanged. |
| `SetReturnType<Fn, Type>` | Creates a function type with a different return type but the same parameters as `Fn`. |
| `SetParameterType<Fn, Params>` | Creates a function type with a different parameter list but the same return type as `Fn`. |
| `Simplify<T>` | Flattens an intersection/interface into a single object type for cleaner editor hints. |
| `SimplifyDeep<T, ExcludeType>` | Recursively applies `Simplify`, optionally excluding certain nested types. |

These are used widely across `core`, `components`, and `starter`.
