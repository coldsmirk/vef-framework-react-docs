---
sidebar_position: 32
---

# XSender

Message input area with send button, file attachment support, and speech input.

> **Source:** Re-exported from `@ant-design/x`. Full documentation: [Ant Design X Sender](https://x.ant.design/components/sender)

## Basic Usage

```tsx
import { XSender } from '@vef-framework-react/components';
import { useState } from 'react';

export default function Demo() {
  const [value, setValue] = useState('');

  return (
    <XSender
      value={value}
      onChange={setValue}
      onSubmit={(text) => {
        console.log('Send:', text);
        setValue('');
      }}
      placeholder="Ask anything..."
    />
  );
}
```

## With Loading (Streaming)

```tsx
<XSender
  value={value}
  onChange={setValue}
  onSubmit={handleSend}
  onCancel={handleCancel}
  loading={isStreaming}
  placeholder="Ask anything..."
/>
```

## API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | — | Input value (controlled) |
| `defaultValue` | `string` | — | Initial value (uncontrolled) |
| `onChange` | `(value: string) => void` | — | Input change handler |
| `onSubmit` | `(value: string) => void` | — | Send button click handler |
| `onCancel` | `() => void` | — | Cancel button click handler (shown when `loading`) |
| `loading` | `boolean` | `false` | Show cancel button instead of send |
| `disabled` | `boolean` | `false` | Disable the sender |
| `placeholder` | `string` | — | Input placeholder |
| `allowSpeech` | `boolean` | `false` | Enable speech input |
| `header` | `ReactNode` | — | Content above the input |
| `footer` | `ReactNode` | — | Content below the input |
| `prefix` | `ReactNode` | — | Content before the input |
| `actions` | `ReactNode \| false` | — | Custom action buttons |

> For the full API, see [Ant Design X Sender docs](https://x.ant.design/components/sender).
