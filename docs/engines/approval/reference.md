---
title: Approval API Reference
description: Exhaustive reference for every export of @vef-framework-react/approval — permissions, provider and plugins, API hooks, runtime components, and wire types.
---

# Approval API Reference

Everything exported from the root of `@vef-framework-react/approval`, grouped as in the source: [permissions](#permissions), [plugins](#plugins-and-provider), [API hooks](#api-hooks), [runtime components](#runtime-components), [types](#types), and [re-exports](#re-exports-from-approval-flow-editor). Page components and their props are covered in [Pages](./pages.md).

`QueryFunction<TData, TParams>` and `MutationFunction<TData, TParams>` are the framework's keyed function shapes from `@vef-framework-react/core` (each carries a stable `.key` for TanStack Query). `PaginatedQueryParams<TSearch>` is the ProTable query shape from `@vef-framework-react/components` (search fields plus symbol-keyed pagination). `ApiResult<T>` is the standard response envelope.

## Permissions

### `APPROVAL_PERMISSIONS`

`const` — permission codes for the approval engine management API, mirroring the backend `RequiredPermission` strings verbatim. Every management page defaults its gates to the matching entry and accepts overrides through its `permissions` prop. The self-service `approval/my` resource carries no codes — its operations are user-scoped server-side. See [Permissions](../../guide/permissions.md) for the general model.

| Group.key | Code | Gates |
| --- | --- | --- |
| `category.query` | `approval.category.query` | Category tree query |
| `category.create` | `approval.category.create` | Create category |
| `category.update` | `approval.category.update` | Update category |
| `category.delete` | `approval.category.delete` | Delete category |
| `flow.query` | `approval.flow.query` | Flow list / versions / graph / initiators queries |
| `flow.create` | `approval.flow.create` | Create flow |
| `flow.update` | `approval.flow.update` | Update flow, toggle activation |
| `flow.deploy` | `approval.flow.deploy` | Deploy a designed definition as a new draft version |
| `flow.publish` | `approval.flow.publish` | Publish a draft version |
| `instance.query` | `approval.instance.query` | Admin cross-user instance list |
| `instance.detail` | `approval.instance.detail` | Admin instance detail (incl. action logs) |
| `instance.start` | `approval.instance.start` | Start instance (self-service start is additionally initiator-gated) |
| `instance.withdraw` | `approval.instance.withdraw` | Withdraw a running instance |
| `instance.resubmit` | `approval.instance.resubmit` | Resubmit a returned instance |
| `instance.cc` | `approval.instance.cc` | Add carbon copies |
| `instance.terminate` | `approval.instance.terminate` | Admin terminate |
| `task.query` | `approval.task.query` | Admin cross-user task list |
| `task.process` | `approval.task.process` | Process a task (approve / reject / transfer / rollback / handle) |
| `task.addAssignee` | `approval.task.add_assignee` | Add assignees to a task |
| `task.removeAssignee` | `approval.task.remove_assignee` | Remove a peer assignee's task |
| `task.urge` | `approval.task.urge` | Urge a pending task |
| `task.reassign` | `approval.task.reassign` | Admin reassign |
| `actionLog.query` | `approval.action_log.query` | Audit-trail query |
| `metrics.query` | `approval.metrics.query` | Engine metrics |
| `binding.query` | `approval.binding.query` | Business-projection list |
| `binding.retry` | `approval.binding.retry` | Retry a failed projection |
| `delegation.query` | `approval.delegation.query` | Delegation list |
| `delegation.create` | `approval.delegation.create` | Create delegation |
| `delegation.update` | `approval.delegation.update` | Update delegation |
| `delegation.delete` | `approval.delegation.delete` | Delete delegation |

Type exports: `ApprovalPermissions` (`typeof APPROVAL_PERMISSIONS`) and one alias per group — `CategoryPermissionCodes`, `FlowPermissionCodes`, `InstancePermissionCodes`, `TaskPermissionCodes`, `ActionLogPermissionCodes`, `MetricsPermissionCodes`, `BindingPermissionCodes`, `DelegationPermissionCodes` (each `ApprovalPermissions["<group>"]`).

## Plugins and provider

### `ApprovalPlugins`

Host-integration points shared by every approval page and component. Wrap the approval routes in one `ApprovalProvider` and every picker, registry, and renderer below is resolved from it — pages never take these as props.

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `pickers` | `Partial<Record<string, FC<PickerProps>>>` | — | Pickers that resolve concrete ids, keyed by rule kind. Lookup falls back to the kind's `selection` mode, so the built-in `user` / `role` / `department` pickers also serve custom kinds that select the same thing. A kind left unset degrades to a plain id-tags input. |
| `registries` | `DeviceRegistries` | `createApprovalRegistries()` | Form field registries for rendering and designing approval forms. Defaults to the approval profile from [`approval-form-bridge`](../../editors/approval-form-bridge.md), which excludes the field types the backend parser rejects. |
| `globalSubjects` | `FormFieldDefinition[]` | — | Host-defined global subjects the flow designer's condition editor offers alongside the built-in applicant attributes — resolved server-side from `Instance.Globals` at instance start. |
| `formGlobals` | `FormGlobalDefinition[]` | — | The host globals the backend exposes to approval forms (its globals resolver implementing `FormGlobalsExposer`), declared so the form designer offers them as `$globals.<key>` system variables beside the built-in `$applicant` attributes. Keep the keys in lockstep with the resolver's `FormGlobalKeys` — see [Form system variables](./overview.md#form-system-variables). |
| `dataSourceResolver` | `DataSourceResolver` | — | Resolves a form's remote data-source requests into options, in every form render and in the form designer's preview; without it every remote source in an approval form resolves to an empty list. |
| `dataSourceApis` | `DataSourceApi[]` | — | The host's catalog of option APIs: the form designer's remote data sources lead with a picker over it instead of a hand-typed endpoint and field mapping. A pick is stored as the request itself, so `dataSourceResolver` must serve every endpoint listed — see [Offering an API catalog](../../editors/form-editor/embedding.md#offering-an-api-catalog). |
| `evaluators` | `LinkageEvaluators` | built-in JavaScript evaluator | Overrides expression / script evaluation for form linkage and bound data-source parameters (the built-in one has `$form` / `$vars` / `$applicant` / `$globals` in scope), and supplies `dispatchEffect` for `alert` / `api_call` / `navigate`. |
| `renderBusinessRef` | `(businessRef: string) => ReactNode` | plain text | Renders an instance's opaque business reference as a host-navigable element (a link to the business record, a drawer trigger, …). |

### `ApprovalProviderProps`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `plugins` | `ApprovalPlugins` | — | The plugin set to provide. Optional: without it every point falls back to its default. |
| `children` | `ReactNode` | — | Subtree that resolves the plugins. |

### `ApprovalProvider`

`(props: ApprovalProviderProps) => JSX.Element` — provides the approval plugin set to every page and component beneath it. The default form registries are created **once per mount** (registries are stateful class instances, so the context value never churns field registrations across re-renders); pass `registries` to override them wholesale.

### `ResolvedApprovalPlugins`

`interface ResolvedApprovalPlugins extends ApprovalPlugins { registries: DeviceRegistries }` — the plugin set after defaulting: registries are always present.

### `useApprovalPlugins`

`() => ResolvedApprovalPlugins` — resolves the approval plugin set. Usable **without** a provider — every integration point then falls back to its built-in default (fresh default registries per mount, no pickers, no global subjects, plain-text business refs).

### `toEditorPlugins`

`(plugins: ResolvedApprovalPlugins, formFields: FormFieldDefinition[], kindOptions?: KindOptions) => EditorPlugins` — projects the approval plugin set into the flow designer's [`EditorPlugins`](../../editors/approval-flow-editor/host-integration.md) shape (`pickers`, `globalSubjects`), layers the deploy-derived `formFields` on top, and passes the application's kind catalog (`kindOptions.assignees` / `kindOptions.ccs`, from `approval/flow.list_kind_options`) as `assigneeKinds` / `ccKinds`; while it is still loading the editor falls back to its built-in kinds.

### `FormGlobalDefinition`

`interface FormGlobalDefinition { key: string; label: string }` — one host global an approval form may read: `key` exactly as the host's globals resolver produces it, `label` its display name in the designer (e.g. `"聘任职称"`). The value comes from the backend, which ships only the keys its resolver names through `FormGlobalsExposer`.

## API hooks

All hooks memoize their function set per `ApiClient` and post to `API_PATH` with `createApiRequest(resource, operation, params)` envelopes.

### Query plumbing

| Export | Signature | Description |
| --- | --- | --- |
| `API_PATH` | `const "/api"` | The framework RPC endpoint every approval call posts to. |
| `toPagedParams` | `<TSearch extends AnyObject>(queryParams: PaginatedQueryParams<TSearch>) => Omit<PaginatedQueryParams<TSearch>, typeof SYMBOL_PAGINATION> & { page?: number; pageSize?: number }` | Folds ProTable's symbol-keyed pagination into the flat `page` / `pageSize` request shape the approval RPC queries expect. The sort symbol stays on the spread copy; JSON serialization drops it. |

### `useCategoryApi`

`() => CategoryApi` — CRUD API for the flow-category tree (`approval/category`), shaped to plug straight into a non-paginated `CrudPage` (see [Crud](../../components/crud.md)).

| Function | Type | Operation |
| --- | --- | --- |
| `findTree` | `QueryFunction<FlowCategory[], QueryParams<CategorySearch>>` | `find_tree` — returns the nested tree (`children`) |
| `create` | `MutationFunction<ApiResult<unknown>, CategoryParams>` | `create` |
| `update` | `MutationFunction<ApiResult<unknown>, CategoryParams>` | `update` |
| `remove` | `MutationFunction<ApiResult<unknown>, FlowCategory>` | `delete` — sends `{ id: row.id }` |

### `useFlowApi`

`() => FlowApi` — management API for flow definitions (`approval/flow`): the paginated list plus the definition lifecycle (create → deploy → publish) and its auxiliary queries. Mutations return the created/updated records so callers can chain the lifecycle (e.g. create → deploy with the returned flow id).

| Function | Type | Operation |
| --- | --- | --- |
| `findFlows` | `QueryFunction<PaginationResult<Flow>, PaginatedQueryParams<FlowSearch>>` | `find_flows` (paged via `toPagedParams`) |
| `create` | `MutationFunction<Flow, CreateFlowParams>` | `create` — returns the created `Flow` |
| `update` | `MutationFunction<Flow, UpdateFlowParams>` | `update` — returns the updated `Flow` |
| `deploy` | `MutationFunction<FlowVersion, DeployFlowParams>` | `deploy` — returns the new draft `FlowVersion` |
| `publishVersion` | `MutationFunction<unknown, PublishVersionParams>` | `publish_version` |
| `toggleActive` | `MutationFunction<unknown, ToggleFlowActiveParams>` | `toggle_active` |
| `getGraph` | `QueryFunction<FlowGraphBundle, { flowId: string; tenantId?: string; versionId?: string }>` | `get_graph` — the latest published version by default, or the version named by `versionId` (the designer's edit seed) |
| `findVersions` | `QueryFunction<FlowVersionSummary[], { flowId: string; tenantId?: string }>` | `find_versions` — slim summaries without definition payloads (v2.12.0 breaking change `40b6714`) |
| `findInitiators` | `QueryFunction<FlowInitiator[], { flowId: string; tenantId?: string }>` | `find_initiators` |
| `listKindOptions` | `QueryFunction<KindOptions, Record<string, never>>` | `list_kind_options` — the application's assignee / CC / initiator kind catalog, application-wide rather than per flow; the flow designer fetches it once for its initiator editor and its flow editor (v2.18.0) |

### `useDelegationApi`

`() => DelegationApi` — CRUD API for approval delegations (`approval/delegation`). The list is served by the framework's standard `find_page`, which reads pagination from the request meta.

| Function | Type | Operation |
| --- | --- | --- |
| `findPage` | `QueryFunction<PaginationResult<Delegation>, PaginatedQueryParams<DelegationSearch>>` | `find_page` |
| `create` | `MutationFunction<ApiResult<unknown>, DelegationParams>` | `create` |
| `update` | `MutationFunction<ApiResult<unknown>, DelegationParams>` | `update` |
| `remove` | `MutationFunction<ApiResult<unknown>, Delegation>` | `delete` — sends `{ id: row.id }` |

### `useInstanceApi`

`() => InstanceApi` — runtime action API for approval instances and tasks (`approval/instance`): submission, the per-task decision, and the participant side actions. Each is a mutation triggered imperatively from the detail views.

| Function | Type | Operation |
| --- | --- | --- |
| `start` | `MutationFunction<unknown, StartInstanceParams>` | `start` |
| `processTask` | `MutationFunction<unknown, ProcessTaskParams>` | `process_task` — bundles approve / reject / transfer / rollback / handle |
| `withdraw` | `MutationFunction<unknown, WithdrawInstanceParams>` | `withdraw` |
| `resubmit` | `MutationFunction<unknown, ResubmitInstanceParams>` | `resubmit` |
| `addCC` | `MutationFunction<unknown, AddCCParams>` | `add_cc` |
| `markCCRead` | `MutationFunction<unknown, MarkCCReadParams>` | `mark_cc_read` |
| `addAssignee` | `MutationFunction<unknown, AddAssigneeParams>` | `add_assignee` |
| `removeAssignee` | `MutationFunction<unknown, RemoveAssigneeParams>` | `remove_assignee` |
| `urgeTask` | `MutationFunction<unknown, UrgeTaskParams>` | `urge_task` |

### `useMyApprovalApi`

`() => MyApprovalApi` — self-service API for the current user's approval work (`approval/my`): what I can initiate, what I submitted, what awaits me, and the per-instance detail. All operations are user-scoped server-side and carry no permission codes.

| Function | Type | Operation |
| --- | --- | --- |
| `findAvailableFlows` | `QueryFunction<PaginationResult<AvailableFlow>, PaginatedQueryParams<AvailableFlowSearch>>` | `find_available_flows` |
| `getStartForm` | `QueryFunction<StartForm, { tenantId: string; flowCode: string }>` | `get_start_form` — gated exactly like starting the instance; carries the applicant and the form-visible globals the instance would record |
| `findInitiated` | `QueryFunction<PaginationResult<InitiatedInstance>, PaginatedQueryParams<InitiatedInstanceSearch>>` | `find_initiated` |
| `findPendingTasks` | `QueryFunction<PaginationResult<PendingTask>, PaginatedQueryParams<PendingTaskSearch>>` | `find_pending_tasks` |
| `findCompletedTasks` | `QueryFunction<PaginationResult<CompletedTask>, PaginatedQueryParams<CompletedTaskSearch>>` | `find_completed_tasks` |
| `findCCRecords` | `QueryFunction<PaginationResult<MyCCRecord>, PaginatedQueryParams<MyCCRecordSearch>>` | `find_cc_records` |
| `getPendingCounts` | `QueryFunction<PendingCounts, { tenantId?: string }>` | `get_pending_counts` |
| `getInstanceDetail` | `QueryFunction<MyInstanceDetail, { instanceId: string }>` | `get_instance_detail` |

### `useAdminApprovalApi`

`() => AdminApprovalApi` — supervision API for approval administrators (`approval/admin`): cross-user instance/task queries, the audit trail, engine metrics, business-projection convergence, and the admin write actions.

| Function | Type | Operation |
| --- | --- | --- |
| `findInstances` | `QueryFunction<PaginationResult<AdminInstance>, PaginatedQueryParams<AdminInstanceSearch>>` | `find_instances` |
| `findTasks` | `QueryFunction<PaginationResult<AdminTask>, PaginatedQueryParams<AdminTaskSearch>>` | `find_tasks` |
| `getInstanceDetail` | `QueryFunction<AdminInstanceDetail, { instanceId: string }>` | `get_instance_detail` |
| `findActionLogs` | `QueryFunction<PaginationResult<AdminActionLog>, PaginatedQueryParams<{ instanceId: string; tenantId?: string }>>` | `find_action_logs` |
| `getMetrics` | `QueryFunction<ApprovalMetrics, { tenantId?: string }>` | `get_metrics` |
| `findBusinessProjections` | `QueryFunction<PaginationResult<AdminBusinessProjection>, PaginatedQueryParams<AdminBusinessProjectionSearch>>` | `find_business_projections` |
| `terminateInstance` | `MutationFunction<unknown, TerminateInstanceParams>` | `terminate_instance` |
| `reassignTask` | `MutationFunction<unknown, ReassignTaskParams>` | `reassign_task` |
| `retryBusinessProjection` | `MutationFunction<unknown, RetryBusinessProjectionParams>` | `retry_business_projection` |

## Runtime components

Presentation and detail building blocks, all reading plugins from context where relevant. Each component's props interface is exported under the `<Component>Props` name (`InstanceDetailDrawerProps`, `InstanceDetailPanelProps`, `AdminInstanceDetailPanelProps`, `InstanceFormPanelProps`, `InstanceTimelineProps`, `InstanceFlowGraphViewerProps`, `PrincipalSelectProps`, `UserLabelProps`, `UserGroupProps`) with exactly the fields tabled below.

### `InstanceDetailDrawer`

The self-service instance detail in a wide (880px) drawer — the standard container every runtime list page opens on row click.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `instanceId` | `string \| null` | — | The instance to show; `null` keeps the drawer closed. |
| `onClose` | `() => void` | — | Close handler. |
| `onActionCompleted` | `() => void` | — | Fired after any successful action inside the detail, so the surrounding list can refetch. |

### `InstanceDetailPanel`

The self-service instance detail body: header, the version-pinned form clamped by the viewer's field permissions, the transit timeline, and the progress flow graph — with the action bar derived entirely from the server-resolved `availableActions` / `myTask` context, so the offered set can never drift from what the engine accepts. Uses `approval/my.get_instance_detail` plus the [`useInstanceApi`](#useinstanceapi) actions; the panel refetches its own detail after every action.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `instanceId` | `string` | — | The instance to show. |
| `onActionCompleted` | `() => void` | — | Fired after any successful action so the surrounding list can refetch. |

### `AdminInstanceDetailPanel`

The supervision detail of an instance: the same header / form / timeline / graph projections as the self-service view — but fully read-only, with no field-permission clamp (admins see every field) — plus the paginated raw audit trail (`approval/admin.find_action_logs`). Admin write actions (terminate, reassign) live on the admin page rows, not in this panel.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `instanceId` | `string` | — | The instance to inspect (via `approval/admin.get_instance_detail`). |

### `InstanceHeader`

The shared instance header: title + status tag, then the identity fields as one descriptions block (审批单号 with copy, 所属流程, 流程编码, 申请人, 提交时间, plus 当前节点 / 完成时间 / 业务单据 / 流程标签 when present). `businessRef` renders through the provider's `renderBusinessRef`. Pass `labels` on operator-facing views (the admin detail) and omit it on applicant-facing ones.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | — | Instance title. |
| `status` | `InstanceStatus` | — | Lifecycle status (rendered as `InstanceStatusTag`). |
| `instanceNo` | `string` | — | Business-facing instance number (copyable). |
| `flowName` | `string` | — | Owning flow's name. |
| `flowCode` | `string` | — | Owning flow's stable code (copyable). |
| `applicant` | `UserInfo` | — | Applicant snapshot. |
| `createdAt` | `string` | — | Submission time. |
| `finishedAt` | `string` | — | Completion time (omitted while running). |
| `currentNodeName` | `string` | — | Current node display name. |
| `businessRef` | `string` | — | Opaque business reference. |
| `labels` | `Record<string, string>` | — | The flow's host-owned selection metadata. |

### `InstanceFormPanel`

The instance form, rendered against the version-pinned schema with the viewer's field permissions clamped on: `hidden` unmounts, `visible` renders read-only, `editable`/`required` grant write strength. Field registries, the data-source resolver, and the evaluators come from `ApprovalProvider`; the applicant and the form-visible globals form its evaluation context, as `$applicant` and `$globals` — never `$user`, since the form is evaluated for every participant. Renders an empty state ("该流程未配置表单") for flows without a form.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `schema` | `FormSchema` | — | The version-pinned host form-designer document; absent for flows without a form. |
| `formData` | `FormData` | — | The instance's form data (already stripped server-side of fields this viewer may not see). |
| `fieldPermissions` | `Record<string, FieldPermission>` | — | The server-resolved per-field interactivity clamp, applied verbatim. |
| `applicant` | `UserInfo` | — | The form's `$applicant`: the snapshot the instance is about to record on the start form, the instance's own everywhere else. |
| `globals` | `Record<string, unknown>` | — | The form's `$globals`: the host globals the flow exposes to its form. |
| `disabled` | `boolean` | — | Force the whole form read-only (viewers with nothing to execute). |
| `device` | `PresentationDevice` | `"pc"` | Presentation device profile. |
| `apiRef` | `RefObject<FormRendererApi \| null>` | — | Imperative handle: `submit()` runs the renderer's validation + submit pipeline, `getSubmitValues()` reads the writable subset without validating (the reject path). |
| `onSubmit` | `(values: Record<string, unknown>) => void` | — | Fired with validated values. |

### `InstanceTimeline`

The chronological transit record of an instance: one entry per traversed node (a rollback redo produces a second entry) plus the withdraw/terminate milestones. Participants, carbon copies, and side activities render beneath each node header.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `timeline` | `TimelineEntry[]` | — | The server-projected timeline. Empty renders an empty state. |

### `InstanceFlowGraphViewer`

The read-only, progress-annotated map of an instance's flow: node positions come from the designer verbatim, progress colors the borders (blue = in motion, green = passed, red = rejected, orange = returned) and dashes the outline of everything the instance never reached, and the people involved float above each node they touched. Pan and zoom only — nothing is editable.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `flowGraph` | `InstanceFlowGraph` | — | The server-projected graph. |
| `height` | `number \| string` | `420` | Container height; the viewer always fills its width. |

### `PrincipalSelect`

A principal selection field: renders the host's picker from `ApprovalProvider` when one is wired for the rule's kind or its selection mode, else degrades to a plain id-tags input so the surrounding dialog stays functional.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `kind` | `string` | — | The rule's kind; the first picker lookup key. |
| `selection` | `SelectionMode` | — | What the kind selects; the fallback picker lookup key. |
| `value` | `string[]` | — | Selected ids. |
| `onChange` | `(ids: string[]) => void` | — | Selection handler. |
| `disabled` | `boolean` | — | Disable the field. |
| `maxCount` | `number` | — | Cap the selection at this many entries (enforced on change). |

### `UserLabel` and `UserGroup`

`UserLabel` renders a person snapshot as avatar + name (deterministic avatar hue per user id), with the department surfaced in the tooltip; it renders the id when the name is empty — the backend returns missing users with an empty name rather than omitting them. `UserGroup` renders a compact list, collapsing the overflow into a `+N` avatar whose tooltip lists the hidden names.

| Component | Prop | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `UserLabel` | `user` | `UserInfo` | — | The person snapshot. |
| `UserLabel` | `showAvatar` | `boolean` | `true` | Render the avatar in front of the name. |
| `UserLabel` | `avatarSize` | `number` | `22` | Avatar size in pixels. |
| `UserGroup` | `users` | `UserInfo[]` | — | The snapshots to render (empty renders a dash). |
| `UserGroup` | `maxCount` | `number` | `5` | Collapse into `+N` beyond this count. |
| `UserGroup` | `avatarSize` | `number` | `22` | Avatar size in pixels. |

### Status tags

Each renders one vocabulary value as a colored tag:

| Component | Props | Vocabulary |
| --- | --- | --- |
| `InstanceStatusTag` | `{ status: InstanceStatus }` | Instance lifecycle |
| `TaskStatusTag` | `{ status: TaskStatus \| string }` | Task lifecycle (an unknown string renders as a plain tag with the raw value) |
| `NodeProgressTag` | `{ status: NodeProgressStatus }` | Node progress in the flow graph |
| `VersionStatusTag` | `{ status: VersionStatus }` | Flow version lifecycle |
| `ProjectionStatusTag` | `{ status: BindingProjectionStatus }` | Business-projection convergence |

### Label and color constants

Display labels (framework default language) and tag colors, each map total over its union so a missing entry is a type error when the backend vocabulary grows:

| Export | Type |
| --- | --- |
| `INSTANCE_STATUS_LABELS` / `INSTANCE_STATUS_COLORS` | `Record<InstanceStatus, string>` |
| `TASK_STATUS_LABELS` / `TASK_STATUS_COLORS` | `Record<TaskStatus, string>` |
| `NODE_PROGRESS_LABELS` / `NODE_PROGRESS_COLORS` | `Record<NodeProgressStatus, string>` |
| `VERSION_STATUS_LABELS` / `VERSION_STATUS_COLORS` | `Record<VersionStatus, string>` |
| `BINDING_PROJECTION_STATUS_LABELS` / `BINDING_PROJECTION_STATUS_COLORS` | `Record<BindingProjectionStatus, string>` |
| `ACTIVITY_ACTION_LABELS` | `Record<ActivityAction, string>` |
| `PROCESS_TASK_ACTION_LABELS` | `Record<ProcessTaskAction, string>` |
| `INSTANCE_STATUS_OPTIONS` / `TASK_STATUS_OPTIONS` / `BINDING_PROJECTION_STATUS_OPTIONS` | `Array<{ label: string; value: … }>` — ready-made select options |

### Formatters

| Export | Signature | Description |
| --- | --- | --- |
| `formatTimestamp` | `(value?: string \| null) => string` | Formats a backend timestamp (`YYYY-MM-DD HH:mm:ss`) as `YYYY-MM-DD HH:mm`, or a dash when empty. |
| `formatDurationSeconds` | `(seconds: number) => string` | Compact human span (`3天2小时`, `45分钟`); sub-minute renders `<1分钟`, negative renders a dash. |

### `UrgeTarget`

`interface UrgeTarget { taskId: string; assigneeName: string; nodeName: string }` — one pending task that can be urged (type-only export backing the urge dialog).

## Types

All wire types mirror the Go contracts. Timestamps are backend-formatted strings.

### Shared base

| Type | Shape | Notes |
| --- | --- | --- |
| `FullAudited` | `{ id: string; createdAt?: string; createdBy?: string; updatedAt?: string; updatedBy?: string }` | Mirrors the Go `orm.FullAuditedModel` embed. |
| `UserInfo` | `{ id: string; name: string; departmentId?: string; departmentName?: string }` | A person snapshot captured at action time — the single person shape every approval projection uses. Department fields present only when the host's `UserInfoResolver` fills them. |
| `FormDataValue` | `string \| number \| boolean \| null \| FormDataValue[] \| { [key: string]: FormDataValue }` | Form data as submitted/stored. |
| `FormData` | `Record<string, FormDataValue>` | The runtime form-data map of an instance. |

### Enums and unions

| Type | Values | Notes |
| --- | --- | --- |
| `InstanceStatus` | `"running" \| "approved" \| "rejected" \| "withdrawn" \| "returned" \| "terminated"` | Instance lifecycle. |
| `FINAL_INSTANCE_STATUSES` | `["approved", "rejected", "terminated"] as const` | The statuses that are final. |
| `isFinalInstanceStatus` | `(status: InstanceStatus) => boolean` | Mirrors `InstanceStatus.IsFinal`. |
| `TaskStatus` | `"waiting" \| "pending" \| "approved" \| "rejected" \| "handled" \| "transferred" \| "rolled_back" \| "canceled" \| "removed" \| "skipped"` | Task lifecycle. |
| `NodeVisitStatus` | `"active" \| "passed" \| "rejected" \| "returned" \| "canceled"` | One node traversal (visit) by an instance. |
| `NodeProgressStatus` | `"pending" \| "active" \| "passed" \| "rejected" \| "returned" \| "canceled"` | Node progress in the graph projection. |
| `ActionType` | `"submit" \| "approve" \| "handle" \| "reject" \| "transfer" \| "withdraw" \| "cancel" \| "rollback" \| "add_assignee" \| "remove_assignee" \| "execute" \| "resubmit" \| "reassign" \| "terminate" \| "add_cc"` | Action-log vocabulary. |
| `ActivityAction` | `ActionType \| "urge"` | Timeline/graph activity vocabulary (urges are persisted as urge records, not action logs). |
| `ProcessTaskAction` | `"approve" \| "reject" \| "transfer" \| "rollback" \| "handle"` | Accepted by `process_task`. |
| `AddAssigneeType` | `"before" \| "after" \| "parallel"` | Position of a dynamically added assignee relative to the anchor task. |
| `VersionStatus` | `"draft" \| "published" \| "archived"` | Flow version status. |
| `BindingMode` | `"standalone" \| "business"` | `standalone` stores form data in approval tables; `business` writes back into an existing business table. |
| `StorageMode` | `"json" \| "table"` | Version-level physical storage of form data. |
| `InitiatorKind` | `string` | Kind of a flow initiator rule. Open by design (v2.18.0): the backend accepts every kind with a registered `approval.InitiatorResolver`, so the deployable kinds are the ones `approval/flow.list_kind_options` reports. |
| `BUILTIN_INITIATOR_KINDS` | `ReadonlyArray<KindDescriptor<InitiatorKind>>` — `user` (指定用户), `role` (指定角色), `department` (指定部门) | The framework's own initiator kinds, offered before `list_kind_options` resolves. A deployment that registers kinds of its own reaches the designer only through the served catalog. |
| `BindingProjectionStatus` | `"pending" \| "processing" \| "applied" \| "failed"` | Convergence of one business-record projection. |
| `FieldPermission` | `"visible" \| "editable" \| "hidden" \| "required"` | Viewer-scoped field interactivity, matching the form renderer's vocabulary. |
| `InstanceAction` | `"approve" \| "reject" \| "handle" \| "transfer" \| "rollback" \| "withdraw" \| "resubmit" \| "add_assignee" \| "remove_assignee" \| "add_cc" \| "urge"` | The self-service actions `my.get_instance_detail` may offer, derived server-side from the state machine, the viewer's pending task, and node toggles. |

### Category

| Type | Fields | Notes |
| --- | --- | --- |
| `FlowCategory` | extends `FullAudited` + `tenantId: string`, `code: string`, `name: string`, `icon?: string \| null`, `parentId?: string \| null`, `sortOrder: number`, `isActive: boolean`, `remark?: string \| null`, `children?: FlowCategory[]` | Categories form a tree via `parentId`; `find_tree` returns nested `children`. |
| `CategoryParams` | `id?: string`, `tenantId: string`, `code: string`, `name: string`, `icon?: string \| null`, `parentId?: string \| null`, `sortOrder: number`, `isActive: boolean`, `remark?: string \| null` | Create/update payload. |
| `CategorySearch` | `name?: string`, `isActive?: boolean` | Tree search. |

### Delegation

| Type | Fields | Notes |
| --- | --- | --- |
| `Delegation` | extends `FullAudited` + `delegatorId: string`, `delegateeId: string`, `flowCategoryId?: string \| null`, `flowId?: string \| null`, `startsAt: string`, `endsAt: string`, `isActive: boolean`, `reason?: string \| null` | During the active window, tasks assigned to the delegator are routed to the delegatee. Scope narrows via `flowCategoryId` / `flowId`; both empty means all flows. |
| `DelegationParams` | same fields plus `id?: string` | Create/update payload. |
| `DelegationSearch` | `delegatorId?: string`, `delegateeId?: string`, `isActive?: boolean` | List search. |

### Flow

`BusinessBindingConfig` — business binding for a `business`-mode flow. All table/column names must be plain SQL identifiers; `keyColumns` must exactly match a complete, non-null primary or unique key on `tableName`.

| Field | Type | Description |
| --- | --- | --- |
| `tableName` | `string` | Bound business table. |
| `keyColumns` | `string[]` | The record key columns. |
| `statusColumn` | `string` | Column receiving the mapped instance status. |
| `instanceIdColumn` | `string?` | Mandatory for business bindings: the engine uses it as a compare-and-set fence so a stale instance cannot overwrite the state owned by a newer approval round. |
| `startedAtColumn` | `string?` | Optional started-at write-back column. |
| `finishedAtColumn` | `string?` | Optional finished-at write-back column. |
| `statusMapping` | `Partial<Record<InstanceStatus, string>>?` | Translates instance statuses into host business status values; missing entries fall back to the instance-status string itself. |

`Flow` — a flow definition record (extends `FullAudited`):

| Field | Type | Description |
| --- | --- | --- |
| `tenantId` | `string` | Owning tenant. |
| `categoryId` | `string` | Owning category. |
| `code` | `string` | Stable flow code (start requests address flows by code). |
| `name` | `string` | Display name. |
| `icon` | `string \| null?` | Icon name. |
| `description` | `string \| null?` | Description. |
| `labels` | `Record<string, string>?` | Host-owned selection metadata (e.g. which app a flow belongs to, mobile availability). Stored verbatim, equality-filterable; keys restricted server-side to `^[A-Za-z0-9]([A-Za-z0-9_-]*[A-Za-z0-9])?$` (≤63 chars), values to 256 characters. |
| `bindingMode` | `BindingMode` | Standalone vs business-bound. |
| `businessBinding` | `BusinessBindingConfig \| null?` | Present for business-bound flows. |
| `adminUserIds` | `string[]` | Flow-level administrators. |
| `isAllInitiationAllowed` | `boolean` | Whether everyone may initiate (else initiator rules apply). |
| `instanceTitleTemplate` | `string` | Template used to render instance titles. |
| `isActive` | `boolean` | Whether new instances may start. |
| `currentVersion` | `number` | The currently published version number. |

`FlowVersion` — a versioned snapshot (extends `FullAudited`): `flowId: string`, `version: number`, `status: VersionStatus`, `description?: string | null`, `storageMode: StorageMode`, `flowSchema?: FlowDefinition | null`, `formSchema?: FormSchema | null` (the host-owned form designer document, returned verbatim), `formFields?: FormFieldDefinition[] | null` (the flat field list derived from `formSchema` at deploy — the only form shape the framework itself consumes), `publishedAt?: string | null`, `publishedBy?: string | null`, `businessBinding?: BusinessBindingConfig | null`.

`FlowVersionSummary` — the version-list projection: identity and lifecycle metadata **without** the definition payloads (`id`, `flowId`, `version`, `status`, `description?`, `storageMode`, `publishedAt?`, `publishedBy?`, `createdAt`, `createdBy`). A single version's full definition is fetched through `get_graph` with an explicit `versionId`.

| Type | Fields | Notes |
| --- | --- | --- |
| `FlowInitiator` | `id: string`, `flowId: string`, `kind: InitiatorKind`, `ids: string[]` | A stored initiator rule. |
| `KindOptions` | `assignees: KindDescriptor<AssigneeKind>[]`, `ccs: KindDescriptor<CcKind>[]`, `initiators: KindDescriptor<InitiatorKind>[]` | The kinds the running application accepts, as served by `approval/flow.list_kind_options`. Each vocabulary is an open registry on the backend — a host adds a kind by registering a resolver — so this catalog, not a client-side union, is what the designer offers and what a deploy validates. |
| `InitiatorParams` | `kind: InitiatorKind`, `ids: string[]` | An initiator rule as submitted. |
| `CreateFlowParams` | `tenantId`, `code`, `name`, `categoryId` (all `string`), `icon?`, `description?` (`string`), `labels?: Record<string, string>`, `bindingMode: BindingMode`, `businessBinding?: BusinessBindingConfig`, `adminUserIds?: string[]`, `isAllInitiationAllowed: boolean`, `instanceTitleTemplate: string`, `initiators?: InitiatorParams[]` | `approval/flow.create` payload. |
| `UpdateFlowParams` | `flowId: string` + the same fields as create minus `tenantId`/`code` | Omitted `labels` clears the stored set (full replace semantics). |
| `DeployFlowParams` | `flowId: string`, `description?: string`, `storageMode?: StorageMode`, `flowDefinition: FlowDefinition`, `formSchema?: FormSchema` | Creates a new draft version. `formSchema` is host-owned, passed through opaque and optional (flows without forms exist). |
| `PublishVersionParams` | `versionId: string` | `publish_version` payload. |
| `ToggleFlowActiveParams` | `flowId: string`, `isActive: boolean` | `toggle_active` payload. |
| `FlowSearch` | `tenantId?`, `categoryId?`, `keyword?` (`string`), `isActive?: boolean`, `labels?: Record<string, string>` | Label filters are equality predicates, AND-combined across pairs. |
| `FlowGraphBundle` | `flow: Flow \| null`, `version: FlowVersion \| null` | `get_graph` result: the flow record and the resolved version (carrying `flowSchema`/`formSchema`). |

### Instance action params

| Type | Fields | Notes |
| --- | --- | --- |
| `StartInstanceParams` | `tenantId: string`, `flowCode: string`, `businessRef?: string`, `formData?: Record<string, unknown>` | `formData` is validated server-side against the version's derived field list. `businessRef` is required by convention for business-bound flows unless the host's `BusinessRefProvider` derives one. |
| `ProcessTaskParams` | `taskId: string`, `action: ProcessTaskAction`, `opinion?: string`, `formData?: Record<string, unknown>`, `attachments?: string[]`, `transferToId?: string`, `targetNodeId?: string` | `transferToId` required for `transfer`; `targetNodeId` (a flow-node id) required for `rollback`. |
| `WithdrawInstanceParams` | `instanceId: string`, `reason?: string` | — |
| `ResubmitInstanceParams` | `instanceId: string`, `formData?: Record<string, unknown>` | — |
| `AddCCParams` | `instanceId: string`, `ccUserIds: string[]` | — |
| `MarkCCReadParams` | `instanceId: string` | — |
| `AddAssigneeParams` | `taskId: string`, `userIds: string[]`, `addType: AddAssigneeType` | — |
| `RemoveAssigneeParams` | `taskId: string` | Targets the peer task to remove. |
| `UrgeTaskParams` | `taskId: string`, `message?: string` | — |

### Self-service (`my`) projections

| Type | Fields | Notes |
| --- | --- | --- |
| `AvailableFlow` | `flowId`, `flowCode`, `flowName` (`string`), `flowIcon?`, `description?` (`string`), `labels?: Record<string, string>`, `categoryId: string`, `categoryName: string` | A flow the current user may initiate. |
| `StartForm` | `flowId`, `flowCode`, `flowName` (`string`), `flowIcon?`, `description?` (`string`), `versionId: string`, `version: number`, `formSchema?: FormSchema`, `applicant: UserInfo`, `globals?: Record<string, unknown>` | The pre-submission view: identity plus the published version's host form document, returned verbatim. Loading it is gated exactly like starting. `applicant` is the snapshot the instance will record — the form's `$applicant`, resolved exactly as starting resolves it; `globals` are the host globals the flow exposes to its form, resolved for the caller (absent when it exposes none). |
| `InitiatedInstance` | `instanceId`, `instanceNo`, `title`, `flowName` (`string`), `flowIcon?: string`, `status: InstanceStatus`, `currentNodeName?: string`, `createdAt: string`, `finishedAt?: string` | A submission of the current user. |
| `PendingTask` | `taskId`, `instanceId`, `instanceTitle`, `instanceNo`, `flowName` (`string`), `flowIcon?: string`, `applicant: UserInfo`, `nodeName: string`, `createdAt: string`, `deadline?: string`, `isTimeout: boolean` | A task awaiting the current user. |
| `CompletedTask` | `taskId`, `instanceId`, `instanceTitle`, `instanceNo`, `flowName` (`string`), `flowIcon?: string`, `applicant: UserInfo`, `nodeName: string`, `status: string`, `finishedAt?: string` | A task the current user already processed. |
| `MyCCRecord` | `ccRecordId`, `instanceId`, `instanceTitle`, `instanceNo`, `flowName` (`string`), `flowIcon?: string`, `applicant: UserInfo`, `nodeName?: string`, `isRead: boolean`, `createdAt: string` | A CC notification addressed to the current user. |
| `PendingCounts` | `pendingTaskCount: number`, `unreadCcCount: number` | Badge counts. |
| `MyInstanceInfo` | `instanceId`, `instanceNo`, `title`, `flowId` (`string`), `flowCode: string`, `flowName` (`string`), `flowIcon?: string`, `labels?: Record<string, string>`, `applicant: UserInfo`, `globals?: Record<string, unknown>`, `status: InstanceStatus`, `currentNodeId?`, `currentNodeName?`, `businessRef?` (`string`), `formData?: FormData`, `createdAt: string`, `finishedAt?: string` | Runtime state within the detail. `formData` is already stripped of fields this viewer may not see; `labels` are read from the mutable flow at query time (display identity, not version-pinned); `globals` is the form-visible part of the instance's globals snapshot — the form's `$globals` as resolved at initiation, absent when the flow exposes none. |
| `RollbackTarget` | `nodeId: string`, `name: string` | One valid rollback destination, resolved server-side from the node's rollback config and the visit trail. |
| `RemovableAssignee` | `taskId: string`, `assignee: UserInfo`, `status: string` | One peer task eligible for removal; `status` is the peer task's status verbatim (`pending` / `waiting`). |
| `ViewerTask` | `taskId: string`, `nodeId: string`, `isOpinionRequired: boolean`, `addAssigneeTypes?: AddAssigneeType[]`, `rollbackTargets?: RollbackTarget[]`, `removableAssignees?: RemovableAssignee[]` | The viewer's pending task: what `process_task` should target plus the node-level action configuration — the client never re-derives engine semantics. |
| `MyInstanceDetail` | `instance: MyInstanceInfo`, `formSchema?: FormSchema`, `timeline: TimelineEntry[]`, `flowGraph: InstanceFlowGraph`, `availableActions: InstanceAction[]`, `fieldPermissions?: Record<string, FieldPermission>`, `myTask?: ViewerTask` | The full self-service detail. `fieldPermissions` is materialized for every top-level form field — apply verbatim, no default resolution. |
| `AvailableFlowSearch` | `tenantId?`, `keyword?` (`string`), `labels?: Record<string, string>` | — |
| `InitiatedInstanceSearch` | `tenantId?: string`, `status?: InstanceStatus`, `keyword?: string` | — |
| `MyTaskSearch` | `tenantId?: string`, `keyword?: string`, `applicantId?: string`, `applicantName?: string`, `flowId?: string` | The filters both task queries share; every filter is optional and set filters AND together. `keyword` matches the instance title by substring, `applicantId` the applicant exactly (what a user picker yields), `applicantName` the applicant's name by substring. |
| `PendingTaskSearch` | extends `MyTaskSearch` + `isTimeout?: boolean`, `createdAtFrom?: string`, `createdAtTo?: string` | `find_pending_tasks` search. The arrival-time bounds are inclusive `YYYY-MM-DD HH:mm:ss` timestamps. |
| `CompletedTaskSearch` | extends `MyTaskSearch` + `status?: TaskStatus`, `instanceStatus?: InstanceStatus`, `finishedAtFrom?: string`, `finishedAtTo?: string` | `find_completed_tasks` search. `status` is how the caller finished the task, narrowing within the completed statuses; the finish-time bounds are inclusive `YYYY-MM-DD HH:mm:ss` timestamps. |
| `MyCCRecordSearch` | `tenantId?: string`, `isRead?: boolean` | — |

### Admin projections

| Type | Fields | Notes |
| --- | --- | --- |
| `AdminInstance` | `instanceId`, `instanceNo`, `title`, `tenantId`, `flowId`, `flowName` (`string`), `applicant: UserInfo`, `status: InstanceStatus`, `currentNodeName?: string`, `createdAt: string`, `finishedAt?: string` | Admin list row. |
| `AdminTask` | `taskId`, `instanceId`, `instanceTitle`, `flowName`, `nodeName` (`string`), `assignee: UserInfo`, `status: TaskStatus`, `createdAt: string`, `deadline?: string`, `finishedAt?: string` | Admin task row. |
| `AdminInstanceInfo` | `instanceId`, `instanceNo`, `title`, `tenantId`, `flowId`, `flowCode: string`, `flowName`, `flowVersionId` (`string`), `labels?: Record<string, string>`, `applicant: UserInfo`, `globals?: Record<string, unknown>`, `status: InstanceStatus`, `currentNodeId?`, `currentNodeName?`, `businessRef?` (`string`), `formData?: FormData`, `createdAt: string`, `finishedAt?: string` | Runtime state within the admin detail. `globals` is the form-visible part of the instance's globals snapshot, as on `MyInstanceInfo`. |
| `AdminInstanceDetail` | `instance: AdminInstanceInfo`, `formSchema?: FormSchema`, `timeline: TimelineEntry[]`, `flowGraph: InstanceFlowGraph` | The raw audit trail stays on the paginated action-log query. |
| `AdminActionLog` | `logId: string`, `action: ActionType`, `nodeId?`, `taskId?` (`string`), `operator: UserInfo`, `transferTo?: UserInfo`, `rollbackToNodeId?: string`, `addedAssignees?: UserInfo[]`, `removedAssignees?: UserInfo[]`, `ccUsers?: UserInfo[]`, `opinion?: string`, `attachments?: string[]`, `createdAt: string` | One audit entry. |
| `ApprovalMetrics` | `tenantId: string`, `capturedAt: string`, `instanceCounts: Partial<Record<InstanceStatus, number>>`, `taskCounts: Partial<Record<TaskStatus, number>>`, `timeoutTaskCount: number`, `avgCompletionSeconds: number`, `pendingBindingFailures: number`, `businessProjectionCounts: Partial<Record<BindingProjectionStatus, number>>`, `pendingBusinessProjections: number` | `avgCompletionSeconds` is the average end-to-end duration in seconds over completed instances; `-1` means no completed instances yet. |
| `BusinessRecordKey` | `Record<string, string \| number \| boolean \| null>` | Configured key columns mapped to values resolved from the instance's business ref. |
| `AdminBusinessProjection` | `projectionId`, `tenantId`, `flowId`, `flowVersionId`, `ownerInstanceId` (`string`), `appliedOwnerInstanceId?: string`, `businessTable: string`, `recordKey: BusinessRecordKey`, `consistency: "synchronous" \| "eventual"`, `desiredStatus: InstanceStatus`, `desiredStartedAt: string`, `desiredFinishedAt?: string`, `desiredRevision: number`, `appliedRevision: number`, `status: BindingProjectionStatus`, `attemptCount: number`, `nextAttemptAt?`, `leaseUntil?`, `lastError?`, `appliedAt?` (`string`), `updatedAt: string` | Operator-facing convergence state for one bound business record. |
| `AdminInstanceSearch` | `tenantId?`, `applicantId?` (`string`), `status?: InstanceStatus`, `flowId?: string`, `keyword?: string` | — |
| `AdminTaskSearch` | `tenantId?`, `assigneeId?`, `instanceId?` (`string`), `status?: TaskStatus` | — |
| `AdminBusinessProjectionSearch` | `tenantId?: string`, `status?: BindingProjectionStatus` | — |
| `TerminateInstanceParams` | `instanceId: string`, `reason?: string` | — |
| `ReassignTaskParams` | `taskId: string`, `newAssigneeId: string`, `reason?: string` | — |
| `RetryBusinessProjectionParams` | `projectionId: string` | — |

### Timeline and flow-graph projections

| Type | Fields | Notes |
| --- | --- | --- |
| `NodeParticipant` | `taskId: string`, `user: UserInfo`, `delegator?: UserInfo`, `status: string`, `deadline?: string`, `isTimeout?: boolean`, `opinion?: string`, `attachments?: string[]`, `actionTime?: string`, `transferTo?: UserInfo` | One assignee's involvement at an approval/handle node during a single visit; `taskId` is what task operations are submitted against; outcome details are fused from the action log that finished the task. |
| `Activity` | `action: ActivityAction`, `operator: UserInfo`, `opinion?: string`, `attachments?: string[]`, `transferTo?: UserInfo`, `target?: UserInfo`, `rollbackToNodeId?: string`, `rollbackToNodeName?: string`, `addedAssignees?: UserInfo[]`, `removedAssignees?: UserInfo[]`, `ccUsers?: UserInfo[]`, `createdAt: string` | A side action recorded at a node. Decisions themselves (approve / handle / reject) live on the participant that made them, not here. |
| `CCRecipient` | `user: UserInfo`, `readAt?: string` | One CC recipient, with the read receipt when confirmed. |
| `TimelineEntryKind` | `"start" \| "approval" \| "handle" \| "cc" \| "end" \| "withdraw" \| "terminate"` | Node entries plus the end node and withdraw/terminate milestones. |
| `TimelineEntry` | `kind: TimelineEntryKind`, `nodeId?`, `name?` (`string`), `status?: NodeVisitStatus`, `executionType?`, `approvalMethod?`, `passRule?`, `passRatio?` (`string`), `passCount?: number`, `participants?: NodeParticipant[]`, `ccRecipients?: CCRecipient[]`, `activities?: Activity[]`, `startedAt: string`, `finishedAt?: string` | One step of the chronological account of the path an instance actually took; entries end at the node currently in progress — unreached nodes are not predicted. The `end` kind marks reaching the end node on a passing finish. `passRatio` is a percentage in `(0, 100]` serialized as a decimal string; `passCount` is the approvals a `fixed_count` rule requires, present only under that rule. |
| `FlowGraphNode` | `id: string`, `nodeId: string`, `kind: NodeKind`, `position: { x: number; y: number }`, `data: FlowGraphNodeData` | React Flow–ready node; `kind` selects the node renderer. |
| `FlowGraphNodeData` | `name: string`, `status: NodeProgressStatus`, `executionType?`, `approvalMethod?`, `passRule?`, `passRatio?` (`string`), `passCount?: number`, `participants?: NodeParticipant[]`, `ccRecipients?: CCRecipient[]`, `activities?: Activity[]`, `startedAt?: string`, `finishedAt?: string` | Runtime payload: display config plus progress and the same participant/CC/activity shapes the timeline uses, aggregated across the node's visits in traversal order. |
| `FlowGraphEdge` | `id: string`, `source: string`, `target: string`, `sourceHandle?: string` | React Flow–ready edge. |
| `InstanceFlowGraph` | `nodes: FlowGraphNode[]`, `edges: FlowGraphEdge[]` | The read-only, progress-annotated projection of an instance's flow definition. |

## Re-exports from `approval-flow-editor`

The picker contract hosts implement for `ApprovalPlugins.pickers`, re-exported so a host wires the provider from this package alone:

| Type | Shape | Documented at |
| --- | --- | --- |
| `EditorPlugins` | `{ pickers?, assigneeKinds?, ccKinds?, formFields?, globalSubjects? }` | [Approval Flow Editor — Host Integration](../../editors/approval-flow-editor/host-integration.md) |
| `PickerProps` | `{ value: string[]; onChange: (ids: string[]) => void; disabled?: boolean }` | [Approval Flow Editor — Reference](../../editors/approval-flow-editor/reference.md) |
| `PrincipalKind` | `"user" \| "role" \| "department"` | [Approval Flow Editor — Reference](../../editors/approval-flow-editor/reference.md) |
| `KindDescriptor` | `{ kind: string; label: string; selection: SelectionMode }` | [Approval Flow Editor — Reference](../../editors/approval-flow-editor/reference.md) |
| `SelectionMode` | `"none" \| "user" \| "role" \| "department" \| "form_field" \| "custom"` | [Approval Flow Editor — Reference](../../editors/approval-flow-editor/reference.md) |

Page prop types (`ApprovalTaskCenterPageProps`, `ApprovalMyInstancesPageProps`, `ApprovalInitiatePageProps`, `ApprovalCategoryPageProps`, `ApprovalFlowPageProps`, `ApprovalDelegationPageProps`, `ApprovalAdminPageProps`, `FlowDesignerDrawerProps`, `FlowVersionsDrawerProps`, `StartInstanceDrawerProps`) are exported alongside their components — see [Pages](./pages.md) for their tables.
