---
sidebar_position: 24
---

# CodeHighlighter 代码高亮

语法高亮代码块组件。

> **VEF 特有组件**，基于 [`react-syntax-highlighter`](https://github.com/react-syntax-highlighter/react-syntax-highlighter) 构建。

## 基础用法

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

## 显示行号

```tsx
<CodeHighlighter language="tsx" showLineNumbers>
  {`import { Button } from '@vef-framework-react/components';

export default function Demo() {
  return <Button type="primary">点击</Button>;
}`}
</CodeHighlighter>
```

## 高亮指定行

```tsx
<CodeHighlighter language="typescript" showLineNumbers lineProps={[1, 3]}>
  {code}
</CodeHighlighter>
```

## API

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `children` | `string` | 必填 | 要高亮的代码字符串 |
| `language` | `string` | `'typescript'` | 编程语言 |
| `showLineNumbers` | `boolean` | `false` | 显示行号 |
| `startingLineNumber` | `number` | `1` | 起始行号 |
| `wrapLines` | `boolean` | `false` | 换行 |
| `wrapLongLines` | `boolean` | `true` | 长行换行而非滚动 |
| `className` | `string` | — | CSS 类名 |
| `style` | `CSSProperties` | — | 内联样式 |
| `customStyle` | `CSSProperties` | — | 高亮容器的自定义样式 |
| `lineProps` | `SyntaxHighlighterProps['lineProps']` | — | 要高亮的行 |
