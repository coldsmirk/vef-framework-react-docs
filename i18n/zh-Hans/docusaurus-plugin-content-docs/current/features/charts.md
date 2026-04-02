---
sidebar_position: 5
title: 图表
---

# 图表

VEF 在 `@vef-framework-react/components` 里提供了图表能力，核心导出包括:

- `Chart`
- `useChart`
- `connectCharts`
- `disconnectCharts`

## 最简单的用法

```tsx
import type { ChartOption } from "@vef-framework-react/components";

import { Chart } from "@vef-framework-react/components";

const option: ChartOption = {
  xAxis: { type: "category", data: ["周一", "周二", "周三"] },
  yAxis: { type: "value" },
  series: [
    {
      type: "line",
      data: [12, 18, 9]
    }
  ]
};

<Chart option={option} />;
```

## `useChart`

当你需要更细的生命周期控制，比如外部更新 option、手工 resize、访问实例时，可以使用 `useChart()`。

## 联动图表

如果一个页面里有多张需要联动缩放或联动 tooltip 的图表，可以使用:

- `connectCharts`
- `disconnectCharts`

## 适合的页面

- 首页看板
- 监控与统计页面
- 趋势分析
- 柱状图、折线图、饼图等常见管理端图表
