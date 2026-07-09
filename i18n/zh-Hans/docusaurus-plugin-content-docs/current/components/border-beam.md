---
title: "BorderBeam"
description: "沿容器边框流动的装饰性动画光束，用于吸引注意力而不表达任何业务状态。"
---

# BorderBeam

一种装饰性组件，会沿容器边框持续流动一道动画光束，用于吸引视觉注意力，但不传达任何业务状态。

> **来源：** 从 `antd` 重新导出（Ant Design 6.x 原生组件）。完整文档：[Ant Design BorderBeam](https://ant.design/components/border-beam/)

## 何时使用

- 容器需要更强的视觉强调，但又不想引入业务状态语义——它不能替代状态徽标、焦点环或校验提示。
- 用于突出登录面板、推荐卡片、AI 相关模块或关键的行动号召区块。
- 纯装饰用途。不要用它替代无障碍焦点指示或表单校验反馈。

## 基础用法

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

被包裹的子元素应建立一个定位上下文（例如 `position: relative`），以便光束层能够与其边框对齐。

## 自定义颜色

```tsx
<BorderBeam color="#eb2f96">
  <Card>Single color beam</Card>
</BorderBeam>
```

## 渐变颜色

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

## 调整速度与粗细

```tsx
<BorderBeam duration={3} lineWidth={2} size={160}>
  <Card>Faster, thicker beam</Card>
</BorderBeam>
```

## API

### BorderBeamProps

| Prop | 类型 | 默认值 | 说明 |
|------|------|---------|-------------|
| `children` | `ReactNode` | — | 光束沿其边框流动的容器元素 |
| `color` | `BorderBeamColor` | 主题主色渐变 | 光束颜色——单一颜色字符串或渐变色标数组 |
| `duration` | `number` | `6` | 绕边框一整圈所需的秒数 |
| `lineWidth` | `number \| string` | 主题 `lineWidth` token | 光束线条粗细 |
| `size` | `number \| string` | `100` | 可见光束段的长度（像素） |
| `outset` | `number \| string` | 由宿主边框宽度推导 | 光束相对容器边缘向外偏移的距离 |
| `prefixCls` | `string` | `"ant-border-beam"` | 类名前缀，用于样式覆盖 |
| `className` | `string` | — | 附加到光束层的额外类名 |
| `style` | `CSSProperties` | — | 应用到光束层的内联样式 |

### BorderBeamColor / BorderBeamGradient

```ts
type BorderBeamGradientItem = { color: string; percent: number };
type BorderBeamGradient = BorderBeamGradientItem[];
type BorderBeamColor = string | BorderBeamGradient;
```

每个渐变色标的 `percent` 会在内部被限制，确保可见颜色不会超过组件的最大色标百分比，从而保持渐变尾部透明。
