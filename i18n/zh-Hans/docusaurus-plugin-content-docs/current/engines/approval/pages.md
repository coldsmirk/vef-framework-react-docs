---
title: 审批页面
description: "@vef-framework-react/approval 导出的每一个页面组件——它渲染什么、哪些权限对它门控、它调用哪些端点，以及如何挂载。"
---

# 审批页面

七个全页组件加三个独立抽屉。它们全部从 [`ApprovalProvider`](./overview.md#approvalprovider接入宿主插件) 读取插件上下文；没有任何一个把 API 函数或表格列作为 props 接收。playground 把它们挂在 `/approval/*` 下；下面的示例把这些路由改写到宿主应用。

所有端点都是 POST 到框架 RPC 端点 `/api` 的操作——这里写作 `resource.operation`（如 `approval/my.find_pending_tasks`）。

两条约定适用于每个页面:

- **权限门控只隐藏操作入口；强制执行在后端。** 无论客户端门控如何，表格查询都会照常发出——没有该资源 `query` 权限码的调用者会收到后端的权限错误。按钮与标签页按每个页面列出的权限码在客户端隐藏，且全部可以通过页面的 `permissions` prop 覆盖。
- **自助页面没有门控。** `approval/my` 与 `approval/instance` 上的参与者操作在服务端限定为当前用户，不声明任何权限码。

## 自助页面

### `ApprovalTaskCenterPage`

任务中心: 一个标签页式屏幕（待办 / 已办），分别是等待当前用户处理的任务和其已处理过的任务。待办标签页的标签带一个实时计数徽标。点击某行（或 处理 / 查看 操作按钮）会打开 [`InstanceDetailDrawer`](./reference.md#instancedetaildrawer)，展示完整的实例详情与操作栏；完成任何操作都会刷新两个列表和徽标。

两个列表各有自己的搜索（v2.23.0）。待办在行内按标题、申请人姓名与是否超时筛选，在高级搜索中按到达时间筛选；已办在行内按标题、申请人姓名与处理结果（已完成任务可能处于的状态：已通过、已拒绝、已办理、已转办、已回退）筛选，在高级搜索中按处理时间与实例的流程状态筛选。日期范围按天选择，且为闭区间。完整的筛选条件——包括页面没有提供的申请人 id 与流程筛选——见 [`PendingTaskSearch` / `CompletedTaskSearch`](./reference.md#自助my投影)。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `title` | `ReactNode` | — | 可选的页面标题，渲染在列表上方。 |

列表不带租户参数：显示当前用户自己在所有租户中的任务。查看所有人任务的跨租户视图由[管理控制台](#approvaladminpage)提供。

- **权限:** 无（自助）。
- **端点:** `approval/my.find_pending_tasks`、`approval/my.find_completed_tasks`、`approval/my.get_pending_counts`；详情抽屉另有 `approval/my.get_instance_detail` 与[实例运行时操作](./reference.md#useinstanceapi)。
- **playground 路由:** `/approval/task-center`。

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { ApprovalTaskCenterPage } from "@vef-framework-react/approval";

export const Route = createFileRoute("/_layout/approval/task-center")({
  component: () => <ApprovalTaskCenterPage />
});
```

### `ApprovalMyInstancesPage`

我的提交与抄送我的记录，标签页式（我发起的 / 抄送我的，抄送标签页带未读计数徽标）。我发起的标签页提供关键字与状态筛选。被退回的提交其操作按钮显示为 处理，详情抽屉提供重新提交；打开未读抄送会立即调用 `mark_cc_read`（不弹成功提示）并刷新徽标。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `title` | `ReactNode` | — | 可选的页面标题，渲染在列表上方。 |

与任务中心一样，列表显示当前用户自己在所有租户中的申请和抄送。

- **权限:** 无（自助）。
- **端点:** `approval/my.find_initiated`、`approval/my.find_cc_records`、`approval/my.get_pending_counts`、`approval/instance.mark_cc_read`，以及详情抽屉的端点。
- **playground 路由:** `/approval/my-instances`。

### `ApprovalInitiatePage`

发起门户: 当前用户可发起的每一个流程——用户所在租户的流程加上全局流程——按分类分组渲染为可点击卡片（保持服务端顺序），支持关键字搜索与按流程标签筛选。点击卡片打开 `StartInstanceDrawer`。超过 48 个流程时出现分页。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `labels` | `Record<string, string>` | — | 固定的标签预筛选（如 `{ mobile: "" }` 表示只提供可在移动端发起的流程）。与用户自己的标签筛选叠加。 |
| `title` | `string` | `"发起审批"` | 页面标题。 |
| `onStarted` | `() => void` | — | 实例提交后触发。 |

- **权限:** 无（自助——服务端只列出调用者可发起的流程，依据流程的发起人规则与 `isAllInitiationAllowed`）。
- **端点:** `approval/my.find_available_flows`；抽屉另有 `approval/my.get_start_form` 与 `approval/instance.start`。
- **playground 路由:** `/approval/initiate`。

#### `StartInstanceDrawer`

单独导出，业务页面可以为自己的某条记录发起一个审批:

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `flowCode` | `string \| null` | — | 要发起的流程；`null` 保持抽屉关闭。在用户所在租户中解析：先取该租户自己的同编码流程，没有再取全局流程。 |
| `businessRef` | `string` | — | 从宿主业务页面发起业务绑定流程时预填的业务引用。 |
| `onClose` | `() => void` | — | 关闭处理函数。 |
| `onStarted` | `() => void` | — | 提交被确认后、抽屉关闭之后触发。 |

它通过 `approval/my.get_start_form` 加载已发布的表单文档——服务端按与发起完全相同的规则门控，因此只要表单渲染出来，就意味着这是一个可发起的流程（启用、有权限、已发布）——用 provider 的注册表经 `InstanceFormPanel` 渲染，并把通过渲染器校验的值提交到 `approval/instance.start`。发起表单还携带了实例将要记录的发起人，以及该流程向表单暴露的宿主全局变量，抽屉把它们作为表单的 `$applicant` 与 `$globals` 传下去（见[表单系统变量](./overview.md#表单系统变量)）。没有表单的流程直接提交。

## 管理页面

### `ApprovalCategoryPage`

全页的流程分类管理: 分类树（`find_tree`，不分页）带名称/启用状态搜索，以及在垂直标签抽屉表单中的新增/更新/删除。父级选择器会排除正在编辑的节点（分类永远不能成为自己的后代）。删除分类不会级联——流程保留其分类 id。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `permissions` | `Partial<CategoryPermissionCodes>` | `APPROVAL_PERMISSIONS.category` | 覆盖页面用于门控其 CRUD 操作的权限码。 |
| `tenantId` | `string` | `"default"` | 页面所管理的租户：树中显示该租户的分类，新分类也创建在它下面。分类跨租户管理，由权限把关；传 `SHARED_TENANT_ID` 管理全局分类。 |
| `columnStorageKey` | `string` | `"approval.category"` | 列设置面板的存储键。 |
| `title` | `ReactNode` | — | 可选的页面标题，渲染在表格上方。 |

- **权限:** 新增分类 → `approval.category.create` · 编辑 → `approval.category.update` · 删除 → `approval.category.delete`；列表本身由服务端以 `approval.category.query` 强制执行。
- **端点:** `approval/category.find_tree`、`.create`、`.update`、`.delete`。
- **playground 路由:** `/approval/category`。

### `ApprovalFlowPage`

全页的流程管理: 带关键字 / 分类 / 启用状态 / **标签**筛选的分页流程列表（标签筛选是 `key=value` 等值谓词，服务端以 AND 组合）、全屏设计器抽屉、版本历史抽屉，以及启停开关。设计器与启停变更会使列表查询失效，因此表格无需接线回调即可刷新。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `permissions` | `Partial<FlowPermissionCodes>` | `APPROVAL_PERMISSIONS.flow` | 覆盖页面用于门控其操作的权限码。 |
| `tenantId` | `string` | `"default"` | 页面所管理的租户：列表显示该租户的流程，新流程也创建在它下面。流程跨租户管理，由权限把关；传 `SHARED_TENANT_ID` 管理全局流程。 |
| `columnStorageKey` | `string` | `"approval.flow"` | 列设置面板的存储键。 |
| `title` | `ReactNode` | — | 可选的页面标题，渲染在表格上方。 |

- **权限:** 新建流程 → `approval.flow.create` · 设计 / 启用 / 停用 → `approval.flow.update` · 版本 → `approval.flow.query` · 发布（版本抽屉内）→ `approval.flow.publish`；列表由 `approval.flow.query` 强制执行。设计器链条中的部署一步由服务端以 `approval.flow.deploy` 强制执行。
- **端点:** `approval/flow.find_flows`、`.toggle_active`、`approval/category.find_tree`（筛选/设计器选项）；设计器另有 `.find_versions`、`.get_graph`、`.find_initiators`、`.create` / `.update`、`.deploy`、`.publish_version`。
- **playground 路由:** `/approval/flow`。

#### `FlowDesignerDrawer`

全屏四步设计器（流程设置 → 表单设计 → 流程设计 → 审阅提交），单独导出。每一步都把关下一步: 设置必须完整（`business` 模式下包含有效的业务绑定；除非勾选 全员可发起，否则至少要有一条发起人规则），表单必须通过 `validateApprovalSchema`，流程必须针对投影字段通过 `validateFlowDefinition`。问题本身都在各个编辑器自己的诊断里——表单编辑器的状态栏（结构问题与审批契约问题，经由 `validate={validateApprovalProjection}`）和流程编辑器的工具栏指示器——每一条都能定位到对应的字段或节点，因此两个步骤都不会在画布上方渲染横幅；「下一步」被禁用时，底部会用一行文字说明原因（请先完善流程设置中的必填项、表单存在 N 个错误…、流程存在 N 个问题…）。表单步骤还会提供[表单系统变量](./overview.md#表单系统变量)和 provider 的选项接口目录。提交把 create/update → deploy → 可选的 publish 作为一条链执行；每一步都会使流程列表失效。所有步骤面板保持挂载，编辑器状态在步骤切换间不丢失。抽屉主体每次打开都重新挂载，因此编辑器种子绝不会在会话之间泄漏。

审阅步骤只统计最终会被保存的发起人规则。当勾选 全员可发起 时，保存的载荷不会携带任何发起人规则——这两种设置在服务端是互斥的。草稿仍会保留已输入的规则，因此切回受限发起时不会丢失；它们只会在提交时被丢弃。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `open` | `boolean` | — | 抽屉可见性。 |
| `flow` | `Flow` | — | 正在重新设计的流程；省略则新建。编辑经由 `find_versions` → `get_graph` 以最新部署（无论是否已发布）为种子。 |
| `tenantId` | `string` | — | 新流程创建到哪个租户下。 |
| `onClose` | `() => void` | — | 关闭处理函数。 |

#### `FlowVersionsDrawer`

一个流程的版本历史: 按降序列出每次部署，含状态、说明、存储模式与部署/发布时间，并对草稿提供 发布 操作。发布会把之前已发布的版本归档；进行中的实例仍沿用它们启动时的版本。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `flow` | `Flow \| null` | — | 要列出版本的流程。 |
| `open` | `boolean` | — | 抽屉可见性。 |
| `publishPermission` | `string` | — | 门控发布操作的权限码（页面传入其解析后的 `flow.publish`）。 |
| `onClose` | `() => void` | — | 关闭处理函数。 |

- **端点:** `approval/flow.find_versions`、`.publish_version`。

### `ApprovalDelegationPage`

全页的委托管理: 在委托的生效窗口内，分派给委托人的任务会路由给被委托人，可选地收窄到某个流程分类或单个流程（两者都为空 = 所有流程）。标准 CRUD 列表，带委托人/被委托人 id 搜索与抽屉表单。非超级管理员调用者只能看到（也只能创建）自己作为委托人的委托——由服务端强制执行。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `permissions` | `Partial<DelegationPermissionCodes>` | `APPROVAL_PERMISSIONS.delegation` | 覆盖页面用于门控其 CRUD 操作的权限码。 |
| `tenantId` | `string` | — | 分类范围选择器提供哪个租户的分类（另加全局分类）；省略则提供所有租户的分类。 |
| `columnStorageKey` | `string` | `"approval.delegation"` | 列设置面板的存储键。 |
| `title` | `ReactNode` | — | 可选的页面标题，渲染在表格上方。 |

- **权限:** 新增委托 → `approval.delegation.create` · 编辑 → `approval.delegation.update` · 删除 → `approval.delegation.delete`；列表由 `approval.delegation.query` 强制执行。
- **端点:** `approval/delegation.find_page`、`.create`、`.update`、`.delete`。
- **playground 路由:** `/approval/delegation`。

### `ApprovalAdminPage`

监管控制台，标签页式，每个标签页由各自的权限门控，调用者缺少权限时该标签页会被**隐藏**（一个标签页都不剩时渲染 403 结果）:

| 标签页 | 内容 | 查询门控 | 行操作（门控） |
| --- | --- | --- | --- |
| 实例管理 | 跨用户实例列表，带租户/申请人/状态/流程/关键字筛选 | `approval.instance.query` | 详情 → 只读的 [`AdminInstanceDetailPanel`](./reference.md#admininstancedetailpanel)（`approval.instance.detail`）；对非终态实例提供 终止（`approval.instance.terminate`） |
| 任务管理 | 跨用户任务列表，带处理人/实例/状态筛选 | `approval.task.query` | 改派 给新处理人（`approval.task.reassign`） |
| 业务回写 | `business` 绑定流程的业务投影收敛列表 | `approval.binding.query` | 重试 失败的投影（`approval.binding.retry`） |
| 运行指标 | 引擎健康仪表盘: 按状态统计的实例/任务数、超时压力、平均完成时长、回写收敛情况；加载失败渲染明确的错误状态并可重试 | `approval.metrics.query` | — |

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `permissions` | `{ instanceQuery?, instanceDetail?, instanceTerminate?, taskQuery?, taskReassign?, bindingQuery?, bindingRetry?, metricsQuery? }`（均为 `string`） | 对应的 `APPROVAL_PERMISSIONS` 权限码 | 覆盖门控各控制台标签页与操作的权限码。 |
| `tenantId` | `string` | — | 将指标视图限定到一个租户；省略则为调用者的默认作用域。 |
| `title` | `ReactNode` | — | 可选的页面标题。 |

- **端点:** `approval/admin.find_instances`、`.find_tasks`、`.get_instance_detail`、`.find_action_logs`（管理端详情内的分页审计轨迹）、`.get_metrics`、`.find_business_projections`、`.terminate_instance`、`.reassign_task`、`.retry_business_projection`。
- **playground 路由:** `/approval/admin`。

如果应用上下文没有提供 `hasPermission`，所有标签页都会渲染（权限检查默认放行）——后端仍会对每次调用强制执行。

## 共享的详情界面

每个运行时列表打开的都是同一个抽屉——`InstanceDetailDrawer` → `InstanceDetailPanel`——它渲染头部、按查看者字段权限收紧的版本锁定表单、流转时间线与进度流程图。其操作栏完全从服务端解析出的 `availableActions` / `myTask` 上下文派生（通过、拒绝、办理、转办、回退、撤回、重新提交、加签/减签、抄送、催办），因此提供的操作集永远不会偏离引擎实际接受的范围。各操作的 props 与调用端点见[运行时组件参考](./reference.md#运行时组件)。

详情头部现在还会显示所属流程的 `flowCode`（可复制）与流程名称并列。时间线会渲染实例通过 end 节点的条目，并把起止时间显示为同一分钟的时间点折叠成单一时间戳。流程图把处理过该节点的人员头像浮在节点上方，把未到达的节点和边以虚线淡出，让实际路径一目了然，同时悬停可达节点时显示进入/结束时间跨度。
