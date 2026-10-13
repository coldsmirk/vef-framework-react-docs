---
title: 版本说明与升级指南
description: 每个已发布版本以及未发布变更的破坏性变更、新特性和值得关注的修复，并附带升级前后的对照代码。
---

# 版本说明与升级指南

所有包在同一个仓库中同步发版：一次发布提交会提升每个 `packages/*/package.json` 的版本号，并打上 `vX.Y.Z` 标签。版本提升是按包、相对其自身 manifest 应用的（发布脚本在每个包中运行 `pnpm version`），因此所有包的增量相同——但一个在版本周期中途加入的包，会从其脚手架声明的版本起步，在仓库的 `sync-meta` 维护脚本将其与根版本重新对齐之前，它的版本号可能落后于标签。这不是理论上的可能：**v2.12.0 这次发布把 `@vef-framework-react/integration` 发成了 2.10.0**，而其他所有包都发为 2.12.0。

因此升级规则是：把所有 `@vef-framework-react/*` 依赖一起升级，每个都升到*同一次*发布所发出的版本——[安装](../getting-started/installation.md)固定了当前的版本组合。不支持在同一应用中混用来自不同发布的包。

包的*集合*本身也会随版本变化：v2.7.0 移除了 `@vef-framework-react/expression`，v2.8.0 新增了 `@vef-framework-react/approval-form-bridge`，v2.12.0 新增了 `@vef-framework-react/approval` 和 `@vef-framework-react/integration`，v2.13.0 新增了 `@vef-framework-react/cron`——下文对它们均有说明。

版本按从新到旧排列，最前面是已合并但尚未发布的变更。每个版本先列破坏性变更，其次是新特性，最后是值得关注的修复。内部 playground 演示和仓库工具链的变更不在此列出。

## 未发布（v2.24.1 之后）

无破坏性变更。表单设计器新增系统变量、宿主诊断与选项接口目录，审批包把这三者都接好了。审批这一半需要配合一个 vef-framework-go 版本：它的发起表单携带 `applicant`，实例视图携带对表单可见的 `globals`；对接较旧的服务端时，`$applicant` 与 `$globals` 读到的都是空。

### 新特性

- **form-editor** —— `EvaluationContext` 新增 `applicant`（`$applicant`）——表单所代表的主体，在流程中即发起人，与 `$user` 不同，它对查看同一条记录的每个人都相同——以及 `globals`（`$globals`），宿主提供的只读属性。两者都可用于表达式、脚本、绑定的数据源参数和以 `$` 为根的叶子条件。见 [Linkage → 宿主上下文与系统变量](../editors/form-editor/linkage.md#宿主上下文与系统变量)。
- **form-editor** —— `contextSources` 声明表单的**系统变量**：「变量」页会列出它们，每个都带一个设计时预览值（叠加在预览的上下文之上，从不存储），条件构建器则把它们作为「系统变量」分组提供。
- **form-editor** —— `validate`（`SchemaValidator`，返回 `SchemaIssue[]`）把宿主自己的检查叠加在编辑器的检查之上：只在结构无误的 schema 上调用，它的问题会进入状态栏诊断与发布关卡。状态栏的提示现在点击展开，列出全部问题；点击某一条会选中它所指的节点（必要时切换设备），或打开对应的表单配置页签，宿主以字段 key 链（`lines.price`）写出的路径能定位到字段。见 [Embedding → 宿主诊断](../editors/form-editor/embedding.md#宿主诊断)。
- **form-editor** —— `dataSourceApis`（`DataSourceApi` / `DataSourceApiParam`）为远程选项来源提供一个针对宿主接口目录的选择器；选中后会把接口地址、映射以及声明参数的默认值复制进 schema，schema 依然是自包含的。见 [Embedding → 提供接口目录](../editors/form-editor/embedding.md#提供接口目录)。
- **form-editor** —— `api_call` 动作编辑器现在可以设置 `version` 和请求参数，与远程选项来源共用同一个参数编辑器。导出 `normalizeOptionMapping`。
- **approval-form-bridge** —— `validateApprovalProjection(schema)` 只返回审批契约问题，形态与 `FormEditor` 的 `validate` 一致。
- **approval-form-bridge** —— 自 v2.20.0 起作为 `ApprovalFormField.optionSource` 形态的 `ApprovalFieldOptionSource` 与 `ApprovalOptionSourceKind` 现在按名称导出；以前只能经由字段类型取得。
- **approval** —— `ApprovalPlugins.formGlobals`（`FormGlobalDefinition[]`）声明后端向表单暴露的宿主全局变量，`ApprovalPlugins.dataSourceApis` 声明选项接口目录。`InstanceFormPanel` 接收 `applicant` 与 `globals`，并以它们作为 `$applicant` / `$globals` 对表单求值；`StartForm` 携带 `applicant` 与 `globals`，`MyInstanceInfo` / `AdminInstanceInfo` 携带 `globals`。流程设计器的表单步骤把四个发起人属性和声明的全局变量作为系统变量提供，把 provider 的解析器、求值器与接口目录传给表单编辑器，并用 `validateApprovalProjection` 做校验；两个设计步骤都不再渲染问题横幅，底部会说明「下一步」为何被禁用。见[审批 → 表单系统变量](../engines/approval/overview.md#表单系统变量)。

### 值得关注的修复

- **form-editor** —— 以 `$` 为根的叶子来源只读取自有属性，因此像 `$user.constructor` 这样的路径不再解析为原型成员（那会让 `notEmpty` 永远成立）。未知的根（`$applcant.x`）会被报告为新的警告 `source_scope_unknown`，而不是悄无声息地永不匹配；对 `ValidationIssueCode` 做穷尽 switch 的代码需要处理这个新成员。
- **form-editor** —— `$form.<key>` 形式的叶子来源在依赖追踪、校验、改名与清理中，与普通的 `<key>` 完全一致。
- **form-editor** —— `request_incomplete` 每个请求只报告一次，并写明缺少的是什么；`resource` 与 `action` 都为空时，报在请求本身的路径上。以前会在 `.resource` 和 `.action` 上各报一条文案相同的问题。
- **form-editor** —— 远程选项映射在存储、解析或投影的每一处都会被规范化：清空的 key 回退到其默认值，而不是被存成 `""`——按 `mapping.labelKey ?? "label"` 读取的解析器会把 `""` 当真。
- **form-editor** —— 请求参数名在失焦或按回车时才提交，并且只有在非空且唯一时才提交。以前连续添加多个参数，或把某个参数改成另一个参数的名字，都可能丢失值。
- **form-editor** —— `condition_group_empty` 的提示现在说明空条件组的实际效果（「全部满足」时规则始终生效，「任一满足」时永不生效），而不再声称规则不会生效。
- **approval** —— 流程设计器的表单预览会通过 `dataSourceResolver` 解析远程选项（以前始终为空），并运行 provider 的 `evaluators`。

## v2.24.1（2026-09-28）

无破坏性变更。

### 值得关注的修复

- **approval**、**integration**、**starter** —— 在对话框里快速输入时，页面可能因 React 的 "Maximum update depth exceeded" 而崩溃。antd 的 `Modal` / `Drawer` 每次按键都会重新渲染，而每次重新渲染都会重新执行其 portal 的容器 effect，直到触发 React 的嵌套更新上限。审批运行时的操作对话框（实例详情中的和管理控制台中的）、集成的连接测试抽屉以及 starter 布局中的搜索，现在都把草稿放在外壳之下的内容里，因此一次按键只会重新渲染那部分内容。每个对话框每次打开时仍从全新的草稿开始；连接测试在切换到另一个系统时会重置输入。

## v2.24.0（2026-09-28）

无破坏性变更。

### 新特性

- **approval-flow-editor** —— 并行审批节点可以按固定人数通过：`PassRule` 新增 `"fixed_count"`，人数保存在 `ApprovalNodeData.passCount`（默认 `1`）。达到这么多审批人通过时节点即通过——参与人数不足时需全部通过——并在这个人数已不可能达到时驳回。`validateFlowDefinition` 会把不是 ≥ 1 整数的人数报告为 `pass_count_range`；没有上限，因为审批人在运行时才解析。见 [Approval Flow Editor 参考](../editors/approval-flow-editor/reference.md#枚举)。
- **approval** —— 在 `fixed_count` 规则下，`TimelineEntry` 与 `FlowGraphNodeData` 携带 `passCount`。
- **approval-flow-editor** —— 条件编辑器把每条规则排成不换行的一行（条件项、使用时的聚合与列、运算符、值、删除），因此同一组内各规则的列会对齐，过长的名称会被截断，而不会把行撑宽。条件项解析出来之前，运算符保持禁用。
- **integration** —— 日志控制台可以按当前定义重放一次已记录的调用，并与原始调用对比，也可以用未保存的脚本重放。`useLogApi` 新增 `replay`（`integration/log.replay`），由 `INTEGRATION_PERMISSIONS.log.replay` 门控，`IntegrationConsolePage.permissions` 接受 `logReplay`。`InvocationLog` 新增 `replayable`，并与新的 `ReplayResult` 共用 `InvocationOutcome`；`HttpExchange` 新增入站调用方的 `clientAddr`。见[集成页面](../engines/integration/pages.md#integrationconsolepage)。

### 值得关注的修复

- **approval-flow-editor** —— 混合了字段规则与表达式规则的条件组，会以可视化编辑器打开，其中的表达式规则以源码形式显示和编辑；以前会被误读为一条未填写的字段规则。
- **approval-flow-editor** —— 在条件编辑器中快速输入不再因 "Maximum update depth exceeded" 而崩溃，进行中的编辑也不会因为父组件带着新的条件列表重新渲染而丢失；每次打开编辑器时，草稿都从已存储的条件重新生成。

## v2.23.0（2026-09-22）

无破坏性变更。

### 新特性

- **core** —— `protectedBodyEncoding` 可以在纯 HTTP 下工作：存在 `crypto.subtle` 时 AES-GCM 运行在 Web Crypto 上，否则回退到 `@noble/ciphers`，两者输出的字节完全相同。浏览器只在安全上下文中提供 `crypto.subtle`，因此以前在 HTTP 页面上连客户端都无法构造。保护密钥机密性的仍然是 HTTPS。见 [HTTP 与 API 客户端](./core/http-and-api.md#protected-body-transport)。
- **approval** —— 任务中心的两个列表都有了搜索。待办可按标题、申请人姓名与是否超时筛选，高级搜索中还可按到达时间筛选；已办可按标题、申请人姓名与处理结果筛选，高级搜索中还可按处理时间与实例的流程状态筛选。查询改为接收 `PendingTaskSearch` / `CompletedTaskSearch`，二者在 `MyTaskSearch` 的基础上扩展了 `keyword`、`applicantId`、`applicantName` 与 `flowId`。见[审批页面](../engines/approval/pages.md#approvaltaskcenterpage)。

## v2.22.0（2026-09-15）

包含一个破坏性变更：starter 主题 store 不再为配色方案和语义化颜色物化框架默认值；这些字段现在只存储用户的显式选择。

### 破坏性变更

- **starter** —— `ThemeState.colorScheme` 变为可选，`ThemeState.colors` 变为 `Partial<ThemeColors>`。store 只记录用户在主题面板中选择的配色方案和语义化颜色；未设置的值跟随应用的 `defaultTheme`。将这些字段视为始终存在的应用需要处理 `undefined` / 缺失项。从旧版本升级的用户可能已经把旧框架默认值持久化为显式选择，因此修改 `defaultTheme` 不会覆盖这些已保存值；用户可以在主题面板中重置自己的主题选择。

### 新特性

- **components** —— `ConfigProvider` 新增 `components`（`ComponentDefaults`），用于设置应用级默认 props。默认值按组件白名单生效：`Form`（`labelAlign`、`labelWidth`）、`FormModal`（`draggable`）、`Image`（`fallback`）、`Input` / `TextArea`（`allowClear`、`autoComplete`）、`Message` / `Notification`（`duration`、`maxCount`）、`Pagination`（`showSizeChanger`）、`ProTable`（`rowKey`、`showSequenceColumn`、`striped`）、`Select`（`showSearch`）。显式传入的 prop 仍优先于应用默认值。
- **starter** —— `createApp().render()` 新增 `defaultTheme`，用于设置初始配色方案和语义化颜色；新增 `components`，用于设置上述组件默认值。用户在主题面板中的选择优先，并且只有这些选择会被持久化。`ThemeConfigProvider`、`useEffectiveColorScheme()`、`useEffectiveThemeColors()` 以及 `DefaultTheme` / `ThemeConfigProviderProps` 类型现在也会导出，供自定义应用壳层使用。

### 值得关注的修复

- **form-editor** —— `uploadFieldDefinition` 现在从包入口导出，自定义注册表可以直接复用内置上传定义。`EditCoalesceOptions` 文档现在明确 undo 折叠是显式选择的：离散编辑省略 `coalesceKey` 即独占一步，传入稳定的细粒度 key 才会把一轮编辑折叠起来。

## v2.21.0（2026-09-14）

无破坏性变更。

### 新特性

- **core** —— `HttpClientOptions.protectedBodyEncoding` 启用强制的双向 `aes-gcm+base64` JSON body 传输。它使用浏览器 Web Crypto API，匹配 Go 框架的 nonce/ciphertext/tag wire 布局，优先于旧版 body 编码，并拒绝缺少标记或标记不匹配的 protected 响应。参见 [HTTP 与 API 客户端](./core/http-and-api.md#protected-body-transport)。
- **starter** —— `starter.createApiClient()` 接受 `protectedBodyEncoding`，并转发给 core HTTP 客户端。

## v2.20.0（2026-09-07）

无破坏性变更。

### 新特性

- **approval-form-bridge** —— 远程选项源会以 `optionSource`（`{ kind: "remote", request, mapping? }`）投影到审批契约；静态选项仍投影为 `options`。后端接受远程源 select 提交的任意值，由宿主在运行时校验。
- **form-editor** —— 一次大规模正确性修复，覆盖远程 select 按标签过滤、按文件数量推断上传列、绑定数据源参数作用域、提交载荷、可选规则、办理人重置、历史/设备跟踪、key 修复、schema patching、校验透出，以及跨设备设计保持字段 key 稳定。

## v2.19.0（2026-09-01）

包含一个破坏性变更：form-editor 的远程数据源参数现在是与表单绑定的动态值。

### 破坏性变更

- **form-editor** —— `RemoteDataSourceRequest.params` 的每一项都是 `DynamicValue`。参数可以读取表单值；在子表单内还可以读取当前行的作用域。手工构造静态参数值的宿主不受影响；假设所有参数都是静态值的 resolver 必须先求值动态值再使用。

### 新特性

- **form-editor** —— 上传字段保存对象 key（单个文件位为空时是 `null`，多文件位为空时是 `[]`），并按 `maxCount` 推断存储列。
- **components** —— 导出 `StoredFileUpload`。它用存储对象 key 控制 `FileUpload`，将已保存的 key 水合为上传列表、解析原始文件名，并按 `maxCount` 输出单个 key 或数组。

## v2.18.0（2026-08-31）

包含一个破坏性变更：审批流设计器的主办人词汇由应用注册目录驱动。

### 破坏性变更

- **approval-flow-editor** —— `AssigneeKind` 和 `CcKind` 变为开放的 `string` 标识符，不再是封闭联合类型。`EditorPlugins` 新增 `assigneeKinds` 和 `ccKinds`（`KindDescriptor[]`），`pickers` 也按 kind 字符串索引。请传入 `approval/flow.list_kind_options` 返回的目录；省略时编辑器回退到 `BUILTIN_ASSIGNEE_KINDS` / `BUILTIN_CC_KINDS`。Picker 查找先尝试规则自身的 kind，再尝试其 `selection` 模式，因此选择角色的自定义 kind 可以复用内置 `role` picker。
- **approval** —— `InitiatorKind` 同样变为开放的 `string`，`ApprovalPlugins.pickers` 也按 kind 字符串索引。

### 新特性

- **approval-flow-editor** —— 导出 `SelectionMode` 和 `KindDescriptor`；校验 API 改为接收包含 `formFields`、`assigneeKinds`、`ccKinds` 的 `FlowValidationContext`。
- **approval** —— `ApprovalPlugins.pickers` 采用同样的“先 kind、后 selection”回退查找，并重新导出 `KindDescriptor` / `SelectionMode`。
- **approval** —— `useFlowApi.listKindOptions` 获取应用的 kind 目录（`KindOptions`：`assignees`、`ccs`、`initiators`），流程设计器把它同时传给发起人编辑器与流程编辑器——`toEditorPlugins` 以第三个参数接收它。在目录加载完成之前，发起人编辑器提供的是 `BUILTIN_INITIATOR_KINDS`。

## v2.17.2（2026-08-26）

无破坏性变更。

### 新特性

- **approval-flow-editor** —— 内置发起人主体（`applicantId`、`applicantDepartmentId`）的条件值改用宿主的 `user` / `department` picker，不再要求手工输入 id。

## v2.17.1（2026-08-25）

无破坏性变更。

### 值得关注的修复

- **components** —— 公共上传预览恢复图片缩略图：用对象公共源 URL 作为 `thumbUrl`，同时仍避免把它放到 antd 可导航的 `url` 上。

## v2.17.0（2026-08-20）

无破坏性变更。

### 新特性

- **starter** —— 导出 `useLoginFlow`，提供无展示层的登录状态机：凭据提交、challenge 循环、RSA 加密、错误归一化、store 更新，以及认证后的导航。
- **starter** —— `LoginParams` 通过 `Register['loginParams']` 成为开放联合类型；框架内置 `PasswordLoginParams` 和 `TrustCodeLoginParams`。
- **starter** —— `LoginChallengeAutoResolver` / `LoginChallengeAutoResolvers` 可以用页面已有数据自动应答选定的 challenge。每种类型只尝试一次，静默应答被拒绝时会回退到对应 renderer。
- **starter** —— 导出单点登录落地页、路由辅助函数、常量、`useSsoLogin` 和 `readTrustCodeHandoff`。handoff 只读取一次，并在交换前从地址栏移除，同时仍可走完整 challenge 链。
- **starter** —— `createLoginRouteOptions` 和 `createSsoRouteOptions` 既接受默认页面 props，也接受应用提供的 `component`；自定义页面通过 `useLoginFlow` / `useSsoLogin` 复用路由的 redirect 与认证守卫。

### 值得关注的修复

- **starter** —— 客户端退出登录会在路由守卫读取前清掉过期的菜单路径集合。
- **core** —— 传输编码后的请求体会原样发送到网络层。

## v2.16.0（2026-08-18）

无破坏性变更。

### 新特性

- **approval-flow-editor** —— `SameApplicantAction` 新增 `"exclude"`：当发起人出现在已解析的办理人中时，只让其本人席位回避，由其余办理人决定。该动作按席位生效；`auto_pass` 和 `transfer_superior` 同样只影响发起人自己的任务。

## v2.15.0 (2026-08-07)

无破坏性变更。

### 新特性

- **approval** — 节点办理人悬浮在实例流程图之上：每个审批节点以人员叠层渲染其办理人和候选人，无需打开节点详情即可看到该步骤背后的人员。
- **starter** — 部门选择挑战类型现在将 `meta` 载荷文档化在 `Register['challenges']` 示例中；starter 类型通过 `ResolvedChallenges` 携带该形状，内联声明展示了预期的 `departments` 与 `organizations` 结构。

## v2.14.0 (2026-08-05)

无破坏性变更。

### 新特性

- **hooks** — `useStoredFileNames(keys)` 把存储对象键解析为其上传时记录的原始文件名、大小和 MIME 类型；上传字段通过同一解析水合显示名称，使存储键渲染为上传者选择的文件名。
- **integration** — 契约目录支持按标签过滤；码表条目编辑器在映射补全中建议宿主代码。

### 值得关注的修复

- **components** — Crud 场景表单在通过 store 的 `closeForm` 关闭时会重置；表单状态不再在程序化关闭再打开的周期中残留。
- **dev** — `deps:check` 的 GHSA 富化容忍 null CVSS 分数；没有分数的公告不再导致报告崩溃。

## v2.13.1 (2026-07-28)

无破坏性变更。approval 包的补丁发布，外加两个在 v2.13.0 和补丁之间落地的特性。

### 新特性

- **core** — 可选的请求体传输编码：`HttpClientOptions.defaultBodyEncoding` 和每请求的 `bodyEncoding` 选项（`BodyEncoding`：`"none"` | `"base64"` | `"gzip+base64"`）对 JSON 请求体进行编码，使代码形状的载荷能够通过对它们误报的中间件（WAF / 代理）；服务端的 body-encoding 中间件在解析前逆转编码。`"none"` 使单个请求退出客户端级默认。
- **integration** — 当客户端设置了 `defaultBodyEncoding` 时，携带脚本的请求体会被传输编码。

### 值得关注的修复

- **approval** — 流程设计器在保存开放（无限制）流程时不再提交发起人规则。
- **approval** — 瞬时时间线条目（开始和结束在同一时刻）折叠为单个时间戳，不再渲染两个。
- **approval** — `TimelineEntryKind` 新增 `"end"` 种类，使终端时间线条目具有正确的类型。
- **core** — 当基于 `Uint8Array` 的转换不可用时（较旧的运行时和部分浏览器环境），base64 编码回退到 `btoa`。

## v2.13.0 (2026-07-21)

一个包加入集合：**`@vef-framework-react/cron`**（首发版本为 2.13.0）。本版本包含三个破坏性变更：数据字典词汇全面更名为 "code set"，approval-flow-editor 状态引擎回归手写实现（逆转 v2.7.0 的 nodeloom 重建），以及委托窗口字段按动词形式约定重命名。

### 破坏性变更："dictionary" 全面更名为 "code set"

数据字典（data dictionary）词汇在所有包中统一更名为**码集**（code set）。线上契约未受影响——宿主仍然提供一个把键名字符串映射为 `DataOption[]` 的查询函数——但所有包含 "dictionary" 的导出名都发生了变化。概念指南见[码集](../guide/code-sets.md)。

**hooks** — 查询 hook 及其整个类型家族：

```ts
// Before (≤ v2.12.0)
import {
  resolveDictKey,
  useDictionaryQuery,
  type DictionaryAliasMap,
  type DictionaryKey,
  type DictionaryKeyConfig,
  type DictionaryKeyValue,
  type DictionaryQueryData,
  type UseDictionaryQueryOptions
} from "@vef-framework-react/hooks";

// After
import {
  resolveCodeSetKey,
  useCodeSetQuery,
  type CodeSetAliasMap,
  type CodeSetKey,
  type CodeSetKeyConfig,
  type CodeSetKeyValue,
  type CodeSetQueryData,
  type UseCodeSetQueryOptions
} from "@vef-framework-react/hooks";
```

`Register` 扩充成员随之变化——约束了键名的项目必须更新自己的 `declare module` 块：

```ts
declare module "@vef-framework-react/hooks" {
  interface Register {
    // Before: dictionaryKeys: "sys.menu.type" | "sys.user.gender";
    codeSetKeys: "sys.menu.type" | "sys.user.gender";
  }
}
```

**core** — `AppContext.dictionaryQueryFn` 现为 `AppContext.codeSetQueryFn`。请更新传给 `createApp().render()` 的 `appContext`：

```ts
createApp().render({
  // ...
  appContext: {
    hasPermission,
    // Before: dictionaryQueryFn: findCodeSetEntries,
    codeSetQueryFn: findCodeSetEntries,
    fileBaseUrl: "/files"
  }
});
```

**components** — `useDictionaryOptionsSelect` 现为 `useCodeSetOptionsSelect`；其选项/结果类型 `UseDictionaryOptionsSelectOptions` / `UseDictionaryOptionsSelectResult` 现为 `UseCodeSetOptionsSelectOptions` / `UseCodeSetOptionsSelectResult`。

**dev** — 代码生成模块同步更名（见 [Dev 包](./dev/overview.md#代码生成)）：

- CLI 命令：`vef gen:dictionary-keys` → `vef gen:code-set-keys`。
- `code-generation.config.ts`：`dictionaryKeys` 配置块 → `codeSetKeys`，其拉取函数 `fetchDictionaryKeys` → `fetchCodeSetKeys`。
- 默认输出文件：`src/types/dictionary.gen.ts` → `src/types/code-set-keys.gen.ts`；生成的联合类型为 `CodeSetKey`（原为 `DictionaryKey`），扩充的是 `Register.codeSetKeys`。
- 编程式导出：`generateDictionaryKeys` → `generateCodeSetKeys`（连同其 `Options` / `Result` 类型）、`renderDictionaryKeysFile` → `renderCodeSetKeysFile`（连同 `RenderCodeSetKeysOptions`）、`DICTIONARY_AUGMENT_TARGET` → `CODE_SET_AUGMENT_TARGET`、`DictionaryKeyEntry` → `CodeSetKeyEntry`、`DictionaryKeysConfig` → `CodeSetKeysConfig`。

更名配置之后，请删除旧的生成文件并重新运行 `vef gen:code-set-keys`，使扩充指向新的 `codeSetKeys` 成员。

### 新包：`@vef-framework-react/cron`

面向持久化定时调度引擎的开箱即用管理页面：`CronSchedulePage` 和 `CronRunPage`（外加 `RunDetailDrawer`、表单模型辅助函数和 `CRON_PERMISSIONS`）。调度列表筛选拆分为基础与高级两个面板；已暂停的调度会隐藏其触发游标。参见[引擎](../engines/overview.md)。

### 破坏性变更：approval-flow-editor 回归手写状态引擎

编辑器的状态引擎重新改为手写实现，`@coldsmirk/nodeloom-core` 依赖已移除。这逆转了 v2.7.0 引入的内存节点形状（见下文对应章节）；线上（wire）格式依旧未受影响。

```ts
// v2.7.0 – v2.12.0 (nodeloom shapes): kind at data.kind, business fields under data.config
import type { FlowNode } from "@vef-framework-react/approval-flow-editor";
const isUrgent = (node: FlowNode) =>
  node.data.kind === "approval" && node.data.config.name === "Urgent";

// After (typed xyflow nodes): kind at node.type, business fields directly on data
import type { FlowNode } from "@vef-framework-react/approval-flow-editor";
const isUrgent = (node: FlowNode) =>
  node.type === "approval" && node.data.name === "Urgent";
```

- `FlowNode` 现在是包内定义的、由类型化 `@xyflow/react` 节点组成的可辨识联合（`Node<StartNodeData, "start"> | … | Node<CcNodeData, "cc">`）；`FlowEdge` 是 xyflow 的 `Edge`。二者都不再是 nodeloom 的再导出。
- 按种类划分的节点别名重新导出——但只有 `StartNode`、`ApprovalNode`、`HandleNode` 和 `CcNode`。与 v2.7.0 之前不同，`ConditionNode` 和 `EndNode` 保持内部；它们的数据形状（`ConditionNodeData`、`EndNodeData`）仍然导出。
- `AnyNodeData` 保留，作为节点数据联合类型（`FlowNode["data"]`）的别名。
- 内部 store 重构为分片（slice）结构；通过 `useEditorStore` 做选择的宿主需要（再次）适配新的 `EditorState` 形状。
- **线上格式未受影响。**`toFlowDefinition` / `fromFlowDefinition` 以及 `NodeDefinition`（`value` / `onChange`）契约保持不变——序列化器现在负责 `node.type` ↔ `kind` 的映射。已保存的流程定义无需迁移即可加载。

### 破坏性变更：委托窗口字段重命名为 startsAt / endsAt

委托类型（`Delegation` 和 `DelegationParams`）将其窗口字段从 `startTime` / `endTime` 重命名为 `startsAt` / `endsAt`。请更新所有读写这些字段的代码：

```ts
// Before (≤ v2.12.0)
const start = delegation.startTime;
const end = delegation.endTime;

// After (≥ v2.13.0)
const start = delegation.startsAt;
const end = delegation.endsAt;
```

### 新特性

- **core** — 面向 vef 服务端推送通道的 `PushClient`（及其工厂函数 `createPushClient`）：一条仅下行的 WebSocket，投递 `PushMessage` 消息信封（`{ id, type, payload?, time }`）。`subscribe(type, handler)` 按信封类型注册（`"*"` 接收全部消息），并返回取消订阅函数。传输层断连会以带抖动的指数退避重连（`PushReconnectOptions`），每次尝试都重新读取访问令牌（通过 `__accessToken` 查询参数发送）；终止性关闭码 `4401`（`PUSH_CLOSE_SESSION_INVALID`）和 `4429`（`PUSH_CLOSE_TOO_MANY_CONNECTIONS`）经由 `onSessionInvalid` / `onConnectionRejected` 暴露，且永不重连。按契约，投递是尽力而为的——请把它当作实时提示，把可靠状态留在常规 API 后面。
- **hooks** — `usePushMessage(client, type, handler)` 订阅一种信封类型，并在卸载时自动清理。
- **integration** — 码表管理页面（`IntegrationCodeMapPage`），为映射代码提供自动补全；码表的码集从宿主目录中选取，并支持手动输入兜底。
- **approval** — 实例详情在流程名称旁显示流程代码。

### 值得关注的修复

- **components** — pro-search 的折叠切换按钮传递了正确的 antd 图标属性（V 形折叠图标恢复渲染）；操作区域改为响应式尺寸，使搜索控件可以在工具栏内容旁收缩。

## v2.12.0 (2026-07-17)

两个包加入集合：**`@vef-framework-react/approval`**（首发版本为 2.12.0）和 **`@vef-framework-react/integration`**（首发版本为 **2.10.0**——其 manifest 在版本周期中途才脚手架生成；见本页顶部的版本号说明）。在后续发布将其重新对齐之前，请把 `integration` 固定为 `^2.10.0`。

从 v2.11.0 升级无需迁移。该发布包含两个标记为 breaking 的提交，但它们都是在 approval 包首次发布之前对其进行的重塑：设计器种子数据的重做（精简版本摘要）以及标签套件从 `approval` 移入 `components`。对已发布版本的消费者来说，标签套件的移动是纯新增——该套件以新导出的形式落在 `components` 中。

### 新包：`@vef-framework-react/approval`

面向审批引擎的开箱即用管理与运行时页面，端到端内嵌流程设计器：`ApprovalFlowPage`（含 `FlowDesignerDrawer` / `FlowVersionsDrawer`）、`ApprovalTaskCenterPage`、`ApprovalMyInstancesPage`、`ApprovalInitiatePage`（含 `StartInstanceDrawer`）、`ApprovalAdminPage`、`ApprovalCategoryPage` 和 `ApprovalDelegationPage`，外加用于宿主提供选择器的 `ApprovalProvider` / `useApprovalPlugins` / `toEditorPlugins`，以及 `APPROVAL_PERMISSIONS`。参见[引擎](../engines/overview.md)。

首个版本中值得关注的行为：设计器通过精简的 `FlowVersionSummary` 记录从最近部署的版本播种（完整定义按版本通过带显式 `versionId` 的 `getGraph` 拉取）；流程标签显示在实例详情上；实例详情操作栏新增移除办理人；指标加载失败时提供重试操作。

### 新包：`@vef-framework-react/integration`

面向集成引擎的开箱即用管理页面：`IntegrationSystemPage`、`IntegrationAdapterPage`、`IntegrationContractPage`、`IntegrationRoutePage` 和 `IntegrationConsolePage`，外加 `INTEGRATION_PERMISSIONS`。参见[引擎](../engines/overview.md)。

首个版本中值得关注的行为：带内部滚动区域的全高控制台工作台；感知认证方案的认证参数编辑器，带专用凭据字段；每个脚本编辑器中的脚本 API 自动补全，并从补全目录渲染可悬浮查看的脚本文档；带目录过滤的契约标签管理；以及 JSON Schema 关键字补全和高亮的线上追踪报文体。

### 新特性

- **components** — 标签套件（从未发布的 approval 包中移入，因此在这里以新导出的形式落地）：`LabelsEditor`、`LabelsDisplay`、`LabelFilterSelect`，辅助函数 `formatLabelFilters` / `parseLabelFilters` / `isValidLabel`，以及常量 `LABEL_KEY_PATTERN`。
- **components** — `FlexTabs` 与 `Labeled` 布局原语，分别用于全高标签页布局和风格一致的带标签值展示。
- **components** — 代码编辑器：声明式的 `completions` 属性（`CompletionEntry[]`）在语言自身补全之外追加 API 补全（在 `"json"` 中，条目会在属性名字符串内以对象键的形式补全）；`"xml"` 语言加入内置列表；悬浮的格式化操作（`showFormat`，默认 `true`）通过 prettier 无损格式化 JSON。
- **components** — `formLayout` 可在 `FormModal`、`FormDrawer` 和 `Crud` 上透传；`EditableTable` 会把 `locale` 转发给底层表格。

### 值得关注的修复

- **core** — 路径参数替换只在路径段起始处匹配，且要求参数名以字母或下划线开头，因此绝对 URL 中的端口（`https://minio.local:9000/…`）和路径段中间的冒号（`/schedule/12:30`）永远不会被当作参数。
- **components** — 过期的异步格式化结果不再覆盖更新的按键输入；代码编辑器的 tooltip 渲染在 antd 浮层（弹窗、抽屉）之上；可编辑表格的操作列获得固定的默认宽度；抽屉表单内容不再与底部操作区重叠。

## v2.11.0 (2026-07-15)

### 破坏性变更：请求生命周期按调用隔离

`ApiClient.createQueryFn` 过去只在定义时调用**一次**你的工厂函数，并通过共享可变状态注入"当前查询"的中止信号——并发或交错的异步查询可能观察到彼此的信号。现在工厂函数在**每次查询执行时**运行一次，每个处理器都会收到一个绑定到本次执行中止信号的调用作用域 `HttpClient` 代理（并与传给请求方法的任何显式 `options.signal` 组合）。

契约变化：**工厂函数必须无副作用、不得跨执行保留状态、不能执行一次性初始化。**请把此类代码移出工厂函数：

```ts
// Before (≤ v2.10.0): the factory body ran once and could hold shared state
const findUserPage = apiClient.createQueryFn("findUserPage", http => {
  const columnCache = buildColumnCache(); // one-time setup — no longer safe here
  return async (params: UserSearch) => http.post("/api/user/page", { data: params });
});

// After (≥ v2.11.0): one-time setup lives outside; the factory only closes over it
const columnCache = buildColumnCache();
const findUserPage = apiClient.createQueryFn(
  "findUserPage",
  http => async (params: UserSearch) => http.post("/api/user/page", { data: params })
);
```

`createMutationFn` 不变——它仍然只构造一次。

令牌刷新协调也按同一原则重建。在配置了 `tokenExpiredCode` 的 401 上，`HttpClient` 会发布一个共享的刷新 promise；并发的新请求通过请求作用域、感知中止的等待器等待，并在令牌续期后继续。现在可以依赖的行为：

- 取消一个等待中的请求（或其 401 触发了刷新的那个请求）**不会**取消全局刷新。
- 刷新成功后，仍然存活的触发请求会用续期后的令牌重试。
- 自动刷新失败时，`onUnauthenticated` 恰好被调用一次——即使触发请求在此期间已被取消。
- `ensureTokenRefreshed(false)` 只有在该调用*拥有*（即发起了）这轮刷新时才会抑制未认证回调；加入进行中的刷新无法覆盖发起者的失败策略。

同一版本还规范了文件响应：在期望文件的位置返回后端 JSON 业务信封的响应，会以 `BusinessError` 的形式暴露，而不是被当作文件内容返回；原始（非信封）下载响应也能被正确处理。

### 新特性

- **core** — `HttpClient.requestFile(url, options?)` 以客户端完整的请求语义（Bearer 注入、401 刷新重试、路径参数、中止信号）把文件拉取为 `Blob`，返回 `HttpFileResponse`——`{ blob: Blob; filename?: string }`，文件名解析自 `Content-Disposition`。`download()` 现在构建于其上，并保留其触发浏览器下载的行为。`requestFile` 与其他请求方法一样参与 `createQueryFn` 的信号注入。
- **components** — 文件预览契约：框架不捆绑任何查看器库；改由 `FilePreviewProvider` 安装一个应用级预览宿主（`FilePreviewHandler`），`Upload` 及构建在其上的一切组件会把非图片文件规范化为 `FilePreviewTarget` 后派发给它（`toFilePreviewTarget`，读取上传/水合时打上的 `UploadedFileMeta`）。图片保留内置的 `Image` 弹窗。随之而来的行为变化：没有接收方 provider 时，框架会给出警告，不再把无法证明认证要求的 URL 交给浏览器。私有文件由宿主通过 `HttpClient.requestFile` / `HttpClient.download` 拉取。playground 演示了一个基于 `@file-viewer/react` 的完整宿主。

### 值得关注的修复

- **components** — 带认证的上传预览按文件各自独立解析其源 URL，不再在条目间共享状态。

## v2.10.0 (2026-07-13)

### 破坏性变更：`AuthTokens.refreshToken` 变为可选

签发有状态不透明令牌（opaque token）会话的后端（服务端滑动续期——没有刷新往返）不会返回刷新令牌；只有 JWT 模式的后端才会返回。类型现在如实反映了这一点：

```ts
// Before (≤ v2.9.0)
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// After (≥ v2.10.0)
export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}
```

这纯粹是一次编译期迁移：任何把 `tokens.refreshToken` 读入 `string` 类型槽位的代码——最常见的是传给 `createApiClient` 的 `refreshToken` 回调——现在必须处理 `undefined`：

```ts
async refreshToken(tokens) {
  if (!tokens.refreshToken) {
    // Opaque-token session: nothing to refresh; let the request fail as expired.
    throw new Error("No refresh token");
  }
  // ... exchange tokens.refreshToken as before
}
```

使用不透明令牌后端的宿主可以直接省略 `refreshToken` 回调——此时 401 路径会径直进入 `onUnauthenticated`。

### 破坏性变更：form-editor 与 approval-form-bridge 契约收紧

本版本包含两项编辑器栈的破坏性变更；细节见[可视化编辑器](../editors/overview.md)：

- **form-editor** — 每次编程式写入都要经过字段权限钳制，因此对当前权限标记为只读或隐藏的字段的写入不再生效。
- **approval-form-bridge** — 投影输出裸字段数组（`ProjectionResult.fields: ApprovalFormField[]` 取代了 `definition` 包装对象），富表单 schema 改为在部署时发送。`ApprovalFormDefinition` 类型已移除且没有替代品——见[迁移说明](../editors/approval-form-bridge.md)。

### 新特性

- **starter** — 面向后端强制修改密码登录挑战的内置 `password_change` 挑战渲染器：`PasswordChangeChallenge` 组件、常量 `PASSWORD_CHANGE_CHALLENGE_TYPE`（`"password_change"`），以及 `PasswordChangeChallengeSpec` / `PasswordChangeChallengeData` / `PasswordChangeChallengeProps` / `PasswordChangeReason` 类型。请在 `challengeRenderers` 中注册并扩充 `Register['challenges']`——参见[应用壳层](./starter/application-shell.md#登录挑战)。
- **approval-flow-editor** — 设计器中的三态 `formFields` 清单与必填自动通过镜像；部署时的字段权限校验在设计时同步镜像。
- **form-editor** — 运行时字段状态由服务端解析的 `fieldPermissions` 钳制；堆叠块新增宽度/最小/最大/对齐尺寸设置；设计器会把选中项滚动到可视区域、新增容器拖拽把手，并支持选项重新排序。
- **approval-form-bridge** — 跨设备分类保持同步；隐藏的必填字段会在投影时产生警告。

### 值得关注的修复

- **components** — 当输入框使用 `allowClear` 时，pro-search 字段保持宽度不变。
- **dev** — `VEF_APP_NAME` 现在对注入的配置全局变量生效。`defineViteConfig` 此前只从 `env/` 加载 `VEF_BUILD_*` 变量，导致该名称从未到达配置插件；此外，生产环境的 `__VEF_APP_CONFIG__` define 与生成的 `app.config.js` 推导全局变量名的方式不同，可能不一致。现在两侧解析出同一个 `__PRODUCTION__VEF_<CONSTANT_CASE_NAME>__CONF__` 全局变量。参见 [Dev 包](./dev/overview.md#运行时注入vef_app_)。

## v2.9.0 (2026-07-06)

无破坏性变更。

### 新特性

- **starter** — 应用切换器弹出层现在每行容纳四个应用。

## v2.8.0 (2026-07-06)

无破坏性变更。

### 新特性

- **新包：`@vef-framework-react/approval-form-bridge`** — 连接 `form-editor` schema 与审批后端扁平表单契约的纯函数投影桥。导出 `projectFormSchema`、`createApprovalRegistries`、`validateApprovalSchema` 和 `APPROVAL_EXCLUDED_FIELD_TYPES`。请将其加入依赖，版本号与其他包保持一致。参见[审批表单桥接](../editors/approval-form-bridge.md)。
- **approval-flow-editor** — 设计器现在镜像后端的聚合与分支条件校验，包括明细表聚合条件，使契约违规在设计时就能暴露，而不是等到部署时。

### 值得关注的修复

- **approval-flow-editor** — 并行加签不再纳入顺序审批的默认项，与后端接受的范围保持一致。

## v2.7.0 (2026-07-05)

本范围内改动最大的版本：form-editor 的表达式引擎和 approval-flow-editor 的状态引擎都被替换。如果你持久化了带联动表达式的表单 schema，升级前请先审查这些表达式。

### 破坏性变更：移除 `@vef-framework-react/expression`

ZEN(GoRules)表达式运行时包被整体删除，请将其从依赖中移除。唯一保留下来的公开 API——条件操作符词表——迁移到了 `approval-flow-editor`：

```ts
// Before (≤ v2.6.0)
import { CONDITION_OPERATORS, type ConditionOperator } from "@vef-framework-react/expression";

// After (≥ v2.7.0)
import { CONDITION_OPERATORS, type ConditionOperator } from "@vef-framework-react/approval-flow-editor";
```

其余一切——`evaluate` / `evaluateSync`、`loadEngine` / `configureEngine`、`ExpressionError`——均已移除，且没有替代品。

### 破坏性变更：form-editor 联动表达式改为原生 JavaScript

联动的 `expression` 条件和表达式取值的赋值动作过去通过共享的 ZEN 求值器运行，现在改为通过 `new Function` 编译的原生 JavaScript(脚本动作一直如此)。**这改变了已存 schema 使用的语言**：任何以 ZEN 方言书写并持久化的表达式都必须改写为 JavaScript 表达式。

```js
// Before (ZEN dialect)
field.age >= 18 and field.status == "active"

// After (JavaScript)
$form.age >= 18 && $form.status === "active"
```

- 求值作用域不变：`field` / `$form`(表单值——`field` 是历史别名)、`$vars`、`$user`、`$node`、`$now`。在两种方言中都合法的表达式(如 `$form.age >= 18`)可原样继续工作。
- 仅 ZEN 支持的语法(`and` / `or` / `not`、ZEN 内置函数)不再能解析；无法编译的源码会退化为条件 `false`、赋值 `undefined`，而不是抛出异常。
- 类型 `ExpressionContext` 重命名为 `EvaluationContext`；`LinkageEvaluators` 各回调签名现在接收 `EvaluationContext`。
- **CSP**：默认求值器现在对*所有*表达式种类都要求 `'unsafe-eval'`，此前只有脚本动作需要。可提供自己的 [`LinkageEvaluators`](../editors/form-editor/linkage.md) 换用沙箱化引擎。

在引擎替换的同时，`FormEditor` 获得了宿主上下文注入能力：`evaluationContext` 属性承载实时的 `$vars` / `$user` / `$node` 值；`contextSources` 属性(`LinkageContextSource[]`)把宿主声明的路径(如 `"$user.departmentId"`)发布到可视化条件构建器的来源选择器中。声明来源只影响选择列表——求值始终读取 `evaluationContext`。

### 破坏性变更：approval-flow-editor 状态引擎重建于 nodeloom 之上

编辑器的状态引擎重建于 `@coldsmirk/nodeloom-core`。内存中的节点和边现在采用 nodeloom 的统一形状：每个节点都携带 `type: "flowNode"`，节点种类判别字段位于 `data.kind`，业务字段则位于 `data.config` 之下。

```ts
// Before (≤ v2.6.0): per-kind xyflow node types
import type { ApprovalNode } from "@vef-framework-react/approval-flow-editor";
const isUrgent = (node: ApprovalNode) =>
  node.type === "approval" && node.data.name === "Urgent";

// After (≥ v2.7.0): uniform FlowNode, discriminated by data.kind
import type { FlowNode } from "@vef-framework-react/approval-flow-editor";
const isUrgent = (node: FlowNode) =>
  node.data.kind === "approval" && node.data.config.name === "Urgent";
```

- 按种类划分的类型别名 `StartNode`、`EndNode`、`ApprovalNode`、`HandleNode`、`ConditionNode`、`CcNode` 不再导出；`FlowNode` / `FlowEdge` 改为 nodeloom 类型的再导出。`AnyNodeData` 仍然导出。
- 内部 store 已重构；通过 `useEditorStore` 做选择的宿主需要适配新的 `EditorState` 形状。
- **线上(wire)格式未受影响。** `toFlowDefinition` / `fromFlowDefinition` 以及 `NodeDefinition`(`value` / `onChange`)契约保持不变，已保存的流程定义无需迁移即可加载。

### 新特性

- **approval-flow-editor** — 新增 `plugins.globalSubjects`(`FormFieldDefinition[]`)，将宿主声明的全局主体注入条件构建器，与内置发起人属性和 `formFields` 并列。参见[宿主集成](../editors/approval-flow-editor/host-integration.md#globalsubjects)。
- **starter** — `Login` 组件会显示登录和挑战(challenge)错误，不再静默失败。

### 依赖

- `components` 现在要求 `antd@^6.4.5`(此前为 `^6.4.3`)。同一批改动中，`starter` 从已废弃的 antd `Alert` `message` / `onClose` 属性迁移到 `title` / `closable`——如果你的应用自己的告警仍在使用废弃属性，请规划同样的迁移。

## v2.6.0 (2026-06-25)

无破坏性变更。

### 新特性

- **form-editor** — `FormEditor` 新增 `publishText` 和 `publishLoading` 属性，用于自定义工具栏的发布动作。
- **form-editor** — 表格存储的列类型现在根据字段控件推断，不再默认为无类型。

## v2.5.0 (2026-06-25)

### 行为变更：`AppItem.icon` 改为 `ReactNode`

starter 应用切换器的 `AppItem.icon` 从 kebab-case 的 lucide 图标*名称*(`icon?: string`，经 `DynamicIcon` 解析)改为可直接渲染的节点(`icon?: ReactNode`，按原样渲染)。纯字符串仍能通过类型检查——但现在会被渲染为字面文本。虽然按 minor 发布，但传入图标名称的宿主必须更新：

```tsx
// Before (≤ v2.4.4)
{ id: "crm", name: "CRM", icon: "briefcase" }

// After (≥ v2.5.0)
{ id: "crm", name: "CRM", icon: <DynamicIcon name="briefcase" /> }
```

### 新特性

- **approval-flow-editor** — `ApprovalFlowEditor` 新增 `onPublish` 属性(`(definition: FlowDefinition) => void`)；仅在提供该属性时才渲染工具栏的发布按钮。

## v2.4.1 – v2.4.4 (2026-06-17 – 2026-06-18)

### 破坏性变更(v2.4.1)：精简 ZEN 表达式运行时

`@vef-framework-react/expression` 被裁剪至仅保留基础求值器，form-editor 联动改为经由精简后的运行时。从公开 API 中移除的有：条件编译器(`compileCondition`、`compileGroup`、`compileBranch`、`selectBranch`、`toZenLiteral`)、智能提示 API(`analyzeTypes`、`getCompletionItems`、`getDiagnostics` 等)、语言环境辅助函数以及 React 绑定。剩余部分已在 v2.7.0 中整体删除，因此对该包的任何依赖都应视为 v2.7.0 升级的阻塞项。

### 新特性

- **form-editor** — 停靠(docked)与抽屉(drawer)两种编辑器布局模式、表格子表单的按列宽度、更宽的折叠组件面板栏，以及设计器中以列表格形式展示表格子表单(均为 v2.4.1)。
- **components** — `ScrollArea` 新增 `scrollbars` 轴向选项(v2.4.1)。

### 值得关注的修复

- **starter** — 一系列顶部菜单修复：溢出项折叠进"更多"指示器且不再溢出(v2.4.2、v2.4.3)；菜单访问检查与路由模板匹配(v2.4.2)；菜单以 path + params + search 标识，使参数化路由能各自高亮(v2.4.3)。`UserMenu.meta` 的 params/search 也相应补齐了类型(v2.4.4)。
- **core** — 令牌过期的请求在静默刷新后以重试的响应结算，而不是抛出原始的 401(v2.4.2)。
- **build** — 包的类型声明保持扁平地放在 `dist/types` 下，修复了消费方的类型解析问题(v2.4.1)。

## 更早的版本(v2.4.0 之前)

v2.4.0(2026-06-15)是首个公开发布版本；仓库的 git 历史从这里开始，更早的变更只能依据文档而非提交记录来概述。

在本文档中仍会遇到的一项早期迁移：**v2.1.6 将 VEF 的页面与 CRUD 组件从 `@vef-framework-react/starter` 移动到 `@vef-framework-react/components`**——包括 `Page`、`Crud` / `CrudPage`、`ProTable`、`ProSearch`、`FlexCard`、`FormModal` 和 `FormDrawer`——并在 `components` 中引入了 `LogoIcon`。如果你的代码库来自 2.1.6 之前，请把这些导入从 `starter` 更新为 `components`；[组件](../components/overview.md)中每个受影响的页面都带有相同的提示。
