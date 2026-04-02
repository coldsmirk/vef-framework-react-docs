---
sidebar_position: 25
---

# Keyboard 键盘按键

以统一样式渲染键盘快捷键。

> **VEF 特有组件**，不属于 Ant Design。

## 基础用法

```tsx
import { Keyboard } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <span>
      按 <Keyboard>Ctrl</Keyboard> + <Keyboard>K</Keyboard> 搜索
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

`Keyboard` 继承所有原生 `<kbd>` 元素属性，另有：

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `size` | `'small' \| 'middle' \| 'large'` | `'middle'` | 按键尺寸 |
| `children` | `ReactNode` | — | 按键标签 |
| `className` | `string` | — | CSS 类名 |
| `style` | `CSSProperties` | — | 内联样式 |
