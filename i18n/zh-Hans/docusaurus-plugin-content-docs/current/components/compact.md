---
title: "Compact"
description: "将子组件（输入框、按钮等）无缝拼接为一体的包装容器。"
---

# Compact

将子组件（输入框、按钮等）无缝拼接为一体的包装容器。

> **来源：** 从 `antd` 重新导出（`Space.Compact`）。完整文档：[Ant Design Space Compact](https://ant.design/components/space/#Space.Compact)

## 基础用法

```tsx
import { Compact, Input, Button } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <Compact>
      <Input placeholder="Search..." />
      <Button type="primary">Search</Button>
    </Compact>
  );
}
```

## API

props 类型以 `CompactProps` 导出。

| Prop | Type | Default | 说明 |
|------|------|---------|-------------|
| `size` | `'large' \| 'medium' \| 'small'` | `'medium'` | 子组件的尺寸（`'middle'` 是 `'medium'` 的废弃别名） |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | 布局方向 |
| `vertical` | `boolean` | `false` | `orientation="vertical"` 的简写形式 |
| `direction` | `'horizontal' \| 'vertical'` | `'horizontal'` | **已废弃。** 请使用 `orientation` |
| `block` | `boolean` | `false` | 宽度自适应父容器 |
