---
sidebar_position: 101
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
| `margin` | `boolean` | `false` | Apply `var(--vef-spacing-md)` margin to the container |
| `gap` | `Length` | `var(--vef-spacing-md)` | Gap between grid cells |
| `leftAside` | `ReactNode` | — | Left aside content |
| `leftAsideWidth` | `AsideWidth` | `280` | Fixed width or resizable config |
| `rightAside` | `ReactNode` | — | Right aside content |
| `rightAsideWidth` | `AsideWidth` | `280` | Fixed width or resizable config |
| `header` | `ReactNode` | — | Header content |
| `headerPosition` | `'inside' \| 'outside'` | `'inside'` | `'outside'` spans full width including asides |
| `footer` | `ReactNode` | — | Footer content |
| `footerPosition` | `'inside' \| 'outside'` | `'inside'` | `'outside'` spans full width including asides |
| `actionBar` | `ReactNode` | — | Action bar content |
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
