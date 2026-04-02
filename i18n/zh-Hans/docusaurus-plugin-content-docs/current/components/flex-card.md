---
sidebar_position: 107
---

# FlexCard

`Card` 的语义化包装，用于分栏卡片和树形表格页面布局。

> **VEF 专属组件。** 在 v2.1.6 中从 `@vef-framework-react/starter` 迁移到 `@vef-framework-react/components`。

## 适用场景

- 树形表格布局中的左侧树形面板。
- 任何需要在 flex 容器中填充可用高度的卡片。

## 基础用法

```tsx
import { FlexCard, Page } from '@vef-framework-react/components';

export default function UserPage() {
  return (
    <Page leftAside={
      <FlexCard title="部门">
        <DeptTree />
      </FlexCard>
    }>
      <UserTable />
    </Page>
  );
}
```

## API

`FlexCard` 接受 Ant Design 的所有 `CardProps`。参见 [Ant Design Card](https://ant.design/components/card/)。
