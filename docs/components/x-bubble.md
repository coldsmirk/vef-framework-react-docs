---
sidebar_position: 31
---

# XBubble

Chat message bubble component for displaying AI and user messages.

> **Source:** Re-exported from `@ant-design/x`. Full documentation: [Ant Design X Bubble](https://x.ant.design/components/bubble)

## Basic Usage

```tsx
import { XBubble } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <>
      <XBubble content="Hello! How can I help you?" placement="start" />
      <XBubble content="Tell me about VEF Framework." placement="end" />
    </>
  );
}
```

## With Avatar

```tsx
<XBubble
  content="I can help with that!"
  placement="start"
  avatar={{ src: '/ai-avatar.png', alt: 'AI' }}
/>
```

## Markdown Content

```tsx
import { XBubble, XMarkdown } from '@vef-framework-react/components';

<XBubble
  placement="start"
  content="Here is some **markdown** content with `code`."
  messageRender={(content) => <XMarkdown>{content}</XMarkdown>}
/>
```

## Streaming / Loading

```tsx
<XBubble
  placement="start"
  content={streamingContent}
  loading={isStreaming && !streamingContent}
/>
```

## API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `ReactNode` | — | Message content |
| `placement` | `'start' \| 'end'` | `'start'` | Bubble position (start = left, end = right) |
| `avatar` | `AvatarProps \| ReactNode` | — | Avatar config or element |
| `loading` | `boolean` | `false` | Show loading dots |
| `typing` | `boolean \| { step, interval }` | `false` | Typing animation config |
| `messageRender` | `(content: string) => ReactNode` | — | Custom content renderer |
| `header` | `ReactNode` | — | Content above the bubble |
| `footer` | `ReactNode` | — | Content below the bubble |
| `shape` | `'round' \| 'corner'` | `'round'` | Bubble shape |
| `variant` | `'filled' \| 'borderless' \| 'outlined' \| 'shadow'` | `'filled'` | Visual variant |

> For the full API, see [Ant Design X Bubble docs](https://x.ant.design/components/bubble).
