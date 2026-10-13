---
title: 联动
description: 条件性的显示/隐藏/必填、计算值与副作用——规则模型、纯 JavaScript 表达式引擎、系统变量，以及如何替换引擎。
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

`defaults` 会在任何规则触发之前生效——这是编写"默认隐藏，直到某条件使其显示"这类逻辑的标准方式。每条规则将一个**触发条件（trigger）**与一组有序的**动作（action）**列表配对。规则按声明顺序生效，因此两条同时成立的规则设置同一个状态插槽时，后声明的那条胜出。

- **`{ kind: "condition"; condition }`** 是一个*电平*信号——随着值的变化持续为真或为假。它是唯一能驱动持久状态（`show` / `hide` / `require` / ……）的触发条件类型；其由假变真的上升沿也可以触发副作用。
- **`{ kind: "change" | "focus" | "blur" | "click" }`** 是字段级 DOM *边沿*信号——事件发生时脉冲式触发一次，永远不会派生状态，只能触发副作用。`change` 依附于带 key 叶子字段自身的 `onChange`，因此只在那里合法（`trigger_requires_keyed_leaf`）；设计器不会在容器或展示类节点上提供它。
- **`{ kind: "load" | "beforeSubmit" | "afterSubmit" }`** 是表单生命周期*边沿*信号，仅在[表单级规则](#字段级规则与表单级规则)中合法。

`FIELD_TRIGGER_KINDS`（`condition`、`change`、`focus`、`blur`、`click`）与 `FORM_TRIGGER_KINDS`（`condition`、`load`、`beforeSubmit`、`afterSubmit`）列出了各作用域下合法的触发条件类型；`FIELD_EVENT_TRIGGER_KINDS`（以及 `isFieldEventTriggerKind` 守卫）将四种字段 DOM 边沿信号与三种生命周期边沿信号区分开来。

## 条件

```ts
type LinkageCondition =
  | { kind: "leaf"; id?: string; sourceKey: string; operator: LinkageOperator; value?: unknown }
  | { kind: "group"; id?: string; logic: "all" | "any"; children: LinkageCondition[] }
  | { kind: "expression"; id?: string; source: string };
```

一个**叶子（leaf）**条件用某个运算符比较某个来源的值。一个**组（group）**条件用 `all`（遇到第一个 `false` 即短路）或 `any`（遇到第一个 `true` 即短路）来组合子条件。一个**表达式（expression）**条件是逃生舱口，用于表达可视化构建器无法表达的任何逻辑——通过[默认求值器](#表达式与脚本求值)或宿主自定义的求值器运行的纯 JavaScript。可选的 `id` 是设计器生成的客户端稳定标识，让条件行按身份而不是数组下标做 key；运行时和校验器都会忽略它。

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

空的条件组是合法的，但几乎总是失误：没有子条件的 `all` 恒成立，所以它所在的规则**始终**生效；没有子条件的 `any` 则永不成立。校验器会对此给出警告（`condition_group_empty`），设计器也从不产生空组——删掉嵌套组的最后一个条件会连组一起删掉，根组则会重新补上一行新的条件。

### 叶子条件来源

叶子条件的 `sourceKey` 指明它读取什么：

| `sourceKey` | 读取 | 示例 |
| --- | --- | --- |
| 普通 key | 规则自身值作用域内的带 key 字段——在子表单行内即该行的同级字段 | `amount` |
| `$form.<key>[.<path>]` | 同一个字段的显式写法；后续路径会深入对象值内部 | `$form.address.city` |
| `$vars.<name>[.<path>]` | 一个[表单变量](./schema.md#表单变量) | `$vars.quota` |
| `$user.<path>` | 此刻正在查看表单的人 | `$user.roleCode` |
| `$node.<path>` | 表单所处的流程节点 | `$node.code` |
| `$applicant.<path>` | 表单所代表的主体——在审批中即发起人 | `$applicant.departmentId` |
| `$globals.<path>` | 宿主提供的只读属性 | `$globals.staffTitle` |

以 `$` 为根的上下文路径会对照[求值上下文](#宿主上下文与系统变量)解析。解析遵循三条规则：

- **每一段都只读取自有属性。** 原型上的成员（`$user.constructor`、`toString`）永远不会被解析出来，因此它不可能让 `notEmpty` 永远成立。
- **断开的路径解析为 `undefined`**——成员不存在、在原始值上取成员，或宿主没有提供该上下文插槽，都是如此。没有任何肯定型运算符会匹配 `undefined`，这与表单中缺失的 key 表现一致。
- **未知的根永远解析不出来。** 像 `$applcant.departmentId` 这样的拼写错误原本会悄无声息地永不匹配；现在校验器会把它报告为 `source_scope_unknown`（警告）。

`$form.amount` 与 `amount` 在所有要紧的地方都是同一个来源：依赖追踪、环检测、悬空引用检查（`source_key_unresolved`），以及编辑器的 key 改名——把 `amount` 改名为 `total` 时，`$form.amount.value` 会被改写成 `$form.total.value`，保留你原本的写法。上下文路径不指向任何表单 key，因此以上这些都不会触及它。

### 运算符

`LINKAGE_OPERATORS` 是完整的运算符集合，顺序即设计器中的展示顺序。可视化构建器的取值编辑器是一个文本输入框，因此右侧的值通常以字符串形态抵达——这些运算符就是按这一点设计的：

| 运算符 | 何时匹配 |
| --- | --- |
| `eq` / `ne` | 两个值 `Object.is` 相同，或两者都是原始值且字符串形式相等（`"5"` eq `5`）时，`eq` 成立。nullish 值只等于与它完全相同的 nullish 值，数组或对象类型的来源值永远不与任何值相等——判断成员关系请用 `contains`。`ne` 是 `eq` 的严格取反。 |
| `gt` / `lt` / `gte` / `lte` | 两侧都非空且都能转换为有限数字时，按数值比较。任何一侧为空都不匹配：空字段不满足 `gte 0`，没有填值的运算符也不会表现成 `gt 0`。 |
| `contains` | 字符串来源包含该值的字符串形式，或数组来源中有某个元素与该值 `eq`。值为空时永不匹配（否则任何字符串都"包含" `""`）。 |
| `empty` / `notEmpty` | 值为空：nullish、去除首尾空白后为空的字符串，或每一项本身都为空的数组（因此被清空成 `["", ""]` 的日期范围也算空）。`0` 和 `false` 不算空。这两个运算符不需要 `value`。 |

这条"空"的判定规则与运行时判断 `required` 所用的是同一条，并与 Go 审批后端的 `isEmptyFormValue` 配对——两边都会对字符串做 trim（自 v2.10.0 起），因此只含空白的值会在浏览器里就通不过 `required`，而不是被服务端弹回却没有任何内联错误提示。保留了一处有意的不对称：客户端把"只含空项的数组"视为空，而 Go 端检查的是 `len == 0`，所以客户端是更严格的一方。

## 动作

每个动作都携带一个 `type`，用来将其归入两大家族之一——`isStateAction` / `isEffectAction` 会将一个 `FieldLinkageAction` 收窄到对应的家族，`LINKAGE_ACTION_TYPES` 列出了所有已知类型。与条件一样，动作也可以带一个由编辑器生成的可选 `id`，运行时会忽略它。

**状态动作**（`STATE_ACTION_TYPES`）派生一个字段的运行时状态，只在 `condition` 触发条件下才有意义——条件成立期间该状态生效，条件一旦不再成立就立即恢复：

| `type` | 效果 |
| --- | --- |
| `show` / `hide` | 可见性（容器同样适用——容器的 `hide` / `disable` 会传播给它的每一个后代节点） |
| `enable` / `disable` | 可交互性 |
| `require` / `optional` | 是否必填。字段静态的 `validate.required` 是状态折叠的初始值，而不是事后再 OR 上去的，因此 `optional` 确实能放宽一个静态必填的字段。 |
| `assign` | 通过 `LinkageActionValue` 设置字段的值 |
| `script` | 逃生舱口——见[下文](#表达式与脚本求值) |

`require` / `optional` / `assign` 仅限于带 key 的叶子字段（`KEYED_ONLY_ACTIONS`）——它们涉及对值的操作，因此校验器会在容器（包括子表单）或非键控节点上拒绝它们（`action_requires_keyed_leaf`）。隐藏字段并不会清空它的值，只会把它从[提交载荷](./embedding.md#提交)中剔除。

**副作用动作**（`EFFECT_ACTION_TYPES`）是由边沿触发的副作用——它们在触发条件触发时运行一次，从不派生持久状态：

| `type` | 载荷 | 效果 |
| --- | --- | --- |
| `set_field` | `targetKey`、`value` | 对同一值作用域内另一个字段执行一次性的命令式写入——区别于持续生效的自我 `assign`；当目标被钳制为不可写时会被丢弃（见[字段权限钳制](#字段权限钳制)）。子表单的 key 也是合法目标：写入一个数组即整体替换它的行。 |
| `set_variable` | `variable`、`value` | 写入一个 `$vars` 条目。变量名不必在 `FormSchema.variables` 中声明——`$vars` 接受任意名称。 |
| `refresh_data_source` | `dataSourceId` | 递增某个表单全局数据源的刷新 nonce，强制每个 `ref` 它的字段重新解析。内联的 `remote` 来源没有 id，无法被刷新。 |
| `alert` | `level?`、`message` | 以 `level`（`ALERT_LEVELS`：`info` / `success` / `warning` / `error`）展示 `message` |
| `api_call` | `request` | 发起一个 `RemoteDataSourceRequest` |
| `navigate` | `to` | 跳转到某个位置 |
| `submit` / `reset` | — | 驱动表单自身的提交 / 重置 |

`set_field` / `set_variable` / `refresh_data_source` / `submit` / `reset` 由运行时原生处理；`alert` / `api_call` / `navigate` 委托给宿主的 `dispatchEffect`（见[可插拔求值器](#可插拔求值器)），默认不做任何事。设计器自己的预览是例外：只要宿主没有提供 `dispatchEffect`，预览就会把 `alert` 显示为对应级别的消息（未设置时为 `info`），把 `navigate` / `api_call`——它们在设计时无法真正执行——显示为一条注明目标的提示，好让设计者看到规则确实触发了。

每个副作用动作都接受一个可选的 `retrigger?: ConditionRetrigger`，用来调节它在 `condition` 触发条件下如何重复触发：

- **`"edge"`**（默认）只在由假变真的转换时触发一次，之后在条件持续成立期间保持安静——这是标准的副作用语义，避免 `api_call` / `navigate` / `submit` 随每次按键反复触发。
- **`"always"`** 还会在条件持续成立、且条件读取的某个字段发生变化时再次触发（"只要值仍超出范围，每次编辑都重新提醒"）。无关字段的变化不会让它重新触发。表达式条件的依赖是不透明的，因此它会在条件成立期间、任何值发生变化时重新触发。

表单挂载时就已经成立的条件**不会**触发它的副作用——只有之后的上升沿才会；挂载时要执行的副作用请用表单级的 `load` 规则。`retrigger` 在边沿触发条件下会被忽略，因为边沿触发本身已经是逐事件的脉冲——校验器会标记这种无效配置（`retrigger_ignored`）。

### 动作取值

`assign`、`set_field`、`set_variable`（`value`）、`alert`（`message`）与 `navigate`（`to`）接收一个 `LinkageActionValue`——它是 `DynamicValue` 的别名：

```ts
type DynamicValue =
  | { kind: "literal"; value: unknown }
  | { kind: "expression"; source: string };
```

字面量原样使用；表达式通过 `evaluateAssignExpression`、在触发规则所处的值作用域上求值。[远程请求参数](./embedding.md#绑定参数)用的是同一个联合类型，因此设计器在两处提供的是同一个"固定值或表达式"控件。写入字段的值会先被转换成目标字段的形态——完整的写入路径见[字段权限钳制](#字段权限钳制)。

`api_call` 携带一整个 `RemoteDataSourceRequest`（`resource` / `action` / `version?` / `params?`）。设计器用远程选项来源所用的同一个接口与参数编辑器来编辑它（但没有接口选择器和字段映射，这两者只对选项有意义）；宿主的 `dispatchEffect` 收到它时，可以用 `context.resolveRequest` 对其中绑定的参数求值——见[可插拔求值器](#可插拔求值器)。

## 字段级规则与表单级规则

大多数规则都挂在某个节点自身的 `linkage` 上，可以使用 `FIELD_TRIGGER_KINDS` 中的任意触发条件，配合状态动作或副作用动作。`FormSchema.linkage` 是**表单级**规则集（表单配置抽屉的「联动」页）：表单本身没有可以派生状态的自身字段，因此它只接受 `FORM_TRIGGER_KINDS`（`condition`、`load`、`beforeSubmit`、`afterSubmit`），且**只能使用副作用动作**——校验器会拒绝表单级作用域下的状态动作（`state_action_on_form_scope`）或 `defaults` 块（`defaults_on_form_scope`）。表单级条件的叶子来源按根值作用域解析。

三个生命周期边沿划分了表单的一生：

- **`load`** 在每个表单实例挂载后触发一次，即触即忘。
- **`beforeSubmit`** 在校验通过之后、宿主的 `onSubmit` 之前运行，并且会被等待完成——包括任何异步的宿主副作用——之后才构建载荷。因此在这里执行的 `set_field` 会进入提交载荷。
- **`afterSubmit`** 只在 `onSubmit` resolve 之后运行。

完整流程见 [Embedding → 提交](./embedding.md#提交)。

## 表达式与脚本求值

`kind: "expression"` 的条件、`kind: "expression"` 的动作取值，以及 `script` 动作，全部都是通过 `new Function` 以严格模式编译、并按源码字符串缓存的纯 JavaScript（每类各一个容量 500 的 LRU 缓存，按上百条规则的表单规模设定）。

- **表达式**会被包装为一个单一的返回表达式（`"field.age >= 18"`）。条件只有在求值结果为布尔值 `true` 时才成立——真值 `1` 或 `"yes"` 都不算，因此请把比较写完整。
- **脚本**是一个语句块，可以 `return` 一个部分状态补丁 `{ hidden?, disabled?, required?, value? }`——任何省略的键都保持该插槽不变，`value` 的作用等同于 `assign`，什么都不返回则是合法的空操作。

每段源码看到的作用域：

| 名称 | 绑定 |
| --- | --- |
| `field` / `$form` | 当前值作用域的值——根表单，或在子表单行内即该行自己的记录（`field` 是历史遗留别名） |
| `$vars` | 表单变量（`FormSchema.variables` 的默认值、宿主覆盖值、`set_variable` 的写入） |
| `$user` | `evaluationContext.user`——查看者 |
| `$node` | `evaluationContext.node`——流程节点 |
| `$applicant` | `evaluationContext.applicant`——表单所代表的主体 |
| `$globals` | `evaluationContext.globals`——宿主提供的只读属性 |
| `$now` | 每次求值时全新生成的一个 `Date` |

宿主没有提供的上下文插槽会绑定为一个冻结的空对象，因此 `$applicant.departmentId` 读到的是 `undefined`，而不会抛出异常。

```js
// assign — expression action value
"field.qty * field.unitPrice"

// condition — must evaluate to the boolean true
"$applicant.departmentId === 'dept-finance' && $form.amount > 5000"

// script action
"if (field.age < 18) { return { required: true }; }"
```

**安全模型：** 这些代码源在宿主页面内通过 `new Function` 运行，因此框架假定 schema 来自可信来源——超出此范围的沙箱化是宿主自己的责任（参见[可插拔求值器](#可插拔求值器)以替换它）。默认求值器需要 CSP 允许 `'unsafe-eval'`。编译失败的源码（语法错误，或 `new Function` 被 CSP 拦截）会以"惰性"结果缓存，因此只失败一次，而不是每次按键都重来；失败或抛错的源码，对条件会退化为 `false`，对赋值或脚本会退化为 `undefined`，而不会抛出异常。

`defaultEvaluateExpression`、`defaultEvaluateAssignExpression` 和 `defaultEvaluateScriptAction` 是三个默认求值器函数，各自单独导出，因此宿主自定义的替代实现可以对不需要特殊处理的源码继续回调默认实现。

## 可插拔求值器

`LinkageEvaluators` 是宿主用来替换 `new Function` 引擎的接口——可以换成沙箱化运行时、不同的表达式 DSL，或是为 `alert` / `api_call` / `navigate` 提供真正的副作用分发器：

```ts
interface LinkageEvaluators {
  evaluateExpression?: (source: string, values: Record<string, unknown>, context?: EvaluationContext) => boolean;
  evaluateScriptAction?: (source: string, values: Record<string, unknown>, context?: EvaluationContext) => LinkageScriptResult | void;
  evaluateAssignExpression?: (source: string, values: Record<string, unknown>, context?: EvaluationContext) => unknown;
  dispatchEffect?: (action: EffectAction, context: EffectDispatchContext) => void | Promise<void>;
}

interface EffectDispatchContext {
  values: Record<string, unknown>;
  resolveValue: (value: LinkageActionValue) => unknown;
  resolveRequest: (request: RemoteDataSourceRequest) => ResolvedDataSourceRequest;
}
```

通过 `FormEditor` / `FormRenderer` 的 `evaluators` 属性提供覆盖项（见 [Embedding](./embedding.md)）——你省略的插槽会回退到对应的默认实现（`dispatchEffect` 回退为空操作）。`resolveLinkageEvaluators(overrides?)` 执行这一填充过程，也正是引擎内部调用的函数；如果你在构建需要在编辑器和渲染器之外使用一套完整求值器的工具，可以直接调用它。

`dispatchEffect` 只会收到委托给宿主的副作用（`alert` / `api_call` / `navigate`），同时收到一个作用域限定在触发规则所处值作用域内的 `EffectDispatchContext`——子表单某一行的副作用看到的是该行自己的记录，而不是根表单：

- **`values`**——副作用触发那一刻该作用域的值。
- **`resolveValue(value)`**——按运行时对任何动作取值的同样方式，求出 `alert` 的消息或 `navigate` 的目标。
- **`resolveRequest(request)`**——与选项解析器完全一样地对 `api_call` 请求中的绑定参数求值（结果为 `undefined` 的参数会被省略），因此处理函数拿到的是纯数据。

在 `beforeSubmit` 下，`dispatchEffect` 返回的 promise 会被等待；`load` 副作用的 reject 会被就地吞掉，而不会冒成未处理的 rejection。

```ts
import type { LinkageAlertLevel, LinkageEvaluators } from "@vef-framework-react/form-editor";

import { showErrorMessage, showInfoMessage, showSuccessMessage, showWarningMessage } from "@vef-framework-react/components";

const SHOW_BY_LEVEL: Record<LinkageAlertLevel, (text: string) => void> = {
  info: showInfoMessage,
  success: showSuccessMessage,
  warning: showWarningMessage,
  error: showErrorMessage
};

export const evaluators: LinkageEvaluators = {
  dispatchEffect: async (action, context) => {
    switch (action.type) {
      case "alert": {
        SHOW_BY_LEVEL[action.level ?? "info"](String(context.resolveValue(action.message) ?? ""));
        return;
      }

      case "api_call": {
        // Bound parameters arrive evaluated: plain data, ready for the wire.
        await callRpc(context.resolveRequest(action.request)); // your own RPC helper
        return;
      }

      case "navigate": {
        await router.navigate({ to: String(context.resolveValue(action.to)) }); // your app's router
      }
    }
  }
};
```

## 宿主上下文与系统变量

`EvaluationContext` 是宿主运行时数据到达每一个表达式、脚本、以 `$` 为根的叶子条件以及绑定的数据源参数的途径：

```ts
interface EvaluationContext {
  variables?: Record<string, unknown>; // $vars
  user?: Record<string, unknown>;      // $user
  node?: Record<string, unknown>;      // $node
  applicant?: Record<string, unknown>; // $applicant
  globals?: Record<string, unknown>;   // $globals
}
```

把它作为 `FormRenderer`（以及 `FormEditor`）的 `evaluationContext` 传入。`variables` 会自动从 `FormSchema.variables` 播种，只有在需要注入或覆盖某个值时才需要通过属性提供；其余插槽承载宿主数据。选对插槽很重要：

- **`$user` 与 `$applicant`。** `$user` 是*此刻*正在查看表单的人。`$applicant` 是表单所*代表*的主体——在流程中即发起人——对于打开同一条记录的每个人都相同。像"发起人属于财务部时显示预算字段"这样的规则必须读 `$applicant`：如果读 `$user`，它会依次按每位审批人求值，随着记录在流程中流转而改变含义。永远不要把发起人放进 `$user`。
- **`$globals` 与 `$vars`。** `$globals` 是宿主解析出的只读属性（租户配置、发起人职称、业务限额），schema 既不能声明也不能写入它们。`$vars` 是表单自己的变量，在 `FormSchema.variables` 中声明，可以用 `set_variable` 写入。

一个针对发起人部门的叶子条件：

```json
{
  "kind": "leaf",
  "sourceKey": "$applicant.departmentName",
  "operator": "eq",
  "value": "Finance"
}
```

### 设计器中的系统变量

运行时会对照它拿到的任何上下文解析以 `$` 为根的路径，但设计者没法选择编辑器根本不知道存在的东西。`FormEditor` 上的 `contextSources: LinkageContextSource[]` 声明宿主会提供的上下文路径——也就是表单的**系统变量**：

```ts
interface LinkageContextSource {
  key: string;   // full scope path, e.g. "$applicant.departmentId"
  label: string; // display name, e.g. "发起人部门 ID"
}
```

声明的来源会出现在两个地方：

- 表单配置抽屉的**「变量」页**会在表单自身的变量上方多出一个「系统变量」区：每一行显示名称、可复制的路径，以及一个**预览值**输入框。没有声明任何来源时，这一页仍是原来那个单纯的表单变量列表。
- **可视化条件构建器**会把它们作为与表单字段并列的「系统变量」分组提供，因此针对发起人的叶子条件是选出来的，而不是手敲出来的。

预览值的存在，是为了让设计者在还没有任何真实发起人的时候就能试一试关于发起人的规则。它以文本形式输入，并按设计者的本意解读——`500` 成为数字，`true` 成为布尔值，`{"a":1}` 成为对象，任何不是 JSON 的内容（`dept-01`）保持为文本。预览值只叠加在设计器预览（及其 JSON 分屏视图）里宿主提供的 `evaluationContext` 之上；它们永远不会写进 schema，不进入撤销历史，并且只有当前仍被声明的来源的预览值才会生效，因此宿主不再声明的变量无法通过一个已经看不到的面板继续影响预览。

声明来源只影响设计器。无论是否声明，运行时都会对照实时的 `EvaluationContext` 解析路径，因此一个手写的、引用未声明路径的条件仍然可以工作——而一个声明了、但宿主在运行时从未提供的路径，读到的就是 `undefined`。

审批包把这一切端到端地接好了：它的设计器声明了四个发起人属性以及宿主声明的表单全局变量，每个审批表单在渲染时都以实例的发起人作为 `$applicant`——见[审批：表单系统变量](../../engines/approval/overview.md#表单系统变量)。

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

`validateLinkageSchema(layer, formLinkage?): LinkageValidationResult` 是针对外部提供的 schema 中联动部分的边界守卫（与 [`validateSchema`](./schema.md#校验导入的-schema) 搭配使用：后者逐个呈现方式调用它，前提是该呈现方式的树结构校验无误，并且表单级联动随 `pc` 树一起传入）。它会：

- 标记格式错误的规则、触发条件、条件、动作与取值；
- 把每个叶子的 `sourceKey` 和每个 `set_field` 的 `targetKey` 对照规则自身值作用域内的带 key 节点进行解析——悬空的会给出警告（`source_key_unresolved` / `target_key_unresolved`），因为在规则引用某字段之后又删掉该字段，是编写过程中的合法状态——并报告未知的 `$` 根（`source_scope_unknown`）；
- 拒绝边沿触发条件下（`state_action_on_edge_trigger`）或表单级作用域中的状态动作、非键控节点上的仅限键控动作，以及挂在非带 key 叶子字段上的 `change` 触发条件；
- 当某个节点默认隐藏、而它自己没有任何由条件触发的 `show` 规则时给出警告——它永远不可能变为可见（`default_hidden_unreachable`）；
- 检测依赖环。依赖边从条件所读取的每个字段，指向该规则写入的每个字段——对写值型状态动作（`assign`，或通过 `value` 写值的 `script`）是节点自身的 key，对 `retrigger` 为 `"always"` 的 `set_field` 是它的目标。规则写入的恰好是其条件读取的字段时，报 `self_reference` 错误；更长的环报 `cycle_detected` 错误。电平稳定的动作（`show` / `hide` / `require` / ……）和按边沿重触发的副作用不会写回任何值，因此可以引用任意字段，包括节点自身。

每个问题都是一个 `ValidationIssue`：`{ path, code: ValidationIssueCode, severity: "error" | "warning", message, ruleId? }`，其中 `ruleId` 指明规则级问题所属的规则。请针对 `code` 和 `path` 编程——它们是稳定且机器可读的；`message` 是预先渲染好的中文产品文案（该包的问题提示信息不支持本地化），完全通过 `formatIssueMessage(code, params?)` 产出。*error* 级别的问题意味着 schema 在结构上已损坏；*warning* 级别的问题属于编写过程中的合法中间状态，不会导致校验失败。每个问题码、它的级别与含义都列在 [Reference](./reference.md#校验问题码) 中。

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

`age` 上的两条提示读取的是它自己：它们是副作用动作，不会写回任何值，因此引用节点自身没有问题。两者都只在上升沿触发——在 `19` 之后输入 `20` 不会再提示一次。
