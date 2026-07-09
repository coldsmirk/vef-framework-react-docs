---
title: Approval Flow Editor API Reference
description: Exported component, types, hooks, and constants of @vef-framework-react/approval-flow-editor.
---

# API Reference

Dry signature reference for `@vef-framework-react/approval-flow-editor`. For narrative usage, see [Overview](./overview.md) and [Host Integration](./host-integration.md).

## Component

### `ApprovalFlowEditor`

`FC<ApprovalFlowEditorProps>`

| Prop | Type | Description |
| --- | --- | --- |
| `value` | `FlowDefinition` | Flow definition (backend format). A new reference (not one the editor itself emitted) reloads the canvas. Empty/missing seeds a start→end flow. |
| `onChange` | `(definition: FlowDefinition) => void` | Called on every graph change with a detached deep copy. |
| `onPublish` | `(definition: FlowDefinition) => void` | Publish hook, called with the current definition after a passing validation pass. Omitted ⇒ no publish button rendered. |
| `publishText` | `string` | Publish button label. Default `"发布"`. |
| `publishLoading` | `boolean` | Shows a spinner and blocks re-clicks on the publish button. Default `false`. |
| `readonly` | `boolean` | Disables editing and hides the toolbar/publish button. Default `false`. |
| `plugins` | `EditorPlugins` | Host integration points (pickers, form fields, global subjects). |
| `className` | `string` | Custom class on the editor shell. |
| `style` | `CSSProperties` | Custom style on the editor shell. |

## Plugins

| Export | Kind | Description |
| --- | --- | --- |
| `EditorPlugins` | type | `{ pickers?, formFields?, globalSubjects? }` — see [Host Integration](./host-integration.md#plugins-editorplugins). |
| `PickerProps` | type | `{ value: string[]; onChange: (ids: string[]) => void; disabled?: boolean }`. |
| `PrincipalKind` | type | `"user" \| "role" \| "department"`. |
| `PRINCIPAL_KINDS` | const | `readonly ["user", "role", "department"]`. |
| `isPrincipalKind` | fn | `(kind: string) => kind is PrincipalKind`. |

## Flow definition (wire format)

| Export | Shape |
| --- | --- |
| `FlowDefinition` | `{ nodes: NodeDefinition[]; edges: EdgeDefinition[] }` |
| `NodeDefinition` | `{ id: string; kind: NodeKind; position: XYPosition; data?: NodeDataMap[kind] }` (discriminated union on `kind`) |
| `EdgeDefinition` | `{ id?: string; source: string; target: string; sourceHandle?: string; data?: Record<string, unknown> }` — `sourceHandle` binds a `condition` node's outgoing edge to a branch id |
| `NodeKind` | `"start" \| "approval" \| "handle" \| "condition" \| "cc" \| "end"` |
| `FlowNode`, `FlowEdge` | Live (in-memory) node/edge shapes, re-exported from `@coldsmirk/nodeloom-core`. Convert to/from `FlowDefinition` via `toFlowDefinition` / `fromFlowDefinition`. |

## Node data by kind

`NodeDataMap` maps each `NodeKind` to its data shape; `AnyNodeData` is the union (`NodeDataMap[NodeKind]`). Every kind's data includes `name?: string` (display name) and `description?: string`.

| Kind | Type | Fields (beyond name/description) |
| --- | --- | --- |
| `start` | `StartNodeData` | — |
| `end` | `EndNodeData` | — |
| `approval` | `ApprovalNodeData` | extends `TaskNodeData` + `approvalMethod`, `passRule`, `passRatio`, `sameApplicantAction`, `consecutiveApproverAction`, `rollbackType`, `rollbackDataStrategy`, `rollbackTargetKeys`, `isRollbackAllowed`, `isAddAssigneeAllowed`, `addAssigneeTypes`, `isRemoveAssigneeAllowed`, `isManualCcAllowed` |
| `handle` | `HandleNodeData` | alias of `TaskNodeData` (no approval-specific fields) |
| `condition` | `ConditionNodeData` | `branches?: ConditionBranchDefinition[]` |
| `cc` | `CcNodeData` | `ccs?: CcDefinition[]`, `isReadConfirmRequired?: boolean`, `fieldPermissions?: Record<string, CcFieldPermission>` |

`TaskNodeData` (shared by `approval` and `handle`):

| Field | Type |
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

## Assignee, CC, and condition types

| Export | Shape |
| --- | --- |
| `AssigneeDefinition` | `{ kind: AssigneeKind; ids?: string[]; formField?: string; sortOrder: number }` |
| `AssigneeKind` | `PrincipalKind \| "self" \| "superior" \| "department_leader" \| "form_field"` |
| `CcDefinition` | `{ kind: CcKind; ids?: string[]; formField?: string; timing?: CcTiming }` |
| `CcKind` | `PrincipalKind \| "form_field"` |
| `CcTiming` | `"always" \| "on_approve" \| "on_reject"` |
| `FieldPermission` | `"visible" \| "editable" \| "hidden" \| "required"` |
| `CcFieldPermission` | `"visible" \| "hidden"` — CC nodes only observe the form, so editable/required are not offered |
| `ConditionDefinition` | `{ kind: ConditionKind; subject: string; aggregate?: "sum" \| "count" \| "avg"; column?: string; operator: ConditionOperator \| ""; value: unknown; expression: string }` |
| `ConditionKind` | `"field" \| "expression"` |
| `ConditionOperator` | Derived from `CONDITION_OPERATORS` — see [Host Integration](./host-integration.md#condition-operators) |
| `ConditionGroup` | `{ conditions: ConditionDefinition[] }` — conditions AND-ed within a group |
| `ConditionBranchDefinition` | `{ id: string; label: string; conditionGroups?: ConditionGroup[]; isDefault?: boolean; priority: number }` |
| `FormFieldDefinition` | `{ key: string; kind: FieldKind; label: string; options?: FieldOptionDefinition[]; columns?: FormFieldDefinition[] }` |
| `FieldKind` | `"input" \| "textarea" \| "select" \| "number" \| "date" \| "upload" \| "table"` |
| `FieldOptionDefinition` | `{ label: string; value: unknown }` |

`ConditionDefinition.aggregate` scopes an aggregate fold (`sum` / `count` / `avg`, mirroring the backend's `AggregateKind`) over a detail-table `subject`; `column` names the numeric column to fold (unset for `count`, which folds rows).

## Enums

| Export | Values |
| --- | --- |
| `ApprovalMethod` | `"sequential" \| "parallel"` |
| `PassRule` | `"all" \| "any" \| "ratio"` — `"all"` implies veto power |
| `EmptyAssigneeAction` | `"auto_pass" \| "transfer_admin" \| "transfer_superior" \| "transfer_applicant" \| "transfer_specified"` |
| `ExecutionType` | `"manual" \| "auto_pass" \| "auto_reject"` |
| `SameApplicantAction` | `"auto_pass" \| "self_approve" \| "transfer_superior"` |
| `RollbackType` | `"none" \| "previous" \| "start" \| "any" \| "specified"` |
| `RollbackDataStrategy` | `"clear" \| "keep"` |
| `ConsecutiveApproverAction` | `"none" \| "auto_pass"` |
| `TimeoutAction` | `"none" \| "auto_pass" \| "auto_reject" \| "notify" \| "transfer_admin"` |
| `AddAssigneeType` | `"before" \| "after" \| "parallel"` |

## Validation

```ts
function validateFlowDefinition(
  definition: FlowDefinition,
  formFields: FormFieldDefinition[] = []
): FlowValidationError[];
```

`FlowValidationError`: `{ code: FlowValidationCode; message: string; nodeId?: string; edgeId?: string; branchId?: string }`.

`FlowValidationCode` is a closed set mirroring the backend's deploy-time checks:

**Graph structure**

| Code | Meaning |
| --- | --- |
| `no_nodes` | The flow has no nodes. |
| `empty_node_id` / `duplicate_node_id` | A node id is empty / reused. |
| `invalid_node_kind` | A node's `kind` isn't one of `NODE_KINDS`. |
| `start_node_count` | The flow must have exactly one `start` node. |
| `end_node_count` | The flow must have at least one `end` node. |
| `empty_edge_id` / `duplicate_edge_id` | An edge id is empty / reused. |
| `unknown_source_node` / `unknown_target_node` | An edge references a node id that doesn't exist. |
| `start_incoming` | The start node has an incoming edge. |
| `start_outgoing` | The start node doesn't have exactly one outgoing edge. |
| `end_outgoing` | An end node has an outgoing edge. |
| `end_incoming` | An end node has no incoming edges. |
| `node_outgoing_count` | A non-condition node doesn't have exactly one outgoing edge. |
| `node_source_handle` | A non-condition node's outgoing edge carries a branch handle. |
| `graph_cycle` | The graph contains a cycle. |
| `node_unreachable` | A node can't be reached from the start node. |
| `node_cannot_reach_end` | A node can't reach any end node. |

**Condition nodes**

| Code | Meaning |
| --- | --- |
| `condition_min_branches` | Fewer than 2 branches. |
| `condition_empty_branch_id` / `condition_duplicate_branch_id` | A branch id is empty / reused. |
| `condition_default_count` | Not exactly one default branch. |
| `condition_missing_handle` | An outgoing edge has no branch handle. |
| `condition_unknown_handle` | An outgoing edge's handle doesn't match any branch id. |
| `condition_duplicate_handle` | Two outgoing edges bind the same branch. |
| `condition_branch_no_edge` | A branch has no outgoing edge. |
| `duplicate_branch_priority` | Two non-default branches share a priority. |
| `condition_subject_required` | A field condition has no subject. |
| `invalid_condition_operator` | An operator outside `CONDITION_OPERATORS`. |
| `condition_expression_required` | An expression condition's `expression` is blank. |
| `invalid_condition_kind` | `kind` isn't `"field"` or `"expression"`. |
| `branch_conditions_required` | A non-default branch has no condition groups. |
| `condition_group_empty` | A condition group has zero conditions. |
| `invalid_aggregate` | `aggregate` isn't `"sum" \| "count" \| "avg"`. |
| `aggregate_operator` | An aggregate condition uses a non-numeric-comparison operator. |
| `aggregate_column_required` | A `sum`/`avg` aggregate has no column. |
| `aggregate_column_forbidden` | A `count` aggregate selected a column. |
| `aggregate_on_expression` | An expression condition carries an aggregate. |

**Assignees, CC, and field permissions** (approval / handle / cc nodes)

| Code | Meaning |
| --- | --- |
| `invalid_assignee_kind` | An assignee's `kind` outside `AssigneeKind`. |
| `assignee_form_field_required` | A `form_field` assignee has no field selected. |
| `invalid_cc_kind` / `invalid_cc_timing` | A CC's `kind` / `timing` outside its enum. |
| `cc_form_field_required` | A `form_field` CC recipient has no field selected. |
| `invalid_execution_type` | `executionType` outside `ExecutionType`. |
| `invalid_empty_assignee_action` | `emptyAssigneeAction` outside its enum. |
| `invalid_timeout_action` | `timeoutAction` outside `TimeoutAction`. |
| `fallback_users_required` | `emptyAssigneeAction: "transfer_specified"` with no `fallbackUserIds`. |
| `admin_users_required` | `emptyAssigneeAction: "transfer_admin"` with no `adminUserIds`. |
| `invalid_field_permission` | A `fieldPermissions` value outside `FieldPermission`. |
| `field_permission_key_unknown` | A `fieldPermissions` key isn't in the supplied `formFields`. |
| `cc_field_permission_not_allowed` | A CC node's `fieldPermissions` value outside `visible`/`hidden`. |

**Approval-specific**

| Code | Meaning |
| --- | --- |
| `invalid_approval_method` / `invalid_pass_rule` | Outside their enums. |
| `pass_ratio_range` | `passRule: "ratio"` with `passRatio` outside `(0, 100]`. |
| `invalid_same_applicant_action` / `invalid_consecutive_approver_action` | Outside their enums. |
| `invalid_rollback_type` / `invalid_rollback_data_strategy` | Outside their enums. |
| `invalid_add_assignee_type` | An `addAssigneeTypes` entry outside `AddAssigneeType`. |
| `rollback_targets_required` | `rollbackType: "specified"` with no `rollbackTargetKeys`. |
| `rollback_target_unknown` | A rollback target isn't an existing approval/handle node. |
| `rollback_target_self` | A rollback target references the node itself. |
| `sequential_parallel_add_assignee` | `approvalMethod: "sequential"` with `addAssigneeTypes` including `"parallel"`. |

**Handle-specific**

| Code | Meaning |
| --- | --- |
| `handle_execution_auto_reject` | A handle node's `executionType` is `"auto_reject"` (unsupported). |
| `handle_timeout_auto_reject` | A handle node's `timeoutAction` is `"auto_reject"` (unsupported). |

## Serialization

| Export | Signature |
| --- | --- |
| `toFlowDefinition` | `(nodes: FlowNode[], edges: FlowEdge[]) => FlowDefinition` |
| `fromFlowDefinition` | `(definition: FlowDefinition) => { nodes: FlowNode[]; edges: FlowEdge[] }` |

## Specifications

| Export | Signature / Shape |
| --- | --- |
| `NodeSpecification` | `{ type: NodeKind; label: string; color: string; icon: ComponentType<LucideProps>; badgeVariant?: "soft" \| "solid"; configPanel?: ComponentType<{ nodeId: string }> }` |
| `getSpecification` | `(kind: NodeKind) => NodeSpecification` — throws on an unknown kind |
| `getAllSpecifications` | `() => NodeSpecification[]` |
| `getAddableSpecifications` | `() => NodeSpecification[]` — specifications for kinds the toolbar can add (`NODE_RULES[kind].addable`) |

## Constants and structural rules

| Export | Shape |
| --- | --- |
| `NODE_KINDS` | `readonly NodeKind[]` — all six kinds |
| `isNodeKind` | `(kind: string) => kind is NodeKind` |
| `NODE_KIND_LABELS` | `Record<NodeKind, string>` — display label per kind |
| `NodeRule` | `{ maxCount?: number; deletable: boolean; addable: boolean }` |
| `NODE_RULES` | `Record<NodeKind, NodeRule>` — see the table in [Overview](./overview.md#node-kinds) |
| `DEFAULT_NODE_DATA` | `Record<NodeKind, Record<string, unknown>>` — deep-frozen default data for a newly-added node of each kind; clone before mutating |
| `CONDITION_OPERATORS` | `readonly ConditionOperator[]` — the runtime allow-list `ConditionOperator` derives from; see [Host Integration](./host-integration.md#condition-operators) |

## Store hooks

For advanced state inspection — e.g. testing, or reading the live graph programmatically:

| Export | Signature |
| --- | --- |
| `useEditorStore` | `<T>(selector: (state: EditorState) => T) => T` |
| `useEditorStoreApi` | `() => StoreApi<EditorState>` |
| `EditorState` | `{ nodes: FlowNode[]; edges: FlowEdge[]; selectedNodeId: string \| null; canUndo: boolean; canRedo: boolean; addNode(node): boolean; ... }` (re-exported from `@coldsmirk/nodeloom-core`) |

Both hooks resolve against the store `<ApprovalFlowEditor>` mounts internally — there is no host-facing slot to render additional components inside that provider tree, so these are primarily useful for reading state (e.g. via `useEditorStoreApi().getState()`) rather than for mounting custom UI inside the canvas.

## Visual tokens

| Export | Shape |
| --- | --- |
| `NODE_KIND_COLORS` | `Record<NodeKind, string>` — accent color per kind (theme-adaptive CSS var references) |
| `ApprovalIcon`, `CcIcon`, `ConditionIcon`, `EndIcon`, `HandleIcon`, `StartIcon` | `lucide-react` icon components matching the six node kinds |
