---
title: "Grid"
description: "支持可选折叠/展开功能的响应式自动填充网格布局。"
---

# Grid

支持可选折叠/展开功能的响应式自动填充网格布局。

> **VEF 专属组件。** 不属于 Ant Design 的一部分。

## 何时使用

- 每行含多个字段、需要根据屏幕宽度自适应的表单布局。
- 卡片网格或仪表盘面板。
- 可折叠以显示更少行数的搜索筛选区域。

## 基础用法

```tsx
import { Grid } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <Grid baseWidth={200} gap="medium">
      <div>Item 1</div>
      <div>Item 2</div>
      <div>Item 3</div>
      <div>Item 4</div>
    </Grid>
  );
}
```

`baseWidth` 用于设置最小列宽，网格会自动计算容器内可容纳的列数。

## 带 Span 的 Grid.Item

```tsx
import { Grid } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <Grid baseWidth={200} gap="medium">
      <Grid.Item span={2}>Wide item (spans 2 columns)</Grid.Item>
      <div>Normal item</div>
      <div>Normal item</div>
    </Grid>
  );
}
```

## 可折叠网格（搜索筛选）

`useGridCollapsed` 从最近的 `<Grid>` context 中读取折叠状态，因此必须在渲染于 `<Grid>` 内部的组件中调用——如果没有 `<Grid>` 祖先节点，会抛出异常。

```tsx
import { Grid, Button } from '@vef-framework-react/components';
import { useGridCollapsed } from '@vef-framework-react/components';

function CollapseToggle() {
  const { isCollapsed, setCollapsed } = useGridCollapsed();

  return (
    <Button onClick={() => setCollapsed(!isCollapsed)}>
      {isCollapsed ? 'Expand' : 'Collapse'}
    </Button>
  );
}

export default function SearchForm() {
  return (
    <Grid
      baseWidth={240}
      gap="medium"
      defaultIsCollapsed
      collapsedRows={1}
    >
      <div>Filter 1</div>
      <div>Filter 2</div>
      <div>Filter 3</div>
      <div>Filter 4</div>
      <div>Filter 5</div>
      <Grid.Item suffix>
        <CollapseToggle />
      </Grid.Item>
    </Grid>
  );
}
```

## 响应式 Span

```tsx
<Grid baseWidth={200} gap="small">
  <Grid.Item span={{ xs: 1, md: 2, lg: 3 }}>
    Responsive span
  </Grid.Item>
</Grid>
```

## API

### GridProps

| Prop | Type | Default | 说明 |
|------|------|---------|-------------|
| `baseWidth` | `number` | — | 以像素为单位的最小列宽 |
| `gap` | `FullSize \| number` | `0` | 行与列之间的间距 |
| `columnGap` | `FullSize \| number` | `0` | 列间距 |
| `rowGap` | `FullSize \| number` | `0` | 行间距 |
| `defaultIsCollapsed` | `boolean` | `false` | 初始折叠状态 |
| `isCollapsed` | `boolean` | `false` | 受控折叠状态 |
| `collapsedRows` | `number` | `1` | 折叠时显示的行数 |
| `onCollapseChange` | `(isCollapsed: boolean) => void` | — | 折叠状态变化回调 |

`FullSize` 可选值：`'extra-small' | 'small' | 'medium' | 'large' | 'extra-large'`

### GridItemProps

| Prop | Type | Default | 说明 |
|------|------|---------|-------------|
| `span` | `number \| Partial<Record<Breakpoint, number>>` | `1` | 跨列数 |
| `offset` | `number \| Partial<Record<Breakpoint, number>>` | `0` | 列偏移量 |
| `suffix` | `boolean` | `false` | 将项目对齐到行尾 |

### `useGridCollapsed`

```tsx
const { isCollapsed, setCollapsed } = useGridCollapsed();
```

不接受任何参数。从最近的 `<Grid>` context 中读取 `{ isCollapsed, setCollapsed }`——必须在渲染于 `<Grid>` 内部的组件中调用，如果没有 `<Grid>` 祖先节点，会抛出异常。

## 最佳实践

- 表单筛选区域请使用 `Grid` 代替 Ant Design 的 `Row`/`Col`——它会自动处理响应式列数。
- 将操作按钮（搜索、重置）放入带 `suffix` 的 `Grid.Item` 中，使其右对齐。
- 对于筛选项较多的搜索表单，可结合 `isCollapsed` 使用 `collapsedRows={1}` 实现折叠。
