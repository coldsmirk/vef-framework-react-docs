---
title: 审批表单桥接
description: 把 form-editor 的 FormSchema 投影为流程编辑器的字段清单，以及审批后端扁平字段列表的设计器侧预览，附带保存关卡校验和一个审批专用注册表。
---

# 审批表单桥接

`@vef-framework-react/approval-form-bridge` 是一个纯函数投影库——它不渲染任何东西。它位于 `form-editor` 与审批后端 / `approval-flow-editor` 之间，把一个已设计好的 `FormSchema` 转换为 `ApprovalFlowEditor` 的 `plugins.formFields` 所消费的字段清单，外加 Go 后端将从已部署 schema 派生出的扁平字段列表的设计器侧预览。

## `createApprovalRegistries`

```ts
function createApprovalRegistries(): DeviceRegistries;
```

构建 form-editor 默认的 `DeviceRegistries`（pc + mobile），并排除掉 `APPROVAL_EXCLUDED_FIELD_TYPES`——`["switch", "daterange", "button"]`:

- `switch` / `daterange` 绑定的值（boolean / `[start, end]` 数组）是审批契约无法承载的——见下方[支持的字段类型](#支持的字段类型)。
- `button` 不绑定任何值，并且它的提交 / 重置动作会与审批壳层自身的提交控件冲突。

把结果传给 `<FormEditor registries={...}>`，这样这些被排除的控件就永远不会出现在组件面板里——用户根本无法设计出一个审批后端会因这些类型而拒绝的表单。`registries` 属性只在首次挂载时生效，而 `createApprovalRegistries` 每次调用都会返回全新的实例，所以要对它做 memoize:

```tsx
import { createApprovalRegistries } from "@vef-framework-react/approval-form-bridge";
import { FormEditor } from "@vef-framework-react/form-editor";
import { useState } from "react";

function ApprovalFormDesigner() {
  const [registries] = useState(createApprovalRegistries);

  return <FormEditor registries={registries} onSchemaChange={handleSchemaChange} />;
}
```

## `projectFormSchema`

```ts
function projectFormSchema(schema: FormSchema): ProjectionResult;

interface ProjectionResult {
  fields: ApprovalFormField[];
  formFields: FlowFormFieldDefinition[]; // FormFieldDefinition from approval-flow-editor
  issues: ProjectionIssue[];
  valid: boolean; // true iff no error-severity issue
}
```

对 schema **只遍历一次**，并从这单次遍历中派生出两个输出，因此它们永远不会互相矛盾:

- **`fields`**——扁平的 `ApprovalFormField[]` 清单，与 Go 后端自身的解析器（`internal/approval/formeditor`）在部署时从已部署 schema 派生出的结果一致。二者通过共享的 golden fixtures（`__fixtures__/formeditor-parity/`）保持同步。`sortOrder` 是遍历产出的序号；`label` 未设置时回退为该字段的 `key`。
- **`formFields`**——把同一份清单重新整形为 `FormFieldDefinition[]`，可以直接传给 `ApprovalFlowEditor` 的 `plugins.formFields`。`table` 字段会携带它的 `columns`；一个可见性可能被表单联动关掉的字段（它自身带有具备隐藏能力的联动、默认隐藏，或某个祖先容器具备隐藏能力）会被标注 `hasConditionalVisibility: true`——流程编辑器的字段权限表会把它转成一条"必填 + 被联动隐藏可能让审批死锁"的警告（见 [审批流编辑器: 宿主集成](./approval-flow-editor/host-integration.md#formfields)）。

这是一个设计期辅助手段，不属于部署路径的一部分: 后端会原样接收完整的 `FormSchema`（`DeployFlowCmd.FormSchema`），并自行派生出扁平字段列表。`projectFormSchema` 存在的意义是提前预览这个派生结果，并在部署之前就发现契约适配问题。

:::warning[迁移: v2.10.0 变更了投影结果与部署载荷]
在 v2.10.0 之前，投影产出的是一个包装对象——`ProjectionResult.definition: ApprovalFormDefinition`（`{ fields: ApprovalFormField[] }`）——而那份扁平定义**就是**部署载荷（`DeployFlowCmd.FormDefinition`）。v2.10.0（破坏性变更，`36dff11`）把结果拍平为裸字段数组 `fields: ApprovalFormField[]`，并把部署改到完整 schema 上: 后端现在接收 `FormSchema` 本身，并在服务端派生扁平列表，因此投影永远不会与实际部署的内容产生漂移。`ApprovalFormDefinition` 类型已从包导出中移除——请把 `projection.definition.fields` 迁移为 `projection.fields`，并在部署时发送 schema（而不是投影结果）。
:::

### 投影规则

- **两种设备呈现方式都会被遍历**（先 pc 后 mobile），并**按 key 去重**——提交的数据契约是跨设备共享的，所以一个只存在于移动端的字段依然会被投影出来，而同时存在于两种设备（或在同一设备上出现两次）的字段只会被投影一次，以首次出现者为准。
- **控件分类在去重之前运行**（v2.10.0，对应 Go 解析器 `classifyWidget` 先于 seen 判定的顺序）: 一个无法映射或未知的控件在*每一种*设备上都会破坏提交契约，因此一个 key 即便首次以可映射控件的身份出现、之后又以不可映射控件的身份再次出现，依然会报错——无论哪种设备先看到这个 key。对一个已经报错的 key 的重复出现会被去重为单条 issue。
- **跨设备冲突都是错误。** 如果同一个 key 在 pc 和 mobile 上映射到不同的 `ApprovalFieldKind`（`cross_device_kind_mismatch`），或者某个明细表的列集合在两种设备间不一致（`cross_device_table_mismatch`，按有序的 `key:kind` 列签名比较），会以 pc 端的投影结果为准，但同时会抛出这个 issue——因为落选的那一端设备会提交一个已部署定义所拒绝的值形态。同 kind 下 options 或校验规则的差异*不会*被检测（已在文档中注明的限制）。
- **只有根作用域内的带 key 节点会成为字段。** 布局容器（行、区块、tab）是透明的；只有绑定了值的节点才会开出一个字段。
- **一个子表单会成为单层的 `table` 字段**——它模板里的带 key 叶子节点会成为列（重复的列 key 会被去重，以首次出现者为准）。子表单嵌套在另一个子表单的模板里属于契约违规（`nested_subform_unsupported`；审批明细表只能是单层的）。`minRows` ≥ 1 会设置 `isRequired`；`minRows` / `maxRows` 会成为该字段 `validation.minLength` / `maxLength` 的行数上下界。
- **守恒规则: 不会有任何东西被静默丢弃。** 一个带 key 但控件类型无法映射的节点，总会产生一个 error 级别的 `ProjectionIssue`，绝不会被静默省略——审批表单数据是一个封闭契约，一个未被投影的字段会导致每一次提交都被拒绝。

### 支持的字段类型

| 设计器控件 | `ApprovalFieldKind` |
| --- | --- |
| `textfield` | `input` |
| `code-editor`、`textarea` | `textarea` |
| `number` | `number` |
| `select`、`radio`、`checkbox-group` | `select` |
| `date`、`datetime` | `date` |
| subform | `table` |

`switch` 和 `daterange` 总是会引发 `unmappable_field_type`——它们的运行时值（boolean、`[start, end]`）无法满足 Go 后端的字符串 / 数值 / 标量提交校验，因此 `createApprovalRegistries` 一开始就把它们对应的控件从组件面板里排除掉了。其他任何未注册的控件类型都会引发 `unknown_field_type_unprojectable`。

## 契约类型

| 导出 | 结构 |
| --- | --- |
| `ApprovalFormField` | `{ key, kind, label, placeholder?, defaultValue?, isRequired?, options?, validation?, props?, sortOrder, columnType?, scale?, columns? }`——`ApprovalFormField[]` 这个裸字段数组本身**就是**契约；没有额外的包装对象 |
| `ApprovalFieldKind` | `"input" \| "textarea" \| "select" \| "number" \| "date" \| "upload" \| "table"` |
| `ApprovalFieldOption` | `{ label: string; value: unknown }` |
| `ApprovalValidationRule` | `{ minLength?, maxLength?, min?, max?, pattern?, message? }`——在 `table` 字段上，`minLength` / `maxLength` 约束的是行数，而不是字符串长度 |

`options` 只会在一个 `select` 字段的数据源是内联的 `static` 列表、或指向某个表单全局 `static` 数据源的 `ref` 时才会被填充；一个远程数据源（或一个悬空的 `ref`）会在运行时由宿主解析，因此投影会省略 `options` 并抛出 `options_not_static`——此后后端会接受该字段提交的任意值。`columnType` 对应后端的 `ColumnDataType`，只在 `table` 存储模式下才有意义；设计器的显式覆盖值总是被尊重，但一个没有配置 `precision` 的 number 字段会刻意**不**输出 `columnType`（按控件推断出的 `"integer"` 会让 Go 运行时拒绝小数值，因此后端会回退到一个不设门槛的数值列）。一个没有配置 `precision` 的 `decimal` 列会抛出 `decimal_scale_missing`（一个 warning——存储层会四舍五入到 0 位小数）；配置了正数 `precision` 时，它会作为 `scale` 输出。`defaultValue` 和 `props` 存在于线上格式契约中，但投影器永远不会输出它们——声明它们是为了让手工构建或经宿主补充的定义能够无损往返。

## `validateApprovalSchema`

```ts
function validateApprovalSchema(
  candidate: unknown,
  registries: DeviceRegistries
): ApprovalSchemaValidationResult;

interface ApprovalSchemaValidationResult {
  valid: boolean;
  issues: ApprovalSchemaIssue[]; // ValidationIssue (form-editor) | ProjectionIssue (this package)
}
```

这是一个审批绑定表单 schema 唯一的保存期关卡，分两层运行:

1. form-editor 的 `validateSchema`（结构完整性 + 注册表成员校验）——例如，一个嵌套子表单在通用表单场景下是合法的，但在这里不是。
2. `projectFormSchema` 的契约适配检查，只有在第一步没有发现 error 时才会运行——一棵格式错误的树不值得再交给投影器处理，因为投影器假定输入是良类型的。

两层的 issue 共享同一个 `{ path, code, severity, message }` 形态，因此宿主可以用同一个列表把它们都渲染出来:

```tsx
import { validateApprovalSchema } from "@vef-framework-react/approval-form-bridge";

const result = validateApprovalSchema(candidate, registries);

if (!result.valid) {
  for (const issue of result.issues) {
    console.warn(`[${issue.severity}] ${issue.path}: ${issue.message}`);
  }
}
```

## 投影 issue

`ProjectionIssue`: `{ path: string; code: ProjectionIssueCode; severity: "error" | "warning"; message: string }`。`path` 是字段 key 链路——顶层字段是 `"amount"`，明细表列则是 `"items.price"` 这样的形式。与 form-editor 的 `ValidationIssue` 一样，`message` 是预先渲染好的中文产品文案；请针对 `code` 和 `path` 编程。

| 代码 | 严重程度 | 含义 |
| --- | --- | --- |
| `unmappable_field_type` | error | 该控件的值形态无法满足审批契约（例如 `switch`、`daterange`）。 |
| `unknown_field_type_unprojectable` | error | 该控件类型完全没有注册 / 无法映射。 |
| `nested_subform_unsupported` | error | 某个子表单的模板里包含另一个子表单；审批明细表只能是单层的。 |
| `table_columns_empty` | error | 某个子表单没有任何可投影的列。 |
| `pattern_unsupported` | error | 该字段的正则表达式使用了后端 RE2 引擎不支持的语法（先行/后行断言、反向引用）——部署会被拒绝。 |
| `cross_device_kind_mismatch` | error | 同一个字段 key 在 pc 与 mobile 上映射到了不同的 kind。 |
| `cross_device_table_mismatch` | error | 某个子表单的列集合在 pc 与 mobile 之间不一致。 |
| `decimal_scale_missing` | warning | 某个 `decimal` 列没有配置精度；存储时会四舍五入到 0 位小数。 |
| `options_not_static` | warning | 某个 select 字段的选项来自非 static 数据源；投影会省略它们，后端会接受任意提交值。 |
| `linkage_not_projected` | warning | 该字段带有审批后端不会求值的联动规则——一个被联动隐藏的字段仍会从提交负载中丢掉自己的值，这可能与一个静态的 `isRequired` 相冲突。 |

## 端到端示例

把桥接与两个编辑器组合起来——这正是 `approval-flow-editor` 自己的 playground 演示所使用的模式:

```tsx
import type { EditorPlugins, FlowDefinition } from "@vef-framework-react/approval-flow-editor";
import type { FormSchema } from "@vef-framework-react/form-editor";

import { ApprovalFlowEditor, validateFlowDefinition } from "@vef-framework-react/approval-flow-editor";
import { createApprovalRegistries, projectFormSchema, validateApprovalSchema } from "@vef-framework-react/approval-form-bridge";
import { FormEditor } from "@vef-framework-react/form-editor";
import { useMemo, useState } from "react";

function ApprovalDesigner() {
  const [registries] = useState(createApprovalRegistries);
  const [formSchema, setFormSchema] = useState<FormSchema | null>(null);
  const [flowDefinition, setFlowDefinition] = useState<FlowDefinition>({ nodes: [], edges: [] });

  // One walk feeds the flow editor's field metadata and the review inventory.
  const projection = useMemo(() => formSchema ? projectFormSchema(formSchema) : null, [formSchema]);

  // Two-layer save gate for the form step.
  const formGate = useMemo(
    () => formSchema ? validateApprovalSchema(formSchema, registries) : null,
    [formSchema, registries]
  );

  const plugins = useMemo<EditorPlugins>(
    () => ({ formFields: projection?.formFields ?? [] }),
    [projection]
  );

  const flowErrors = useMemo(
    () => validateFlowDefinition(flowDefinition, projection?.formFields ?? []),
    [flowDefinition, projection]
  );

  return (
    <>
      <FormEditor registries={registries} onSchemaChange={setFormSchema} />

      {formGate && !formGate.valid && <IssueList issues={formGate.issues} />}

      <ApprovalFlowEditor plugins={plugins} value={flowDefinition} onChange={setFlowDefinition} />

      <Button disabled={flowErrors.length > 0} onClick={() => deploy(formSchema, flowDefinition)}>
        Deploy
      </Button>
    </>
  );
}
```

关于 `plugins.formFields` 和 `validateFlowDefinition` 在流程一侧做了什么，见 [审批流编辑器: 宿主集成](./approval-flow-editor/host-integration.md)；关于 `FormSchema`、`DeviceRegistries` 和 `validateSchema`，见 [form-editor 参考](./form-editor/reference.md)。
