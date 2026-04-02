---
sidebar_position: 104
---

# ProSearch

带基础搜索区域、可折叠高级搜索面板和搜索/重置操作的搜索表单容器。

> **VEF 专属组件。** 在 v2.1.6 中从 `@vef-framework-react/starter` 迁移到 `@vef-framework-react/components`。

## 适用场景

- 表格上方的搜索栏，支持可选的高级筛选面板。
- 需要统一搜索/重置按钮行为的任何搜索区域。

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
          <Input placeholder="姓名" />
          <Select placeholder="状态" />
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
  basicSearch={<Input placeholder="姓名" />}
  advancedSearch={
    <>
      <DatePicker placeholder="创建时间" />
      <Select placeholder="部门" />
    </>
  }
  onSearch={onSearch}
  onReset={onReset}
/>
```

## API

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `defaultValues` | `TValues` | — | 搜索初始值 |
| `basicSearch` | `ReactNode` | — | 内联搜索字段 |
| `advancedSearch` | `ReactNode` | — | 可折叠高级搜索字段 |
| `extra` | `ReactNode` | — | 左侧额外内容 |
| `disabled` | `boolean` | — | 禁用搜索表单 |
| `loading` | `boolean` | — | 搜索按钮加载状态 |
| `defaultAdvancedSearchVisible` | `boolean` | — | 高级搜索初始可见性（非受控） |
| `advancedSearchVisible` | `boolean` | — | 高级搜索可见性（受控） |
| `onAdvancedSearchVisibleChange` | `(visible: boolean) => void` | — | 高级搜索可见性变化回调 |
| `onSearch` | `(values: TValues) => void` | — | 提交搜索时回调 |
| `onReset` | `(defaultValues?) => void` | — | 重置搜索时回调 |
| `searchButtonProps` | `SubmitButtonProps` | — | 搜索按钮自定义 |
| `resetButtonProps` | `ResetButtonProps \| false` | — | 重置按钮自定义；`false` 隐藏 |
