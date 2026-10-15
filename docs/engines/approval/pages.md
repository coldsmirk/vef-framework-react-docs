---
title: Approval Pages
description: Every page component exported by @vef-framework-react/approval — what it renders, which permissions gate it, which endpoints it calls, and how to mount it.
---

# Approval Pages

Seven full-page components plus three standalone drawers. All of them read the plugin context from [`ApprovalProvider`](./overview.md#approvalprovider--wiring-host-plugins); none of them take API functions or columns as props. The playground mounts them under `/approval/*`; the examples below adapt those routes to a host app.

All endpoints are operations posted to the framework RPC endpoint `/api` — written here as `resource.operation` (e.g. `approval/my.find_pending_tasks`).

Two conventions apply across every page:

- **Permission gates hide affordances; the backend enforces.** Table queries run regardless of client gates — a caller without the resource's `query` code receives the backend's permission error. Buttons and tabs are hidden client-side via the codes listed per page, all overridable through the page's `permissions` prop.
- **Self-service pages have no gates.** `approval/my` and the participant actions on `approval/instance` are scoped to the current user server-side and declare no permission codes.

## Self-service pages

### `ApprovalTaskCenterPage`

The task center: a tabbed screen (待办 / 已办) of tasks awaiting the current user and tasks they already processed. The pending tab label carries a live count badge. Clicking a row (or the 处理 / 查看 operation button) opens [`InstanceDetailDrawer`](./reference.md#instancedetaildrawer) with the full instance detail and action bar; completing any action refreshes both lists and the badge.

Each list has its own search (v2.23.0). 待办 filters by title, applicant name, and 是否超时 inline, and by arrival time (到达时间) under the advanced search; 已办 filters by title, applicant name, and 处理结果 (the statuses a completed task can hold: approved, rejected, handled, transferred, rolled back) inline, and by finish time (处理时间) and the instance's status (流程状态) under the advanced search. Date ranges are day-granular and inclusive. The full filter set, including the applicant-id and flow filters the page does not expose, is in [`PendingTaskSearch` / `CompletedTaskSearch`](./reference.md#self-service-my-projections).

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `ReactNode` | — | Optional page title rendered above the lists. |

The lists carry no tenant: they show the current user's own tasks in every tenant. A cross-tenant view of everyone's tasks is the [admin console](#approvaladminpage)'s.

- **Permissions:** none (self-service).
- **Endpoints:** `approval/my.find_pending_tasks`, `approval/my.find_completed_tasks`, `approval/my.get_pending_counts`; the detail drawer adds `approval/my.get_instance_detail` and the [instance runtime actions](./reference.md#useinstanceapi).
- **Playground route:** `/approval/task-center`.

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { ApprovalTaskCenterPage } from "@vef-framework-react/approval";

export const Route = createFileRoute("/_layout/approval/task-center")({
  component: () => <ApprovalTaskCenterPage />
});
```

### `ApprovalMyInstancesPage`

My submissions and my carbon copies, tabbed (我发起的 / 抄送我的, the CC tab badged with the unread count). The initiated tab offers keyword and status filters. A returned submission's operation button reads 处理 and the detail drawer offers resubmission; opening an unread CC calls `mark_cc_read` immediately (without success toast) and refreshes the badge.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `ReactNode` | — | Optional page title rendered above the lists. |

Like the task center, the lists show the current user's own submissions and copies in every tenant.

- **Permissions:** none (self-service).
- **Endpoints:** `approval/my.find_initiated`, `approval/my.find_cc_records`, `approval/my.get_pending_counts`, `approval/instance.mark_cc_read`, plus the detail drawer's endpoints.
- **Playground route:** `/approval/my-instances`.

### `ApprovalInitiatePage`

The initiation portal: every flow the current user may start — the flows of the tenant the user acts in plus the shared ones — rendered as clickable cards grouped by category (preserving the server's order), searchable by keyword and filterable by flow labels. Clicking a card opens `StartInstanceDrawer`. Pagination appears past 48 flows.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `labels` | `Record<string, string>` | — | A fixed label pre-filter (e.g. `{ mobile: "" }` to offer only mobile-initiable flows). Combined with the user's own label filter. |
| `title` | `string` | `"发起审批"` | Page title. |
| `onStarted` | `() => void` | — | Fired after an instance is submitted. |

- **Permissions:** none (self-service — the server only lists flows the caller may initiate, per the flow's initiator rules and `isAllInitiationAllowed`).
- **Endpoints:** `approval/my.find_available_flows`; the drawer adds `approval/my.get_start_form` and `approval/instance.start`.
- **Playground route:** `/approval/initiate`.

#### `StartInstanceDrawer`

Exported standalone so a business page can launch an approval about one of its own records:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `flowCode` | `string \| null` | — | The flow to start; `null` keeps the drawer closed. It is resolved in the tenant the user acts in: that tenant's own flow with the code, else the shared one. |
| `businessRef` | `string` | — | Prefilled business reference for business-bound flows started from a host business page. |
| `onClose` | `() => void` | — | Close handler. |
| `onStarted` | `() => void` | — | Fired with the submission acknowledged, after the drawer closes. |

It loads the published form document through `approval/my.get_start_form` — gated server-side exactly like starting, so a rendered form implies a startable flow (active, permitted, published) — renders it via `InstanceFormPanel` with the provider's registries, and submits `approval/instance.start` with the renderer-validated values. The start form also carries the applicant the instance will record and the host globals the flow exposes to its form, which the drawer passes on as the form's `$applicant` and `$globals` (see [Form system variables](./overview.md#form-system-variables)). Flows without a form submit directly.

## Management pages

### `ApprovalCategoryPage`

Full-page flow-category management: the category tree (`find_tree`, non-paginated) with name/active search, and create/update/delete in a vertical-label drawer form. The parent selector excludes the node being edited (a category can never become its own descendant). Deleting a category does not cascade — flows keep their category id.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `permissions` | `Partial<CategoryPermissionCodes>` | `APPROVAL_PERMISSIONS.category` | Override the permission codes the page gates its CRUD actions on. |
| `tenantId` | `string` | `"default"` | The tenant whose categories the page manages: the tree shows them and new categories are created under it. Categories are managed across tenants, gated by the permissions; pass `SHARED_TENANT_ID` to manage the shared ones. |
| `columnStorageKey` | `string` | `"approval.category"` | Storage key for the column-settings panel. |
| `title` | `ReactNode` | — | Optional page title rendered above the table. |

- **Permissions:** 新增分类 → `approval.category.create` · 编辑 → `approval.category.update` · 删除 → `approval.category.delete`; the list itself is enforced server-side by `approval.category.query`.
- **Endpoints:** `approval/category.find_tree`, `.create`, `.update`, `.delete`.
- **Playground route:** `/approval/category`.

### `ApprovalFlowPage`

Full-page flow management: the paginated flow list with keyword / category / active / **label** filters (label filters are `key=value` equality predicates, AND-combined server-side), the full-screen designer drawer, the version-history drawer, and activation toggles. Designer and toggle mutations invalidate the list query, so the table refreshes without callback wiring.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `permissions` | `Partial<FlowPermissionCodes>` | `APPROVAL_PERMISSIONS.flow` | Override the permission codes the page gates its actions on. |
| `tenantId` | `string` | `"default"` | The tenant whose flows the page manages: the list shows them and new flows are created under it. Flows are managed across tenants, gated by the permissions; pass `SHARED_TENANT_ID` to manage the shared ones. |
| `columnStorageKey` | `string` | `"approval.flow"` | Storage key for the column-settings panel. |
| `title` | `ReactNode` | — | Optional page title rendered above the table. |

- **Permissions:** 新建流程 → `approval.flow.create` · 设计 / 启用 / 停用 → `approval.flow.update` · 版本 → `approval.flow.query` · 发布 (versions drawer) → `approval.flow.publish`; list enforced by `approval.flow.query`. The deploy step of the designer chain is enforced server-side by `approval.flow.deploy`.
- **Endpoints:** `approval/flow.find_flows`, `.toggle_active`, `approval/category.find_tree` (for filter/designer options); the designer adds `.find_versions`, `.get_graph`, `.find_initiators`, `.create` / `.update`, `.deploy`, `.publish_version`.
- **Playground route:** `/approval/flow`.

#### `FlowDesignerDrawer`

The full-screen, four-step designer (流程设置 → 表单设计 → 流程设计 → 审阅提交), exported standalone. Each step gates the next: settings must be complete (including a valid business binding in `business` mode and at least one initiator rule unless 全员可发起), the form must pass `validateApprovalSchema`, the flow must pass `validateFlowDefinition` against the projected fields. The issues themselves live in each editor's own diagnostics — the form editor's status bar (structural and approval-contract issues, through `validate={validateApprovalProjection}`) and the flow editor's toolbar indicator — where each one locates its field or node, so neither step renders a banner over its canvas; while 下一步 is disabled, the footer says why in one line (请先完善流程设置中的必填项, 表单存在 N 个错误…, 流程存在 N 个问题…). The form step also offers the [form system variables](./overview.md#form-system-variables) and the provider's option-API catalog. Submission runs create/update → deploy → optional publish as one chain; every step invalidates the flow list. All step panes stay mounted so editor state survives step switches. The body remounts per opening, so editor seeds never leak between sessions.

The review step counts only the initiator rules that will actually be saved. When 全员可发起 is enabled, the saved payload carries no initiator rules — the two settings are mutually exclusive on the server. The draft still keeps any typed rules so toggling the switch back preserves them, but they are dropped on the way out.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `open` | `boolean` | — | Drawer visibility. |
| `flow` | `Flow` | — | The flow being redesigned; omit to create a new one. Editing seeds from the newest deployment (published or not) via `find_versions` → `get_graph`. |
| `tenantId` | `string` | — | The tenant new flows are created under. |
| `onClose` | `() => void` | — | Close handler. |

#### `FlowVersionsDrawer`

The version history of one flow: every deploy in descending order with status, description, storage mode, and deploy/publish timestamps, plus a 发布 action on drafts. Publishing archives the previously published version; running instances keep the version they started on.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `flow` | `Flow \| null` | — | The flow whose versions are listed. |
| `open` | `boolean` | — | Drawer visibility. |
| `publishPermission` | `string` | — | Permission code gating the publish action (the page passes its resolved `flow.publish`). |
| `onClose` | `() => void` | — | Close handler. |

- **Endpoints:** `approval/flow.find_versions`, `.publish_version`.

### `ApprovalDelegationPage`

Full-page delegation management: during a delegation's active window, tasks assigned to the delegator route to the delegatee, optionally narrowed to a flow category or a single flow (both empty = all flows). Standard CRUD list with delegator/delegatee id search and a drawer form. Non-super-admin callers only see (and can only create) delegations they own as delegator — enforced server-side.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `permissions` | `Partial<DelegationPermissionCodes>` | `APPROVAL_PERMISSIONS.delegation` | Override the permission codes the page gates its CRUD actions on. |
| `tenantId` | `string` | — | The tenant whose categories the category scope offers, beside the shared ones; omit to offer every tenant's. |
| `columnStorageKey` | `string` | `"approval.delegation"` | Storage key for the column-settings panel. |
| `title` | `ReactNode` | — | Optional page title rendered above the table. |

- **Permissions:** 新增委托 → `approval.delegation.create` · 编辑 → `approval.delegation.update` · 删除 → `approval.delegation.delete`; list enforced by `approval.delegation.query`.
- **Endpoints:** `approval/delegation.find_page`, `.create`, `.update`, `.delete`.
- **Playground route:** `/approval/delegation`.

### `ApprovalAdminPage`

The supervision console, tabbed with each tab gated by its own permission and **hidden** when the caller lacks it (no tabs at all renders a 403 result):

| Tab | Content | Query gate | Row actions (gate) |
| --- | --- | --- | --- |
| 实例管理 | Cross-user instance list with tenant/applicant/status/flow/keyword filters | `approval.instance.query` | 详情 → read-only [`AdminInstanceDetailPanel`](./reference.md#admininstancedetailpanel) (`approval.instance.detail`); 终止 on non-final instances (`approval.instance.terminate`) |
| 任务管理 | Cross-user task list with assignee/instance/status filters | `approval.task.query` | 改派 to a new assignee (`approval.task.reassign`) |
| 业务回写 | Business-projection convergence list for `business`-bound flows | `approval.binding.query` | 重试 a failed projection (`approval.binding.retry`) |
| 运行指标 | Engine health dashboard: instance/task counts by status, timeout pressure, average completion time, write-back convergence; failed loads render an explicit error with retry | `approval.metrics.query` | — |

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `permissions` | `{ instanceQuery?, instanceDetail?, instanceTerminate?, taskQuery?, taskReassign?, bindingQuery?, bindingRetry?, metricsQuery? }` (all `string`) | The matching `APPROVAL_PERMISSIONS` codes | Override the permission codes gating each console tab and action. |
| `tenantId` | `string` | — | Scope the metrics view to one tenant; omit for the caller's default scope. |
| `title` | `ReactNode` | — | Optional page title. |

- **Endpoints:** `approval/admin.find_instances`, `.find_tasks`, `.get_instance_detail`, `.find_action_logs` (paginated audit trail inside the admin detail), `.get_metrics`, `.find_business_projections`, `.terminate_instance`, `.reassign_task`, `.retry_business_projection`.
- **Playground route:** `/approval/admin`.

If no `hasPermission` is provided by the app context, every tab renders (permission checks default to allow) — the backend still enforces each call.

## Shared detail surface

Every runtime list opens the same drawer — `InstanceDetailDrawer` → `InstanceDetailPanel` — which renders header, the version-pinned form clamped by the viewer's field permissions, the transit timeline, and the progress flow graph. Its action bar derives entirely from the server-resolved `availableActions` / `myTask` context (approve, reject, handle, transfer, rollback, withdraw, resubmit, add/remove assignee, CC, urge), so the offered set can never drift from what the engine accepts. See the [runtime components reference](./reference.md#runtime-components) for props and the endpoint each action calls.

The detail header now also shows the owning flow's `flowCode` (copyable) alongside the flow name. The timeline renders the `end` node as its own entry when an instance passes through it, and collapses an entry whose start and finish timestamps resolve to the same displayed minute into a single timestamp. The flow graph floats the people who touched each node above the node, shades unreached nodes and edges so the actual path stands out, and surfaces the entry/exit timing for reached nodes on hover.
