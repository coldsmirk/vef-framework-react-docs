---
sidebar_position: 16
---

# PermissionGate

Conditionally renders content based on the current user's permissions.

> **VEF-specific component.** Not part of Ant Design.

## When to Use

- Show or hide UI elements based on permission tokens.
- Render different content for users with and without a specific permission.

## Basic Usage

```tsx
import { PermissionGate } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <PermissionGate permTokens="user:create">
      <Button type="primary">Create User</Button>
    </PermissionGate>
  );
}
```

If the user does not have the `user:create` permission, nothing is rendered.

## Multiple Permissions (Any)

```tsx
<PermissionGate permTokens={['user:edit', 'user:admin']} checkMode="any">
  <Button>Edit</Button>
</PermissionGate>
```

Renders if the user has **any** of the listed permissions.

## Multiple Permissions (All)

```tsx
<PermissionGate permTokens={['report:view', 'report:export']} checkMode="all">
  <Button>Export Report</Button>
</PermissionGate>
```

Renders only if the user has **all** listed permissions.

## Render Prop Pattern

```tsx
<PermissionGate permTokens="admin:access">
  {(hasPermission) => (
    <Button disabled={!hasPermission}>
      Admin Panel
    </Button>
  )}
</PermissionGate>
```

Use the render prop to conditionally disable (rather than hide) elements.

## API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `permTokens` | `string \| string[]` | — | Permission token(s) to check |
| `checkMode` | `'any' \| 'all'` | `'any'` | How multiple tokens are evaluated |
| `children` | `ReactNode \| (hasPermission: boolean) => ReactNode` | — | Content to render |

## How Permissions Are Resolved

`PermissionGate` reads the current user's permission list from the VEF core permission store (set up via `@vef-framework-react/core`). Permission tokens are arbitrary strings defined by your application.

## Best Practices

- Use `PermissionGate` to hide entire UI sections, not just individual buttons.
- For buttons that also need async loading and confirm dialogs, use `OperationButton` which combines `ActionButton` + `PermissionGate`.
- Keep permission token names consistent across frontend and backend (e.g. `resource:action` format).
