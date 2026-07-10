---
title: "Components Overview"
description: "The single catalog of every component exported by @vef-framework-react/components, grouped by purpose."
---

# Components Overview

`@vef-framework-react/components` is the UI component library for VEF Framework. It is built on top of [Ant Design 6.x](https://ant.design/components/overview/) and extends it with layout primitives, permission-aware components, a CRUD stack, and a type-safe form system — while re-exporting the rest of Ant Design unchanged.

Every component lives in exactly one of the groups below. Components marked **VEF** are original or meaningfully enhanced; everything under [Ant Design Pass-Through](./antd-pass-through.md) is a thin, behavior-identical re-export.

## Layout

| Component | Description |
|-----------|-------------|
| [`Grid`](./grid.md) | Responsive auto-fill grid with collapse support |
| [`Stack`](./stack.md) | Vertical flex stack layout |
| [`Center`](./center.md) | Centered flex layout |
| [`Group`](./group.md) | Horizontal flex layout |
| [`ScrollArea`](./scroll-area.md) | Custom scrollbar area with scroll event callbacks |

## Page & CRUD

| Component | Description |
|-----------|-------------|
| [`Page`](./page.md) | Primary business-page container with aside panels, header, and footer |
| [`FlexCard`](./flex-card.md) | Semantic `Card` wrapper for split-card and tree-table layouts |
| [`FormModal`](./form-modal.md) | Modal that combines form state, mutation, and submit/reset actions |
| [`FormDrawer`](./form-drawer.md) | Same as `FormModal`, rendered as a side drawer |
| [`ProSearch`](./pro-search.md) | Search-form container with basic/advanced areas and search/reset actions |
| [`ProTable`](./pro-table.md) | Page-level table with built-in query, pagination, row selection, and column settings |
| [`Table`](./table.md) | The underlying data table, with `flexHeight` and pagination helpers |
| [`Crud` and `CrudPage`](./crud.md) | Combines `ProSearch` + `ProTable` + scene forms + delete mutations into one CRUD state model |
| [`EditableTable`](./editable-table.md) | Controlled, inline-editable table — editing, adding, and deleting rows are operations on a value array |

## Forms

| Component | Description |
|-----------|-------------|
| [`Form`](./form.md) | Type-safe form system built on [`@tanstack/react-form`](https://tanstack.com/form) (`useForm`, `form.AppField`, field components) |
| [`Bool`](./bool.md) | Boolean value display/input with switch, radio, radio-button, and checkbox variants |
| [`Select`](./select.md) | Dropdown selector, enhanced with `useDataOptionsSelect` for remote/dictionary options |
| [`Tree`](./tree.md) | Tree view, enhanced with `useDataOptionsTree` |
| [`TreeSelect`](./tree-select.md) | Tree-structured dropdown, enhanced with `useDataOptionsTreeSelect` |
| [`Upload`](./upload.md) | File upload with inline image cropping |
| [`FileUpload`](./file-upload.md) | Chunked, resumable upload variant of `Upload`, wired to the framework's storage protocol |
| [`IconPicker`](./icon-picker.md) | Searchable popup grid for choosing a lucide icon |
| [`GenericSelect`](./generic-select.md) | Abstract base for popup-driven selection controls — the foundation `IconPicker` is built on |

## Actions & Permissions

| Component | Description |
|-----------|-------------|
| [`ActionButton`](./action-button.md) | Button with built-in async loading and confirm dialog |
| [`ActionGroup`](./action-group.md) | Renders a group of action buttons from a config array |
| [`OperationButton`](./operation-button.md) | `ActionButton` + `PermissionGate` combined |
| [`PermissionGate`](./permission-gate.md) | Conditionally renders children based on permissions |

## Display & Utility

| Component | Description |
|-----------|-------------|
| [`ConfigProvider`](./config-provider.md) | VEF's global theme provider — dark mode, semantic colors, CSS variables |
| [Notifications & Messages](./notifications.md) | Imperative feedback helpers — `showSuccessMessage`, `showErrorNotification`, `showConfirm`, and friends |
| [`IconButton`](./icon-button.md) | Icon-only button with tooltip |
| [`Loader`](./loader.md) | Full-screen or inline loading indicator |
| [`Icon`](./icon.md) | Renders a Lucide icon component passed as a prop |
| [`DynamicIcon`](./dynamic-icon.md) | Renders a Lucide icon by name string |
| [`LogoIcon`](./logo-icon.md) | The VEF framework logo as an SVG component |
| [`Chart`](./chart.md) | ECharts wrapper with theme support and chart linking |
| [`CodeHighlighter`](./code-highlighter.md) | Syntax-highlighted code block |
| [`CodeEditor`](./code-editor.md) | CodeMirror 6 code editor with syntax highlighting and an imperative ref API |
| [`Keyboard`](./keyboard.md) | Keyboard shortcut key display |

## Animation

| Component | Description |
|-----------|-------------|
| [`FlipText`](./flip-text.md) | Character flip animation |
| [`SparklesText`](./sparkles-text.md) | Text with sparkle particle effects |
| [`SplitText`](./split-text.md) | GSAP-powered text split animation |
| [`TypingAnimation`](./typing-animation.md) | Typewriter effect animation |
| [`BorderBeam`](./border-beam.md) | Decorative animated beam that travels along a container's border (antd re-export) |

## Ant Design

Components documented on their own page because they carry VEF-specific notes (props, form integration, or usage guidance) beyond straight pass-through:

| Component | Description |
|-----------|-------------|
| [`Button`](./button.md) | Trigger operations |
| [`Input`](./input.md) | Text input field (`Input.Password`, `Input.TextArea`, `Input.Search`, `Input.OTP`) |
| [`Modal`](./modal.md) | Dialog overlay |
| [`Alert`](./alert.md) | Alert message |
| [`Avatar`](./avatar.md) | User avatar |
| [`Typography`](./typography.md) | `Title` / `Text` / `Paragraph` / `Link` |
| [`Compact`](./compact.md) | `Space.Compact` — groups inputs/buttons into a seamless unit |

Everything else from Ant Design is a straight, unmodified re-export — see the [Ant Design Pass-Through](./antd-pass-through.md) index.

## Hooks Exported by This Package

`@vef-framework-react/components` also exports hooks. Each is documented on its host component's page:

| Hooks | Documented on |
|-------|---------------|
| `useForm`, `useFormContext`, `useFormStore`, `createFormOptions`, `withForm`, `withFieldGroup` | [`Form`](./form.md) |
| `useDataOptionsSelect`, `useDictionaryOptionsSelect` | [`Select`](./select.md) |
| `useDataOptionsTreeSelect` | [`TreeSelect`](./tree-select.md) |
| `useDataOptionsTree` | [`Tree`](./tree.md) |
| `usePaginationProps` | [`Table`](./table.md) |
| `useGridCollapsed` | [`Grid`](./grid.md) |
| `usePageEntranceEffect`, `usePageEntranceSettled`, `useViewportHeight` | [`Page`](./page.md) |
| `useThemeTokens`, `useIsDarkMode` | [`ConfigProvider`](./config-provider.md) |
| `useChart`, `connectCharts`, `disconnectCharts` | [`Chart`](./chart.md) |

Hooks from `@vef-framework-react/hooks` (permissions, dictionaries, upload, debounce, …) are indexed separately in [VEF Hooks](../reference/hooks/vef-hooks.md).

## Installation

```bash
pnpm add @vef-framework-react/components
```

## Basic Usage

```tsx
import { Button, Table, ActionButton } from '@vef-framework-react/components';
```

All components are tree-shakeable via named exports.
