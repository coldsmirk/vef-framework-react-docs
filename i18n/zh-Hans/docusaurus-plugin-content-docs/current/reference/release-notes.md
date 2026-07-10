---
title: 版本说明与升级指南
description: 每个已发布版本的破坏性变更、新特性和值得关注的修复，并附带升级前后的对照代码。
---

# 版本说明与升级指南

所有已发布的包在同一个仓库中同步发版：一次发布提交会把每个 `packages/*/package.json` 提升到同一版本号，并打上 `vX.Y.Z` 标签。升级时应把所有 `@vef-framework-react/*` 依赖一起升级——[安装](../getting-started/installation.md)将它们统一固定为 `^2.9.0` 正是出于这个原因。不支持在同一应用中混用不同版本的包。

包的*集合*本身也会随版本变化：v2.7.0 移除了 `@vef-framework-react/expression`，v2.8.0 新增了 `@vef-framework-react/approval-form-bridge`——两者在下文中都有说明。

版本按从新到旧排列。每个版本先列破坏性变更，其次是新特性，最后是值得关注的修复。内部 playground 演示和仓库工具链的变更不在此列出。

## v2.9.0 (2026-07-06)

无破坏性变更。

### 新特性

- **starter** — 应用切换器弹出层现在每行容纳四个应用。

## v2.8.0 (2026-07-06)

无破坏性变更。

### 新特性

- **新包：`@vef-framework-react/approval-form-bridge`** — 连接 `form-editor` schema 与审批后端扁平表单契约的纯函数投影桥。导出 `projectFormSchema`、`createApprovalRegistries`、`validateApprovalSchema` 和 `APPROVAL_EXCLUDED_FIELD_TYPES`。请将其加入依赖，版本号与其他包保持一致。参见[审批表单桥](../editors/approval-form-bridge.md)。
- **approval-flow-editor** — 设计器现在镜像后端的聚合与分支条件校验，包括明细表聚合条件，使契约违规在设计时就能暴露，而不是等到部署时。

### 值得关注的修复

- **approval-flow-editor** — 并行加签不再纳入顺序审批的默认项，与后端接受的范围保持一致。

## v2.7.0 (2026-07-05)

本范围内改动最大的版本：form-editor 的表达式引擎和 approval-flow-editor 的状态引擎都被替换。如果你持久化了带联动表达式的表单 schema，升级前请先审查这些表达式。

### 破坏性变更：移除 `@vef-framework-react/expression`

ZEN(GoRules)表达式运行时包被整体删除，请将其从依赖中移除。唯一保留下来的公开 API——条件操作符词表——迁移到了 `approval-flow-editor`：

```ts
// Before (≤ v2.6.0)
import { CONDITION_OPERATORS, type ConditionOperator } from "@vef-framework-react/expression";

// After (≥ v2.7.0)
import { CONDITION_OPERATORS, type ConditionOperator } from "@vef-framework-react/approval-flow-editor";
```

其余一切——`evaluate` / `evaluateSync`、`loadEngine` / `configureEngine`、`ExpressionError`——均已移除，且没有替代品。

### 破坏性变更：form-editor 联动表达式改为原生 JavaScript

联动的 `expression` 条件和表达式取值的赋值动作过去通过共享的 ZEN 求值器运行，现在改为通过 `new Function` 编译的原生 JavaScript(脚本动作一直如此)。**这改变了已存 schema 使用的语言**：任何以 ZEN 方言书写并持久化的表达式都必须改写为 JavaScript 表达式。

```js
// Before (ZEN dialect)
field.age >= 18 and field.status == "active"

// After (JavaScript)
$form.age >= 18 && $form.status === "active"
```

- 求值作用域不变：`field` / `$form`(表单值——`field` 是历史别名)、`$vars`、`$user`、`$node`、`$now`。在两种方言中都合法的表达式(如 `$form.age >= 18`)可原样继续工作。
- 仅 ZEN 支持的语法(`and` / `or` / `not`、ZEN 内置函数)不再能解析；无法编译的源码会退化为条件 `false`、赋值 `undefined`，而不是抛出异常。
- 类型 `ExpressionContext` 重命名为 `EvaluationContext`；`LinkageEvaluators` 各回调签名现在接收 `EvaluationContext`。
- **CSP**：默认求值器现在对*所有*表达式种类都要求 `'unsafe-eval'`，此前只有脚本动作需要。可提供自己的 [`LinkageEvaluators`](../editors/form-editor/linkage.md) 换用沙箱化引擎。

在引擎替换的同时，`FormEditor` 获得了宿主上下文注入能力：`evaluationContext` 属性承载实时的 `$vars` / `$user` / `$node` 值；`contextSources` 属性(`LinkageContextSource[]`)把宿主声明的路径(如 `"$user.departmentId"`)发布到可视化条件构建器的来源选择器中。声明来源只影响选择列表——求值始终读取 `evaluationContext`。

### 破坏性变更：approval-flow-editor 状态引擎重建于 nodeloom 之上

编辑器的状态引擎重建于 `@coldsmirk/nodeloom-core`。内存中的节点和边现在采用 nodeloom 的统一形状：每个节点的 `type` 都是 `"flowNode"`，节点种类判别字段位于 `data.kind`，业务字段则位于 `data.config` 之下。

```ts
// Before (≤ v2.6.0): per-kind xyflow node types
import type { ApprovalNode } from "@vef-framework-react/approval-flow-editor";
const isUrgent = (node: ApprovalNode) =>
  node.type === "approval" && node.data.name === "Urgent";

// After (≥ v2.7.0): uniform FlowNode, discriminated by data.kind
import type { FlowNode } from "@vef-framework-react/approval-flow-editor";
const isUrgent = (node: FlowNode) =>
  node.data.kind === "approval" && node.data.config.name === "Urgent";
```

- 按种类划分的类型别名 `StartNode`、`EndNode`、`ApprovalNode`、`HandleNode`、`ConditionNode`、`CcNode` 不再导出；`FlowNode` / `FlowEdge` 改为 nodeloom 类型的再导出。`AnyNodeData` 仍然导出。
- 内部 store 已重构；通过 `useEditorStore` 做选择的宿主需要适配新的 `EditorState` 形状。
- **线上(wire)格式未受影响。** `toFlowDefinition` / `fromFlowDefinition` 以及 `NodeDefinition`(`value` / `onChange`)契约保持不变，已保存的流程定义无需迁移即可加载。

### 新特性

- **approval-flow-editor** — 新增 `plugins.globalSubjects`(`FormFieldDefinition[]`)，将宿主声明的全局主体注入条件构建器，与内置发起人属性和 `formFields` 并列。参见[宿主集成](../editors/approval-flow-editor/host-integration.md#globalsubjects)。
- **starter** — `Login` 组件会显示登录和挑战(challenge)错误，不再静默失败。

### 依赖

- `components` 现在要求 `antd@^6.4.5`(此前为 `^6.4.3`)。同一批改动中，`starter` 从已废弃的 antd `Alert` `message` / `onClose` 属性迁移到 `title` / `closable`——如果你的应用自己的告警仍在使用废弃属性，请规划同样的迁移。

## v2.6.0 (2026-06-25)

无破坏性变更。

### 新特性

- **form-editor** — `FormEditor` 新增 `publishText` 和 `publishLoading` 属性，用于自定义工具栏的发布动作。
- **form-editor** — 表格存储的列类型现在根据字段控件推断，不再默认为无类型。

## v2.5.0 (2026-06-25)

### 行为变更：`AppItem.icon` 改为 `ReactNode`

starter 应用切换器的 `AppItem.icon` 从 kebab-case 的 lucide 图标*名称*(`icon?: string`，经 `DynamicIcon` 解析)改为可直接渲染的节点(`icon?: ReactNode`，按原样渲染)。纯字符串仍能通过类型检查——但现在会被渲染为字面文本。虽然按 minor 发布，但传入图标名称的宿主必须更新：

```tsx
// Before (≤ v2.4.4)
{ key: "crm", name: "CRM", icon: "briefcase" }

// After (≥ v2.5.0)
{ key: "crm", name: "CRM", icon: <DynamicIcon name="briefcase" /> }
```

### 新特性

- **approval-flow-editor** — `ApprovalFlowEditor` 新增 `onPublish` 属性(`(definition: FlowDefinition) => void`)；仅在提供该属性时才渲染工具栏的发布按钮。

## v2.4.1 – v2.4.4 (2026-06-17 – 2026-06-18)

### 破坏性变更(v2.4.1)：精简 ZEN 表达式运行时

`@vef-framework-react/expression` 被裁剪至仅保留基础求值器，form-editor 联动改为经由精简后的运行时。从公开 API 中移除的有：条件编译器(`compileCondition`、`compileGroup`、`compileBranch`、`selectBranch`、`toZenLiteral`)、智能提示 API(`analyzeTypes`、`getCompletionItems`、`getDiagnostics` 等)、语言环境辅助函数以及 React 绑定。剩余部分已在 v2.7.0 中整体删除，因此对该包的任何依赖都应视为 v2.7.0 升级的阻塞项。

### 新特性

- **form-editor** — 停靠(docked)与抽屉(drawer)两种编辑器布局模式、表格子表单的按列宽度、更宽的折叠组件面板栏，以及设计器中以列表格形式展示表格子表单(均为 v2.4.1)。
- **components** — `ScrollArea` 新增 `scrollbars` 轴向选项(v2.4.1)。

### 值得关注的修复

- **starter** — 一系列顶部菜单修复：溢出项折叠进"更多"指示器且不再溢出(v2.4.2、v2.4.3)；菜单访问检查与路由模板匹配(v2.4.2)；菜单以 path + params + search 标识，使参数化路由能各自高亮(v2.4.3)。`UserMenu.meta` 的 params/search 也相应补齐了类型(v2.4.4)。
- **core** — 令牌过期的请求在静默刷新后以重试的响应结算，而不是抛出原始的 401(v2.4.2)。
- **build** — 包的类型声明保持扁平地放在 `dist/types` 下，修复了消费方的类型解析问题(v2.4.1)。

## 更早的版本(v2.4.0 之前)

v2.4.0(2026-06-15)是首个公开发布版本；仓库的 git 历史从这里开始，更早的变更只能依据文档而非提交记录来概述。

在本文档中仍会遇到的一项早期迁移：**v2.1.6 将 VEF 的页面与 CRUD 组件从 `@vef-framework-react/starter` 移动到 `@vef-framework-react/components`**——包括 `Page`、`Crud` / `CrudPage`、`ProTable`、`ProSearch`、`FlexCard`、`FormModal` 和 `FormDrawer`——并在 `components` 中引入了 `LogoIcon`。如果你的代码库来自 2.1.6 之前，请把这些导入从 `starter` 更新为 `components`；[组件](../components/overview.md)中每个受影响的页面都带有相同的提示。
