---
sidebar_position: 2
---

# Button 按钮

点击后触发操作。

> **来源：** 直接从 `antd` 重新导出。完整文档：[Ant Design Button](https://ant.design/components/button-cn/)

## 何时使用

- 触发一个即时操作。
- 触发页面跳转。
- 提交表单。

## 基础用法

```tsx
import { Button } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <Button type="primary" onClick={() => console.log('clicked')}>
      主要按钮
    </Button>
  );
}
```

## 按钮类型

```tsx
import { Button, Space } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <Space>
      <Button type="primary">主要按钮</Button>
      <Button>默认按钮</Button>
      <Button type="dashed">虚线按钮</Button>
      <Button type="text">文本按钮</Button>
      <Button type="link">链接按钮</Button>
    </Space>
  );
}
```

## 尺寸

```tsx
import { Button, Space } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <Space align="center">
      <Button type="primary" size="large">大号</Button>
      <Button type="primary">默认</Button>
      <Button type="primary" size="small">小号</Button>
    </Space>
  );
}
```

## 加载状态

```tsx
import { Button } from '@vef-framework-react/components';
import { useState } from 'react';

export default function Demo() {
  const [loading, setLoading] = useState(false);

  return (
    <Button
      type="primary"
      loading={loading}
      onClick={() => {
        setLoading(true);
        setTimeout(() => setLoading(false), 2000);
      }}
    >
      点击加载
    </Button>
  );
}
```

## 危险按钮

```tsx
import { Button, Space } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <Space>
      <Button danger>危险默认</Button>
      <Button type="primary" danger>危险主要</Button>
      <Button type="dashed" danger>危险虚线</Button>
    </Space>
  );
}
```

## API

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `'primary' \| 'default' \| 'dashed' \| 'text' \| 'link'` | `'default'` | 按钮类型 |
| `size` | `'large' \| 'middle' \| 'small'` | `'middle'` | 按钮尺寸 |
| `loading` | `boolean \| { delay?: number }` | `false` | 加载状态 |
| `disabled` | `boolean` | `false` | 禁用状态 |
| `danger` | `boolean` | `false` | 危险状态 |
| `ghost` | `boolean` | `false` | 幽灵属性，背景透明 |
| `block` | `boolean` | `false` | 宽度撑满父元素 |
| `icon` | `ReactNode` | — | 图标 |
| `iconPosition` | `'start' \| 'end'` | `'start'` | 图标位置 |
| `shape` | `'default' \| 'circle' \| 'round'` | `'default'` | 按钮形状 |
| `href` | `string` | — | 跳转地址（渲染为 `<a>`） |
| `target` | `string` | — | 同 `<a>` 的 target |
| `htmlType` | `'button' \| 'submit' \| 'reset'` | `'button'` | 原生 button 类型 |
| `onClick` | `(event) => void` | — | 点击回调 |

> 如需异步操作自动 loading 和确认对话框，请使用 [`ActionButton`](./action-button)。

## 最佳实践

- 一个页面只使用一个 `type="primary"` 的主要按钮，避免视觉混乱。
- 删除等破坏性操作使用 `danger` 属性。
- 仅有图标的按钮配合 Tooltip 使用 [`IconButton`](./icon-button)。
- 需要权限控制的按钮使用 `OperationButton`。
