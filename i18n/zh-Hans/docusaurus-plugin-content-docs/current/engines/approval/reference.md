---
title: 审批 API 参考
description: "@vef-framework-react/approval 每一个导出的详尽参考——权限、Provider 与插件、API hook、运行时组件与 wire 类型。"
---

# 审批 API 参考

`@vef-framework-react/approval` 从包根部导出的全部内容，按源码分组: [权限](#权限)、[插件与 Provider](#插件与-provider)、[API hooks](#api-hooks)、[运行时组件](#运行时组件)、[类型](#类型)与[重新导出](#从-approval-flow-editor-重新导出)。页面组件及其 props 见[页面](./pages.md)。

`QueryFunction<TData, TParams>` 与 `MutationFunction<TData, TParams>` 是框架在 `@vef-framework-react/core` 中带 key 的函数形态（各自携带稳定的 `.key` 供 TanStack Query 使用）。`PaginatedQueryParams<TSearch>` 是 `@vef-framework-react/components` 的 ProTable 查询形态（搜索字段加 symbol 键的分页）。`ApiResult<T>` 是标准响应信封。

## 权限

### `APPROVAL_PERMISSIONS`

`const`——审批引擎管理 API 的权限码，逐字镜像后端的 `RequiredPermission` 字符串。每个管理页面的门控都默认取对应条目，并接受通过其 `permissions` prop 覆盖。自助的 `approval/my` 资源不携带任何权限码——其操作在服务端限定为当前用户。通用模型见[权限](../../guide/permissions.md)。

| Group.key | 权限码 | 门控内容 |
| --- | --- | --- |
| `category.query` | `approval.category.query` | 分类树查询 |
| `category.create` | `approval.category.create` | 新增分类 |
| `category.update` | `approval.category.update` | 更新分类 |
| `category.delete` | `approval.category.delete` | 删除分类 |
| `flow.query` | `approval.flow.query` | 流程列表 / 版本 / 图 / 发起人查询 |
| `flow.create` | `approval.flow.create` | 新建流程 |
| `flow.update` | `approval.flow.update` | 更新流程、切换启停 |
| `flow.deploy` | `approval.flow.deploy` | 把设计好的定义部署为新的草稿版本 |
| `flow.publish` | `approval.flow.publish` | 发布草稿版本 |
| `instance.query` | `approval.instance.query` | 管理端跨用户实例列表 |
| `instance.detail` | `approval.instance.detail` | 管理端实例详情（含操作日志） |
| `instance.start` | `approval.instance.start` | 发起实例（自助发起还要额外通过发起人门控） |
| `instance.withdraw` | `approval.instance.withdraw` | 撤回进行中的实例 |
| `instance.resubmit` | `approval.instance.resubmit` | 重新提交被退回的实例 |
| `instance.cc` | `approval.instance.cc` | 添加抄送 |
| `instance.terminate` | `approval.instance.terminate` | 管理端终止 |
| `task.query` | `approval.task.query` | 管理端跨用户任务列表 |
| `task.process` | `approval.task.process` | 处理任务（通过 / 拒绝 / 转办 / 回退 / 办理） |
| `task.addAssignee` | `approval.task.add_assignee` | 为任务加签 |
| `task.removeAssignee` | `approval.task.remove_assignee` | 减签同节点处理人的任务 |
| `task.urge` | `approval.task.urge` | 催办待处理任务 |
| `task.reassign` | `approval.task.reassign` | 管理端改派 |
| `actionLog.query` | `approval.action_log.query` | 审计轨迹查询 |
| `metrics.query` | `approval.metrics.query` | 引擎指标 |
| `binding.query` | `approval.binding.query` | 业务投影列表 |
| `binding.retry` | `approval.binding.retry` | 重试失败的投影 |
| `delegation.query` | `approval.delegation.query` | 委托列表 |
| `delegation.create` | `approval.delegation.create` | 新增委托 |
| `delegation.update` | `approval.delegation.update` | 更新委托 |
| `delegation.delete` | `approval.delegation.delete` | 删除委托 |

类型导出: `ApprovalPermissions`（`typeof APPROVAL_PERMISSIONS`）以及每组一个的别名——`CategoryPermissionCodes`、`FlowPermissionCodes`、`InstancePermissionCodes`、`TaskPermissionCodes`、`ActionLogPermissionCodes`、`MetricsPermissionCodes`、`BindingPermissionCodes`、`DelegationPermissionCodes`（各为 `ApprovalPermissions["<group>"]`）。

## 插件与 Provider

### `ApprovalPlugins`

每个审批页面与组件共享的宿主集成点。用一个 `ApprovalProvider` 把审批路由包起来，下面的每个选择器、注册表与渲染器都从中解析——页面从不把它们作为 props 接收。

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `pickers` | `Partial<Record<PrincipalKind, FC<PickerProps>>>` | — | 为每种主体类型（`user` / `role` / `department`）解析具体 id 的选择器。由流程设计器与运行时操作对话框（转办、加签、抄送）共用。未设置的类型降级为纯 id 标签输入。 |
| `registries` | `DeviceRegistries` | `createApprovalRegistries()` | 渲染与设计审批表单所用的表单字段注册表。默认取 [`approval-form-bridge`](../../editors/approval-form-bridge.md) 的审批 profile，它排除了后端解析器会拒绝的字段类型。 |
| `globalSubjects` | `FormFieldDefinition[]` | — | 宿主定义的全局变量，流程设计器的条件编辑器把它们与内置的申请人属性并列提供——实例发起时由服务端从 `Instance.Globals` 解析。 |
| `renderBusinessRef` | `(businessRef: string) => ReactNode` | 纯文本 | 把实例的不透明业务引用渲染为宿主可导航的元素（指向业务记录的链接、抽屉触发器……）。 |

### `ApprovalProviderProps`

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `plugins` | `ApprovalPlugins` | — | 要提供的插件集。 |
| `children` | `ReactNode` | — | 解析这些插件的子树。 |

### `ApprovalProvider`

`(props: ApprovalProviderProps) => JSX.Element`——向其下的每个页面与组件提供审批插件集。默认的表单注册表**每次挂载只创建一次**（注册表是有状态的类实例，因此 context 值不会在重渲染之间反复变更字段注册）；传入 `registries` 可整体覆盖。

### `ResolvedApprovalPlugins`

`interface ResolvedApprovalPlugins extends ApprovalPlugins { registries: DeviceRegistries }`——补完默认值之后的插件集: 注册表始终存在。

### `useApprovalPlugins`

`() => ResolvedApprovalPlugins`——解析审批插件集。**没有** provider 也能使用——此时每个集成点都回退到其内置默认值（每次挂载新建默认注册表、无选择器、无全局变量、业务引用渲染为纯文本）。

### `toEditorPlugins`

`(plugins: ResolvedApprovalPlugins, formFields: FormFieldDefinition[]) => EditorPlugins`——把审批插件集投影成流程设计器的 [`EditorPlugins`](../../editors/approval-flow-editor/host-integration.md) 形态（`pickers`、`globalSubjects`），并把部署时派生的 `formFields` 叠加进去。

## API hooks

所有 hook 都按 `ApiClient` 记忆其函数集，并以 `createApiRequest(resource, operation, params)` 信封 POST 到 `API_PATH`。

### 查询基础设施

| 导出 | 签名 | 说明 |
| --- | --- | --- |
| `API_PATH` | `const "/api"` | 每个审批调用 POST 的框架 RPC 端点。 |
| `toPagedParams` | `<TSearch extends AnyObject>(queryParams: PaginatedQueryParams<TSearch>) => Omit<PaginatedQueryParams<TSearch>, typeof SYMBOL_PAGINATION> & { page?: number; pageSize?: number }` | 把 ProTable 的 symbol 键分页折叠成审批 RPC 查询期望的扁平 `page` / `pageSize` 请求形态。排序 symbol 留在展开副本上；JSON 序列化会丢弃它。 |

### `useCategoryApi`

`() => CategoryApi`——流程分类树（`approval/category`）的 CRUD API，形态可直接插入不分页的 `CrudPage`（见 [Crud](../../components/crud.md)）。

| 函数 | 类型 | 操作 |
| --- | --- | --- |
| `findTree` | `QueryFunction<FlowCategory[], QueryParams<CategorySearch>>` | `find_tree`——返回嵌套树（`children`） |
| `create` | `MutationFunction<ApiResult<unknown>, CategoryParams>` | `create` |
| `update` | `MutationFunction<ApiResult<unknown>, CategoryParams>` | `update` |
| `remove` | `MutationFunction<ApiResult<unknown>, FlowCategory>` | `delete`——发送 `{ id: row.id }` |

### `useFlowApi`

`() => FlowApi`——流程定义（`approval/flow`）的管理 API: 分页列表加上定义的生命周期（create → deploy → publish）及其辅助查询。变更返回创建/更新后的记录，调用方可以据此串联生命周期（例如 create 后用返回的流程 id 去 deploy）。

| 函数 | 类型 | 操作 |
| --- | --- | --- |
| `findFlows` | `QueryFunction<PaginationResult<Flow>, PaginatedQueryParams<FlowSearch>>` | `find_flows`（经 `toPagedParams` 分页） |
| `create` | `MutationFunction<Flow, CreateFlowParams>` | `create`——返回创建的 `Flow` |
| `update` | `MutationFunction<Flow, UpdateFlowParams>` | `update`——返回更新后的 `Flow` |
| `deploy` | `MutationFunction<FlowVersion, DeployFlowParams>` | `deploy`——返回新的草稿 `FlowVersion` |
| `publishVersion` | `MutationFunction<unknown, PublishVersionParams>` | `publish_version` |
| `toggleActive` | `MutationFunction<unknown, ToggleFlowActiveParams>` | `toggle_active` |
| `getGraph` | `QueryFunction<FlowGraphBundle, { flowId: string; tenantId?: string; versionId?: string }>` | `get_graph`——默认是最新已发布版本，或 `versionId` 指定的版本（设计器的编辑种子） |
| `findVersions` | `QueryFunction<FlowVersionSummary[], { flowId: string; tenantId?: string }>` | `find_versions`——不含定义载荷的瘦身摘要（v2.12.0 破坏性变更 `40b6714`） |
| `findInitiators` | `QueryFunction<FlowInitiator[], { flowId: string; tenantId?: string }>` | `find_initiators` |

### `useDelegationApi`

`() => DelegationApi`——审批委托（`approval/delegation`）的 CRUD API。列表由框架标准的 `find_page` 提供，从请求 meta 读取分页。

| 函数 | 类型 | 操作 |
| --- | --- | --- |
| `findPage` | `QueryFunction<PaginationResult<Delegation>, PaginatedQueryParams<DelegationSearch>>` | `find_page` |
| `create` | `MutationFunction<ApiResult<unknown>, DelegationParams>` | `create` |
| `update` | `MutationFunction<ApiResult<unknown>, DelegationParams>` | `update` |
| `remove` | `MutationFunction<ApiResult<unknown>, Delegation>` | `delete`——发送 `{ id: row.id }` |

### `useInstanceApi`

`() => InstanceApi`——审批实例与任务（`approval/instance`）的运行时操作 API: 提交、逐任务的决策，以及参与者侧操作。每个都是从详情视图命令式触发的变更。

| 函数 | 类型 | 操作 |
| --- | --- | --- |
| `start` | `MutationFunction<unknown, StartInstanceParams>` | `start` |
| `processTask` | `MutationFunction<unknown, ProcessTaskParams>` | `process_task`——打包了通过 / 拒绝 / 转办 / 回退 / 办理 |
| `withdraw` | `MutationFunction<unknown, WithdrawInstanceParams>` | `withdraw` |
| `resubmit` | `MutationFunction<unknown, ResubmitInstanceParams>` | `resubmit` |
| `addCC` | `MutationFunction<unknown, AddCCParams>` | `add_cc` |
| `markCCRead` | `MutationFunction<unknown, MarkCCReadParams>` | `mark_cc_read` |
| `addAssignee` | `MutationFunction<unknown, AddAssigneeParams>` | `add_assignee` |
| `removeAssignee` | `MutationFunction<unknown, RemoveAssigneeParams>` | `remove_assignee` |
| `urgeTask` | `MutationFunction<unknown, UrgeTaskParams>` | `urge_task` |

### `useMyApprovalApi`

`() => MyApprovalApi`——当前用户审批工作的自助 API（`approval/my`）: 我能发起什么、我提交了什么、什么在等我处理，以及单个实例的详情。所有操作都在服务端限定为当前用户，不携带任何权限码。

| 函数 | 类型 | 操作 |
| --- | --- | --- |
| `findAvailableFlows` | `QueryFunction<PaginationResult<AvailableFlow>, PaginatedQueryParams<AvailableFlowSearch>>` | `find_available_flows` |
| `getStartForm` | `QueryFunction<StartForm, { tenantId: string; flowCode: string }>` | `get_start_form`——门控规则与发起实例完全相同 |
| `findInitiated` | `QueryFunction<PaginationResult<InitiatedInstance>, PaginatedQueryParams<InitiatedInstanceSearch>>` | `find_initiated` |
| `findPendingTasks` | `QueryFunction<PaginationResult<PendingTask>, PaginatedQueryParams<MyTaskSearch>>` | `find_pending_tasks` |
| `findCompletedTasks` | `QueryFunction<PaginationResult<CompletedTask>, PaginatedQueryParams<MyTaskSearch>>` | `find_completed_tasks` |
| `findCCRecords` | `QueryFunction<PaginationResult<MyCCRecord>, PaginatedQueryParams<MyCCRecordSearch>>` | `find_cc_records` |
| `getPendingCounts` | `QueryFunction<PendingCounts, { tenantId?: string }>` | `get_pending_counts` |
| `getInstanceDetail` | `QueryFunction<MyInstanceDetail, { instanceId: string }>` | `get_instance_detail` |

### `useAdminApprovalApi`

`() => AdminApprovalApi`——审批管理员的监管 API（`approval/admin`）: 跨用户的实例/任务查询、审计轨迹、引擎指标、业务投影收敛，以及管理端写操作。

| 函数 | 类型 | 操作 |
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

## 运行时组件

展示与详情构件，凡涉及插件的都从 context 读取。每个组件的 props interface 以 `<Component>Props` 的名字导出（`InstanceDetailDrawerProps`、`InstanceDetailPanelProps`、`AdminInstanceDetailPanelProps`、`InstanceFormPanelProps`、`InstanceTimelineProps`、`InstanceFlowGraphViewerProps`、`PrincipalSelectProps`、`UserLabelProps`、`UserGroupProps`），字段与下表完全一致。

### `InstanceDetailDrawer`

宽抽屉（880px）中的自助实例详情——每个运行时列表页行点击打开的标准容器。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `instanceId` | `string \| null` | — | 要展示的实例；`null` 保持抽屉关闭。 |
| `onClose` | `() => void` | — | 关闭处理函数。 |
| `onActionCompleted` | `() => void` | — | 详情内任一操作成功后触发，外层列表可据此重新拉取。 |

### `InstanceDetailPanel`

自助实例详情主体: 头部、按查看者字段权限收紧的版本锁定表单、流转时间线与进度流程图——操作栏完全从服务端解析出的 `availableActions` / `myTask` 上下文派生，因此提供的操作集永远不会偏离引擎实际接受的范围。使用 `approval/my.get_instance_detail` 加上 [`useInstanceApi`](#useinstanceapi) 的操作；面板在每次操作后重新拉取自己的详情。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `instanceId` | `string` | — | 要展示的实例。 |
| `onActionCompleted` | `() => void` | — | 任一操作成功后触发，外层列表可据此重新拉取。 |

### `AdminInstanceDetailPanel`

实例的监管详情: 与自助视图相同的头部 / 表单 / 时间线 / 流程图投影——但完全只读，且没有字段权限收紧（管理员看到全部字段）——外加分页的原始审计轨迹（`approval/admin.find_action_logs`）。管理端写操作（终止、改派）在管理页面的行上，不在此面板内。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `instanceId` | `string` | — | 要查看的实例（经 `approval/admin.get_instance_detail`）。 |

### `InstanceHeader`

共享的实例头部: 标题 + 状态标签，随后是作为一个 descriptions 块的身份字段（审批单号（可复制）、所属流程、申请人、提交时间，存在时另有 当前节点 / 完成时间 / 业务单据 / 流程标签）。`businessRef` 经 provider 的 `renderBusinessRef` 渲染。面向操作员的视图（管理端详情）传入 `labels`，面向申请人的视图省略。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `title` | `string` | — | 实例标题。 |
| `status` | `InstanceStatus` | — | 生命周期状态（渲染为 `InstanceStatusTag`）。 |
| `instanceNo` | `string` | — | 面向业务的实例编号（可复制）。 |
| `flowName` | `string` | — | 所属流程的名称。 |
| `applicant` | `UserInfo` | — | 申请人快照。 |
| `createdAt` | `string` | — | 提交时间。 |
| `finishedAt` | `string` | — | 完成时间（进行中省略）。 |
| `currentNodeName` | `string` | — | 当前节点的显示名。 |
| `businessRef` | `string` | — | 不透明的业务引用。 |
| `labels` | `Record<string, string>` | — | 流程的宿主自有筛选元数据。 |

### `InstanceFormPanel`

实例表单，针对版本锁定的 schema 渲染，并套上查看者的字段权限: `hidden` 卸载、`visible` 渲染为只读、`editable`/`required` 赋予写入强度。字段注册表来自 `ApprovalProvider`。没有表单的流程渲染空状态。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `schema` | `FormSchema` | — | 版本锁定的宿主表单设计器文档。 |
| `formData` | `FormData` | — | 实例的表单数据（服务端已剔除该查看者不可见的字段）。 |
| `fieldPermissions` | `Record<string, FieldPermission>` | — | 服务端解析出的逐字段交互收紧，按原样应用。 |
| `disabled` | `boolean` | — | 强制整个表单只读（无事可做的查看者）。 |
| `device` | `PresentationDevice` | `"pc"` | 呈现设备 profile。 |
| `apiRef` | `RefObject<FormRendererApi \| null>` | — | 命令式句柄: `submit()` 运行渲染器的校验 + 提交管线，`getSubmitValues()` 不校验直接读取可写子集（拒绝路径用）。 |
| `onSubmit` | `(values: Record<string, unknown>) => void` | — | 携带通过校验的值触发。 |

### `InstanceTimeline`

实例的按时间顺序流转记录: 每个经过的节点一条（回退后的重走会产生第二条），加上撤回/终止里程碑。参与者、抄送与旁路活动渲染在各节点标题之下。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `timeline` | `TimelineEntry[]` | — | 服务端投影的时间线。为空时渲染空状态。 |

### `InstanceFlowGraphViewer`

实例流程的只读、带进度标注的地图: 节点位置原样取自设计器，进度为边框着色（蓝 = 进行中，绿 = 已通过，红 = 已拒绝，橙 = 已退回；未到达的节点淡出）。只能平移缩放——不可编辑。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `flowGraph` | `InstanceFlowGraph` | — | 服务端投影的图。 |
| `height` | `number \| string` | `420` | 容器高度；查看器始终撑满宽度。 |

### `PrincipalSelect`

主体（用户 / 角色 / 部门）选择字段: 当 `ApprovalProvider` 为该类型接入了宿主选择器时渲染宿主选择器，否则降级为纯 id 标签输入，让外层对话框保持可用。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `kind` | `PrincipalKind` | — | 选取哪种主体。 |
| `value` | `string[]` | — | 选中的 id。 |
| `onChange` | `(ids: string[]) => void` | — | 选择处理函数。 |
| `disabled` | `boolean` | — | 禁用该字段。 |
| `maxCount` | `number` | — | 选择数量上限（变更时强制执行）。 |

### `UserLabel` 与 `UserGroup`

`UserLabel` 把一个人员快照渲染为头像 + 姓名（头像色相按用户 id 确定），部门信息在 tooltip 中呈现；姓名为空时渲染 id——后端对缺失用户返回空姓名而不是省略。`UserGroup` 渲染一个紧凑列表，把溢出部分折叠为一个 `+N` 头像，其 tooltip 列出被隐藏的姓名。

| 组件 | 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `UserLabel` | `user` | `UserInfo` | — | 人员快照。 |
| `UserLabel` | `showAvatar` | `boolean` | `true` | 在姓名前渲染头像。 |
| `UserLabel` | `avatarSize` | `number` | `22` | 头像尺寸（像素）。 |
| `UserGroup` | `users` | `UserInfo[]` | — | 要渲染的快照（为空渲染破折号）。 |
| `UserGroup` | `maxCount` | `number` | `5` | 超过该数量折叠为 `+N`。 |
| `UserGroup` | `avatarSize` | `number` | `22` | 头像尺寸（像素）。 |

### 状态标签

每个组件把一个词汇表值渲染为一枚彩色标签:

| 组件 | Props | 词汇表 |
| --- | --- | --- |
| `InstanceStatusTag` | `{ status: InstanceStatus }` | 实例生命周期 |
| `TaskStatusTag` | `{ status: TaskStatus \| string }` | 任务生命周期（未知字符串渲染为携带原始值的普通标签） |
| `NodeProgressTag` | `{ status: NodeProgressStatus }` | 流程图中的节点进度 |
| `VersionStatusTag` | `{ status: VersionStatus }` | 流程版本生命周期 |
| `ProjectionStatusTag` | `{ status: BindingProjectionStatus }` | 业务投影收敛 |

### 文案与颜色常量

显示文案（框架默认语言）与标签颜色，每个映射对其联合类型全覆盖，后端词汇表扩充时漏项会成为类型错误:

| 导出 | 类型 |
| --- | --- |
| `INSTANCE_STATUS_LABELS` / `INSTANCE_STATUS_COLORS` | `Record<InstanceStatus, string>` |
| `TASK_STATUS_LABELS` / `TASK_STATUS_COLORS` | `Record<TaskStatus, string>` |
| `NODE_PROGRESS_LABELS` / `NODE_PROGRESS_COLORS` | `Record<NodeProgressStatus, string>` |
| `VERSION_STATUS_LABELS` / `VERSION_STATUS_COLORS` | `Record<VersionStatus, string>` |
| `BINDING_PROJECTION_STATUS_LABELS` / `BINDING_PROJECTION_STATUS_COLORS` | `Record<BindingProjectionStatus, string>` |
| `ACTIVITY_ACTION_LABELS` | `Record<ActivityAction, string>` |
| `PROCESS_TASK_ACTION_LABELS` | `Record<ProcessTaskAction, string>` |
| `INSTANCE_STATUS_OPTIONS` / `TASK_STATUS_OPTIONS` / `BINDING_PROJECTION_STATUS_OPTIONS` | `Array<{ label: string; value: … }>`——现成的下拉选项 |

### 格式化函数

| 导出 | 签名 | 说明 |
| --- | --- | --- |
| `formatTimestamp` | `(value?: string \| null) => string` | 把后端时间戳（`YYYY-MM-DD HH:mm:ss`）格式化为 `YYYY-MM-DD HH:mm`，为空时渲染破折号。 |
| `formatDurationSeconds` | `(seconds: number) => string` | 紧凑的人类可读时长（`3天2小时`、`45分钟`）；不足一分钟渲染 `<1分钟`，负值渲染破折号。 |

### `UrgeTarget`

`interface UrgeTarget { taskId: string; assigneeName: string; nodeName: string }`——一个可催办的待处理任务（支撑催办对话框的纯类型导出）。

## 类型

所有 wire 类型镜像 Go 契约。时间戳是后端格式化好的字符串。

### 共享基础类型

| 类型 | 结构 | 说明 |
| --- | --- | --- |
| `FullAudited` | `{ id: string; createdAt?: string; createdBy?: string; updatedAt?: string; updatedBy?: string }` | 镜像 Go 的 `orm.FullAuditedModel` 嵌入。 |
| `UserInfo` | `{ id: string; name: string; departmentId?: string; departmentName?: string }` | 操作发生时捕获的人员快照——所有审批投影共用的唯一人员形态。仅当宿主的 `UserInfoResolver` 填充时才有部门字段。 |
| `FormDataValue` | `string \| number \| boolean \| null \| FormDataValue[] \| { [key: string]: FormDataValue }` | 提交/存储形态的表单数据。 |
| `FormData` | `Record<string, FormDataValue>` | 实例的运行时表单数据映射。 |

### 枚举与联合类型

| 类型 | 值 | 说明 |
| --- | --- | --- |
| `InstanceStatus` | `"running" \| "approved" \| "rejected" \| "withdrawn" \| "returned" \| "terminated"` | 实例生命周期。 |
| `FINAL_INSTANCE_STATUSES` | `["approved", "rejected", "terminated"] as const` | 属于终态的状态。 |
| `isFinalInstanceStatus` | `(status: InstanceStatus) => boolean` | 镜像 `InstanceStatus.IsFinal`。 |
| `TaskStatus` | `"waiting" \| "pending" \| "approved" \| "rejected" \| "handled" \| "transferred" \| "rolled_back" \| "canceled" \| "removed" \| "skipped"` | 任务生命周期。 |
| `NodeVisitStatus` | `"active" \| "passed" \| "rejected" \| "returned" \| "canceled"` | 实例对一个节点的一次经过（visit）。 |
| `NodeProgressStatus` | `"pending" \| "active" \| "passed" \| "rejected" \| "returned" \| "canceled"` | 图投影中的节点进度。 |
| `ActionType` | `"submit" \| "approve" \| "handle" \| "reject" \| "transfer" \| "withdraw" \| "cancel" \| "rollback" \| "add_assignee" \| "remove_assignee" \| "execute" \| "resubmit" \| "reassign" \| "terminate" \| "add_cc"` | 操作日志词汇表。 |
| `ActivityAction` | `ActionType \| "urge"` | 时间线/图的活动词汇表（催办持久化为催办记录，不是操作日志）。 |
| `ProcessTaskAction` | `"approve" \| "reject" \| "transfer" \| "rollback" \| "handle"` | `process_task` 接受的动作。 |
| `AddAssigneeType` | `"before" \| "after" \| "parallel"` | 动态加签的处理人相对锚点任务的位置。 |
| `VersionStatus` | `"draft" \| "published" \| "archived"` | 流程版本状态。 |
| `BindingMode` | `"standalone" \| "business"` | `standalone` 把表单数据存进审批表；`business` 回写到既有业务表。 |
| `StorageMode` | `"json" \| "table"` | 版本级的表单数据物理存储方式。 |
| `InitiatorKind` | `"user" \| "role" \| "department"` | 流程发起人规则的类型。 |
| `BindingProjectionStatus` | `"pending" \| "processing" \| "applied" \| "failed"` | 一条业务记录投影的收敛状态。 |
| `FieldPermission` | `"visible" \| "editable" \| "hidden" \| "required"` | 查看者级的字段交互性，与表单渲染器的词汇表一致。 |
| `InstanceAction` | `"approve" \| "reject" \| "handle" \| "transfer" \| "rollback" \| "withdraw" \| "resubmit" \| "add_assignee" \| "remove_assignee" \| "add_cc" \| "urge"` | `my.get_instance_detail` 可能提供的自助操作，由服务端从状态机、查看者的待处理任务与节点开关派生。 |

### 分类

| 类型 | 字段 | 说明 |
| --- | --- | --- |
| `FlowCategory` | 继承 `FullAudited`，加上 `tenantId: string`、`code: string`、`name: string`、`icon?: string \| null`、`parentId?: string \| null`、`sortOrder: number`、`isActive: boolean`、`remark?: string \| null`、`children?: FlowCategory[]` | 分类经 `parentId` 构成一棵树；`find_tree` 返回嵌套的 `children`。 |
| `CategoryParams` | `id?: string`、`tenantId: string`、`code: string`、`name: string`、`icon?: string \| null`、`parentId?: string \| null`、`sortOrder: number`、`isActive: boolean`、`remark?: string \| null` | 创建/更新载荷。 |
| `CategorySearch` | `name?: string`、`isActive?: boolean` | 树查询条件。 |

### 委托

| 类型 | 字段 | 说明 |
| --- | --- | --- |
| `Delegation` | 继承 `FullAudited`，加上 `delegatorId: string`、`delegateeId: string`、`flowCategoryId?: string \| null`、`flowId?: string \| null`、`startTime: string`、`endTime: string`、`isActive: boolean`、`reason?: string \| null` | 生效窗口内，分派给委托人的任务被路由给被委托人。作用范围经 `flowCategoryId` / `flowId` 收窄；两者都为空表示所有流程。 |
| `DelegationParams` | 同上字段，另加 `id?: string` | 创建/更新载荷。 |
| `DelegationSearch` | `delegatorId?: string`、`delegateeId?: string`、`isActive?: boolean` | 列表查询条件。 |

### 流程

`BusinessBindingConfig`——`business` 模式流程的业务绑定。所有表/列名必须是纯 SQL 标识符；`keyColumns` 必须与 `tableName` 上一个完整的、非空的主键或唯一键完全一致。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `tableName` | `string` | 绑定的业务表。 |
| `keyColumns` | `string[]` | 记录的键列。 |
| `statusColumn` | `string` | 接收映射后实例状态的列。 |
| `instanceIdColumn` | `string?` | 对业务绑定是强制的: 引擎把它用作 compare-and-set 栅栏，过期的实例无法覆盖更新一轮审批所拥有的状态。 |
| `startedAtColumn` | `string?` | 可选的开始时间回写列。 |
| `finishedAtColumn` | `string?` | 可选的完成时间回写列。 |
| `statusMapping` | `Partial<Record<InstanceStatus, string>>?` | 把实例状态翻译为宿主业务状态值；缺失的条目回退为实例状态字符串本身。 |

`Flow`——一条流程定义记录（继承 `FullAudited`）:

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `tenantId` | `string` | 所属租户。 |
| `categoryId` | `string` | 所属分类。 |
| `code` | `string` | 稳定的流程编码（发起请求按编码寻址流程）。 |
| `name` | `string` | 显示名称。 |
| `icon` | `string \| null?` | 图标名。 |
| `description` | `string \| null?` | 描述。 |
| `labels` | `Record<string, string>?` | 宿主自有的筛选元数据（例如流程属于哪个应用、是否支持移动端）。原样存储、可做等值筛选；键在服务端限制为 `^[A-Za-z0-9]([A-Za-z0-9_-]*[A-Za-z0-9])?$`（≤63 字符），值限制为 256 字符。 |
| `bindingMode` | `BindingMode` | 独立存储或业务绑定。 |
| `businessBinding` | `BusinessBindingConfig \| null?` | 业务绑定流程存在此项。 |
| `adminUserIds` | `string[]` | 流程级管理员。 |
| `isAllInitiationAllowed` | `boolean` | 是否全员可发起（否则按发起人规则）。 |
| `instanceTitleTemplate` | `string` | 渲染实例标题所用的模板。 |
| `isActive` | `boolean` | 是否允许发起新实例。 |
| `currentVersion` | `number` | 当前已发布的版本号。 |

`FlowVersion`——一个版本化快照（继承 `FullAudited`）: `flowId: string`、`version: number`、`status: VersionStatus`、`description?: string | null`、`storageMode: StorageMode`、`flowSchema?: FlowDefinition | null`、`formSchema?: FormSchema | null`（宿主自有的表单设计器文档，原样返回）、`formFields?: FormFieldDefinition[] | null`（部署时从 `formSchema` 派生的扁平字段清单——框架自身唯一消费的表单形态）、`publishedAt?: string | null`、`publishedBy?: string | null`、`businessBinding?: BusinessBindingConfig | null`。

`FlowVersionSummary`——版本列表投影: 身份与生命周期元数据，**不含**定义载荷（`id`、`flowId`、`version`、`status`、`description?`、`storageMode`、`publishedAt?`、`publishedBy?`、`createdAt`、`createdBy`）。单个版本的完整定义通过带显式 `versionId` 的 `get_graph` 获取。

| 类型 | 字段 | 说明 |
| --- | --- | --- |
| `FlowInitiator` | `id: string`、`flowId: string`、`kind: InitiatorKind`、`ids: string[]` | 一条已存储的发起人规则。 |
| `InitiatorParams` | `kind: InitiatorKind`、`ids: string[]` | 提交形态的发起人规则。 |
| `CreateFlowParams` | `tenantId`、`code`、`name`、`categoryId`（均为 `string`）、`icon?`、`description?`（`string`）、`labels?: Record<string, string>`、`bindingMode: BindingMode`、`businessBinding?: BusinessBindingConfig`、`adminUserIds?: string[]`、`isAllInitiationAllowed: boolean`、`instanceTitleTemplate: string`、`initiators?: InitiatorParams[]` | `approval/flow.create` 载荷。 |
| `UpdateFlowParams` | `flowId: string` + 与 create 相同的字段，去掉 `tenantId`/`code` | 省略 `labels` 会清空已存储的集合（整体替换语义）。 |
| `DeployFlowParams` | `flowId: string`、`description?: string`、`storageMode?: StorageMode`、`flowDefinition: FlowDefinition`、`formSchema?: FormSchema` | 创建一个新的草稿版本。`formSchema` 归宿主所有，不透明地透传且可选（存在没有表单的流程）。 |
| `PublishVersionParams` | `versionId: string` | `publish_version` 载荷。 |
| `ToggleFlowActiveParams` | `flowId: string`、`isActive: boolean` | `toggle_active` 载荷。 |
| `FlowSearch` | `tenantId?`、`categoryId?`、`keyword?`（`string`）、`isActive?: boolean`、`labels?: Record<string, string>` | 标签筛选是等值谓词，多对之间以 AND 组合。 |
| `FlowGraphBundle` | `flow: Flow \| null`、`version: FlowVersion \| null` | `get_graph` 结果: 流程记录与解析出的版本（携带 `flowSchema`/`formSchema`）。 |

### 实例操作参数

| 类型 | 字段 | 说明 |
| --- | --- | --- |
| `StartInstanceParams` | `tenantId: string`、`flowCode: string`、`businessRef?: string`、`formData?: Record<string, unknown>` | `formData` 在服务端按版本派生的字段清单校验。业务绑定流程按约定要求 `businessRef`，除非宿主的 `BusinessRefProvider` 能派生一个。 |
| `ProcessTaskParams` | `taskId: string`、`action: ProcessTaskAction`、`opinion?: string`、`formData?: Record<string, unknown>`、`attachments?: string[]`、`transferToId?: string`、`targetNodeId?: string` | `transfer` 要求 `transferToId`；`rollback` 要求 `targetNodeId`（流程节点 id）。 |
| `WithdrawInstanceParams` | `instanceId: string`、`reason?: string` | — |
| `ResubmitInstanceParams` | `instanceId: string`、`formData?: Record<string, unknown>` | — |
| `AddCCParams` | `instanceId: string`、`ccUserIds: string[]` | — |
| `MarkCCReadParams` | `instanceId: string` | — |
| `AddAssigneeParams` | `taskId: string`、`userIds: string[]`、`addType: AddAssigneeType` | — |
| `RemoveAssigneeParams` | `taskId: string` | 指向要减签的同节点任务。 |
| `UrgeTaskParams` | `taskId: string`、`message?: string` | — |

### 自助（`my`）投影

| 类型 | 字段 | 说明 |
| --- | --- | --- |
| `AvailableFlow` | `flowId`、`flowCode`、`flowName`（`string`）、`flowIcon?`、`description?`（`string`）、`labels?: Record<string, string>`、`categoryId: string`、`categoryName: string` | 当前用户可发起的一个流程。 |
| `StartForm` | `flowId`、`flowCode`、`flowName`（`string`）、`flowIcon?`、`description?`（`string`）、`versionId: string`、`version: number`、`formSchema?: FormSchema` | 提交前视图: 身份信息加已发布版本的宿主表单文档，原样返回。加载它的门控与发起完全相同。 |
| `InitiatedInstance` | `instanceId`、`instanceNo`、`title`、`flowName`（`string`）、`flowIcon?: string`、`status: InstanceStatus`、`currentNodeName?: string`、`createdAt: string`、`finishedAt?: string` | 当前用户的一次提交。 |
| `PendingTask` | `taskId`、`instanceId`、`instanceTitle`、`instanceNo`、`flowName`（`string`）、`flowIcon?: string`、`applicant: UserInfo`、`nodeName: string`、`createdAt: string`、`deadline?: string`、`isTimeout: boolean` | 一个等待当前用户处理的任务。 |
| `CompletedTask` | `taskId`、`instanceId`、`instanceTitle`、`instanceNo`、`flowName`（`string`）、`flowIcon?: string`、`applicant: UserInfo`、`nodeName: string`、`status: string`、`finishedAt?: string` | 一个当前用户已处理的任务。 |
| `MyCCRecord` | `ccRecordId`、`instanceId`、`instanceTitle`、`instanceNo`、`flowName`（`string`）、`flowIcon?: string`、`applicant: UserInfo`、`nodeName?: string`、`isRead: boolean`、`createdAt: string` | 一条发给当前用户的抄送通知。 |
| `PendingCounts` | `pendingTaskCount: number`、`unreadCcCount: number` | 徽标计数。 |
| `MyInstanceInfo` | `instanceId`、`instanceNo`、`title`、`flowName`（`string`）、`flowIcon?: string`、`labels?: Record<string, string>`、`applicant: UserInfo`、`status: InstanceStatus`、`currentNodeId?`、`currentNodeName?`、`businessRef?`（`string`）、`formData?: FormData`、`createdAt: string`、`finishedAt?: string` | 详情内的运行时状态。`formData` 已剔除该查看者不可见的字段；`labels` 查询时从可变的流程上读取（显示身份，非版本锁定）。 |
| `RollbackTarget` | `nodeId: string`、`name: string` | 一个有效的回退目标，由服务端从节点的回退配置与经过轨迹解析。 |
| `RemovableAssignee` | `taskId: string`、`assignee: UserInfo`、`status: string` | 一个可减签的同节点任务；`status` 是该任务的原样状态（`pending` / `waiting`）。 |
| `ViewerTask` | `taskId: string`、`nodeId: string`、`isOpinionRequired: boolean`、`addAssigneeTypes?: AddAssigneeType[]`、`rollbackTargets?: RollbackTarget[]`、`removableAssignees?: RemovableAssignee[]` | 查看者的待处理任务: `process_task` 应指向的目标，加上节点级的操作配置——客户端从不重新推导引擎语义。 |
| `MyInstanceDetail` | `instance: MyInstanceInfo`、`formSchema?: FormSchema`、`timeline: TimelineEntry[]`、`flowGraph: InstanceFlowGraph`、`availableActions: InstanceAction[]`、`fieldPermissions?: Record<string, FieldPermission>`、`myTask?: ViewerTask` | 完整的自助详情。`fieldPermissions` 对每个顶层表单字段都已物化——按原样应用，不做默认值解析。 |
| `AvailableFlowSearch` | `tenantId?`、`keyword?`（`string`）、`labels?: Record<string, string>` | — |
| `InitiatedInstanceSearch` | `tenantId?: string`、`status?: InstanceStatus`、`keyword?: string` | — |
| `MyTaskSearch` | `tenantId?: string` | 待办与已办任务查询共用。 |
| `MyCCRecordSearch` | `tenantId?: string`、`isRead?: boolean` | — |

### 管理端投影

| 类型 | 字段 | 说明 |
| --- | --- | --- |
| `AdminInstance` | `instanceId`、`instanceNo`、`title`、`tenantId`、`flowId`、`flowName`（`string`）、`applicant: UserInfo`、`status: InstanceStatus`、`currentNodeName?: string`、`createdAt: string`、`finishedAt?: string` | 管理端列表行。 |
| `AdminTask` | `taskId`、`instanceId`、`instanceTitle`、`flowName`、`nodeName`（`string`）、`assignee: UserInfo`、`status: TaskStatus`、`createdAt: string`、`deadline?: string`、`finishedAt?: string` | 管理端任务行。 |
| `AdminInstanceInfo` | `instanceId`、`instanceNo`、`title`、`tenantId`、`flowId`、`flowName`、`flowVersionId`（`string`）、`labels?: Record<string, string>`、`applicant: UserInfo`、`status: InstanceStatus`、`currentNodeId?`、`currentNodeName?`、`businessRef?`（`string`）、`formData?: FormData`、`createdAt: string`、`finishedAt?: string` | 管理端详情内的运行时状态。 |
| `AdminInstanceDetail` | `instance: AdminInstanceInfo`、`formSchema?: FormSchema`、`timeline: TimelineEntry[]`、`flowGraph: InstanceFlowGraph` | 原始审计轨迹留在分页的操作日志查询上。 |
| `AdminActionLog` | `logId: string`、`action: ActionType`、`nodeId?`、`taskId?`（`string`）、`operator: UserInfo`、`transferTo?: UserInfo`、`rollbackToNodeId?: string`、`addedAssignees?: UserInfo[]`、`removedAssignees?: UserInfo[]`、`ccUsers?: UserInfo[]`、`opinion?: string`、`attachments?: string[]`、`createdAt: string` | 一条审计记录。 |
| `ApprovalMetrics` | `tenantId: string`、`capturedAt: string`、`instanceCounts: Partial<Record<InstanceStatus, number>>`、`taskCounts: Partial<Record<TaskStatus, number>>`、`timeoutTaskCount: number`、`avgCompletionSeconds: number`、`pendingBindingFailures: number`、`businessProjectionCounts: Partial<Record<BindingProjectionStatus, number>>`、`pendingBusinessProjections: number` | `avgCompletionSeconds` 是已完成实例端到端时长的平均值（秒）；`-1` 表示尚无已完成实例。 |
| `BusinessRecordKey` | `Record<string, string \| number \| boolean \| null>` | 配置的键列到值的映射，值从实例的业务引用解析而来。 |
| `AdminBusinessProjection` | `projectionId`、`tenantId`、`flowId`、`flowVersionId`、`ownerInstanceId`（`string`）、`appliedOwnerInstanceId?: string`、`businessTable: string`、`recordKey: BusinessRecordKey`、`consistency: "synchronous" \| "eventual"`、`desiredStatus: InstanceStatus`、`desiredStartedAt: string`、`desiredFinishedAt?: string`、`desiredRevision: number`、`appliedRevision: number`、`status: BindingProjectionStatus`、`attemptCount: number`、`nextAttemptAt?`、`leaseUntil?`、`lastError?`、`appliedAt?`（`string`）、`updatedAt: string` | 一条绑定业务记录面向操作员的收敛状态。 |
| `AdminInstanceSearch` | `tenantId?`、`applicantId?`（`string`）、`status?: InstanceStatus`、`flowId?: string`、`keyword?: string` | — |
| `AdminTaskSearch` | `tenantId?`、`assigneeId?`、`instanceId?`（`string`）、`status?: TaskStatus` | — |
| `AdminBusinessProjectionSearch` | `tenantId?: string`、`status?: BindingProjectionStatus` | — |
| `TerminateInstanceParams` | `instanceId: string`、`reason?: string` | — |
| `ReassignTaskParams` | `taskId: string`、`newAssigneeId: string`、`reason?: string` | — |
| `RetryBusinessProjectionParams` | `projectionId: string` | — |

### 时间线与流程图投影

| 类型 | 字段 | 说明 |
| --- | --- | --- |
| `NodeParticipant` | `taskId: string`、`user: UserInfo`、`delegator?: UserInfo`、`status: string`、`deadline?: string`、`isTimeout?: boolean`、`opinion?: string`、`attachments?: string[]`、`actionTime?: string`、`transferTo?: UserInfo` | 一次经过中，一位处理人在审批/办理节点上的参与；`taskId` 是任务操作提交的目标；结果细节从结束该任务的操作日志融合而来。 |
| `Activity` | `action: ActivityAction`、`operator: UserInfo`、`opinion?: string`、`attachments?: string[]`、`transferTo?: UserInfo`、`target?: UserInfo`、`rollbackToNodeId?: string`、`rollbackToNodeName?: string`、`addedAssignees?: UserInfo[]`、`removedAssignees?: UserInfo[]`、`ccUsers?: UserInfo[]`、`createdAt: string` | 记录在节点上的一次旁路动作。决策本身（通过 / 办理 / 拒绝）在做出决策的参与者身上，不在这里。 |
| `CCRecipient` | `user: UserInfo`、`readAt?: string` | 一位抄送接收人，确认后带已读回执。 |
| `TimelineEntryKind` | `"start" \| "approval" \| "handle" \| "cc" \| "withdraw" \| "terminate"` | 节点条目加撤回/终止里程碑。 |
| `TimelineEntry` | `kind: TimelineEntryKind`、`nodeId?`、`name?`（`string`）、`status?: NodeVisitStatus`、`executionType?`、`approvalMethod?`、`passRule?`、`passRatio?`（`string`）、`participants?: NodeParticipant[]`、`ccRecipients?: CCRecipient[]`、`activities?: Activity[]`、`startedAt: string`、`finishedAt?: string` | 实例实际走过路径的按时间顺序记录的一步；条目止于当前进行中的节点——不预测未到达的节点。`passRatio` 是 `(0, 100]` 内的百分比，序列化为十进制字符串。 |
| `FlowGraphNode` | `id: string`、`nodeId: string`、`kind: NodeKind`、`position: { x: number; y: number }`、`data: FlowGraphNodeData` | React Flow 直接可用的节点；`kind` 选择节点渲染器。 |
| `FlowGraphNodeData` | `name: string`、`status: NodeProgressStatus`、`executionType?`、`approvalMethod?`、`passRule?`、`passRatio?`（`string`）、`participants?: NodeParticipant[]`、`ccRecipients?: CCRecipient[]`、`activities?: Activity[]`、`startedAt?: string`、`finishedAt?: string` | 运行时载荷: 显示配置加进度，以及与时间线相同的参与者/抄送/活动形态，按经过顺序聚合该节点的所有经过。 |
| `FlowGraphEdge` | `id: string`、`source: string`、`target: string`、`sourceHandle?: string` | React Flow 直接可用的边。 |
| `InstanceFlowGraph` | `nodes: FlowGraphNode[]`、`edges: FlowGraphEdge[]` | 实例流程定义的只读、带进度标注的投影。 |

## 从 `approval-flow-editor` 重新导出

宿主为 `ApprovalPlugins.pickers` 实现的选择器契约，重新导出后宿主只从本包即可完成 provider 接线:

| 类型 | 结构 | 文档位置 |
| --- | --- | --- |
| `EditorPlugins` | `{ pickers?, formFields?, globalSubjects? }` | [审批流编辑器——宿主集成](../../editors/approval-flow-editor/host-integration.md) |
| `PickerProps` | `{ value: string[]; onChange: (ids: string[]) => void; disabled?: boolean }` | [审批流编辑器——参考](../../editors/approval-flow-editor/reference.md) |
| `PrincipalKind` | `"user" \| "role" \| "department"` | [审批流编辑器——参考](../../editors/approval-flow-editor/reference.md) |

页面 prop 类型（`ApprovalTaskCenterPageProps`、`ApprovalMyInstancesPageProps`、`ApprovalInitiatePageProps`、`ApprovalCategoryPageProps`、`ApprovalFlowPageProps`、`ApprovalDelegationPageProps`、`ApprovalAdminPageProps`、`FlowDesignerDrawerProps`、`FlowVersionsDrawerProps`、`StartInstanceDrawerProps`）与各自组件一同导出——它们的表格见[页面](./pages.md)。
