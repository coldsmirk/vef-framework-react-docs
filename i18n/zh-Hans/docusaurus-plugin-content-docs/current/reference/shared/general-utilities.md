---
sidebar_position: 5
title: 通用工具与颜色能力
---

# 通用工具与颜色能力

## 颜色能力

| 导出 | 推荐场景 |
| --- | --- |
| `isValidColor` | 校验颜色输入 |
| `toHexColor` / `toRgbColor` / `toHslColor` / `toHsvColor` | 颜色格式转换 |
| `getColorDifference` | 色差计算 |
| `convertHslToHex` | HSL 转 HEX |
| `setColorAlpha` | 设置透明度 |
| `mixColor` | 混色 |
| `convertTransparentToOpaque` | 透明色转不透明色 |
| `isWhiteColor` | 判断是否接近白色 |
| `getColorName` | 获取颜色名 |
| `getColorPalette` | 获取色板 |

## 函数与任务工具

| 导出 | 推荐场景 |
| --- | --- |
| `AwaitableFnInvocationOptions` | 调用可异步函数时的配置类型 |
| `isAsyncFunction` | 判断异步函数 |
| `invokeAwaitableFn` | 统一调用同步/异步函数 |
| `identity` | 透传函数 |
| `createThrowNotImplementedFn` / `throwNotImplemented` | 占位实现 |
| `generateId` | 生成前端唯一 id |
| `scheduleMicrotask` | 微任务调度 |

## `lib.ts` 通用统一出口

这些导出主要是常见通用函数的统一入口。推荐在业务项目里优先从 `@vef-framework/shared` 引入，保持项目内部风格一致。

### 谓词与类型判断

`isArray`、`isBigInt`、`isBoolean`、`isDate`、`isEmpty`、`isError`、`isFloat`、`isFunction`、`isInt`、`isIntString`、`isMap`、`isNullish`、`isNumber`、`isObject`、`isPlainObject`、`isPrimitive`、`isPromise`、`isRegExp`、`isSet`、`isString`、`isSymbol`、`isUndefined`、`isWeakMap`、`isWeakSet`

推荐场景:

- 运行时参数保护
- 数据转换前的兜底判断

### 对象与集合

`assign`、`cloneDeep`、`get`、`set`、`omit`、`pick`、`first`、`last`、`max`、`min`、`sum`、`unique`, `cluster`

推荐场景:

- 组装请求参数
- 从复杂对象里读写字段
- 集合聚合

### 字符串与模板

`camelCase`、`capitalize`、`constantCase`、`kebabCase`、`pascalCase`、`snakeCase`、`template`、`trim`、`similarity`、`stringify`

推荐场景:

- 命名转换
- 配置 key 归一化
- 字符串输出

### 节流与缓存

`debounce`、`throttle`、`memoize`、`once`

推荐场景:

- 输入联想
- 搜索
- 性能优化

### 查询字符串与数字转换

`decodeQueryString`、`encodeQueryString`、`toFloat`、`toInt`

推荐场景:

- URL 参数处理
- 数值兜底转换

### 常量函数

`alwaysTrue`、`alwaysFalse`、`always`、`noop`

推荐场景:

- 占位逻辑
- 策略函数
