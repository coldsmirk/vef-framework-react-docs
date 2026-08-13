---
title: Cron API 参考
description: "@vef-framework-react/cron 每一个导出的详尽参考——权限、调度与运行 API、表单模型辅助函数、触发器编辑器与 wire 类型。"
---

# Cron API 参考

`@vef-framework-react/cron` 从包根部导出的全部内容，按源码分组: [权限](#权限)、[API hooks](#api-hooks)、[页面辅助与表单模型](#页面辅助与表单模型)、[组件](#组件)与[类型](#类型)。两个页面组件及其 props 见[概览](./overview.md#页面)。

`QueryFunction<TData, TParams>` / `MutationFunction<TData, TParams>` 是框架在 `@vef-framework-react/core` 中带 key 的函数形态；`PaginatedQueryParams<TSearch>` 是 `@vef-framework-react/components` 的 ProTable 查询形态；`ApiResult<T>` 是标准响应信封。

## 权限

### `CRON_PERMISSIONS`

`const`——持久化 cron 存储管理 API 的权限码，逐字镜像后端的 `RequiredPermission` 字符串。所有调度变更（create / update / delete / pause / resume / trigger_now）共享单一的 `manage` 权限码——没有按操作细分的码。见[权限](../../guide/permissions.md)。

| Group.key | 权限码 | 门控内容 |
| --- | --- | --- |
| `schedule.query` | `cron.schedule.query` | 调度列表、详情、任务名列表、触发预览 |
| `schedule.manage` | `cron.schedule.manage` | 创建、更新（含重命名）、删除、暂停、恢复、立即执行 |
| `run.query` | `cron.run.query` | 运行记录列表与单条运行查询 |

类型导出: `CronPermissions`（`typeof CRON_PERMISSIONS`）、`SchedulePermissionCodes`（`CronPermissions["schedule"]`）、`RunPermissionCodes`（`CronPermissions["run"]`）。

## API hooks

### 查询基础设施

| 导出 | 签名 | 说明 |
| --- | --- | --- |
| `API_PATH` | `const "/api"` | 每个管理调用 POST 的框架 RPC 端点。 |
| `splitQueryParams` | `<TSearch extends AnyObject>(queryParams: PaginatedQueryParams<TSearch>) => { params: Omit<PaginatedQueryParams<TSearch>, typeof SYMBOL_PAGINATION>; pagination: PaginationParams \| undefined }` | 把 ProTable 的 symbol 键查询参数拆分为普通搜索参数与分页元数据。排序 symbol 留在 `params` 上；JSON 序列化会丢弃它。 |

### `useScheduleApi`

`() => ScheduleApi`——持久化调度存储（`sys/cron/schedule`）的查询与变更函数。以 `name` 寻址（没有按 id 的删除，也没有批量删除），每个变更在后端共享单一的 `cron.schedule.manage` 权限。

| 函数 | 类型 | 操作 |
| --- | --- | --- |
| `findPage` | `QueryFunction<PaginationResult<Schedule>, PaginatedQueryParams<ScheduleSearch>>` | `find_page`——把框架下拉的 `isEnabled` 开关字符串（`"true"` / `"false"`）转换为 wire eq 过滤器期望的真布尔值（未设置时丢弃） |
| `get` | `QueryFunction<ScheduleDetail, ScheduleNameParams>` | `get`——调度本身加下次触发时间预览 |
| `listJobs` | `QueryFunction<string[]>` | `list_jobs`——应答节点上已注册的任务名（唯一合法的 `jobName` 取值） |
| `previewFires` | `QueryFunction<PreviewFiresResult, PreviewFiresParams>` | `preview_fires`——校验与保存完全一致，无效表达式以业务错误返回 |
| `create` | `MutationFunction<ApiResult<unknown>, ScheduleParams>` | `create` |
| `update` | `MutationFunction<ApiResult<unknown>, ScheduleParams>` | `update`——可选的 `newName` 执行重命名 |
| `remove` | `MutationFunction<ApiResult<unknown>, ScheduleNameParams>` | `delete`——发送 `{ name }` |
| `pause` | `MutationFunction<ApiResult<unknown>, ScheduleNameParams>` | `pause` |
| `resume` | `MutationFunction<ApiResult<unknown>, ScheduleNameParams>` | `resume` |
| `triggerNow` | `MutationFunction<ApiResult<unknown>, ScheduleNameParams>` | `trigger_now`——经正常认领流程触发一次执行 |

### `useRunApi`

`() => RunApi`——运行记录（`sys/cron/run`）的只读查询函数。详情视图通过 `find_one` 重新拉取完整行，因此总能展示完整、未截断的错误文本。

| 函数 | 类型 | 操作 |
| --- | --- | --- |
| `findPage` | `QueryFunction<PaginationResult<Run>, PaginatedQueryParams<RunSearch>>` | `find_page` |
| `findOne` | `QueryFunction<Run, RunIdParams>` | `find_one` |

## 页面辅助与表单模型

对外导出，宿主可以按完全相同的语义重建或扩展调度表单。

### `ScheduleFormValues`

调度表单的值。触发器以编辑器的值+单位形态持有，超时以值+单位对持有，`params` 以原始 JSON 文本持有——提交时全部折叠为 API 模型。`originalName` 是编辑时捕获的寻址名称，改动过的 `name` 因此会变成一次重命名（`newName`）。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `string?` | 行 id（编辑时存在）。 |
| `originalName` | `string?` | 编辑时捕获的寻址名称。 |
| `name` | `string` | 唯一的调度名称；编辑它即重命名。 |
| `jobName` | `string` | 已注册的任务处理器。 |
| `trigger` | `TriggerFormValues` | 编辑器形态的触发器。 |
| `startsAt` / `endsAt` | `string` | 生效窗口（留空 = 该侧无界）。 |
| `misfirePolicy` | `MisfirePolicy` | `fire_now` / `skip`。 |
| `concurrencyPolicy` | `ConcurrencyPolicy` | `forbid` / `allow`。 |
| `recover` | `boolean` | 节点崩溃后重新触发（仅限幂等处理器）。 |
| `timeoutValue` / `timeoutUnit` | `number` / `string` | 以值+单位表示的按次运行超时（0 = 全局默认）。 |
| `paramsText` | `string` | 参数 JSON 文本。 |
| `enabled` | `boolean` | 启用状态。 |

### 表单模型函数

| 导出 | 签名 | 说明 |
| --- | --- | --- |
| `SCHEDULE_FORM_DEFAULTS` | `const ScheduleFormValues` | 新建调度的默认值（`cron` 触发器、`fire_now`、`forbid`、不恢复、零超时、启用）。 |
| `scheduleToFormValues` | `(row: Schedule) => ScheduleFormValues` | 把已保存的调度投影为可编辑的表单值（把 `timeoutMs` / `everyMs` 拆分为最易读的值+单位）。 |
| `scheduleToParams` | `(values: ScheduleFormValues) => ScheduleParams` | 把表单值转换为 API 参数: 以 `originalName` 寻址、经 `newName` 重命名，并折叠触发器、超时与参数。 |
| `parseJsonParams` | `(text: string) => JsonParamsResult` | 把参数文本框解析为 JSON 对象。空文本合法且完全省略参数；任何不是 JSON 对象的内容都被拒绝。 |
| `jsonParamsError` | `(text: string) => string \| undefined` | `parseJsonParams` 的字段校验器形态: 无效时给出错误消息，有效时为 `undefined`。 |
| `JsonParamsResult` | `{ ok: true; value?: JsonObject } \| { ok: false; error: string }` | 解析参数文本框的结果。 |
| `TIMEOUT_UNIT_OPTIONS` | `Array<{ label: string; value: string }>` | 由 `TIMEOUT_UNITS` 派生的下拉选项。 |
| `useScheduleFormMutations` | `() => { create: MutationFunction<ApiResult<unknown>, ScheduleFormValues>; update: MutationFunction<ApiResult<unknown>, ScheduleFormValues> }` | 提交前把调度表单折叠为 API 参数（经 `scheduleToParams`）的表单变更——可直接插入 `CrudPage.formMutationFns`。 |
| `useJobNames` | `() => { options: Array<{ label: string; value: string }>; loading: boolean }` | 已注册任务名的下拉选项（来自 `list_jobs`）。 |
| `ScheduleSceneValues` | `CrudBasicSceneFormValues<ScheduleFormValues, ScheduleFormValues>` | 创建与更新共享调度表单形态。 |

## 组件

### `TriggerEditor`

Props 以 `TriggerEditorProps` 导出。触发器编辑器: 一个类型切换（cron / interval / once），展开类型专属字段——cron 表达式 + 时区、间隔值 + 单位，或日期时间选择器——外加经 `preview_fires`、防抖（400 ms）的下次触发时间实时预览。预览对无效表达式内联渲染错误，生效窗口内没有触发时间时渲染空状态。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `TriggerFormValues` | — | 编辑器形态的触发器。 |
| `onChange` | `(value: TriggerFormValues) => void` | — | 每次编辑触发。 |
| `startsAt` | `string?` | — | 调度的生效窗口起点，回传进触发预览。 |
| `endsAt` | `string?` | — | 调度的生效窗口终点，回传进触发预览。 |

### 触发器辅助函数

| 导出 | 签名 | 说明 |
| --- | --- | --- |
| `TriggerFields` | `Pick<Schedule, "kind" \| "expr" \| "timezone" \| "everyMs" \| "fireAt">` | 调度行中描述其触发器的子集。 |
| `TriggerFormValues` | `{ kind: TriggerKind; expr: string; timezone: string; intervalValue: number; intervalUnit: string; at: string }` | 编辑器面向 UI 的值；间隔是值+单位对，提交时转换为 `everyMs`。 |
| `DEFAULT_TRIGGER` | `const TriggerFormValues` | 一个全新触发器: `cron` 类型、空表达式，并预填了一分钟一次的间隔，供用户切换类型时使用。 |
| `triggerToFormValues` | `(schedule: TriggerFields) => TriggerFormValues` | 把已保存的触发器投影为编辑器值。 |
| `triggerFormToParams` | `(trigger: TriggerFormValues) => TriggerParams` | 把编辑器值转换为 wire 参数，只保留所选类型需要的字段。 |
| `isTriggerComplete` | `(trigger: TriggerFormValues) => boolean` | 触发器是否已填到可以预览的程度: 有 cron 表达式、间隔不低于 1000 ms 下限，或选定了单次时间。 |
| `formatTriggerSummary` | `(schedule: TriggerFields) => string` | 调度行的一行式人性化触发摘要: cron 表达式（带时区）、间隔频率，或单次触发时间。 |

### 时长工具

`DurationUnit`——`{ label: string; value: string; ms: number }`，一个可选的时间单位及其毫秒大小。

| 导出 | 签名 | 说明 |
| --- | --- | --- |
| `INTERVAL_UNITS` | `DurationUnit[]` | 固定频率间隔触发器（`everyMs`）的单位: 秒 / 分钟 / 小时 / 天。 |
| `TIMEOUT_UNITS` | `DurationUnit[]` | 按次运行超时（`timeoutMs`）的单位: 毫秒 / 秒 / 分钟。 |
| `combineDurationMs` | `(value: number, unit: string, units: DurationUnit[]) => number` | 把以 `unit` 表示的值合成毫秒。数值会先取整为整数；未知单位回退为第一个（最小）单位；负值收敛为零。 |
| `splitDurationMs` | `(ms: number, units: DurationUnit[]) => { value: number; unit: string }` | 把毫秒拆分为能整除它的最粗单位，已保存的 `everyMs`/`timeoutMs` 因此能往返为最易读的值+单位。零映射为最小单位、值为零；无法被任何单位整除时回退到最小单位。 |

### 状态与格式化

| 导出 | 签名 | 说明 |
| --- | --- | --- |
| `RunStatusBadge` | `({ status: RunStatus }) => JSX.Element` | 把一次运行的生命周期状态渲染为彩色标签。 |
| `EnabledTag` | `({ enabled: boolean }) => JSX.Element` | 启用 / 停用，成功/中性标签。 |
| `RUN_STATUS_COLORS` | `Record<RunStatus, string>` | 每个运行状态的 antd Tag 颜色 token。 |
| `RUN_STATUS_LABELS` / `RUN_STATUS_OPTIONS` | `Record<RunStatus, string>` / 选项数组 | 文案与现成的下拉选项。 |
| `TRIGGER_KIND_LABELS` / `TRIGGER_KIND_OPTIONS` | `Record<TriggerKind, string>` / 选项数组 | 触发类型的文案与选项。 |
| `MISFIRE_POLICY_LABELS` / `MISFIRE_POLICY_OPTIONS` | `Record<MisfirePolicy, string>` / 选项数组 | 错过策略的文案与选项。 |
| `CONCURRENCY_POLICY_LABELS` / `CONCURRENCY_POLICY_OPTIONS` | `Record<ConcurrencyPolicy, string>` / 选项数组 | 并发策略的文案与选项。 |
| `formatTimestamp` | `(value?: string \| null) => string` | 格式化无时区的本地墙钟时间戳（`YYYY-MM-DD HH:mm:ss`），为空时渲染破折号。 |
| `formatDuration` | `(ms?: number \| null) => string` | 人性化运行时长: 不足一秒保持 `ms`，一分钟内变为 `s`，更长变为 `min`；缺失/为零渲染破折号。 |

### `RunDetailDrawer`

运行详情抽屉，单独导出。它通过 `find_one` 重新拉取完整行，因此总能展示完整、未截断的错误文本。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `runId` | `string \| null` | — | 要展示的运行；`null` 保持抽屉关闭。 |
| `onClose` | `() => void` | — | 关闭处理函数。 |

## 类型

### 基础与 JSON

| 类型 | 结构 | 说明 |
| --- | --- | --- |
| `CreationAudited` | `{ id: string; createdAt?: string; createdBy?: string }` | 镜像 `orm.CreationAuditedModel`。 |
| `FullAudited` | `CreationAudited & { updatedAt?: string; updatedBy?: string }` | 镜像 `orm.FullAuditedModel`。 |
| `JsonValue` | `string \| number \| boolean \| null \| JsonValue[] \| { [key: string]: JsonValue }` | — |
| `JsonObject` | `Record<string, JsonValue>` | 调度不透明 `params` 载荷所用的对象形态——在 Go 侧原样传递给任务处理器。 |

### 枚举

每个都逐字镜像一个 Go 枚举；显示文案与颜色在展示组件里。

| 导出 | 值 | 说明 |
| --- | --- | --- |
| `TRIGGER_KINDS` / `TriggerKind` | `"cron" \| "interval" \| "once"` | 调度如何计算触发时间。 |
| `MISFIRE_POLICIES` / `MisfirePolicy` | `"fire_now" \| "skip"` | 如何处理节点宕机或调度暂停期间错过的触发: `fire_now` 立即把空档补跑一次，`skip` 直接丢弃。 |
| `CONCURRENCY_POLICIES` / `ConcurrencyPolicy` | `"forbid" \| "allow"` | 上一次运行仍在进行时是否允许开始新一次: `forbid` 跳过重叠，`allow` 并行运行。 |
| `RUN_STATUSES` / `RunStatus` | `"running" \| "succeeded" \| "failed" \| "missed" \| "skipped" \| "abandoned" \| "canceled"` | 一条运行记录的生命周期状态。 |

### 调度

`Schedule`——`sys/cron/schedule` 中的一行持久化调度（继承 `FullAudited`）。时间戳是无时区的本地墙钟字符串（`YYYY-MM-DD HH:mm:ss`）:

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `name` | `string` | 唯一的寻址名称。 |
| `jobName` | `string` | 已注册的任务处理器。 |
| `kind` | `TriggerKind` | 触发类型。 |
| `expr` | `string` | Cron 表达式（非 cron 类型为空）。 |
| `timezone` | `string` | Cron 时区（空 = 服务器时区）。 |
| `everyMs` | `number` | 间隔频率（非 interval 类型为 0）。 |
| `fireAt` | `string?` | `once` 的触发时间。 |
| `startsAt` / `endsAt` | `string?` | 生效窗口。 |
| `params` | `JsonObject?` | 不透明的处理器载荷。 |
| `misfirePolicy` | `MisfirePolicy` | 错过触发的策略。 |
| `concurrencyPolicy` | `ConcurrencyPolicy` | 重叠策略。 |
| `recover` | `boolean` | 节点崩溃后重新触发。 |
| `timeoutMs` | `number` | 按次运行超时（0 = 全局默认）。 |
| `isEnabled` | `boolean` | 为 `false` 时即暂停。 |
| `nextFireAt` | `string?` | 触发游标。已暂停的调度会保留它，以便恢复时结算暂停造成的空档——列表因此在暂停期间隐藏它，因为它不会在那个时间触发。 |
| `lastFireAt` | `string?` | 上次触发时间。 |

| 类型 | 字段 | 说明 |
| --- | --- | --- |
| `TriggerParams` | `kind: TriggerKind`、`expr?: string`、`timezone?: string`、`everyMs?: number`、`at?: string` | 随保存提交的触发器定义。只填充所选类型需要的字段: `cron` → `expr`（+ 可选 `timezone`），`interval` → `everyMs`（固定频率，最小 1000），`once` → `at`。 |
| `ScheduleParams` | `name: string`、`newName?: string`、`jobName: string`、`trigger: TriggerParams`、`params?: JsonObject`、`startsAt?`、`endsAt?`（`string`）、`misfirePolicy?: MisfirePolicy`、`concurrencyPolicy?: ConcurrencyPolicy`、`recover?: boolean`、`timeoutMs?: number`、`enabled?: boolean` | 创建/更新载荷。以 `name` 寻址；更新时可选的 `newName` 重命名调度。 |
| `ScheduleSearch` | `name?`、`jobName?`（`string`）、`kind?: TriggerKind`、`isEnabled?: string` | `isEnabled` 是 `"true"` / `"false"` 的开关**字符串**——框架下拉的值是字符串——由 `findPage` 转换为 wire eq 过滤器期望的布尔值。 |
| `ScheduleNameParams` | `name: string` | 按名称寻址的操作（get / delete / pause / resume / trigger_now）的载荷。 |
| `ScheduleDetail` | `schedule: Schedule`、`nextFires: string[]` | `get` 的结果；调度已暂停或已耗尽时 `nextFires` 为空。 |
| `PreviewFiresParams` | `trigger: TriggerParams`、`startsAt?: string`、`endsAt?: string` | 触发器的校验与保存完全一致，无效表达式以业务错误返回。 |
| `PreviewFiresResult` | `nextFires: string[]` | 生效窗口内的下一批触发时间。 |

### 运行记录

`Run`——`sys/cron/run` 中的一条运行记录（继承 `CreationAudited`）。只读:

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `scheduleId` | `string` | 所属调度的 id。 |
| `scheduleName` | `string` | 所属调度的名称。 |
| `jobName` | `string` | 实际运行的处理器。 |
| `scheduledAt` | `string` | 本次触发的计划时间。 |
| `status` | `RunStatus` | 生命周期状态。 |
| `nodeId` | `string` | 认领本次运行的集群节点。 |
| `startedAt` / `finishedAt` | `string?` | 实际执行边界。 |
| `durationMs` | `number` | 执行时长。 |
| `heartbeatAt` | `string?` | 运行期间的最后一次心跳。 |
| `error` | `string?` | 失败文本（完整文本经 `find_one` 获取）。 |
| `missedCount` | `number?` | 对 `missed` 的运行: 被丢弃的触发次数。 |

| 类型 | 字段 | 说明 |
| --- | --- | --- |
| `RunSearch` | `scheduleName?`、`jobName?`（`string`）、`status?: RunStatus`、`nodeId?: string`、`scheduledAtFrom?: string`、`scheduledAtTo?: string` | `scheduledAt*` 字段为计划时间设界（gte / lte）。 |
| `RunIdParams` | `id: string` | 单条运行查询（`find_one`）的寻址载荷。 |

页面 prop 类型（`CronSchedulePageProps`、`CronRunPageProps`、`RunDetailDrawerProps`）与各自组件一同导出——页面表格见[概览](./overview.md#页面)。
