---
sidebar_position: 107
---

# FlexCard

A semantic wrapper around `Card` for split-card and tree-table page layouts.

> **VEF-specific component.** Moved from `@vef-framework-react/starter` to `@vef-framework-react/components` in v2.1.6.

## When to Use

- Left-side tree panel in a tree-table layout.
- Any card that needs to fill available height in a flex container.

## Basic Usage

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

`FlexCard` accepts all `CardProps` from Ant Design. See [Ant Design Card](https://ant.design/components/card/).
