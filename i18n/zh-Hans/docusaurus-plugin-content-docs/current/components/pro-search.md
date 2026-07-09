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

```tsx
import { ProSearch } from '@vef-framework-react/components';

interface UserSearch {
  name?: string;
  status?: string;
}

export default function UserSearchBar({ onSearch }) {
  return (
    <ProSearch<UserSearch>
      basicSearch={
        <>
          <Input placeholder="Name" />
          <Select placeholder="Status" />
        </>
      }
      onSearch={onSearch}
    />
  );
}
```

## 带高级搜索

```tsx
<ProSearch<UserSearch>
  basicSearch={<Input placeholder="Name" />}
  advancedSearch={
    <>
      <DatePicker placeholder="Created after" />
      <Select placeholder="Department" />
    </>
  }
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
