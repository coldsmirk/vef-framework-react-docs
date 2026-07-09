---
title: "BorderBeam"
description: "A decorative animated beam that travels along a container's border to draw attention without implying business state."
---

# BorderBeam

A decorative animated beam that travels continuously along a container's border, drawing visual attention without conveying any business state.

> **Source:** Re-exported from `antd` (native Ant Design 6.x component). Full documentation: [Ant Design BorderBeam](https://ant.design/components/border-beam/)

## When to Use

- A container needs stronger visual emphasis without introducing business-state semantics — it does not replace a status badge, focus ring, or validation indicator.
- Highlighting login panels, recommendation cards, AI-related modules, or a key call-to-action block.
- Purely decorative. Don't use it as a substitute for accessible focus indicators or form validation feedback.

## Basic Usage

```tsx
import { BorderBeam } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <BorderBeam>
      <div style={{ position: 'relative', padding: 24, borderRadius: 8 }}>
        Highlighted content
      </div>
    </BorderBeam>
  );
}
```

The wrapped child should establish a positioning context (e.g. `position: relative`) so the beam layer aligns to its border.

## Custom Color

```tsx
<BorderBeam color="#eb2f96">
  <Card>Single color beam</Card>
</BorderBeam>
```

## Gradient Color

```tsx
<BorderBeam
  color={[
    { color: '#1677ff', percent: 0 },
    { color: '#eb2f96', percent: 70 },
  ]}
>
  <Card>Gradient beam</Card>
</BorderBeam>
```

## Tuning Speed and Thickness

```tsx
<BorderBeam duration={3} lineWidth={2} size={160}>
  <Card>Faster, thicker beam</Card>
</BorderBeam>
```

## API

### BorderBeamProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | — | The container element the beam traces the border of |
| `color` | `BorderBeamColor` | theme primary gradient | Beam color — a single color string or a gradient stop array |
| `duration` | `number` | `6` | Seconds for one full loop around the border |
| `lineWidth` | `number \| string` | theme `lineWidth` token | Beam line thickness |
| `size` | `number \| string` | `100` | Length of the visible beam segment, in pixels |
| `outset` | `number \| string` | derived from the host's border width | Distance the beam sits outside the container edge |
| `prefixCls` | `string` | `"ant-border-beam"` | Class name prefix, for style overrides |
| `className` | `string` | — | Additional class applied to the beam layer |
| `style` | `CSSProperties` | — | Inline style applied to the beam layer |

### BorderBeamColor / BorderBeamGradient

```ts
type BorderBeamGradientItem = { color: string; percent: number };
type BorderBeamGradient = BorderBeamGradientItem[];
type BorderBeamColor = string | BorderBeamGradient;
```

Each gradient stop's `percent` is clamped internally so the visible color never runs past the component's max color-stop percentage, keeping the gradient's tail transparent.
