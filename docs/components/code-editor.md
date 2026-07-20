---
title: "CodeEditor"
description: "A CodeMirror 6 code editor with syntax highlighting, light/dark theming, declarative completions, one-click formatting, and an imperative ref API."
---

# CodeEditor

A CodeMirror 6 code editor with syntax highlighting, light/dark theming, declarative completions, one-click formatting, and an imperative ref API.

> **VEF-specific component.** Built on [`@uiw/react-codemirror`](https://uiwjs.github.io/react-codemirror/). Not part of Ant Design.

## When to Use

- Editing structured or code-like content (JSON, JavaScript/TypeScript, SQL, Markdown, Python, XML) inline in a form or admin tool, where a plain `Input.TextArea` doesn't provide syntax highlighting.
- The editor should follow the app's dark mode automatically (`theme="auto"`, the default) rather than needing a manually wired light/dark toggle.
- You want to offer host-specific autocomplete (injected bindings, JSON Schema keywords) without writing CodeMirror completion sources — the declarative `completions` catalog covers that.
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

## Formatting

Languages with a built-in formatter show a floating format action (wand icon) in the top-right corner while the editor is hovered or focused. It is controlled by `showFormat` (default `true`) and never appears on read-only editors or on languages without a formatter:

- `"json"` — formatted through prettier's `json` parser. This is lossless: number literals beyond `2^53` (e.g. large numeric ids) are reprinted verbatim instead of being rounded the way a `JSON.parse` / `JSON.stringify` round-trip would. A fully minified document is expanded to a multi-line layout.
- `"javascript"` / `"typescript"` — formatted through prettier's standalone build (`babel` / `babel-ts` parsers), loaded lazily on first use so prettier never enters the initial bundle.

Formatting uses the editor's `tabSize` as the indent width. If the document cannot be parsed, an error message is shown and the content is left untouched. Because the formatter runs asynchronously, a result is discarded if the user typed while it was computing — new keystrokes are never overwritten.

```tsx
<CodeEditor language="json" showFormat={false} value={value} onChange={setValue} />
```

## Completions

Pass a declarative completion catalog through `completions` to offer autocomplete entries without touching CodeMirror APIs. Entries form a tree:

- On `"javascript"` / `"typescript"`, root entries complete as global identifiers, and an entry's `children` complete after `label.` — suitable for describing host-injected bindings and libraries. The catalog merges with the language's own completions instead of replacing them.
- On `"json"`, root entries complete as object keys inside property-name strings (e.g. a JSON Schema keyword catalog). At a bare key position, the fully quoted key is inserted on an explicit completion request (`Ctrl+Space`). Value positions are never matched.
- Other languages ignore the catalog — for a custom language extension, register a completion source through `extensions` instead.

```tsx
import type { CompletionEntry } from '@vef-framework-react/components';

// Keep the reference stable (module scope / useMemo) — a fresh array each
// render reconfigures the live editor.
const completions: CompletionEntry[] = [
  {
    label: 'http',
    type: 'namespace',
    info: 'Host-injected HTTP client',
    children: [
      { label: 'get', type: 'function', detail: '(url, options?)', info: 'Send a GET request' },
      { label: 'post', type: 'function', detail: '(url, body?, options?)', info: 'Send a POST request' },
    ],
  },
  { label: 'context', type: 'variable', info: 'Execution context of the current run' },
];

<CodeEditor language="javascript" completions={completions} value={value} onChange={setValue} />
```

The lower-level completion source builder `completeFromEntries(entries)` is also exported for wiring the same catalog into custom CodeMirror setups.

Completion popups (and other CodeMirror tooltips) are rendered under `document.body` at an elevated z-index, so they stay visible when the editor is mounted inside an antd `Modal` or `Drawer` and are not clipped by the editor's rounded-corner container.

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
| `completions` | `CompletionEntry[]` | — | Declarative completion catalog. On `"javascript"` / `"typescript"` entries complete as identifiers (with `children` completing after `label.`) alongside the language's own completions; on `"json"` entries complete as object keys inside property-name strings. Other languages ignore it. Pass a stable reference — a fresh array each render reconfigures the live editor |
| `showFormat` | `boolean` | `true` | Show the floating format action when the language has a built-in formatter (`"json"`, `"javascript"`, `"typescript"` — all via prettier, loaded on first use). Never shown for read-only editors |
| `extensions` | `Extension[]` | — | Extra CodeMirror extensions appended after the built-in setup and language — use for linters, custom keymaps, or any other CodeMirror extension |
| `basicSetupOptions` | `BasicSetupOptions` | — | Fine-grained overrides for `@uiw/codemirror-extensions-basic-setup`; takes precedence over the dedicated boolean props |

### CompletionEntry

One entry of the declarative completion catalog. Entries form a tree: root entries complete as globals, and an entry's `children` complete after `label.`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | The identifier to insert (required) |
| `type` | `string` | `"namespace"` for entries with `children`, else `"variable"` | Completion icon kind, in CodeMirror vocabulary: `"function"`, `"method"`, `"property"`, `"variable"`, `"namespace"`, `"class"`, `"constant"`, ... |
| `detail` | `string` | — | Short signature or annotation rendered after the label, e.g. `"(url, options?)"` |
| `info` | `string` | — | Documentation shown in the info panel next to the selected option |
| `boost` | `number` | — | Ranking boost (`-99..99`) applied when options score equally |
| `children` | `CompletionEntry[]` | — | Members offered after `label.` |

### CodeEditorLanguage

```ts
type CodeEditorLanguage = "json" | "javascript" | "typescript" | "markdown" | "sql" | "python" | "xml";
```

To use a language outside this list, install the corresponding `@codemirror/lang-*` package and pass its extension through `language` (or `extensions`).

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
