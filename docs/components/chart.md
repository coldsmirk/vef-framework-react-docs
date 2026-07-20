---
title: "Chart"
description: "An ECharts wrapper component with React integration, theme support, and chart linking."
---

# Chart

An ECharts wrapper component with React integration, theme support, and chart linking.

> **VEF-specific component.** Wraps [Apache ECharts](https://echarts.apache.org/) directly (no `echarts-for-react`) with a React lifecycle-safe `useChart` hook.

## When to Use

- Render any ECharts chart (line, bar, pie, scatter, etc.) in a React component.
- Link multiple charts to synchronize tooltips and data zoom.

## Basic Usage

```tsx
import { Chart } from '@vef-framework-react/components';
import type { ChartOption } from '@vef-framework-react/components';

const option: ChartOption = {
  xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
  yAxis: { type: 'value' },
  series: [{ type: 'bar', data: [120, 200, 150, 80, 70] }],
};

export default function Demo() {
  return <Chart option={option} style={{ height: 300 }} />;
}
```

## With Theme

```tsx
<Chart
  option={option}
  theme="walden"
  style={{ height: 300 }}
/>
```

Built-in themes: `"walden"`, `"wonderland"`. You can also pass a custom ECharts theme object.

When the app is in dark mode (via [`ConfigProvider`](./config-provider.md)), a built-in theme name automatically switches to its dark variant (`walden-dark` / `wonderland-dark`) — and back — on the live chart instance. Custom theme objects are used as-is.

## Loading State

```tsx
<Chart option={option} loading={isLoading} style={{ height: 300 }} />
```

## Using `useChart` Hook

For imperative access to the ECharts instance:

```tsx
import { useChart } from '@vef-framework-react/components';
import type { ChartOption } from '@vef-framework-react/components';

const option: ChartOption = { /* ... */ };

export default function Demo() {
  const ref = useChart({
    option,
    onReady: (chart) => {
      chart.on('click', (params) => console.log(params));
    },
  });

  return <div ref={ref} style={{ height: 300 }} />;
}
```

## Linked Charts

```tsx
import { Chart, connectCharts, disconnectCharts } from '@vef-framework-react/components';
import { useEffect } from 'react';

export default function Demo() {
  useEffect(() => {
    connectCharts('dashboard-group');
    return () => disconnectCharts('dashboard-group');
  }, []);

  return (
    <>
      <Chart option={option1} group="dashboard-group" style={{ height: 200 }} />
      <Chart option={option2} group="dashboard-group" style={{ height: 200 }} />
    </>
  );
}
```

## API

### ChartProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `option` | `EChartsOption` | required | ECharts option configuration |
| `theme` | `'walden' \| 'wonderland' \| object` | `'walden'` | Chart theme |
| `loading` | `boolean` | `false` | Show loading overlay |
| `width` | `number \| 'auto'` | — | Chart width. Omit or pass `'auto'` to size automatically via `ResizeObserver`. |
| `height` | `number \| 'auto'` | — | Chart height. Omit or pass `'auto'` to size automatically via `ResizeObserver`. |
| `group` | `string` | — | Group name for linked charts |
| `deepMemo` | `boolean` | `false` | Deep comparison for option memoization |
| `renderer` | `'canvas' \| 'svg'` | `'svg'` | Rendering mode |
| `onReady` | `(chart: ECharts) => void` | — | Called when chart is initialized |
| `onBeforeDispose` | `(chart: ECharts) => void` | — | Called before chart is disposed |
| `className` | `string` | — | CSS class |
| `style` | `CSSProperties` | — | Inline style |

`ChartProps` also accepts the advanced `UseChartOptions` passthrough fields listed below.

#### Advanced options (ECharts passthrough)

Available on both `<Chart>` and `useChart`:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `notMerge` | `boolean` | `false` | Replace the previous option instead of merging with it |
| `replaceMerge` | `string \| string[]` | — | Component ids/names to fully replace on merge |
| `lazyUpdate` | `boolean` | `true` | Defer the chart repaint to the next frame |
| `silent` | `boolean` | `false` | Suppress events triggered by `setOption` |
| `transition` | `SetOptionTransitionOpt` | — | ECharts universal transition animation options |
| `locale` | `string \| LocaleOption` | — | ECharts locale |
| `devicePixelRatio` | `number` | — | Canvas device pixel ratio (`renderer: 'canvas'` only) |
| `useDirtyRect` | `boolean` | — | Enable dirty-rectangle rendering optimization |
| `useCoarsePointer` | `boolean` | — | Enlarge hit targets for coarse pointers (touch) |
| `pointerSize` | `number` | — | Hit target size when `useCoarsePointer` is enabled |
| `ssr` | `boolean` | — | Enable server-side rendering mode |

### `useChart(options)`

Returns a `RefObject<HTMLDivElement>` to attach to a container div. Accepts `UseChartOptions` — the same fields as `ChartProps` except `className`, `style`, and `deepMemo`, which are `Chart`-only.

### `connectCharts(group)` / `disconnectCharts(group)`

Connect/disconnect charts in the same group for synchronized interactions.

## Best Practices

- Always set an explicit `height` via `style` — ECharts needs a bounded container.
- Use `loading` to show a loading state while fetching chart data.
- Use `group` + `connectCharts` to synchronize tooltips across multiple charts on a dashboard.
