---
title: "ActionGroup"
description: "Renders a group of action buttons from a declarative configuration array. Supports context-aware button visibility and permission checks."
---

# ActionGroup

Renders a group of action buttons from a declarative configuration array. Supports context-aware button visibility and permission checks.

> **VEF-specific component.** Not part of Ant Design.

## When to Use

- Table row action columns where buttons vary per row.
- Toolbars with a consistent set of operations.
- Any place where you want to define buttons as data rather than JSX.

## Basic Usage

```tsx
import { ActionGroup } from '@vef-framework-react/components';
import type { ActionButtonConfig } from '@vef-framework-react/components';

const buttons: ActionButtonConfig[] = [
  {
    key: 'edit',
    label: 'Edit',
    onClick: async () => { await openEditModal(); },
  },
  {
    key: 'delete',
    label: 'Delete',
    color: 'danger',
    confirmable: true,
    confirmTitle: 'Delete Record',
    confirmDescription: 'This cannot be undone.',
    onClick: async () => { await deleteRecord(); },
  },
];

export default function Demo() {
  return <ActionGroup buttons={buttons} />;
}
```

## Context-aware Buttons

Pass a `context` prop (e.g. a table row record) to make button configs context-aware:

```tsx
import { ActionGroup } from '@vef-framework-react/components';
import type { ActionButtonConfig } from '@vef-framework-react/components';

interface User {
  id: number;
  status: 'active' | 'inactive';
}

const buttons: ActionButtonConfig<User>[] = [
  {
    key: 'edit',
    label: 'Edit',
    onClick: async (ctx) => { await editUser(ctx.id); },
  },
  {
    key: 'activate',
    label: 'Activate',
    hidden: (ctx) => ctx.status === 'active',
    onClick: async (ctx) => { await activateUser(ctx.id); },
  },
  {
    key: 'deactivate',
    label: 'Deactivate',
    hidden: (ctx) => ctx.status === 'inactive',
    color: 'danger',
    onClick: async (ctx) => { await deactivateUser(ctx.id); },
  },
];

// In a table column render:
{
  title: 'Actions',
  render: (_, record) => (
    <ActionGroup<User> buttons={buttons} context={record} />
  ),
}
```

## Custom Wrapper

```tsx
<ActionGroup
  buttons={buttons}
  renderWrapper={(buttonsNode) => (
    <div style={{ display: 'flex', gap: 4 }}>
      {buttonsNode}
    </div>
  )}
/>
```

## API

### ActionGroupProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `buttons` | `ActionButtonConfig<TContext>[]` | required | Button configuration array |
| `size` | `'large' \| 'medium' \| 'small'` | — | Size applied to all buttons (`'middle'` is a deprecated alias for `'medium'`) |
| `context` | `TContext` | — | Context value passed to button callbacks |
| `renderWrapper` | `(buttonsNode: ReactNode) => ReactNode` | — | Custom wrapper renderer |

### ActionButtonConfig

Fields marked *computed* accept either a static value or a `(context: TContext) => value` function; the function form is only available when a context type is given.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `key` | `string` | required | Unique key |
| `label` | `string` | required | Button label; also interpolated into the default confirm description |
| `color` | `ButtonColor` | — | Button color (e.g. `'primary'`, `'danger'`), forwarded to the underlying `ActionButton` |
| `variant` | `ButtonVariant` | — | Button variant (e.g. `'solid'`, `'outlined'`, `'filled'`, `'text'`, `'link'`), forwarded to the underlying `ActionButton` |
| `icon` | `ReactNode` | — | Button icon |
| `disabled` | `boolean \| (ctx: TContext) => boolean` | `false` | Disable condition (*computed*) |
| `hidden` | `boolean \| (ctx: TContext) => boolean` | `false` | Hide condition (*computed*) |
| `confirmable` | `boolean \| (ctx: TContext) => boolean` | `false` | Require confirmation (*computed*) |
| `confirmMode` | `'popover' \| 'dialog'` or `(ctx) => ...` | `'popover'` | Confirm UI style (*computed*) |
| `confirmTitle` | `ReactNode` or `(ctx) => ReactNode` | `'确认提示'` | Confirm title (*computed*) |
| `confirmDescription` | `ReactNode` or `(ctx) => ReactNode` | `` `确定要${label}吗？` `` | Confirm description (*computed*) |
| `requiredPermissions` | `string[]` | — | Permission tokens; buttons failing the check are filtered out |
| `checkMode` | `'any' \| 'all'` | `'any'` | Permission check mode |
| `onClick` | `(context: TContext) => Awaitable<void>` | required | Click handler; receives the group's `context` (no argument when no context type is given) |

## Best Practices

- Define button configs outside the component to avoid re-creation on each render.
- Use `hidden` (not `disabled`) to remove buttons that don't apply to a record.
- Use `requiredPermissions` to automatically hide buttons the user lacks permission for.
