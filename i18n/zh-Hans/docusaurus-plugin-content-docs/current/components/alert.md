---
title: "Alert"
description: "展示需要用户关注的醒目提示信息。"
---

# Alert

展示需要用户关注的醒目提示信息。

> **来源：** 直接从 `antd` 重新导出。完整文档：[Ant Design Alert](https://ant.design/components/alert/)

## 基础用法

```tsx
import { Alert } from '@vef-framework-react/components';

export default function Demo() {
  return <Alert title="Success message" type="success" />;
}
```

## 类型

```tsx
import { Alert, Space } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Alert title="Info" type="info" />
      <Alert title="Success" type="success" />
      <Alert title="Warning" type="warning" />
      <Alert title="Error" type="error" />
    </Space>
  );
}
```

## 带描述信息

```tsx
<Alert
  title="Warning"
  description="This action may affect other users."
  type="warning"
  showIcon
  closable
/>
```

## 变体

```tsx
<Alert title="Filled variant" type="warning" variant="filled" />
```

## API

| Prop | Type | Default | 说明 |
|------|------|---------|-------------|
| `title` | `ReactNode` | — | 提示内容（主要的标题属性；`message` 是废弃别名） |
| `message` | `ReactNode` | — | **已废弃。** 请使用 `title` |
| `description` | `ReactNode` | — | 附加内容 |
| `type` | `'success' \| 'info' \| 'warning' \| 'error'` | `'info'` | 提示类型 |
| `variant` | `'outlined' \| 'filled'` | — | 视觉变体（antd 6.4+） |
| `icon` | `ReactNode` | — | 自定义图标（`showIcon` 开启时展示） |
| `showIcon` | `boolean` | `false` | 显示类型图标 |
| `closable` | `boolean \| ({ closeIcon?, onClose? } & ...)` | `false` | 显示关闭按钮；传对象可自定义关闭图标，或通过 `closable.onClose` 处理关闭 |
| `onClose` | `(e) => void` | — | **已废弃。** 请使用 `closable.onClose` |
| `banner` | `boolean` | `false` | 通栏横幅样式 |
| `action` | `ReactNode` | — | 操作元素 |
