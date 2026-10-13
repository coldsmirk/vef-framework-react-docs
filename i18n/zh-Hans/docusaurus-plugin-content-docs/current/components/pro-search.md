---
title: "ProSearch"
description: "一个包含基础搜索区域、可折叠高级搜索面板以及搜索/重置操作的搜索表单容器。"
---

# ProSearch

一个包含基础搜索区域、可折叠高级搜索面板以及搜索/重置操作的搜索表单容器。

> **VEF 专属组件。** 已在 v2.1.6 中从 `@vef-framework-react/starter` 迁移至 `@vef-framework-react/components`。

## 何时使用

- 带可选高级筛选面板的表格搜索栏。
- 需要统一搜索/重置按钮行为的任意搜索区域。

## 基础用法

`ProSearch` 内部持有一个表单实例。搜索字段必须通过 `useFormContext` + `AppField` 连接到该表单——直接放裸的输入组件不会绑定任何值，`onSearch` 拿不到它。约定的写法是在页面旁定义一个小的 `BasicSearch` 组件：

```tsx
import { ProSearch, useFormContext } from '@vef-framework-react/components';

interface UserSearch {
  keyword?: string;
  status?: string;
}

function BasicSearch() {
  const { AppField } = useFormContext<UserSearch>();

  return (
    <>
      <AppField name="keyword">
        {(field) => <field.Input noWrapper placeholder="Keyword" />}
      </AppField>
      <AppField name="status">
        {(field) => <field.Select noWrapper placeholder="Status" options={STATUS_OPTIONS} />}
      </AppField>
    </>
  );
}

export default function UserSearchBar({ onSearch }: { onSearch: (values: UserSearch) => void }) {
  return (
    <ProSearch<UserSearch>
      basicSearch={<BasicSearch />}
      onSearch={onSearch}
    />
  );
}
```

点击搜索按钮时，`onSearch` 会收到当前表单值。搜索区域内的字段组件建议加 `noWrapper`，去掉完整表单里的 label/错误提示骨架。

## 带高级搜索

可折叠的高级面板使用同一个表单上下文——两块区域共享一个表单，`onSearch` 收到的是合并后的值：

```tsx
function AdvancedSearch() {
  const { AppField } = useFormContext<UserSearch>();

  return (
    <>
      <AppField name="createdAfter">
        {(field) => <field.DatePicker noWrapper placeholder="Created after" />}
      </AppField>
      <AppField name="department">
        {(field) => <field.Select noWrapper placeholder="Department" options={DEPARTMENT_OPTIONS} />}
      </AppField>
    </>
  );
}

<ProSearch<UserSearch>
  basicSearch={<BasicSearch />}
  advancedSearch={<AdvancedSearch />}
  onSearch={onSearch}
  onReset={onReset}
/>
```

## 布局行为

- 搜索栏是一个两端对齐的 flex 行：`extra` 位于左侧，搜索控件（折叠开关 + 基础字段 + 操作按钮）在一个可收缩、可换行的区域内靠右对齐——过长的工具栏和过窄的容器会优雅降级而不是溢出。在 `sm` 断点以下，搜索栏改为纵向堆叠，控件以全宽靠左对齐。
- 提供 `advancedSearch` 时，会自动在基础字段之前渲染一个高级搜索折叠开关按钮；面板在搜索栏下方展开。启用折叠开关不需要任何额外属性。
- 搜索区域内的字段控件会获得固定宽度以保持视觉节奏：`Input` / `Select` / `TreeSelect` 为 `200px`（包括使用 `allowClear` / `prefix` / `suffix` 的输入框，此时被定宽的是 affix 包装层而非内部输入框），范围选择器为 `360px`。
- 只有当 `basicSearch` 或 `advancedSearch` 存在时，才会渲染搜索和重置按钮。

## API

props 类型以 `ProSearchProps` 导出。

| Prop | Type | Default | 说明 |
|------|------|---------|-------------|
| `className` | `string` | — | CSS 类名 |
| `defaultValues` | `TValues` | — | 搜索初始值 |
| `basicSearch` | `ReactNode` | — | 内联搜索字段 |
| `advancedSearch` | `ReactNode` | — | 可折叠的高级搜索字段；同时启用内置的高级搜索折叠开关 |
| `extra` | `ReactNode` | — | 左侧额外内容 |
| `disabled` | `boolean` | — | 禁用搜索表单 |
| `loading` | `boolean` | — | 搜索按钮的加载状态；等待期间同时禁用表单 |
| `defaultAdvancedSearchVisible` | `boolean` | `false` | 高级搜索的初始可见性（非受控） |
| `advancedSearchVisible` | `boolean` | — | 高级搜索的可见性（受控） |
| `onAdvancedSearchVisibleChange` | `(visible: boolean) => void` | — | 高级搜索可见性变化时调用 |
| `onSearch` | `(values: TValues) => void` | — | 点击搜索按钮时携带当前表单值调用 |
| `onReset` | `(defaultValues?: TValues) => void` | — | 搜索重置时调用（延后一个宏任务，让原生表单重置先传播完成） |
| `searchButtonProps` | `Except<SubmitButtonProps, 'onSubmit' \| 'disabled' \| 'loading'>` | — | 搜索按钮自定义配置 |
| `resetButtonProps` | `Except<ResetButtonProps, 'onReset' \| 'disabled' \| 'loading'> \| false` | — | 重置按钮自定义配置；设为 `false` 可隐藏 |
