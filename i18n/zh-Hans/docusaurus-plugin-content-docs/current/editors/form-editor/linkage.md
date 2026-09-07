---
title: 联动
description: 条件性的显示/隐藏/必填、计算值与副作用——规则模型、纯 JavaScript 表达式引擎，以及如何替换它。
---

# 联动

联动（Linkage）是节点对其周围表单做出反应的方式：在某个先前的答案满足条件之前隐藏一个字段、有条件地要求它必填、由其他字段计算出某个字段的值，或触发诸如弹窗提示、API 调用之类的副作用。这一套模型同时覆盖了传统意义上的"联动"（由条件驱动可见状态）和"事件"（由字段或表单某个时刻驱动副作用）——事件其实就是一条触发条件为边沿信号、而非值条件的规则。

## 规则、触发条件与动作

任意节点——无论叶子字段还是容器——都通过 `linkage?: FieldLinkage` 声明其行为：

```ts
interface FieldLinkage {
  defaults?: { hidden?: boolean; disabled?: boolean; required?: boolean };
  rules?: FieldLinkageRule[];
}

interface FieldLinkageRule {
  id: string;
  trigger: LinkageTrigger;
  actions: FieldLinkageAction[];
}
```

`defaults` 会在任何规则触发之前生效——这是编写"默认隐藏，直到某条件使其显示"这类逻辑的标准方式。每条规则将一个**触发条件（trigger）**与一组有序的**动作（action）**列表配对：

- **`{ kind: "condition"; condition }`** 是一个*电平*信号——随着值的变化持续为真或为假。它是唯一能驱动持久状态（`show` / `hide` / `require` / ……）的触发条件类型；其由假变真的上升沿也可以触发副作用。
- **`{ kind: "change" | "focus" | "blur" | "click" }`** 是字段级 DOM *边沿*信号——事件发生时脉冲式触发一次，永远不会派生状态，只能触发副作用。
- **`{ kind: "load" | "beforeSubmit" | "afterSubmit" }`** 是表单生命周期*边沿*信号，仅在[表单级规则](#字段级规则与表单级规则)中合法。

`FIELD_TRIGGER_KINDS` / `FORM_TRIGGER_KINDS` 列出了各作用域下合法的触发条件类型；`FIELD_EVENT_TRIGGER_KINDS`（以及 `isFieldEventTriggerKind` 守卫）将四种字段 DOM 边沿信号与三种生命周期边沿信号区分开来。

## 条件

```ts
type LinkageCondition =
  | { kind: "leaf"; sourceKey: string; operator: LinkageOperator; value?: unknown }
  | { kind: "group"; logic: "all" | "any"; children: LinkageCondition[] }
  | { kind: "expression"; source: string };
```

一个**叶子（leaf）**条件用某个运算符比较某个来源的值；**`LINKAGE_OPERATORS`** 是完整的运算符集合：`eq` / `ne` / `gt` / `lt` / `gte` / `lte` / `contains`，外加 `empty` / `notEmpty`（不需要 `value`——当值为 nullish、*去除首尾空白后*为空的字符串、`[]`，或数组中所有项都为空时，该值即视为空；`0` 和 `false` 不算空）。自 v2.10.0 起字符串会先做 trim，与 Go 后端的 `isEmptyFormValue` 保持一致，因此一个只含空白字符的值会在客户端就通不过 `required`，而不是被服务端弹回却没有任何内联错误提示。`sourceKey` 默认是某个同级字段的 `key`；以 `$` 为根的路径（`$user.departmentId`、`$vars.quota`、`$form.someKey`）会改为对照[求值上下文](#宿主上下文)解析。一个**组（group）**条件用 `all`（遇到第一个 `false` 即短路）或 `any`（遇到第一个 `true` 即短路）来组合子条件。一个**表达式（expression）**条件是一个逃生舱口，用于表达可视化构建器无法表达的任何逻辑——通过[默认求值器](#表达式与脚本求值)或宿主自定义的求值器运行的纯 JavaScript。

```json
{
  "kind": "condition",
  "condition": {
    "kind": "group",
    "logic": "all",
    "children": [{ "kind": "leaf", "sourceKey": "age", "operator": "gte", "value": "18" }]
  }
}
```

## 动作

每个动作都携带一个 `type`，用来将其归入两大家族之一——`isStateAction` / `isEffectAction` 会将一个 `FieldLinkageAction` 收窄到对应的家族，`LINKAGE_ACTION_TYPES` 列出了所有已知类型。

**状态动作**（`STATE_ACTION_TYPES`）派生一个字段的运行时状态，只在 `condition` 触发条件下才有意义——条件成立期间该状态生效，条件一旦不再成立就立即恢复：

| `type` | 效果 |
| --- | --- |
| `show` / `hide` | 可见性（容器同样适用——容器的 `hide`/`disable` 会传播给它的每一个后代节点） |
| `enable` / `disable` | 可交互性 |
| `require` / `optional` | 覆盖字段静态的 `validate.required` |
| `assign` | 通过 `LinkageActionValue` 设置字段的值 |
| `script` | 逃生舱口——见[下文](#表达式与脚本求值) |

`require` / `optional` / `assign`（`KEYED_ONLY_ACTIONS`）仅限于带 key 的叶子字段——它们涉及对值的操作，因此 `validateSchema` 会在非键控节点或容器节点上拒绝它们。

**副作用动作**（`EFFECT_ACTION_TYPES`）是由边沿触发的副作用——它们在触发条件触发时运行一次，从不派生持久状态：

| `type` | 效果 |
| --- | --- |
| `set_field` | 对另一个字段（`targetKey`）执行一次性的命令式写入——区别于持续生效的自我 `assign`；当目标被钳制为不可写时会被丢弃（见[字段权限钳制](#字段权限钳制)） |
| `set_variable` | 写入一个表单全局的 `$vars` 条目 |
| `refresh_data_source` | 递增某个数据源的刷新 nonce，强制每个引用它的字段重新解析 |
| `alert` | 以指定 `level`（`ALERT_LEVELS`：`info` / `success` / `warning` / `error`）展示一条消息 |
| `api_call` | 触发一个 `RemoteDataSourceRequest`，委托给宿主处理 |
| `navigate` | 委托给宿主处理 |
| `submit` / `reset` | 驱动表单自身的提交/重置 |

`set_field` / `set_variable` / `refresh_data_source` / `submit` / `reset` 由运行时原生处理；`alert` / `api_call` / `navigate` 委托给宿主的 `dispatchEffect`（见[可插拔求值器](#可插拔求值器)），默认不做任何事。每个副作用动作都接受一个可选的 `retrigger?: ConditionRetrigger`（默认为 `"edge"`——只在由假变真的转换时触发一次；`"always"`——只要条件仍然成立、且条件所读取的某个字段发生变化，就重新触发）；在边沿触发条件下该参数会被忽略，因为边沿触发本身已经是逐事件触发的脉冲。

`LinkageActionValue`（供 `assign`、`set_field`、`set_variable`、`alert` 的 `message`、`navigate` 的 `to` 使用）要么是 `{ kind: "literal"; value }`，要么是 `{ kind: "expression"; source }`。

## 字段级规则与表单级规则

大多数规则都挂在某个节点自身的 `linkage` 上，可以使用 `FIELD_TRIGGER_KINDS` 中的任意触发条件，配合状态动作或副作用动作。`FormSchema.linkage` 是**表单级**规则集（即统一的"事件"面板）：表单本身没有可以派生状态的自身字段，因此它只接受 `FORM_TRIGGER_KINDS`（`condition`、`load`、`beforeSubmit`、`afterSubmit`），且**只能使用副作用动作**——`validateLinkageSchema` 会拒绝表单级作用域下的状态动作或 `defaults` 块。`beforeSubmit` / `afterSubmit` 包裹实际的提交过程（包括任何异步的宿主副作用）；`load` 在表单挂载时触发一次，即触即忘。

## 表达式与脚本求值

`kind: "expression"` 的条件、`kind: "expression"` 的 `assign`/动作值，以及 `script` 动作，全部都是通过 `new Function` 编译、并按源码字符串缓存的纯 JavaScript。表达式会被包装为一个单一的返回表达式（`"field.age >= 18"`）；脚本则是一个可以 `return` 一个部分状态补丁（`{ hidden?, disabled?, required?, value? }`——任何省略的键都保持该插槽不变）的语句块。

求值作用域：`field` 和 `$form` 都绑定当前表单的值（`field` 是历史遗留别名——在子表单的一行内部，它指的是该行自身的记录，而不是根表单）；`$vars` 是表单的变量；`$user` / `$node` 由宿主通过 [`EvaluationContext`](#宿主上下文) 提供；`$now` 是每次求值时全新生成的一个 `Date`。

```js
// assign — expression action value
"field.qty * field.unitPrice"

// script action
"if (field.age < 18) { return { required: true }; }"
```

**安全模型：** 这些代码源在宿主页面内通过 `new Function` 运行，因此框架假定 schema 来自可信来源——超出此范围的沙箱化是宿主自己的责任（参见[可插拔求值器](#可插拔求值器)以替换它）。默认求值器需要 CSP 允许 `'unsafe-eval'`；一段被拦截或格式错误的源码，对条件会退化为 `false`，对赋值或脚本会退化为 `undefined`，而不会抛出异常。

`defaultEvaluateExpression`、`defaultEvaluateAssignExpression` 和 `defaultEvaluateScriptAction` 是三个默认求值器函数，各自单独导出，因此宿主自定义的替代实现可以对不需要特殊处理的源码继续回调默认实现。

## 可插拔求值器

`LinkageEvaluators` 是宿主用来替换 `new Function` 引擎的接口——可以换成沙箱化运行时、不同的表达式 DSL，或是为 `alert` / `api_call` / `navigate` 提供真正的副作用分发器：

```ts
interface LinkageEvaluators {
  evaluateExpression?: (source, values, context?) => boolean;
  evaluateScriptAction?: (source, values, context?) => LinkageScriptResult | void;
  evaluateAssignExpression?: (source, values, context?) => unknown;
  dispatchEffect?: (action: EffectAction, context: EffectDispatchContext) => void | Promise<void>;
}
```

通过 `FormEditor` / `FormRenderer` 的 `evaluators` 属性提供覆盖项（见 [Embedding](./embedding.md)）——你省略的插槽会回退到对应的默认实现。`resolveLinkageEvaluators(overrides?)` 执行这一填充过程，也正是引擎内部调用的函数；如果你在构建需要在编辑器/渲染器之外使用一套完整求值器的工具，可以直接调用它。`dispatchEffect` 接收一个作用域限定在触发规则所处值作用域内的 `EffectDispatchContext`（`{ values, resolveValue }`）——子表单某一行的副作用看到的是该行自己的记录，而不是根表单——因此宿主的 `alert` 实现可以读取到触发它的那些值。

## 宿主上下文

`EvaluationContext`（`{ variables?, user?, node? }`）是宿主运行时数据到达每一个表达式、脚本以及以 `$` 为根的条件的途径。`FormRenderer` / `FormEditor` 的 `evaluationContext` 属性提供 `user` / `node`；`variables` 会自动从 `FormSchema.variables` 播种，只有在需要于运行时注入或覆盖某个值时才需要通过属性覆盖它。一个以 `$user` 为根的叶子条件：

```json
{
  "kind": "leaf",
  "sourceKey": "$user.departmentName",
  "operator": "eq",
  "value": "Finance"
}
```

`contextSources: LinkageContextSource[]`（`{ key, label }`，例如 `{ key: "$user.departmentId", label: "Applicant department" }`）纯粹是设计时的元数据——它会把这些宿主路径连同表单自身的字段一起，填充到可视化条件构建器的来源选择器中。无论某个以 `$` 为根的路径是否在此处声明过，运行时都会对照当前的 `EvaluationContext` 解析它，因此一个手写的、引用了未声明路径的条件依然可以正常工作。

## 字段权限钳制

`FieldPermission`（`"hidden" | "visible" | "editable" | "required"`）是一种**服务端解析**的交互性钳制，独立于联动规则——以 `fieldPermissions: Record<string, FieldPermission>` 的形式传给 `FormRenderer`，按根作用域字段 `key` 索引（见 [Embedding → FormRenderer](./embedding.md#formrenderer)）。它在 v2.10.0 中落地，是审批引擎按节点字段权限的客户端一半（与后端的 `approval.Permission` 和 approval-flow-editor 的 `FieldPermission` 逐字对应），但并不绑定任何宿主——任何能按查看者解析权限的服务端都可以为它供数。它是*外层边界*：联动可以在其内部收窄，但永远不能突破它。

| 取值 | 效果 |
| --- | --- |
| `"hidden"` | 永不挂载；值永不提交 |
| `"visible"` | 以只读方式挂载（通过禁用通道实现）；值不参与提交载荷与校验，永不必填 |
| `"editable"` | 无钳制——完全由联动规则决定 |
| `"required"` | 可编辑且始终必填，覆盖联动规则得出的 `optional` 结果；提交时空值会不通过，即使没有静态的 `validate.required` |

省略该属性、或该属性中省略某个 key，都表示该字段没有钳制——除非服务端另有说明，渲染器保持完全宽松；想要"默认拒绝"的宿主应在服务端物化出完整的权限映射。带 key 的 `subform` 是整体被钳制的——它的模板字段不能被单独寻址，因为权限只针对根作用域的 key 生效（子表单级的 `"required"` 意味着"至少一行"）。

**每一次程序化写入同样会被把关**（破坏性变更，v2.10.0）。状态一侧持续生效的 `assign` 与副作用一侧一次性的 `set_field` 会落入同一个共享写入关卡，因此钳制在每一条写入路径上都成立，而不仅仅是用户编辑：

- 目标顶层 key 被钳制为不可写（`"visible"` / `"hidden"`）的写入会被**静默丢弃**，与渲染路径"绝不崩溃"的姿态一致。不可写字段待生效的 `assign` 结果同样会被压制，因此不会有任何幽灵编辑抵达一个服务端本会拒绝的字段。
- **写入的值会先被强制转换成目标字段的形态。** `number` 字段拿到的是 `number`——空白或非数字的字符串会变成 `undefined`，让控件保持为空，从而由必填校验如实报错，而不是先把一个后端提交时必然拒绝的值停在那里；`switch` 拿到的是布尔值，`"true"` / `"1"` 为真，其余一律为假（包括 `"false"`）。其他所有字段类型原样接收，因为一个求值为数字的表达式放进文本字段是完全合理的。这条规则是按**值的类型**、而不是按 `kind` 触发的：只要求值结果是字符串就会转换，因此一个得出 `"3.5"` 的表达式与一个字面量走的是同一条路，`script` 动作返回的 `value` 同样如此。而一个 `set_field` 若指向触发作用域的 schema 并未声明的 key，就没有目标字段可供参照，值会被原样写入。这条规则的动因是设计器的字面量编辑器——那是一个纯文本输入框，所以每个字面量都以字符串的形态抵达：字符串落进 number 字段会悄悄让数值约束检查失效（它们以 `typeof value === "number"` 为门槛），而 `"false"` 落进 switch 是真值，控件会显示为**开**。
- 写入的值与目标当前持有的值相同（深度相等，**在强制转换之后**比较）时会被丢弃——否则一次原样写入会被视为变更，让一条 `"always"` 重触发的规则永远重复触发。
- 程序化写入永远不会运行目标的 change 监听器，也不会将其标记为已触碰（touched），因此 `load` 副作用的写入不会过早浮现校验错误；写入的值仍会像一次编辑那样被校验。
- 关卡会先把路径形态的目标（`"lines[0].amount"`）解析到其顶层绑定（`lines`）再检查钳制；在子表单行自己的作用域内不施加任何钳制（顶层权限永远不会寻址模板字段）。

有两个辅助导出支撑着这个关卡，可供构建自有权限感知界面的宿主使用：`getFieldPermission(permissions, key)`（带自有属性守卫的查找）和 `isWritableFieldPermission(permission)`（对 `undefined` / `"editable"` / `"required"` 返回 `true`）。提交负载只携带可写的 key——要精确预览将会提交的内容，见参考中的 `FormRendererApi.getSubmitValues`（[Reference](./reference.md#formrendererapi)）。

## 校验

`validateLinkageSchema(layer, formLinkage?): LinkageValidationResult` 是针对外部提供的 schema 中联动部分的边界守卫（与 [`validateSchema`](./schema.md#校验导入的-schema) 搭配使用，后者在树结构本身校验通过后调用它）。它会标记格式错误的节点，将 `sourceKey` / `targetKey` 对照规则自身值作用域内的带 key 节点进行解析，拒绝边沿触发条件下的状态动作、或非键控节点上的仅限键控动作，并检测依赖环（某条件的动作又写回了该条件自身读取的字段）。

每个问题都是一个 `ValidationIssue`（`{ path, code: ValidationIssueCode, severity: "error" | "warning", message, ruleId? }`）。请针对 `code` 和 `path` 编程——它们是稳定且机器可读的；`message` 是预先渲染好的中文产品文案（该包的问题提示信息目前尚不支持本地化），完全通过 `formatIssueMessage(code, params?)` 产出。*error*级别的问题意味着 schema 在结构上已损坏；*warning*级别的问题（悬空引用、空条件组）属于编写过程中的合法中间状态，不会导致校验失败。

## 完整示例

两个相邻节点：一个数字字段，会根据是否超过某个阈值弹出不同的提示；以及一个可见性与必填性都由同一个值门控的字段：

```json
[
  {
    "type": "number",
    "key": "age",
    "linkage": {
      "rules": [
        {
          "id": "Rule_age_ok",
          "trigger": { "kind": "condition", "condition": { "kind": "group", "logic": "all", "children": [
            { "kind": "leaf", "sourceKey": "age", "operator": "gte", "value": "18" }
          ] } },
          "actions": [{ "id": "Action_ok", "type": "alert", "level": "info", "message": { "kind": "literal", "value": "Age requirement met" } }]
        },
        {
          "id": "Rule_age_low",
          "trigger": { "kind": "condition", "condition": { "kind": "group", "logic": "all", "children": [
            { "kind": "leaf", "sourceKey": "age", "operator": "lt", "value": "18" }
          ] } },
          "actions": [{ "id": "Action_low", "type": "alert", "level": "warning", "message": { "kind": "expression", "source": "'Age too low: ' + field.age" } }]
        }
      ]
    }
  },
  {
    "type": "textfield",
    "key": "bio",
    "linkage": {
      "defaults": { "hidden": true },
      "rules": [{
        "id": "Rule_bio_show",
        "trigger": { "kind": "condition", "condition": { "kind": "group", "logic": "all", "children": [
          { "kind": "leaf", "sourceKey": "age", "operator": "gte", "value": "18" }
        ] } },
        "actions": [
          { "id": "Action_show", "type": "show" },
          { "id": "Action_require", "type": "require" }
        ]
      }]
    }
  }
]
```
