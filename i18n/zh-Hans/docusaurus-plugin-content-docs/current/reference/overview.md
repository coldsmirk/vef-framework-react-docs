---
title: 包 API 地图
description: 针对特定需求应优先查阅十二个包中的哪一个，并链接到各自的速查参考。
---

# 包 API 地图

本节是枯燥的、以信息为导向的参考资料：各包的签名、类型和选项表。它不会重复"为什么"——那部分内容在[指南](../guide/routing.md)中；也不包含组件属性表和示例，这些内容在[组件](../components/overview.md)中。

本页首先回答一个更具体的问题：面对某个需求，应该打开十二个包中的哪一个，其参考文档又在哪里？

## `@vef-framework-react/starter`

基于 TanStack Router 的应用启动、路由和应用壳层(布局、登录、状态页面)。

最适合用于：

- 应用入口(`createApp`)
- 路由设置和路由选项辅助函数
- 登录、布局和已认证路由的接入

从这里开始：

- `createApp`
- `createApiClient`
- `createRouter`
- `createLayoutRouteOptions`
- `createLoginRouteOptions`
- `useAppStore`

参考文档：[Starter 包](./starter/overview.md)

## `@vef-framework-react/components`

基于 antd v6 + Emotion 的 UI 组件库(100+ 组件)：页面/CRUD 容器、表单字段、选项驱动的控件、通知、图标和图表。

最适合用于：

- UI 组件，包括 `Page`、`ProTable` 和 `CrudPage`
- 表单字段和 TanStack Form 集成
- 主题令牌和 CSS 变量

从这里开始：

- `globalCssVars`
- `useThemeTokens`
- `useIsDarkMode`
- `useForm`
- `useFormContext`
- `Table`
- `PermissionGate`
- `Icon`
- `Chart`

参考文档：组件属性表和示例在[组件](../components/overview.md)中，不在本节内。

## `@vef-framework-react/core`

运行时基础：HTTP 客户端、API 客户端(Axios + TanStack Query)、状态管理(Zustand/Jotai/XState)、Immer、基于选择器的上下文、SSE 客户端，以及 `push` 模块——面向 vef 服务端推送通道的 WebSocket 客户端。

最适合用于：

- 查询与变更(query and mutation)
- store 与 atom
- 权限检查
- HTTP、SSE 与服务端推送(`PushClient`)
- 分片、可断点续传的文件上传(Storage / Uploader)

从这里开始：

- `useQuery`
- `useMutation`
- `createStore`
- `createComponentStore`
- `atom`
- `checkPermission`
- `createPushClient`

参考文档：[Core 包](./core/overview.md)

## `@vef-framework-react/hooks`

可复用的 React hook 库：权限、事件、码集、推送、上传和深度比较等 hook，以及对常用 Mantine / hotkey hook 的稳定再导出。

最适合用于：

- 码集
- 选项转换
- 加载状态检查
- 权限感知的过滤与检查
- 服务端推送订阅

从这里开始：

- `useCodeSetQuery`
- `useDataOptionsQuery`
- `usePushMessage`
- `useHasFetching`
- `useHasMutating`
- `useAuthorizedItems`
- `useIsAuthorized`

参考文档：[Hooks 包](./hooks/vef-hooks.md)

## `@vef-framework-react/shared`

纯函数工具基础库：类型工具、日期/格式化/校验辅助函数、事件/对象/树/路径/字符串工具，以及颜色辅助函数。

最适合用于：

- 校验
- 格式化
- 树处理
- 事件发射器

从这里开始：

- `z`
- `EventEmitter`
- `formatDate`
- `flattenTree`
- `mapTree`

参考文档：[Shared 包](./shared/overview.md)

## `@vef-framework-react/form-editor`

面向数百字段规模表单的可视化表单 schema 编辑器。联动表达式(条件、赋值、脚本动作)通过 `new Function` 编译执行。

最适合用于：

- 嵌入拖拽式表单设计器
- 在运行时渲染已保存的 schema(`FormRenderer`)
- 由 `$form` / `$vars` / `$user` / `$node` 驱动的联动表达式

从这里开始：

- `FormEditor`
- `FormRenderer`
- `FormEditorProvider`

参考文档：[可视化编辑器 / Form Editor](../editors/form-editor/overview.md)

## `@vef-framework-react/approval-flow-editor`

基于 `@xyflow/react` v12(ReactFlow)并带有 elkjs 自动布局的可视化审批流程设计器。

最适合用于：

- 嵌入审批流程设计器
- 编辑流程定义 JSON 结构
- 接入自定义节点选择器(`EditorPlugins`)

从这里开始：

- `ApprovalFlowEditor`
- `toFlowDefinition`
- `fromFlowDefinition`
- `EditorPlugins`

参考文档：[可视化编辑器 / Approval Flow Editor](../editors/approval-flow-editor/overview.md)

## `@vef-framework-react/approval-form-bridge`

从 form-editor schema 到 Go 审批表单契约的投影桥接层。

最适合用于：

- 将 form-editor schema 投影为后端 `FormDefinition`(`projectFormSchema`)
- 构建审批安全的字段/操作符注册表(`createApprovalRegistries`)
- 在保存前校验 schema 是否符合审批流程安全要求(`validateApprovalSchema`)

从这里开始：

- `projectFormSchema`
- `createApprovalRegistries`
- `validateApprovalSchema`

参考文档：[可视化编辑器 / Approval Form Bridge](../editors/approval-form-bridge.md)

## `@vef-framework-react/approval`

面向审批引擎的开箱即用管理与运行时页面，端到端内嵌流程设计器。

最适合用于：

- 把审批中心(流程设计器、任务中心、实例视图)挂载到路由上
- 通过 `ApprovalProvider` 接入宿主提供的主体选择器
- 审批权限目录

从这里开始：

- `ApprovalFlowPage`
- `ApprovalTaskCenterPage`
- `ApprovalProvider`
- `APPROVAL_PERMISSIONS`

参考文档：[引擎 / Approval](../engines/approval/overview.md)

## `@vef-framework-react/integration`

面向集成引擎的开箱即用管理页面：系统、适配器、契约、路由、码表，以及一个控制台工作台。

最适合用于：

- 把集成管理控制台挂载到路由上
- 集成权限目录

从这里开始：

- `IntegrationSystemPage`
- `IntegrationConsolePage`
- `INTEGRATION_PERMISSIONS`

参考文档：[引擎 / Integration](../engines/integration/overview.md)

## `@vef-framework-react/cron`

面向持久化定时调度引擎的开箱即用管理页面：调度与运行历史。

最适合用于：

- 把定时调度与运行历史页面挂载到路由上
- 定时调度权限目录

从这里开始：

- `CronSchedulePage`
- `CronRunPage`
- `CRON_PERMISSIONS`

参考文档：[引擎 / Cron](../engines/cron/overview.md)

## `@vef-framework-react/dev`

为基于 VEF 的项目提供共享的 Vite、ESLint、Stylelint 和 Commitlint 配置，外加 `vef` CLI 和码集键名生成器。

最适合用于：

- Vite 构建配置
- ESLint 规则
- Stylelint 规则
- Commitlint 规则
- 从后端目录生成 `CodeSetKey` 联合类型

从这里开始：

- `defineViteConfig`
- `defineEslintConfig`
- `defineStylelintConfig`
- `defineCommitlintConfig`
- `defineCodeGenerationConfig`

参考文档：[Dev 包](./dev/overview.md)
