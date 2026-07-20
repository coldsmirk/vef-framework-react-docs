---
title: Permissions
description: The permission model shared by route guards, PermissionGate, and the imperative permission-check hooks.
---

# Permissions

Authorization in VEF is built on a simple convention: the application provides `appContext.hasPermission()`, and pages, routes, and components consume that capability through a small set of shared primitives. Page-level access and button-level access are deliberately kept separate — this page covers both halves of that model.

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

Every permission check in the framework — route guards, `PermissionGate`, and the hooks below — ultimately calls this function.

## `checkMode`

Anywhere a check accepts more than one permission token, it also accepts a `checkMode`:

- `"any"` (default): at least one token matches
- `"all"`: all tokens must match

## Page-Level Access: Route Guards

VEF does not encourage handwritten `beforeLoad` permission logic on every page. Guard responsibilities are centralized in `createLayoutRouteOptions()` (see [Routing & Layout](./routing.md)), which:

1. redirects unauthenticated users to login
2. fetches user information and the menu tree
3. builds menu-path mappings
4. checks whether the current path belongs to the authorized menu set
5. redirects unauthorized paths to `/access-denied`

In admin applications, route access is usually determined by a combination of current user info, the menu tree, permission tokens, and authentication state. Distributing those checks across page files tends to make maintenance harder over time — keep authentication and menu guards in the layout route, and keep business pages focused on page behavior.

## Button- and Section-Level Access: `PermissionGate`

```tsx
import { PermissionGate } from "@vef-framework-react/components";

<PermissionGate requiredPermissions="sys:user:create">
  <Button type="primary">Create User</Button>
</PermissionGate>
```

`PermissionGate` also accepts a function child when rendering (rather than hiding) should depend on the permission result:

```tsx
<PermissionGate requiredPermissions="sys:user:create">
  {hasPermission => <Button disabled={!hasPermission}>Create User</Button>}
</PermissionGate>
```

Avoid mixing the two levels: page-level access belongs in route guards, button-level access belongs in `PermissionGate`.

## Imperative Permission Checks

### `useCheckPermission`

Returns a reusable function for checks inside event handlers or derived logic:

```tsx
const checkPermission = useCheckPermission();

if (checkPermission("sys:user:create")) {
  // ...
}
```

### `useIsAuthorized`

Evaluates a permission condition directly during render:

```tsx
const canEdit = useIsAuthorized(["sys:user:update", "sys:user:write"], "any");
```

## Filtering Config Arrays: `useAuthorizedItems`

Menus, button configs, and action lists are often declared first and filtered later. `useAuthorizedItems()` filters an array of items that each carry `requiredPermissions` (and an optional `checkMode`):

```tsx
const visibleActions = useAuthorizedItems([
  { key: "create", requiredPermissions: "sys:user:create" },
  { key: "delete", requiredPermissions: "sys:user:delete" }
]);
```

## Engine Pages Ship Their Own Permission Codes

The engine-page packages come with their backend permission codes as exported collections, mirroring the backend `RequiredPermission` strings verbatim:

- `APPROVAL_PERMISSIONS` from `@vef-framework-react/approval`
- `INTEGRATION_PERMISSIONS` from `@vef-framework-react/integration`
- `CRON_PERMISSIONS` from `@vef-framework-react/cron`

Each collection is nested by resource (`APPROVAL_PERMISSIONS.flow.publish` is `"approval.flow.publish"`, `CRON_PERMISSIONS.schedule.manage` is `"cron.schedule.manage"`, and so on). Every engine management page defaults its permission gates to the matching entries and accepts overrides through its `permissions` prop — so a host that maps engine permissions onto its own token scheme overrides per page instead of forking the pages. Provision the codes on the backend and, where host UI composes around engine pages, reuse the same constants in `PermissionGate` / `useAuthorizedItems` rather than repeating the strings. See [Engines Overview](../engines/overview.md) for the engine packages themselves.

## Recommended Usage

- let page code consume permissions instead of maintaining a second permission source
- use `PermissionGate` for fine-grained button or section gating
- use `useAuthorizedItems()` for configuration-array filtering
- keep authentication and menu guards in the layout route, not scattered across pages
