---
title: "CodeEditor"
description: "A CodeMirror 6 code editor with syntax highlighting, light/dark theming, and an imperative ref API."
---

# CodeEditor

A CodeMirror 6 code editor with syntax highlighting, light/dark theming, and an imperative ref API.

> **VEF-specific component.** Built on [`@uiw/react-codemirror`](https://uiwjs.github.io/react-codemirror/). Not part of Ant Design.

## When to Use

- Editing structured or code-like content (JSON, JavaScript/TypeScript, SQL, Markdown, Python) inline in a form or admin tool, where a plain `Input.TextArea` doesn't provide syntax highlighting.
- The editor should follow the app's dark mode automatically (`theme="auto"`, the default) rather than needing a manually wired light/dark toggle.
- Language packages are code-split — only the languages actually mounted are downloaded, so mounting a `CodeEditor` with `language="sql"` doesn't pull in the JSON or Python grammar.

## Basic Usage

```tsx
import { CodeEditor } from '@vef-framework-react/components';
import { useState } from 'react';

export default function Demo() {
  const [value, setValue] = useState('{\n  "hello": "world"\n}');

  return (
    <CodeEditor
      language="json"
      value={value}
      onChange={setValue}
    />
  );
}
```

## Languages

Built-in languages are lazily imported on first use, one bundle chunk per language:

```tsx
<CodeEditor language="typescript" value={value} onChange={setValue} />
<CodeEditor language="sql" value={value} onChange={setValue} />
<CodeEditor language="markdown" value={value} onChange={setValue} />
```

To use a language outside the built-in list, install the matching `@codemirror/lang-*` package and pass its extension directly:

```tsx
import { rust } from '@codemirror/lang-rust';

<CodeEditor language={rust()} value={value} onChange={setValue} />
```

## Sizing

`height` / `minHeight` / `maxHeight` / `width` accept a `Length` (`number`, interpreted as pixels, or a CSS length string):

```tsx
<CodeEditor language="json" maxHeight={320} value={value} onChange={setValue} />
```

## Gutters and Search

```tsx
<CodeEditor
  language="typescript"
  showLineNumbers
  showFoldGutter
  showHighlightActiveLine
  value={value}
  onChange={setValue}
/>
```

## Validation Status

```tsx
<CodeEditor language="json" status="error" value={value} onChange={setValue} />
```

## Imperative Ref

```tsx
import { CodeEditor } from '@vef-framework-react/components';
import type { CodeEditorRef } from '@vef-framework-react/components';
import { useRef } from 'react';

export default function Demo() {
  const editorRef = useRef<CodeEditorRef>(null);

  return (
    <>
      <CodeEditor ref={editorRef} language="json" defaultValue="{}" />
      <button onClick={() => editorRef.current?.focus()}>Focus</button>
      <button onClick={() => console.log(editorRef.current?.getValue())}>Log value</button>
    </>
  );
}
```

## Form Integration

Use the `field.CodeEditor` field component inside `<form.AppField>`, which owns `value` / `onChange` / `onBlur`:

```tsx
<form.AppField name="script">
  {(field) => <field.CodeEditor label="Script" language="javascript" />}
</form.AppField>
```

`field.CodeEditor` additionally accepts `preserveEmptyString` (default `false`) to control whether an empty document is submitted as `""` or converted to `null`.

## API

### CodeEditorProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | — | Controlled document value |
| `defaultValue` | `string` | — | Initial value for uncontrolled mode; ignored when `value` is provided |
| `onChange` | `(value: string) => void` | — | Fired whenever the document content changes |
| `onBlur` | `() => void` | — | Fired when the editor loses focus |
| `onFocus` | `() => void` | — | Fired when the editor gains focus |
| `onCreateEditor` | `(view: EditorView, state: EditorState) => void` | — | Fired once the underlying `EditorView` is created (the view mounts asynchronously) |
| `language` | `CodeEditorLanguage \| Extension \| Extension[]` | — | Syntax highlighting language — a built-in id, or a CodeMirror extension / array |
| `theme` | `CodeEditorTheme` | `"auto"` | Color scheme |
| `readOnly` | `boolean` | `false` | Disable editing |
| `placeholder` | `string` | — | Placeholder shown while the document is empty |
| `autoFocus` | `boolean` | `false` | Focus the editor on mount |
| `showLineNumbers` | `boolean` | `false` | Show the line-number gutter |
| `showFoldGutter` | `boolean` | `false` | Show the code-folding gutter |
| `showSearch` | `boolean` | `true` | Enable the built-in search keymap (`Ctrl+F` / `Cmd+F`) |
| `showHighlightActiveLine` | `boolean` | `false` | Highlight the line containing the cursor |
| `tabSize` | `number` | `2` | Spaces per indentation level |
| `indentWithTab` | `boolean` | `true` | Insert a tab character on Tab, instead of moving focus |
| `height` | `Length` | — | Fixed height |
| `minHeight` | `Length` | — | Minimum height |
| `maxHeight` | `Length` | — | Maximum height |
| `width` | `Length` | — | Fixed width |
| `status` | `'error' \| 'warning'` | — | Validation status; drives the container border color |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Density preset, drives font size |
| `bordered` | `boolean` | `true` | Render the container border |
| `className` | `string` | — | Additional class on the outer wrapper |
| `style` | `CSSProperties` | — | Inline style on the outer wrapper |
| `extensions` | `Extension[]` | — | Extra CodeMirror extensions appended after the built-in setup and language |
| `basicSetupOptions` | `BasicSetupOptions` | — | Fine-grained overrides for `@uiw/codemirror-extensions-basic-setup`; takes precedence over the dedicated boolean props |

### CodeEditorLanguage

```ts
type CodeEditorLanguage = "json" | "javascript" | "typescript" | "markdown" | "sql" | "python";
```

### CodeEditorTheme

```ts
type CodeEditorTheme = "auto" | "light" | "dark" | Extension;
```

`"auto"` follows the surrounding `<ConfigProvider>` dark-mode state. Pass a CodeMirror `Extension` to plug in a third-party theme.

### CodeEditorRef

| Member | Type | Description |
|--------|------|-------------|
| `focus` | `() => void` | Move focus into the editor |
| `blur` | `() => void` | Remove focus from the editor |
| `getValue` | `() => string` | Read the current document content (`""` before mount) |
| `setValue` | `(value: string) => void` | Replace the entire document content, preserving the cursor when possible |
| `view` | `EditorView \| undefined` | The underlying CodeMirror `EditorView`, `undefined` before mount |
