---
sidebar_position: 11
---

# Grid

A responsive auto-fill grid layout with optional collapse/expand support.

> **VEF-specific component.** Not part of Ant Design.

## When to Use

- Form layouts with multiple fields per row that should adapt to screen width.
- Card grids or dashboard panels.
- Search filter areas that can be collapsed to show fewer rows.

## Basic Usage

```tsx
import { Grid } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <Grid baseWidth={200} gap="middle">
      <div>Item 1</div>
      <div>Item 2</div>
      <div>Item 3</div>
      <div>Item 4</div>
    </Grid>
  );
}
```

`baseWidth` sets the minimum column width. The grid automatically calculates how many columns fit in the container.

## Grid.Item with Span

```tsx
import { Grid } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <Grid baseWidth={200} gap="middle">
      <Grid.Item span={2}>Wide item (spans 2 columns)</Grid.Item>
      <div>Normal item</div>
      <div>Normal item</div>
    </Grid>
  );
}
```

## Collapsible Grid (Search Filters)

```tsx
import { Grid, Button } from '@vef-framework-react/components';
import { useGridCollapsed } from '@vef-framework-react/components';

export default function SearchForm() {
  const [collapsed, setCollapsed] = useGridCollapsed(false);

  return (
    <>
      <Grid
        baseWidth={240}
        gap="middle"
        isCollapsed={collapsed}
        collapsedRows={1}
        onCollapseChange={setCollapsed}
      >
        <div>Filter 1</div>
        <div>Filter 2</div>
        <div>Filter 3</div>
        <div>Filter 4</div>
        <div>Filter 5</div>
        <Grid.Item suffix>
          <Button onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? 'Expand' : 'Collapse'}
          </Button>
        </Grid.Item>
      </Grid>
    </>
  );
}
```

## Responsive Span

```tsx
<Grid baseWidth={200} gap="small">
  <Grid.Item span={{ xs: 1, md: 2, lg: 3 }}>
    Responsive span
  </Grid.Item>
</Grid>
```

## API

### GridProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `baseWidth` | `number` | — | Minimum column width in pixels |
| `gap` | `FullSize \| number` | `0` | Gap between both rows and columns |
| `columnGap` | `FullSize \| number` | `0` | Gap between columns |
| `rowGap` | `FullSize \| number` | `0` | Gap between rows |
| `defaultIsCollapsed` | `boolean` | `false` | Initial collapsed state |
| `isCollapsed` | `boolean` | `false` | Controlled collapsed state |
| `collapsedRows` | `number` | `1` | Number of rows shown when collapsed |
| `onCollapseChange` | `(isCollapsed: boolean) => void` | — | Collapse state change callback |

`FullSize` values: `'mini' | 'small' | 'middle' | 'large' | 'xlarge'`

### GridItemProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `span` | `number \| Partial<Record<Breakpoint, number>>` | `1` | Column span |
| `offset` | `number \| Partial<Record<Breakpoint, number>>` | `0` | Column offset |
| `suffix` | `boolean` | `false` | Align item to the end of the row |

### `useGridCollapsed`

```tsx
const [isCollapsed, setIsCollapsed] = useGridCollapsed(false);
```

A simple state hook for managing grid collapse state.

## Best Practices

- Use `Grid` instead of Ant Design's `Row`/`Col` for form filter areas — it handles responsive column count automatically.
- Place action buttons (search, reset) in a `Grid.Item` with `suffix` to align them to the right.
- Use `collapsedRows={1}` with `isCollapsed` for search forms that have many filters.
