---
title: "组件概览"
description: "@vef-framework-react/components 导出的全部组件的统一目录，按用途分组。"
---

# 组件概览

`@vef-framework-react/components` 是 VEF Framework 的 UI 组件库。它基于 [Ant Design 6.x](https://ant.design/components/overview/) 构建，并在此基础上扩展了布局原语、权限感知组件、CRUD 技术栈以及类型安全的表单系统——同时保持对其余 Ant Design 组件的原样重新导出。

以下每个组件都仅属于下方分组中的一个。标记为 **VEF** 的组件是原创或经过显著增强的组件；[Ant Design 直通组件](./antd-pass-through.md) 下的所有组件都是行为一致的轻量重新导出。

## 布局

| 组件 | 说明 |
|-----------|-------------|
| [`Grid`](./grid.md) | 支持折叠的响应式自动填充网格 |
| [`Stack`](./stack.md) | 纵向 flex 堆叠布局 |
| [`Center`](./center.md) | 居中的 flex 布局 |
| [`Group`](./group.md) | 横向 flex 布局 |
| [`ScrollArea`](./scroll-area.md) | 带滚动事件回调的自定义滚动条区域 |
| [`FlexTabs`](./flex-tabs.md) | 高度填充的 `Tabs` 变体——标签栏保持固定，激活面板拉伸占满剩余空间 |
| [`Labeled`](./labeled.md) | 标签在上的包装组件，带 label/group 无障碍语义，让非表单控件与垂直表单项对齐 |

## 页面与 CRUD

| 组件 | 说明 |
|-----------|-------------|
| [`Page`](./page.md) | 主要的业务页面容器，支持侧边面板、页头和页脚 |
| [`FlexCard`](./flex-card.md) | 用于分栏卡片和树形表格布局的语义化 `Card` 封装 |
| [`FormModal`](./form-modal.md) | 集表单状态、mutation 与提交/重置操作于一体的弹窗 |
| [`FormDrawer`](./form-drawer.md) | 与 `FormModal` 相同，但以侧边抽屉形式渲染 |
| [`ProSearch`](./pro-search.md) | 带基础/高级区域及搜索/重置操作的搜索表单容器 |
| [`ProTable`](./pro-table.md) | 内置查询、分页、行选择与列设置的页面级表格 |
| [`Table`](./table.md) | 底层数据表格，提供 `flexHeight` 与分页辅助功能 |
| [`Crud` and `CrudPage`](./crud.md) | 将 `ProSearch` + `ProTable` + 场景表单 + 删除 mutation 整合为一个 CRUD 状态模型 |
| [`EditableTable`](./editable-table.md) | 受控的行内可编辑表格——编辑、新增、删除行都是对值数组的操作 |

## 表单

| 组件 | 说明 |
|-----------|-------------|
| [`Form`](./form.md) | 基于 [`@tanstack/react-form`](https://tanstack.com/form) 构建的类型安全表单系统（`useForm`、`form.AppField`、字段组件） |
| [`Bool`](./bool.md) | 布尔值展示/输入组件，支持开关、单选、单选按钮和复选框等变体 |
| [`Select`](./select.md) | 下拉选择器，通过 `useDataOptionsSelect` 增强，支持远程/码集选项 |
| [`Tree`](./tree.md) | 树形视图，通过 `useDataOptionsTree` 增强 |
| [`TreeSelect`](./tree-select.md) | 树形结构下拉框，通过 `useDataOptionsTreeSelect` 增强 |
| [`Upload`](./upload.md) | 支持行内图片裁剪的文件上传组件 |
| [`FileUpload`](./file-upload.md) | 分片、可续传的上传组件，接入框架自身的存储协议 |
| [`IconPicker`](./icon-picker.md) | 用于选择 lucide 图标的可搜索弹出网格 |
| [`GenericSelect`](./generic-select.md) | 弹出式选择控件的抽象基座——`IconPicker` 正是基于它构建的 |
| [`Labels`](./labels.md) | 键值对标签的展示、编辑器与过滤输入框（`LabelsDisplay`、`LabelsEditor`、`LabelFilterSelect`）——v2.12.0 中从 `@vef-framework-react/approval` 迁入 |

## 操作与权限

| 组件 | 说明 |
|-----------|-------------|
| [`ActionButton`](./action-button.md) | 内置异步加载状态与确认对话框的按钮 |
| [`ActionGroup`](./action-group.md) | 根据配置数组渲染一组操作按钮 |
| [`OperationButton`](./operation-button.md) | `ActionButton` 与 `PermissionGate` 的组合 |
| [`PermissionGate`](./permission-gate.md) | 根据权限条件渲染子元素 |

## 展示与工具

| 组件 | 说明 |
|-----------|-------------|
| [`ConfigProvider`](./config-provider.md) | VEF 的全局主题提供者——暗色模式、语义化颜色、CSS 变量 |
| [消息与通知](./notifications.md) | 命令式反馈 helpers——`showSuccessMessage`、`showErrorNotification`、`showConfirm` 等 |
| [`IconButton`](./icon-button.md) | 带提示的纯图标按钮 |
| [`Loader`](./loader.md) | 全屏或行内加载指示器 |
| [`Icon`](./icon.md) | 渲染以属性形式传入的 Lucide 图标组件 |
| [`DynamicIcon`](./dynamic-icon.md) | 根据名称字符串渲染 Lucide 图标 |
| [`LogoIcon`](./logo-icon.md) | 以 SVG 组件形式提供的 VEF 框架 logo |
| [`Chart`](./chart.md) | 支持主题与图表联动的 ECharts 封装 |
| [`CodeHighlighter`](./code-highlighter.md) | 带语法高亮的代码块 |
| [`CodeEditor`](./code-editor.md) | 基于 CodeMirror 6 的代码编辑器，支持语法高亮与命令式 ref API |
| [`Keyboard`](./keyboard.md) | 键盘快捷键展示 |
| [`FilePreview`](./file-preview.md) | 应用自备文件预览宿主的契约（`FilePreviewProvider`、`useFilePreview`）——`Upload` 会把非图片预览派发给它（v2.11.0） |
| [工具导出](./utilities.md) | 非组件导出——`breakpoints`、颜色/尺寸/场景设计令牌常量、`globalCssVars`、`useThemeTokens`、查询元数据 symbol 及杂项辅助函数 |

## 动画

| 组件 | 说明 |
|-----------|-------------|
| [`FlipText`](./flip-text.md) | 字符翻转动画 |
| [`SparklesText`](./sparkles-text.md) | 带闪光粒子效果的文本 |
| [`SplitText`](./split-text.md) | 基于 GSAP 的文本拆分动画 |
| [`TypingAnimation`](./typing-animation.md) | 打字机效果动画 |
| [`BorderBeam`](./border-beam.md) | 沿容器边框流动的装饰性动画光束（antd 原样导出） |

## Ant Design

以下组件因携带 VEF 专属说明（属性、表单集成或使用指引）而非单纯直通，因此各自拥有独立文档页面：

| 组件 | 说明 |
|-----------|-------------|
| [`Button`](./button.md) | 触发操作 |
| [`Input`](./input.md) | 文本输入框（`Input.Password`、`Input.TextArea`、`Input.Search`、`Input.OTP`） |
| [`Modal`](./modal.md) | 对话框浮层 |
| [`Alert`](./alert.md) | 提示消息 |
| [`Avatar`](./avatar.md) | 用户头像 |
| [`Typography`](./typography.md) | `Title` / `Text` / `Paragraph` / `Link` |
| [`Compact`](./compact.md) | `Space.Compact`——将输入框/按钮组合成一个无缝整体 |

Ant Design 中的其余组件均为原样、未经修改的重新导出——完整索引参见 [Ant Design 直通组件](./antd-pass-through.md)。

## 本包导出的 Hooks

`@vef-framework-react/components` 同时导出一批 hooks，各自的文档在其宿主组件页面上：

| Hooks | 文档位置 |
|-------|---------------|
| `useForm`、`useFormContext`、`useFormStore`、`createFormOptions`、`withForm`、`withFieldGroup` | [`Form`](./form.md) |
| `useDataOptionsSelect`、`useCodeSetOptionsSelect` | [`Select`](./select.md) |
| `useDataOptionsTreeSelect` | [`TreeSelect`](./tree-select.md) |
| `useDataOptionsTree` | [`Tree`](./tree.md) |
| `usePaginationProps` | [`Table`](./table.md) |
| `useGridCollapsed` | [`Grid`](./grid.md) |
| `usePageEntranceEffect`、`usePageEntranceSettled`、`useViewportHeight` | [`Page`](./page.md) |
| `useThemeTokens` | [工具导出](./utilities.md) |
| `useIsDarkMode` | [`ConfigProvider`](./config-provider.md) |
| `useFilePreview` | [`FilePreview`](./file-preview.md) |
| `useChart`、`connectCharts`、`disconnectCharts` | [`Chart`](./chart.md) |

`@vef-framework-react/hooks` 包中的 hooks（权限、码集、上传、防抖等）另有索引，见 [VEF Hooks](../reference/hooks/vef-hooks.md)。

## 安装

```bash
pnpm add @vef-framework-react/components
```

## 基础用法

```tsx
import { Button, Table, ActionButton } from '@vef-framework-react/components';
```

所有组件均通过具名导出支持 tree-shaking。
