---
sidebar_position: 2
title: 类型工具
---

# 类型工具

## 颜色类型

| 导出 | 推荐场景 |
| --- | --- |
| `ColorEntry` | 单个颜色条目 |
| `ColorNumber` | 色阶编号 |
| `ColorSwatch` | 颜色色板单项 |
| `ColorPalette` | 一整组色板 |
| `ColorSwatchWithDelta` | 带色差信息的色板项 |
| `NearestColorPalette` | 最近颜色匹配结果 |
| `MatchedColorPalette` | 已匹配色板结果 |

## 深层键名

| 导出 | 推荐场景 |
| --- | --- |
| `DeepKeys` | 表格 `dataIndex`、表单路径、对象深层 key 类型约束 |

## 通用类型工具

下面这些类型广泛用于 `core`、`components`、`starter` 的类型系统中:

| 导出 | 推荐场景 |
| --- | --- |
| `Key` | 通用主键类型 |
| `Awaitable` | 同步或异步返回值 |
| `MaybeArray` / `MaybeNull` / `MaybeUndefined` | 可选输入建模 |
| `AnyObject` / `EmptyObject` | 通用对象边界 |
| `Except` | 从类型中排除部分字段 |
| `If` / `And` / `Or` / `Not` | 条件类型组合 |
| `IsNever` / `IsOptional` / `IsTuple` 等 | 类型判断 |
| `IterableElement` | 提取数组或可迭代项元素类型 |
| `LiteralUnion` | 保留字面量提示又允许扩展字符串 |
| `PartialDeep` / `RequiredDeep` | 深层可选与必填 |
| `SetOptional` / `SetRequired` / `SetReadonly` | 字段修饰符变换 |
| `SetFieldType` / `SetReturnType` / `SetParameterType` | 类型签名变换 |
| `Simplify` / `SimplifyDeep` | 扁平化复杂泛型 |

使用建议:

- 业务项目里优先用这些现成类型工具，而不是自己重新声明一套相近类型
- 如果你的类型变换已经能用 `shared` 表达，后续和框架其他包协同时会更顺
