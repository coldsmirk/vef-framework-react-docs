---
sidebar_position: 9
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
    danger: true,
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
    danger: true,
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
| `size` | `'large' \| 'middle' \| 'small'` | — | Size applied to all buttons |
| `context` | `TContext` | — | Context value passed to button callbacks |
| `renderWrapper` | `(buttonsNode: ReactNode) => ReactNode` | — | Custom wrapper renderer |

### ActionButtonConfig

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `key` | `string` | required | Unique key |
| `label` | `ReactNode` | — | Button label |
| `type` | `ButtonType` | — | Button type |
| `danger` | `boolean` | `false` | Danger style |
| `disabled` | `boolean \| (ctx) => boolean` | `false` | Disable condition |
| `hidden` | `boolean \| (ctx) => boolean` | `false` | Hide condition |
| `confirmable` | `boolean` | `false` | Require confirmation |
| `confirmMode` | `'popover' \| 'dialog'` | `'popover'` | Confirm UI style |
| `confirmTitle` | `ReactNode` | — | Confirm title |
| `confirmDescription` | `ReactNode` | — | Confirm description |
| `permTokens` | `string \| string[]` | — | Required permission tokens |
| `checkMode` | `'any' \| 'all'` | `'any'` | Permission check mode |
| `onClick` | `(ctx?: TContext) => Awaitable<void>` | — | Click handler |
| `icon` | `ReactNode` | — | Button icon |

## Best Practices

- Define button configs outside the component to avoid re-creation on each render.
- Use `hidden` (not `disabled`) to remove buttons that don't apply to a record.
- Use `permTokens` to automatically hide buttons the user lacks permission for.
