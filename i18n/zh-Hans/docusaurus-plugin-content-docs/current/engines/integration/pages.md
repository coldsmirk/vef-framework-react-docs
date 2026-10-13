---
title: 集成页面
description: "@vef-framework-react/integration 导出的每一个页面组件——它渲染什么、哪些权限对它门控、它调用哪些端点，以及如何挂载。"
---

# 集成页面

六个全页组件。不需要 provider；playground 把它们挂在 `/sys/integration-*` 下。端点写作面向框架 RPC 端点 `/api` 的 `resource.operation`。

五个 CRUD 页面共享的约定:

- 构建在 `CrudPage` 之上（见 [Crud](../../components/crud.md)）: 内联搜索、按页面 `columnStorageKey` 持久化的列设置、垂直标签的抽屉表单，以及每行的 编辑 / 删除 操作。
- 客户端门控隐藏按钮；后端对每次调用强制执行（包括列表查询，经由该领域的 `query` 权限码）。
- 每个 CRUD 页面都提供行选择与带门控的 批量删除 工具栏操作，背后是资源标准的 `find_page` / `create` / `update` / `delete` / `delete_many` 操作。

## `IntegrationContractPage`

全页的契约管理: 列表搜索拆分为**基础**内联栏（编码、名称）和可展开的**高级**面板（宿主自有**标签**）；新增/更新在宽抽屉中完成（响应式: `100vw` → `90vw` → 920px），删除支持单个 + 批量。表单编辑编码（创建后不可改）、名称、描述、宿主自有标签（内联 `LabelsEditor` 并校验）、代码编辑器中的**输入/输出 JSON Schema**（带 JSON Schema draft 2020‑12 关键字补全，弹层中附每个关键字的文档），以及启用开关。schema 编辑器校验文本必须是 JSON 对象；留空表示"该侧不校验"。仍有路由或适配器引用契约时，删除会被服务端拒绝。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `permissions` | `Partial<ContractPermissionCodes>` | `INTEGRATION_PERMISSIONS.contract` | 覆盖页面用于门控其操作的权限码。 |
| `columnStorageKey` | `string` | `"integration.contract"` | 列设置面板的存储键。 |
| `title` | `ReactNode` | — | 可选的页面标题，渲染在表格上方。 |

- **权限:** 新增契约 → `integration.contract.create` · 编辑 → `integration.contract.update` · 删除 / 批量删除 → `integration.contract.delete`；列表由 `integration.contract.query` 强制执行。
- **端点:** `integration/contract.find_page`、`.create`、`.update`、`.delete`、`.delete_many`。
- **playground 路由:** `/sys/integration-contract`。

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { IntegrationContractPage } from "@vef-framework-react/integration";

export const Route = createFileRoute("/_layout/sys/integration-contract")({
  component: () => <IntegrationContractPage />
});
```

## `IntegrationSystemPage`

全页的系统管理。抽屉表单（响应式: `100vw` → `85vw` → 760px）组织为带标题的 [`FormSection`](./reference.md#formsection) 区块，仅凭区块头部的开关就能看出一个系统具备哪些能力:

- **基础信息**——编码（创建后不可改）、名称、Base URL、调用超时、非敏感公共参数（脚本可通过 `system.params` 读取）、启用开关。
- **出站认证**——在内置出站方案（`none` / `http_basic` / `bearer` / `header` / `query` / `signature` / `script`）中选择方案，配[感知方案的参数编辑器](./overview.md#编辑器细节)；`script` 方案额外提供一个脚本编辑器，其标签带可悬停文档（`OUTBOUND_AUTH_SCRIPT_DOC`）。
- **出站信封**——可选的请求包裹与响应解包脚本，套在每次适配器 HTTP 调用外围（`ENVELOPE_REQUEST_SCRIPT_DOC` / `ENVELOPE_RESPONSE_SCRIPT_DOC`）。
- **入站回调**——入站校验方案（`none` / `ip` / `http_basic` / `bearer` / `header` / `query` / `signature` / `script`；`ip` 仅入站可用），配同样的参数编辑器与脚本文档（`INBOUND_AUTH_SCRIPT_DOC`）。
- **直连数据源**——可选的数据库直连（类型、脚本访问模式只读/读写、host/port/user/password/database/schema/path/SSL），为 `sql.*` 脚本能力供电。
- **重试策略**——声明式的出站重试（最大尝试次数、初始/最大退避）。

敏感值（密码、token、密钥、加密的键值对值）以 `******` 掩码返回；更新时保留掩码即保留已存储的密钥。每行的 测试连接 会打开 [`TestConnectionDrawer`](./reference.md#testconnectiondrawer)，探测该系统配置了的传输通道（HTTP 和/或数据库）。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `permissions` | `Partial<SystemPermissionCodes>` | `INTEGRATION_PERMISSIONS.system` | 覆盖页面用于门控其 CRUD 操作的权限码。 |
| `testConnectionPermission` | `string` | `INTEGRATION_PERMISSIONS.ops.testConnection` | 测试连接操作的权限码。 |
| `columnStorageKey` | `string` | `"integration.system"` | 列设置面板的存储键。 |
| `title` | `ReactNode` | — | 可选的页面标题，渲染在表格上方。 |

- **权限:** 新增系统 → `integration.system.create` · 编辑 → `integration.system.update` · 删除 / 批量删除 → `integration.system.delete` · 测试连接 → `integration.ops.test_connection`；列表由 `integration.system.query` 强制执行。删除系统会释放其直连数据源注册。
- **端点:** `integration/system.find_page`、`.create`、`.update`、`.delete`、`.delete_many`；`integration/ops.test_connection`。
- **playground 路由:** `/sys/integration-system`。

## `IntegrationAdapterPage`

全页的适配器管理: 按系统按契约、每个方向一条的转换脚本。列通过共享目录把系统/契约 id 解析为名称。抽屉表单（响应式: `100vw` → `90vw` → 960px）编辑所属系统与契约、方向（`outbound` / `inbound`）、可选的超时覆盖、启用开关，以及代码编辑器中的**脚本**，带方向专属的补全与可悬停文档（`adapterScriptDoc(direction)`）——出站脚本可见 `input` / `system` / `http` / `sql` / `codes` / `errors` 加引擎基线；入站脚本可见 `request` / `system` / `dispatch` / `codes` 加基线（刻意不提供 `http` / `sql`）。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `permissions` | `Partial<AdapterPermissionCodes>` | `INTEGRATION_PERMISSIONS.adapter` | 覆盖页面用于门控其操作的权限码。 |
| `columnStorageKey` | `string` | `"integration.adapter"` | 列设置面板的存储键。 |
| `title` | `ReactNode` | — | 可选的页面标题，渲染在表格上方。 |

- **权限:** 新增适配器 → `integration.adapter.create` · 编辑 → `integration.adapter.update` · 删除 / 批量删除 → `integration.adapter.delete`；列表由 `integration.adapter.query` 强制执行。
- **端点:** `integration/adapter.find_page`、`.create`、`.update`、`.delete`、`.delete_many`；`integration/system.find_all` 与 `integration/contract.find_all`（目录）。
- **playground 路由:** `/sys/integration-adapter`。

## `IntegrationRoutePage`

全页的路由管理: 把路由键映射到为契约提供服务的系统。紧凑的抽屉表单（`100vw` → 480px）编辑路由键（留空 = 默认路由，未指定键的调用命中它）、契约范围（指定契约，或留空 = 所有契约——同一路由键下精确契约匹配优先于通配）、目标系统与启用开关。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `permissions` | `Partial<RoutePermissionCodes>` | `INTEGRATION_PERMISSIONS.route` | 覆盖页面用于门控其操作的权限码。 |
| `columnStorageKey` | `string` | `"integration.route"` | 列设置面板的存储键。 |
| `title` | `ReactNode` | — | 可选的页面标题，渲染在表格上方。 |

- **权限:** 新增路由 → `integration.route.create` · 编辑 → `integration.route.update` · 删除 / 批量删除 → `integration.route.delete`；列表由 `integration.route.query` 强制执行。
- **端点:** `integration/route.find_page`、`.create`、`.update`、`.delete`、`.delete_many`；目录同上。
- **playground 路由:** `/sys/integration-route`。

## `IntegrationCodeMapPage`

全页的[码集](../../guide/code-sets.md)映射管理: 按系统在宿主标准编码与外部系统编码之间做双向值转换。抽屉表单（`100vw` → 760px）编辑:

- **所属系统**（创建后不可改）与**码集标识**。创建时，若宿主注册了可枚举目录（后端的 `mold.CodeSetInspector`），标识从目录（`integration/code_set.list_code_sets`）中挑选并自动填充码表名称；目录报告 `supported: false` 时——或编辑时——回退为带校验的自由文本输入（首尾为字母/数字、中间可含 `_ . -`、不超过 128 字符）。适配器脚本以 `codes.toExternal('<codeSet>', …)` 引用该码表。
- **映射条目**，在可编辑表格中: 每侧持有一个主值和任意数量的别名（以标签形式录入）。别名只参与匹配；转换始终输出对侧的主值。值保留其 JSON 类型（`1` 是数字，`"1"` 是按字面带引号的字符串）——查找按归一化后的字符串形式比较。宿主目录支持时，主值单元格会提示宿主标准码，同时参考行会列出所选码集的标准码（带文案）。
- **未收录策略**——`reject`（失败即拒，默认）、`passthrough`（原样返回输入）或 `fallback`（返回按侧配置的兜底值，选中时必填）。脚本可用 `{ fallback: … }` / `{ passthrough: true }` / `{ reject: true }` 按调用覆盖。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `permissions` | `Partial<CodeMapPermissionCodes>` | `INTEGRATION_PERMISSIONS.codeMap` | 覆盖页面用于门控其操作的权限码。 |
| `columnStorageKey` | `string` | `"integration.code_map"` | 列设置面板的存储键。 |
| `title` | `ReactNode` | — | 可选的页面标题，渲染在表格上方。 |

- **权限:** 新增码表 → `integration.code_map.create` · 编辑 → `integration.code_map.update` · 删除 / 批量删除 → `integration.code_map.delete`；列表与目录查询由 `integration.code_map.query` 强制执行。删除码表后，引用它的适配器脚本表现得像它从未被配置过。
- **端点:** `integration/code_map.find_page`、`.create`、`.update`、`.delete`、`.delete_many`；`integration/code_set.list_code_sets`、`.list_codes`；`integration/system.find_all`（目录）。
- **playground 路由:** `/sys/integration-code-map`。

## `IntegrationConsolePage`

运维控制台，标签页式，每个标签页由各自的权限门控，调用者缺少权限时隐藏（一个标签页都没有时渲染 403 结果）:

| 标签页 | 内容 | 门控 |
| --- | --- | --- |
| 脚本调试台 | 试运行工作台（见下文） | 调用者持有任一试运行码即显示；运行按钮按方向门控 |
| 路由诊断 | 按需的路由诊断: 运行后按类别分组阅读发现（悬空适配器、通配缺口、系统/契约已停用、契约未覆盖） | `integration.ops.diagnose_routes` |
| 调用日志 | 调用日志列表（时间、系统、契约、方向、结果、耗时、请求 id），带系统/契约/方向/失败类别筛选；行打开详情抽屉，含输入/输出 JSON、高亮的报文追踪、错误，以及重放面板（见下文） | `integration.log.query`；重放还需要 `integration.log.replay` |
| 运行统计 | 进程启动以来每个（系统, 契约, 方向）元组的按节点聚合: 调用数、成功数、按类别的失败分布、平均/最大耗时、最近错误——带刷新按钮 | `integration.log.query`（`statsView` 覆盖项） |

**试运行工作台**是一个请求 → 结果的分栏（并排，窄时堆叠；两半各自内部滚动）:

- 方向切换——*出站*会真实调用外部系统，但既不写入统计也不写入调用日志；*入站*为业务处理器打桩（`dispatch` 原样回显样例输出），什么都不记录。
- 目标系统 + 契约下拉（来自目录），以及带该方向补全与可悬停文档的脚本编辑器。**脚本留空则运行已保存的适配器脚本**——复现生产事故最快的方式。
- 出站输入: JSON 形式的契约输入。入站输入: 一个合成的厂商请求（method、path、headers、query、原始 body）加处理器的样例输出（JSON）。
- 结果: 出站展示契约输出与报文追踪时间线（即使运行失败也会填充，因此你能看到脚本走到了哪一步）；入站展示厂商将收到的回复与脚本 dispatch 的内容——两个转换方向一次验证。失败类别标签对错误分类；系统、契约或方向一变，结果立即重置。

**重放**会按当前定义重新运行一次已记录的调用，并把结果与原始调用并排对比——状态、耗时、错误、输入与输出左右对照，下方是重放的报文追踪：

- 它需要重放数据：没有保留重放数据的条目（`replayable: false`——后端只在开启 `vef.integration.log.replay` 时保留）会显示一条提示，而不是重放按钮。
- *出站*重放以原始输入重新执行，并会真实调用外部系统，因此会先请求确认；它既不写入统计，也不写入调用日志。*入站*重放以原始请求重新执行入站脚本，跳过验签，并由业务处理器以原始结果应答，因此业务永远不会被执行两次。
- 「使用临时脚本」用未保存的脚本内容代替已保存的适配器进行重放；留空则运行已保存的脚本。
- 若契约、系统或适配器在原始调用之后被修改过，会提示结果差异可能源自这些修改。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `permissions` | `{ dryRun?, dryRunInbound?, diagnoseRoutes?, logQuery?, logReplay?, statsView? }`（均为 `string`） | `ops.dry_run`、`ops.dry_run_inbound`、`ops.diagnose_routes`、`log.query`、`log.replay`、`log.query` | 覆盖门控各控制台标签页的权限码，`logReplay` 门控日志详情中的重放操作。注意 `statsView` 默认取**日志**查询码——统计端点在 `sys/monitor` 上。 |
| `title` | `ReactNode` | — | 可选的页面标题。 |

- **端点:** `integration/ops.dry_run`、`.dry_run_inbound`、`.diagnose_routes`；`integration/log.find_page`、`.replay`；`sys/monitor.get_integration_stats`；`integration/system.find_all`、`integration/contract.find_all`（目录）。
- **playground 路由:** `/sys/integration-console`。
