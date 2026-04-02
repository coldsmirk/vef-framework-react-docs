---
sidebar_position: 50
---

# Alert

Displays a prominent message for user attention.

> **Source:** Re-exported from `antd`. Full documentation: [Ant Design Alert](https://ant.design/components/alert/)

## Basic Usage

```tsx
import { Alert } from '@vef-framework-react/components';

export default function Demo() {
  return <Alert message="Success message" type="success" />;
}
```

## Types

```tsx
import { Alert, Space } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Alert message="Info" type="info" />
      <Alert message="Success" type="success" />
      <Alert message="Warning" type="warning" />
      <Alert message="Error" type="error" />
    </Space>
  );
}
```

## With Description

```tsx
<Alert
  message="Warning"
  description="This action may affect other users."
  type="warning"
  showIcon
  closable
/>
```

## API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `message` | `ReactNode` | — | Alert title |
| `description` | `ReactNode` | — | Additional content |
| `type` | `'success' \| 'info' \| 'warning' \| 'error'` | `'info'` | Alert type |
| `showIcon` | `boolean` | `false` | Show type icon |
| `closable` | `boolean` | `false` | Show close button |
| `onClose` | `(e) => void` | — | Close callback |
| `banner` | `boolean` | `false` | Full-width banner style |
| `action` | `ReactNode` | — | Action element |
