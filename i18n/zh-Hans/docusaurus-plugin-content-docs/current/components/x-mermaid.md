---
sidebar_position: 45
---

# XMermaid

Renders [Mermaid](https://mermaid.js.org/) diagrams in AI responses.

> **VEF wrapper** around `@ant-design/x` Mermaid component.

## Basic Usage

```tsx
import { XMermaid } from '@vef-framework-react/components';

const diagram = `
graph TD
  A[Start] --> B{Decision}
  B -->|Yes| C[Action 1]
  B -->|No| D[Action 2]
`;

export default function Demo() {
  return <XMermaid value={diagram} />;
}
```

## In XMarkdown

Use `XMermaid` as a custom code block renderer inside `XMarkdown`:

```tsx
import { XMarkdown, XMermaid } from '@vef-framework-react/components';

<XMarkdown
  components={{
    code: ({ className, children }) => {
      if (className === 'language-mermaid') {
        return <XMermaid value={String(children)} />;
      }
      return <code className={className}>{children}</code>;
    },
  }}
>
  {markdownContent}
</XMarkdown>
```

## API

`XMermaid` extends `@ant-design/x` MermaidProps:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | required | Mermaid diagram definition |
| `className` | `string` | — | CSS class |
| `style` | `CSSProperties` | — | Inline style |
