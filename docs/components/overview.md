---
sidebar_position: 1
---

# Components Overview

`@vef-framework-react/components` is the UI component library for VEF Framework. It is built on top of [Ant Design 6.x](https://ant.design/components/overview/) and extends it with additional layout primitives, permission-aware components, and form integration utilities.

## Component Categories

### Ant Design Pass-through

Most Ant Design components are re-exported directly from `antd`. You can use them exactly as documented on the [Ant Design website](https://ant.design/components/overview/), with the same props and APIs.

| Component | Description |
|-----------|-------------|
| `Button` | Trigger operations |
| `Input` | Text input field |
| `Select` | Dropdown selector |
| `Table` | Data table (with VEF enhancements) |
| `Form` | Data entry form (replaced by `useForm`) |
| `Modal` | Dialog overlay |
| `DatePicker` | Date / date-range picker |
| `TimePicker` | Time / time-range picker |
| `Checkbox` | Checkbox input |
| `Radio` | Radio input |
| `Switch` | Toggle switch |
| `Slider` | Slider input |
| `Upload` | File upload |
| `Tree` | Tree view |
| `TreeSelect` | Tree-based selector |
| `Cascader` | Cascading selector |
| `AutoComplete` | Auto-complete input |
| `Mentions` | Mentions input |
| `ColorPicker` | Color picker |
| `Rate` | Star rating |
| `Transfer` | Transfer list |
| `Avatar` | User avatar |
| `Badge` | Status badge |
| `Tag` | Label tag |
| `Tooltip` | Hover tooltip |
| `Popover` | Click popover |
| `Popconfirm` | Confirmation popover |
| `Dropdown` | Dropdown menu |
| `Menu` | Navigation menu |
| `Tabs` | Tab navigation |
| `Collapse` | Collapsible panel |
| `Card` | Content card |
| `List` | Data list |
| `Descriptions` | Key-value descriptions |
| `Statistic` | Numeric statistic |
| `Progress` | Progress indicator |
| `Spin` | Loading spinner |
| `Skeleton` | Loading skeleton |
| `Alert` | Alert message |
| `Result` | Result page |
| `Empty` | Empty state |
| `Pagination` | Pagination control |
| `Steps` | Step indicator |
| `Timeline` | Timeline |
| `Breadcrumb` | Breadcrumb navigation |
| `Anchor` | Anchor links |
| `Affix` | Sticky element |
| `Divider` | Visual divider |
| `Space` | Spacing wrapper |
| `Flex` | Flex layout |
| `Row` / `Col` | Grid layout |
| `Splitter` | Resizable panels |
| `Drawer` | Slide-in panel |
| `FloatButton` | Floating action button |
| `Image` | Image with preview |
| `Calendar` | Calendar view |
| `Carousel` | Carousel / slideshow |
| `QRCode` | QR code generator |
| `Watermark` | Watermark overlay |
| `Tour` | Guided tour |
| `Segmented` | Segmented control |
| `InputNumber` | Numeric input |
| `Typography` | Text / Title / Paragraph / Link |
| `ConfigProvider` | Global config provider |

### VEF-specific Components

These components are unique to VEF Framework and are not part of Ant Design.

| Component | Description |
|-----------|-------------|
| [`ActionButton`](./action-button) | Button with built-in async loading and confirm dialog |
| [`ActionGroup`](./action-group) | Renders a group of action buttons from a config array |
| [`OperationButton`](./operation-button) | `ActionButton` + `PermissionGate` combined |
| [`Bool`](./bool) | Boolean value display/input with multiple variants |
| [`Grid`](./grid) | Responsive auto-fill grid with collapse support |
| [`Stack`](./stack) | Vertical flex stack layout |
| [`Center`](./center) | Centered flex layout |
| [`Group`](./group) | Horizontal flex layout |
| [`ScrollArea`](./scroll-area) | Custom scrollbar area with scroll event callbacks |
| [`Loader`](./loader) | Full-screen or inline loading indicator |
| [`PermissionGate`](./permission-gate) | Conditionally renders children based on permissions |
| [`IconButton`](./icon-button) | Icon-only button with tooltip |
| [`DynamicIcon`](./dynamic-icon) | Renders a Lucide icon by name string |
| [`Icon`](./icon) | Renders a Lucide icon component passed as a prop |
| [`ConfigProvider`](./config-provider) | VEF global config provider with dark mode & theme |
| [`Chart`](./chart) | ECharts wrapper with theme and chart linking |
| [`CodeHighlighter`](./code-highlighter) | Syntax-highlighted code block |
| [`Keyboard`](./keyboard) | Keyboard shortcut display |

### Animation Components

| Component | Description |
|-----------|-------------|
| [`FlipText`](./flip-text) | Character flip animation |
| [`SparklesText`](./sparkles-text) | Text with sparkle particle effects |
| [`SplitText`](./split-text) | GSAP-powered text split animation |
| [`TypingAnimation`](./typing-animation) | Typewriter effect animation |

### AI Components (X Series)

Built on [`@ant-design/x`](https://x.ant.design/), re-exported with the `X` prefix. See the [AI Components Overview](./x-overview) for details.

| Component | Description |
|-----------|-------------|
| `XBubble` | Chat message bubble |
| `XSender` | Message input with send button |
| `XConversations` | Conversation list |
| `XPrompts` | Suggested prompt list |
| `XThoughtChain` | AI reasoning chain display |
| `XWelcome` | Welcome screen |
| `XMarkdown` | Markdown renderer with streaming |
| `XMermaid` | Mermaid diagram renderer |
| `XCodeHighlighter` | Code block for AI responses |

VEF replaces Ant Design's `Form` with a type-safe form system built on [`@tanstack/react-form`](https://tanstack.com/form). See the [Form](./form) documentation for details.

## Installation

```bash
pnpm add @vef-framework-react/components
```

## Basic Usage

```tsx
import { Button, Table, ActionButton } from '@vef-framework-react/components';
```

All components are tree-shakeable via named exports.
