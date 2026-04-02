---
sidebar_position: 108
---

# Compact 紧凑布局

将子组件（输入框、按钮等）紧凑地组合在一起的包装器。

> **来源：** 从 `antd` 重新导出（`Space.Compact`）。完整文档：[Ant Design Space Compact](https://ant.design/components/space-cn/#Space.Compact)

## 基础用法

```tsx
import { Compact, Input, Button } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <Compact>
      <Input placeholder="搜索..." />
      <Button type="primary">搜索</Button>
    </Compact>
  );
}
```

## API

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `size` | `'large' \| 'middle' \| 'small'` | `'middle'` | 子组件大小 |
| `direction` | `'horizontal' \| 'vertical'` | `'horizontal'` | 布局方向 |
| `block` | `boolean` | `false` | 宽度撑满父元素 |
