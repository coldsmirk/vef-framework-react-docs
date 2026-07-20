---
title: "工具导出"
description: "@vef-framework-react/components 的非组件导出——断点、颜色与尺寸的设计令牌常量、主题令牌访问、查询元数据 Symbol，以及小型辅助函数。"
---

# 工具导出

`@vef-framework-react/components` 的非组件导出——断点、颜色与尺寸的设计令牌（design token）常量、主题令牌访问、查询元数据 Symbol，以及一些小型辅助函数。它们是组件本身赖以构建的共享基础，之所以导出，是为了让应用代码与框架保持一致，而不是各自重新定义同样的值。

> **VEF 专属 API。** 本页的所有内容都是普通的常量、函数、类型或 hook——没有任何一项会渲染 UI。只有没有组件归属的导出才放在这里：绑定到某个组件的 hook 和辅助函数（[`Select`](./select.md) 的 `useCodeSetOptionsSelect`、[`Grid`](./grid.md) 的 `useGridCollapsed`、[`Table`](./table.md) 的 `usePaginationProps`……）记录在各自的组件页面，命令式反馈辅助函数（`showSuccessMessage` 等）则见[消息与通知](./notifications.md)。

| 章节 | 导出 |
|---------|---------|
| [断点与响应式值](#断点与响应式值) | `breakpoints`、`resolveBreakpointValue`、`Breakpoint` |
| [颜色](#颜色) | `colors`、`presetColors`、`semanticColors`、`isPresetColor`、`isSemanticColor`、`PresetColor`、`SemanticColor`、`Color` |
| [语义场景](#语义场景) | `semanticScenes`、`semanticSceneLabels`、`semanticSceneIcons`、`SemanticScene` |
| [间距与尺寸](#间距与尺寸) | `sizes`、`fullSizes`、`getSpacingValue`、`Size`、`FullSize`、`Length`、`SizeableLength` |
| [主题令牌与 CSS 变量](#主题令牌与-css-变量) | `globalCssVars`、`useThemeTokens` |
| [查询元数据 Symbol](#查询元数据-symbol) | `SYMBOL_PAGINATION`、`SYMBOL_SORT`、`OrderSpec`、`ParamsWithPagination`、`ParamsWithSort`、`QueryParams`、`PaginatedQueryParams` |
| [杂项辅助函数](#杂项辅助函数) | `emitReloadPage`、`isFragment` |
| [共享类型](#共享类型) | `Orientation`、`Position`、`PropsWithRef`、`GetProp`、`GetProps`、`GetRef`、`ActionConfirmMode` |

## 断点与响应式值

### `breakpoints`

框架的具名视口断点——一个以 `em` 为单位表示宽度的冻结常量：

| 键 | 值 | 像素（按浏览器默认的 16px 字号换算） |
|-----|-------|------------------------------------------------|
| `xxs` | `'0em'` | 0px |
| `xs` | `'36em'` | 576px |
| `sm` | `'48em'` | 768px |
| `md` | `'62em'` | 992px |
| `lg` | `'75em'` | 1200px |
| `xl` | `'88em'` | 1408px |
| `xxl` | `'100em'` | 1600px |

`Breakpoint` 是其键的联合类型：`'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'`。

库中每一个响应式 prop 背后都是这组断点——[`Grid.Item`](./grid.md) 的 `span`/`offset` 映射、[`Crud`](./crud.md) 按断点配置的表单 `width`——它们也是框架样式在媒体查询中使用的值：

```tsx
import { css } from '@emotion/react';
import { breakpoints } from '@vef-framework-react/components';

const toolbarStyle = css({
  display: 'flex',
  justifyContent: 'space-between',
  // Stack vertically below the 768px breakpoint
  [`@media (max-width: ${breakpoints.sm})`]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
});
```

要在 JS 中响应当前断点，把这个常量传给 `@vef-framework-react/hooks` 的 `useBreakpoints`（见 [VEF Hooks](../reference/hooks/vef-hooks.md)）——`Crud` 正是这样解析其响应式表单宽度的。

### `resolveBreakpointValue`

```ts
function resolveBreakpointValue(
  breakpointValues: Partial<Record<Breakpoint, Length>>,
  breakpoint: Breakpoint
): Length | undefined
```

从一个部分定义的按断点映射中解析出一个值——这就是 `Crud` 表单 `width` 这类响应式 prop 背后的查找规则：

1. 如果映射中定义了所请求的断点，返回该值。
2. 否则**向下**查找，返回最近的已定义的更小断点（移动优先的回退）。
3. 如果没有定义任何更小的断点，则**向上**查找，返回最近的更大断点。
4. 仅当映射为空时才返回 `undefined`。

```tsx
import { breakpoints, resolveBreakpointValue } from '@vef-framework-react/components';
import { useBreakpoints } from '@vef-framework-react/hooks';

// Sparse map — the gaps are filled by the fallback rule
const drawerWidths = { xs: '90vw', md: '60vw', xl: 720 };

function useDrawerWidth() {
  const { current } = useBreakpoints(breakpoints, { initialBreakpoint: 'xxs' });

  // 'sm' resolves to '90vw' (nearest smaller), 'xxl' resolves to 720
  return resolveBreakpointValue(drawerWidths, current ?? 'xxs');
}
```

## 颜色

主题配置与颜色类 prop 所接受的颜色名称常量，以及配套的类型守卫。三个数组都是只读的 `as const` 元组。

| 导出 | 类型 | 说明 |
|--------|------|-------------|
| `presetColors` | `readonly PresetColor[]` | 13 个 Ant Design 调色板名称：`'blue'`、`'purple'`、`'cyan'`、`'green'`、`'magenta'`、`'pink'`、`'red'`、`'orange'`、`'yellow'`、`'volcano'`、`'geekblue'`、`'lime'`、`'gold'`（从 antd 重新导出） |
| `semanticColors` | `readonly SemanticColor[]` | 5 个语义角色：`'primary'`、`'success'`、`'info'`、`'warning'`、`'error'`——即 `'primary'` 加上[语义场景](#语义场景) |
| `colors` | `readonly Color[]` | 全部 18 个名称——`presetColors` 在前，`semanticColors` 在后 |
| `isPresetColor` | `(color: string) => color is PresetColor` | 字符串是 13 个预设色名称之一时为 `true` |
| `isSemanticColor` | `(color: string) => color is SemanticColor` | 字符串是 5 个语义角色之一时为 `true` |

对应的类型是 `PresetColor`、`SemanticColor` 和 `Color`（= `PresetColor | SemanticColor`）。

预设色名称由 [`ConfigProvider`](./config-provider.md) 解析为具体值——其 `theme.colors` 映射允许为每个语义角色指定一个预设色名称或任意 CSS 颜色，并且每个名称也都有对应的 CSS 变量（`--vef-blue`、`--vef-color-primary` 等；见[主题](../guide/theming.md)）。用这几个数组来枚举可选项，用类型守卫来校验自由输入：

```tsx
import { isPresetColor, presetColors } from '@vef-framework-react/components';

// Offer the full preset palette in a theme-settings select
const colorOptions = presetColors.map(color => ({ label: color, value: color }));

// Restrict a tenant-configured brand color to the preset palette,
// falling back to the framework default for anything unrecognized
function resolvePrimary(configured: string): string {
  return isPresetColor(configured) ? configured : 'blue';
}
```

## 语义场景

整个框架通用的四种反馈严重级别——[消息与通知](./notifications.md)、`Alert`、`Result` 以及各类状态驱动的 UI 都在使用它们。

| 导出 | 类型 | 说明 |
|--------|------|-------------|
| `semanticScenes` | `readonly SemanticScene[]` | `'success'`、`'info'`、`'warning'`、`'error'` |
| `semanticSceneLabels` | `Record<SemanticScene, string>` | 默认展示标题：`'成功'` / `'提示'` / `'警告'` / `'错误'` |
| `semanticSceneIcons` | `Record<SemanticScene, ReactElement>` | 来自 `@ant-design/icons` 的默认图标：`<CheckCircleOutlined />` / `<InfoCircleOutlined />` / `<ExclamationCircleOutlined />` / `<CloseCircleOutlined />` |

`SemanticScene` 是联合类型 `'success' | 'info' | 'warning' | 'error'`。注意 `semanticColors` = `'primary'` + `semanticScenes`：语义场景一定是合法的颜色名称，但 `'primary'` 不是场景。

`semanticSceneLabels` 为每个通知与警告/确认对话框辅助函数提供默认 `title`（见 [NotificationOptions 的默认值](./notifications.md#notificationoptions)）。`semanticSceneIcons` 并不被框架内部消费——导出它是为了让自定义的场景驱动 UI 能与内置外观保持一致：

```tsx
import {
  semanticSceneIcons,
  semanticSceneLabels,
  type SemanticScene,
} from '@vef-framework-react/components';

// A status chip that stays visually consistent with framework feedback
function SceneChip({ scene }: { scene: SemanticScene }) {
  return (
    <span style={{ color: `var(--vef-color-${scene})` }}>
      {semanticSceneIcons[scene]} {semanticSceneLabels[scene]}
    </span>
  );
}
```

## 间距与尺寸

### `sizes` 与 `fullSizes`

组件 `size` 类 prop 使用的具名尺寸档位，同样是只读的 `as const` 元组：

| 导出 | 取值 | 联合类型 |
|--------|--------|------------|
| `sizes` | `'small'`、`'medium'`、`'large'` | `Size` |
| `fullSizes` | `'extra-small'`、`'small'`、`'medium'`、`'large'`、`'extra-large'` | `FullSize` |

`Size` 是控件密度类 prop 的三档尺寸（`ProTable`/`Table` 的 `size`、`IconPicker`、`GenericSelect`、`CodeEditor` 等）。`FullSize` 在两端各扩展一档，用于间距类 prop——[`Grid`](./grid.md) 的 `gap` 会把这五个名称映射到主题的 margin 令牌上（`marginXS` → `marginLG`），因此具名间距会跟随当前主题。构建设置类 UI 时可以直接遍历这两个数组（例如提供所有 `Size` 档位的密度切换器）。

### `getSpacingValue`

```ts
function getSpacingValue(value: Length): string
```

把 `Length`（`string | number`）规范化为 CSS 长度字符串：数字转为 `px`（`16` → `'16px'`），字符串原样通过（`'2rem'` → `'2rem'`）。`Page`、`ScrollArea`、`CodeEditor` 等组件正是这样解释它们的 `Length` prop 的，所以当你把这类值转发进自己的样式时也应使用它：

```tsx
import { getSpacingValue, type Length } from '@vef-framework-react/components';
import type { ReactNode } from 'react';

interface PanelProps {
  // Same contract as framework length props: 8 → '8px', '1rem' → '1rem'
  gap?: Length;
  children?: ReactNode;
}

function Panel({ gap = 8, children }: PanelProps) {
  return <div style={{ display: 'flex', gap: getSpacingValue(gap) }}>{children}</div>;
}
```

`SizeableLength<TSize>` 融合了两个世界：类型为 `SizeableLength<Size>` 的 prop 既接受 `TSize` 中的具名尺寸，*也*接受任意自由形式的 `Length`（同时具名尺寸仍会出现在自动补全建议里）。

## 主题令牌与 CSS 变量

通往同一套设计语言的两条访问路径——何时该用哪一条，完整的决策指南见[主题](../guide/theming.md)。

### `globalCssVars`

一个冻结常量，为每个全局 VEF CSS 自定义属性提供一个驼峰命名的键——共 671 个条目——其值是 `var(--vef-…)` 引用字符串，而**不是**已解析的值：

```ts
globalCssVars.colorPrimary   // 'var(--vef-color-primary)'
globalCssVars.spacingMd      // 'var(--vef-spacing-md)'
globalCssVars.borderRadiusLg // 'var(--vef-border-radius-lg)'
```

它覆盖了所有变量族：语义色及其状态色阶（`colorPrimary*`、`colorSuccess*` 等）、预设调色板（`blue1`–`blue10` 等）、扩展的 Tailwind 风格色阶（`colorBlue50`–`colorBlue950` 等）、中性表面（`colorText*`、`colorBg*`、`colorFill*`、`colorBorder*`）、排版、间距/内边距/外边距、圆角、阴影、动效、尺寸、z-index、断点以及动画简写。带默认值的完整生成目录见 [CSS 变量参考](../reference/css-variables-reference.mdx)。

在 Emotion 或其它 JS 对象样式中使用它，可以避免重复书写原生 `var()` 字符串——这些值仍然是活的 CSS 变量，因此样式无需重新渲染即可适应主题与暗色模式的变化：

```tsx
import { css } from '@emotion/react';
import { globalCssVars } from '@vef-framework-react/components';

const cardStyle = css({
  padding: globalCssVars.spacingMd,
  borderRadius: globalCssVars.borderRadiusLg,
  border: `1px solid ${globalCssVars.colorBorderSecondary}`,
  backgroundColor: globalCssVars.colorBgContainer,
  boxShadow: globalCssVars.shadowSm,
});
```

这些变量由 [`ConfigProvider`](./config-provider.md) 输出到 `:root` 上（通过 starter 引导的应用已自动就位）。`ConfigProvider` 的 `theme.globalCssVars` 选项——一个用于*注入额外* `--vef-*` 变量的映射——和这个常量是两回事：这个常量*读取*的是内置变量。

### `useThemeTokens`

```ts
function useThemeTokens(): GlobalToken
```

返回当前生效主题下 Ant Design 已解析的 token 对象（来自 `antd` 的 `GlobalToken`）——`colorPrimary: '#2b7fff'`、`margin: 16` 这样的具体值，会在主题或暗色模式变化时重新计算。必须在 [`ConfigProvider`](./config-provider.md) 之下调用。

当运行时消费方需要真实值而非 `var()` 字符串时使用它——图表配色、canvas 绘制、第三方库配置：

```tsx
import { useThemeTokens } from '@vef-framework-react/components';

function MetricsChart() {
  // Resolved hex values, safe to hand to ECharts
  const { colorPrimary, colorTextSecondary } = useThemeTokens();

  return <Chart option={{ color: [colorPrimary, colorTextSecondary] }} />;
}
```

它的姊妹 hook `useIsDarkMode()` 记录在 [`ConfigProvider`](./config-provider.md) 页面。

## 查询元数据 Symbol

### `SYMBOL_PAGINATION` 与 `SYMBOL_SORT`

```ts
const SYMBOL_PAGINATION: unique symbol; // Symbol.for('__vef_pagination')
const SYMBOL_SORT: unique symbol;       // Symbol.for('__vef_sort')
```

[`ProTable`](./pro-table.md) 与 [`Crud`](./crud.md) 用这两个公认的 Symbol，把分页与排序元数据挂到传给你的 `queryFn` 的参数对象上（并展开进 TanStack Query 的查询键）。Symbol 键不可能与真实的搜索字段冲突，而且 `JSON.stringify` 会丢弃它们——因此从同一个对象序列化出的请求体永远不会混入这些元数据。两者都通过 `Symbol.for` 注册，即使模块实例被重复加载，身份也保持一致。

所挂载值的形态：

| Symbol | 值类型 | 形态 |
|--------|------------|-------|
| `SYMBOL_PAGINATION` | `PaginationParams`（来自 `@vef-framework-react/core`） | `{ page?: number; size?: number }`——页码从 1 开始，默认 `page: 1` / `size: 15` |
| `SYMBOL_SORT` | `OrderSpec[]` | 每个 `OrderSpec` 是 `{ column: string; direction: 'asc' \| 'desc' }` |

导出的参数类型描述了这份契约的两个方向：

| 类型 | 定义 | 说明 |
|------|------------|-------------|
| `ParamsWithPagination<TParams>` | `TParams & { [SYMBOL_PAGINATION]?: PaginationParams }` | 携带分页元数据的参数 |
| `ParamsWithSort<TParams>` | `TParams & { [SYMBOL_SORT]?: OrderSpec[] }` | 携带排序元数据的参数 |
| `QueryParams<TSearch, TParams = never>` | `ParamsWithSort<TSearch & If<IsNever<TParams>, EmptyObject, TParams>>` | 非分页 `Crud` 的 `queryFn` 收到的参数——默认的 `never` 经过特判保护，省略 `TParams` 时保持纯粹的 `TSearch` |
| `PaginatedQueryParams<TSearch, TParams = never>` | `ParamsWithPagination<ParamsWithSort<TSearch & If<IsNever<TParams>, EmptyObject, TParams>>>` | 分页的 `Crud`/`ProTable` 的 `queryFn` 收到的参数——与 `QueryParams` 相同的 `never` 特判 |

典型的 `queryFn` 会先把这两个 Symbol 拆出去，再构建请求：

```ts
import {
  SYMBOL_PAGINATION,
  SYMBOL_SORT,
  type PaginatedQueryParams,
} from '@vef-framework-react/components';

interface UserSearch {
  name?: string;
  status?: string;
}

async function findUserPage(params: PaginatedQueryParams<UserSearch>) {
  // Destructure the symbol-keyed metadata away from the plain search fields
  const { [SYMBOL_PAGINATION]: pagination, [SYMBOL_SORT]: sort, ...search } = params;

  return post('/api/users/page', {
    ...search,
    page: pagination?.page ?? 1,
    pageSize: pagination?.size ?? 15,
    orderBy: sort?.map(({ column, direction }) => `${column} ${direction}`),
  });
}
```

构建在框架 RPC 约定之上的 API 层（审批 / cron / 集成引擎、starter 的 `extractQueryParams`）都内置了遵循这一模式的现成拆分函数。

## 杂项辅助函数

### `emitReloadPage`

```ts
function emitReloadPage(key: string): void
```

在内部事件总线上广播一次页面重载事件。每个已挂载的 [`Page`](./page.md) 都会监听并递增自己内部的渲染 key，从而重新挂载整棵子树——组件本地状态被重置、入场动画重新播放、挂载时机的查询重新请求。starter 布局的页签栏刷新按钮调用的就是它，并把路由的完整路径作为 `key` 传入。

注意：当前实现会重新挂载每一个已挂载的 `Page`，与 `key` 无关——但仍应传入有意义的 key（按约定是路由路径），它既表明了意图，也让调用方对未来的实现保持前向兼容。没有导出对应的订阅函数；监听一侧是 `Page` 的内部实现。

```tsx
import { emitReloadPage } from '@vef-framework-react/components';

// After switching tenant, remount the page content with fresh state
async function handleTenantSwitch(tenantId: string, routeFullPath: string) {
  await switchTenant(tenantId);
  emitReloadPage(routeFullPath);
}
```

### `isFragment`

```ts
function isFragment(node: ReactNode): node is ReactElement<FragmentProps>
```

类型守卫：当节点是 React `<Fragment>` 元素（包括 `<>…</>` 简写）时返回 `true`——即 `isValidElement(node) && node.type === Fragment`。类型收窄之后，`node.props.children` 就有了类型并可以访问，这也是需要它的常见理由：先展开 Fragment 的子节点，再对每个子节点做装饰。

```tsx
import { isFragment, Keyboard } from '@vef-framework-react/components';
import { Children, type ReactNode } from 'react';

// Accepts <>⌘K</> as well as a single key node
function ShortcutHint({ keys }: { keys: ReactNode }) {
  const nodes = isFragment(keys) ? Children.toArray(keys.props.children) : [keys];

  return nodes.map((node, index) => <Keyboard key={index}>{node}</Keyboard>);
}
```

## 共享类型

组件 props 中随处可见的小型基础类型，导出供应用代码使用：

| 导出 | 类型 | 说明 |
|--------|------|-------------|
| `Length` | `string \| number` | CSS 长度——数字表示像素（见 [`getSpacingValue`](#getspacingvalue)） |
| `SizeableLength<TSize>` | `LiteralUnion<TSize, Length>` | `TSize` 中的具名尺寸，或任意自由形式的 `Length` |
| `Orientation` | `'horizontal' \| 'vertical'` | 布局方向——例如 starter 的菜单布局模式是 `Orientation \| 'mixed'` |
| `Position` | `{ x: number; y: number }` | 二维坐标——例如 [`ScrollArea`](./scroll-area.md) 的滚动偏移回调 |
| `PropsWithRef<TRef, TProps>` | `TProps & { ref?: Ref<TRef> }` | 添加类型化的 `ref` prop（React 19 风格，无需 `forwardRef`） |
| `GetProp`、`GetProps`、`GetRef` | antd re-exports | 提取组件的单个 prop 类型、完整 props 类型或 ref 实例类型 |
| `ActionConfirmMode` | `'popover' \| 'dialog'` | [`ActionButton`](./action-button.md) 的 `confirmMode` prop 背后的确认 UI 形式 |

归属于特定能力的类型与该能力一起记录：`Breakpoint`、`Color`/`PresetColor`/`SemanticColor`、`SemanticScene`、`Size`/`FullSize` 和 `OrderSpec` 见上文各节；`ActionButtonConfig` 见 [`ActionGroup`](./action-group.md)；`NotificationOptions`/`AlertOptions`/`ConfirmOptions` 见[消息与通知](./notifications.md)；表单相关类型见 [`Form`](./form.md)。
