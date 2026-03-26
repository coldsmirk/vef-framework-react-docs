---
sidebar_position: 3
title: 表单与数据能力
---

# 表单与数据能力

这一页覆盖 `components` 包里最重要的一组“页面生产力 API”。

## `useForm`

`useForm()` 是 VEF 表单体系的入口。它基于 TanStack Form，但已经把 VEF 的 `Form`、`AppField`、`SubmitButton`、`ResetButton` 一起挂好了。

推荐场景:

- 独立页面表单
- 搜索表单
- 配置页编辑表单

常见返回值:

| 返回值 | 说明 |
| --- | --- |
| `Form` | 已经带 Provider 的表单容器 |
| `AppField` | 字段渲染入口 |
| `SubmitButton` | 提交按钮 |
| `ResetButton` | 重置按钮 |
| `handleSubmit` | 手工触发提交 |

示例:

```tsx
const { Form, AppField, SubmitButton } = useForm({
  defaultValues: { keyword: "" },
  onSubmit({ value }) {
    console.log(value);
  }
});
```

## `useFormContext`

当表单拆成独立子组件时，从上下文读取表单 API，而不是重新创建一份实例。

推荐场景:

- `CrudPage` 的 `renderForm`
- 大表单拆模块
- 表单组件复用

## `useFormStore`

当你需要订阅 TanStack Form 底层状态时使用。  
推荐只在复杂场景下使用，普通表单优先用 `AppField`。

## `createFormOptions`

用于声明可复用的表单配置对象。适合多处复用同一组默认值、校验器或提交行为时抽出来。

## `withForm` / `withFieldGroup`

这两个 API 用于扩展表单体系，保留现有上下文和字段能力的同时继续封装。

推荐场景:

- 封装业务字段组合
- 为同一组字段提供复用容器
- 构建更高层表单抽象

## `useDataOptionsSelect`

把普通 query 或数据字典结果转换为可直接传给 `Select` 的 props。

推荐场景:

- 普通下拉
- 多选
- 远程过滤选项

关键配置:

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `queryOptions` | `UseQueryOptions` | 普通 query 来源 |
| `dataDictKey` | `string` | 数据字典 key |
| `filterable` | `boolean` | 是否启用拼音搜索 |
| `labelKey` / `valueKey` | `string \| fn` | 字段映射 |
| `onFetch` | `(data) => void` | 获取后回调 |

## `useDataOptionsTreeSelect`

把普通数据或字典数据转换为 `TreeSelect` 的 `treeData` 和搜索能力。

推荐场景:

- 部门树
- 菜单树选择
- 分类树选择

## `useDataOptionsTree`

把普通列表转换成 `Tree` 组件需要的数据结构，并附带搜索值和过滤树逻辑。

推荐场景:

- 左侧树导航
- 树表联动
- 组织架构浏览

返回值:

| 返回值 | 说明 |
| --- | --- |
| `treeProps` | 可直接传给 `Tree` 的 props |
| `isFetching` | 当前是否在拉取 |
| `searchValue` | 当前搜索词 |
| `setSearchValue` | 更新搜索词 |

## `Table`

VEF 的 `Table` 不是纯透传，它在 Antd Table 基础上额外统一了类型出口，并配套 `usePaginationProps()`。

推荐场景:

- 纯展示型表格
- 局部卡片内表格
- 不需要 queryFn 驱动的简单表格

## `usePaginationProps`

根据 `{ page, size, total }` 直接生成符合后台列表常见交互的分页 props。

关键入参:

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `paginationParams` | `PaginationParams` | 当前页码和页大小 |
| `total` | `number` | 总数 |

## `pageSizeOptions`

VEF 预置的分页尺寸选项:

```ts
[10, 15, 20, 30, 40, 50, 100]
```

## `Chart` / `useChart`

图表能力基于 ECharts 封装。

推荐场景:

- 首页看板
- 监控统计
- 趋势分析

关键导出:

| 导出 | 说明 |
| --- | --- |
| `Chart` | 直接渲染图表 |
| `useChart` | 手工接管实例生命周期 |
| `connectCharts` / `disconnectCharts` | 多图联动 |
| `ChartOption` | 图表配置类型 |

## 主题与反馈基础导出

这些不是组件，但属于页面层高频能力:

| 导出 | 作用 | 推荐场景 |
| --- | --- | --- |
| `useThemeTokens` | 读取主题 token | 自定义样式、图标、渐变 |
| `globalCssVars` | 主题 CSS 变量映射 | 全局样式与主题联动 |
| `semanticColors` | 语义色定义 | 业务状态着色 |
| `semanticScenes` | 场景语义集 | 状态标签、结果卡片 |
| `showSuccessMessage` / `showErrorMessage` 等 | 全局反馈 | 表单提交、删除、刷新 |
| `showConfirm` | 统一确认交互 | 危险操作确认 |
