---
sidebar_position: 23
---

# Chart 图表

基于 ECharts 的 React 图表组件，支持主题、图表联动和命令式 API。

> **VEF 特有组件**，封装 [Apache ECharts](https://echarts.apache.org/)。

## 基础用法

```tsx
import { Chart } from '@vef-framework-react/components';
import type { ChartOption } from '@vef-framework-react/components';

const option: ChartOption = {
  xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五'] },
  yAxis: { type: 'value' },
  series: [{ type: 'bar', data: [120, 200, 150, 80, 70] }],
};

export default function Demo() {
  return <Chart option={option} style={{ height: 300 }} />;
}
```

## 使用主题

```tsx
<Chart option={option} theme="walden" style={{ height: 300 }} />
```

内置主题：`"walden"`、`"wonderland"`，也可传入自定义 ECharts 主题对象。

## 加载状态

```tsx
<Chart option={option} loading={isLoading} style={{ height: 300 }} />
```

## 使用 `useChart` Hook

命令式访问 ECharts 实例：

```tsx
import { useChart } from '@vef-framework-react/components';

const ref = useChart({
  option,
  onReady: (chart) => {
    chart.on('click', (params) => console.log(params));
  },
});

return <div ref={ref} style={{ height: 300 }} />;
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

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `option` | `EChartsOption` | 必填 | ECharts 配置项 |
| `theme` | `'walden' \| 'wonderland' \| object` | — | 图表主题 |
| `loading` | `boolean` | `false` | 显示加载遮罩 |
| `width` | `number \| 'auto'` | `'auto'` | 图表宽度 |
| `height` | `number \| 'auto'` | `'auto'` | 图表高度 |
| `group` | `string` | — | 联动图表组名 |
| `deepMemo` | `boolean` | `false` | 深比较 option 进行 memo |
| `renderer` | `'canvas' \| 'svg'` | `'canvas'` | 渲染模式 |
| `onReady` | `(chart: ECharts) => void` | — | 图表初始化完成回调 |
| `onBeforeDispose` | `(chart: ECharts) => void` | — | 图表销毁前回调 |
| `className` | `string` | — | CSS 类名 |
| `style` | `CSSProperties` | — | 内联样式 |

### `connectCharts(group)` / `disconnectCharts(group)`

连接/断开同组图表的联动交互。

## 最佳实践

- 始终通过 `style` 设置明确的 `height`——ECharts 需要有界容器。
- 获取图表数据时使用 `loading` 显示加载状态。
- 仪表盘多图表同步 Tooltip 时使用 `group` + `connectCharts`。
