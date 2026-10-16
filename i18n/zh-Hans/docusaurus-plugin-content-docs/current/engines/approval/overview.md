---
title: 审批包概览
description: "@vef-framework-react/approval 提供什么——审批引擎的管理页面与自助页面、ApprovalProvider 插件体系，以及它如何内嵌可视化编辑器。"
---

# 审批包概览

`@vef-framework-react/approval`（v2.15.0，随框架 v2.15.0 于 2026‑08‑07 发布）是 VEF 服务端审批工作流引擎的前端控制台。它在一个包里覆盖了引擎的两侧:

- **自助（self-service）**——普通员工看到的部分: 发起审批、处理任务、跟踪自己的提交与抄送。由用户级作用域的 `approval/my` 与 `approval/instance` 资源支撑，不携带任何权限码。
- **管理**——管理员看到的部分: 流程分类、带版本管理的流程设计器、委托，以及一个监管控制台（跨用户实例/任务、业务回写收敛、引擎指标）。由带权限码的 `approval/category`、`approval/flow`、`approval/delegation` 和 `approval/admin` 资源支撑。

## 何时使用

- 你的 VEF 服务端运行了审批引擎，你想把七个组件挂到路由上就得到它的完整 UI——设计器也包含在内。
- 你在构建自定义审批屏幕，需要有类型的 API 表面（`useMyApprovalApi`、`useInstanceApi`……）与运行时组件（详情面板、时间线、流程图查看器、状态标签），而不是裸的 RPC 调用。

如果要在这些页面*之外*设计流程（你自己的向导、另一套持久化模型），请直接使用 [`@vef-framework-react/approval-flow-editor`](../../editors/approval-flow-editor/overview.md)——本包内嵌了它，并在其周围补上引擎的持久化链条。

## 架构

所有内容都从包根部扁平地重新导出，内部组织为五层:

| 层 | 内容 | 用途 |
| --- | --- | --- |
| `pages` | 7 个页面组件 + 3 个独立抽屉（`FlowDesignerDrawer`、`FlowVersionsDrawer`、`StartInstanceDrawer`） | 完整屏幕，一条路由一个（[页面](./pages.md)） |
| `api` | 6 个 hook（`useCategoryApi`、`useFlowApi`、`useDelegationApi`、`useInstanceApi`、`useMyApprovalApi`、`useAdminApprovalApi`）+ `API_PATH`、`toPagedParams` | 面向 `/api` RPC 端点、有类型的查询/变更函数 |
| `plugins` | `ApprovalProvider`、`useApprovalPlugins`、`toEditorPlugins` | 每个页面与组件共享的宿主集成上下文 |
| `permissions` | `APPROVAL_PERMISSIONS` + 按组划分的权限码类型 | 逐字镜像后端的 `RequiredPermission` 字符串 |
| `types` | 约 60 个镜像 Go 契约的 interface/联合类型 | 行、详情、参数与枚举的 wire 形态 |

展示型构件（状态标签、`UserLabel`、`InstanceTimeline`、`InstanceFlowGraphViewer`、`InstanceDetailPanel`/`Drawer`、`InstanceFormPanel`、`PrincipalSelect`）同样对外导出，宿主可以用它们拼装自己的详情界面——见 [API 参考](./reference.md#运行时组件)。

## `ApprovalProvider`——接入宿主插件

审批 UI 需要框架无法自行提供的宿主知识: 你的用户/角色/部门是谁、业务单据如何打开、条件可以基于哪些额外变量分支。`ApprovalProvider` 以 React context 的形式承载这些集成点；**页面从不把它们作为 props 接收**。把审批路由整体包一次即可:

```tsx
import type { ApprovalPlugins } from "@vef-framework-react/approval";

import { ApprovalProvider } from "@vef-framework-react/approval";

const PLUGINS: ApprovalPlugins = {
  // Resolve principal ids with the host's org pickers (user / role / department).
  pickers: { user: UserPicker, role: RolePicker, department: DepartmentPicker },
  // Render an instance's opaque business reference as a navigable link.
  renderBusinessRef: ref => <a onClick={() => openBusinessDoc(ref)}>{ref}</a>
};

<ApprovalProvider plugins={PLUGINS}>
  <ApprovalRoutes />
</ApprovalProvider>;
```

解析后的插件集（`ResolvedApprovalPlugins`）始终包含表单 `registries`——默认取 [`approval-form-bridge`](../../editors/approval-form-bridge.md) 的审批 profile（`createApprovalRegistries`），它排除了后端表单解析器会拒绝的字段类型。每个集成点都会优雅降级:

| 插件 | 使用方 | 未设置时的回退 |
| --- | --- | --- |
| `pickers` | 流程设计器（审批人、抄送、发起人）与运行时对话框（转办、加签、抄送），经由 `PrincipalSelect` | 纯 id 标签输入——页面仍然可用 |
| `tenants` | 流程设计器中全局流程的用户、部门规则，先选择租户再把它交给选择器 | 全局流程通过普通选择器选人 |
| `registries` | 表单设计步骤与每一次表单渲染（`InstanceFormPanel`） | 每次挂载创建一次的 `createApprovalRegistries()` |
| `globalSubjects` | 流程设计器的条件编辑器，与内置的申请人属性并列提供 | 只提供内置变量 |
| `formGlobals` | 表单设计器的系统变量，以 `$globals.<key>` 的形式与内置的 `$applicant` 属性并列提供 | 只提供发起人属性 |
| `dataSourceResolver` | 每一次表单渲染以及表单设计器的预览——解析远程选项来源 | 远程来源解析为空列表 |
| `dataSourceApis` | 表单设计器的远程选项来源，以针对该目录的选择器打头 | 接口地址与字段映射需要手动填写 |
| `codeSets` | 表单设计器的「数据字典」选项来源，从目录中挑选 | 字典 key 需要手动填写 |
| `evaluators` | 每一次表单渲染以及表单设计器的预览——表达式 / 脚本求值与宿主副作用 | 内置的 JavaScript 求值器；运行时 `alert` / `api_call` / `navigate` 不做任何事 |
| `renderBusinessRef` | 实例详情头部 | 业务引用渲染为纯代码文本 |

`useApprovalPlugins()` **没有** provider 也能使用——此时每个集成点都回退到内置默认值，这也是运行时组件可以独立使用的原因。

## 与可视化编辑器的关系

[`ApprovalFlowPage`](./pages.md#approvalflowpage) 内的流程设计器是一个四步向导（流程设置 → 表单设计 → 流程设计 → 审阅提交），它内嵌了:

- [`FormEditor`](../../editors/form-editor/overview.md) 承担表单步骤，由 provider 接好：它的 `registries`、`dataSourceResolver`、`dataSourceApis`、`codeSets` 与 `evaluators`，作为 `contextSources` 的[表单系统变量](#表单系统变量)，以及作为 `validate` 的 [`validateApprovalProjection`](../../editors/approval-form-bridge.md#validateapprovalprojection)——因此审批契约问题会出现在编辑器自己的状态栏里，每一个都可以点击定位到对应字段；
- [`ApprovalFlowEditor`](../../editors/approval-flow-editor/overview.md) 承担流程步骤；
- [`approval-form-bridge`](../../editors/approval-form-bridge.md) 的 `projectFormSchema` / `validateApprovalSchema` 作为两者之间的接缝——投影出的 `FormFieldDefinition[]` 喂给流程编辑器的条件/权限界面，而两个编辑器的校验共同把关向导的步骤切换。

两个编辑器上方都不再放问题横幅（那会挤占画布高度）：各个编辑器展示自己的诊断，向导只在禁用的「下一步」旁边说明这一步为什么无法前进。

`toEditorPlugins(plugins, formFields, kindOptions?)` 把审批插件集投影成流程编辑器的 `EditorPlugins` 形态，并把部署时派生的表单字段以及应用的 kind 目录（来自 `approval/flow.list_kind_options`）叠加进去。因此宿主只需配置**一个**插件对象，两个编辑器都能看到它。

由于选择器与 kind 目录契约属于流程编辑器，本包重新导出了宿主实现它们所需的类型——来自 `@vef-framework-react/approval-flow-editor` 的 `EditorPlugins`、`PickerProps`、`PrincipalKind`、`KindDescriptor` 与 `SelectionMode`——接入 provider 只需要从本包 import。

## 表单系统变量

审批表单经常需要读取是谁发起的——"发起人属于财务部时显示预算字段"、"成本中心默认取发起人所在部门"。表单规则会对每一个打开该实例的参与者求值，所以发起人不能是 `$user`（那是此刻的查看者）；它是 **`$applicant`**，对发起人和每一位审批人读到的都一样。

本包把这件事端到端地接好了：

- **运行时**，`InstanceFormPanel` 渲染每一个审批表单时，都以实例的发起人作为 `$applicant`（`id`、`name`、`departmentId`、`departmentName`），以该流程对表单可见的宿主全局变量作为 `$globals`。发起抽屉从 `approval/my.get_start_form` 取得这两者——它解析发起人的方式与真正发起实例时完全一致，因此规则在提交之前读到的，与之后每一个详情视图读到的都相同；自助详情与管理详情则从实例本身取得它们。
- **设计器中**，表单步骤把它们声明为系统变量：发起人 ID / 发起人姓名 / 发起人部门 ID / 发起人部门（`$applicant.id`、`$applicant.name`、`$applicant.departmentId`、`$applicant.departmentName`），其后是 `ApprovalPlugins.formGlobals` 中每一项对应的一个 `$globals.<key>`。设计器把它们列在「变量」页中——带有预览值，可以在还没有任何真实发起人时就试一试规则——并在条件构建器中、以及作为远程选项来源的绑定参数提供它们。

宿主全局变量首先是路由的输入：宿主的 `InstanceGlobalsResolver` 在实例发起时于服务端解析它们，并由 `Instance.Globals` 留存快照。把其中某个变量发到浏览器——实例的每个参与者都能读到——是另一项独立的决定，因此**表单默认看不到任何全局变量**。要暴露其中一些，宿主的 Go 解析器还需实现 `approval.FormGlobalsExposer`：

```go
// FormGlobalKeys names the globals the form of an instance of flowCode may read.
func (r *GlobalsResolver) FormGlobalKeys(flowCode string) []string {
	return []string{"staffCategory", "staffTitle"}
}
```

前端则为设计器声明同样的 key 及其显示名称：

```tsx
const PLUGINS: ApprovalPlugins = {
  formGlobals: [
    { key: "staffCategory", label: "人员类别" },
    { key: "staffTitle", label: "聘任职称" }
  ]
};
```

请让两份列表保持一致：解析器暴露了、但 `formGlobals` 没有声明的 key，运行时仍会求值，但设计器里不会提供；声明了、但没有暴露的 key，设计器里会提供，读到的却永远是空。没有实现 `FormGlobalsExposer` 的解析器不暴露任何变量，发起表单时也根本不会调用它。

提交时，向导针对 `useFlowApi` 运行一条链: `create`/`update` → `deploy`（一个新的草稿 `FlowVersion`，携带 `flowSchema`、不透明的 `formSchema` 和派生出的 `formFields`）→ 可选的 `publish_version`。发布会把之前已发布的版本归档；进行中的实例仍沿用它们启动时的版本。

## 值得注意的 v2.12.0 行为

以下变更都落在 v2.12.0 周期内（该包的首个发布版本），但在阅读较早的示例时值得了解:

- **设计器以瘦身版本摘要为种子**（周期内的破坏性变更，提交 `40b6714`）: `FlowApi.findVersions` 返回 `FlowVersionSummary[]`——只有身份与生命周期元数据，*不含*定义载荷。设计器从该列表解析出最新部署的版本 id，再通过 `getGraph({ flowId, versionId })` 拉取完整定义。因此编辑以最新的**部署**（无论是否已发布）为种子——只部署不发布，不再会让下一次编辑会话看不到这些工作。单个版本的完整载荷只会经由 `get_graph` 获取。
- **实例详情上的流程标签**（`e966464`、`a1264da`）: `MyInstanceInfo.labels` 与 `AdminInstanceInfo.labels` 镜像流程的宿主自有筛选元数据，查询时从可变的流程上读取（是显示身份，不是版本锁定的快照）。共享的 `InstanceHeader` 在面向操作员的视图上渲染它们——管理端详情传入 `labels`，面向申请人的自助详情则省略。
- **运行时减签操作**（`dacee0b`）: 当服务端在 `availableActions` 中包含 `remove_assignee` 时，实例详情操作栏会提供 减签，从 `myTask.removableAssignees` 中选定一个同节点任务并调用 `approval/instance.remove_assignee`。
- **指标加载失败显式呈现并可重试**（`d6e338e`）: 查询没有全局失败反馈（只有变更有），因此管理端指标标签页在加载失败时渲染一个明确的错误状态和重试按钮，而不是一个空荡荡的仪表盘。

## 术语

- **流程 vs. 版本**——`Flow` 是可变的身份（编码、名称、分类、标签、发起人、绑定模式）；`FlowVersion` 是不可变的已部署快照（定义 + 表单 + 存储模式）。实例锁定在它们启动时的版本上。
- **绑定模式**——`standalone` 把表单数据存进审批表；`business` 通过 `BusinessBindingConfig` 回写到既有业务表，收敛过程以*业务投影*跟踪（可在管理控制台查看）。
- **主体（principal）**——审批人/发起人是 `user` / `role` / `department` 的 id；显示与选取由宿主解析。

继续阅读[页面](./pages.md)了解每个页面的契约，或到 [API 参考](./reference.md)查看完整的导出表。
