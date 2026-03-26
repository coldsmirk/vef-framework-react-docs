---
sidebar_position: 2
title: VEF 自研组件
---

# VEF 自研组件

这一页只覆盖 **不是简单 Antd 透传** 的组件与增强封装。

## ActionButton

在普通按钮基础上增加“异步点击 + 二次确认”能力。

推荐场景:

- 删除、禁用、批量操作
- 需要等待异步提交完成的按钮
- 希望统一 confirm 体验的业务按钮

关键 Props:

| Prop | 类型 | 说明 |
| --- | --- | --- |
| `confirmable` | `boolean` | 是否在执行前先确认 |
| `confirmMode` | `"popover" \| "dialog"` | 使用 Popconfirm 还是对话框确认 |
| `confirmTitle` | `ReactNode` | 确认标题 |
| `confirmDescription` | `ReactNode` | 确认说明 |
| `onClick` | `(...args) => Awaitable<void>` | 支持异步的点击回调 |

说明:

- 其余样式和按钮能力沿用 `ButtonProps`
- 当 `confirmable` 为 `true` 时，适合替代手工拼装 `Popconfirm + Button`

## ActionGroup

用配置数组渲染一组操作按钮，适合工具栏或卡片头部动作区。

推荐场景:

- 页面工具栏
- 表格上方批量操作
- 根据上下文生成一组按钮

关键 Props:

| Prop | 类型 | 说明 |
| --- | --- | --- |
| `buttons` | `Array<ActionButtonConfig<T>>` | 按钮配置数组 |
| `size` | `ButtonProps["size"]` | 统一按钮尺寸 |
| `renderWrapper` | `(buttonsNode) => ReactNode` | 自定义包裹结构 |

## Bool

把 `boolean` 值统一抽象成单个表单控件，支持 `switch`、`checkbox`、`radio`、`radio-button` 四种表现。

推荐场景:

- “启用 / 禁用”
- “是 / 否”
- 布尔字段在表单中要统一展示方式

关键 Props:

| Prop | 类型 | 说明 |
| --- | --- | --- |
| `value` / `defaultValue` | `boolean` | 受控或非受控值 |
| `variant` | `BoolVariant` | 展示方式 |
| `trueLabel` | `ReactNode` | 真值文案 |
| `falseLabel` | `ReactNode` | 假值文案 |
| `onChange` | `(value: boolean) => void` | 值变化回调 |

## Center

提供稳定的居中容器，适合空态、加载态或单块内容垂直水平居中。

推荐场景:

- `Loader` / `Empty`
- 登录页小模块
- 占位内容

## Compact

对紧凑布局进行统一导出，适合把若干输入框或按钮拼成一个紧凑组。

推荐场景:

- 搜索条
- 日期区间 + 按钮组合
- 两个或多个短输入控件并排

## ConfigProvider

VEF 的全局主题容器。它不是简单转出 Antd 的 `ConfigProvider`，而是把 Emotion、全局 CSS 变量、消息通知、错误边界和暗黑模式上下文一起接上。

推荐场景:

- 应用根节点主题容器
- 文档或独立渲染时想手工挂主题环境

关键 Props:

| Prop | 类型 | 说明 |
| --- | --- | --- |
| `theme` | `ThemeConfig` | 主题配置对象 |

`ThemeConfig` 关键字段:

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `isDarkMode` | `boolean` | 是否强制暗色 |
| `colors` | `Partial<Record<SemanticColor, string>>` | 覆盖语义色 |
| `globalCssVars` | `Record<--vef-*, string \| number>` | 注入全局变量 |
| `globalStyle` | `CSSInterpolation` | 自定义全局样式 |

## DynamicIcon

根据字符串图标名动态加载 Lucide 图标，并自带缓存与未知图标兜底。

推荐场景:

- 后端下发菜单图标名
- CMS / 配置系统决定图标
- 动态导航

关键 Props:

| Prop | 类型 | 说明 |
| --- | --- | --- |
| `name` | `DynamicIconName` | 图标名 |

## Grid

面向后台表单和配置页的响应式栅格容器，支持折叠模式和 `Grid.Item` 跨列。

推荐场景:

- 表单布局
- 统计卡片宫格
- 可折叠搜索区

`GridProps` 关键字段:

| Prop | 类型 | 说明 |
| --- | --- | --- |
| `baseWidth` | `number` | 基准列宽 |
| `gap` | `FullSize \| number` | 行列统一间距 |
| `columnGap` | `FullSize \| number` | 列间距 |
| `rowGap` | `FullSize \| number` | 行间距 |
| `isCollapsed` | `boolean` | 是否折叠 |
| `collapsedRows` | `number` | 折叠时可见行数 |
| `onCollapseChange` | `(isCollapsed) => void` | 折叠变化回调 |

`GridItemProps` 关键字段:

| Prop | 类型 | 说明 |
| --- | --- | --- |
| `span` | `ResponsiveValue<number>` | 跨列数 |
| `offset` | `ResponsiveValue<number>` | 左侧偏移 |
| `suffix` | `boolean` | 是否作为尾部对齐项 |

## Group / Stack / Space / Flex

这四个都是页面布局高频能力，但 VEF 做了更适合后台页面的类型收敛或增强。

推荐场景:

- `Group`: 一行内的按钮、标签、统计项
- `Stack`: 纵向堆叠模块
- `Space`: 快速间距控制
- `Flex`: 更自由的弹性布局

说明:

- `Stack` 的 `gap` 更贴近尺寸语义
- `Space` 允许 `[horizontal, vertical]` 二维尺寸
- `Flex` 类型做了和 VEF 尺寸系统更一致的对齐

## Icon / IconButton

`Icon` 负责把 Lucide 图标安全接入 VEF 组件体系。`IconButton` 则是在按钮外层补上了 tooltip 和图标按钮语义。

推荐场景:

- 所有操作按钮图标
- 表格列内的纯图标动作
- 顶部工具栏

`IconButtonProps` 关键字段:

| Prop | 类型 | 说明 |
| --- | --- | --- |
| `icon` | `ReactElement<LucideIcon>` | 必填图标 |
| `tip` | `ReactNode` | tooltip 文案 |
| `tipDelay` | `number` | tooltip 延迟 |
| `placement` | `TooltipProps["placement"]` | 提示位置 |

## Loader

统一的加载占位组件，适合页面级与局部加载态。

推荐场景:

- 页面首屏等待
- 表格或树加载中
- 抽屉内容初始化中

## OperationButton

和 `ActionButton` 类似，但语义上更偏表格行内或局部“操作项”。

推荐场景:

- 表格操作列
- 行内编辑 / 删除
- 卡片右上角动作

## PermissionGate

基于 `appContext.hasPermission()` 的组件级权限门禁。

推荐场景:

- 隐藏无权限按钮
- 让局部卡片或面板按权限显示
- 想在 JSX 层直接表达权限条件

关键 Props:

| Prop | 类型 | 说明 |
| --- | --- | --- |
| `permTokens` | `string \| string[]` | 权限点 |
| `checkMode` | `"any" \| "all"` | 任一满足或全部满足 |
| `children` | `ReactNode \| ((hasPermission) => ReactNode)` | 内容或 render function |

## ScrollArea

基于 Radix Scroll Area 的可观测滚动容器，比裸 `overflow: auto` 更适合复杂后台页。

推荐场景:

- 左侧树导航
- 高度受限的筛选面板
- 需要监听滚动位置的面板

关键 Props:

| Prop | 类型 | 说明 |
| --- | --- | --- |
| `scrollbarSize` | `Length` | 滚动条尺寸 |
| `scrollbarPadding` | `Length` | 滚动条内边距 |
| `viewportRef` | `Ref<HTMLDivElement>` | 内容区引用 |
| `viewportClassName` | `string` | 内容区类名 |
| `overscrollBehavior` | `CSSProperties["overscrollBehavior"]` | 边界滚动行为 |
| `onScrollPositionChange` | `(position) => void` | 滚动位置回调 |
| `onTopReached` | `() => void` | 到顶回调 |
| `onBottomReached` | `() => void` | 到底回调 |

## CodeHighlighter

代码高亮组件，适合审计日志、配置展示、文档示例。

推荐场景:

- JSON 请求 / 响应详情
- 配置文件查看
- 文档代码块增强展示

关键 Props:

| Prop | 类型 | 说明 |
| --- | --- | --- |
| `children` | `string` | 代码文本 |
| `language` | `string` | 语言名 |
| `showLineNumbers` | `boolean` | 是否显示行号 |
| `startingLineNumber` | `number` | 起始行号 |
| `wrapLines` | `boolean` | 是否按行包裹 |
| `wrapLongLines` | `boolean` | 是否折行长文本 |
| `customStyle` | `CSSProperties` | 自定义高亮区域样式 |

## Upload

在 Antd `Upload` 基础上增加了可选的图片裁剪能力。

推荐场景:

- 用户头像
- 图片附件上传
- 需要先裁切再上传的表单字段

关键 Props:

| Prop | 类型 | 说明 |
| --- | --- | --- |
| `enableCrop` | `boolean` | 是否启用裁剪 |
| `cropperProps` | `ImgCropProps` | 裁剪器额外配置 |

说明:

- 其余上传行为沿用 Antd `UploadProps`
- 在表单里经常和 `field.Upload` 一起使用

## 文字与动画展示组件

以下组件更偏增强展示，而不是后台通用业务控件:

| 导出 | 推荐场景 |
| --- | --- |
| `FlipText` | 欢迎页或局部数字翻转展示 |
| `SparklesText` | 首页标题、活动区域视觉强调 |
| `SplitText` | 分字/分词入场动画 |
| `TypingAnimation` | 副标题、提示语逐字出现 |

使用建议:

- 它们更适合首页、登录页、营销感较强的模块
- 在标准 CRUD 页面里应克制使用
