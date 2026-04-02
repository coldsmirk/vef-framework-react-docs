---
sidebar_position: 1
---

# 组件总览

`@vef-framework-react/components` 是 VEF Framework 的 UI 组件库，基于 [Ant Design 6.x](https://ant.design/components/overview-cn/) 构建，并在此基础上扩展了布局原语、权限感知组件和表单集成工具。

## 组件分类

### Ant Design 直通组件

大多数 Ant Design 组件直接从 `antd` 重新导出，可以完全按照 [Ant Design 官方文档](https://ant.design/components/overview-cn/) 使用，Props 和 API 完全一致。

| 组件 | 说明 |
|------|------|
| `Button` | 触发操作 |
| `Input` | 文本输入框 |
| `Select` | 下拉选择器 |
| `Table` | 数据表格（含 VEF 增强） |
| `Form` | 数据录入表单（由 `useForm` 替代） |
| `Modal` | 对话框 |
| `DatePicker` | 日期/日期范围选择器 |
| `TimePicker` | 时间/时间范围选择器 |
| `Checkbox` | 复选框 |
| `Radio` | 单选框 |
| `Switch` | 开关 |
| `Slider` | 滑动输入条 |
| `Upload` | 文件上传 |
| `Tree` | 树形控件 |
| `TreeSelect` | 树形选择器 |
| `Cascader` | 级联选择 |
| `AutoComplete` | 自动完成 |
| `Mentions` | 提及 |
| `ColorPicker` | 颜色选择器 |
| `Rate` | 评分 |
| `Transfer` | 穿梭框 |
| `Avatar` | 头像 |
| `Badge` | 徽标数 |
| `Tag` | 标签 |
| `Tooltip` | 文字提示 |
| `Popover` | 气泡卡片 |
| `Popconfirm` | 气泡确认框 |
| `Dropdown` | 下拉菜单 |
| `Menu` | 导航菜单 |
| `Tabs` | 标签页 |
| `Collapse` | 折叠面板 |
| `Card` | 卡片 |
| `List` | 列表 |
| `Descriptions` | 描述列表 |
| `Statistic` | 统计数值 |
| `Progress` | 进度条 |
| `Spin` | 加载中 |
| `Skeleton` | 骨架屏 |
| `Alert` | 警告提示 |
| `Result` | 结果页 |
| `Empty` | 空状态 |
| `Pagination` | 分页 |
| `Steps` | 步骤条 |
| `Timeline` | 时间轴 |
| `Breadcrumb` | 面包屑 |
| `Anchor` | 锚点 |
| `Affix` | 固钉 |
| `Divider` | 分割线 |
| `Space` | 间距 |
| `Flex` | 弹性布局 |
| `Row` / `Col` | 栅格布局 |
| `Splitter` | 分割面板 |
| `Drawer` | 抽屉 |
| `FloatButton` | 悬浮按钮 |
| `Image` | 图片（含预览） |
| `Calendar` | 日历 |
| `Carousel` | 走马灯 |
| `QRCode` | 二维码 |
| `Watermark` | 水印 |
| `Tour` | 漫游式引导 |
| `Segmented` | 分段控制器 |
| `InputNumber` | 数字输入框 |
| `Typography` | 排版（Text / Title / Paragraph / Link） |
| `ConfigProvider` | 全局化配置 |

### VEF 特有组件

以下组件是 VEF Framework 独有的，不属于 Ant Design。

| 组件 | 说明 |
|------|------|
| [`ActionButton`](./action-button) | 内置异步 loading 和确认对话框的按钮 |
| [`ActionGroup`](./action-group) | 从配置数组渲染一组操作按钮 |
| [`Bool`](./bool) | 多种展示形式的布尔值输入/展示组件 |
| [`Grid`](./grid) | 支持折叠的响应式自动填充网格 |
| [`Stack`](./stack) | 垂直 flex 堆叠布局 |
| [`Center`](./center) | 居中 flex 布局 |
| [`ScrollArea`](./scroll-area) | 自定义滚动条区域，支持滚动事件回调 |
| [`Loader`](./loader) | 全屏或内联加载指示器 |
| [`PermissionGate`](./permission-gate) | 基于权限条件渲染子内容 |
| [`IconButton`](./icon-button) | 带 Tooltip 的图标按钮 |
| [`DynamicIcon`](./dynamic-icon) | 通过名称字符串渲染 Lucide 图标 |
| `OperationButton` | `ActionButton` + `PermissionGate` 的组合 |
| `Chart` | ECharts 封装 |
| `CodeHighlighter` | 语法高亮代码块 |
| `Keyboard` | 键盘快捷键展示 |

### 表单系统

VEF 使用基于 [`@tanstack/react-form`](https://tanstack.com/form) 的类型安全表单系统替代 Ant Design 的 `Form`。详见 [Form](./form) 文档。

## 安装

```bash
pnpm add @vef-framework-react/components
```

## 基础用法

```tsx
import { Button, Table, ActionButton } from '@vef-framework-react/components';
```

所有组件均通过具名导出支持 Tree-shaking。
