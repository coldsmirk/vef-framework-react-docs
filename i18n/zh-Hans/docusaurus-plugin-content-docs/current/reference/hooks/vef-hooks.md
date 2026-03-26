---
sidebar_position: 2
title: VEF Hooks
---

# VEF Hooks

## `useAuthorizedItems`

根据权限过滤配置项数组。

推荐场景:

- 菜单数组过滤
- 工具栏按钮过滤
- 操作项按权限裁剪

关键参数:

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `items` | `T[]` | 带 `permTokens` / `checkMode` 的配置数组 |

返回值:

| 返回值 | 说明 |
| --- | --- |
| `T[]` | 已经过滤后的可用项 |

## `useBreakpoints`

根据自定义断点配置返回当前断点状态。

推荐场景:

- 自适应布局切换
- 侧边栏折叠阈值
- 某些控件按屏宽切换表现

## `useCheckPermission`

返回一个可在逻辑层复用的权限判断函数。

推荐场景:

- 非 JSX 分支判断
- 数据请求前先判断是否允许操作
- 某个 helper 里需要权限判断

## `useDataDictQuery`

基于 `appContext.dataDictQueryFn` 拉取数据字典。

推荐场景:

- 性别、状态、类型等系统字典
- 搜索表单的枚举条件
- 下拉和单选组选项

关键参数:

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `dataDictKey` | `string` | 字典 key |
| `onFetch` | `(data) => void` | 拉取完成回调 |
| 其余 query 参数 | `UseQueryOptions` 子集 | query 行为控制 |

## `useDataOptionsQuery`

把普通 query 数据或字典数据统一转换成 `DataOption` / `DataOptionWithPinyin`。

推荐场景:

- 非标准 `label/value` 数据结构转换
- 需要拼音搜索的下拉
- 树形选项映射

关键参数:

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `queryOptions` | `UseQueryOptions` | 普通 query 来源 |
| `dataDictKey` | `string` | 字典来源 |
| `labelKey` / `valueKey` | `string \| fn` | 字段映射 |
| `disabledKey` / `descriptionKey` / `childrenKey` | `string \| fn` | 额外字段映射 |
| `withPinyin` | `boolean` | 是否补拼音字段 |

## 对比依赖 hooks

这一组 hooks 适合“依赖是对象或数组，但你不想浅比较失效”的场景。

| Hook | 推荐场景 |
| --- | --- |
| `useDeepCallback` | 回调依赖深比较 |
| `useDeepCompare` | 仅获取深比较信号 |
| `useDeepEffect` | effect 依赖深比较 |
| `useDeepIsomorphicEffect` | 同构环境深比较 effect |
| `useDeepLayoutEffect` | layout effect 深比较 |
| `useDeepMemo` | memo 依赖深比较 |
| `useShallowCallback` | 浅比较版本回调 |
| `useShallowCompare` | 浅比较信号 |
| `useShallowEffect` | 浅比较 effect |
| `useShallowIsomorphicEffect` | 同构浅比较 effect |
| `useShallowLayoutEffect` | layout effect 浅比较 |
| `useShallowMemo` | memo 浅比较 |

## 事件与环境 hooks

| Hook | 推荐场景 |
| --- | --- |
| `useDocumentEvent` | 监听 document 级事件 |
| `useEmitterEvent` | 监听 `EventEmitter` 事件 |
| `useLatest` | 在回调里拿最新值 |
| `useRafState` | 高频更新状态但不想每次同步渲染 |
| `useSingleton` | 组件生命周期内只初始化一次对象 |
| `useViewportSize` | 读取视口宽高 |

## Query / Mutation 状态 hooks

| Hook | 推荐场景 |
| --- | --- |
| `useHasFetching` | 页面按钮、头部区域显示 query loading |
| `useHasMutating` | 提交按钮禁用、防重复操作 |

## 权限判断 hook

| Hook | 推荐场景 |
| --- | --- |
| `useIsAuthorized` | 直接得到当前权限是否满足 |

说明:

- 和 `PermissionGate` 相比，它更适合逻辑分支判断
- 和 `useCheckPermission` 相比，它更适合单点布尔值计算
