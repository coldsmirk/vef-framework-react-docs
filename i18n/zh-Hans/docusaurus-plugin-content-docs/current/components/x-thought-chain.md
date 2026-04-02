---
sidebar_position: 35
---

# XThoughtChain

Displays an AI reasoning chain — a sequence of thinking steps with status indicators.

> **Source:** Re-exported from `@ant-design/x`. Full documentation: [Ant Design X ThoughtChain](https://x.ant.design/components/thought-chain)

## Basic Usage

```tsx
import { XThoughtChain } from '@vef-framework-react/components';

const items = [
  {
    key: '1',
    title: 'Analyzing the question',
    status: 'success',
    description: 'Identified key concepts: React, forms, validation.',
  },
  {
    key: '2',
    title: 'Searching knowledge base',
    status: 'success',
  },
  {
    key: '3',
    title: 'Generating response',
    status: 'pending',
  },
];

export default function Demo() {
  return <XThoughtChain items={items} />;
}
```

## API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `ThoughtChainItem[]` | — | Chain steps |
| `collapsible` | `boolean \| CollapsibleConfig` | `false` | Allow collapsing steps |
| `size` | `'small' \| 'middle' \| 'large'` | `'middle'` | Component size |

### ThoughtChainItem

| Field | Type | Description |
|-------|------|-------------|
| `key` | `string` | Unique key |
| `title` | `ReactNode` | Step title |
| `description` | `ReactNode` | Step description |
| `status` | `'pending' \| 'success' \| 'error'` | Step status |
| `icon` | `ReactNode` | Custom icon |
| `content` | `ReactNode` | Expanded content |
| `footer` | `ReactNode` | Footer content |

> For the full API, see [Ant Design X ThoughtChain docs](https://x.ant.design/components/thought-chain).
