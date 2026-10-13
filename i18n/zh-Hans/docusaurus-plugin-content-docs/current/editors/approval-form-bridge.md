---
title: 审批表单桥接
description: 把 form-editor 的 FormSchema 投影为流程编辑器的字段清单，以及审批后端扁平字段列表的设计器侧预览，附带保存关卡、编辑器内校验器和一个审批专用注册表。
---

# 审批表单桥接

`@vef-framework-react/approval-form-bridge` 是一个纯函数投影库——它不渲染任何东西。它位于 `form-editor` 与审批后端 / `approval-flow-editor` 之间，把一个已设计好的 `FormSchema` 转换为 `ApprovalFlowEditor` 的 `plugins.formFields` 所消费的字段清单，外加 Go 后端将从已部署 schema 派生出的扁平字段列表的设计器侧预览。它的校验器负责对照审批契约检查 schema：[`validateApprovalSchema`](#validateapprovalschema) 作为保存关卡，[`validateApprovalProjection`](#validateapprovalprojection) 用在设计器内部。

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
| `ApprovalFormField` | `{ key, kind, label, placeholder?, defaultValue?, isRequired?, options?, optionSource?, validation?, props?, sortOrder, columnType?, scale?, columns? }`——`ApprovalFormField[]` 这个裸字段数组本身**就是**契约；没有额外的包装对象 |
| `ApprovalFieldKind` | `"input" \| "textarea" \| "select" \| "number" \| "date" \| "upload" \| "table"` |
| `ApprovalFieldOption` | `{ label: string; value: unknown }` |
| `ApprovalValidationRule` | `{ minLength?, maxLength?, min?, max?, pattern?, message? }`——在 `table` 字段上，`minLength` / `maxLength` 约束的是行数，而不是字符串长度 |
| `ApprovalFormField["optionSource"]` | `{ kind: "remote"; request?: RemoteDataSourceRequest; mapping?: RemoteOptionMapping }`——`request` / `mapping` 直接复用 form-editor 自己的类型；`kind` 刻意比设计器的数据源联合类型更窄，见[远程选项来源](#远程选项来源)。这个包没有以独立的名称导出该结构（及其 `kind` 联合类型）：请通过 `NonNullable<ApprovalFormField["optionSource"]>` 取得它。 |

`options` 只会在一个 `select` 字段的数据源是内联的 `static` 列表、或指向某个表单全局 `static` 数据源的 `ref` 时才会被填充。一个选项无法被枚举出来的数据源——`remote` 数据源，无论是内联的还是经由 `ref` 抵达的——转而投影出 [`optionSource`](#远程选项来源)；而一个悬空的 `ref` 或未知 kind 则两者都不投影。以上每一种情况仍然会抛出 `options_not_static`，后端也仍然会接受该字段提交的任意值，因为它的 select 校验只读 `options`。`columnType` 对应后端的 `ColumnDataType`，只在 `table` 存储模式下才有意义；设计器的显式覆盖值总是被尊重，但一个没有配置 `precision` 的 number 字段会刻意**不**输出 `columnType`（按控件推断出的 `"integer"` 会让 Go 运行时拒绝小数值，因此后端会回退到一个不设门槛的数值列）。一个没有配置 `precision` 的 `decimal` 列会抛出 `decimal_scale_missing`（一个 warning——存储层会四舍五入到 0 位小数）；配置了正数 `precision` 时，它会作为 `scale` 输出。`defaultValue` 和 `props` 存在于线上格式契约中，但投影器永远不会输出它们——声明它们是为了让手工构建或经宿主补充的定义能够无损往返。

### 远程选项来源

一个选项无法被枚举出来的选择类字段，会在 `optionSource` 里投影出一份描述符，而不是把消费方晾在原地：

```ts
// NonNullable<ApprovalFormField["optionSource"]>
{
  kind: "remote";
  request?: RemoteDataSourceRequest;
  mapping?: RemoteOptionMapping;
}
```

有三点值得明确说出来：

- **它是解引用之后的结果。** `ref` 会在分支判断之前先被解引用，因此 `request` / `mapping` 就是被引用的那个 `FormSchema.dataSources` 条目所携带的那一份。消费方永远不需要拿着一个 `dataSourceId` 去追一份它根本没有的 schema。映射在输出时会被[规范化](./form-editor/schema.md#选项与数据源)——去掉空 key，什么都不剩时整个省略——因此消费方可以放心读取 `mapping?.labelKey ?? "label"`。
- **`request.params` 原封不动、未经求值地传递。** 每个参数仍然是设计器写下的那个 `DynamicValue`——`{ kind: "literal"; value }` 或 `{ kind: "expression"; source }`——见[绑定参数](./form-editor/embedding.md#绑定参数)。后端和列表渲染方都不持有表达式所读取的表单值，所以在投影期求值等于凭空编一个答案；原样携带则让持有表单值的消费方自己求值，不持有的那一方直接丢掉这个参数。
- **`request` 之所以可选，只是为了还没写完的那种情况。** 设计器尚未填写 request 的远程数据源会被原样输出，而不是被悄悄降级成一个没有来源的字段，这样 Go 的部署校验才能点名它。已部署的版本总是带着 request。

这份描述符服务的消费场景是**展示，不是校验**。一个列表视图渲染已存储的 `select` 值时，手上只有 id（`"dept-7"`），需要的是标签（`"Cardiology"`）。静态数据源的标签就摆在 `options` 里；而远程数据源过去在定义里什么都没留下，于是列表要么显示原始 id，要么把设计器早已写好的那个请求再硬编码一遍。`optionSource` 把两半都交了出来——要调用的 request，以及读取响应所需的 `labelKey` / `valueKey` 映射。

后端依旧永远不会去解析它，它也不会让某个值变得"被校验过"：远程数据源的字段仍然接受任意提交值，和以前完全一样。

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

两层的 issue 共享同一个 `{ path, code, severity, message }` 形态，因此宿主可以用同一个列表来处理它们:

```tsx
import { validateApprovalSchema } from "@vef-framework-react/approval-form-bridge";

const result = validateApprovalSchema(candidate, registries);

if (!result.valid) {
  for (const issue of result.issues) {
    console.warn(`[${issue.severity}] ${issue.path}: ${issue.message}`);
  }
}
```

在保存或部署 schema 的地方使用它——设计器本身无法强制所有约束（比如 `initialSchema` 被摄入时就不做校验），所以这里是唯一的卡口。而在表单*设计过程中*，请改用 `validateApprovalProjection`，让同样的问题显示在编辑器内部。

## `validateApprovalProjection`

```ts
function validateApprovalProjection(schema: FormSchema): ProjectionIssue[];
```

保存关卡中单独的审批这一层——恰好就是 `projectFormSchema` 的 `issues`——形态与 form-editor 的 [`SchemaValidator`](./form-editor/embedding.md#宿主诊断) 一致，因此可以直接接到 `FormEditor` 的 `validate` 属性上:

```tsx
import { createApprovalRegistries, validateApprovalProjection } from "@vef-framework-react/approval-form-bridge";
import { FormEditor } from "@vef-framework-react/form-editor";
import { useState } from "react";

function ApprovalFormDesigner() {
  const [registries] = useState(createApprovalRegistries);

  return (
    <FormEditor
      registries={registries}
      validate={validateApprovalProjection}
      onSchemaChange={handleSchemaChange}
    />
  );
}
```

编辑器自己会先做一遍结构校验，并且只在结构无误时才调用 `validate`，因此两者合起来，设计者能在编辑器的状态栏里看到 `validateApprovalSchema` 会报告的每一个问题——每个恰好一次——编辑器的发布关卡也会像对待自身错误一样，因投影的 error 而阻止发布。由于投影问题的 `path` 是字段 key 链（`amount`、`items.price`），在状态栏中点击它就会选中对应的字段。编辑器上方不再需要任何横幅，画布可以保持完整高度。

这个函数定义在模块级，因此身份是稳定的，满足 `validate` 属性的要求。

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
| `options_not_static` | warning | 某个 select 字段的选项来自非 static 数据源；投影会省略它们——数据源是远程时会输出 [`optionSource`](#远程选项来源)——后端会接受任意提交值。 |
| `linkage_not_projected` | warning | 该字段带有审批后端不会求值的联动规则——一个被联动隐藏的字段仍会从提交负载中丢掉自己的值，这可能与一个静态的 `isRequired` 相冲突。 |

## 端到端示例

把桥接与两个编辑器组合起来——审批包的[流程设计向导](../engines/approval/pages.md#flowdesignerdrawer)正是建立在这种组合之上:

```tsx
import type { EditorPlugins, FlowDefinition } from "@vef-framework-react/approval-flow-editor";
import type { FormSchema } from "@vef-framework-react/form-editor";

import { ApprovalFlowEditor, validateFlowDefinition } from "@vef-framework-react/approval-flow-editor";
import {
  createApprovalRegistries,
  projectFormSchema,
  validateApprovalProjection,
  validateApprovalSchema
} from "@vef-framework-react/approval-form-bridge";
import { FormEditor } from "@vef-framework-react/form-editor";
import { useMemo, useState } from "react";

function ApprovalDesigner() {
  const [registries] = useState(createApprovalRegistries);
  const [formSchema, setFormSchema] = useState<FormSchema | null>(null);
  const [flowDefinition, setFlowDefinition] = useState<FlowDefinition>({ nodes: [], edges: [] });

  // One walk feeds the flow editor's field inventory.
  const projection = useMemo(() => formSchema ? projectFormSchema(formSchema) : null, [formSchema]);

  // The save gate. The designer already shows these issues in its own status
  // bar (through `validate` below); this only decides whether to deploy.
  const formValid = useMemo(
    () => formSchema === null || validateApprovalSchema(formSchema, registries).valid,
    [formSchema, registries]
  );

  const plugins = useMemo<EditorPlugins>(
    () => ({ formFields: projection?.formFields ?? [] }),
    [projection]
  );

  const flowErrors = useMemo(
    () => validateFlowDefinition(flowDefinition, { formFields: projection?.formFields ?? [] }),
    [flowDefinition, projection]
  );

  return (
    <>
      <FormEditor registries={registries} validate={validateApprovalProjection} onSchemaChange={setFormSchema} />

      <ApprovalFlowEditor plugins={plugins} value={flowDefinition} onChange={setFlowDefinition} />

      <Button disabled={!formValid || flowErrors.length > 0} onClick={() => deploy(formSchema, flowDefinition)}>
        Deploy
      </Button>
    </>
  );
}
```

`plugins.formFields` 与 `validateFlowDefinition` 在流程一侧做了什么，见 [Approval Flow Editor：宿主集成](./approval-flow-editor/host-integration.md)；`FormSchema`、`DeviceRegistries` 与 `validateSchema` 见 [form-editor 参考](./form-editor/reference.md)。
