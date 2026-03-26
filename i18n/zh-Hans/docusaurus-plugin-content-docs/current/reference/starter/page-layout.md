---
sidebar_position: 3
title: 页面、布局与表单容器
---

# 页面、布局与表单容器

## `App`

应用根组件。负责串起:

- `AppContextProvider`
- `ApiClientProvider`
- `MotionProvider`
- `ThemeConfigProvider`
- `RouterProvider`

你通常不直接手写它，而是通过 `createApp().render()` 使用。

## `Page`

普通业务页首选容器。

推荐场景:

- 监控页
- 配置页
- 图表看板
- 左右侧栏布局页

关键 Props:

| Prop | 类型 | 说明 |
| --- | --- | --- |
| `margin` | `boolean` | 是否启用页面外边距 |
| `gap` | `Length` | 主区域间距 |
| `leftAside` / `rightAside` | `ReactNode` | 左右侧栏 |
| `leftAsideWidth` / `rightAsideWidth` | `AsideWidth` | 侧栏宽度或可拖拽配置 |
| `header` / `footer` | `ReactNode` | 页头页脚 |
| `headerPosition` / `footerPosition` | `"inside" \| "outside"` | 内外布局位置 |
| `scrollable` | `boolean` | 内容区是否滚动 |
| `scrollMargin` | `boolean` | 是否自动给滚动区补边距 |

## `FlexCard`

本质上是 `CardProps` 的语义化导出，适合分栏卡片页和树表页。

## `BaseLayout` / `Layout`

应用壳层布局组件。通常由布局路由驱动，不建议在普通业务页手工直接重组。

## `RouterProvider`

把 router 和扩展上下文注入 React 树。  
如果使用 `createApp()`，通常也不需要单独手动挂它。

## `ThemeConfigProvider`

starter 对应用主题层的进一步封装，通常和 `App` 一起工作。

## `Login`

框架内置登录页组件。

推荐场景:

- 标准后台登录页
- 不想自行重复搭登录表单和跳转逻辑

关键 Props:

| Prop | 类型 | 说明 |
| --- | --- | --- |
| `logo` | `ReactNode` | 左上角品牌图形 |
| `title` | `string` | 登录页标题 |
| `description` | `string` | 副标题 |
| `publicKey` | `string` | 开启 RSA 加密时使用 |
| `onLogin` | `(params: LoginParams) => Promise<LoginResult>` | 登录回调 |

## `FormModal`

把 Modal 与表单、mutation、提交按钮统一封装在一起。

推荐场景:

- 小中型新增/编辑弹窗
- 需要默认 footer 行为的表单弹窗

关键 Props:

| Prop | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` | 是否打开 |
| `title` | `ReactNode` | 标题 |
| `width` | `ModalProps["width"]` | 宽度 |
| `draggable` | `boolean` | 是否支持拖拽 |
| `defaultValues` | `TValues` | 默认值 |
| `mutationFn` | `MutationFunction` | 提交时执行的 mutation |
| `renderActions` | `(formApi) => ReactNode` | 自定义底部操作区 |
| `beforeSubmit` / `afterSubmit` | 回调 | 提交前后钩子 |

## `FormDrawer`

与 `FormModal` 语义相同，但承载容器是 Drawer。

推荐场景:

- 长表单
- 需要更大横向空间
- 不想遮挡原页面上下文

关键 Props:

| Prop | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` | 是否打开 |
| `title` | `ReactNode` | 标题 |
| `placement` | `DrawerProps["placement"]` | 打开方向 |
| `resizable` | `boolean` | 是否可调整尺寸 |
| `width` | `Length` | 宽度 |
| 其余表单相关 | 与 `FormModal` 类似 | 提交、重置、钩子一致 |

## 其它页面级组件

| 导出 | 用途 |
| --- | --- |
| `AccessDenied` | 无权限页 |
| `Error` | 路由错误页 |
| `NotFound` | 404 页 |
| `LogoIcon` | 框架风格 Logo 图形 |
| `nProgressEventEmitter` | 路由进度条事件 |
| `useViewportHeight` | 页面内部读取视口高度 |
