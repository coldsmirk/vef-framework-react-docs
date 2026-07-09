---
title: "Button"
description: "点击时触发一个操作。"
---

# Button

点击时触发一个操作。

> **来源：** 直接从 `antd` 重新导出。完整文档：[Ant Design Button](https://ant.design/components/button/)

## 何时使用

- 需要触发一个后台操作时。
- 需要触发一个导航操作时。
- 需要提交表单时。

## 基础用法

```tsx
import { Button } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <Button type="primary" onClick={() => console.log('clicked')}>
      Primary Button
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
      <Button type="primary">Primary</Button>
      <Button>Default</Button>
      <Button type="dashed">Dashed</Button>
      <Button type="text">Text</Button>
      <Button type="link">Link</Button>
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
      <Button type="primary" size="large">Large</Button>
      <Button type="primary">Default</Button>
      <Button type="primary" size="small">Small</Button>
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
      Click to Load
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
      <Button danger>Danger Default</Button>
      <Button type="primary" danger>Danger Primary</Button>
      <Button type="dashed" danger>Danger Dashed</Button>
    </Space>
  );
}
```

## API

| Prop | Type | Default | 说明 |
|------|------|---------|-------------|
| `type` | `'primary' \| 'default' \| 'dashed' \| 'text' \| 'link'` | `'default'` | 按钮样式类型 |
| `size` | `'large' \| 'medium' \| 'small'` | `'medium'` | 按钮尺寸（`'middle'` 是 `'medium'` 的废弃别名） |
| `loading` | `boolean \| { delay?: number }` | `false` | 显示加载状态 |
| `disabled` | `boolean` | `false` | 禁用按钮 |
| `danger` | `boolean` | `false` | 设置为危险状态 |
| `ghost` | `boolean` | `false` | 使背景透明 |
| `block` | `boolean` | `false` | 让按钮宽度自适应父容器 |
| `icon` | `ReactNode` | — | 图标元素 |
| `iconPosition` | `'start' \| 'end'` | `'start'` | 图标位置 |
| `shape` | `'default' \| 'circle' \| 'round'` | `'default'` | 按钮形状 |
| `href` | `string` | — | 跳转链接（渲染为 `<a>`） |
| `target` | `string` | — | 与 `<a>` 的 target 属性相同 |
| `htmlType` | `'button' \| 'submit' \| 'reset'` | `'button'` | 原生按钮类型 |
| `onClick` | `(event) => void` | — | 点击事件处理函数 |

> 对于需要自动加载状态和确认对话框的异步操作，请改用 [`ActionButton`](./action-button)。

## 最佳实践

- 页面中的主要操作使用 `type="primary"`，避免出现多个主按钮。
- 删除等破坏性操作使用 `danger`。
- 带有提示信息的纯图标按钮，使用 [`IconButton`](./icon-button)。
- 需要权限校验的按钮，使用 [`OperationButton`](./operation-button.md)。
