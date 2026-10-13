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

props 类型以 `LogoIconProps` 导出。

| Prop | Type | Default | 说明 |
|------|------|---------|-------------|
| `primaryColor` | `string` | 调色板 blue-500 颜色 | Logo 的主色；次要笔画使用由同一调色板推导出的 400 色阶 |

同时也支持所有标准 SVG 属性（如 `width`、`height`、`className`、`style` 等）。未显式指定尺寸时，Logo 以 `1em` 渲染，随周围字号缩放。
