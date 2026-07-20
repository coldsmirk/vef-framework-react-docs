---
title: 宿主集成
description: 如何把主体选择器、表单字段元数据、全局变量、条件运算符和校验逻辑接入 ApprovalFlowEditor。
---

# 宿主集成

`@vef-framework-react/approval-flow-editor` 是一个自包含的业务组件。它主要的集成面是 `plugins` 属性，而不是样式或插槽——宿主注入选择器和字段元数据，并通过 `onChange` 读回一个 `FlowDefinition`。

## `plugins`: `EditorPlugins`

```tsx
import type { EditorPlugins, FlowDefinition } from "@vef-framework-react/approval-flow-editor";

import { ApprovalFlowEditor } from "@vef-framework-react/approval-flow-editor";
import { useState } from "react";

const [definition, setDefinition] = useState<FlowDefinition>(initialValue);

const plugins: EditorPlugins = {
  pickers: { user: UserPicker, role: RolePicker, department: DepartmentPicker },
  formFields: [
    { key: "amount", kind: "number", label: "Amount" },
    { key: "reason", kind: "textarea", label: "Reason" }
  ]
};

<ApprovalFlowEditor plugins={plugins} value={definition} onChange={setDefinition} />;
```

`EditorPlugins` 有三个可选字段:

| 字段 | 类型 | 用途 |
| --- | --- | --- |
| `pickers` | `Partial<Record<PrincipalKind, FC<PickerProps>>>` | 为 `user` / `role` / `department` 三类审批人和抄送收件人解析出具体的 id。某个类型未设置时会优雅降级为一段内联提示，而不是渲染选择器。 |
| `formFields` | `FormFieldDefinition[]` | 表单的顶层字段清单——供条件编辑器、字段权限表以及 `validateFlowDefinition` 的 `fieldPermissions` 交叉校验使用。保留为 `undefined` 表示"没有可用的字段清单"，与 `[]` 含义不同——见下方 [`formFields`](#formfields)。 |
| `globalSubjects` | `FormFieldDefinition[]` | 宿主声明的变量，条件编辑器会把它们与内置的申请人属性和 `formFields` 一起提供给用户选择。 |

### 选择器

`PickerProps` 刻意做得很精简——编辑器只存储 id；具体的展示（解析名称、渲染标签、搜索等）由选择器自己负责:

```ts
interface PickerProps {
  value: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
}
```

```tsx
import type { PickerProps } from "@vef-framework-react/approval-flow-editor";
import type { FC } from "react";

import { Select } from "@vef-framework-react/components";

function createUserPicker(): FC<PickerProps> {
  return function UserPicker({ value, onChange, disabled }) {
    const { data: options } = useUserOptionsQuery();

    return (
      <Select
        allowClear
        disabled={disabled}
        mode="multiple"
        options={options}
        value={value}
        onChange={onChange}
      />
    );
  };
}
```

`isPrincipalKind` 和 `PRINCIPAL_KINDS`（`["user", "role", "department"]`）已导出，供需要以通用方式构建选择器映射或设置界面的宿主使用，而不必把这三种类型重复硬编码一遍。

### `formFields`

通常来自 `@vef-framework-react/approval-form-bridge` 的 `projectFormSchema(schema).formFields`——见 [审批表单桥接](../approval-form-bridge.md)——但任何 `FormFieldDefinition[]` 都可以用，包括为一个没有对应设计表单的流程手写的字段清单。

自 v2.10.0 起，这份清单是**三态**的，编辑器会把它原样透传给 `validateFlowDefinition`（包括 `undefined`）:

- **`undefined`**（省略该字段）——清单*不可用*: 宿主在没有任何表单集成的情况下渲染流程编辑器。实时校验与发布关卡只会跳过 key 存在性交叉检查（`field_permission_key_unknown`），因为没有可供比对 key 的对象；权限取值检查与 CC 子集检查仍会运行。此状态下带有悬空 `fieldPermissions` key 的定义*不会*被标记，因此无表单的宿主永远不会被误拦。
- **`[]`**（显式的空数组）——已确认表单有*零个*字段: 每一条 `fieldPermissions` 条目都是悬空引用并报错，对应后端"表单有零个字段的流程"这一情形。
- **非空数组**——每个 `fieldPermissions` key 都必须指向某个条目，条件编辑器 / 字段权限表也据此渲染。

只要表单存在，就把投影产出的真实 `formFields`（非空或 `[]`）传进来；只有在确实没有任何表单集成时，才彻底省略这个插件字段。

来自投影的条目可能携带 `hasConditionalVisibility: true`（v2.10.0），表示表单联动可能在运行时隐藏该字段。字段权限表会为其配上一条逐行警告: 在这样的字段上授予 `required` 可能让审批死锁——后端的必填检查并不感知联动，因此如果联动在审批时隐藏了该字段，它的空值会让通过操作永远被拒绝。这条警告是一个非阻塞的 tooltip（当审批人可以编辑控制字段时，这种组合是合理的），永远不会进入 `validateFlowDefinition` 的发布关卡。与之相关的另一种冲突*是*阻塞性的: 把 `required` 权限与 `timeoutAction: "auto_pass"` 配在一起会引发 `field_permission_required_auto_pass`，因为自动通过的超时路径会在不经过人工审批必填检查的情况下结束该节点（见 [API 参考 → 校验](./reference.md#校验)）。

### `globalSubjects`

这些是引擎从实例的服务端全局变量快照（后端的 `Instance.Globals`，由宿主的 `InstanceGlobalsResolver` 在实例启动时填充——绝不来自客户端请求）中解析出来的变量，而不是来自表单数据。`kind` 驱动运算符集合和取值输入控件，与 `formFields` 的行为完全一致:

```tsx
const plugins: EditorPlugins = {
  globalSubjects: [
    { key: "applicantLevel", kind: "number", label: "Applicant level" },
    {
      key: "applicantDepartmentName",
      kind: "select",
      label: "Applicant department",
      options: [
        { label: "Engineering", value: "engineering" },
        { label: "Sales", value: "sales" }
      ]
    }
  ]
};
```

当 key 冲突时，解析顺序很重要: 一个与内置申请人变量重名的 `globalSubjects` key 会被丢弃；一个与内置变量或某个全局变量重名的 `formFields` key 会被遮蔽。

## 条件运算符

`ConditionDefinition.operator` 取自一个封闭的词表，后端的 `approval.ConditionOperator` 与它逐字对应:

```ts
const CONDITION_OPERATORS = [
  "eq", "ne", "gt", "gte", "lt", "lte",
  "contains", "not_contains", "starts_with", "ends_with",
  "in", "not_in", "is_empty", "is_not_empty"
] as const;
```

在基于同一词表构建自定义条件 UI 时，导入 `CONDITION_OPERATORS`（运行时数组）和 `ConditionOperator`（派生出的类型）——同一个定义源同时支撑着这个类型，以及 `validateFlowDefinition` 校验所依据的白名单。

## 序列化: `fromFlowDefinition` / `toFlowDefinition`

编辑器在每一次受控的 `value` / `onChange` 往返中，内部都用这两个函数在 wire 格式的 `FlowDefinition` 与其实时画布图之间转换，所以大多数宿主永远不需要直接调用它们。导出它们是为了应对宿主需要在没有挂载编辑器的情况下做同样转换的场景——例如在测试中构造 / 检查一个 `FlowDefinition`，或者在把一个手写的定义第一次作为 `value` 传入之前先对它做规范化。

```ts
import { fromFlowDefinition, toFlowDefinition } from "@vef-framework-react/approval-flow-editor";

const { nodes, edges } = fromFlowDefinition(savedDefinition); // wire → live graph
const definition = toFlowDefinition(nodes, edges); // live graph → wire (detached deep copy)
```

`fromFlowDefinition` 会把省略的字段规范化为设计器默认值，因此一个由旧版本编辑器保存的、或在外部手写的定义，仍然能被完整水合成显式配置。

## 校验: `validateFlowDefinition`

```ts
import { validateFlowDefinition } from "@vef-framework-react/approval-flow-editor";

const errors = validateFlowDefinition(definition, formFields);
// errors: FlowValidationError[] — empty means the flow is deploy-ready
```

它与后端部署时的 `ValidateFlowDefinition` 规则逐条对应——自 v2.10.0 起也包括字段权限规则（权限取值必须在词表之内、key 必须指向真实的表单字段、CC 节点只允许 `visible` / `hidden`、`required` 权限不得与自动通过的超时配在一起）——但与后端（只返回第一个错误）不同的是，它会收集全部违规项，让宿主可以一次性把它们都展示出来。通过这个校验器的定义，也一定能通过后端的部署校验。

第二个参数就是那份[三态的 `formFields` 清单](#formfields): 把传给 `plugins.formFields` 的同一份列表也传给它，这样 `fieldPermissions` 的 key 才会与真实字段清单做交叉校验。`[]` 表示"表单有零个字段"（每个权限 key 都会报错）；省略该参数表示"没有可用的字段清单"，只会跳过 key 存在性检查。

用它来在编辑器自身的发布按钮之外，为一个保存 / 部署操作设置关卡——比如禁用向导里的“下一步”控件:

```tsx
const errors = useMemo(
  () => validateFlowDefinition(flowDefinition, formFields),
  [flowDefinition, formFields]
);

<Button disabled={errors.length > 0} onClick={handleNext}>Next</Button>;
```

每个 `FlowValidationError` 都带有一个稳定的 `code`（`FlowValidationCode`）、一段人类可读的 `message`，并且——取决于具体规则——可能带有 `nodeId`、`edgeId` 和/或 `branchId`，便于把错误提示展示在出问题的元素旁边。完整的 code 列表见 [API 参考](./reference.md)。

## 把它们组合起来

一个构建端到端设计器的宿主，通常会把三者组合在一起——选择器、来自 `approval-form-bridge` 的 `formFields`，以及作为步骤关卡的 `validateFlowDefinition`:

```tsx
import type { EditorPlugins, FlowDefinition } from "@vef-framework-react/approval-flow-editor";

import { ApprovalFlowEditor, validateFlowDefinition } from "@vef-framework-react/approval-flow-editor";
import { projectFormSchema } from "@vef-framework-react/approval-form-bridge";
import { useMemo, useState } from "react";

function FlowStep({ formSchema, pickers }: { formSchema: FormSchema; pickers: EditorPlugins["pickers"] }) {
  const [definition, setDefinition] = useState<FlowDefinition>({ nodes: [], edges: [] });
  const projection = useMemo(() => projectFormSchema(formSchema), [formSchema]);
  const plugins = useMemo<EditorPlugins>(
    () => ({ pickers, formFields: projection.formFields }),
    [pickers, projection]
  );
  const errors = useMemo(
    () => validateFlowDefinition(definition, projection.formFields),
    [definition, projection]
  );

  return (
    <>
      <ApprovalFlowEditor plugins={plugins} value={definition} onChange={setDefinition} />
      <Button disabled={errors.length > 0} onClick={() => saveFlow(definition)}>Save</Button>
    </>
  );
}
```
