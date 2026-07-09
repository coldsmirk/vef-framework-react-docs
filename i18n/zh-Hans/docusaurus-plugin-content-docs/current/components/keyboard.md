---
title: "Keyboard"
description: "以统一样式渲染键盘快捷键。"
---

# Keyboard

以统一样式渲染键盘快捷键。

> **VEF 特有组件。** 不属于 Ant Design。

## 基础用法

```tsx
import { Keyboard } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <span>
      Press <Keyboard>Ctrl</Keyboard> + <Keyboard>K</Keyboard> to search
    </span>
  );
}
```

## 尺寸

```tsx
import { Keyboard, Space } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <Space>
      <Keyboard size="small">Esc</Keyboard>
      <Keyboard>Enter</Keyboard>
      <Keyboard size="large">Space</Keyboard>
    </Space>
  );
}
```

## API

`Keyboard` 继承所有原生 `<kbd>` 元素的属性，另有：

| Prop | Type | Default | 说明 |
|------|------|---------|-------------|
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | 按键尺寸 |
| `children` | `ReactNode` | — | 按键文案 |
| `className` | `string` | — | CSS 类名 |
| `style` | `CSSProperties` | — | 内联样式 |
