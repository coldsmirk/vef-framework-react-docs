---
sidebar_position: 2
title: Components
---

# Components

`@vef-framework-react/components` is the layer most directly used by page code.  
It is not only a re-export of Ant Design. It also adds the theme system, notifications, form integration, permission-aware rendering, icons, and chart support expected in VEF applications.

## Core Entry Points

| Area | Common APIs |
| --- | --- |
| Base UI | `Button`, `Card`, `Tag`, `Text`, `Modal`, `Drawer` |
| Forms | `useForm`, `useFormContext`, `Select`, `TreeSelect`, `Upload` |
| Layout | `Grid`, `Group`, `Stack`, `Flex`, `Center` |
| Tables | `Table`, `usePaginationProps` |
| Permissions | `PermissionGate` |
| Icons | `Icon`, `DynamicIcon` |
| Charts | `Chart`, `useChart` |
| Feedback | `showSuccessMessage`, `showErrorNotification`, and related helpers |

## Why Most Pages Import UI from Here

In VEF projects, pages usually import UI directly from `@vef-framework-react/components` instead of composing multiple third-party libraries manually:

1. the visual system is already aligned with the rest of the framework
2. several components are already integrated with options data, permissions, and icons
3. page code does not need to solve the same integration problem repeatedly

## `createApp()` Already Provides the Theme Shell

When the application is bootstrapped through `starter.createApp().render()`, the required UI containers are already mounted:

- `ConfigProvider`
- `ThemeConfigProvider`
- message and notification holders
- Emotion / css-in-js support

That means page components usually do not need to wrap another global Provider manually.

## Common Page Composition

```tsx
import { Button, Card, Group, Tag, Text } from "@vef-framework-react/components";

export function UserCard() {
  return (
    <Card>
      <Group justify="space-between">
        <Text strong>John Doe</Text>
        <Tag color="success">Active</Tag>
      </Group>

      <Button type="primary">Edit</Button>
    </Card>
  );
}
```

## Choosing Layout Components

| Component | Typical Use |
| --- | --- |
| `Grid` | form layouts and information sections |
| `Group` | horizontal grouping for buttons, tags, or metrics |
| `Stack` | vertical content stacks |
| `Flex` | more flexible page layouts |
| `Center` | centered empty and loading states |

## Feedback APIs

VEF exposes consistent feedback helpers that work well with the framework request layer:

- `showSuccessMessage`
- `showErrorMessage`
- `showWarningMessage`
- `showInfoNotification`
- `showErrorNotification`

## `PermissionGate`

For button-level or section-level permission gating:

```tsx
import { PermissionGate } from "@vef-framework-react/components";

<PermissionGate permTokens="sys:user:create">
  <Button type="primary">Create User</Button>
</PermissionGate>
```

Function children can also be used when rendering depends on the permission result.

## `Icon` and `DynamicIcon`

Use `Icon` when a Lucide icon component is referenced directly in code:

```tsx
import { Icon } from "@vef-framework-react/components";
import { PlusIcon } from "lucide-react";

<Icon component={PlusIcon} />
```

Use `DynamicIcon` when icon names come from configuration or backend data:

```tsx
import { DynamicIcon } from "@vef-framework-react/components";

<DynamicIcon name="users" />
```

## Data-Driven Option Components

If a page uses many selects, tree selects, or cascaders, option transformation is usually better handled through the exported hooks:

- `useDataOptionsSelect`
- `useDataOptionsTreeSelect`
- `useDataOptionsTree`
