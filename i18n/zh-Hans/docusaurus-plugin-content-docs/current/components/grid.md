---
sidebar_position: 11
---

# Grid 网格

支持折叠/展开的响应式自动填充网格布局。

> **VEF 特有组件**，不属于 Ant Design。

## 何时使用

- 多字段表单布局，需要根据屏幕宽度自适应每行列数。
- 卡片网格或仪表盘面板。
- 可折叠的搜索筛选区域。

## 基础用法

```tsx
import { Grid } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <Grid baseWidth={200} gap="middle">
      <div>项目 1</div>
      <div>项目 2</div>
      <div>项目 3</div>
      <div>项目 4</div>
    </Grid>
  );
}
```

`baseWidth` 设置最小列宽，网格自动计算容器内可容纳的列数。

## Grid.Item 跨列

```tsx
import { Grid } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <Grid baseWidth={200} gap="middle">
      <Grid.Item span={2}>宽项目（跨 2 列）</Grid.Item>
      <div>普通项目</div>
      <div>普通项目</div>
    </Grid>
  );
}
```

## 可折叠网格（搜索筛选）

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
        <div>筛选项 1</div>
        <div>筛选项 2</div>
        <div>筛选项 3</div>
        <div>筛选项 4</div>
        <div>筛选项 5</div>
        <Grid.Item suffix>
          <Button onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? '展开' : '收起'}
          </Button>
        </Grid.Item>
      </Grid>
    </>
  );
}
```

## 响应式跨列

```tsx
<Grid baseWidth={200} gap="small">
  <Grid.Item span={{ xs: 1, md: 2, lg: 3 }}>
    响应式跨列
  </Grid.Item>
</Grid>
```

## API

### GridProps

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `baseWidth` | `number` | — | 最小列宽（像素） |
| `gap` | `FullSize \| number` | `0` | 行列间距 |
| `columnGap` | `FullSize \| number` | `0` | 列间距 |
| `rowGap` | `FullSize \| number` | `0` | 行间距 |
| `defaultIsCollapsed` | `boolean` | `false` | 初始折叠状态 |
| `isCollapsed` | `boolean` | `false` | 受控折叠状态 |
| `collapsedRows` | `number` | `1` | 折叠时显示的行数 |
| `onCollapseChange` | `(isCollapsed: boolean) => void` | — | 折叠状态变化回调 |

`FullSize` 可选值：`'mini' | 'small' | 'middle' | 'large' | 'xlarge'`

### GridItemProps

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `span` | `number \| Partial<Record<Breakpoint, number>>` | `1` | 跨列数 |
| `offset` | `number \| Partial<Record<Breakpoint, number>>` | `0` | 偏移列数 |
| `suffix` | `boolean` | `false` | 将项目对齐到行尾 |

### `useGridCollapsed`

```tsx
const [isCollapsed, setIsCollapsed] = useGridCollapsed(false);
```

管理网格折叠状态的简单状态 Hook。

## 最佳实践

- 表单筛选区域使用 `Grid` 代替 Ant Design 的 `Row`/`Col`，自动处理响应式列数。
- 将操作按钮（搜索、重置）放在带 `suffix` 的 `Grid.Item` 中，使其右对齐。
- 筛选项较多时使用 `collapsedRows={1}` 配合 `isCollapsed` 实现折叠搜索表单。
