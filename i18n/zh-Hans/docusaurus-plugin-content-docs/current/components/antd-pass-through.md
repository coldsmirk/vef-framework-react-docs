---
title: "Ant Design 直通组件"
description: "从 Ant Design 原样重新导出的组件索引——请完全按照 Ant Design 官网文档使用。"
---

# Ant Design 直通组件

`@vef-framework-react/components` 直接重新导出了大部分 [Ant Design](https://ant.design/components/overview/) 组件。这些组件不携带任何 VEF 专属行为或属性变更——从 `@vef-framework-react/components` 导入它们，并完全按照 Ant Design 官网文档使用即可。

> 在拥有独立文档页面的组件中，[`Modal`](./modal.md)（新增 `draggable`）、[`Table`](./table.md)（新增 `flexHeight`/`striped`）和 [`Upload`](./upload.md)（新增 `enableCrop`/`pastable`）真正扩展了 antd。[`Button`](./button.md)、[`Input`](./input.md)、[`Alert`](./alert.md)、[`Avatar`](./avatar.md)、[`Typography`](./typography.md) 和 [`Compact`](./compact.md) 同样是 `antd` 的原样重新导出——它们拥有独立页面只是为了便于查找，而不是因为 VEF 改变了它们的行为。下表中的 `Empty` 也并非未经修改的直通组件：VEF 将其默认 `image` 覆盖为了 antd 的 `PRESENTED_IMAGE_SIMPLE`。对于真正获得了 VEF 专属属性、hook 或行为的组件，或 VEF 原创组件，请参见[组件概览](./overview.md)。

```tsx
import { Affix, Card, Tabs, Tag } from '@vef-framework-react/components';
```

| 组件 | 说明 | Ant Design 文档 |
|-----------|-------------|------------------|
| `Affix` | 将元素固定在视口中。 | [Affix](https://ant.design/components/affix/) |
| `Anchor` | 指向页面内区块的超链接导航。 | [Anchor](https://ant.design/components/anchor/) |
| `AutoComplete` | 带自动完成建议的输入框。 | [AutoComplete](https://ant.design/components/auto-complete/) |
| `Badge` | 在元素上显示数量或状态。 | [Badge](https://ant.design/components/badge/) |
| `Breadcrumb` | 显示当前页面在层级结构中的位置。 | [Breadcrumb](https://ant.design/components/breadcrumb/) |
| `Calendar` | 以日历形式展示日期。 | [Calendar](https://ant.design/components/calendar/) |
| `Card` | 用于组织相关内容的容器。 | [Card](https://ant.design/components/card/) |
| `Carousel` | 循环轮播元素的幻灯片。 | [Carousel](https://ant.design/components/carousel/) |
| `Cascader` | 从层级选项列表中选择。 | [Cascader](https://ant.design/components/cascader/) |
| `Checkbox` | 用于多选的复选框。 | [Checkbox](https://ant.design/components/checkbox/) |
| `Col` | 栅格列容器。 | [Col](https://ant.design/components/col/) |
| `Collapse` | 可折叠的内容区块。 | [Collapse](https://ant.design/components/collapse/) |
| `ColorPicker` | 颜色选择输入框。 | [ColorPicker](https://ant.design/components/color-picker/) |
| `DatePicker` | 选择日期或日期范围。 | [DatePicker](https://ant.design/components/date-picker/) |
| `Descriptions` | 以分组形式展示多个只读字段。 | [Descriptions](https://ant.design/components/descriptions/) |
| `Divider` | 内容之间的视觉分割线。 | [Divider](https://ant.design/components/divider/) |
| `Drawer` | 从屏幕边缘滑出的面板。 | [Drawer](https://ant.design/components/drawer/) |
| `Dropdown` | 由按钮触发的下拉菜单。 | [Dropdown](https://ant.design/components/dropdown/) |
| `Flex` | flex 布局容器。 | [Flex](https://ant.design/components/flex/) |
| `FloatButton` | 悬浮操作按钮。 | [FloatButton](https://ant.design/components/float-button/) |
| `Image` | 支持预览的图片。 | [Image](https://ant.design/components/image/) |
| `InputNumber` | 数字输入框。 | [InputNumber](https://ant.design/components/input-number/) |
| `List` | 展示条目列表。 | [List](https://ant.design/components/list/) |
| `Mentions` | 在文本输入中提及某人。 | [Mentions](https://ant.design/components/mentions/) |
| `Menu` | 用于页面路由的导航菜单。 | [Menu](https://ant.design/components/menu/) |
| `Pagination` | 用于长列表的分页控件。 | [Pagination](https://ant.design/components/pagination/) |
| `Popconfirm` | 元素上的确认气泡框。 | [Popconfirm](https://ant.design/components/popconfirm/) |
| `Popover` | 点击触发的浮动卡片。 | [Popover](https://ant.design/components/popover/) |
| `Progress` | 展示操作的当前进度。 | [Progress](https://ant.design/components/progress/) |
| `QRCode` | 生成二维码。 | [QRCode](https://ant.design/components/qrcode/) |
| `Radio` | 从一组选项中选择单个选项。 | [Radio](https://ant.design/components/radio/) |
| `Rate` | 星级评分组件。 | [Rate](https://ant.design/components/rate/) |
| `Result` | 展示操作结果。 | [Result](https://ant.design/components/result/) |
| `Row` | 栅格行容器。 | [Row](https://ant.design/components/row/) |
| `Segmented` | 用于切换视图的分段控制器。 | [Segmented](https://ant.design/components/segmented/) |
| `Skeleton` | 内容加载时的占位骨架。 | [Skeleton](https://ant.design/components/skeleton/) |
| `Slider` | 在范围内选择数值的滑动条。 | [Slider](https://ant.design/components/slider/) |
| `Space` | 设置组件之间的间距。 | [Space](https://ant.design/components/space/) |
| `Spin` | 加载中的旋转指示器。 | [Spin](https://ant.design/components/spin/) |
| `Splitter` | 可调整大小的分栏面板。 | [Splitter](https://ant.design/components/splitter/) |
| `Statistic` | 展示统计数值。 | [Statistic](https://ant.design/components/statistic/) |
| `Steps` | 分步进度指示器。 | [Steps](https://ant.design/components/steps/) |
| `Switch` | 切换开关。 | [Switch](https://ant.design/components/switch/) |
| `Tabs` | 将内容组织为标签页区块。 | [Tabs](https://ant.design/components/tabs/) |
| `Tag` | 用于内容分类的标签。 | [Tag](https://ant.design/components/tag/) |
| `TimePicker` | 选择时间值。 | [TimePicker](https://ant.design/components/time-picker/) |
| `Timeline` | 按时间顺序展示事件列表。 | [Timeline](https://ant.design/components/timeline/) |
| `Tooltip` | 悬停时显示的简单文字提示。 | [Tooltip](https://ant.design/components/tooltip/) |
| `Tour` | 对界面元素的引导浏览。 | [Tour](https://ant.design/components/tour/) |
| `Transfer` | 在两个列表之间移动条目。 | [Transfer](https://ant.design/components/transfer/) |
| `Watermark` | 为容器添加水印。 | [Watermark](https://ant.design/components/watermark/) |
