---
title: Integration API Reference
description: Exhaustive reference for every export of @vef-framework-react/integration — permissions, API hooks, presentation components, script documentation catalogs, and wire types.
---

# Integration API Reference

Everything exported from the root of `@vef-framework-react/integration`, grouped as in the source: [permissions](#permissions), [API hooks](#api-hooks), [components](#components), [script documentation](#script-documentation), and [types](#types). Page components and their props are covered in [Pages](./pages.md).

`QueryFunction<TData, TParams>` / `MutationFunction<TData, TParams>` are the framework's keyed function shapes from `@vef-framework-react/core`; `PaginatedQueryParams<TSearch>` is the ProTable query shape from `@vef-framework-react/components`; `ApiResult<T>` is the standard response envelope.



## Permissions

### `INTEGRATION_PERMISSIONS`

`const` — permission codes for the integration engine management API, mirroring the backend `RequiredPermission` strings verbatim. Every page defaults its gates to the matching entry and accepts overrides through its `permissions` prop. See [Permissions](../../guide/permissions.md).

| Group.key | Code | Gates |
| --- | --- | --- |
| `contract.query` | `integration.contract.query` | Contract list / directory |
| `contract.create` | `integration.contract.create` | Create contract |
| `contract.update` | `integration.contract.update` | Update contract |
| `contract.delete` | `integration.contract.delete` | Delete contract(s) |
| `system.query` | `integration.system.query` | System list / directory |
| `system.create` | `integration.system.create` | Create system |
| `system.update` | `integration.system.update` | Update system |
| `system.delete` | `integration.system.delete` | Delete system(s) |
| `adapter.query` | `integration.adapter.query` | Adapter list |
| `adapter.create` | `integration.adapter.create` | Create adapter |
| `adapter.update` | `integration.adapter.update` | Update adapter |
| `adapter.delete` | `integration.adapter.delete` | Delete adapter(s) |
| `route.query` | `integration.route.query` | Route list |
| `route.create` | `integration.route.create` | Create route |
| `route.update` | `integration.route.update` | Update route |
| `route.delete` | `integration.route.delete` | Delete route(s) |
| `codeMap.query` | `integration.code_map.query` | Code map list **and** the host code-set catalog queries (the catalog exists solely to support the mapping editor) |
| `codeMap.create` | `integration.code_map.create` | Create code map |
| `codeMap.update` | `integration.code_map.update` | Update code map |
| `codeMap.delete` | `integration.code_map.delete` | Delete code map(s) |
| `log.query` | `integration.log.query` | Invocation log query (also the console's default stats gate) |
| `log.replay` | `integration.log.replay` | Replay a recorded invocation from the log detail |
| `ops.dryRun` | `integration.ops.dry_run` | Outbound dry run |
| `ops.dryRunInbound` | `integration.ops.dry_run_inbound` | Inbound dry run |
| `ops.testConnection` | `integration.ops.test_connection` | Connection probe |
| `ops.diagnoseRoutes` | `integration.ops.diagnose_routes` | Routing diagnosis |

Type exports: `IntegrationPermissions` (`typeof INTEGRATION_PERMISSIONS`) and one alias per group — `ContractPermissionCodes`, `SystemPermissionCodes`, `AdapterPermissionCodes`, `RoutePermissionCodes`, `CodeMapPermissionCodes`, `LogPermissionCodes`, `OpsPermissionCodes`.

## API hooks

### Query plumbing

| Export | Signature | Description |
| --- | --- | --- |
| `API_PATH` | `const "/api"` | The framework RPC endpoint every management call posts to. |
| `splitQueryParams` | `<TSearch extends AnyObject>(queryParams: PaginatedQueryParams<TSearch>) => { params: Omit<PaginatedQueryParams<TSearch>, typeof SYMBOL_PAGINATION>; pagination: PaginationParams \| undefined }` | Splits ProTable's symbol-keyed query params into plain search params and the pagination metadata (sent as request meta). The sort symbol stays on `params`; JSON serialization drops it. |

### `CrudApi` and `createCrudApi`

```ts
interface CrudApi<TRow extends { id: string }, TParams, TSearch extends AnyObject> {
  findPage: QueryFunction<PaginationResult<TRow>, PaginatedQueryParams<TSearch>>;
  create: MutationFunction<ApiResult<unknown>, TParams>;
  update: MutationFunction<ApiResult<unknown>, TParams>;
  remove: MutationFunction<ApiResult<unknown>, TRow>;       // sends { id: row.id } to "delete"
  removeMany: MutationFunction<ApiResult<unknown>, TRow[]>; // sends { pks: [...] } to "delete_many"
}
```

The query and mutation functions for one CRUD resource, shaped to plug straight into `CrudPage`: `findPage` is its `queryFn`, `create`/`update` its `formMutationFns`, and `remove`/`removeMany` its delete mutation fns (both receive the row objects, mirroring the framework's CRUD contract — see [Crud](../../components/crud.md)).

`createCrudApi<TRow, TParams, TSearch>(apiClient: ApiClient, resource: string, keyPrefix: string, bodyEncoding?: BodyEncoding): CrudApi<TRow, TParams, TSearch>` builds that set against the app's API client; `keyPrefix` namespaces the TanStack Query cache keys. The optional `bodyEncoding` transport-encodes create/update bodies — `useSystemApi` and `useAdapterApi` pass `"gzip+base64"` so script-carrying resources survive middleboxes that inspect request payloads. Useful for host-defined resources that follow the same wire contract.

### Resource CRUD hooks

Each returns a memoized `CrudApi` bound to its resource:

| Hook | Returns | Resource |
| --- | --- | --- |
| `useContractApi` | `CrudApi<Contract, ContractParams, ContractSearch>` | `integration/contract` |
| `useSystemApi` | `CrudApi<System, SystemParams, SystemSearch>` | `integration/system` |
| `useAdapterApi` | `CrudApi<Adapter, AdapterParams, AdapterSearch>` | `integration/adapter` |
| `useRouteApi` | `CrudApi<Route, RouteParams, RouteSearch>` | `integration/route` |
| `useCodeMapApi` | `CrudApi<CodeMap, CodeMapParams, CodeMapSearch>` | `integration/code_map` |

### `useLogApi`

`() => LogApi` — the invocation log resource: the page query, plus replay. Rows carry the full captures, so the detail view reads from the row rather than a separate fetch.

| Function | Type | Operation |
| --- | --- | --- |
| `findPage` | `QueryFunction<PaginationResult<InvocationLog>, PaginatedQueryParams<LogSearch>>` | `integration/log.find_page` |
| `replay` | `MutationFunction<ReplayResult, ReplayParams>` | `integration/log.replay` — a mutation, because it is triggered imperatively and an outbound replay's calls are real; the request body is sent `gzip+base64` |

### `useOpsApi`

`() => OpsApi` — the operational actions of the integration engine. Each is a **mutation** because it is triggered imperatively and its calls have real effects.

| Function | Type | Operation |
| --- | --- | --- |
| `dryRun` | `MutationFunction<DryRunResult, DryRunParams>` | `integration/ops.dry_run` (body encoded with `gzip+base64`) |
| `dryRunInbound` | `MutationFunction<InboundDryRunResult, DryRunInboundParams>` | `integration/ops.dry_run_inbound` (body encoded with `gzip+base64`) |
| `testConnection` | `MutationFunction<ConnectionCheck, TestConnectionParams>` | `integration/ops.test_connection` |
| `diagnoseRoutes` | `MutationFunction<RouteDiagnostics, void>` | `integration/ops.diagnose_routes` |

### `useStatsApi`

`() => StatsApi` — per-node invocation statistics, served by the monitor resource.

| Function | Type | Operation |
| --- | --- | --- |
| `getStats` | `QueryFunction<IntegrationStatsResult>` | `sys/monitor.get_integration_stats` |

### `useCodeSetApi`

`() => CodeSetApi` — the host canonical code catalog behind the mapping editor. Both queries report `supported: false` when the host registered no enumerable catalog (`mold.CodeSetInspector`), and the editor degrades to free-text input. See the [code set guide](../../guide/code-sets.md).

| Function | Type | Operation |
| --- | --- | --- |
| `listCodeSets` | `QueryFunction<CodeSetCatalog, object>` | `integration/code_set.list_code_sets` |
| `listCodes` | `QueryFunction<CodeCatalog, { codeSet: string }>` | `integration/code_set.list_codes` |

## Components

Each component's props interface is exported under the `<Component>Props` name (`AuthParamsFieldsProps`, `FormSectionProps`, `JsonViewProps`, `ParamsEditorProps`, `ScriptDocLabelProps`, `TestConnectionDrawerProps`) with exactly the fields tabled below.

### Directories

`Directory<T>` — a loaded set of definitions, ready for select options and id→entry lookups:

| Field | Type | Description |
| --- | --- | --- |
| `items` | `T[]` | The loaded rows (empty while loading). |
| `byId` | `Map<string, T>` | Id → entry lookup. |
| `options` | `Array<{ label: string; value: string }>` | Select options labeled `名称（编码）`, valued by id. |
| `loading` | `boolean` | Query in flight. |

| Hook | Signature | Description |
| --- | --- | --- |
| `useSystemDirectory` | `() => Directory<System>` | All systems (`integration/system.find_all`). |
| `useContractDirectory` | `(search?: ContractSearch) => Directory<Contract>` | Contracts (`integration/contract.find_all`), optionally narrowed by search filters — a business-side picker passes `{ labels: {...} }` to offer only the contracts tagged for its scene. Pass a **stable reference** (module constant or memoized), not a fresh object literal each render. |

### Auth parameter editing

`AuthParamFieldSpec` — one dedicated input of a fixed-parameter auth scheme:

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `name` | `string` | — | The key written into the auth config's params record. |
| `label` | `string` | — | The input label. |
| `placeholder` | `string` | — | Concise format hint shown while the input is empty. |
| `hint` | `string` | — | Secondary line rendered under the input. |
| `sensitive` | `boolean` | — | Encrypted at rest; the management API masks it back as `******`. Renders a password input. |
| `rows` | `number` | — | Render a textarea with this many rows instead of a single-line input. |
| `span` | `number` | `12` | Grid span out of 24. |

`AuthParamsSpec` — how a scheme's parameters are edited:

```ts
type AuthParamsSpec =
  | { kind: "none" }
  | { kind: "fixed"; fields: AuthParamFieldSpec[] }
  | { kind: "pairs"; label: string; hint?: string; namePlaceholder?: string; valuePlaceholder?: string };
```

| Export | Signature | Description |
| --- | --- | --- |
| `resolveAuthParamsSpec` | `(direction: Direction, scheme: string) => AuthParamsSpec` | Resolves the parameter shape of a scheme from the built-in spec tables (mirroring the backend's outbound/inbound scheme registries). Custom schemes registered on the backend are unknown here, so they keep the free pair list. |
| `pruneAuthParams` | `(direction: Direction, scheme: string, params: Record<string, string>) => Record<string, string>` | Collapses a params record to what the selected scheme actually declares: fixed schemes keep only their declared, non-blank fields (dropping keys left over from a previously selected scheme), `none` submits nothing, pair schemes pass through untouched. |
| `AuthParamsFields` | `(props: AuthParamsFieldsProps) => JSX.Element \| null` | The scheme-aware editor: dedicated inputs for fixed schemes (with a footnote when any field is sensitive), the pair list only where names are user-defined, nothing for `none`. |

`AuthParamsFieldsProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `direction` | `Direction` | — | Which flow the scheme belongs to; decides the spec vocabulary. |
| `scheme` | `string` | — | The selected scheme name. |
| `value` | `Record<string, string> \| undefined` | — | The auth config's params record. |
| `onChange` | `(value: Record<string, string>) => void` | — | Emitted with the next record on every edit. |

### `FormSection`

A titled group of form fields. Optional capabilities put their enable switch in `extra` and render children only while enabled, so the header row alone tells which capabilities a record has.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `ReactNode` | — | Section name shown in the header. |
| `description` | `ReactNode` | — | One-line explanation of what the section configures, under the title. |
| `extra` | `ReactNode` | — | Right slot of the header — typically the switch enabling the section. |
| `children` | `ReactNode` | — | Body fields (omitted body renders header only). |

### `JsonView`

A read-only, pretty-printed JSON view built on the [code editor](../../components/code-editor.md).

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `JsonValue` | — | The value to render (`JSON.stringify(value, null, 2)`). |
| `height` | `number` | `160` | Editor height. |

### `ParamsEditor`

A key-value editor over a `Record<string, string>`, bridging it to the array-shaped `EditableTable` with synthetic row ids. Resyncs when the parent replaces `value` externally (form reset, loading a record); rows with an empty key are dropped from the emitted record.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Record<string, string> \| null` | — | The record to edit. |
| `onChange` | `(value: Record<string, string>) => void` | — | Emitted on every edit. |
| `nameTitle` | `string` | `"参数名"` | Column header for the key column. |
| `valueTitle` | `string` | `"参数值"` | Column header for the value column. |
| `namePlaceholder` | `string` | `nameTitle` | Placeholder of the key editor. |
| `valuePlaceholder` | `string` | `valueTitle` | Placeholder of the value editor. |

### `ScriptDocLabel`

A script-editor label with a help icon: hovering it opens the surface's full documentation (contract summary, bindings, libraries and functions), rendered from the completion catalog so the two can never drift apart.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | `ReactNode` | — | The visible label text the help icon follows. |
| `doc` | `ScriptDoc` | — | The script surface's documentation — the same catalog that powers the editor's completions. |

### `TestConnectionDrawer`

A drawer that probes a saved system's configured transports (HTTP and database) and shows what each probe found. The HTTP method/path inputs only render when the system actually has a Base URL to probe; probe state resets when the drawer targets a different system.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `open` | `boolean` | — | Drawer visibility. |
| `system` | `System \| null` | — | The system to probe. |
| `onClose` | `() => void` | — | Close handler. |

### `WireTraceTimeline`

The captured HTTP exchanges of an invocation, rendered as a timeline: method + URL + status tag + duration per exchange, with error text and highlighted request/response bodies (JSON re-indented, XML verbatim, other text plain). The trace may be `null` (an invocation that issued no HTTP call serializes to a null slice), which reads as an empty state.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `trace` | `HttpExchange[] \| null \| undefined` | — | The captured exchanges. |

### Status tags

| Component | Props | Renders |
| --- | --- | --- |
| `DirectionTag` | `{ direction: Direction }` | The flow direction with distinct hues (outbound blue, inbound purple). |
| `EnabledTag` | `{ enabled: boolean }` | 启用 / 停用 as success/neutral. |
| `FailureKindTag` | `{ failureKind?: FailureKind \| "" \| null }` | A success tag when there is no failure, else the classified failure. |
| `FindingKindTag` | `{ kind: RouteFindingKind }` | A routing-diagnosis finding kind, colored by severity. |

### Label and color constants

| Export | Type | Notes |
| --- | --- | --- |
| `DIRECTION_LABELS` | `Record<Direction, string>` | 出站 / 入站. |
| `DIRECTION_OPTIONS` | `Array<{ label: string; value: Direction }>` | Derived from the labels. |
| `FAILURE_KIND_LABELS` | `Record<FailureKind, string>` | One label per failure classification. |
| `ROUTE_FINDING_KIND_LABELS` | `Record<RouteFindingKind, string>` | One label per finding kind. |
| `OUTBOUND_AUTH_SCHEME_LABELS` | `Record<string, string>` | Labels for the built-in outbound schemes. |
| `INBOUND_AUTH_SCHEME_LABELS` | `Record<string, string>` | Labels for the built-in inbound schemes. |
| `DIRECTION_COLORS` | `Record<Direction, string>` | antd Tag color tokens (theme-aware). |
| `FAILURE_KIND_COLORS` | `Record<FailureKind, string>` | Warning/error scenes by severity (`canceled` is neutral). |
| `ROUTE_FINDING_SEVERITY` | `Record<RouteFindingKind, "error" \| "warning">` | Broken routes are errors; gaps are warnings. |

### Formatters

| Export | Signature | Description |
| --- | --- | --- |
| `formatTimestamp` | `(value?: string \| null) => string` | Formats a backend timestamp for display, or a dash when empty. |

## Script documentation

`ScriptDoc` — one script surface's documentation: the contract in one line plus the bindings and libraries available to it. `entries` doubles as the editor's completion catalog, so the doc popover and the autocomplete never drift:

| Field | Type | Description |
| --- | --- | --- |
| `summary` | `string` | What the script receives and what its return value means. |
| `entries` | `CompletionEntry[]` | The surface's bindings and libraries (the [code editor](../../components/code-editor.md) completion shape). |

The catalogs mirror the bindings and capability libraries the Go runtime actually installs (`internal/integration/exec` + `internal/integration/auth` + the JS engine baseline) and must stay in lockstep with the backend:

| Export | Surface | Key bindings beyond the baseline |
| --- | --- | --- |
| `adapterScriptDoc(direction: Direction): ScriptDoc` | Adapter scripts, per direction | Outbound: `input` (schema-validated contract input), `system`, `http`, `sql`, `codes`, `errors`. Inbound: `request` (the delivered vendor request), `system`, `dispatch(input)` (validate + run the business handler), `codes` — deliberately no `http` / `sql`. |
| `ENVELOPE_REQUEST_SCRIPT_DOC` | System envelope, request side | `request` (the adapter's outgoing request; return the rewritten request, omitted fields keep their values), `system`, `errors`. |
| `ENVELOPE_RESPONSE_SCRIPT_DOC` | System envelope, response side | `response` (the completed upstream response; the return value replaces the Response object as the call's result), `system`, `errors`. |
| `OUTBOUND_AUTH_SCRIPT_DOC` | Outbound auth `script` scheme | `request` (the fully built outbound request, read-only), `params` (decrypted auth params); return the credential headers to add. Runs in a zero-IO sandbox. |
| `INBOUND_AUTH_SCRIPT_DOC` | Inbound auth `script` scheme | `request` (the delivered request), `params` (decrypted verification params); return truthy to grant. Zero-IO sandbox. |

The always-on engine baseline in every catalog: `console` (framework logging), `crypto` (md5/sha1/sha256/sha512/sm3, `hmac`, base64/hex codecs, `uuid`), `cache` (in-process TTL cache), `dayjs`, `BigNumber` (bignumber.js), `fxp` (fast-xml-parser), `radashi`, `z` (zod), `URL`, `URLSearchParams`.

## Types

### Base and JSON

| Type | Shape | Notes |
| --- | --- | --- |
| `CreationAudited` | `{ id: string; createdAt?: string; createdBy?: string }` | Mirrors `orm.CreationAuditedModel`. |
| `FullAudited` | `CreationAudited & { updatedAt?: string; updatedBy?: string }` | Mirrors `orm.FullAuditedModel`. |
| `JsonValue` | `string \| number \| boolean \| null \| JsonValue[] \| { [key: string]: JsonValue }` | Type-safe arbitrary payloads. |
| `JsonObject` | `Record<string, JsonValue>` | JSON object value. |

### Enums and constants

Each mirrors a Go enum verbatim; display labels and colors live with the presentation components, not here.

| Export | Values | Notes |
| --- | --- | --- |
| `DIRECTIONS` / `Direction` | `"outbound" \| "inbound"` | The two integration flows an adapter can implement. |
| `FAILURE_KINDS` / `FailureKind` | `"input_invalid" \| "output_invalid" \| "upstream" \| "transport" \| "timeout" \| "canceled" \| "script" \| "config" \| "auth" \| "handler"` | How a failed invocation is classified, across the log, stats and API errors. |
| `ROUTE_FINDING_KINDS` / `RouteFindingKind` | `"dangling_adapter" \| "wildcard_gap" \| "disabled_system" \| "disabled_contract" \| "uncovered_contract"` | Routing-diagnosis finding classification. |
| `OUTBOUND_AUTH_SCHEMES` / `OutboundAuthScheme` | `"none" \| "http_basic" \| "bearer" \| "header" \| "query" \| "signature" \| "script"` | Built-in outbound auth schemes. |
| `INBOUND_AUTH_SCHEMES` / `InboundAuthScheme` | `"none" \| "ip" \| "http_basic" \| "bearer" \| "header" \| "query" \| "signature" \| "script"` | Built-in inbound schemes; `ip` is inbound-only — a source address is verifiable only on receive. |
| `DATA_SOURCE_MODES` / `DataSourceMode` | `"read_only" \| "read_write"` | How far a system's data source lets adapter scripts go; empty means read-only. |
| `UNMAPPED_POLICIES` / `UnmappedPolicy` | `"reject" \| "passthrough" \| "fallback"` | How a code map answers a lookup no entry matches (reject fails closed and is the default). |
| `MASKED_SECRET` | `"******"` | The placeholder the management API returns in place of a stored secret. Submitting it back on update keeps the existing value unchanged. |

### Contract

| Type | Fields | Notes |
| --- | --- | --- |
| `JsonSchema` | `JsonObject` | A self-contained JSON Schema (draft 2020‑12) document. |
| `Contract` | extends `FullAudited` + `code: string`, `name: string`, `description?: string \| null`, `labels?: Record<string, string> \| null`, `inputSchema?: JsonSchema \| null`, `outputSchema?: JsonSchema \| null`, `isEnabled: boolean` | A standard integration operation. `labels` are host-owned selection metadata; the engine stores and filters, never interprets. |
| `ContractParams` | `id?: string`, `code`, `name` (`string`), `description?: string \| null`, `labels?: Record<string, string>`, `inputSchema?: JsonSchema \| null`, `outputSchema?: JsonSchema \| null`, `isEnabled: boolean` | Create/update payload; `id` empty on create. |
| `ContractSearch` | `code?`, `name?` (`string`), `isEnabled?: boolean`, `labels?: Record<string, string>` | Label filter is equality: every pair must match (unlabeled contracts never match). |

### System

`DataSourceConfig` — a system's direct database connection (vendor views / exchange tables). The password is stored encrypted and masked in management responses:

| Field | Type | Description |
| --- | --- | --- |
| `kind` | `DbKind` (`string`) | Database kind, mirroring the Go `config.DBKind`; kept broad so the form's option list is the single source of offered values. |
| `mode` | `DataSourceMode?` | Gates script write access; empty means read-only. |
| `host` / `user` / `password` / `database` / `schema` / `path` | `string?` | Connection fields (`path` for SQLite). |
| `port` | `number?` | Port. |
| `sslMode` | `SslMode` (`string`) `?` | SSL mode, mirroring `config.SSLMode`. |
| `sslRootCert` | `string?` | PEM root certificate. |

| Type | Fields | Notes |
| --- | --- | --- |
| `OutboundAuthConfig` | `scheme: string`, `params?: Record<string, string>`, `script?: string` | Values named by the scheme's sensitive parameters arrive masked. `script` carries the custom signing body for the `script` scheme. |
| `OutboundEnvelopeConfig` | `request?: string`, `response?: string` | The common wire structure most vendor APIs repeat, wrapped once at the system level. Either side may be empty, leaving that direction untouched. |
| `InboundAuthConfig` | `scheme: string`, `params?: Record<string, string>`, `script?: string` | Verifies vendor-initiated calls. |
| `RetryPolicy` | `maxAttempts: number`, `initialBackoffMs?: number`, `maxBackoffMs?: number` | Declarative outbound retry. |
| `System` | extends `FullAudited` + `code: string`, `name: string`, `baseUrl?: string`, `outboundAuth?: OutboundAuthConfig \| null`, `outboundEnvelope?: OutboundEnvelopeConfig \| null`, `inboundAuth?: InboundAuthConfig \| null`, `dataSource?: DataSourceConfig \| null`, `params?: Record<string, string> \| null`, `timeoutMs?: number`, `retry?: RetryPolicy \| null`, `isEnabled: boolean` | One external system instance: where it lives and how to authenticate with it in both directions. |
| `SystemParams` | same fields plus `id?: string` | Sensitive values may carry `MASKED_SECRET` to keep the stored secret unchanged. |
| `SystemSearch` | `code?`, `name?` (`string`), `isEnabled?: boolean` | — |

### Adapter

| Type | Fields | Notes |
| --- | --- | --- |
| `Adapter` | extends `FullAudited` + `systemId: string`, `contractId: string`, `direction: Direction`, `script: string`, `timeoutMs?: number`, `isEnabled: boolean` | One system-to-contract binding in one flow direction. |
| `AdapterParams` | `id?: string`, `systemId`, `contractId` (`string`), `direction?: Direction`, `script: string`, `timeoutMs?: number`, `isEnabled: boolean` | An omitted direction is outbound. |
| `AdapterSearch` | `systemId?`, `contractId?` (`string`), `direction?: Direction`, `isEnabled?: boolean` | — |

### Route

| Type | Fields | Notes |
| --- | --- | --- |
| `Route` | extends `FullAudited` + `routeKey: string`, `contractId: string`, `systemId: string`, `isEnabled: boolean` | An empty `contractId` scopes the rule to every contract; an empty `routeKey` is the default route. |
| `RouteParams` | `id?: string`, `routeKey?: string`, `contractId?: string`, `systemId: string`, `isEnabled: boolean` | — |
| `RouteSearch` | `routeKey?`, `contractId?`, `systemId?` (`string`), `isEnabled?: boolean` | — |

### Code map and code-set catalog

| Type | Fields | Notes |
| --- | --- | --- |
| `CodeValue` | `string \| number \| boolean` | The JSON scalar a code map value may hold. Values keep their JSON type end to end (the server stores and emits them verbatim); lookups compare by normalized string form, so `1` and `"1"` address the same entry. |
| `CodeMapEntry` | `canonical: CodeValue`, `external: CodeValue`, `canonicalAliases?: CodeValue[]`, `externalAliases?: CodeValue[]` | One bidirectional mapping pair. Lookups match the primary or any alias; translations always emit the opposite side's primary. |
| `CodeMap` | extends `FullAudited` + `systemId: string`, `codeSet: string`, `name: string`, `entries?: CodeMapEntry[]`, `onUnmapped: UnmappedPolicy`, `fallbackCanonical?: CodeValue`, `fallbackExternal?: CodeValue`, `isEnabled: boolean` | The value translation of one code set between the host's canonical codes and one external system's codes. |
| `CodeMapParams` | same fields plus `id?: string`; `onUnmapped?: UnmappedPolicy` | An omitted policy is `reject`. |
| `CodeMapSearch` | `systemId?`, `codeSet?`, `name?` (`string`), `isEnabled?: boolean` | — |
| `CodeSetInfo` | `codeSet: string`, `name: string` | One code set the host catalog exposes (mirrors `mold.CodeSetInfo`). |
| `CodeInfo` | `code: string`, `label: string` | One code within a host code set. |
| `CodeSetCatalog` | `supported: boolean`, `codeSets?: CodeSetInfo[]` | `supported: false` when the host registered no enumerable catalog — the mapping editor then falls back to free-text input. |
| `CodeCatalog` | `supported: boolean`, `codes?: CodeInfo[]` | The `list_codes` reply for one code set. |

### Log

| Type | Fields | Notes |
| --- | --- | --- |
| `HttpExchange` | `method: string`, `url: string`, `requestHeaders?: Record<string, string>`, `requestBody?: string`, `status?: number`, `responseHeaders?: Record<string, string>`, `responseBody?: string`, `durationMs: number`, `error?: string`, `clientAddr?: string` | One wire exchange captured while an adapter script ran, shared by invocation logs and the dry-run trace. Bodies and header values arrive masked and truncated. `clientAddr` is the caller's network address — only inbound deliveries carry one, and the wire trace shows it. |
| `InvocationOutcome` | `failureKind?: FailureKind \| ""`, `durationMs: number`, `input?: JsonValue`, `output?: JsonValue`, `httpTrace?: HttpExchange[] \| null`, `error?: string \| null` | The outcome of one run — recorded or replayed — with its classification, timing, and masked, size-capped captures. `failureKind` is empty for a successful run. |
| `InvocationLog` | extends `CreationAudited` + `InvocationOutcome` + `systemCode: string`, `contractCode: string`, `direction: Direction`, `requestId: string`, `replayable: boolean` | One recorded invocation. Read-only. `replayable` says whether a replay payload was kept (`vef.integration.log.replay`), so the invocation can be re-run. |
| `ReplayParams` | `id: string`, `script?: string` | The log entry to re-run; `script` runs unsaved editor content in place of the saved adapter script. |
| `ReplayResult` | extends `InvocationOutcome` + `definitionChanged: boolean` | The outcome of re-running a recorded invocation against the current definitions, shaped like the log entry it is compared with. Mirrors the Go `integration.ReplayResult`. `definitionChanged` is set when the contract, system, or adapter was modified after the original invocation, so a different outcome may stem from that edit. |
| `LogSearch` | `systemCode?`, `contractCode?` (`string`), `direction?: Direction`, `failureKind?: FailureKind`, `requestId?: string` | — |

### Ops

| Type | Fields | Notes |
| --- | --- | --- |
| `DryRunParams` | `systemCode: string`, `contractCode: string`, `script?: string`, `input?: JsonValue` | Empty `script` falls back to the saved adapter. |
| `DryRunResult` | `output: JsonValue`, `trace: HttpExchange[] \| null`, `failureKind?: FailureKind \| ""`, `error?: string` | The trace is populated even when the run failed, so operators see how far the script got. |
| `InboundRequestInput` | `method?`, `path?`, `body?` (`string`), `headers?: Record<string, string>`, `query?: Record<string, string>` | The synthetic vendor request of an inbound dry run. |
| `DryRunInboundParams` | `systemCode: string`, `contractCode: string`, `script?: string`, `request: InboundRequestInput`, `handlerOutput?: JsonValue` | `handlerOutput` is the stubbed handler's sample. |
| `InboundDryRunResult` | `reply: JsonValue`, `dispatchedInput: JsonValue`, `failureKind?: FailureKind \| ""`, `error?: string` | The reply the vendor would receive plus what the script dispatched — both translation directions verified at once. |
| `TestConnectionParams` | `systemCode: string`, `method?: string`, `path?: string` | Connection probe against a saved system. |
| `HttpProbe` | `reachable: boolean`, `status?: number`, `statusText?: string`, `durationMs: number`, `error?: string` | One probe request against the system base URL. |
| `DatabaseProbe` | `reachable: boolean`, `version?: string`, `durationMs: number`, `error?: string` | One throwaway connection against the system data source. |
| `ConnectionCheck` | `http?: HttpProbe`, `database?: DatabaseProbe` | Each probe is present iff the system configures that transport. |

### Diagnostics and stats

| Type | Fields | Notes |
| --- | --- | --- |
| `RouteFinding` | `kind: RouteFindingKind`, `routeId?: string`, `routeKey: string`, `contractCode?`, `contractName?`, `systemCode?`, `systemName?` (`string`) | `routeKey` is always meaningful (an empty string is the default route); the code/name pairs identify the involved route, contract, and system so the UI needs no extra lookups. |
| `RouteDiagnostics` | `findings: RouteFinding[]` | The point-in-time report of the routing table's configuration gaps. |
| `InvocationStats` | `system: string`, `contract: string`, `direction: Direction`, `calls: number`, `successes: number`, `failures?: Partial<Record<FailureKind, number>>`, `avgDurationMs: number`, `maxDurationMs: number`, `lastError?: string`, `lastErrorAt?: string` | Per-node aggregate of one (system, contract, direction) tuple since process start. |
| `IntegrationStatsResult` | `stats: InvocationStats[]` | The `sys/monitor.get_integration_stats` response envelope. |

Page prop types (`IntegrationContractPageProps`, `IntegrationSystemPageProps`, `IntegrationAdapterPageProps`, `IntegrationRoutePageProps`, `IntegrationCodeMapPageProps`, `IntegrationConsolePageProps`) are exported alongside their components — see [Pages](./pages.md) for their tables.
