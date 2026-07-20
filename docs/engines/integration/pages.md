---
title: Integration Pages
description: Every page component exported by @vef-framework-react/integration — what it renders, which permissions gate it, which endpoints it calls, and how to mount it.
---

# Integration Pages

Six full-page components. No provider is required; the playground mounts them under `/sys/integration-*`. Endpoints are written as `resource.operation` against the framework RPC endpoint `/api`.

Conventions shared by the five CRUD pages:

- Built on `CrudPage` (see [Crud](../../components/crud.md)): inline search, column settings persisted under the page's `columnStorageKey`, drawer forms with vertical labels, and per-row 编辑 / 删除 operations.
- Client-side gates hide buttons; the backend enforces every call (including the list query, via the domain's `query` code).
- Every CRUD page offers row selection with a gated 批量删除 toolbar action, backed by the resource's standard `find_page` / `create` / `update` / `delete` / `delete_many` operations.

## `IntegrationContractPage`

Full-page contract management: list with code/name/enabled/**label** filters, create/update in a wide drawer (responsive: `100vw` → `90vw` → 920px), and delete (single + batch). The form edits code (immutable after create), name, description, host-owned labels (inline `LabelsEditor` with validation), the **input/output JSON Schemas** in code editors with JSON Schema draft 2020‑12 keyword completions (each keyword documented in the popup), and the enabled switch. Schema editors validate that the text is a JSON object; empty means "don't validate that side". Deleting is refused server-side while routes or adapters reference the contract.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `permissions` | `Partial<ContractPermissionCodes>` | `INTEGRATION_PERMISSIONS.contract` | Override the permission codes the page gates its actions on. |
| `columnStorageKey` | `string` | `"integration.contract"` | Storage key for the column-settings panel. |
| `title` | `ReactNode` | — | Optional page title rendered above the table. |

- **Permissions:** 新增契约 → `integration.contract.create` · 编辑 → `integration.contract.update` · 删除 / 批量删除 → `integration.contract.delete`; list enforced by `integration.contract.query`.
- **Endpoints:** `integration/contract.find_page`, `.create`, `.update`, `.delete`, `.delete_many`.
- **Playground route:** `/sys/integration-contract`.

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { IntegrationContractPage } from "@vef-framework-react/integration";

export const Route = createFileRoute("/_layout/sys/integration-contract")({
  component: () => <IntegrationContractPage />
});
```

## `IntegrationSystemPage`

Full-page system management. The drawer form (responsive: `100vw` → `85vw` → 760px) is organized into titled [`FormSection`](./reference.md#formsection) groups whose header switches alone tell which capabilities a system has:

- **基础信息** — code (immutable after create), name, base URL, call timeout, non-sensitive public params (readable from scripts as `system.params`), enabled.
- **出站认证** — scheme select over the built-in outbound schemes (`none` / `http_basic` / `bearer` / `header` / `query` / `signature` / `script`) with the [scheme-aware parameter editor](./overview.md#editor-niceties); the `script` scheme adds a script editor whose label carries hoverable docs (`OUTBOUND_AUTH_SCRIPT_DOC`).
- **出站信封** — optional request-wrap and response-unwrap scripts applied around every adapter HTTP call (`ENVELOPE_REQUEST_SCRIPT_DOC` / `ENVELOPE_RESPONSE_SCRIPT_DOC`).
- **入站回调** — inbound verification scheme (`none` / `ip` / `http_basic` / `bearer` / `header` / `query` / `signature` / `script`; `ip` is inbound-only) with the same parameter editor and script docs (`INBOUND_AUTH_SCRIPT_DOC`).
- **直连数据源** — optional direct database connection (kind, script access mode read-only/read-write, host/port/user/password/database/schema/path/SSL), powering the `sql.*` script capability.
- **重试策略** — declarative outbound retry (max attempts, initial/max backoff).

Sensitive values (passwords, tokens, secrets, encrypted pair values) come back masked as `******`; keeping the mask on update preserves the stored secret. A per-row 测试连接 opens [`TestConnectionDrawer`](./reference.md#testconnectiondrawer), probing whichever transports the system configures (HTTP and/or database).

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `permissions` | `Partial<SystemPermissionCodes>` | `INTEGRATION_PERMISSIONS.system` | Override the permission codes the page gates its CRUD actions on. |
| `testConnectionPermission` | `string` | `INTEGRATION_PERMISSIONS.ops.testConnection` | Permission code for the test-connection action. |
| `columnStorageKey` | `string` | `"integration.system"` | Storage key for the column-settings panel. |
| `title` | `ReactNode` | — | Optional page title rendered above the table. |

- **Permissions:** 新增系统 → `integration.system.create` · 编辑 → `integration.system.update` · 删除 / 批量删除 → `integration.system.delete` · 测试连接 → `integration.ops.test_connection`; list enforced by `integration.system.query`. Deleting a system releases its direct data-source registration.
- **Endpoints:** `integration/system.find_page`, `.create`, `.update`, `.delete`, `.delete_many`; `integration/ops.test_connection`.
- **Playground route:** `/sys/integration-system`.

## `IntegrationAdapterPage`

Full-page adapter management: the per-system-per-contract translation scripts, one per direction. Columns resolve system/contract ids to names via the shared directories. The drawer form (responsive: `100vw` → `90vw` → 960px) edits the owning system and contract, the direction (`outbound` / `inbound`), an optional timeout override, the enabled switch, and the **script** in a code editor with direction-specific completions and hoverable docs (`adapterScriptDoc(direction)`) — outbound scripts see `input` / `system` / `http` / `sql` / `codes` / `errors` plus the engine baseline; inbound scripts see `request` / `system` / `dispatch` / `codes` plus the baseline (deliberately no `http` / `sql`).

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `permissions` | `Partial<AdapterPermissionCodes>` | `INTEGRATION_PERMISSIONS.adapter` | Override the permission codes the page gates its actions on. |
| `columnStorageKey` | `string` | `"integration.adapter"` | Storage key for the column-settings panel. |
| `title` | `ReactNode` | — | Optional page title rendered above the table. |

- **Permissions:** 新增适配器 → `integration.adapter.create` · 编辑 → `integration.adapter.update` · 删除 / 批量删除 → `integration.adapter.delete`; list enforced by `integration.adapter.query`.
- **Endpoints:** `integration/adapter.find_page`, `.create`, `.update`, `.delete`, `.delete_many`; `integration/system.find_all` and `integration/contract.find_all` (directories).
- **Playground route:** `/sys/integration-adapter`.

## `IntegrationRoutePage`

Full-page route management: map route keys to the system serving a contract. The compact drawer form (`100vw` → 480px) edits the route key (empty = the default route, hit by calls that specify no key), the contract scope (a specific contract, or empty = every contract — under one route key an exact contract match wins over the wildcard), the target system, and the enabled switch.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `permissions` | `Partial<RoutePermissionCodes>` | `INTEGRATION_PERMISSIONS.route` | Override the permission codes the page gates its actions on. |
| `columnStorageKey` | `string` | `"integration.route"` | Storage key for the column-settings panel. |
| `title` | `ReactNode` | — | Optional page title rendered above the table. |

- **Permissions:** 新增路由 → `integration.route.create` · 编辑 → `integration.route.update` · 删除 / 批量删除 → `integration.route.delete`; list enforced by `integration.route.query`.
- **Endpoints:** `integration/route.find_page`, `.create`, `.update`, `.delete`, `.delete_many`; directories as above.
- **Playground route:** `/sys/integration-route`.

## `IntegrationCodeMapPage`

:::info Unreleased
Added after v2.12.0 (commits `b403919`, `6ec1938`); ships with the next release.
:::

Full-page [code set](../../guide/code-sets.md) mapping management: per-system bidirectional value translation between the host's canonical coding and the external system's coding. The drawer form (`100vw` → 760px) edits:

- **所属系统** (immutable after create) and the **code set identifier**. On create, when the host registers an enumerable catalog (`mold.CodeSetInspector` on the backend), the identifier is picked from the catalog (`list_code_sets`) and auto-fills the map name; when the catalog reports `supported: false` — or on edit — it falls back to a validated free-text input (letters/digits at the edges, `_ . -` inside, ≤128 chars). Adapter scripts reference the map as `codes.toExternal('<codeSet>', …)`.
- **映射条目** in an editable table: each side holds one primary value and any number of aliases (entered as tags). Aliases only participate in matching; translations always emit the opposite side's primary. Values keep their JSON type (`1` is a number, `"1"` a string quoted literally) — lookups compare by normalized string form. When the host catalog supports it, a reference line lists the canonical codes (with labels) of the selected set.
- **未收录策略** — `reject` (fail closed, default), `passthrough` (return input unchanged), or `fallback` (return the configured per-side fallback values, required when selected). Scripts can override per call with `{ fallback: … }` / `{ passthrough: true }` / `{ reject: true }`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `permissions` | `Partial<CodeMapPermissionCodes>` | `INTEGRATION_PERMISSIONS.codeMap` | Override the permission codes the page gates its actions on. |
| `columnStorageKey` | `string` | `"integration.code_map"` | Storage key for the column-settings panel. |
| `title` | `ReactNode` | — | Optional page title rendered above the table. |

- **Permissions:** 新增码表 → `integration.code_map.create` · 编辑 → `integration.code_map.update` · 删除 / 批量删除 → `integration.code_map.delete`; list and the catalog queries enforced by `integration.code_map.query`. Deleting a map makes adapter scripts that reference it behave as if it were never configured.
- **Endpoints:** `integration/code_map.find_page`, `.create`, `.update`, `.delete`, `.delete_many`; `integration/code_set.list_code_sets`, `.list_codes`; `integration/system.find_all` (directory).
- **Playground route:** `/sys/integration-code-map`.

## `IntegrationConsolePage`

The operations console, tabbed with each tab gated by its own permission and hidden when the caller lacks it (no tabs renders a 403 result):

| Tab | Content | Gate |
| --- | --- | --- |
| 脚本调试台 | The dry-run workbench (below) | shown if the caller has either dry-run code; the run button gates per direction |
| 路由诊断 | On-demand routing diagnosis: run, then read findings grouped by kind (dangling adapter, wildcard gap, disabled system/contract, uncovered contract) | `integration.ops.diagnose_routes` |
| 调用日志 | The invocation log list (time, system, contract, direction, result, duration, request id) with system/contract/direction/failure-kind filters; rows open a detail drawer with input/output JSON, the highlighted wire trace, and the error | `integration.log.query` |
| 运行统计 | Per-node aggregates since process start for each (system, contract, direction) tuple: calls, successes, failure distribution by kind, avg/max duration, last error — with a refresh button | `integration.log.query` (the `statsView` override) |

The **dry-run workbench** is a request → result split (side-by-side, stacking when narrow; both halves scroll internally):

- Direction toggle — *outbound* really calls the external system but writes neither statistics nor invocation logs; *inbound* stubs the business handler (`dispatch` echoes the sample output) and records nothing.
- Target system + contract selects (from the directories), and a script editor with the direction's completions and hoverable docs. **Leaving the script empty runs the saved adapter script** — the fastest way to reproduce a production incident.
- Outbound input: the contract input as JSON. Inbound input: a synthetic vendor request (method, path, headers, query, raw body) plus the handler's sample output (JSON).
- Results: outbound shows the contract output and the wire-trace timeline (populated even when the run failed, so you see how far the script got); inbound shows the reply the vendor would receive and what the script dispatched — both translation directions verified at once. A failure-kind tag classifies errors; results reset the moment the system, contract, or direction changes.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `permissions` | `{ dryRun?, dryRunInbound?, diagnoseRoutes?, logQuery?, statsView? }` (all `string`) | `ops.dry_run`, `ops.dry_run_inbound`, `ops.diagnose_routes`, `log.query`, `log.query` | Override the permission codes gating each console tab. Note `statsView` defaults to the **log** query code — the stats endpoint lives on `sys/monitor`. |
| `title` | `ReactNode` | — | Optional page title. |

- **Endpoints:** `integration/ops.dry_run`, `.dry_run_inbound`, `.diagnose_routes`; `integration/log.find_page`; `sys/monitor.get_integration_stats`; `integration/system.find_all`, `integration/contract.find_all` (directories).
- **Playground route:** `/sys/integration-console`.
