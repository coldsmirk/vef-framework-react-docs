---
sidebar_position: 24
---

# CodeHighlighter

A syntax-highlighted code block component.

> **VEF-specific component.** Built on [`react-syntax-highlighter`](https://github.com/react-syntax-highlighter/react-syntax-highlighter).

## Basic Usage

```tsx
import { CodeHighlighter } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <CodeHighlighter language="typescript">
      {`const greeting = (name: string) => \`Hello, \${name}!\`;`}
    </CodeHighlighter>
  );
}
```

## With Line Numbers

```tsx
<CodeHighlighter language="tsx" showLineNumbers>
  {`import { Button } from '@vef-framework-react/components';

export default function Demo() {
  return <Button type="primary">Click me</Button>;
}`}
</CodeHighlighter>
```

## Highlight Specific Lines

```tsx
<CodeHighlighter
  language="typescript"
  showLineNumbers
  lineProps={[1, 3]}
>
  {code}
</CodeHighlighter>
```

## API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `string` | required | Code string to highlight |
| `language` | `string` | `'typescript'` | Programming language |
| `showLineNumbers` | `boolean` | `false` | Show line numbers |
| `startingLineNumber` | `number` | `1` | Starting line number |
| `wrapLines` | `boolean` | `false` | Wrap lines |
| `wrapLongLines` | `boolean` | `true` | Wrap long lines instead of scrolling |
| `className` | `string` | — | CSS class |
| `style` | `CSSProperties` | — | Inline style |
| `customStyle` | `CSSProperties` | — | Style for the syntax highlighter container |
| `lineProps` | `SyntaxHighlighterProps['lineProps']` | — | Lines to highlight |
