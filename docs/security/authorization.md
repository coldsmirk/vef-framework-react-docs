---
sidebar_position: 2
title: Authorization
---

# Authorization

Authorization in VEF is built on a simple convention: the application provides `appContext.hasPermission()`, and pages or components consume that capability.

## Providing the Permission Function

```ts
createApp().render({
  appContext: {
    hasPermission(token) {
      return currentPermTokenSet.has(token);
    }
  },
  ...
});
```

## Direct Permission Checks

### `useCheckPermission`

```tsx
const checkPermission = useCheckPermission();

if (checkPermission("sys:user:create")) {
  // ...
}
```

### `useIsAuthorized`

```tsx
const canEdit = useIsAuthorized(["sys:user:update", "sys:user:write"], "any");
```

## Component-Level Permission Control

```tsx
import { PermissionGate } from "@vef-framework-react/components";

<PermissionGate permTokens="sys:user:create">
  <Button type="primary">Create User</Button>
</PermissionGate>
```

## Filtering Config Items

When menus, button configs, or action lists are declared first and filtered later, `useAuthorizedItems()` is often the best fit:

```tsx
const actions = useAuthorizedItems([
  { key: "create", permTokens: "sys:user:create" },
  { key: "delete", permTokens: "sys:user:delete" }
]);
```

## `checkMode`

Permission checks support:

- `any`: at least one token matches
- `all`: all tokens must match

This is useful when permissions are combined.

## Recommended Usage

- let page code consume permissions instead of maintaining a second permission source
- use `PermissionGate` for fine-grained button or section gating
- use `useAuthorizedItems()` for configuration-array filtering
