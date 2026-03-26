---
sidebar_position: 3
title: 校验、时间、事件与安全
---

# 校验、时间、事件与安全

## 时间与日期

| 导出 | 推荐场景 |
| --- | --- |
| `Dayjs` | 统一日期对象类型 |
| `TemporalMode` | 时间格式模式 |
| `DEFAULT_DATE_FORMAT` / `DEFAULT_TIME_FORMAT` / `DEFAULT_DATETIME_FORMAT` | 默认格式常量 |
| `LOCALIZED_DATE_FORMAT` / `LOCALIZED_DATETIME_FORMAT` | 本地化显示格式 |
| `formatDuration` | 时长显示 |
| `parseDate` / `tryParseDate` | 解析日期 |
| `formatDate` | 日期格式化 |
| `getNow` | 当前时间对象 |
| `getNowDateString` / `getNowTimeString` / `getNowDateTimeString` | 当前时间字符串 |
| `getLocalizedDateTime` | 适合 UI 直接展示的本地化时间 |
| `getTemporalFormats` | 获取当前时间格式映射 |

## 格式化

| 导出 | 推荐场景 |
| --- | --- |
| `formatBytes` | 文件大小、内存占用、网络流量 |
| `formatNumber` | 统计数字格式化 |

## 相等判断

| 导出 | 推荐场景 |
| --- | --- |
| `isShallowEqual` | 浅比较依赖 |
| `isDeepEqual` | 深比较对象或数组 |

## 错误与堆栈

| 导出 | 推荐场景 |
| --- | --- |
| `StackFrame` | 堆栈帧类型 |
| `parseErrorStack` | 解析错误堆栈 |
| `filterUserFrame` | 过滤用户代码堆栈 |
| `getSanitizedErrorStack` | 适合展示给用户的安全堆栈 |
| `getCurrentStack` / `getCurrentStackSync` | 获取当前堆栈 |

## 事件总线

| 导出 | 推荐场景 |
| --- | --- |
| `EventEmitter` | 页面或模块局部事件总线 |
| `createEventEmitter` | 快速创建事件发射器 |
| `EventHandler` / `EventType` | 事件类型定义 |

## 安全与加解密

| 导出 | 推荐场景 |
| --- | --- |
| `obfuscateEncode` / `obfuscateDecode` | 轻量混淆 |
| `obfuscateEncodeToHex` / `obfuscateDecodeFromHex` | 十六进制混淆 |
| `obfuscateEncodeToBase64` / `obfuscateDecodeFromBase64` | Base64 混淆 |
| `encryptUsingRSA` / `decryptUsingRSA` | 登录或敏感字段的 RSA 加解密 |

## Zod 统一出口

| 导出 | 推荐场景 |
| --- | --- |
| `z` | 表单与参数校验入口 |
| `ZodError` / `ZodIssue` | 错误处理 |
| `ZodSchema` / `ZodType` | 类型声明与约束 |
