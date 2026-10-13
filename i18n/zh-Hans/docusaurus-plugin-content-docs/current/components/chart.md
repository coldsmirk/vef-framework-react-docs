---
title: "Chart"
description: "集成 React、支持主题和图表联动的 ECharts 封装组件。"
---

# Chart

集成 React、支持主题和图表联动的 ECharts 封装组件。

> **VEF 专属组件。** 直接封装 [Apache ECharts](https://echarts.apache.org/)（不经 `echarts-for-react`），并提供 React 生命周期安全的 `useChart` Hook。

## 何时使用

- 在 React 组件中渲染任意 ECharts 图表（折线图、柱状图、饼图、散点图等）。
- 联动多个图表以同步 Tooltip 和数据缩放。

## 基础用法

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

## 使用主题

```tsx
<Chart
  option={option}
  theme="walden"
  style={{ height: 300 }}
/>
```

内置主题：`"walden"`、`"wonderland"`。你也可以传入自定义的 ECharts 主题对象。

当应用处于暗色模式（经由 [`ConfigProvider`](./config-provider.md)）时，内置主题名会在运行中的图表实例上自动切换到其暗色变体（`walden-dark` / `wonderland-dark`），并可自动切回。自定义主题对象则原样使用。

## 加载状态

```tsx
<Chart option={option} loading={isLoading} style={{ height: 300 }} />
```

## 使用 `useChart` Hook

用于以命令式方式访问 ECharts 实例——`onReady` 会收到它，类型为 `ChartInstance`（即 ECharts 自身的 `ECharts` 类型）：

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

## 图表联动

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

| Prop | Type | Default | 说明 |
|------|------|---------|-------------|
| `option` | `EChartsOption` | required | ECharts 配置项 |
| `theme` | `'walden' \| 'wonderland' \| object` | `'walden'` | 图表主题 |
| `loading` | `boolean` | `false` | 显示加载遮罩 |
| `width` | `number \| 'auto'` | — | 图表宽度。省略该属性或传入 `'auto'` 都会触发 `ResizeObserver` 自动调整尺寸。 |
| `height` | `number \| 'auto'` | — | 图表高度。省略该属性或传入 `'auto'` 都会触发 `ResizeObserver` 自动调整尺寸。 |
| `group` | `string` | — | 联动图表的分组名 |
| `deepMemo` | `boolean` | `false` | 对 option 进行深比较以决定是否重新渲染 |
| `renderer` | `'canvas' \| 'svg'` | `'svg'` | 渲染模式 |
| `onReady` | `(chart: ECharts) => void` | — | 图表初始化完成时调用 |
| `onBeforeDispose` | `(chart: ECharts) => void` | — | 图表销毁前调用 |
| `className` | `string` | — | CSS 类名 |
| `style` | `CSSProperties` | — | 内联样式 |

`ChartProps` 还接受下方列出的高级 `UseChartOptions` 透传字段。

#### 高级选项（ECharts 透传）

`<Chart>` 和 `useChart` 均可使用：

| Prop | Type | Default | 说明 |
|------|------|---------|-------------|
| `notMerge` | `boolean` | `false` | 替换而非合并上一次的 option |
| `replaceMerge` | `string \| string[]` | — | 合并时需要完全替换的组件 id/name |
| `lazyUpdate` | `boolean` | `true` | 将图表重绘推迟到下一帧 |
| `silent` | `boolean` | `false` | 屏蔽 `setOption` 触发的事件 |
| `transition` | `SetOptionTransitionOpt` | — | ECharts 通用过渡动画选项 |
| `locale` | `string \| LocaleOption` | — | ECharts 语言 |
| `devicePixelRatio` | `number` | — | Canvas 设备像素比（仅 `renderer: 'canvas'` 时生效） |
| `useDirtyRect` | `boolean` | — | 启用脏矩形渲染优化 |
| `useCoarsePointer` | `boolean` | — | 为粗指针（触摸）设备放大可点击区域 |
| `pointerSize` | `number` | — | 启用 `useCoarsePointer` 时的可点击区域大小 |
| `ssr` | `boolean` | — | 启用服务端渲染模式 |

### `useChart(options)`

返回一个可挂载到容器 div 上的 `RefObject<HTMLDivElement>`。接受 `UseChartOptions`——与 `ChartProps` 字段相同，但不包括仅 `Chart` 才有的 `className`、`style` 和 `deepMemo`。

### `connectCharts(group)` / `disconnectCharts(group)`

连接/断开同一分组内图表的联动交互。

## 最佳实践

- 始终通过 `style` 设置明确的 `height`——ECharts 需要一个有边界的容器。
- 在获取图表数据期间使用 `loading` 显示加载状态。
- 使用 `group` 配合 `connectCharts` 来同步仪表盘中多个图表的 Tooltip。
