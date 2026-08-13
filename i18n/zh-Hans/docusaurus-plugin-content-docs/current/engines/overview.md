---
title: 引擎页面
description: 面向 VEF 服务端引擎（审批、集成与持久化定时调度）的开箱即用、权限门控的管理控制台，以及如何在宿主应用中挂载它们。
---

# 引擎页面

VEF 服务端内置了若干后端*引擎*——拥有自己的存储、生命周期和管理 API 的长驻子系统: 审批（工作流）引擎、集成引擎，以及持久化定时调度存储。**引擎页面**（engine pages）系列包就是与之配套的前端控制台: 每个包都是一组现成的全页 React 组件，端到端地管理一个引擎，并作为独立的包发布，宿主应用只需安装自己用得上的控制台。

它们被刻意设计为*开箱即用*:

- **一个页面就是一个组件。** 把 `<ApprovalTaskCenterPage />` 挂到某条路由上，它就是一个完整的屏幕——列表、搜索、表单、详情抽屉和操作一应俱全。没有任何页面把查询函数或表格列作为 props 接收。
- **默认按权限门控。** 每个管理页面的操作门控都默认取该引擎的后端权限码（`APPROVAL_PERMISSIONS`、`INTEGRATION_PERMISSIONS`、`CRON_PERMISSIONS`——逐字镜像自 Go 资源的 `RequiredPermission` 字符串），并允许宿主通过 `permissions` prop 按页面覆盖。关于门控如何针对当前用户求值，见[权限](../guide/permissions.md)。
- **自带数据层。** 所有查询与变更都构建在应用的 `ApiClient` 之上（来自 `@vef-framework-react/core` 的 `useApiClient()`），以 `createApiRequest(resource, operation, params)` 信封 POST 到框架 RPC 端点 `/api`。页面内部使用的那些 hook（`useFlowApi`、`useOpsApi`、`useScheduleApi`……）同样对外导出，宿主可以基于完全相同的 wire 契约构建自己的屏幕。

## 三个包

| 包 | 版本 | 引擎 | 页面 | 额外集成点 |
| --- | --- | --- | --- | --- |
| [`@vef-framework-react/approval`](./approval/overview.md) | 2.15.0 | 审批工作流引擎（`approval/*` 资源） | 7 个——任务中心、我的实例、发起门户、分类、流程设计器、委托、管理控制台 | `ApprovalProvider` 插件上下文（选择器、表单注册表、全局变量、业务引用渲染器）；内嵌[审批流编辑器](../editors/approval-flow-editor/overview.md)与[表单编辑器](../editors/form-editor/overview.md) |
| [`@vef-framework-react/integration`](./integration/overview.md) | 2.15.0 | 集成引擎（`integration/*` 资源） | 6 个——契约、系统、适配器、路由、码表、运维控制台 | 带运行时镜像补全与悬停文档的脚本编辑器；感知认证方案的参数编辑器 |
| [`@vef-framework-react/cron`](./cron/overview.md) | 2.15.0 | 持久化定时调度存储（`sys/cron/*` 资源） | 2 个——调度、运行记录 | 带下次触发实时预览的触发器编辑器 |

包版本独立于框架 tag 演进: 只有当某个包真正发布时，它的 `version` 才会递增。三个包遵循同一套内部架构——`pages` + `api` + `types` + `permissions`（+ 共享的展示型 `components`），全部从包根部扁平地重新导出。

## 何时使用

- 你的 VEF 服务端启用了其中某个引擎，你想直接获得它的管理 UI，而不必自己搭建列表 / 表单 / 详情屏幕。
- 你希望引擎控制台遵守后端强制执行的同一套权限码，并保留按部署重映射权限码的能力。
- 你需要在自定义屏幕里以编程方式访问某个引擎的管理 API——导入包导出的 API hook 和类型，而不是手写请求信封。

如果你只需要在自己的页面里使用*可视化编辑器*（流程或表单设计面），请直接使用编辑器包——见[可视化编辑器](../editors/overview.md)。引擎页面已经替你内嵌了这些编辑器。

## 与 core 和 starter 的关系

引擎页面只是普通组件；周边的应用服务由宿主提供:

- **路由**——页面不会自己注册路由。把每个页面挂到你路由器的某条路由上。框架 playground 使用 TanStack Router 文件路由（见[路由](../guide/routing.md)）；由于页面就是一个组件，任何路由器都可以。
- **AppContext**——权限门控从 `useAppContext()`（`@vef-framework-react/core`）读取 `hasPermission`。未提供 `hasPermission` 时，标签页式控制台把所有权限视为已授予；按钮级门控遵循 [`PermissionGate`](../components/permission-gate.md) 的语义。
- **ApiClient**——所有数据访问都经由应用配置好的 API 客户端，因此认证请求头、错误提示与 TanStack Query 缓存的行为与应用其余部分完全一致（见[数据获取](../guide/data-fetching.md)）。
- **后端强制执行**——客户端门控只是隐藏操作入口。列表查询本身在服务端鉴权；没有该引擎 `query` 权限码的用户进入页面时，看到的是后端的权限错误，而不是一个以假乱真的空列表。

## 挂载页面

playground 把每个页面挂在各自的文件路由上。改写到宿主应用后，一个审批分区大致如下:

```tsx
// routes/approval/route.tsx — one provider wraps every approval route.
import type { ApprovalPlugins } from "@vef-framework-react/approval";

import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ApprovalProvider } from "@vef-framework-react/approval";

import { DepartmentPicker, RolePicker, UserPicker } from "../../components/org-pickers";

// Wire the host's organization pickers once; every approval page resolves
// them from context.
const APPROVAL_PLUGINS: ApprovalPlugins = {
  pickers: {
    user: UserPicker,
    role: RolePicker,
    department: DepartmentPicker
  }
};

export const Route = createFileRoute("/_layout/approval")({
  component: () => (
    <ApprovalProvider plugins={APPROVAL_PLUGINS}>
      <Outlet />
    </ApprovalProvider>
  )
});
```

```tsx
// routes/approval/task-center/route.tsx — a page is the whole screen.
import type { ReactNode } from "react";

import { createFileRoute } from "@tanstack/react-router";
import { ApprovalTaskCenterPage } from "@vef-framework-react/approval";

export const Route = createFileRoute("/_layout/approval/task-center")({
  component: (): ReactNode => <ApprovalTaskCenterPage />
});
```

集成与 cron 页面没有 provider 要求——直接挂载即可:

```tsx
// routes/sys/integration-console/route.tsx
import { createFileRoute } from "@tanstack/react-router";
import { IntegrationConsolePage } from "@vef-framework-react/integration";

export const Route = createFileRoute("/_layout/sys/integration-console")({
  component: () => <IntegrationConsolePage />
});
```

playground 的参考路径: 审批页面位于 `/approval/*`（`task-center`、`my-instances`、`initiate`、`category`、`flow`、`delegation`、`admin`），集成页面位于 `/sys/integration-*`（`contract`、`system`、`adapter`、`route`、`code-map`、`console`）。cron 页面尚未接入 playground；以同样的方式挂载即可，例如 `/sys/cron-schedule` 和 `/sys/cron-run`。

## 覆盖权限码

每个管理页面都接受一个 `permissions` prop，与包默认值合并，因此重划权限码命名空间的部署无需 fork 页面即可完成重映射:

```tsx
import { ApprovalCategoryPage, APPROVAL_PERMISSIONS } from "@vef-framework-react/approval";

// Default codes: APPROVAL_PERMISSIONS.category.{query,create,update,delete}
<ApprovalCategoryPage
  permissions={{
    create: "oa.approval.category.manage",
    update: "oa.approval.category.manage",
    delete: "oa.approval.category.manage"
  }}
/>;
```

自助审批页面（任务中心、我的实例、发起）在设计上**不带**任何权限门控——后端 `approval/my` 资源把每个操作都限定在当前用户范围内，且不声明任何权限码。

## 安装

每个包都单独安装，与你已在使用的框架包并存:

```bash
pnpm add @vef-framework-react/approval    # approval engine console (also pulls the editors)
pnpm add @vef-framework-react/integration # integration engine console
pnpm add @vef-framework-react/cron        # durable cron console
```

`@vef-framework-react/approval` 依赖 `approval-flow-editor`、`form-editor` 和 `approval-form-bridge`——它的设计器内嵌了这些编辑器，并重新导出选择器契约类型（`EditorPlugins`、`PickerProps`、`PrincipalKind`），因此宿主只从这一个包就能完成全部接线。

## 接下来

- [审批——概览](./approval/overview.md) · [页面](./approval/pages.md) · [API 参考](./approval/reference.md)
- [集成——概览](./integration/overview.md) · [页面](./integration/pages.md) · [API 参考](./integration/reference.md)
- [Cron——概览](./cron/overview.md) · [API 参考](./cron/reference.md)
