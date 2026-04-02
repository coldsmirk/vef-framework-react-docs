---
sidebar_position: 50
---

# Alert 警告提示

用于页面中展示重要的提示信息。

> **来源：** 直接从 `antd` 重新导出。完整文档：[Ant Design Alert](https://ant.design/components/alert-cn/)

## 基础用法

```tsx
import { Alert } from '@vef-framework-react/components';

export default function Demo() {
  return <Alert message="成功提示" type="success" />;
}
```

## 四种类型

```tsx
import { Alert, Space } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Alert message="消息提示" type="info" />
      <Alert message="成功提示" type="success" />
      <Alert message="警告提示" type="warning" />
      <Alert message="错误提示" type="error" />
    </Space>
  );
}
```

## 带描述

```tsx
<Alert
  message="警告"
  description="此操作可能影响其他用户。"
  type="warning"
  showIcon
  closable
/>
```

## API

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `message` | `ReactNode` | — | 警告提示内容 |
| `description` | `ReactNode` | — | 警告提示的辅助性文字介绍 |
| `type` | `'success' \| 'info' \| 'warning' \| 'error'` | `'info'` | 指定警告提示的样式 |
| `showIcon` | `boolean` | `false` | 是否显示辅助图标 |
| `closable` | `boolean` | `false` | 是否可关闭 |
| `onClose` | `(e) => void` | — | 关闭时触发的回调函数 |
| `banner` | `boolean` | `false` | 是否用作顶部公告 |
| `action` | `ReactNode` | — | 自定义操作项 |
