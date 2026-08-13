---
title: 集成包概览
description: "@vef-framework-react/integration 提供什么——集成引擎的契约、系统、适配器、路由与码表管理页面，以及运维控制台。"
---

# 集成包概览

`@vef-framework-react/integration`（v2.15.0，随框架 v2.15.0 于 2026‑08‑07 发布）是 VEF 服务端集成引擎的前端控制台——该子系统在稳定、经 schema 校验的契约背后，通过脚本化适配器与外部厂商系统对话。

## 何时使用

- 你的 VEF 服务端运行了集成引擎，你想把六个组件挂到路由上就得到它的完整管理 UI——包括脚本调试控制台。
- 你在构建与集成相邻的屏幕（例如一个挑选契约的业务页面），需要有类型的 API hook（`useContractApi`、`useOpsApi`……）、目录（`useSystemDirectory`、`useContractDirectory`）与展示组件，而不是裸的 RPC 调用。

## 领域模型

引擎的各领域与包的权限组和页面一一对应:

| 领域 | 资源 | 是什么 | 页面 |
| --- | --- | --- | --- |
| 契约 | `integration/contract` | 一个标准操作: 每个提供方适配器都必须遵守的输入/输出 JSON Schema | [`IntegrationContractPage`](./pages.md#integrationcontractpage) |
| 系统 | `integration/system` | 一个外部系统实例: Base URL、出站/入站认证、可选的直连数据源、信封脚本、重试策略 | [`IntegrationSystemPage`](./pages.md#integrationsystempage) |
| 适配器 | `integration/adapter` | 一个系统到契约、单一方向的绑定: 在系统的 wire 格式与契约模型之间转换的脚本 | [`IntegrationAdapterPage`](./pages.md#integrationadapterpage) |
| 路由 | `integration/route` | 把路由键（租户、分支机构、院区）映射到为契约提供服务的系统的规则 | [`IntegrationRoutePage`](./pages.md#integrationroutepage) |
| 码表 | `integration/code_map`（+ `integration/code_set` 目录） | 按系统对一个[码集](../../guide/code-sets.md)在标准模型与外部系统编码之间做双向值转换 | [`IntegrationCodeMapPage`](./pages.md#integrationcodemappage) |
| 日志 | `integration/log` | 已记录的调用，捕获内容经脱敏且限长 | 控制台 → 调用日志 |
| 运维 | `integration/ops`（+ `sys/monitor` 统计） | 试运行（dry-run）、连接探测、路由诊断、按节点统计 | [`IntegrationConsolePage`](./pages.md#integrationconsolepage) |

一次出站调用的流向是*宿主 → 契约 → 路由 → 系统 → 适配器脚本 → 厂商*；一次入站投递的流向是*厂商 → 系统（入站认证）→ 适配器脚本 → `dispatch` → 业务处理器*。

## 控制台工作台设计

v2.12.0 周期把所有集成页面按*控制台工作台*布局重新设计（提交 `bdcd65f`、`b0cb7b1`；审批包在 `17830fd` 中采用了同一模式）:

- **全高屏幕、内部滚动。** 页面撑满视口；面板瓜分剩余高度并各自内部滚动（表格滚动自己的主体；试运行的请求/结果卡片是并排的网格单元，窄视口下改为堆叠）。标签页式控制台使用 [`FlexTabs`](../../components/flex-tabs.md)，每个面板自行掌控高度。
- **顶部标签的抽屉表单。** 新增/更新表单以宽抽屉打开（响应式宽度，最小断点下为 `100vw`），采用垂直标签布局——独立输入用共享的 [`Labeled`](../../components/labeled.md) 组件包裹——并分组为带标题的区块（[`FormSection`](./reference.md#formsection)），仅凭区块头部的开关就能看出一条记录具备哪些可选能力。

## 编辑器细节

多个编辑界面带有理解引擎的辅助能力:

- **从运行时镜像的脚本补全**（`c56d318`，于 `094a9c6` 对齐）。每个脚本编辑器（适配器脚本、信封请求/响应脚本、出站/入站认证脚本、试运行控制台）提供的补全，恰好就是 Go 运行时在该界面安装的绑定与能力库——`input`、`request`、`system`、`http`、`sql`、`codes`、`dispatch`、`errors`，加上引擎基线（`console`、`crypto`、`cache`、`dayjs`、`BigNumber`、`fxp`、`radashi`、`z`、`URL`、`URLSearchParams`）。这些目录存放在 [`ScriptDoc`](./reference.md#脚本文档) 常量中，你可以在自己的编辑器里复用。
- **可悬停的脚本文档**（`ef47059`）。每个脚本字段的标签带一个帮助图标（[`ScriptDocLabel`](./reference.md#scriptdoclabel)）；悬停会展开该界面的契约摘要与完整的绑定/库清单——渲染自*同一份*补全目录，因此弹层与自动补全永远不会各说各话。
- **感知认证方案的参数编辑器**（`ac4f860`）。系统的出站/入站认证表单为参数集固定的方案渲染专属输入框（`http_basic` 的用户名/密码、`bearer` 的 token、`signature` 的 app id/secret、入站 `ip` 白名单），只在参数名由用户自定义的场合（`header`、`query`、`script` 及未知的自定义方案）渲染自由的名称→值对列表，`none` 则什么都不渲染。敏感值加密存储并以 `******` 掩码返回——原样提交掩码即保留已存储的密钥。切换方案会清理上一方案遗留的参数（`67dfda1`）。
- **契约标签**（`a261401`、`8314fbc`）。契约携带宿主自有的 `labels`（用共享的 `LabelsEditor` 内联编辑并内联校验），契约列表可按标签筛选，`useContractDirectory(search)` 接受标签筛选——业务侧选择器由此可以只提供为其场景打了标签的契约。
- **JSON Schema 关键字补全**（`c826041`）。契约表单的输入/输出 schema 编辑器把 JSON Schema draft 2020‑12 关键字作为对象键补全，并附每个关键字的文档。
- **报文追踪（wire-trace）正文高亮**（`c826041`）。捕获的 HTTP 交换正文会被自动识别: JSON 正文重新缩进并高亮，XML 原样高亮，其余回退为纯文本块——在调用日志详情与试运行追踪中皆是如此。
- **对照宿主目录的码表编辑**（`cf2fd15`）。适配器脚本用 `codes.toExternal` / `codes.toCanonical` 转换值；码表表单从宿主注册的目录（`integration/code_set.list_code_sets`，自动填充名称）中挑选码集，宿主未注册可枚举目录时回退为手动自由文本。条目编辑器在输入标准值时提示宿主标准码，并在宿主目录支持时把所选码集的标准码列成参考行（`72353da`）。
- **传输编码的脚本请求体**（`ca2a738`）。携带脚本资源的创建/更新请求体（系统出站/入站认证脚本、信封脚本、适配器脚本以及试运行控制台）使用 `gzip+base64` 传输编码，以通过会检查请求载荷的中间件。

## 挂载页面

不需要 provider——把每个页面直接挂在路由上。playground 使用 `/sys/integration-*`:

```tsx
// routes/sys/integration-system/route.tsx
import { createFileRoute } from "@tanstack/react-router";
import { IntegrationSystemPage } from "@vef-framework-react/integration";

export const Route = createFileRoute("/_layout/sys/integration-system")({
  component: () => <IntegrationSystemPage />
});
```

菜单中的推荐顺序与依赖链一致: 契约 → 系统 → 适配器 → 路由 → 码表 → 控制台。各页面的权限与端点见[页面](./pages.md)，完整导出表见 [API 参考](./reference.md)。

## 权限模型

`INTEGRATION_PERMISSIONS` 逐字镜像后端权限码: 每个 CRUD 领域（`contract`、`system`、`adapter`、`route`、`codeMap`）标准的 `query`/`create`/`update`/`delete`，只读的 `log.query`，以及四个运维码（`ops.dry_run`、`ops.dry_run_inbound`、`ops.test_connection`、`ops.diagnose_routes`）。宿主码集目录端点复用 `codeMap.query`——该目录只为支撑映射编辑器而存在。每个页面都接受 `permissions` 覆盖；见[权限](../../guide/permissions.md)。
