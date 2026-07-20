---
title: 集成 API 参考
description: "@vef-framework-react/integration 每一个导出的详尽参考——权限、API hook、展示组件、脚本文档目录与 wire 类型。"
---

# 集成 API 参考

`@vef-framework-react/integration` 从包根部导出的全部内容，按源码分组: [权限](#权限)、[API hooks](#api-hooks)、[组件](#组件)、[脚本文档](#脚本文档)与[类型](#类型)。页面组件及其 props 见[页面](./pages.md)。

`QueryFunction<TData, TParams>` / `MutationFunction<TData, TParams>` 是框架在 `@vef-framework-react/core` 中带 key 的函数形态；`PaginatedQueryParams<TSearch>` 是 `@vef-framework-react/components` 的 ProTable 查询形态；`ApiResult<T>` 是标准响应信封。

:::info 未发布的导出
码表领域（`useCodeMapApi`、`useCodeSetApi`、`INTEGRATION_PERMISSIONS.codeMap`、`CodeMap*` / `Code*Catalog` 类型以及 `codes.*` 补全条目）在 v2.12.0 之后加入，将随下一个版本发布。其余内容在 v2.12.0 中均可用。
:::

## 权限

### `INTEGRATION_PERMISSIONS`

`const`——集成引擎管理 API 的权限码，逐字镜像后端的 `RequiredPermission` 字符串。每个页面的门控都默认取对应条目，并接受通过其 `permissions` prop 覆盖。见[权限](../../guide/permissions.md)。

| Group.key | 权限码 | 门控内容 |
| --- | --- | --- |
| `contract.query` | `integration.contract.query` | 契约列表 / 目录 |
| `contract.create` | `integration.contract.create` | 新增契约 |
| `contract.update` | `integration.contract.update` | 更新契约 |
| `contract.delete` | `integration.contract.delete` | 删除契约（含批量） |
| `system.query` | `integration.system.query` | 系统列表 / 目录 |
| `system.create` | `integration.system.create` | 新增系统 |
| `system.update` | `integration.system.update` | 更新系统 |
| `system.delete` | `integration.system.delete` | 删除系统（含批量） |
| `adapter.query` | `integration.adapter.query` | 适配器列表 |
| `adapter.create` | `integration.adapter.create` | 新增适配器 |
| `adapter.update` | `integration.adapter.update` | 更新适配器 |
| `adapter.delete` | `integration.adapter.delete` | 删除适配器（含批量） |
| `route.query` | `integration.route.query` | 路由列表 |
| `route.create` | `integration.route.create` | 新增路由 |
| `route.update` | `integration.route.update` | 更新路由 |
| `route.delete` | `integration.route.delete` | 删除路由（含批量） |
| `codeMap.query` | `integration.code_map.query` | 码表列表**以及**宿主码集目录查询（该目录只为支撑映射编辑器而存在） |
| `codeMap.create` | `integration.code_map.create` | 新增码表 |
| `codeMap.update` | `integration.code_map.update` | 更新码表 |
| `codeMap.delete` | `integration.code_map.delete` | 删除码表（含批量） |
| `log.query` | `integration.log.query` | 调用日志查询（也是控制台运行统计的默认门控） |
| `ops.dryRun` | `integration.ops.dry_run` | 出站试运行 |
| `ops.dryRunInbound` | `integration.ops.dry_run_inbound` | 入站试运行 |
| `ops.testConnection` | `integration.ops.test_connection` | 连接探测 |
| `ops.diagnoseRoutes` | `integration.ops.diagnose_routes` | 路由诊断 |

类型导出: `IntegrationPermissions`（`typeof INTEGRATION_PERMISSIONS`）以及每组一个的别名——`ContractPermissionCodes`、`SystemPermissionCodes`、`AdapterPermissionCodes`、`RoutePermissionCodes`、`CodeMapPermissionCodes`、`LogPermissionCodes`、`OpsPermissionCodes`。

## API hooks

### 查询基础设施

| 导出 | 签名 | 说明 |
| --- | --- | --- |
| `API_PATH` | `const "/api"` | 每个管理调用 POST 的框架 RPC 端点。 |
| `splitQueryParams` | `<TSearch extends AnyObject>(queryParams: PaginatedQueryParams<TSearch>) => { params: Omit<PaginatedQueryParams<TSearch>, typeof SYMBOL_PAGINATION>; pagination: PaginationParams \| undefined }` | 把 ProTable 的 symbol 键查询参数拆分为普通搜索参数与分页元数据（作为请求 meta 发送）。排序 symbol 留在 `params` 上；JSON 序列化会丢弃它。 |

### `CrudApi` 与 `createCrudApi`

```ts
interface CrudApi<TRow extends { id: string }, TParams, TSearch extends AnyObject> {
  findPage: QueryFunction<PaginationResult<TRow>, PaginatedQueryParams<TSearch>>;
  create: MutationFunction<ApiResult<unknown>, TParams>;
  update: MutationFunction<ApiResult<unknown>, TParams>;
  remove: MutationFunction<ApiResult<unknown>, TRow>;       // sends { id: row.id } to "delete"
  removeMany: MutationFunction<ApiResult<unknown>, TRow[]>; // sends { pks: [...] } to "delete_many"
}
```

一个 CRUD 资源的查询与变更函数，形态可直接插入 `CrudPage`: `findPage` 是它的 `queryFn`，`create`/`update` 是它的 `formMutationFns`，`remove`/`removeMany` 是它的删除变更函数（两者接收行对象，镜像框架的 CRUD 契约——见 [Crud](../../components/crud.md)）。

`createCrudApi<TRow, TParams, TSearch>(apiClient: ApiClient, resource: string, keyPrefix: string): CrudApi<TRow, TParams, TSearch>` 针对应用的 API 客户端构建这套函数；`keyPrefix` 为 TanStack Query 缓存键划分命名空间。对遵循同一 wire 契约的宿主自定义资源很有用。

### 资源 CRUD hook

每个都返回绑定到自身资源、经记忆化的 `CrudApi`:

| Hook | 返回 | 资源 |
| --- | --- | --- |
| `useContractApi` | `CrudApi<Contract, ContractParams, ContractSearch>` | `integration/contract` |
| `useSystemApi` | `CrudApi<System, SystemParams, SystemSearch>` | `integration/system` |
| `useAdapterApi` | `CrudApi<Adapter, AdapterParams, AdapterSearch>` | `integration/adapter` |
| `useRouteApi` | `CrudApi<Route, RouteParams, RouteSearch>` | `integration/route` |
| `useCodeMapApi` | `CrudApi<CodeMap, CodeMapParams, CodeMapSearch>` | `integration/code_map` |

### `useLogApi`

`() => LogApi`——调用日志的只读查询函数。行携带完整捕获内容，因此详情视图直接读行数据，无需单独请求。

| 函数 | 类型 | 操作 |
| --- | --- | --- |
| `findPage` | `QueryFunction<PaginationResult<InvocationLog>, PaginatedQueryParams<LogSearch>>` | `integration/log.find_page` |

### `useOpsApi`

`() => OpsApi`——集成引擎的运维动作。每个都是**变更（mutation）**，因为它们被命令式触发，且调用有真实副作用。

| 函数 | 类型 | 操作 |
| --- | --- | --- |
| `dryRun` | `MutationFunction<DryRunResult, DryRunParams>` | `integration/ops.dry_run` |
| `dryRunInbound` | `MutationFunction<InboundDryRunResult, DryRunInboundParams>` | `integration/ops.dry_run_inbound` |
| `testConnection` | `MutationFunction<ConnectionCheck, TestConnectionParams>` | `integration/ops.test_connection` |
| `diagnoseRoutes` | `MutationFunction<RouteDiagnostics, void>` | `integration/ops.diagnose_routes` |

### `useStatsApi`

`() => StatsApi`——按节点的调用统计，由 monitor 资源提供。

| 函数 | 类型 | 操作 |
| --- | --- | --- |
| `getStats` | `QueryFunction<IntegrationStatsResult>` | `sys/monitor.get_integration_stats` |

### `useCodeSetApi`

`() => CodeSetApi`——映射编辑器背后的宿主标准码目录。宿主未注册可枚举目录（`mold.CodeSetInspector`）时，两个查询都报告 `supported: false`，编辑器随之降级为自由文本输入。见[码集指南](../../guide/code-sets.md)。

| 函数 | 类型 | 操作 |
| --- | --- | --- |
| `listCodeSets` | `QueryFunction<CodeSetCatalog, object>` | `integration/code_set.list_code_sets` |
| `listCodes` | `QueryFunction<CodeCatalog, { codeSet: string }>` | `integration/code_set.list_codes` |

## 组件

每个组件的 props interface 以 `<Component>Props` 的名字导出（`AuthParamsFieldsProps`、`FormSectionProps`、`JsonViewProps`、`ParamsEditorProps`、`ScriptDocLabelProps`、`TestConnectionDrawerProps`），字段与下表完全一致。

### 目录

`Directory<T>`——一套加载好的定义，可直接用于下拉选项与 id→条目查找:

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `items` | `T[]` | 加载到的行（加载中为空）。 |
| `byId` | `Map<string, T>` | id → 条目查找。 |
| `options` | `Array<{ label: string; value: string }>` | 下拉选项，文案为 `名称（编码）`，值为 id。 |
| `loading` | `boolean` | 查询进行中。 |

| Hook | 签名 | 说明 |
| --- | --- | --- |
| `useSystemDirectory` | `() => Directory<System>` | 所有系统（`integration/system.find_all`）。 |
| `useContractDirectory` | `(search?: ContractSearch) => Directory<Contract>` | 契约（`integration/contract.find_all`），可选地按搜索条件收窄——业务侧选择器传 `{ labels: {...} }` 即可只提供为其场景打了标签的契约。请传**稳定引用**（模块常量或已记忆化的对象），不要每次渲染新建对象字面量。 |

### 认证参数编辑

`AuthParamFieldSpec`——参数集固定的认证方案中的一个专属输入:

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `name` | `string` | — | 写入认证配置 params 记录的键。 |
| `label` | `string` | — | 输入框标签。 |
| `placeholder` | `string` | — | 输入为空时展示的简明格式提示。 |
| `hint` | `string` | — | 渲染在输入框下方的辅助行。 |
| `sensitive` | `boolean` | — | 落盘加密；管理 API 以 `******` 掩码返回。渲染为密码输入框。 |
| `rows` | `number` | — | 渲染为该行数的 textarea，而非单行输入。 |
| `span` | `number` | `12` | 24 栅格中的跨度。 |

`AuthParamsSpec`——一个方案的参数如何编辑:

```ts
type AuthParamsSpec =
  | { kind: "none" }
  | { kind: "fixed"; fields: AuthParamFieldSpec[] }
  | { kind: "pairs"; label: string; hint?: string; namePlaceholder?: string; valuePlaceholder?: string };
```

| 导出 | 签名 | 说明 |
| --- | --- | --- |
| `resolveAuthParamsSpec` | `(direction: Direction, scheme: string) => AuthParamsSpec` | 从内置规格表（镜像后端的出站/入站方案注册表）解析一个方案的参数形态。后端注册的自定义方案在这里是未知的，因此保持自由键值对列表。 |
| `pruneAuthParams` | `(direction: Direction, scheme: string, params: Record<string, string>) => Record<string, string>` | 把 params 记录收敛到所选方案实际声明的内容: 固定方案只保留其声明的、非空的字段（丢弃上一个所选方案遗留的键），`none` 什么都不提交，键值对方案原样透传。 |
| `AuthParamsFields` | `(props: AuthParamsFieldsProps) => JSX.Element \| null` | 感知方案的编辑器: 固定方案渲染专属输入（任一字段敏感时附脚注），仅在参数名由用户自定义时渲染键值对列表，`none` 不渲染任何内容。 |

`AuthParamsFieldsProps`:

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `direction` | `Direction` | — | 方案属于哪个流向；决定规格词汇表。 |
| `scheme` | `string` | — | 所选方案名。 |
| `value` | `Record<string, string> \| undefined` | — | 认证配置的 params 记录。 |
| `onChange` | `(value: Record<string, string>) => void` | — | 每次编辑携带下一份记录触发。 |

### `FormSection`

一组带标题的表单字段。可选能力把自己的启用开关放在 `extra` 里、仅在启用时渲染 children，因此仅凭头部一行就能看出一条记录具备哪些能力。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `title` | `ReactNode` | — | 头部展示的区块名。 |
| `description` | `ReactNode` | — | 标题下方一行，说明该区块配置什么。 |
| `extra` | `ReactNode` | — | 头部右侧插槽——通常是启用该区块的开关。 |
| `children` | `ReactNode` | — | 主体字段（省略主体则只渲染头部）。 |

### `JsonView`

构建在[代码编辑器](../../components/code-editor.md)之上的只读、美化打印的 JSON 视图。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `JsonValue` | — | 要渲染的值（`JSON.stringify(value, null, 2)`）。 |
| `height` | `number` | `160` | 编辑器高度。 |

### `ParamsEditor`

针对 `Record<string, string>` 的键值编辑器，通过合成行 id 桥接到数组形态的 `EditableTable`。父级从外部替换 `value` 时（表单重置、载入记录）会重新同步；键为空的行会从发出的记录中丢弃。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `Record<string, string> \| null` | — | 要编辑的记录。 |
| `onChange` | `(value: Record<string, string>) => void` | — | 每次编辑触发。 |
| `nameTitle` | `string` | `"参数名"` | 键列的列头。 |
| `valueTitle` | `string` | `"参数值"` | 值列的列头。 |
| `namePlaceholder` | `string` | `nameTitle` | 键编辑器的占位符。 |
| `valuePlaceholder` | `string` | `valueTitle` | 值编辑器的占位符。 |

### `ScriptDocLabel`

带帮助图标的脚本编辑器标签: 悬停打开该界面的完整文档（契约摘要、绑定、库与函数），渲染自补全目录，因此两者永远不会各说各话。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `label` | `ReactNode` | — | 帮助图标跟随的可见标签文本。 |
| `doc` | `ScriptDoc` | — | 该脚本界面的文档——与驱动编辑器补全的是同一份目录。 |

### `TestConnectionDrawer`

探测已保存系统所配置传输通道（HTTP 与数据库）并展示各项探测结果的抽屉。HTTP 的 method/path 输入只在系统确实配置了 Base URL 时渲染；抽屉指向另一个系统时探测状态会重置。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `open` | `boolean` | — | 抽屉可见性。 |
| `system` | `System \| null` | — | 要探测的系统。 |
| `onClose` | `() => void` | — | 关闭处理函数。 |

### `WireTraceTimeline`

一次调用捕获的 HTTP 交换，渲染为时间线: 每次交换的 method + URL + 状态标签 + 耗时，附错误文本与高亮的请求/响应正文（JSON 重新缩进、XML 原样、其余纯文本）。trace 可能为 `null`（未发出任何 HTTP 调用的调用序列化为 null 切片），此时读作空状态。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `trace` | `HttpExchange[] \| null \| undefined` | — | 捕获的交换。 |

### 状态标签

| 组件 | Props | 渲染内容 |
| --- | --- | --- |
| `DirectionTag` | `{ direction: Direction }` | 流向，色相有区分（出站蓝色、入站紫色）。 |
| `EnabledTag` | `{ enabled: boolean }` | 启用 / 停用，成功/中性色。 |
| `FailureKindTag` | `{ failureKind?: FailureKind \| "" \| null }` | 无失败时渲染成功标签，否则渲染分类后的失败。 |
| `FindingKindTag` | `{ kind: RouteFindingKind }` | 路由诊断的发现类别，按严重程度着色。 |

### 文案与颜色常量

| 导出 | 类型 | 说明 |
| --- | --- | --- |
| `DIRECTION_LABELS` | `Record<Direction, string>` | 出站 / 入站。 |
| `DIRECTION_OPTIONS` | `Array<{ label: string; value: Direction }>` | 由文案派生。 |
| `FAILURE_KIND_LABELS` | `Record<FailureKind, string>` | 每种失败分类一条文案。 |
| `ROUTE_FINDING_KIND_LABELS` | `Record<RouteFindingKind, string>` | 每种发现类别一条文案。 |
| `OUTBOUND_AUTH_SCHEME_LABELS` | `Record<string, string>` | 内置出站方案的文案。 |
| `INBOUND_AUTH_SCHEME_LABELS` | `Record<string, string>` | 内置入站方案的文案。 |
| `DIRECTION_COLORS` | `Record<Direction, string>` | antd Tag 颜色 token（随主题）。 |
| `FAILURE_KIND_COLORS` | `Record<FailureKind, string>` | 按严重程度的警告/错误配色（`canceled` 为中性）。 |
| `ROUTE_FINDING_SEVERITY` | `Record<RouteFindingKind, "error" \| "warning">` | 断掉的路由是错误；缺口是警告。 |

### 格式化函数

| 导出 | 签名 | 说明 |
| --- | --- | --- |
| `formatTimestamp` | `(value?: string \| null) => string` | 把后端时间戳格式化用于展示，为空时渲染破折号。 |

## 脚本文档

`ScriptDoc`——一个脚本界面的文档: 一行契约说明，加上它可用的绑定与库。`entries` 兼作编辑器的补全目录，因此文档弹层与自动补全永远不会各说各话:

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `summary` | `string` | 脚本接收什么、其返回值意味着什么。 |
| `entries` | `CompletionEntry[]` | 该界面的绑定与库（[代码编辑器](../../components/code-editor.md)的补全形态）。 |

这些目录镜像 Go 运行时实际安装的绑定与能力库（`internal/integration/exec` + `internal/integration/auth` + JS 引擎基线），必须与后端保持步调一致:

| 导出 | 界面 | 基线之外的关键绑定 |
| --- | --- | --- |
| `adapterScriptDoc(direction: Direction): ScriptDoc` | 适配器脚本，按方向 | 出站: `input`（经 schema 校验的契约输入）、`system`、`http`、`sql`、`codes`、`errors`。入站: `request`（送达的厂商请求）、`system`、`dispatch(input)`（校验 + 运行业务处理器）、`codes`——刻意不提供 `http` / `sql`。 |
| `ENVELOPE_REQUEST_SCRIPT_DOC` | 系统信封，请求侧 | `request`（适配器的出站请求；返回改写后的请求，省略的字段保持原值）、`system`、`errors`。 |
| `ENVELOPE_RESPONSE_SCRIPT_DOC` | 系统信封，响应侧 | `response`（完成的上游响应；返回值取代 Response 对象成为调用结果）、`system`、`errors`。 |
| `OUTBOUND_AUTH_SCRIPT_DOC` | 出站认证 `script` 方案 | `request`（构建完毕的出站请求，只读）、`params`（解密后的认证参数）；返回要添加的凭证头。运行在零 IO 沙箱中。 |
| `INBOUND_AUTH_SCRIPT_DOC` | 入站认证 `script` 方案 | `request`（送达的请求）、`params`（解密后的校验参数）；返回真值即放行。零 IO 沙箱。 |

每个目录中始终存在的引擎基线: `console`（框架日志）、`crypto`（md5/sha1/sha256/sha512/sm3、`hmac`、base64/hex 编解码、`uuid`）、`cache`（进程内 TTL 缓存）、`dayjs`、`BigNumber`（bignumber.js）、`fxp`（fast-xml-parser）、`radashi`、`z`（zod）、`URL`、`URLSearchParams`。

## 类型

### 基础与 JSON

| 类型 | 结构 | 说明 |
| --- | --- | --- |
| `CreationAudited` | `{ id: string; createdAt?: string; createdBy?: string }` | 镜像 `orm.CreationAuditedModel`。 |
| `FullAudited` | `CreationAudited & { updatedAt?: string; updatedBy?: string }` | 镜像 `orm.FullAuditedModel`。 |
| `JsonValue` | `string \| number \| boolean \| null \| JsonValue[] \| { [key: string]: JsonValue }` | 类型安全的任意载荷。 |
| `JsonObject` | `Record<string, JsonValue>` | JSON 对象值。 |

### 枚举与常量

每个都逐字镜像一个 Go 枚举；显示文案与颜色在展示组件里，不在这里。

| 导出 | 值 | 说明 |
| --- | --- | --- |
| `DIRECTIONS` / `Direction` | `"outbound" \| "inbound"` | 适配器可实现的两个集成流向。 |
| `FAILURE_KINDS` / `FailureKind` | `"input_invalid" \| "output_invalid" \| "upstream" \| "transport" \| "timeout" \| "canceled" \| "script" \| "config" \| "auth" \| "handler"` | 失败调用的分类方式，贯穿日志、统计与 API 错误。 |
| `ROUTE_FINDING_KINDS` / `RouteFindingKind` | `"dangling_adapter" \| "wildcard_gap" \| "disabled_system" \| "disabled_contract" \| "uncovered_contract"` | 路由诊断的发现分类。 |
| `OUTBOUND_AUTH_SCHEMES` / `OutboundAuthScheme` | `"none" \| "http_basic" \| "bearer" \| "header" \| "query" \| "signature" \| "script"` | 内置出站认证方案。 |
| `INBOUND_AUTH_SCHEMES` / `InboundAuthScheme` | `"none" \| "ip" \| "http_basic" \| "bearer" \| "header" \| "query" \| "signature" \| "script"` | 内置入站方案；`ip` 仅入站可用——来源地址只有在接收时才可校验。 |
| `DATA_SOURCE_MODES` / `DataSourceMode` | `"read_only" \| "read_write"` | 系统数据源允许适配器脚本走多远；为空表示只读。 |
| `UNMAPPED_POLICIES` / `UnmappedPolicy` | `"reject" \| "passthrough" \| "fallback"` | 码表如何回应没有任何条目匹配的查找（reject 失败即拒，是默认值）。 |
| `MASKED_SECRET` | `"******"` | 管理 API 用来替代已存储密钥返回的占位符。更新时原样提交它即保持既有值不变。 |

### 契约

| 类型 | 字段 | 说明 |
| --- | --- | --- |
| `JsonSchema` | `JsonObject` | 一份自包含的 JSON Schema（draft 2020‑12）文档。 |
| `Contract` | 继承 `FullAudited`，加上 `code: string`、`name: string`、`description?: string \| null`、`labels?: Record<string, string> \| null`、`inputSchema?: JsonSchema \| null`、`outputSchema?: JsonSchema \| null`、`isEnabled: boolean` | 一个标准集成操作。`labels` 是宿主自有的筛选元数据；引擎只存储和筛选，从不解读。 |
| `ContractParams` | `id?: string`、`code`、`name`（`string`）、`description?: string \| null`、`labels?: Record<string, string>`、`inputSchema?: JsonSchema \| null`、`outputSchema?: JsonSchema \| null`、`isEnabled: boolean` | 创建/更新载荷；创建时 `id` 为空。 |
| `ContractSearch` | `code?`、`name?`（`string`）、`isEnabled?: boolean`、`labels?: Record<string, string>` | 标签筛选为等值匹配: 每一对都必须命中（无标签的契约永不命中）。 |

### 系统

`DataSourceConfig`——系统的数据库直连（厂商视图 / 交换表）。密码加密存储，在管理响应中以掩码返回:

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `kind` | `DbKind`（`string`） | 数据库类型，镜像 Go 的 `config.DBKind`；刻意保持宽泛，让表单的选项列表成为可选值的唯一事实源。 |
| `mode` | `DataSourceMode?` | 门控脚本写权限；为空表示只读。 |
| `host` / `user` / `password` / `database` / `schema` / `path` | `string?` | 连接字段（`path` 用于 SQLite）。 |
| `port` | `number?` | 端口。 |
| `sslMode` | `SslMode`（`string`）`?` | SSL 模式，镜像 `config.SSLMode`。 |
| `sslRootCert` | `string?` | PEM 根证书。 |

| 类型 | 字段 | 说明 |
| --- | --- | --- |
| `OutboundAuthConfig` | `scheme: string`、`params?: Record<string, string>`、`script?: string` | 以方案的敏感参数命名的值以掩码返回。`script` 携带 `script` 方案的自定义签名脚本体。 |
| `OutboundEnvelopeConfig` | `request?: string`、`response?: string` | 多数厂商 API 重复的通用 wire 结构，在系统层统一包裹一次。任一侧可为空，该方向保持原样。 |
| `InboundAuthConfig` | `scheme: string`、`params?: Record<string, string>`、`script?: string` | 校验厂商发起的调用。 |
| `RetryPolicy` | `maxAttempts: number`、`initialBackoffMs?: number`、`maxBackoffMs?: number` | 声明式的出站重试。 |
| `System` | 继承 `FullAudited`，加上 `code: string`、`name: string`、`baseUrl?: string`、`outboundAuth?: OutboundAuthConfig \| null`、`outboundEnvelope?: OutboundEnvelopeConfig \| null`、`inboundAuth?: InboundAuthConfig \| null`、`dataSource?: DataSourceConfig \| null`、`params?: Record<string, string> \| null`、`timeoutMs?: number`、`retry?: RetryPolicy \| null`、`isEnabled: boolean` | 一个外部系统实例: 它在哪里、双向各如何与之认证。 |
| `SystemParams` | 同上字段，另加 `id?: string` | 敏感值可携带 `MASKED_SECRET`，表示保持已存储的密钥不变。 |
| `SystemSearch` | `code?`、`name?`（`string`）、`isEnabled?: boolean` | — |

### 适配器

| 类型 | 字段 | 说明 |
| --- | --- | --- |
| `Adapter` | 继承 `FullAudited`，加上 `systemId: string`、`contractId: string`、`direction: Direction`、`script: string`、`timeoutMs?: number`、`isEnabled: boolean` | 一个系统到契约、单一流向的绑定。 |
| `AdapterParams` | `id?: string`、`systemId`、`contractId`（`string`）、`direction?: Direction`、`script: string`、`timeoutMs?: number`、`isEnabled: boolean` | 省略方向即为出站。 |
| `AdapterSearch` | `systemId?`、`contractId?`（`string`）、`direction?: Direction`、`isEnabled?: boolean` | — |

### 路由

| 类型 | 字段 | 说明 |
| --- | --- | --- |
| `Route` | 继承 `FullAudited`，加上 `routeKey: string`、`contractId: string`、`systemId: string`、`isEnabled: boolean` | `contractId` 为空表示规则覆盖所有契约；`routeKey` 为空即默认路由。 |
| `RouteParams` | `id?: string`、`routeKey?: string`、`contractId?: string`、`systemId: string`、`isEnabled: boolean` | — |
| `RouteSearch` | `routeKey?`、`contractId?`、`systemId?`（`string`）、`isEnabled?: boolean` | — |

### 码表与码集目录

| 类型 | 字段 | 说明 |
| --- | --- | --- |
| `CodeValue` | `string \| number \| boolean` | 码表值可持有的 JSON 标量。值端到端保留其 JSON 类型（服务端原样存储与返回）；查找按归一化后的字符串形式比较，因此 `1` 与 `"1"` 指向同一条目。 |
| `CodeMapEntry` | `canonical: CodeValue`、`external: CodeValue`、`canonicalAliases?: CodeValue[]`、`externalAliases?: CodeValue[]` | 一对双向映射。查找可命中主值或任一别名；转换始终输出对侧的主值。 |
| `CodeMap` | 继承 `FullAudited`，加上 `systemId: string`、`codeSet: string`、`name: string`、`entries?: CodeMapEntry[]`、`onUnmapped: UnmappedPolicy`、`fallbackCanonical?: CodeValue`、`fallbackExternal?: CodeValue`、`isEnabled: boolean` | 一个码集在宿主标准编码与某个外部系统编码之间的值转换。 |
| `CodeMapParams` | 同上字段，另加 `id?: string`；`onUnmapped?: UnmappedPolicy` | 省略策略即为 `reject`。 |
| `CodeMapSearch` | `systemId?`、`codeSet?`、`name?`（`string`）、`isEnabled?: boolean` | — |
| `CodeSetInfo` | `codeSet: string`、`name: string` | 宿主目录暴露的一个码集（镜像 `mold.CodeSetInfo`）。 |
| `CodeInfo` | `code: string`、`label: string` | 宿主码集内的一个码。 |
| `CodeSetCatalog` | `supported: boolean`、`codeSets?: CodeSetInfo[]` | 宿主未注册可枚举目录时为 `supported: false`——映射编辑器随之回退为自由文本输入。 |
| `CodeCatalog` | `supported: boolean`、`codes?: CodeInfo[]` | 单个码集的 `list_codes` 回复。 |

### 日志

| 类型 | 字段 | 说明 |
| --- | --- | --- |
| `HttpExchange` | `method: string`、`url: string`、`requestHeaders?: Record<string, string>`、`requestBody?: string`、`status?: number`、`responseHeaders?: Record<string, string>`、`responseBody?: string`、`durationMs: number`、`error?: string` | 适配器脚本运行期间捕获的一次 wire 交换，由调用日志与试运行追踪共用。正文与请求头值经脱敏并截断。 |
| `InvocationLog` | 继承 `CreationAudited`，加上 `systemCode: string`、`contractCode: string`、`direction: Direction`、`failureKind?: FailureKind \| ""`、`durationMs: number`、`input?: JsonValue`、`output?: JsonValue`、`httpTrace?: HttpExchange[] \| null`、`error?: string \| null`、`requestId: string` | 一次已记录的调用: 分类、耗时，以及脱敏且限长的捕获内容。只读。成功调用的 `failureKind` 为空。 |
| `LogSearch` | `systemCode?`、`contractCode?`（`string`）、`direction?: Direction`、`failureKind?: FailureKind`、`requestId?: string` | — |

### 运维

| 类型 | 字段 | 说明 |
| --- | --- | --- |
| `DryRunParams` | `systemCode: string`、`contractCode: string`、`script?: string`、`input?: JsonValue` | `script` 为空则回退为已保存的适配器。 |
| `DryRunResult` | `output: JsonValue`、`trace: HttpExchange[] \| null`、`failureKind?: FailureKind \| ""`、`error?: string` | 即使运行失败 trace 也会填充，操作员能看到脚本走到了哪一步。 |
| `InboundRequestInput` | `method?`、`path?`、`body?`（`string`）、`headers?: Record<string, string>`、`query?: Record<string, string>` | 入站试运行的合成厂商请求。 |
| `DryRunInboundParams` | `systemCode: string`、`contractCode: string`、`script?: string`、`request: InboundRequestInput`、`handlerOutput?: JsonValue` | `handlerOutput` 是桩处理器的样例。 |
| `InboundDryRunResult` | `reply: JsonValue`、`dispatchedInput: JsonValue`、`failureKind?: FailureKind \| ""`、`error?: string` | 厂商将收到的回复，加上脚本 dispatch 的内容——两个转换方向一次验证。 |
| `TestConnectionParams` | `systemCode: string`、`method?: string`、`path?: string` | 针对已保存系统的连接探测。 |
| `HttpProbe` | `reachable: boolean`、`status?: number`、`statusText?: string`、`durationMs: number`、`error?: string` | 针对系统 Base URL 的一次探测请求。 |
| `DatabaseProbe` | `reachable: boolean`、`version?: string`、`durationMs: number`、`error?: string` | 针对系统数据源建立的一次抛弃式连接。 |
| `ConnectionCheck` | `http?: HttpProbe`、`database?: DatabaseProbe` | 当且仅当系统配置了该传输通道时，对应探测才存在。 |

### 诊断与统计

| 类型 | 字段 | 说明 |
| --- | --- | --- |
| `RouteFinding` | `kind: RouteFindingKind`、`routeId?: string`、`routeKey: string`、`contractCode?`、`contractName?`、`systemCode?`、`systemName?`（`string`） | `routeKey` 始终有意义（空字符串即默认路由）；编码/名称对标识涉及的路由、契约与系统，UI 无需额外查找。 |
| `RouteDiagnostics` | `findings: RouteFinding[]` | 路由表配置缺口的即时报告。 |
| `InvocationStats` | `system: string`、`contract: string`、`direction: Direction`、`calls: number`、`successes: number`、`failures?: Partial<Record<FailureKind, number>>`、`avgDurationMs: number`、`maxDurationMs: number`、`lastError?: string`、`lastErrorAt?: string` | 进程启动以来一个（系统, 契约, 方向）元组的按节点聚合。 |
| `IntegrationStatsResult` | `stats: InvocationStats[]` | `sys/monitor.get_integration_stats` 响应信封。 |

页面 prop 类型（`IntegrationContractPageProps`、`IntegrationSystemPageProps`、`IntegrationAdapterPageProps`、`IntegrationRoutePageProps`、`IntegrationCodeMapPageProps`、`IntegrationConsolePageProps`）与各自组件一同导出——它们的表格见[页面](./pages.md)。
