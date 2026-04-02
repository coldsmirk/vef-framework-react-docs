---
sidebar_position: 23
---

# Chart

An ECharts wrapper component with React integration, theme support, and chart linking.

> **VEF-specific component.** Wraps [Apache ECharts](https://echarts.apache.org/) via `echarts-for-react`.

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
| `theme` | `'walden' \| 'wonderland' \| object` | — | Chart theme |
| `loading` | `boolean` | `false` | Show loading overlay |
| `width` | `number \| 'auto'` | `'auto'` | Chart width |
| `height` | `number \| 'auto'` | `'auto'` | Chart height |
| `group` | `string` | — | Group name for linked charts |
| `deepMemo` | `boolean` | `false` | Deep comparison for option memoization |
| `renderer` | `'canvas' \| 'svg'` | `'canvas'` | Rendering mode |
| `onReady` | `(chart: ECharts) => void` | — | Called when chart is initialized |
| `onBeforeDispose` | `(chart: ECharts) => void` | — | Called before chart is disposed |
| `className` | `string` | — | CSS class |
| `style` | `CSSProperties` | — | Inline style |

### `useChart(options)`

Returns a `RefObject<HTMLDivElement>` to attach to a container div. Accepts all `ChartProps` fields.

### `connectCharts(group)` / `disconnectCharts(group)`

Connect/disconnect charts in the same group for synchronized interactions.

## Best Practices

- Always set an explicit `height` via `style` — ECharts needs a bounded container.
- Use `loading` to show a loading state while fetching chart data.
- Use `group` + `connectCharts` to synchronize tooltips across multiple charts on a dashboard.
