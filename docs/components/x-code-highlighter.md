---
sidebar_position: 46
---

# XCodeHighlighter

A code block component optimized for rendering code in AI responses.

> **VEF wrapper** around `@ant-design/x` CodeHighlighter.

## Basic Usage

```tsx
import { XCodeHighlighter } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <XCodeHighlighter
      language="typescript"
      value={`const greeting = (name: string) => \`Hello, \${name}!\`;`}
    />
  );
}
```

## In XMarkdown

Use `XCodeHighlighter` as a custom code block renderer:

```tsx
import { XMarkdown, XCodeHighlighter } from '@vef-framework-react/components';

<XMarkdown
  components={{
    code: ({ className, children }) => (
      <XCodeHighlighter
        language={className?.replace('language-', '')}
        value={String(children)}
      />
    ),
  }}
>
  {markdownContent}
</XMarkdown>
```

## API

`XCodeHighlighter` extends `@ant-design/x` CodeHighlighterProps. For the full API, see [Ant Design X docs](https://x.ant.design/).
