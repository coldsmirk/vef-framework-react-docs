---
sidebar_position: 5
title: Charts
---

# Charts

VEF exposes charting support through `@vef-framework/components`, with the following core exports:

- `Chart`
- `useChart`
- `connectCharts`
- `disconnectCharts`

## Basic Usage

```tsx
import type { ChartOption } from "@vef-framework/components";

import { Chart } from "@vef-framework/components";

const option: ChartOption = {
  xAxis: { type: "category", data: ["Mon", "Tue", "Wed"] },
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

Use `useChart()` when explicit lifecycle control is needed, such as external option updates, manual resize behavior, or direct instance access.

## Linked Charts

When a page contains multiple charts that should share zoom or tooltip behavior:

- `connectCharts`
- `disconnectCharts`

## Typical Pages

- dashboards
- monitoring and analytics pages
- trend analysis views
- common admin-side bar, line, and pie charts
