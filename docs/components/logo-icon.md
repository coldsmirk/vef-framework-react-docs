---
title: "LogoIcon"
description: "The VEF framework logo as an SVG component."
---

# LogoIcon

The VEF framework logo as an SVG component.

> **VEF-specific component.** New in `@vef-framework-react/components` v2.1.6.

## Basic Usage

```tsx
import { LogoIcon } from '@vef-framework-react/components';

export default function AppLogo() {
  return <LogoIcon width={32} height={32} />;
}
```

## With Custom Color

```tsx
<LogoIcon primaryColor="#1677ff" width={40} height={40} />
```

## API

The props type is exported as `LogoIconProps`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `primaryColor` | `string` | the blue-500 palette color | Primary color of the logo; the secondary strokes use the 400 shade derived from the same palette |

All standard SVG props (`width`, `height`, `className`, `style`, etc.) are also supported. Without an explicit size the logo renders at `1em`, scaling with the surrounding font size.
