---
title: "Alert"
description: "Displays a prominent message for user attention."
---

# Alert

Displays a prominent message for user attention.

> **Source:** Re-exported from `antd`. Full documentation: [Ant Design Alert](https://ant.design/components/alert/)

## Basic Usage

```tsx
import { Alert } from '@vef-framework-react/components';

export default function Demo() {
  return <Alert title="Success message" type="success" />;
}
```

## Types

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

## With Description

```tsx
<Alert
  title="Warning"
  description="This action may affect other users."
  type="warning"
  showIcon
  closable
/>
```

## Variant

```tsx
<Alert title="Filled variant" type="warning" variant="filled" />
```

## API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `ReactNode` | — | Alert content (the primary title prop; `message` is a deprecated alias) |
| `message` | `ReactNode` | — | **Deprecated.** Use `title` instead |
| `description` | `ReactNode` | — | Additional content |
| `type` | `'success' \| 'info' \| 'warning' \| 'error'` | `'info'` | Alert type |
| `variant` | `'outlined' \| 'filled'` | — | Visual variant (antd 6.4+) |
| `icon` | `ReactNode` | — | Custom icon (shown when `showIcon` is set) |
| `showIcon` | `boolean` | `false` | Show type icon |
| `closable` | `boolean \| ({ closeIcon?, onClose? } & ...)` | `false` | Show close button; pass an object to customize the close icon or handle close via `closable.onClose` |
| `onClose` | `(e) => void` | — | **Deprecated.** Use `closable.onClose` instead |
| `banner` | `boolean` | `false` | Full-width banner style |
| `action` | `ReactNode` | — | Action element |
