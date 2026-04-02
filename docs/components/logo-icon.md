---
sidebar_position: 108
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

| Prop | Type | Description |
|------|------|-------------|
| `primaryColor` | `string` | Primary color of the logo |

All standard SVG props (`width`, `height`, `className`, `style`, etc.) are also supported.
