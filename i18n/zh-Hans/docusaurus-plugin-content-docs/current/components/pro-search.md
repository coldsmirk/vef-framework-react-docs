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
        {(field) => <field.Input noWrapper placeholder="关键词" />}
      </AppField>
      <AppField name="status">
        {(field) => <field.Select noWrapper placeholder="状态" options={STATUS_OPTIONS} />}
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
        {(field) => <field.DatePicker noWrapper placeholder="创建时间晚于" />}
      </AppField>
      <AppField name="department">
        {(field) => <field.Select noWrapper placeholder="部门" options={DEPARTMENT_OPTIONS} />}
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

## API

| Prop | Type | Default | 说明 |
|------|------|---------|-------------|
| `className` | `string` | — | CSS 类名 |
| `defaultValues` | `TValues` | — | 搜索初始值 |
| `basicSearch` | `ReactNode` | — | 内联搜索字段 |
| `advancedSearch` | `ReactNode` | — | 可折叠的高级搜索字段 |
| `extra` | `ReactNode` | — | 左侧额外内容 |
| `disabled` | `boolean` | — | 禁用搜索表单 |
| `loading` | `boolean` | — | 搜索按钮的加载状态 |
| `defaultAdvancedSearchVisible` | `boolean` | — | 高级搜索的初始可见性（非受控） |
| `advancedSearchVisible` | `boolean` | — | 高级搜索的可见性（受控） |
| `onAdvancedSearchVisibleChange` | `(visible: boolean) => void` | — | 高级搜索可见性变化时调用 |
| `onSearch` | `(values: TValues) => void` | — | 搜索提交时调用 |
| `onReset` | `(defaultValues?) => void` | — | 搜索重置时调用 |
| `searchButtonProps` | `Except<SubmitButtonProps, 'onSubmit' \| 'disabled' \| 'loading'>` | — | 搜索按钮自定义配置 |
| `resetButtonProps` | `Except<ResetButtonProps, 'onReset' \| 'disabled' \| 'loading'> \| false` | — | 重置按钮自定义配置；设为 `false` 可隐藏 |
