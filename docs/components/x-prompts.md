---
sidebar_position: 34
---

# XPrompts

Displays a list of suggested prompts for the user to click and send.

> **Source:** Re-exported from `@ant-design/x`. Full documentation: [Ant Design X Prompts](https://x.ant.design/components/prompts)

## Basic Usage

```tsx
import { XPrompts } from '@vef-framework-react/components';

const items = [
  { key: '1', label: 'What is VEF Framework?' },
  { key: '2', label: 'How do I create a form?' },
  { key: '3', label: 'Show me a table example.' },
];

export default function Demo() {
  return (
    <XPrompts
      title="Suggested questions"
      items={items}
      onItemClick={(info) => console.log('Selected:', info.data.label)}
    />
  );
}
```

## API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `PromptItem[]` | — | Prompt list |
| `title` | `ReactNode` | — | Section title |
| `onItemClick` | `(info: { data: PromptItem }) => void` | — | Click handler |
| `wrap` | `boolean` | `false` | Allow items to wrap |
| `vertical` | `boolean` | `false` | Vertical layout |

> For the full API, see [Ant Design X Prompts docs](https://x.ant.design/components/prompts).
