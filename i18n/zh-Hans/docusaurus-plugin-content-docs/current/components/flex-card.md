---
title: "FlexCard"
description: "用于分栏卡片和树形表格页面布局的 `Card` 语义化封装。"
---

# FlexCard

用于分栏卡片和树形表格页面布局的 `Card` 语义化封装。

> **VEF 专属组件。** 已在 v2.1.6 中从 `@vef-framework-react/starter` 迁移至 `@vef-framework-react/components`。

## 何时使用

- 树形表格布局中的左侧树形面板。
- 任何需要在 flex 容器中填充可用高度的卡片。

## 基础用法

```tsx
import { FlexCard, Page } from '@vef-framework-react/components';

export default function UserPage() {
  return (
    <Page leftAside={
      <FlexCard title="Departments">
        <DeptTree />
      </FlexCard>
    }>
      <UserTable />
    </Page>
  );
}
```

## API

props 类型以 `FlexCardProps` 导出。

`FlexCard` 接受 Ant Design 的所有 `CardProps`。参见 [Ant Design Card](https://ant.design/components/card/)。
