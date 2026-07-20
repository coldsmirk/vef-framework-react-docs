---
title: "CodeEditor"
description: "基于 CodeMirror 6 的代码编辑器，支持语法高亮、明暗主题、声明式补全、一键格式化以及命令式 ref API。"
---

# CodeEditor

基于 CodeMirror 6 的代码编辑器，支持语法高亮、明暗主题、声明式补全、一键格式化以及命令式 ref API。

> **VEF 专属组件。** 构建于 [`@uiw/react-codemirror`](https://uiwjs.github.io/react-codemirror/) 之上，并非 Ant Design 的一部分。

## 何时使用

- 需要在表单或后台工具中内联编辑结构化或代码类内容（JSON、JavaScript/TypeScript、SQL、Markdown、Python、XML），而普通的 `Input.TextArea` 无法提供语法高亮。
- 希望编辑器自动跟随应用的暗色模式（默认 `theme="auto"`），而不必手动接入明暗切换逻辑。
- 想提供宿主专属的自动补全（注入的绑定、JSON Schema 关键字）而不编写 CodeMirror 补全源——声明式的 `completions` 目录足以覆盖。
- 语言包按需代码分割——只有实际挂载使用的语言才会被下载，因此挂载一个 `language="sql"` 的 `CodeEditor` 不会引入 JSON 或 Python 的语法包。

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

## 格式化

拥有内置格式化器的语言，在编辑器悬停或聚焦时会在右上角显示一个悬浮的格式化操作（魔杖图标）。它由 `showFormat` 控制（默认 `true`），在只读编辑器或没有格式化器的语言上绝不会出现：

- `"json"`——经 prettier 的 `json` 解析器格式化。这是无损的：超出 `2^53` 的数字字面量（例如大数字 id）会被原样重印，而不会像 `JSON.parse` / `JSON.stringify` 往返那样被舍入。完全压缩的文档会被展开为多行布局。
- `"javascript"` / `"typescript"`——经 prettier 的 standalone 构建（`babel` / `babel-ts` 解析器）格式化，首次使用时才惰性加载，因此 prettier 绝不会进入初始 bundle。

格式化使用编辑器的 `tabSize` 作为缩进宽度。文档无法解析时会显示错误消息，内容保持不动。由于格式化器异步运行，若用户在计算期间输入了内容，其结果会被丢弃——新的按键输入永远不会被覆盖。

```tsx
<CodeEditor language="json" showFormat={false} value={value} onChange={setValue} />
```

## 补全

通过 `completions` 传入声明式补全目录，即可在不接触 CodeMirror API 的情况下提供自动补全条目。条目构成一棵树：

- 在 `"javascript"` / `"typescript"` 上，根条目作为全局标识符补全，条目的 `children` 在 `label.` 之后补全——适合描述宿主注入的绑定和库。该目录与语言自身的补全合并，而非取而代之。
- 在 `"json"` 上，根条目在属性名字符串内部作为对象键补全（例如 JSON Schema 关键字目录）。在裸键位置，显式请求补全（`Ctrl+Space`）时会插入带完整引号的键。值位置永远不会匹配。
- 其他语言忽略该目录——对自定义语言扩展，请改为通过 `extensions` 注册补全源。

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

更底层的补全源构建函数 `completeFromEntries(entries)` 也已导出，可把同一份目录接入自定义的 CodeMirror 配置。

补全弹层（以及其他 CodeMirror tooltip）渲染在 `document.body` 下并使用较高的 z-index，因此当编辑器挂载在 antd 的 `Modal` 或 `Drawer` 内时仍然可见，也不会被编辑器的圆角容器裁剪。

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
| `completions` | `CompletionEntry[]` | — | 声明式补全目录。在 `"javascript"` / `"typescript"` 上条目作为标识符补全（`children` 在 `label.` 之后补全），与语言自身的补全并存；在 `"json"` 上条目在属性名字符串内部作为对象键补全。其他语言忽略它。请传入稳定引用——每次渲染新建数组会重新配置运行中的编辑器 |
| `showFormat` | `boolean` | `true` | 当语言拥有内置格式化器（`"json"`、`"javascript"`、`"typescript"`——均经 prettier，首次使用时加载）时显示悬浮的格式化操作。只读编辑器上绝不显示 |
| `extensions` | `Extension[]` | — | 附加在内置配置与语言之后的额外 CodeMirror 扩展——可用于 linter、自定义快捷键或任何其他 CodeMirror 扩展 |
| `basicSetupOptions` | `BasicSetupOptions` | — | 对 `@uiw/codemirror-extensions-basic-setup` 配置的精细覆盖；优先级高于对应的布尔类 props |

### CompletionEntry

声明式补全目录中的一个条目。条目构成一棵树：根条目作为全局标识符补全，条目的 `children` 在 `label.` 之后补全。

| Prop | 类型 | 默认值 | 说明 |
|------|------|---------|-------------|
| `label` | `string` | — | 要插入的标识符（必填） |
| `type` | `string` | 带 `children` 的条目为 `"namespace"`，否则为 `"variable"` | 补全图标类型，采用 CodeMirror 的词汇：`"function"`、`"method"`、`"property"`、`"variable"`、`"namespace"`、`"class"`、`"constant"` 等 |
| `detail` | `string` | — | 渲染在 label 之后的简短签名或注解，例如 `"(url, options?)"` |
| `info` | `string` | — | 在所选选项旁的信息面板中显示的文档 |
| `boost` | `number` | — | 排名加权（`-99..99`），在选项得分相同时生效 |
| `children` | `CompletionEntry[]` | — | 在 `label.` 之后提供的成员 |

### CodeEditorLanguage

```ts
type CodeEditorLanguage = "json" | "javascript" | "typescript" | "markdown" | "sql" | "python" | "xml";
```

如需使用该列表之外的语言，安装对应的 `@codemirror/lang-*` 包，并通过 `language`（或 `extensions`）传入其扩展。

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
