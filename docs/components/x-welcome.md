---
sidebar_position: 36
---

# XWelcome

A welcome screen component for AI chat interfaces, displaying a greeting and suggested actions.

> **Source:** Re-exported from `@ant-design/x`. Full documentation: [Ant Design X Welcome](https://x.ant.design/components/welcome)

## Basic Usage

```tsx
import { XWelcome } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <XWelcome
      icon="/ai-avatar.png"
      title="Hello, I'm your AI assistant"
      description="Ask me anything about VEF Framework."
    />
  );
}
```

## API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `ReactNode` | — | Avatar or icon |
| `title` | `ReactNode` | — | Welcome title |
| `description` | `ReactNode` | — | Subtitle or description |
| `extra` | `ReactNode` | — | Extra content (top right) |
| `prompts` | `PromptsProps` | — | Embedded prompts config |
| `style` | `CSSProperties` | — | Inline style |
| `className` | `string` | — | CSS class |

> For the full API, see [Ant Design X Welcome docs](https://x.ant.design/components/welcome).
