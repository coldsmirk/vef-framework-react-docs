---
title: "Labels"
description: "展示、编辑和过滤键值对标签——审批流标签与集成契约标签背后共享的组件套件。"
---

# Labels

展示、编辑和过滤键值对标签。标签是附着在业务实体（审批流、集成契约）上的普通 `Record<string, string>` 映射，由服务端按 AND 组合的等值过滤器进行匹配；本套件为其提供展示标签、行编辑器和过滤输入框，以及它们共享的解析/校验辅助函数。

> **VEF 专属组件。** 已在 v2.12.0 中从 `@vef-framework-react/approval` 迁移至 `@vef-framework-react/components`——见下方的[迁移说明](#从-vef-framework-reactapproval-迁移)。

## 何时使用

- 在表格列或详情视图中展示实体的标签（`LabelsDisplay`）。
- 让用户在表单中编辑标签映射（`LabelsEditor`）。
- 通过 `key=value` 标签输入按标签过滤列表（`LabelFilterSelect`）。

## 展示标签

`LabelsDisplay` 将映射渲染为紧凑的标签——`key: value`，当值是空的存在性标志时只渲染 `key` 本身。映射为空或缺失时渲染一个次要色的 `-` 占位符：

```tsx
import { LabelsDisplay } from '@vef-framework-react/components';

// Renders the tags "app: crm" and "mobile".
<LabelsDisplay labels={{ app: 'crm', mobile: '' }} />
```

典型的表格列写法：

```tsx
const columns = [
  // ...
  {
    title: 'Labels',
    dataIndex: 'labels',
    render: (labels: Record<string, string>) => <LabelsDisplay labels={labels} />
  }
];
```

## 编辑标签

`LabelsEditor` 是一个受控的键/值行编辑器，产出普通的 `Record<string, string>`。它以内联方式校验，而不是走表单校验器——请搭配 [`Labeled`](./labeled.md) 实现标签在上的布局，就像集成契约表单那样：

```tsx
import { Labeled, LabelsEditor, useFormContext } from '@vef-framework-react/components';

function ContractLabelsField() {
  const { AppField } = useFormContext<{ labels?: Record<string, string> }>();

  return (
    <AppField name="labels">
      {(field) => (
        <Labeled hint="Values may be left empty" label="Labels">
          <LabelsEditor value={field.state.value} onChange={field.handleChange} />
        </Labeled>
      )}
    </AppField>
  );
}
```

行为说明：

- **编辑中的行不会丢失。** 行是本地状态：键为空的行会保留在屏幕上但不计入产出的映射；当表单把产出的值回显为 `value` 时，编辑器能识别出这是自己刚产出的对象，不会覆盖编辑中的行。外部的 `value` 变化（例如表单重置）则会重新同步各行。
- **内联校验。** 违反字符集或长度规则的键会得到错误边框，并在行列表下方显示一条共享的红色说明文本；该值仍会照常产出，后端会在保存时按同一规则拒绝（见[校验规则](#校验规则)）。
- **重复键会合并。** 产出的映射以标签键为键，因此两行同名键会解析为最后一行的值。
- **固定的 UI 文案。** 占位符、添加行按钮和校验消息目前是固定的中文字符串；没有 i18n 相关的 props。

## 按标签过滤

`LabelFilterSelect` 是面向搜索栏的紧凑过滤输入框：键值对以 `key=value` 标签的形式输入（只写 `key` 表示空值的存在性匹配），并产出携带标签的列表查询所接受的等值过滤映射，由后端做 AND 组合。它渲染为一个抑制了下拉面板的 tags 模式 [`Select`](./select.md)：

```tsx
import { LabelFilterSelect, useFormContext } from '@vef-framework-react/components';

function FlowSearchFields() {
  const { AppField } = useFormContext<{ labels?: Record<string, string> }>();

  return (
    <AppField name="labels">
      {(field) => (
        <LabelFilterSelect value={field.state.value} onChange={field.handleChange} />
      )}
    </AppField>
  );
}
```

当所有标签都被清除时，它产出 `undefined` 而非空映射，让搜索值干净地消失。

## 校验规则

编辑器在客户端镜像了后端的标签校验（`orm.ValidateLabels`，审批流标签与集成契约标签共用）。提前校验的意义在于：超出字符集的键（例如带点号的 `app.id`）会被*存储*下来，却永远无法命中等值过滤器，且无声无息。

- 键：必须匹配 `LABEL_KEY_PATTERN`——`/^[A-Z0-9](?:[\w-]*[A-Z0-9])?$/i`——即字母、数字、`-` 和 `_`，且以字母或数字开头和结尾；最长 63 个字符。
- 值：最长 256 个字符，按字符数计（与后端的 rune 计数一致）而非字节数——256 个中日韩字符也是合法的。允许空值，空值充当存在性标志。

两者都已导出，供自定义 UI 使用：

```tsx
import { isValidLabel, LABEL_KEY_PATTERN } from '@vef-framework-react/components';

isValidLabel('app', 'crm');   // true
isValidLabel('app.id', 'x');  // false — dotted key would never match the filter
```

## 辅助函数

`parseLabelFilters` 与 `formatLabelFilters` 在标签条目和过滤映射之间互相转换（`LabelFilterSelect` 内部使用，也导出给自定义过滤 UI）：

```tsx
import { formatLabelFilters, parseLabelFilters } from '@vef-framework-react/components';

parseLabelFilters(['app=crm', 'mobile']);   // { app: 'crm', mobile: '' }
parseLabelFilters([]);                      // undefined
formatLabelFilters({ app: 'crm', mobile: '' }); // ['app=crm', 'mobile']
```

- `parseLabelFilters(entries: string[]): Record<string, string> | undefined`——按*第一个* `=` 拆分每个条目（值可以包含 `=`），去除键和值两侧的空白，把只有键的条目视为空值的存在性匹配，丢弃没有键的条目；当没有剩余条目时返回 `undefined`。
- `formatLabelFilters(labels: Record<string, string> | undefined): string[]`——前者的逆操作；空值序列化回只有键的形式。

## 从 `@vef-framework-react/approval` 迁移

v2.12.0 中，该套件从审批包移入共享组件包（对 approval 的使用方是破坏性变更）。请更新导入：

```ts
// Before (≤ v2.11.x)
import { LabelsDisplay, LabelsEditor, LabelFilterSelect } from '@vef-framework-react/approval';

// After (v2.12.0+)
import { LabelsDisplay, LabelsEditor, LabelFilterSelect } from '@vef-framework-react/components';
```

有两个导出被重命名，去掉了审批流专属的措辞：

| 旧导出（`@vef-framework-react/approval`） | 新导出（`@vef-framework-react/components`） |
|----------------------------------------------|------------------------------------------------|
| `FLOW_LABEL_KEY_PATTERN` | `LABEL_KEY_PATTERN` |
| `isValidFlowLabel` | `isValidLabel` |

`parseLabelFilters`、`formatLabelFilters` 以及所有组件/prop 类型名保持不变。

:::note
有一个名字相近但无关的导出：`semanticSceneLabels`（同样由 `@vef-framework-react/components` 导出）不属于本套件——它把语义反馈场景（`success` / `info` / `warning` / `error`）映射为各自的默认标题，供[消息与通知](./notifications.md)使用。
:::

## API

### LabelsDisplayProps

| Prop | Type | Default | 说明 |
|------|------|---------|-------------|
| `labels` | `Record<string, string>` | — | 要渲染的标签映射。每个条目渲染为一个 `key: value` 标签（值为 `""` 时只渲染 `key`）；映射为空或缺失时渲染一个次要色的 `-` |

### LabelsEditorProps

| Prop | Type | Default | 说明 |
|------|------|---------|-------------|
| `value` | `Record<string, string>` | — | 编辑中的标签映射。外部变更会重新同步各行，但当它正是编辑器自己刚产出的对象时除外（编辑中的空键行会被保留） |
| `onChange` | `(labels: Record<string, string>) => void` | — | 每次行编辑、添加或删除时携带完整产出映射触发；键为空的行不计入 |
| `disabled` | `boolean` | — | 禁用所有输入框以及添加/删除按钮 |

### LabelFilterSelectProps

| Prop | Type | Default | 说明 |
|------|------|---------|-------------|
| `value` | `Record<string, string> \| undefined` | — | 当前过滤映射，渲染为 `key=value` 标签（空值渲染为只有 `key`）。必填 |
| `onChange` | `(labels: Record<string, string> \| undefined) => void` | — | 携带解析后的过滤映射触发；没有有效条目时携带 `undefined`。必填 |
| `placeholder` | `string` | `"标签过滤，如 app=crm"` | 为空时显示的占位符 |
| `style` | `CSSProperties` | — | 内联样式，覆盖在默认的 `minWidth: 200` 之上 |

### 函数与常量

| 导出 | 类型 | 说明 |
|--------|------|-------------|
| `LABEL_KEY_PATTERN` | `RegExp` | `/^[A-Z0-9](?:[\w-]*[A-Z0-9])?$/i`——后端接受的键字符集 |
| `isValidLabel` | `(key: string, value: string) => boolean` | 后端校验的客户端镜像：键字符集 + 最长 63 字符，值最长 256 个字符（按字符数而非字节数） |
| `parseLabelFilters` | `(entries: string[]) => Record<string, string> \| undefined` | 把 `key=value` 标签条目解析为过滤映射；只有键 ⇒ 存在性匹配；为空时返回 `undefined` |
| `formatLabelFilters` | `(labels: Record<string, string> \| undefined) => string[]` | 把过滤映射序列化回 `key=value` 条目 |
