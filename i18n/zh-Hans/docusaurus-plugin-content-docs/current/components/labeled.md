---
title: "Labeled"
description: "一个把表单风格标签置于任意控件之上的布局原语，为辅助技术提供真正的 label 与 group 语义。"
---

# Labeled

一个把表单风格标签置于任意控件之上的布局原语，为辅助技术提供真正的 label 与 group 语义。它与垂直表单项的排版一致，让游离在表单系统之外的控件在视觉上与周围的 `AppField` 表单项对齐。

> **VEF 专属组件。** v2.12.0 新增。

## 何时使用

- 为不是表单字段组件的控件——键值对编辑器（[`LabelsEditor`](./labels.md)）、主体选择器、[`CodeEditor`](./code-editor.md) 实例——加上顶部标签，使其与周围的垂直表单项对齐。
- 在这类控件上显示必填标记或辅助提示。
- 不要把它用于常规表单字段：[`Form`](./form.md) 系统的 `AppField` 字段组件已经自带 label、错误与提示的渲染骨架。

## 基础用法

子元素是任意的——`Labeled` 绝不会向其注入 props。典型用法是在表单布局中包裹一个复合编辑器：

```tsx
import { Labeled, LabelsEditor } from '@vef-framework-react/components';
import { useState } from 'react';

export default function Demo() {
  const [labels, setLabels] = useState<Record<string, string>>({});

  return (
    <Labeled hint="Values may be left empty" label="Labels">
      <LabelsEditor value={labels} onChange={setLabels} />
    </Labeled>
  );
}
```

## 必填标记与原生关联

当子元素渲染的是单个、id 已知的控件时，传入 `htmlFor` 即可在 group 语义之上叠加原生的标签点击关联：

```tsx
import { Input, Labeled } from '@vef-framework-react/components';

<Labeled required htmlFor="webhook-url" label="Webhook URL">
  <Input id="webhook-url" placeholder="https://example.com/hook" />
</Labeled>
```

## 无障碍语义

`Labeled` 承载的是真正的 label 与 group 语义，而不只是视觉样式：

- 外层包装是一个带 `role="group"` 的 [`Stack`](./stack.md)，其 `aria-labelledby` 指向标签元素——即使子元素是复合结构、不存在单一控件 id，辅助技术也会用该标签命名整个分组。
- 标签渲染为原生 `<label>` 元素；配合 `htmlFor` 时还会额外获得指向该控件的原生标签点击/朗读关联。
- 提供 `hint` 时，分组的 `aria-describedby` 会指向提示文本，使其兼作无障碍描述。
- `required` 标记渲染为一个 `aria-hidden` 的红色 `*`，并配有视觉上隐藏的文本，因此屏幕阅读器会朗读必填要求，而不是读出一个孤零零的星号。

## API

### LabeledProps

| Prop | Type | Default | 说明 |
|------|------|---------|-------------|
| `label` | `ReactNode` | — | 显示在控件上方的标签，与垂直表单项的排版一致 |
| `required` | `boolean` | `false` | 在标签前渲染必填标记（红色 `*`，对辅助技术隐藏，并配有视觉上隐藏的替代文本） |
| `hint` | `ReactNode` | — | 控件下方的辅助提示，以小号次要文本渲染，并接入为分组的无障碍描述 |
| `htmlFor` | `string` | — | 被标注控件的 id，用于原生的标签点击关联。省略时（复合子元素没有单一控件 id），group 标注仍会为辅助技术命名子元素 |
| `children` | `ReactNode` | — | 被标注的控件；原样渲染，不注入任何 props |
