---
title: 性能
description: VEF 已经替你做了哪些性能决策，以及页面代码仍然掌握的调优手段——表格虚拟滚动、查询缓存、store 选择器、图标加载与代码分割。
---

# 性能

在页面代码运行之前，VEF 已经做了不少性能决策：查询默认 5 秒 `staleTime`，构建产物按路由和依赖库拆分 chunk，动画会为偏好减弱动效的用户自动关闭。本页介绍留给页面代码的那些调优手段——每一项的作用以及适用时机。

## 虚拟滚动渲染大表格

`Table` 和 `ProTable` 都接受 `virtual` 属性，开启 antd 的虚拟滚动，只挂载可见窗口内的行：

```tsx
<ProTable<User, UserSearchParams>
  virtual
  columns={columns}
  queryFn={findUsers}
  isPaginated={false}
  rowKey="id"
/>
```

虚拟模式下有两个细节需要注意：

- 给每一列显式设置 `width` 或 `minWidth`。表格通过累加列宽计算水平滚动尺寸，未设置的列会回退到 `200`。
- `virtual` 依赖默认的 `flexHeight` 行为：表格通过测量自身容器来确定滚动视口尺寸，因此要把它放在高度受约束的布局里（`Page` 的内容区就满足条件）。

当一次性加载数百到数千行数据时（通常是非分页结果集），虚拟滚动才有收益。每页只显示 20 行的分页表格不需要它。表格形态的选择参见[表格](../guide/tables.md)。

当搜索输入每敲一个字符都要过滤一个庞大的已渲染列表时，React 的 `useDeferredValue` 可以让昂贵的重渲染滞后于输入值，保持输入的流畅。

## 调优查询缓存

`createApiClient()` 接受作用于整个应用的缓存默认值：

```ts
import { createApiClient } from "@vef-framework-react/starter";

export const apiClient = createApiClient({
  http: { baseUrl: "/api" },
  query: {
    staleTime: 30_000, // 默认: 5000
    gcTime: 600_000 // 默认: 300000
  }
});
```

- `staleTime` — 缓存结果在多长时间内直接使用而不重新请求。查询默认还会在窗口重新聚焦和网络重连时重新请求，所以稳定的基础数据配上过短的 `staleTime`，就会变成一次次重复的相同请求。
- `gcTime` — 不活跃的缓存条目在被垃圾回收前保留多久。

这两个选项也可以按查询单独设置，而且通常是更好的做法：全局默认值保持保守，对确定稳定的数据（码集、部门树、枚举类列表）再单独放宽：

```ts
const { data } = useQuery({
  queryFn: findDepartmentTree,
  queryKey: [findDepartmentTree.key],
  staleTime: 300_000
});
```

完整的选项表参见 [Query](../reference/core/query.md)。

## 翻页时保留上一页数据

对于自建的分页视图（卡片列表、自定义结果面板），切换页码会改变 query key，于是 `data` 在下一页加载期间变成 `undefined`，布局随之塌陷。`@vef-framework-react/core` 重导出的 `keepPreviousData` 可以避免这一点：

```ts
import { keepPreviousData, useQuery } from "@vef-framework-react/core";

const { data, isPlaceholderData } = useQuery({
  queryFn: findUserPage,
  queryKey: [findUserPage.key, params],
  placeholderData: keepPreviousData
});
```

下一页加载期间上一页继续渲染；`isPlaceholderData` 用来判断当前可见的行是否还是旧页数据。`ProTable` 不需要这个——它在翻页期间自带 loading 遮罩。

## 提前预热缓存

`apiClient.prefetchQuery()` 在后台填充缓存；`apiClient.fetchQuery()` 同样填充缓存并返回数据。在登录后或进入路由时，为后续页面确定需要的数据调用它们：

```ts
void apiClient.prefetchQuery({
  queryFn: findDepartmentTree,
  queryKey: [findDepartmentTree.key]
});
```

结果会写入 `useQuery()` 读取的同一份缓存，所以第一个用到它的组件渲染时不会出现 loading 状态。

## 不写额外状态的 loading 标志

`@vef-framework-react/hooks` 中的 `useHasFetching(key)` 和 `useHasMutating(key)` 直接订阅查询缓存，不必再用 `useState` 重复维护 loading 状态：

```tsx
import { useHasMutating } from "@vef-framework-react/hooks";

const isSaving = useHasMutating(createUser.key);

<Button loading={isSaving}>保存</Button>;
```

它们按 key 前缀匹配，一个标志就能覆盖一整族查询。签名参见 [VEF Hooks](../reference/hooks/vef-hooks.md)。

## 从 store 中窄化选取

`createStore()` 和 `createComponentStore()` 返回的 store hook 都接受选择器，组件只在选中的切片变化时才重渲染：

```ts
// 任何状态变化都会重渲染
const state = useUserPageStore();

// 只在 `selectedId` 变化时重渲染
const selectedId = useUserPageStore(state => state.selectedId);
```

选择器每次调用都返回新对象会让这个机制失效——选取多个字段时用 `useShallow` 包一层，选择器派生嵌套数据时用 `useDeep`：

```ts
import { useShallow } from "@vef-framework-react/core";

const { keyword, scene } = useUserPageStore(
  useShallow(state => ({ keyword: state.keyword, scene: state.scene }))
);
```

这也是框架内部使用的模式。同时让状态保持在能工作的最窄作用域——优先页面局部 store 而不是全局 store，参见[状态管理](../guide/state-management.md)。

## 深比较与浅比较 hooks

`@vef-framework-react/hooks` 提供 `useDeepMemo` / `useShallowMemo` / `useDeepEffect` / `useShallowEffect` / `useDeepCallback` / `useShallowCallback`：与 React 同名 hook 用法一致，但按依赖的*值*而不是引用做比较。当依赖对象确实每次渲染都被重建时——路由搜索参数、表单值、内联组装的筛选对象——就用它们：

```ts
import { useDeepEffect } from "@vef-framework-react/hooks";

useDeepEffect(() => {
  reportFilterChange(filters);
}, [filters]); // 只在 `filters` 的内容变化时触发
```

比较本身也有开销，所以在你能控制来源时，优先在源头稳定引用；这些 hooks 是留给你控制不了的场景的。

## 图标：`DynamicIcon` 按需加载

[`DynamicIcon`](../components/dynamic-icon.md) 在运行时根据名称字符串解析 Lucide 图标。每个图标是一个独立的懒加载 chunk，解析结果在应用生命周期内全局缓存，同名并发请求共享同一次 import，并且同时进行的 import 不超过 6 个——因此数据驱动的菜单或图标选择器网格即使面对数千个名称也不会失控。

反过来，构建期就能确定的图标应当静态 import，而不是把一个常量字符串塞给 `DynamicIcon`。静态导入会打进共享的图标 chunk，同步渲染，没有加载占位。

## 代码分割来自构建配置

基于 `@vef-framework-react/dev` 的 `defineViteConfig()` 构建的应用项目已经获得：

- **路由级分割** — TanStack Router 插件启用了自动代码分割，每个路由的组件代码成为独立 chunk，首次导航时才加载。
- **依赖库分 chunk** — React、TanStack 系列、框架自身、Lucide 图标、拼音数据和 ECharts 各自归入稳定的 chunk，与应用代码独立缓存。

维持这一收益的习惯是：让页面专属的重依赖只被使用它的页面 import。图表配置或编辑器模块一旦被共享 barrel 导入，就会被拉进共享 chunk，让每个路由都付出代价——这也是[应用项目规约](./project-conventions.md)要求页面局部代码留在页面目录内的原因之一。

## 入场动画与减弱动效

`Page` 在挂载时会播放一段短入场动画。动画本身开销很小，但在它播放期间启动的工作会与动画帧竞争。重量级且非关键的初始化，应等入场结束后再执行：

```tsx
import { usePageEntranceEffect } from "@vef-framework-react/components";

usePageEntranceEffect(() => {
  chart.startEntranceSequence();
});
```

该 effect 在所属 `Page` 入场完成后执行一次（不在 `Page` 内时立即执行）；当需要用布尔值驱动渲染时，`usePageEntranceSettled()` 提供同一信号。

减弱动效由框架层处理：`ConfigProvider` 读取操作系统级的 `prefers-reduced-motion` 设置，开启时自动禁用 antd 动画。自定义动画代码应当通过 `@vef-framework-react/hooks` 的 [`useReducedMotion`](../reference/hooks/upstream-hooks.md) 尊重同一信号。

## 拼音选项搜索

对于中文选项数据，内置链路——[Select](../components/select.md) 的 `filterable` 与 `useDataOptions*` 系列 hooks——已经实现了拼音增强匹配，底层由共享包的 `withPinyin()` 工具和独立的拼音数据 chunk 支撑。优先使用它，而不是在页面代码里重建模糊拼音转换：手写版本会在每次按键时重复转换，还会与应用已加载的选项数据重复。
