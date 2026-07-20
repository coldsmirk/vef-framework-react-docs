---
title: Cron 包概览
description: "@vef-framework-react/cron 提供什么——VEF 服务端持久化定时调度存储及其运行记录的管理页面。"
---

# Cron 包概览

`@vef-framework-react/cron`（v2.10.0）是 VEF 服务端**持久化 cron 存储**的前端控制台: 调度存放在数据库而不是代码里，能在重启后存活、在集群中恰好一个节点上触发，并把每次运行记入流水。该包提供两个页面——调度管理与只读的运行记录——以及它们背后的 API hook 与构件。

:::caution 未发布的包
该包于 2026‑07‑19、v2.12.0 打 tag 之后加入，将随**下一个**框架版本发布。它尚未接入 playground。
:::

## 何时使用

- 你的 VEF 服务端注册了 cron 任务处理器，你希望操作员从 UI（而不是配置文件）创建、暂停、触发与审计调度。
- 你在构建与调度相邻的屏幕，需要有类型的 API（`useScheduleApi`、`useRunApi`）、带触发实时预览的 [`TriggerEditor`](./reference.md#triggereditor)，或时长/格式化辅助函数。

## 概念

**调度（schedule）**是一个具名的、持久化的触发器，绑定到一个已注册的**任务处理器**（`jobName`——只有应答节点注册过的名字才合法，由 `list_jobs` 提供）。它的触发器是三种类型之一:

| 类型 | 字段 | 触发时机 |
| --- | --- | --- |
| `cron` | `expr`（5 或 6 段 cron 表达式，或 `@daily` 风格的描述符）+ 可选的 `timezone` | 在表达式的墙钟时间点 |
| `interval` | `everyMs`（固定频率，最小 1000 ms） | 按固定频率 |
| `once` | `at`（一个日期时间） | 仅一次 |

在触发器之外，调度还携带可选的生效窗口（`startsAt` / `endsAt`）、一个原样传给处理器的不透明 JSON `params` 对象、一个**错过策略**（misfire policy: `fire_now` 把节点宕机或调度暂停期间错过的触发立即补跑一次；`skip` 直接丢弃）、一个**并发策略**（`forbid` 在上一次运行仍在进行时跳过本次触发；`allow` 允许并行运行）、一个 `recover` 标志（节点崩溃后重新触发——处理器必须幂等），以及按次运行的 `timeoutMs`（0 = 全局默认）。

每次触发都会在运行记录（`sys/cron/run`）中产生一条**运行（run）**: 哪个节点认领了它、计划/开始/结束时间、状态（`running` / `succeeded` / `failed` / `missed` / `skipped` / `abandoned` / `canceled`）、心跳、时长、错误文本，以及——对 `missed` 而言——被丢弃的触发次数。

wire 上的所有时间戳都是无时区的本地墙钟字符串（`YYYY-MM-DD HH:mm:ss`）。

## 页面

两个页面都是全页组件；直接挂载（无需 provider）。端点写作面向框架 RPC 端点 `/api` 的 `resource.operation`。

### `CronSchedulePage`

调度存储的全页管理，构建在 `CrudPage` 之上（见 [Crud](../../components/crud.md)）。调度**按名称寻址**——没有按 id 的删除，也没有批量删除/行选择；重命名在更新时经 `newName` 完成（表单会捕获原名称，把改动过的名称自动转为重命名）。

列表展示名称、任务处理器、触发类型、人性化的触发摘要（`0 9 * * *（Asia/Shanghai）`、`每 5 分钟`、`单次 · …`）、启用状态，以及下次/上次触发时间。**已暂停的调度在 下次触发 一栏显示破折号**: 它在内部保留触发游标，以便恢复时结算暂停造成的空档，但它不会在那个时间触发——展示它会被误读成一次排定却永不发生的运行（`ccef94e`）。

筛选分为**基础**内联字段（名称）与**高级**展开面板（来自 `list_jobs` 的任务处理器、触发类型、启用状态）——提交 `c8d5dc0`。

抽屉表单（响应式: `100vw` → `80vw` → 680px）编辑名称（附重命名提示）、任务处理器下拉、经 [`TriggerEditor`](./reference.md#triggereditor) 编辑的触发器——带防抖的**下次触发时间实时预览**（`preview_fires`，校验与保存完全一致，错误内联呈现）——生效窗口、带逐值提示的错过/并发策略、崩溃恢复、以值+单位对编辑的超时、以 JSON 文本编辑的参数（校验为 JSON 对象；留空则省略 params），以及启用开关。

行操作: 编辑、暂停/恢复（按当前状态）、立即执行（需确认——经正常认领流程触发一次执行）、删除（需确认——调度停止触发；历史运行记录保留）。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `permissions` | `Partial<SchedulePermissionCodes>` | `CRON_PERMISSIONS.schedule` | 覆盖页面用于门控其操作的权限码。 |
| `columnStorageKey` | `string` | `"cron.schedule"` | 列设置面板的存储键。 |
| `title` | `ReactNode` | — | 可选的页面标题，渲染在表格上方。 |

- **权限:** 每个变更操作（新增 / 编辑 / 暂停 / 恢复 / 立即执行 / 删除）都由单一的 `cron.schedule.manage` 权限码门控——没有按操作细分的码。列表与表单的辅助查询由服务端以 `cron.schedule.query` 强制执行。
- **端点:** `sys/cron/schedule.find_page`、`.get`、`.list_jobs`、`.preview_fires`、`.create`、`.update`、`.delete`、`.pause`、`.resume`、`.trigger_now`。

```tsx
// routes/sys/cron-schedule/route.tsx — host-app example (not yet in the playground).
import { createFileRoute } from "@tanstack/react-router";
import { CronSchedulePage } from "@vef-framework-react/cron";

export const Route = createFileRoute("/_layout/sys/cron-schedule")({
  component: () => <CronSchedulePage />
});
```

### `CronRunPage`

运行记录的全页只读浏览器。列表展示调度名称、任务处理器、状态徽标、节点、计划/开始/结束时间与时长；筛选分为基础字段（调度名称）与高级面板（任务处理器、状态、节点，以及映射到 `scheduledAtFrom` / `scheduledAtTo` gte/lte 边界的计划时间范围）。行打开详情抽屉（也可经 详情 操作），抽屉**通过 `find_one` 重新拉取完整行**，因此完整、未截断的错误文本始终可得；`missed` 的运行还会展示被丢弃的触发次数。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `columnStorageKey` | `string` | `"cron.run"` | 列设置面板的存储键。 |
| `title` | `ReactNode` | — | 可选的页面标题，渲染在表格上方。 |

- **权限:** 页面不渲染任何门控操作（它是只读的）；查询由服务端以 `cron.run.query` 强制执行。
- **端点:** `sys/cron/run.find_page`、`.find_one`。

```tsx
// routes/sys/cron-run/route.tsx
import { createFileRoute } from "@tanstack/react-router";
import { CronRunPage } from "@vef-framework-react/cron";

export const Route = createFileRoute("/_layout/sys/cron-run")({
  component: () => <CronRunPage />
});
```

`RunDetailDrawer` 单独导出（`{ runId: string | null; onClose: () => void }`），宿主仪表盘可以借此深链到一次运行。

## 包结构

由于表面积很小（两个页面），本节加上 [API 参考](./reference.md)就是全部文档——没有单独的页面文档。参考涵盖 `CRON_PERMISSIONS`、两个 API hook、表单模型辅助函数、触发器编辑器与时长/格式化工具，以及每一个 wire 类型。
