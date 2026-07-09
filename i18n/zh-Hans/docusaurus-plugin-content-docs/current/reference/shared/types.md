---
title: 类型工具
description: "@vef-framework-react/shared 导出的每一个颜色、深层键（deep-key）以及通用类型工具的签名。"
---

# 类型工具

## 颜色类型

| 类型 | 描述 |
| --- | --- |
| `ColorEntry = [hex: string, name: string]` | 用于构建命名颜色查找表的单条 `[hex, name]` 元组条目。 |
| `ColorNumber = 50 \| 100 \| 200 \| 300 \| 400 \| 500 \| 600 \| 700 \| 800 \| 900 \| 950` | 所有色阶中使用的色阶权重键。 |
| `ColorSwatch { number: ColorNumber; hex: string }` | 色系中的一个带权重色板。 |
| `ColorPalette { name: string; swatches: ColorSwatch[] }` | 一组命名的色板集合。 |
| `ColorSwatchWithDelta extends ColorSwatch { delta: number }` | 标注了与参考颜色之间 Delta E 距离的色板。 |
| `NearestColorPalette extends ColorPalette { nearestSwatch: ColorSwatchWithDelta; nearestLightnessSwatch: ColorSwatchWithDelta }` | `getColorPalette` 内部使用的最近色系匹配结果。 |
| `MatchedColorPalette extends ColorPalette { colorMap: Map<ColorNumber, string>; main: ColorSwatch; matched: ColorSwatch }` | 完整生成的色系结果，以色板编号为键（`main` 为编号 `500` 的色板）。 |
| `ColorPaletteObject` | 将 `colorPalettes` 数组重塑为对象形式：`{ [kebab-case 名称]: { [色板编号]: 十六进制值 } }`。 |
| `PresetColor` | 所有内置色系名称的 kebab-case 联合类型（例如 `"red"`、`"orange"`），从 `colorPalettes` 派生而来。 |

## 深层键

| 类型 | 描述 |
| --- | --- |
| `DeepKeys<T, TDepth extends any[] = []>` | `T` 中所有点分路径属性路径的联合类型（含嵌套对象、元组和数组），最多支持 5 层深度；`Date` 被视为叶子节点。适用于表格 `dataIndex`、表单字段路径等需要类型安全的深层对象访问场景。 |

## 通用类型工具

VEF 自定义:

| 类型 | 描述 |
| --- | --- |
| `Builtin = Primitive \| Function \| Date \| Error \| RegExp` | `PartialDeep`/`RequiredDeep` 一类递归工具类型停止递归的类型集合。 |
| `Key = string` | 数据驱动组件中通用的选项/行键类型。 |
| `Awaitable<T> = T \| Promise<T>` | 一个值或该值的 Promise。 |
| `MaybeArray<T> = T \| T[]` | 一个值或该值的数组。 |
| `MaybeNullish<T> = T \| null \| undefined` | 一个值、`null` 或 `undefined`。 |
| `MaybeUndefined<T> = T \| undefined` | 一个值或 `undefined`。 |
| `MaybeNull<T> = T \| null` | 一个值或 `null`。 |
| `IsString<T> = T extends string ? true : false` | 用于判断 `T` 是否为 `string` 的布尔类型守卫。 |
| `Not<A extends boolean>` | 反转一个布尔字面量类型（`Not<true>` 为 `false`）。 |
| `EmptyObject`（接口） | 空对象类型（`{}`），区别于 `Record<string, unknown>`。 |
| `AnyObject = Record<keyof any, any>` | 不限制键或值的对象类型。 |
| `RenameKey<T, TOldKey extends keyof T, TNewKey extends string>` | 重命名对象类型的某个键，保留其值类型及其余所有键不变。 |
| `NonFunctionGuard<T> = T extends Function ? never : T` | 当 `T` 是函数类型时解析为 `never`，否则解析为 `T`。 |
| `OmitSymbol<T>` | 从对象类型中省略所有 `symbol` 类型的键。 |

从 [`type-fest`](https://github.com/sindresorhus/type-fest) 重新导出（仅导入并配置一次，随后统一重新导出，确保每个包解析到同一版本）:

| 类型 | 描述 |
| --- | --- |
| `And<A, B>` | 判断两个给定的布尔类型是否同时为 `true` 的布尔类型。 |
| `Or<A, B>` | 判断两个给定的布尔类型中是否任一为 `true` 的布尔类型。 |
| `If<TCondition, TThen, TElse>` | 根据 `TCondition` 为 `true` 或 `false`，解析为 `TThen` 或 `TElse`。 |
| `Except<ObjectType, KeysType>` | 类似 `Omit`，但只允许 `ObjectType` 上实际存在的键。 |
| `DistributedOmit<ObjectType, KeysType>` | 对联合类型分发计算的 `Omit`，而非折叠为各成员的公共键。 |
| `DistributedPick<ObjectType, KeysType>` | 对联合类型分发计算的 `Pick`，而非折叠为各成员的公共键。 |
| `HasOptionalKeys<T>` | 判断 `T` 是否含有任何可选字段的布尔类型。 |
| `HasRequiredKeys<T>` | 判断 `T` 是否含有任何必选字段的布尔类型。 |
| `IsAny<T>` | 判断 `T` 是否为 `any` 的布尔类型。 |
| `IsNever<T>` | 判断 `T` 是否为 `never` 的布尔类型。 |
| `IsNull<T>` | 判断 `T` 是否为 `null` 的布尔类型。 |
| `IsUnknown<T>` | 判断 `T` 是否为 `unknown` 的布尔类型。 |
| `IsUndefined<T>` | 判断 `T` 是否为 `undefined` 的布尔类型。 |
| `IsNullable<T>` | 判断 `T` 是否包含 `null` 的布尔类型。 |
| `IsOptional<T>` | 判断 `T` 是否包含 `undefined` 的布尔类型。 |
| `IsEqual<A, B>` | 判断两个给定类型是否相等的布尔类型。 |
| `IsFloat<T>` | 判断给定数字字面量是否为浮点数（如 `1.5`）的布尔类型。 |
| `IsInteger<T>` | 判断给定数字字面量是否为整数的布尔类型。 |
| `IsLiteral<T>` | 判断 `T` 是否为任意字面量类型（字符串、数字、布尔值或符号）的布尔类型。 |
| `IsStringLiteral<T>` | 判断 `T` 是否为 `string` 字面量类型的布尔类型。 |
| `IsNumericLiteral<T>` | 判断 `T` 是否为 `number` 或 `bigint` 字面量类型的布尔类型。 |
| `IsBooleanLiteral<T>` | 判断 `T` 是否为 `true` 或 `false` 字面量类型的布尔类型。 |
| `IsSymbolLiteral<T>` | 判断 `T` 是否为 `symbol` 字面量类型的布尔类型。 |
| `IsTuple<T>` | 判断数组类型是否为固定长度的元组而非普通数组的布尔类型。 |
| `IsOptionalKeyOf<T, Key>` | 判断 `Key` 是否为 `T` 的可选键的布尔类型。 |
| `IsRequiredKeyOf<T, Key>` | 判断 `Key` 是否为 `T` 的必选键的布尔类型。 |
| `IsReadonlyKeyOf<T, Key>` | 判断 `Key` 是否为 `T` 的只读键的布尔类型。 |
| `IsWritableKeyOf<T, Key>` | 判断 `Key` 是否为 `T` 的可写（非只读）键的布尔类型。 |
| `IterableElement<TIterable>` | `Iterable` / `AsyncIterable`（数组、`Set`、`Map`、生成器、流等）产出的元素类型。 |
| `KebabCase<S>` | 将字符串字面量类型转换为 `kebab-case`。 |
| `LiteralUnion<LiteralType, BaseType>` | 由字面量类型与基础原始类型组成的联合类型，且不丢失字面量的 IDE 自动补全。 |
| `NonEmptyObject<T>` | 至少有一个非可选键的对象类型。 |
| `NonEmptyString<T>` | 匹配任意非空字符串字面量。 |
| `NonEmptyTuple<T>` | 匹配任意非空元组。 |
| `OptionalKeysOf<T>` | 提取 `T` 的所有可选键。 |
| `RequiredKeysOf<T>` | 提取 `T` 的所有必选键。 |
| `OverrideProperties<TSource, TOverride>` | 覆盖 `TSource` 的已有属性，要求每个被覆盖的键必须已经存在（比 `Merge` 更严格）。 |
| `PartialDeep<T>` | 递归地将 `T` 的每个属性变为可选。 |
| `RequiredDeep<T>` | 递归地将 `T` 的每个属性变为必选。 |
| `Primitive` | 所有 JS 原始值类型的联合（`string \| number \| bigint \| boolean \| symbol \| null \| undefined`）。 |
| `SetOptional<T, Keys>` | 将给定的键变为可选，`T` 的其余部分保持不变。 |
| `SetRequired<T, Keys>` | 将给定的键变为必选，`T` 的其余部分保持不变。 |
| `SetReadonly<T, Keys>` | 将给定的键变为只读，`T` 的其余部分保持不变。 |
| `SetFieldType<T, Keys, Type>` | 改变给定键的值类型，`T` 的其余部分保持不变。 |
| `SetReturnType<Fn, Type>` | 创建一个返回类型不同、但参数与 `Fn` 相同的函数类型。 |
| `SetParameterType<Fn, Params>` | 创建一个参数列表不同、但返回类型与 `Fn` 相同的函数类型。 |
| `Simplify<T>` | 将交叉类型/接口展平为单一对象类型，以获得更清晰的编辑器提示。 |
| `SimplifyDeep<T, ExcludeType>` | 递归地应用 `Simplify`，可选地排除某些嵌套类型。 |

这些类型在 `core`、`components` 和 `starter` 中被广泛使用。
