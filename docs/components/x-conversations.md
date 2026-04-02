---
sidebar_position: 33
---

# XConversations

A conversation list component for displaying and managing multiple chat sessions.

> **Source:** Re-exported from `@ant-design/x`. Full documentation: [Ant Design X Conversations](https://x.ant.design/components/conversations)

## Basic Usage

```tsx
import { XConversations } from '@vef-framework-react/components';

const items = [
  { key: '1', label: 'Chat about React', timestamp: Date.now() },
  { key: '2', label: 'VEF Framework questions', timestamp: Date.now() - 3600000 },
];

export default function Demo() {
  return (
    <XConversations
      items={items}
      activeKey="1"
      onActiveChange={(key) => console.log('Switch to:', key)}
    />
  );
}
```

## API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `ConversationItem[]` | — | Conversation list data |
| `activeKey` | `string` | — | Active conversation key |
| `defaultActiveKey` | `string` | — | Default active key |
| `onActiveChange` | `(key: string) => void` | — | Active conversation change handler |
| `menu` | `(item) => MenuProps` | — | Context menu for each item |
| `groupable` | `boolean \| GroupConfig` | `false` | Enable grouping |

> For the full API, see [Ant Design X Conversations docs](https://x.ant.design/components/conversations).
