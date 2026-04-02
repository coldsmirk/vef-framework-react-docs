---
sidebar_position: 44
---

# XMarkdown

Renders Markdown content with streaming animation support, optimized for AI responses.

> **VEF wrapper** around `@ant-design/x-markdown`. Extends the base component with VEF theme integration.

## Basic Usage

```tsx
import { XMarkdown } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <XMarkdown>
      {`# Hello

This is **markdown** content with \`inline code\`.

\`\`\`typescript
const x = 1;
\`\`\`
`}
    </XMarkdown>
  );
}
```

## Streaming

```tsx
import { XMarkdown, useXMarkdownStreaming } from '@vef-framework-react/components';

export default function StreamingDemo() {
  const { content, isStreaming } = useXMarkdownStreaming(streamSource);

  return <XMarkdown>{content}</XMarkdown>;
}
```

## API

`XMarkdown` extends `@ant-design/x-markdown` props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `string` | required | Markdown string |
| `components` | `Components` | — | Custom renderers for markdown elements |
| `config` | `MarkdownConfig` | — | Markdown parser config |
| `className` | `string` | — | CSS class |

### Additional Exports

| Export | Description |
|--------|-------------|
| `useXMarkdownStreaming` | Hook for streaming markdown content |
| `XMarkdownAnimationText` | Animated text component |
