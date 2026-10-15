---
title: 审批流编辑器 API 参考
description: "@vef-framework-react/approval-flow-editor 导出的组件、类型、hooks 和常量。"
---

# API 参考

`@vef-framework-react/approval-flow-editor` 的干货签名参考。关于叙述性的用法说明，见 [概览](./overview.md) 和 [宿主集成](./host-integration.md)。

## 组件

### `ApprovalFlowEditor`

`FC<ApprovalFlowEditorProps>`

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `FlowDefinition` | 流程定义（后端格式）。传入一个新的引用（不是编辑器自己发出的那个）会重新加载画布。空值 / 缺省会填充一个 start→end 的最小流程。 |
| `onChange` | `(definition: FlowDefinition) => void` | 每次图变化时调用，携带一份脱离的深拷贝。 |
| `onPublish` | `(definition: FlowDefinition) => void` | 发布钩子，在校验通过后携带当前定义调用。省略此项则不渲染发布按钮。 |
| `publishText` | `string` | 发布按钮文案。默认 `"发布"`。 |
| `publishLoading` | `boolean` | 在发布按钮上显示加载指示并阻止重复点击。默认 `false`。 |
| `readonly` | `boolean` | 禁用编辑并隐藏工具栏 / 发布按钮。默认 `false`。 |
| `plugins` | `EditorPlugins` | 宿主集成点（选择器、表单字段、全局变量）。 |
| `className` | `string` | 编辑器外壳上的自定义 class。 |
| `style` | `CSSProperties` | 编辑器外壳上的自定义样式。 |

## 插件

| 导出 | 种类 | 说明 |
| --- | --- | --- |
| `EditorPlugins` | type | `{ pickers?, assigneeKinds?, ccKinds?, formFields?, globalSubjects?, shared? }`——见 [宿主集成](./host-integration.md#plugins-editorplugins)。 |
| `PickerProps` | type | `{ value: string[]; onChange: (ids: string[]) => void; disabled?: boolean }`。 |
| `PrincipalKind` | type | `"user" \| "role" \| "department"`。 |
| `PRINCIPAL_KINDS` | const | `readonly ["user", "role", "department"]`。 |
| `isPrincipalKind` | fn | `(kind: string) => kind is PrincipalKind`。 |
| `KindDescriptor` | type | `{ kind: string; label: string; selection: SelectionMode }`。 |
| `SelectionMode` | type | `"none" \| "user" \| "role" \| "department" \| "form_field" \| "custom"`。 |
| `BUILTIN_ASSIGNEE_KINDS` / `BUILTIN_CC_KINDS` | const | 宿主未提供服务目录时使用的框架内置 kind 目录。 |

## 流程定义（wire 格式）

| 导出 | 结构 |
| --- | --- |
| `FlowDefinition` | `{ nodes: NodeDefinition[]; edges: EdgeDefinition[] }` |
| `NodeDefinition` | `{ id: string; kind: NodeKind; position: XYPosition; data?: NodeDataMap[kind] }`（基于 `kind` 的可辨识联合类型） |
| `EdgeDefinition` | `{ id?: string; source: string; target: string; sourceHandle?: string; data?: Record<string, unknown> }`——`sourceHandle` 把一个 `condition` 节点的外出边绑定到某条分支 id |
| `NodeKind` | `"start" \| "approval" \| "handle" \| "condition" \| "cc" \| "end"` |
| `FlowNode`、`FlowEdge` | 实时（内存中）的画布形态，由本包自行定义: `FlowNode` 是各按类型定型的 `@xyflow/react` 节点（见下一行）的联合类型；`FlowEdge` 是 xyflow 的 `Edge`。通过 `toFlowDefinition` / `fromFlowDefinition` 与 `FlowDefinition` 互转。 |
| `StartNode`、`ApprovalNode`、`HandleNode`、`CcNode` | 按类型定型的实时节点——`Node<StartNodeData, "start">`、`Node<ApprovalNodeData, "approval">`、`Node<HandleNodeData, "handle">`、`Node<CcNodeData, "cc">`。在实时节点上，由 React Flow 的 `type` 承载节点类型（它驱动节点渲染）；只有 wire 层的 `NodeDefinition` 才把它提升为 `kind`，而节点的业务字段直接位于 `data` 上——正是 wire 所承载的那个 `NodeDataMap[kind]` 形态。`end` / `condition` 的别名在内部存在，但未导出。 |

## 按类型划分的节点数据

`NodeDataMap` 把每种 `NodeKind` 映射到它的数据形态；`AnyNodeData` 是全部六种的联合类型（定义为 `FlowNode["data"]`）。每种类型的数据都包含 `name?: string`（显示名称）和 `description?: string`。这些形态身兼二职: 它们既是 wire 上的 `NodeDefinition.data` 载荷，**也**是实时节点的 `data`——序列化器只翻译类型判别字段（`kind` ↔ React Flow 的 `type`），从不触碰数据。

| 种类 | 类型 | 字段（除 name / description 外） |
| --- | --- | --- |
| `start` | `StartNodeData` | — |
| `end` | `EndNodeData` | — |
| `approval` | `ApprovalNodeData` | 继承 `TaskNodeData`，加上 `approvalMethod`、`passRule`、`passRatio`、`passCount`、`sameApplicantAction`、`consecutiveApproverAction`、`rollbackType`、`rollbackDataStrategy`、`rollbackTargetKeys`、`isRollbackAllowed`、`isAddAssigneeAllowed`、`addAssigneeTypes`、`isRemoveAssigneeAllowed`、`isManualCcAllowed` |
| `handle` | `HandleNodeData` | `TaskNodeData` 的别名（没有审批专属字段） |
| `condition` | `ConditionNodeData` | `branches?: ConditionBranchDefinition[]` |
| `cc` | `CcNodeData` | `ccs?: CcDefinition[]`、`isReadConfirmRequired?: boolean`、`fieldPermissions?: Record<string, CcFieldPermission>` |

`TaskNodeData`（`approval` 和 `handle` 共用）:

| 字段 | 类型 |
| --- | --- |
| `assignees?` | `AssigneeDefinition[]` |
| `executionType?` | `ExecutionType` |
| `emptyAssigneeAction?` | `EmptyAssigneeAction` |
| `fallbackUserIds?` | `string[]` |
| `adminUserIds?` | `string[]` |
| `isTransferAllowed?` | `boolean` |
| `isOpinionRequired?` | `boolean` |
| `timeoutHours?` | `number` |
| `timeoutAction?` | `TimeoutAction` |
| `timeoutNotifyBeforeHours?` | `number` |
| `urgeCooldownMinutes?` | `number` |
| `ccs?` | `CcDefinition[]` |
| `fieldPermissions?` | `Record<string, FieldPermission>` |

## 审批人、抄送与条件相关类型

| 导出 | 结构 |
| --- | --- |
| `AssigneeDefinition` | `{ kind: AssigneeKind; ids?: string[]; formField?: string; sortOrder: number }` |
| `AssigneeKind` | `string`——设计为开放标识符；可部署值是后端注册了 `approval.AssigneeResolver` 的 kind |
| `CcDefinition` | `{ kind: CcKind; ids?: string[]; formField?: string; timing?: CcTiming }` |
| `CcKind` | `string`——设计为开放标识符；可部署值是后端注册了 `approval.CCResolver` 的 kind |
| `CcTiming` | `"always" \| "on_approve" \| "on_reject"` |
| `FieldPermission` | `"visible" \| "editable" \| "hidden" \| "required"` |
| `CcFieldPermission` | `"visible" \| "hidden"`——CC 节点只能观察表单，因此不提供 editable / required |
| `ConditionDefinition` | `{ kind: ConditionKind; subject: string; aggregate?: "sum" \| "count" \| "avg"; column?: string; operator: ConditionOperator \| ""; value: unknown; expression: string }` |
| `ConditionKind` | `"field" \| "expression"` |
| `ConditionOperator` | 从 `CONDITION_OPERATORS` 派生——见 [宿主集成](./host-integration.md#条件运算符) |
| `ConditionGroup` | `{ conditions: ConditionDefinition[] }`——组内条件为 AND 关系 |
| `ConditionBranchDefinition` | `{ id: string; label: string; conditionGroups?: ConditionGroup[]; isDefault?: boolean; priority: number }` |
| `FormFieldDefinition` | `{ key: string; kind: FieldKind; label: string; options?: FieldOptionDefinition[]; columns?: FormFieldDefinition[]; hasConditionalVisibility?: boolean }` |
| `FieldKind` | `"input" \| "textarea" \| "select" \| "number" \| "date" \| "upload" \| "table"` |
| `FieldOptionDefinition` | `{ label: string; value: unknown }` |

`ConditionDefinition.aggregate` 为某个明细表 `subject` 圈定一次聚合折叠（`sum` / `count` / `avg`，对应后端的 `AggregateKind`）；`column` 指定要折叠的数值列（`count` 不需要，因为它折叠的是行）。

`FormFieldDefinition.hasConditionalVisibility`（v2.10.0）是一个设计器侧提示: 当该字段的可见性可能被表单联动关掉时为 `true`——它自身带有具备隐藏能力的联动、默认隐藏，或某个祖先容器具备隐藏能力。当某个节点在这样的字段上授予 `required` 权限时，字段权限表会显示一条非阻塞警告，因为后端的必填检查并不感知联动: 如果字段在审批时被隐藏，它的空值会让通过操作永远被拒绝。该标注由 `approval-form-bridge` 的 `projectFormSchema` 填充；当字段清单来自其他途径时则不存在。

## 枚举

| 导出 | 取值 |
| --- | --- |
| `ApprovalMethod` | `"sequential" \| "parallel"` |
| `PassRule` | `"all" \| "any" \| "ratio" \| "fixed_count"`——`"all"` 意味着有一票否决权；`"fixed_count"`（v2.24.0）在 `passCount` 位审批人通过时即通过——参与人数不足时需全部通过——并在这个人数已不可能达到时驳回 |
| `EmptyAssigneeAction` | `"auto_pass" \| "transfer_admin" \| "transfer_superior" \| "transfer_applicant" \| "transfer_specified"` |
| `ExecutionType` | `"manual" \| "auto_pass" \| "auto_reject"` |
| `SameApplicantAction` | `"auto_pass" \| "self_approve" \| "transfer_superior" \| "exclude"`——作用于发起人自己的席位；`exclude` 让该席位回避，由其余办理人决定 |
| `RollbackType` | `"none" \| "previous" \| "start" \| "any" \| "specified"` |
| `RollbackDataStrategy` | `"clear" \| "keep"` |
| `ConsecutiveApproverAction` | `"none" \| "auto_pass"` |
| `TimeoutAction` | `"none" \| "auto_pass" \| "auto_reject" \| "notify" \| "transfer_admin"` |
| `AddAssigneeType` | `"before" \| "after" \| "parallel"` |

## 校验

```ts
function validateFlowDefinition(
  definition: FlowDefinition,
  context?: FlowValidationContext
): FlowValidationError[];
```

`FlowValidationContext` 的结构是 `{ formFields?: FormFieldDefinition[]; assigneeKinds?: readonly KindDescriptor[]; ccKinds?: readonly KindDescriptor[]; shared?: boolean }`。省略 kind 目录时回退到框架内置目录；注册了应用自定义 kind 的宿主必须传入 `approval/flow.list_kind_options` 返回的目录。`shared`（v2.26.0）加上后端对全局流程的部署规则——即下文的 `shared_*` 代码。

`FlowValidationError`: `{ code: FlowValidationCode; message: string; nodeId?: string; edgeId?: string; branchId?: string }`。`message` 是与编辑器 UI 语言一致的人类可读中文产品文案；请针对 `code` 和各个 id 字段编程。

`formFields` 是三态的（v2.10.0）: `undefined` 表示字段清单*不可用*（宿主没有任何表单集成）——只会跳过 key 存在性检查（`field_permission_key_unknown`）；显式传入 `[]` 表示已确认表单有*零个*字段，此时每一条 `fieldPermissions` 条目都是悬空引用。见 [宿主集成 → 校验](./host-integration.md#校验-validateflowdefinition)。

`FlowValidationCode` 是一个封闭集合，对应后端部署时的各项检查:

**图结构**

| 代码 | 含义 |
| --- | --- |
| `no_nodes` | 流程没有任何节点。 |
| `empty_node_id` / `duplicate_node_id` | 某个节点 id 为空 / 重复。 |
| `invalid_node_kind` | 某个节点的 `kind` 不属于 `NODE_KINDS`。 |
| `start_node_count` | 流程必须恰好有一个 `start` 节点。 |
| `end_node_count` | 流程必须至少有一个 `end` 节点。 |
| `empty_edge_id` / `duplicate_edge_id` | 某条边 id 为空 / 重复。 |
| `unknown_source_node` / `unknown_target_node` | 某条边引用了一个不存在的节点 id。 |
| `start_incoming` | start 节点有一条进入边。 |
| `start_outgoing` | start 节点的外出边不是恰好一条。 |
| `end_outgoing` | 某个 end 节点有外出边。 |
| `end_incoming` | 某个 end 节点没有任何进入边。 |
| `node_outgoing_count` | 某个非 condition 节点的外出边不是恰好一条。 |
| `node_source_handle` | 某个非 condition 节点的外出边带有分支句柄。 |
| `graph_cycle` | 图中存在环。 |
| `node_unreachable` | 某个节点无法从 start 节点到达。 |
| `node_cannot_reach_end` | 某个节点无法到达任何 end 节点。 |

**Condition 节点**

| 代码 | 含义 |
| --- | --- |
| `condition_min_branches` | 分支数少于 2 条。 |
| `condition_empty_branch_id` / `condition_duplicate_branch_id` | 某个分支 id 为空 / 重复。 |
| `condition_default_count` | 默认分支不是恰好一条。 |
| `condition_missing_handle` | 某条外出边没有分支句柄。 |
| `condition_unknown_handle` | 某条外出边的句柄不匹配任何分支 id。 |
| `condition_duplicate_handle` | 两条外出边绑定了同一个分支。 |
| `condition_branch_no_edge` | 某条分支没有外出边。 |
| `duplicate_branch_priority` | 两条非默认分支共用同一个优先级。 |
| `condition_subject_required` | 某个字段条件没有 subject。 |
| `invalid_condition_operator` | 运算符不在 `CONDITION_OPERATORS` 之内。 |
| `condition_expression_required` | 某个表达式条件的 `expression` 为空。 |
| `invalid_condition_kind` | `kind` 既不是 `"field"` 也不是 `"expression"`。 |
| `branch_conditions_required` | 某条非默认分支没有条件组。 |
| `condition_group_empty` | 某个条件组里没有任何条件。 |
| `invalid_aggregate` | `aggregate` 不属于 `"sum" \| "count" \| "avg"`。 |
| `aggregate_operator` | 某个聚合条件使用了非数值比较类的运算符。 |
| `aggregate_column_required` | `sum` / `avg` 聚合没有指定列。 |
| `aggregate_column_forbidden` | `count` 聚合选择了某一列。 |
| `aggregate_on_expression` | 某个表达式条件携带了 aggregate。 |

**审批人、抄送与字段权限**（approval / handle / cc 节点）——字段权限相关代码于 v2.10.0 加入，对应后端部署时的 `ValidateFieldPermissions`，因此权限配置错误会在设计器中暴露，而不是等到部署时才发现

| 代码 | 含义 |
| --- | --- |
| `invalid_assignee_kind` | 某个审批人的 `kind` 不在 kind 目录中——即上下文的 `assigneeKinds`，省略时为 `BUILTIN_ASSIGNEE_KINDS`。 |
| `assignee_ids_required` | 某个审批人的类型需要选择具体对象（selection 为 `user` / `role` / `department` / `custom`），却一个都没选——它将匹配不到任何人，后端在部署时会拒绝。 |
| `assignee_form_field_required` | 某个 `form_field` 类型的审批人没有选择字段。 |
| `invalid_cc_kind` / `invalid_cc_timing` | 某个抄送的 `kind` 不在 kind 目录中（`ccKinds`，省略时为 `BUILTIN_CC_KINDS`），或其 `timing` 不在枚举范围内。 |
| `cc_ids_required` | 某个抄送人的类型需要选择具体对象（selection 为 `user` / `role` / `department` / `custom`），却一个都没选。 |
| `cc_form_field_required` | 某个 `form_field` 类型的抄送收件人没有选择字段。 |
| `invalid_execution_type` | `executionType` 不在 `ExecutionType` 之内。 |
| `invalid_empty_assignee_action` | `emptyAssigneeAction` 不在其枚举范围内。 |
| `invalid_timeout_action` | `timeoutAction` 不在 `TimeoutAction` 之内。 |
| `fallback_users_required` | `emptyAssigneeAction: "transfer_specified"` 但没有 `fallbackUserIds`。 |
| `admin_users_required` | `emptyAssigneeAction: "transfer_admin"` 但没有 `adminUserIds`。 |
| `timeout_admin_users_required` | 设置了时限（`timeoutHours` > 0）的节点 `timeoutAction` 为 `"transfer_admin"`，但没有 `adminUserIds`（v2.26.0）。没有时限的节点永远不会超时，因此不检查它的超时处理方式。 |
| `invalid_field_permission` | 某个 `fieldPermissions` 值不在 `FieldPermission` 之内。 |
| `field_permission_key_unknown` | 某个 `fieldPermissions` key 不存在于传入的 `formFields` 中。当 `formFields` 省略（`undefined`）时跳过——没有可供比对的清单。 |
| `cc_field_permission_not_allowed` | 某个 CC 节点的 `fieldPermissions` 值不在 `visible` / `hidden` 之内。 |
| `field_permission_required_auto_pass` | 某个任务节点把 `"required"` 字段权限与 `timeoutAction: "auto_pass"` 配在一起——超时路径会在不经过人工审批必填检查的情况下结束该节点，因此必填字段可能带着空值通过。无论 `formFields` 处于三态中的哪一态都会运行（它只检查节点自身的数据）。 |

**Approval 专属**

| 代码 | 含义 |
| --- | --- |
| `invalid_approval_method` / `invalid_pass_rule` | 不在各自的枚举范围内。 |
| `pass_ratio_range` | `passRule: "ratio"` 但 `passRatio` 不在 `(0, 100]` 范围内。 |
| `pass_count_range` | `passRule: "fixed_count"` 但 `passCount` 不是 ≥ 1 的整数。没有上限：审批人在运行时才解析，引擎会以实际参与的审批人数为上限。 |
| `invalid_same_applicant_action` / `invalid_consecutive_approver_action` | 不在各自的枚举范围内。 |
| `invalid_rollback_type` / `invalid_rollback_data_strategy` | 不在各自的枚举范围内。 |
| `invalid_add_assignee_type` | 某个 `addAssigneeTypes` 项不在 `AddAssigneeType` 之内。 |
| `rollback_targets_required` | `rollbackType: "specified"` 但没有 `rollbackTargetKeys`。 |
| `rollback_target_unknown` | 某个回退目标不是一个已存在的 approval / handle 节点。 |
| `rollback_target_self` | 某个回退目标引用了节点自身。 |
| `sequential_parallel_add_assignee` | `approvalMethod: "sequential"` 但 `addAssigneeTypes` 里包含了 `"parallel"`。 |

**Handle 专属**

| 代码 | 含义 |
| --- | --- |
| `handle_execution_auto_reject` | 某个 handle 节点的 `executionType` 是 `"auto_reject"`（不支持）。 |
| `handle_timeout_auto_reject` | 某个 handle 节点的 `timeoutAction` 是 `"auto_reject"`（不支持）。 |

**全局流程**（仅在 `shared: true` 时，v2.26.0）——对应后端的 `ValidateSharedFlowNodes`：全局流程在每个租户中运行，因此不能把任何工作派给某一个租户的人。规则判断的是处理方式，而不是残留的管理员或指定人员列表——只要没有处理方式指向它，这份列表就不会把任务交给任何人。

| 代码 | 含义 |
| --- | --- |
| `shared_assignee_names_people` | 某个审批人的 kind 选取用户、角色或部门（其 `selection` 是 `PrincipalKind`）。 |
| `shared_cc_names_people` | 某个抄送人的 kind 选取用户、角色或部门——无论在任务节点还是抄送节点上。 |
| `shared_fallback_users` | `emptyAssigneeAction: "transfer_specified"`。 |
| `shared_node_admins` | `emptyAssigneeAction: "transfer_admin"`。 |
| `shared_timeout_to_admins` | 设置了时限的节点 `timeoutAction` 为 `"transfer_admin"`。 |

## 序列化

| 导出 | 签名 |
| --- | --- |
| `toFlowDefinition` | `(nodes: FlowNode[], edges: FlowEdge[]) => FlowDefinition` |
| `fromFlowDefinition` | `(definition: FlowDefinition) => { nodes: FlowNode[]; edges: FlowEdge[] }` |

## 规格定义

| 导出 | 签名 / 结构 |
| --- | --- |
| `NodeSpecification` | `{ type: NodeKind; label: string; color: string; icon: ComponentType<LucideProps>; badgeVariant?: "soft" \| "solid"; configPanel?: ComponentType<{ nodeId: string }> }` |
| `getSpecification` | `(kind: NodeKind) => NodeSpecification`——遇到未知类型会抛出异常 |
| `getAllSpecifications` | `() => NodeSpecification[]` |
| `getAddableSpecifications` | `() => NodeSpecification[]`——工具栏可以添加的类型对应的规格（`NODE_RULES[kind].addable`） |

## 常量与结构规则

| 导出 | 结构 |
| --- | --- |
| `NODE_KINDS` | `readonly NodeKind[]`——全部六种类型 |
| `isNodeKind` | `(kind: string) => kind is NodeKind` |
| `NODE_KIND_LABELS` | `Record<NodeKind, string>`——每种类型对应的显示标签 |
| `NodeRule` | `{ maxCount?: number; deletable: boolean; addable: boolean }` |
| `NODE_RULES` | `Record<NodeKind, NodeRule>`——见 [概览](./overview.md#节点类型) 中的表格 |
| `DEFAULT_NODE_DATA` | `Record<NodeKind, Record<string, unknown>>`——每种类型新增节点时的深度冻结默认数据；使用前请先克隆 |
| `CONDITION_OPERATORS` | `readonly ConditionOperator[]`——`ConditionOperator` 派生自的运行时白名单；见 [宿主集成](./host-integration.md#条件运算符) |

## Store hooks

用于高级状态检查——例如测试，或以编程方式读取实时图:

| 导出 | 签名 |
| --- | --- |
| `useEditorStore` | `<T>(selector: (state: EditorState) => T) => T` |
| `useEditorStoreApi` | `() => UnboundStore<EditorState>`——一个 zustand store api（带 `subscribeWithSelector` / `immer` 中间件），来自 core 的 `createComponentStore` |
| `EditorState` | 完整的 store 状态 + 动作——自 v2.13.0 手写状态引擎回归后，这是本包自己的类型 |

`EditorState` 是五个切片（slice）的交集（切片类型本身是内部实现；只有 `EditorState` 被导出）:

| 切片 | 状态 | 动作 |
| --- | --- | --- |
| Graph | `nodes: FlowNode[]`、`edges: FlowEdge[]` | `onNodesChange` / `onEdgesChange` / `onConnect`（xyflow 变更处理器）；`addNode(type: NodeKind, position: XYPosition, data?: Partial<AnyNodeData>) => string \| null`——返回新节点的 id，被拒绝时返回 `null`（只读，或该类型已达数量上限）；`removeNode(nodeId)`——只读或不可删除的类型会被拒绝，会一并清理相连的边和回退目标引用；`removeEdge(edgeId)`；`updateNodeData(nodeId, data: Partial<AnyNodeData>)`；`updateNodePositions(positions: Map<string, XYPosition>)`——批量提交位置（自动布局用）；`updateConditionBranch(nodeId, branchId, patch)`；`addConditionBranch(nodeId)`——插入到默认分支之前；`removeConditionBranch(nodeId, branchId)`——级联移除该分支的边 |
| Interaction | `selectedNodeId: string \| null`、`hoveredEdgeId: string \| null`、`readonly: boolean` | `selectNode(nodeId \| null)`、`setHoveredEdgeId(edgeId \| null)`、`setReadonly(readonly)` |
| Flow | `isDirty: boolean` | `loadDefinition(definition)`——完成水合（空定义会填充 start→end），并重置选中状态、脏标记与撤销时间线；`toDefinition() => FlowDefinition`——一份脱离的深拷贝；`reset()` |
| Validation | `validationIssues: FlowValidationError[]`、`nodeIssueCounts: Record<string, number>`——每个节点 id 的问题计数，这样节点外观只需订阅自己的那一项 | `setValidationIssues(issues)` |
| History | `past: HistoryEntry[]`、`future: HistoryEntry[]`——`HistoryEntry = { nodes: FlowNode[]; edges: FlowEdge[] }`（整图快照；视图状态从不进入检查点） | `undo()`、`redo()` |

没有 `canUndo` / `canRedo` 成员: 请用 `past.length > 0` / `future.length > 0` 自行推导。少数成员属于内部管线（`changeVersion`、`checkpoint`、`breakCoalescing`）——在类型上可见，但不面向宿主。

两个 hook 都解析自 `<ApprovalFlowEditor>` 内部挂载的 store——没有面向宿主的插槽可以在那个 provider 树内部渲染额外组件（provider 本身就是刻意不导出的），所以这两个 hook 主要用于读取状态（例如通过 `useEditorStoreApi().getState()`），而不是用于在画布内部挂载自定义 UI。

## 视觉 tokens

| 导出 | 结构 |
| --- | --- |
| `NODE_KIND_COLORS` | `Record<NodeKind, string>`——每种类型对应的强调色（主题自适应的 CSS 变量引用） |
| `ApprovalIcon`、`CcIcon`、`ConditionIcon`、`EndIcon`、`HandleIcon`、`StartIcon` | 与六种节点类型一一对应的 `lucide-react` 图标组件 |
