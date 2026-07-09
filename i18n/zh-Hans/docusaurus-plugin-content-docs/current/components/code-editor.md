---
title: "CodeEditor"
description: "基于 CodeMirror 6 的代码编辑器，支持语法高亮、明暗主题以及命令式 ref API。"
---

# CodeEditor

基于 CodeMirror 6 的代码编辑器，支持语法高亮、明暗主题以及命令式 ref API。

> **VEF 专属组件。** 构建于 [`@uiw/react-codemirror`](https://uiwjs.github.io/react-codemirror/) 之上，并非 Ant Design 的一部分。

## 何时使用

- 需要在表单或后台工具中内联编辑结构化或代码类内容（JSON、JavaScript/TypeScript、SQL、Markdown、Python），而普通的 `Input.TextArea` 无法提供语法高亮。
- 希望编辑器自动跟随应用的暗色模式（默认 `theme="auto"`），而不必手动接入明暗切换逻辑。
- 内置语言包按需代码分割——只有实际挂载使用的语言才会被下载，因此挂载一个 `language="sql"` 的 `CodeEditor` 不会引入 JSON 或 Python 的语法包。

## 基础用法

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

## 语言

内置语言在首次使用时惰性加载，每种语言对应一个独立的打包分块：

```tsx
<CodeEditor language="typescript" value={value} onChange={setValue} />
<CodeEditor language="sql" value={value} onChange={setValue} />
<CodeEditor language="markdown" value={value} onChange={setValue} />
```

如需使用内置列表之外的语言，安装对应的 `@codemirror/lang-*` 包并直接传入其扩展：

```tsx
import { rust } from '@codemirror/lang-rust';

<CodeEditor language={rust()} value={value} onChange={setValue} />
```

## 尺寸

`height` / `minHeight` / `maxHeight` / `width` 接受 `Length`（`number` 会被解释为像素，也可以是 CSS 长度字符串）：

```tsx
<CodeEditor language="json" maxHeight={320} value={value} onChange={setValue} />
```

## 装订线与搜索

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

## 校验状态

```tsx
<CodeEditor language="json" status="error" value={value} onChange={setValue} />
```

## 命令式 Ref

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

## 表单集成

在 `<form.AppField>` 中使用 `field.CodeEditor` 字段组件，`value` / `onChange` / `onBlur` 由表单接管：

```tsx
<form.AppField name="script">
  {(field) => <field.CodeEditor label="Script" language="javascript" />}
</form.AppField>
```

`field.CodeEditor` 额外支持 `preserveEmptyString`（默认 `false`），用于控制空文档提交时是保留为 `""` 还是转换为 `null`。

## API

### CodeEditorProps

| Prop | 类型 | 默认值 | 说明 |
|------|------|---------|-------------|
| `value` | `string` | — | 受控的文档内容 |
| `defaultValue` | `string` | — | 非受控模式下的初始值；提供 `value` 时忽略 |
| `onChange` | `(value: string) => void` | — | 文档内容变化时触发 |
| `onBlur` | `() => void` | — | 编辑器失焦时触发 |
| `onFocus` | `() => void` | — | 编辑器获得焦点时触发 |
| `onCreateEditor` | `(view: EditorView, state: EditorState) => void` | — | 底层 `EditorView` 创建完成后触发一次（视图是异步挂载的） |
| `language` | `CodeEditorLanguage \| Extension \| Extension[]` | — | 语法高亮语言——内置 id，或 CodeMirror 扩展/数组 |
| `theme` | `CodeEditorTheme` | `"auto"` | 配色方案 |
| `readOnly` | `boolean` | `false` | 禁止编辑 |
| `placeholder` | `string` | — | 文档为空时显示的占位文本 |
| `autoFocus` | `boolean` | `false` | 挂载时聚焦编辑器 |
| `showLineNumbers` | `boolean` | `false` | 显示行号装订线 |
| `showFoldGutter` | `boolean` | `false` | 显示代码折叠装订线 |
| `showSearch` | `boolean` | `true` | 启用内置搜索快捷键（`Ctrl+F` / `Cmd+F`） |
| `showHighlightActiveLine` | `boolean` | `false` | 高亮光标所在行 |
| `tabSize` | `number` | `2` | 每级缩进的空格数 |
| `indentWithTab` | `boolean` | `true` | 按 Tab 插入制表符，而不是移动焦点 |
| `height` | `Length` | — | 固定高度 |
| `minHeight` | `Length` | — | 最小高度 |
| `maxHeight` | `Length` | — | 最大高度 |
| `width` | `Length` | — | 固定宽度 |
| `status` | `'error' \| 'warning'` | — | 校验状态；决定容器边框颜色 |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | 密度预设，决定字体大小 |
| `bordered` | `boolean` | `true` | 是否渲染容器边框 |
| `className` | `string` | — | 外层容器的附加类名 |
| `style` | `CSSProperties` | — | 外层容器的内联样式 |
| `extensions` | `Extension[]` | — | 附加在内置配置与语言之后的额外 CodeMirror 扩展 |
| `basicSetupOptions` | `BasicSetupOptions` | — | 对 `@uiw/codemirror-extensions-basic-setup` 配置的精细覆盖；优先级高于对应的布尔类 props |

### CodeEditorLanguage

```ts
type CodeEditorLanguage = "json" | "javascript" | "typescript" | "markdown" | "sql" | "python";
```

### CodeEditorTheme

```ts
type CodeEditorTheme = "auto" | "light" | "dark" | Extension;
```

`"auto"` 跟随所在 `<ConfigProvider>` 的暗色模式状态。传入 CodeMirror `Extension` 可接入第三方主题。

### CodeEditorRef

| 成员 | 类型 | 说明 |
|--------|------|-------------|
| `focus` | `() => void` | 将焦点移入编辑器 |
| `blur` | `() => void` | 移除编辑器焦点 |
| `getValue` | `() => string` | 读取当前文档内容（挂载前为 `""`） |
| `setValue` | `(value: string) => void` | 替换整个文档内容，并尽量保留光标位置 |
| `view` | `EditorView \| undefined` | 底层 CodeMirror `EditorView`，挂载前为 `undefined` |
