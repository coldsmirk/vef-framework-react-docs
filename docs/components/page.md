---
title: "Page"
description: "The primary container for business pages. Supports left/right aside panels, header, footer, action bar, and scrollable content."
---

# Page

The primary container for business pages. Supports left/right aside panels, header, footer, action bar, and scrollable content.

> **VEF-specific component.** Not part of Ant Design. Moved from `@vef-framework-react/starter` to `@vef-framework-react/components` in v2.1.6.

## When to Use

- Any standard business page that needs a consistent layout shell.
- Pages with a left-side tree and right-side content area.
- Pages that need a sticky header or footer.

## Basic Usage

```tsx
import { Page } from '@vef-framework-react/components';

export default function UserPage() {
  return (
    <Page>
      <div>Main content</div>
    </Page>
  );
}
```

## With Left Aside

```tsx
import { Page } from '@vef-framework-react/components';

export default function UserPage() {
  return (
    <Page
      leftAside={<DeptTree />}
      leftAsideWidth={260}
    >
      <UserTable />
    </Page>
  );
}
```

## Resizable Aside

```tsx
<Page
  leftAside={<DeptTree />}
  leftAsideWidth={{ defaultWidth: 260, minWidth: 180, maxWidth: 400 }}
>
  <UserTable />
</Page>
```

## With Header and Footer

```tsx
<Page
  header={<PageTitle>Users</PageTitle>}
  headerPosition="outside"
  footer={<StatusBar />}
  footerPosition="inside"
>
  <UserTable />
</Page>
```

## API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | — | Class name for the page container |
| `margin` | `boolean` | `false` | Apply `var(--vef-spacing-md)` margin to the container |
| `gap` | `Length` | `var(--vef-spacing-sm)` | Gap between grid cells |
| `mainClassName` | `string` | — | Class name for the main content area |
| `leftAside` | `ReactNode` | — | Left aside content |
| `leftAsideClassName` | `string` | — | Class name for the left aside |
| `leftAsideWidth` | `AsideWidth` | `280` | Fixed width or resizable config |
| `rightAside` | `ReactNode` | — | Right aside content |
| `rightAsideClassName` | `string` | — | Class name for the right aside |
| `rightAsideWidth` | `AsideWidth` | `280` | Fixed width or resizable config |
| `header` | `ReactNode` | — | Header content |
| `headerClassName` | `string` | — | Class name for the header |
| `headerPosition` | `'inside' \| 'outside'` | `'inside'` | `'outside'` spans full width including asides |
| `footer` | `ReactNode` | — | Footer content |
| `footerClassName` | `string` | — | Class name for the footer |
| `footerPosition` | `'inside' \| 'outside'` | `'inside'` | `'outside'` spans full width including asides |
| `actionBar` | `ReactNode` | — | Action bar content |
| `actionBarClassName` | `string` | — | Class name for the action bar |
| `scrollable` | `boolean` | — | Whether main content is scrollable |
| `scrollMargin` | `boolean` | `false` | Auto margin for scrollbar spacing (requires `scrollable`) |

### `AsideWidth`

```ts
type AsideWidth = string | number | {
  defaultWidth?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
};
```

### `useViewportHeight`

A hook exported alongside `Page` for calculating available viewport height:

```ts
import { useViewportHeight } from '@vef-framework-react/components';

const height = useViewportHeight();
```

> `useViewportHeight` throws if called outside a `<Page scrollable>` — it reads a context value that only `Page` provides, and only when `scrollable` is `true`.

### Entrance Hooks

`Page` plays an entrance animation on mount and exposes "the page has finished arriving" as a signal. Secondary motion, auto-focus, guided hints, or deferred heavy initialization can key off it so they start after the entrance instead of competing with it:

| Export | Type | Description |
|--------|------|-------------|
| `usePageEntranceEffect` | `(effect: () => void \| (() => void)) => void` | Runs `effect` once the hosting `Page`'s entrance has settled — immediately when already settled (including outside a `Page`). Causes zero re-renders. The cleanup runs on unmount, and the effect re-arms if a page reload replays the entrance |
| `usePageEntranceSettled` | `() => boolean` | Whether the entrance has finished (immediately `true` outside a `Page`). Subscribes the component — it re-renders once when the entrance settles. Use when the settled state drives rendering |
| `PageEntranceStore` | `{ isSettled(): boolean; subscribe(listener): () => void }` | The underlying store type carried by the context |

CSS can also target the `Page` root's `data-entrance` attribute directly.

```tsx
usePageEntranceEffect(() => {
  chart.startEntranceSequence();
});
```
