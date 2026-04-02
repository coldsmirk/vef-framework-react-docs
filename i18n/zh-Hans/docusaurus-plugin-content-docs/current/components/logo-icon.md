---
sidebar_position: 108
---

# LogoIcon

VEF 框架的 Logo SVG 组件。

> **VEF 专属组件。** 在 `@vef-framework-react/components` v2.1.6 中新增。

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

| 属性 | 类型 | 说明 |
|------|------|------|
| `primaryColor` | `string` | Logo 主色 |

同时支持所有标准 SVG 属性（`width`、`height`、`className`、`style` 等）。
