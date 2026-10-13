---
title: "Ant Design Pass-Through"
description: "Index of components re-exported from Ant Design unchanged — use them exactly as documented on the Ant Design site."
---

# Ant Design Pass-Through

`@vef-framework-react/components` re-exports most of [Ant Design](https://ant.design/components/overview/) directly. These components carry no VEF-specific behavior or prop changes — import them from `@vef-framework-react/components` and use them exactly as documented on the Ant Design site.

> Of the components with their own pages, [`Modal`](./modal.md) (adds `draggable`), [`Table`](./table.md) (adds `flexHeight`/`striped`), and [`Upload`](./upload.md) (adds `enableCrop`/`pastable`) genuinely extend antd. [`Button`](./button.md), [`Input`](./input.md), [`Alert`](./alert.md), [`Avatar`](./avatar.md), [`Typography`](./typography.md), [`Compact`](./compact.md), and [`BorderBeam`](./border-beam.md) are bare `antd` re-exports too — they get dedicated pages for discoverability, not because VEF changes their behavior. `Empty` in the table below is also not an unmodified pass-through: VEF overrides its default `image` to antd's `PRESENTED_IMAGE_SIMPLE`. For components that genuinely gain VEF-specific props, hooks, or behavior, or that are VEF-original, see the [Components Overview](./overview.md).

```tsx
import { Affix, Card, Tabs, Tag } from '@vef-framework-react/components';
```

| Component | Description | Ant Design docs |
|-----------|-------------|------------------|
| `Affix` | Stick an element to the viewport. | [Affix](https://ant.design/components/affix/) |
| `Anchor` | Hyperlinks to sections on a page. | [Anchor](https://ant.design/components/anchor/) |
| `AutoComplete` | An input with autocomplete suggestions. | [AutoComplete](https://ant.design/components/auto-complete/) |
| `Badge` | Displays a count or status on an element. | [Badge](https://ant.design/components/badge/) |
| `Breadcrumb` | Shows the current page location within a hierarchy. | [Breadcrumb](https://ant.design/components/breadcrumb/) |
| `Calendar` | Displays dates in a calendar format. | [Calendar](https://ant.design/components/calendar/) |
| `Card` | A container for grouping related content. | [Card](https://ant.design/components/card/) |
| `Carousel` | A slideshow cycling through elements. | [Carousel](https://ant.design/components/carousel/) |
| `Cascader` | Select from a hierarchical list of options. | [Cascader](https://ant.design/components/cascader/) |
| `Checkbox` | A checkbox for selecting multiple options. | [Checkbox](https://ant.design/components/checkbox/) |
| `Col` | A grid column container. | [Col](https://ant.design/components/col/) |
| `Collapse` | Collapsible content sections. | [Collapse](https://ant.design/components/collapse/) |
| `ColorPicker` | A color picker input. | [ColorPicker](https://ant.design/components/color-picker/) |
| `DatePicker` | Select a date or date range. | [DatePicker](https://ant.design/components/date-picker/) |
| `Descriptions` | Display multiple read-only fields in groups. | [Descriptions](https://ant.design/components/descriptions/) |
| `Divider` | A visual divider between content. | [Divider](https://ant.design/components/divider/) |
| `Drawer` | A panel that slides in from the edge. | [Drawer](https://ant.design/components/drawer/) |
| `Dropdown` | A dropdown menu triggered by a button. | [Dropdown](https://ant.design/components/dropdown/) |
| `Empty` | An empty-state placeholder; VEF presets `image` to `PRESENTED_IMAGE_SIMPLE`. | [Empty](https://ant.design/components/empty/) |
| `Flex` | A flex layout container. | [Flex](https://ant.design/components/flex/) |
| `FloatButton` | A floating action button. | [FloatButton](https://ant.design/components/float-button/) |
| `Image` | An image with preview support. | [Image](https://ant.design/components/image/) |
| `InputNumber` | A numeric input field. | [InputNumber](https://ant.design/components/input-number/) |
| `List` | Display a list of items. | [List](https://ant.design/components/list/) |
| `Mentions` | Mention someone in a text input. | [Mentions](https://ant.design/components/mentions/) |
| `Menu` | A navigation menu for page routing. | [Menu](https://ant.design/components/menu/) |
| `Pagination` | Pagination control for long lists. | [Pagination](https://ant.design/components/pagination/) |
| `Popconfirm` | A confirmation popover on an element. | [Popconfirm](https://ant.design/components/popconfirm/) |
| `Popover` | A floating card triggered by click. | [Popover](https://ant.design/components/popover/) |
| `Progress` | Display the current progress of an operation. | [Progress](https://ant.design/components/progress/) |
| `QRCode` | Generate a QR code. | [QRCode](https://ant.design/components/qrcode/) |
| `Radio` | Select a single option from a group. | [Radio](https://ant.design/components/radio/) |
| `Rate` | A star rating component. | [Rate](https://ant.design/components/rate/) |
| `Result` | Show the result of an operation. | [Result](https://ant.design/components/result/) |
| `Row` | A grid row container. | [Row](https://ant.design/components/row/) |
| `Segmented` | A segmented control for switching views. | [Segmented](https://ant.design/components/segmented/) |
| `Skeleton` | A placeholder while content is loading. | [Skeleton](https://ant.design/components/skeleton/) |
| `Slider` | A slider for selecting a value in a range. | [Slider](https://ant.design/components/slider/) |
| `Space` | Set spacing between components. | [Space](https://ant.design/components/space/) |
| `Spin` | A loading spinner. | [Spin](https://ant.design/components/spin/) |
| `Splitter` | Resizable split panels. | [Splitter](https://ant.design/components/splitter/) |
| `Statistic` | Display a statistic value. | [Statistic](https://ant.design/components/statistic/) |
| `Steps` | A step-by-step progress indicator. | [Steps](https://ant.design/components/steps/) |
| `Switch` | A toggle switch. | [Switch](https://ant.design/components/switch/) |
| `Tabs` | Organize content into tabbed sections. | [Tabs](https://ant.design/components/tabs/) |
| `Tag` | A label for categorizing content. | [Tag](https://ant.design/components/tag/) |
| `TimePicker` | Select a time value. | [TimePicker](https://ant.design/components/time-picker/) |
| `Timeline` | Display a list of events in chronological order. | [Timeline](https://ant.design/components/timeline/) |
| `Tooltip` | A simple text popup on hover. | [Tooltip](https://ant.design/components/tooltip/) |
| `Tour` | A guided tour of UI elements. | [Tour](https://ant.design/components/tour/) |
| `Transfer` | Move items between two lists. | [Transfer](https://ant.design/components/transfer/) |
| `Watermark` | Add a watermark to a container. | [Watermark](https://ant.design/components/watermark/) |

## Types

Every component above re-exports its props type under antd's own name — `AffixProps`, `AnchorProps`, `AutoCompleteProps`, `BadgeProps`, `BreadcrumbProps`, `CalendarProps`, `CardProps`, `CarouselProps`, `CascaderProps`, `CheckboxProps`, `ColProps`, `CollapseProps`, `ColorPickerProps`, `DatePickerProps`, `DescriptionsProps`, `DividerProps`, `DrawerProps`, `DropdownProps`, `EmptyProps`, `FlexProps`, `FloatButtonProps`, `ImageProps`, `InputNumberProps`, `ListProps`, `MentionsProps`, `MenuProps`, `PaginationProps`, `PopconfirmProps`, `PopoverProps`, `ProgressProps`, `QRCodeProps`, `RadioProps`, `RateProps`, `ResultProps`, `RowProps`, `SegmentedProps`, `SkeletonProps`, `SliderProps`, `SpaceProps`, `SpinProps`, `SplitterProps`, `StatisticProps`, `StepsProps`, `SwitchProps`, `TabsProps`, `TagProps`, `TimePickerProps`, `TimelineProps`, `TooltipProps`, `TourProps`, `TransferProps`, `WatermarkProps` — and so do the parts it is built from: `AvatarGroupProps`, `BadgeRibbonProps`, `CardGridProps` / `CardMetaProps`, `CheckableTagProps`, `CheckboxGroupProps`, `RadioGroupProps`, `DropdownButtonProps`, `ListItemProps` / `ListItemMetaProps`, `SkeletonButtonProps` / `SkeletonImageProps` / `SkeletonInputProps` / `SkeletonNodeProps` / `SkeletonParagraphProps` / `SkeletonTitleProps`, `SliderSingleProps` / `SliderRangeProps`, `StatisticTimerProps`, `TimeRangePickerProps`, and `DateRangePickerProps` / `MonthPickerProps` / `WeekPickerProps` (`DatePicker.RangePicker` / `.MonthPicker` / `.WeekPicker`). The same holds for the components with their own pages — `InputProps` with `PasswordProps` / `SearchProps` / `TextAreaProps` / `OTPProps`, the Typography parts' `TitleProps` / `ParagraphProps` / `TextProps` / `LinkProps`, `AlertProps`, `AvatarProps`, `CompactProps`.

The configuration shapes have named aliases, so a host does not have to dig them out of antd's internals:

| Type | What it is |
|------|------------|
| `AnchorLinkItem` | An `Anchor` `items` entry |
| `AutoCompleteOption` | An `AutoComplete` `options` entry |
| `BreadcrumbItem` | A `Breadcrumb` `items` entry; `BreadcrumbItemType` / `BreadcrumbSeparatorType` are its two kinds |
| `CarouselDotPlacement` / `CarouselEffect` / `CarouselRef` | `Carousel`'s dot placement, transition effect, and ref |
| `CascaderOption` | A `Cascader` `options` entry |
| `CheckboxOption<T>` / `RadioOption<T>` | A `Checkbox.Group` / `Radio.Group` `options` entry |
| `CollapseItem` | A `Collapse` `items` entry |
| `DescriptionsItem` | A `Descriptions` `items` entry |
| `DropdownMenuProps` / `DropdownMenuItem` | `Dropdown`'s `menu` prop and one of its `items`; `DropdownButtonType` is `Dropdown.Button`'s `type` |
| `InputRef` / `TooltipRef` | The refs of `Input` and `Tooltip` |
| `ListGridType` | `List`'s `grid` prop |
| `MentionsOption` | A `Mentions` `options` entry |
| `MenuItemType` / `SubMenuType` / `MenuItemGroupType` / `MenuDividerType` | The four kinds of `Menu` `items` entry |
| `SegmentedOption<T>` | A `Segmented` `options` entry |
| `TimelineItem` | A `Timeline` `items` entry |
| `TourStep` | A `Tour` `steps` entry |
| `TransferItem` | A `Transfer` `dataSource` record |
