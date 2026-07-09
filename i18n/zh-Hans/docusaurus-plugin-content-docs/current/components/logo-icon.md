---
title: "LogoIcon"
description: "以 SVG 组件形式提供的 VEF 框架 Logo。"
---

# LogoIcon

以 SVG 组件形式提供的 VEF 框架 Logo。

> **VEF 专属组件。** 自 `@vef-framework-react/components` v2.1.6 起新增。

## 基础用法

```tsx
import { LogoIcon } from '@vef-framework-react/components';

export default function AppLogo() {
  return <LogoIcon width={32} height={32} />;
}
```

## 自定义颜色

```tsx
<LogoIcon primaryColor="#1677ff" width={40} height={40} />
```

## API

| Prop | Type | 说明 |
|------|------|-------------|
| `primaryColor` | `string` | Logo 的主色 |

同时也支持所有标准 SVG 属性（如 `width`、`height`、`className`、`style` 等）。
