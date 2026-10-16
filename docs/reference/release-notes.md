---
title: Release Notes & Upgrade Guide
description: Per-version breaking changes, features, and notable fixes for every released version plus unreleased changes, with before/after upgrade snippets.
---

# Release Notes & Upgrade Guide

All packages release together from a single repository: one release commit bumps every `packages/*/package.json`, and the release is tagged `vX.Y.Z`. The bump is applied per package relative to its own manifest (the release script runs `pnpm version` in each package), so all packages move by the same increment — but a package added mid-cycle starts from whatever version its scaffold declared, and its number can trail the tag until the repository's `sync-meta` maintenance script realigns it with the root. This is not theoretical: **the v2.12.0 release published `@vef-framework-react/integration` as 2.10.0** while every other package published as 2.12.0.

The upgrade rule is therefore: upgrade every `@vef-framework-react/*` dependency together, each to the version published by the *same* release — [Installation](../getting-started/installation.md) pins the current set. Mixing packages from different releases in one app is not supported.

The package *set* itself can change between releases: v2.7.0 removed `@vef-framework-react/expression`, v2.8.0 added `@vef-framework-react/approval-form-bridge`, v2.12.0 added `@vef-framework-react/approval` and `@vef-framework-react/integration`, and v2.13.0 added `@vef-framework-react/cron` — all are called out below.

Versions are listed newest-first, starting with changes that are merged but not yet released. Each version leads with breaking changes, then features, then fixes worth knowing. Changes to the internal playground demo and repository tooling are omitted.

## v2.30.0 (2026-10-15)

A shared flow may now name specific people, picked by tenant. Breaking changes in the approval packages, which need vef-framework-go v0.64.0 or later: the backend no longer refuses to deploy a shared flow that names users, roles or departments, and lets the people a task or copy was routed to act on it from their own tenant.

### Breaking changes

- **approval-flow-editor** — shared mode no longer forbids anything. `EditorPlugins.shared` disables no assignee / CC kind and no empty-assignee or timeout action, `FlowValidationContext.shared` is removed, and `FlowValidationCode` loses `shared_assignee_names_people`, `shared_cc_names_people`, `shared_fallback_users`, `shared_node_admins` and `shared_timeout_to_admins`; code that switches exhaustively over it drops those branches. Stop passing the option:

  ```ts
  // Before
  validateFlowDefinition(definition, { formFields, shared: flow.isShared });

  // After
  validateFlowDefinition(definition, { formFields });
  ```

### Features

- **approval-flow-editor** — in a shared flow, an assignee or CC rule that picks users or departments asks for the tenant first. `EditorPlugins.tenants` (`TenantOption[]`, each `{ value, label }`) lists the tenants, the row shows a 机构 select, and the picker is handed the choice as the new `PickerProps.tenantId` — disabled until one is picked. The pick is stored as `tenantId` on the rule (`AssigneeDefinition.tenantId`, `CcDefinition.tenantId`): the backend keeps it with the definition and never reads it. Changing the tenant clears the ids; switching a row between user and department keeps it; roles and host catalogs are not per tenant and are picked as before. Without `tenants` a shared flow picks people through the plain pickers. The node-admin and fallback-user lists are not tenant-aware yet. See [Host Integration](../editors/approval-flow-editor/host-integration.md).

  ```tsx
  const UserPicker: FC<PickerProps> = ({ tenantId, value, onChange, disabled }) => {
    const { data } = useQuery({ queryKey: ["users", tenantId], queryFn: () => findUserOptions({ tenantId }) });

    return <Select disabled={disabled} mode="multiple" options={data ?? []} value={value} onChange={onChange} />;
  };

  <ApprovalProvider plugins={{ pickers: { user: UserPicker, department: DepartmentPicker }, tenants }}>
  ```
- **approval** — `ApprovalPlugins.tenants` hands the tenant list to the flow designer. The 全局流程 switch of the designer's basic step now says the flow's approvers and CC recipients may be picked from other tenants.

## v2.29.0 (2026-10-15)

Selection fields can read a host data dictionary directly. No breaking changes; the backend check of dictionary values needs vef-framework-go v0.63.0 or later.

### Features

- **form-editor** — a fourth option source, 数据字典: `{ kind: "codeSet", codeSet }` names a host data dictionary (code set), on a select, a radio group or a checkbox group, a detail-table column included. A form declares no list of dictionaries: `FormRenderer` collects every key its fields read and loads them in one call through the new `codeSetQueryFn` prop — by default the application's `AppContext.codeSetQueryFn`, under the query key `useCodeSetQuery` builds, so a dictionary already loaded is served from the cache. Only a dictionary's top-level entries become options. An unpicked dictionary is a warning (`code_set_empty`). See [Data dictionaries](../editors/form-editor/embedding.md#data-dictionaries).

  ```tsx
  // The field
  { id: "Field_gender", type: "select", key: "gender", label: "性别", dataSource: { kind: "codeSet", codeSet: "sys.user.gender" } }

  // The runtime: nothing to wire where AppContext.codeSetQueryFn is set
  <FormRenderer schema={schema} />
  ```
- **form-editor** — `FormEditor.codeSets` (`CodeSetDescriptor[]`) is the host's dictionary catalog: the 数据字典 source picks from it, searchable by name and key. Without one the key is typed. `FormEditor.codeSetQueryFn` reaches the canvas and the preview, where a dictionary-backed select shows its real entries.
- **approval** — `ApprovalPlugins.codeSets` hands the catalog to the flow designer's form step.
- **approval-form-bridge** — a dictionary projects as `optionSource: { kind: "codeSet", codeSet }` (`ApprovalOptionSourceKind` gains `"codeSet"`) and raises no `options_not_static`: the Go backend checks a submitted value against the dictionary. See [Data-dictionary sources](../editors/approval-form-bridge.md#data-dictionary-sources).

### Fixes worth knowing

- **form-editor** — the option-source switch reads 静态选项 / 数据源 / 远程请求 / 数据字典: the reference to a form data source, formerly 引用数据源, is named after the 数据源 tab it points at, so four options fit the properties panel.
- **form-editor** — code that switches exhaustively over `FieldOptionSource["kind"]` (or `ApprovalOptionSourceKind`) needs a `"codeSet"` branch.

## v2.28.0 (2026-10-15)

A shared flow is now a flow its owner shares rather than a flow of a reserved tenant. Breaking changes in the approval package, which needs vef-framework-go v0.62.0 or later.

### Breaking changes

- **approval** — `SHARED_TENANT_ID` is removed: there is no reserved shared tenant and no shared category any more. A shared flow belongs to a real tenant, which manages it and keeps it under one of its own categories, and is offered to every other tenant through `Flow.isShared`. Create one under its owner with `CreateFlowParams.isShared`, fixed at creation; its code must be unique among every tenant's shared flows (backend code `40026`). In the pages, manage shared flows from their owner's tenant — the flow designer's basic step has a 全局流程 switch for a new flow:

  ```ts
  // Before
  await flowApi.create({ tenantId: SHARED_TENANT_ID, categoryId: sharedCategoryId, ...rest });

  // After
  await flowApi.create({ tenantId: ownerTenantId, isShared: true, categoryId: ownerCategoryId, ...rest });
  ```

  Rows already stored under tenant `"0"` are no longer offered to other tenants: re-create them under a real tenant, or move them to one and set `is_shared`.
- **approval** — `CategorySearch.includeShared` is removed, and `ApprovalDelegationPage`'s category scope offers only the categories of its `tenantId`.

### Features

- **approval** — `FlowSearch.includeShared` adds to `tenantId`'s flows the other tenants' shared flows whose code it has not taken — the flows a start by code finds in that tenant, which is what a picker of a tenant's usable flows needs. Without it, `tenantId` lists the flows the tenant owns, its shared ones included. See [Reference](../engines/approval/reference.md).
- **approval** — `ApprovalFlowPage` tags shared flows 全局 in its list, and its designer derives shared mode from `flow.isShared` (the 全局流程 switch while creating), disabled once the flow exists.

## v2.27.0 (2026-10-14)

Breaking changes in the approval package, which needs vef-framework-go v0.61.0 or later: self-service calls carry no tenant, and flow and category definitions are managed across tenants, gated by permission rather than by the caller's own tenant.

### Breaking changes

- **approval** — self-service calls carry no tenant. `ApprovalInitiatePage`, `StartInstanceDrawer`, `ApprovalTaskCenterPage` and `ApprovalMyInstancesPage` drop their `tenantId` prop; `StartInstanceParams`, `AvailableFlowSearch`, `InitiatedInstanceSearch`, `MyTaskSearch` and `MyCCRecordSearch` drop `tenantId`; `getStartForm` takes `{ flowCode }` and `getPendingCounts` takes no parameters. A start runs in the tenant the caller acts in — from that tenant's own flow with the code, else the shared one — and the task center and my-instances lists show the current user's own work in every tenant; a cross-tenant view of everyone's work is `ApprovalAdminPage`'s. Drop the prop where you passed it:

  ```tsx
  // Before
  <ApprovalInitiatePage tenantId={currentTenantId} />
  <StartInstanceDrawer flowCode={code} tenantId={currentTenantId} onClose={close} />

  // After
  <ApprovalInitiatePage />
  <StartInstanceDrawer flowCode={code} onClose={close} />
  ```

- **approval** — the `tenantId` of `ApprovalFlowPage` and `ApprovalCategoryPage` is the tenant the page manages: it now filters the list as well as stamping what the page creates. The backend no longer checks a definition's tenant against the caller's: `approval/flow` and `approval/category` are gated by their permissions alone, so whoever holds them may manage any tenant's definitions, `SHARED_TENANT_ID` included, and `find_flows` / `find_tree` list every tenant's when the request names none (`FlowSearch.tenantId`, `CategorySearch.tenantId`). Grant the flow and category permissions accordingly. `getGraph`, `findVersions` and `findInitiators` no longer take `tenantId`: they address the flow by id.

### Features

- **approval** — `ApprovalDelegationPage` takes `tenantId`, the tenant whose categories its category scope offers beside the shared ones; omitted, every tenant's are offered. See [Pages](../engines/approval/pages.md).

## v2.26.0 (2026-10-13)

Shared flows, which need vef-framework-go v0.59.0 or later. One breaking change in the approval packages, plus a fix to the filters of CRUD lists in approval, cron and integration.

### Breaking changes

- **approval-flow-editor** — `FlowValidationCode` gains `timeout_admin_users_required` and the five `shared_*` codes below; code that switches exhaustively over it must handle them. `ApprovalInitiatePage`'s `tenantId` no longer defaults to `"default"`, and `StartInstanceParams.tenantId` / `StartInstanceDrawer`'s `tenantId` became optional: the server picks the tenant (v2.27.0 then removes them).

### Features

- **approval** — shared flows. `SHARED_TENANT_ID` (`"0"`, the Go `approval.SharedTenantID`) marks a flow or category owned by no tenant and offered to every tenant beside its own flows; a tenant flow with the same code takes its place within that tenant, and each instance runs in, and belongs to, the tenant that started it. Pass it as the `tenantId` of `ApprovalFlowPage` / `ApprovalCategoryPage` to manage the shared definitions. Categories never span tenants, so the flow designer's category picker reads the flow's own tenant and the category form's parent picker its category's, while the delegation scope picker adds the shared categories with `includeShared`; `CategorySearch` gains `tenantId` and `includeShared`. See [Reference](../engines/approval/reference.md).
- **approval-flow-editor** — `EditorPlugins.shared` puts the editor in shared mode: the assignee / CC kinds whose `selection` picks users, roles or departments, and the empty-assignee / timeout actions handing a task to node admins or named fallback users, are disabled — still listed, so a loaded definition reads as its labels. `validateFlowDefinition`'s `shared` context option mirrors the backend's deploy rule with `shared_assignee_names_people`, `shared_cc_names_people`, `shared_fallback_users`, `shared_node_admins` and `shared_timeout_to_admins`. The approval flow designer sets both from the flow's tenant. See [Host Integration](../editors/approval-flow-editor/host-integration.md).

### Fixes worth knowing

- **approval**, **cron**, **integration** — CRUD reads (`find_page`, `find_all`, `find_tree`) send their filters in the request's `meta`, beside the pagination, where the backend decodes them. They used to travel as `params`, which the backend drops, so the filters of the category tree, the delegation list, the cron schedule and run lists and the integration lists had no effect.
- **approval-flow-editor** — an approval or handle node whose timeout action is `transfer_admin` shows the 节点管理员 picker; it used to appear only for the empty-assignee `transfer_admin` action, though both read `adminUserIds`. `validateFlowDefinition` reports `timeout_admin_users_required` for a node with a deadline that escalates to admins without naming any.

## v2.25.0 (2026-10-13)

No breaking changes. The form designer gains system variables, host diagnostics, and an option-API catalog, and the approval package wires all three. The approval half needs vef-framework-go v0.57.0 or later, whose start form carries `applicant` and whose instance views carry the form-visible `globals`; against an older server, `$applicant` and `$globals` read as empty.

### Features

- **form-editor** — `EvaluationContext` gains `applicant` (`$applicant`), the subject a form is filled on behalf of — in a workflow the initiator, the same for every viewer of a record, unlike `$user` — and `globals` (`$globals`), read-only host attributes. Both are in scope for expressions, scripts, bound data-source parameters, and `$`-rooted leaf conditions. See [Linkage → Host context and system variables](../editors/form-editor/linkage.md#host-context-and-system-variables).
- **form-editor** — `contextSources` declares the form's **system variables**: the 变量 tab lists them, each with a design-time preview value laid over the preview's context (never stored), and the condition builder offers them as a 系统变量 group.
- **form-editor** — `validate` (`SchemaValidator`, returning `SchemaIssue[]`) layers a host's own checks over the editor's: called only for a structurally sound schema, its issues join the status-bar diagnostics and the publish gate. The status-bar chip now opens on click and lists every issue; clicking one selects the node it is about (switching device when needed) or opens its form-config tab, and a host path written as a field-key chain (`lines.price`) locates the field. See [Embedding → Host diagnostics](../editors/form-editor/embedding.md#host-diagnostics).
- **form-editor** — `dataSourceApis` (`DataSourceApi` / `DataSourceApiParam`) gives remote option sources a picker over the host's endpoint catalog; a pick copies the endpoint, the mapping, and the declared parameters' defaults into the schema, which stays self-contained. See [Embedding → Offering an API catalog](../editors/form-editor/embedding.md#offering-an-api-catalog).
- **form-editor** — the `api_call` action editor now sets `version` and request parameters, sharing the parameter editor of remote option sources. `normalizeOptionMapping` is exported.
- **form-editor** — the canvas's selection toolbar is a slim tab standing on the selection ring. It reaches only the bottom edge of the block above, where the old floating bar covered that block's control and caught the clicks aimed at it — including on its delete button.
- **form-editor** — the remote request editors (a custom option source, a form data source, an `api_call` action) label every input — 资源 / 动作 / 版本, then 显示字段 / 取值字段 / 禁用字段 / 描述字段 under 字段映射 — and group the parameters under 请求参数; a placeholder used to be the only label, gone once the field held a value. In a narrow panel the version moves to its own line instead of clipping the action name.
- **form-editor** — the diagnostics list says where each issue is in the designer's words — the field's label, `数据源「…」`, `变量「…」`, `表单联动` — keeping the raw path as the location's tooltip. The publish confirmation lists its warnings the same way.
- **form-editor** — the properties overlay of the narrow-host layout widens from 320px to 360px, so paired controls (a condition's source and operator, the option-source switch) no longer clip; the condition source picker's dropdown is wider than its half-row select; and the 变量 tab lists the form's own variables before the system variables.
- **components** — `dynamicIconNames`, the set of names `DynamicIcon` renders, is exported from the package entry; the docs already told hosts to validate stored icon names against it, but only the module declared it. `CarouselProps`, `MonthPickerProps`, and `WeekPickerProps` are forwarded too — the one antd re-export and the two picker variants whose props types the entry left out.
- **approval-form-bridge** — `validateApprovalProjection(schema)` returns the approval-contract issues alone, shaped for `FormEditor`'s `validate`.
- **approval-form-bridge** — `ApprovalFieldOptionSource` and `ApprovalOptionSourceKind`, the shape of `ApprovalFormField.optionSource` since v2.20.0, are exported by name; they used to be reachable only through the field type.
- **approval** — `ApprovalPlugins.formGlobals` (`FormGlobalDefinition[]`) declares the host globals the backend exposes to forms, and `ApprovalPlugins.dataSourceApis` the option-API catalog. `InstanceFormPanel` takes `applicant` and `globals` and evaluates the form with them as `$applicant` / `$globals`; `StartForm` carries `applicant` and `globals`, and `MyInstanceInfo` / `AdminInstanceInfo` carry `globals`. The flow designer's form step offers the four applicant attributes and the declared globals as system variables, passes the provider's resolver, evaluators, and API catalog to the form editor, and validates with `validateApprovalProjection`; neither designer step renders an issue banner any more, and the footer says why 下一步 is disabled. See [Approval → Form system variables](../engines/approval/overview.md#form-system-variables).

### Fixes worth knowing

- **form-editor** — a `$`-rooted leaf source reads own properties only, so a path such as `$user.constructor` no longer resolves to a prototype member (which made `notEmpty` hold forever). An unknown root (`$applcant.x`) is reported as the new warning `source_scope_unknown` instead of silently never matching; code that switches exhaustively over `ValidationIssueCode` must handle the new member.
- **form-editor** — a `$form.<key>` leaf source is tracked, validated, renamed, and pruned exactly like the plain `<key>`.
- **form-editor** — `request_incomplete` is reported once per request, naming what is missing, at the request's own path when both `resource` and `action` are empty. It used to be two issues with identical text at `.resource` and `.action`.
- **form-editor** — remote option mappings are normalized wherever they are stored, resolved, or projected: a cleared key falls back to its default instead of being stored as `""`, which a resolver reading `mapping.labelKey ?? "label"` took literally.
- **form-editor** — request parameter names are committed on blur or Enter, and only when non-blank and unique. Adding several parameters in a row, or renaming one onto another's name, used to drop values.
- **form-editor** — the `condition_group_empty` message now says what an empty group does (under `all` the rule always applies, under `any` never) instead of claiming the rule never applies.
- **approval** — the flow designer's form preview resolves remote options through `dataSourceResolver` (it used to stay empty) and runs the provider's `evaluators`.
- **components** — `Loader` no longer passes antd's deprecated `size="default"` to `Spin`, which logged a deprecation warning wherever it rendered (route loading included); it renders at `"medium"`.

## v2.24.1 (2026-09-28)

No breaking changes.

### Fixes worth knowing

- **approval**, **integration**, **starter** — typing quickly into a dialog could crash the page with React's "Maximum update depth exceeded". The antd `Modal` / `Drawer` re-rendered on every keystroke, and each re-render re-ran its portal's container effect until React's nested-update limit tripped. The approval runtime action dialogs (on the instance detail and in the admin console), the integration connection-probe drawer, and the starter layout's search now keep their draft in the content below the shell, so a keystroke re-renders only that content. Each dialog still starts from a fresh draft every time it opens, and the connection probe resets its inputs when it targets another system.

## v2.24.0 (2026-09-28)

No breaking changes.

### Features

- **approval-flow-editor** — a parallel approval node can pass on a fixed number of approvals: `PassRule` adds `"fixed_count"`, with the count in `ApprovalNodeData.passCount` (default `1`). The node passes once that many assignees approve — every assignee when fewer take part — and rejects once the count is out of reach. `validateFlowDefinition` reports a count that is not an integer ≥ 1 as `pass_count_range`; there is no upper bound, since assignees resolve at run time. See [Approval Flow Editor reference](../editors/approval-flow-editor/reference.md#enums).
- **approval** — `TimelineEntry` and `FlowGraphNodeData` carry `passCount` under the `fixed_count` rule.
- **approval-flow-editor** — the condition editor lays each rule out on one non-wrapping row (subject, aggregate and column when used, operator, value, remove), so the rules of a group line their columns up and a long label truncates instead of widening the row. The operator stays disabled until the subject resolves.
- **integration** — the log console replays a recorded invocation against the current definitions and compares it with the original, optionally with an unsaved script. `useLogApi` adds `replay` (`integration/log.replay`), `INTEGRATION_PERMISSIONS.log.replay` gates it, and `IntegrationConsolePage.permissions` accepts `logReplay`. `InvocationLog` adds `replayable` and shares `InvocationOutcome` with the new `ReplayResult`; `HttpExchange` adds the inbound caller's `clientAddr`. See [Integration pages](../engines/integration/pages.md#integrationconsolepage).

### Fixes worth knowing

- **approval-flow-editor** — a condition group mixing field and expression rules opens in the visual editor with each expression rule shown and edited as its source; it used to be misread as an unfilled field rule.
- **approval-flow-editor** — fast typing in the condition editor no longer crashes with "Maximum update depth exceeded", and an in-progress edit survives the parent re-rendering with a fresh condition list; the draft is seeded from the stored conditions each time the editor opens.

## v2.23.0 (2026-09-22)

No breaking changes.

### Features

- **core** — `protectedBodyEncoding` works over plain HTTP: AES-GCM runs on Web Crypto where `crypto.subtle` exists and falls back to `@noble/ciphers` elsewhere, with byte-identical output. Browsers expose `crypto.subtle` only in secure contexts, so the client previously could not be constructed on an HTTP page. HTTPS is still what keeps the key confidential. See [HTTP and API Client](./core/http-and-api.md#protected-body-transport).
- **approval** — the task center's two lists gain search. 待办 filters by title, applicant name, and timeout, plus arrival time under the advanced search; 已办 by title, applicant name, and how the task was finished, plus finish time and the instance's status. The queries take `PendingTaskSearch` / `CompletedTaskSearch`, which extend `MyTaskSearch` with `keyword`, `applicantId`, `applicantName`, and `flowId`. See [Approval pages](../engines/approval/pages.md#approvaltaskcenterpage).

## v2.22.0 (2026-09-15)

One breaking change: the starter theme store no longer materializes the framework defaults for color scheme and semantic colors; those fields now store only explicit user choices.

### Breaking changes

- **starter** — `ThemeState.colorScheme` is now optional and `ThemeState.colors` is `Partial<ThemeColors>`. The store records only the color scheme and semantic colors the user picked in the theme panel; unset values follow the application's `defaultTheme`. Applications that read those fields as always-present must handle `undefined` / missing entries. Users upgrading from an older release may already have the old framework defaults persisted as explicit choices, so changing `defaultTheme` will not override those saved values; users can reset their theme picks in the theme panel.

### Features

- **components** — `ConfigProvider` accepts `components` (`ComponentDefaults`) for application-wide default props. Defaults are whitelisted per component: `Form` (`labelAlign`, `labelWidth`), `FormModal` (`draggable`), `Image` (`fallback`), `Input` / `TextArea` (`allowClear`, `autoComplete`), `Message` / `Notification` (`duration`, `maxCount`), `Pagination` (`showSizeChanger`), `ProTable` (`rowKey`, `showSequenceColumn`, `striped`), and `Select` (`showSearch`). An explicitly passed prop still wins over the application default.
- **starter** — `createApp().render()` accepts `defaultTheme` for the initial color scheme and semantic colors, and `components` for the component defaults above. The user's theme-panel picks take precedence and only those picks are persisted. `ThemeConfigProvider`, `useEffectiveColorScheme()`, `useEffectiveThemeColors()`, and the `DefaultTheme` / `ThemeConfigProviderProps` types are now exported for custom application shells.

### Fixes worth knowing

- **form-editor** — `uploadFieldDefinition` is now exported from the package index, so custom registries can reuse the built-in upload definition directly. The `EditCoalesceOptions` documentation now states that undo folding is opt-in: omit `coalesceKey` for a discrete undo step, and pass a stable fine-grained key to fold a run of edits.

## v2.21.0 (2026-09-14)

No breaking changes.

### Features

- **core** — `HttpClientOptions.protectedBodyEncoding` enables mandatory bidirectional `aes-gcm+base64` JSON body transport. It uses the browser Web Crypto API, matches the Go framework's nonce/ciphertext/tag wire layout, takes precedence over legacy body encodings, and rejects unmarked or mismatched protected responses. See [HTTP and API Client](./core/http-and-api.md#protected-body-transport).
- **starter** — `starter.createApiClient()` accepts `protectedBodyEncoding` and forwards it to the core HTTP client.

## v2.20.0 (2026-09-07)

No breaking changes.

### Features

- **approval-form-bridge** — remote option sources project onto the approval contract as `optionSource` (`{ kind: "remote", request, mapping? }`), while static options continue to project as `options`. The backend accepts any submitted value for a remote-source select and lets the host validate it at runtime.
- **form-editor** — a large correctness pass covers remote select filtering by label, upload-column inference by file count, bound data-source parameter scoping, submit payloads, optional rules, assign resets, history/device tracking, key repair, schema patching, validation surfacing, and stable field keys across device designs.

## v2.19.0 (2026-09-01)

One breaking change: form-editor remote data-source parameters are now dynamic values bound to the form.

### Breaking changes

- **form-editor** — `RemoteDataSourceRequest.params` entries are `DynamicValue`s. A parameter can read form values and, inside a subform, the current row's value scope. Hosts that hand-built a request with static parameter values keep working; resolvers that assumed every parameter was static must evaluate the dynamic value before use.

### Features

- **form-editor** — the upload field stores object keys (`null` for one empty file slot, `[]` for an empty multi-file slot) and infers its storage column from `maxCount`.
- **components** — `StoredFileUpload` is exported. It controls `FileUpload` with storage object keys, hydrates saved keys into an upload list, resolves their original filenames, and emits one key or an array according to `maxCount`.

## v2.18.0 (2026-08-31)

One breaking change: the approval flow designer's principal vocabulary is driven by the application's registered catalog.

### Breaking changes

- **approval-flow-editor** — `AssigneeKind` and `CcKind` are open `string` identifiers rather than closed unions. `EditorPlugins` adds `assigneeKinds` and `ccKinds` (`KindDescriptor[]`), and `pickers` is keyed by kind string. Pass the catalog served by `approval/flow.list_kind_options`; when omitted, the editor falls back to `BUILTIN_ASSIGNEE_KINDS` / `BUILTIN_CC_KINDS`. A picker lookup tries the rule's kind first, then its `selection` mode, so a custom kind that selects roles can reuse the built-in `role` picker.
- **approval** — `InitiatorKind` is an open `string` as well, and `ApprovalPlugins.pickers` is keyed by kind string.

### Features

- **approval-flow-editor** — `SelectionMode` and `KindDescriptor` are exported, and the validation API takes a `FlowValidationContext` containing `formFields`, `assigneeKinds`, and `ccKinds`.
- **approval** — `ApprovalPlugins.pickers` follows the same kind-first/selection-fallback lookup, and `KindDescriptor` / `SelectionMode` are re-exported.
- **approval** — `useFlowApi.listKindOptions` fetches the application's kind catalog (`KindOptions`: `assignees`, `ccs`, `initiators`), and the flow designer passes it to both its initiator editor and the flow editor — `toEditorPlugins` takes it as a third argument. `BUILTIN_INITIATOR_KINDS` is what the initiator editor offers until the catalog loads.

## v2.17.2 (2026-08-26)

No breaking changes.

### Features

- **approval-flow-editor** — condition values for built-in applicant subjects (`applicantId`, `applicantDepartmentId`) use the host's `user` / `department` pickers instead of requiring ids to be typed manually.

## v2.17.1 (2026-08-25)

No breaking changes.

### Fixes worth knowing

- **components** — public upload previews restore image thumbnails by using the object's public source URL for `thumbUrl` while keeping it off antd's navigable `url`.

## v2.17.0 (2026-08-20)

No breaking changes.

### Features

- **starter** — `useLoginFlow` exports the presentation-free login state machine: credential submission, the challenge loop, RSA encryption, error normalization, store updates, and post-authentication navigation.
- **starter** — `LoginParams` is an open union through `Register['loginParams']`; the framework ships `PasswordLoginParams` and `TrustCodeLoginParams`.
- **starter** — `LoginChallengeAutoResolver` / `LoginChallengeAutoResolvers` can answer selected challenges from data the page already holds. Each type is attempted once, and a rejected silent answer falls back to its renderer.
- **starter** — the single sign-on landing page, route helper, constants, `useSsoLogin`, and `readTrustCodeHandoff` are exported. The handoff is read once, removed from the address bar before exchange, and can still run the full challenge chain.
- **starter** — `createLoginRouteOptions` and `createSsoRouteOptions` accept either the default page's props or an application-supplied `component`; a custom page uses `useLoginFlow` / `useSsoLogin` while keeping the route's redirect and authentication guards.

### Fixes worth knowing

- **starter** — client logout clears the stale menu path set before route guards can read it.
- **core** — transport-encoded request bodies are sent to the wire verbatim.

## v2.16.0 (2026-08-18)

No breaking changes.

### Features

- **approval-flow-editor** — `SameApplicantAction` adds `"exclude"`: when the applicant appears among resolved assignees, they recuse their own seat and the remaining approvers decide. The action applies per seat; `auto_pass` and `transfer_superior` likewise affect only the applicant's task.

## v2.15.0 (2026-08-07)

No breaking changes.

### Features

- **approval** — node participants float above the instance flow graph: each approval node renders its assignees and candidates as a people overlay, so the participants behind a step are visible without opening the node detail.
- **starter** — the department-selection challenge type now documents its `meta` payload in the `Register['challenges']` example; the starter types carry the shape through `ResolvedChallenges`, and the inline declaration shows the expected `departments` and `organizations` structure.

## v2.14.0 (2026-08-05)

No breaking changes.

### Features

- **hooks** — `useStoredFileNames(keys)` resolves stored object keys to their recorded original filenames, sizes, and MIME types; the upload field hydrates display names from the same resolution so stored keys render as the filename the uploader chose.
- **integration** — contract directory filters by label; code-map entry editor suggests host codes in mapping completions.

### Fixes worth knowing

- **components** — Crud scene form resets when closed via the store's `closeForm` action; the form state no longer survives a programmatic close-and-reopen cycle.
- **dev** — `deps:check` GHSA enrichment tolerates null CVSS scores; advisories without a score no longer crash the report.

## v2.13.1 (2026-07-28)

No breaking changes. Patch release for the approval package, plus two features that landed between v2.13.0 and the patch.

### Features

- **core** — opt-in request body transport encoding: `HttpClientOptions.defaultBodyEncoding` and the per-request `bodyEncoding` option (`BodyEncoding`: `"none"` | `"base64"` | `"gzip+base64"`) encode JSON bodies so code-shaped payloads survive middleboxes (WAF / proxy) that false-positive on them; the server's body-encoding middleware reverses the encoding before parsing. `"none"` opts a single request out of a client-wide default.
- **integration** — script-carrying request bodies are transport-encoded when the client has a `defaultBodyEncoding` set.

### Fixes worth knowing

- **approval** — the flow designer no longer submits initiator rules when saving an open (unrestricted) flow.
- **approval** — an instantaneous timeline entry (start and end at the same moment) collapses to a single timestamp instead of rendering two.
- **approval** — `TimelineEntryKind` gains the `"end"` kind so terminal timeline entries are typed correctly.
- **core** — base64 encoding falls back to `btoa` when `Uint8Array`-based conversion is unavailable (older runtimes and some browser contexts).

## v2.13.0 (2026-07-21)

One package joins the set: **`@vef-framework-react/cron`** (first published as 2.13.0). Three breaking changes ship in this release: the data-dictionary vocabulary is renamed to "code set", the approval-flow-editor state engine returns to a hand-written implementation (reversing the v2.7.0 nodeloom rebuild), and the delegation window fields are renamed to the verb-form convention.

### Breaking: "dictionary" is renamed to "code set" everywhere

The data-dictionary vocabulary is renamed to **code set** across all packages. The wire contract is untouched — the host still supplies one query function that maps key strings to `DataOption[]` — but every exported name containing "dictionary" changes. See [Code Sets](../guide/code-sets.md) for the concept guide.

**hooks** — the query hook and its whole type family:

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

The `Register` augmentation member follows — projects that constrain keys must update their `declare module` block:

```ts
declare module "@vef-framework-react/hooks" {
  interface Register {
    // Before: dictionaryKeys: "sys.menu.type" | "sys.user.gender";
    codeSetKeys: "sys.menu.type" | "sys.user.gender";
  }
}
```

**core** — `AppContext.dictionaryQueryFn` is now `AppContext.codeSetQueryFn`. Update the `appContext` passed to `createApp().render()`:

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

**components** — `useDictionaryOptionsSelect` is now `useCodeSetOptionsSelect`; its option/result types `UseDictionaryOptionsSelectOptions` / `UseDictionaryOptionsSelectResult` are now `UseCodeSetOptionsSelectOptions` / `UseCodeSetOptionsSelectResult`.

**dev** — the code-generation module renames in lockstep (see [Dev Package](./dev/overview.md#code-generation)):

- CLI command: `vef gen:dictionary-keys` → `vef gen:code-set-keys`.
- `code-generation.config.ts`: the `dictionaryKeys` block → `codeSetKeys`, its `fetchDictionaryKeys` fetcher → `fetchCodeSetKeys`.
- Default output file: `src/types/dictionary.gen.ts` → `src/types/code-set-keys.gen.ts`; the generated union type is `CodeSetKey` (was `DictionaryKey`) and augments `Register.codeSetKeys`.
- Programmatic exports: `generateDictionaryKeys` → `generateCodeSetKeys` (with its `Options` / `Result` types), `renderDictionaryKeysFile` → `renderCodeSetKeysFile` (with `RenderCodeSetKeysOptions`), `DICTIONARY_AUGMENT_TARGET` → `CODE_SET_AUGMENT_TARGET`, `DictionaryKeyEntry` → `CodeSetKeyEntry`, `DictionaryKeysConfig` → `CodeSetKeysConfig`.

After renaming the config, delete the old generated file and rerun `vef gen:code-set-keys` so the augmentation targets the new `codeSetKeys` member.

### New package: `@vef-framework-react/cron`

Drop-in management pages for the durable cron scheduling engine: `CronSchedulePage` and `CronRunPage` (plus `RunDetailDrawer`, form-model helpers, and `CRON_PERMISSIONS`). Schedule list filters are split into basic and advanced panels; a paused schedule hides its fire cursor. See [Engines](../engines/overview.md).

### Breaking: approval-flow-editor returns to a hand-written state engine

The editor's state engine is hand-written again and the `@coldsmirk/nodeloom-core` dependency is gone. This reverses the in-memory node shape that v2.7.0 introduced (see that section below); the wire format is once again untouched.

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

- `FlowNode` is now a package-local discriminated union of typed `@xyflow/react` nodes (`Node<StartNodeData, "start"> | … | Node<CcNodeData, "cc">`); `FlowEdge` is xyflow's `Edge`. Neither is a nodeloom re-export anymore.
- Per-kind node aliases are exported again — but only `StartNode`, `ApprovalNode`, `HandleNode`, and `CcNode`. Unlike pre-v2.7.0, `ConditionNode` and `EndNode` stay internal; their data shapes (`ConditionNodeData`, `EndNodeData`) remain exported.
- `AnyNodeData` survives as an alias of the node-data union (`FlowNode["data"]`).
- The internal store was restructured into slices; hosts selecting from `useEditorStore` must adapt to the new `EditorState` shape (again).
- **The wire format is untouched.** `toFlowDefinition` / `fromFlowDefinition` and the `NodeDefinition` (`value` / `onChange`) contract are unchanged — the serializer now maps `node.type` ↔ `kind`. Saved flow definitions load without migration.

### Breaking: delegation window fields renamed to startsAt / endsAt

The delegation types (`Delegation` and `DelegationParams`) rename their window fields from `startTime` / `endTime` to `startsAt` / `endsAt`. Update any code that reads or writes those fields:

```ts
// Before (≤ v2.12.0)
const start = delegation.startTime;
const end = delegation.endTime;

// After (≥ v2.13.0)
const start = delegation.startsAt;
const end = delegation.endsAt;
```

### Features

- **core** — `PushClient` (and the `createPushClient` factory) for the vef server push channel: a downstream-only WebSocket that delivers `PushMessage` envelopes (`{ id, type, payload?, time }`). `subscribe(type, handler)` registers by envelope type (`"*"` receives everything) and returns the unsubscribe function. Transport losses reconnect with jittered exponential backoff (`PushReconnectOptions`), re-reading the access token per attempt (sent as the `__accessToken` query parameter); the terminal close codes `4401` (`PUSH_CLOSE_SESSION_INVALID`) and `4429` (`PUSH_CLOSE_TOO_MANY_CONNECTIONS`) surface through `onSessionInvalid` / `onConnectionRejected` and never reconnect. Delivery is best-effort by contract — treat it as a real-time hint and keep reliable state behind the regular API.
- **hooks** — `usePushMessage(client, type, handler)` subscribes to one envelope type with automatic cleanup on unmount.
- **integration** — code map management page (`IntegrationCodeMapPage`) with completions for map codes; code map code sets pick from the host catalog with a manual-entry fallback.
- **approval** — instance detail shows the flow code alongside the flow name.

### Fixes worth knowing

- **components** — the pro-search collapse toggler passes the correct antd icon prop (the chevron renders again), and the actions area sizes responsively so search controls can shrink beside toolbar content.

## v2.12.0 (2026-07-17)

Two packages join the set: **`@vef-framework-react/approval`** (first published as 2.12.0) and **`@vef-framework-react/integration`** (first published as **2.10.0** — its manifest was scaffolded mid-cycle; see the versioning note at the top of this page). Pin `integration` to `^2.10.0` until a later release realigns it.

No migration is needed when upgrading from v2.11.0. The release contains two breaking-flagged commits, but both reshaped the approval package before its first publish: the designer seeding rework (slim version summaries) and the labels-suite move out of `approval` into `components`. For released consumers the labels move is purely additive — the suite lands in `components` as new exports.

### New package: `@vef-framework-react/approval`

Drop-in management and runtime pages for the approval engine, embedding the flow designer end to end: `ApprovalFlowPage` (with `FlowDesignerDrawer` / `FlowVersionsDrawer`), `ApprovalTaskCenterPage`, `ApprovalMyInstancesPage`, `ApprovalInitiatePage` (with `StartInstanceDrawer`), `ApprovalAdminPage`, `ApprovalCategoryPage`, and `ApprovalDelegationPage`, plus `ApprovalProvider` / `useApprovalPlugins` / `toEditorPlugins` for host-supplied pickers and `APPROVAL_PERMISSIONS`. See [Engines](../engines/overview.md).

Notable behavior shipped in this first release: the designer seeds from the latest deployed version via slim `FlowVersionSummary` records (the full definition is fetched per version through `getGraph` with an explicit `versionId`), flow labels appear on instance detail, the instance detail action bar gains remove-assignee, and metrics load failures surface a retry action.

### New package: `@vef-framework-react/integration`

Drop-in management pages for the integration engine: `IntegrationSystemPage`, `IntegrationAdapterPage`, `IntegrationContractPage`, `IntegrationRoutePage`, and `IntegrationConsolePage`, plus `INTEGRATION_PERMISSIONS`. See [Engines](../engines/overview.md).

Notable behavior shipped in this first release: a full-height console workbench with inner scroll areas, a scheme-aware auth params editor with dedicated credential fields, script API completions in every script editor with hoverable script docs rendered from the completion catalogs, contract labels management with filtered directories, and JSON Schema keyword completions with highlighted wire-trace bodies.

### Features

- **components** — the labels suite (moved from the pre-release approval package, so it lands here as new exports): `LabelsEditor`, `LabelsDisplay`, `LabelFilterSelect`, the helpers `formatLabelFilters` / `parseLabelFilters` / `isValidLabel`, and the `LABEL_KEY_PATTERN` constant.
- **components** — `FlexTabs` and `Labeled` layout primitives for full-height tabbed layouts and consistently labeled values.
- **components** — code editor: a declarative `completions` prop (`CompletionEntry[]`) adds API completions alongside the language's own (on `"json"`, entries complete as object keys inside property-name strings); the `"xml"` language joins the built-in list; a floating format action (`showFormat`, default `true`) formats JSON losslessly through prettier.
- **components** — `formLayout` passes through on `FormModal`, `FormDrawer`, and `Crud`; `EditableTable` forwards `locale` to the underlying table.

### Fixes worth knowing

- **core** — path-parameter substitution only matches at the start of a path segment and requires the name to begin with a letter or underscore, so the port in an absolute URL (`https://minio.local:9000/…`) and mid-segment colons (`/schedule/12:30`) are never treated as parameters.
- **components** — a stale async format result no longer overwrites newer keystrokes; code-editor tooltips render above antd overlay layers (modals, drawers); the editable-table operation column gets a fixed default width; drawer form content stays clear of the footer.

## v2.11.0 (2026-07-15)

### Breaking: request lifecycles are isolated per invocation

`ApiClient.createQueryFn` used to call your factory **once**, at definition time, and inject the abort signal of "the current query" through shared mutable state — concurrent or interleaved async queries could observe each other's signals. The factory now runs **once per query execution**, and each handler receives an invocation-scoped `HttpClient` proxy bound to that execution's abort signal (combined with any explicit `options.signal` passed to a request method).

The contract change: **factories must be side-effect-free, must not retain state across executions, and cannot perform one-time setup.** Move any such code out of the factory:

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

`createMutationFn` is unchanged — it is still constructed once.

Token refresh coordination was rebuilt on the same principle. On a 401 with a configured `tokenExpiredCode`, `HttpClient` publishes one shared refresh promise; concurrent new requests wait through request-scoped, abort-aware waiters and resume with the renewed token. Behavior you can now rely on:

- Canceling a waiting request (or the request whose 401 triggered the refresh) does **not** cancel the global refresh.
- After a successful refresh, a still-live triggering request retries with the renewed token.
- When an automatic refresh fails, `onUnauthenticated` is called exactly once — even if the triggering request was canceled in the meantime.
- `ensureTokenRefreshed(false)` suppresses the unauthenticated callback only when that call *owns* (started) the refresh cycle; joining an in-flight refresh cannot override the owner's failure policy.

The same release normalizes file responses: a response that carries the backend's JSON business envelope where a file was expected surfaces as a `BusinessError` instead of being returned as file content, and raw (non-envelope) download responses are handled correctly.

### Features

- **core** — `HttpClient.requestFile(url, options?)` fetches a file as a `Blob` with the full request semantics of the client (Bearer injection, 401 refresh-and-retry, path parameters, abort signal) and returns `HttpFileResponse` — `{ blob: Blob; filename?: string }`, the filename parsed from `Content-Disposition`. `download()` is now built on top of it and keeps its trigger-a-browser-download behavior. `requestFile` participates in `createQueryFn` signal injection like the other request methods.
- **components** — the file-preview contract: the framework bundles no viewer library; instead `FilePreviewProvider` installs an app-level preview host (a `FilePreviewHandler`), and `Upload` — plus everything built on it — dispatches non-image files to it as normalized `FilePreviewTarget`s (`toFilePreviewTarget`, reading the `UploadedFileMeta` stamped on upload/hydrate). Images keep the built-in `Image` modal. Behavior change alongside it: without an accepting provider the framework warns and no longer hands the browser a URL whose authentication requirements it cannot prove. Private files are fetched by the host through `HttpClient.requestFile` / `HttpClient.download`. The playground demonstrates a complete host built on `@file-viewer/react`.

### Fixes worth knowing

- **components** — authenticated upload previews resolve their source URLs in isolation, per file, instead of sharing state across items.

## v2.10.0 (2026-07-13)

### Breaking: `AuthTokens.refreshToken` is optional

Backends that issue stateful opaque-token sessions (server-side sliding expiration — no refresh round-trip) return no refresh token; only JWT-mode backends do. The type now reflects that:

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

Strictly a compile-time migration: any code that reads `tokens.refreshToken` into a `string`-typed slot — most commonly the `refreshToken` callback passed to `createApiClient` — must now handle `undefined`:

```ts
async refreshToken(tokens) {
  if (!tokens.refreshToken) {
    // Opaque-token session: nothing to refresh; let the request fail as expired.
    throw new Error("No refresh token");
  }
  // ... exchange tokens.refreshToken as before
}
```

Hosts on opaque-token backends can simply omit the `refreshToken` callback — the 401 path then goes straight to `onUnauthenticated`.

### Breaking: form-editor and approval-form-bridge contract tightening

Two editor-stack breaking changes ship in this release; the details live in [Visual Editors](../editors/overview.md):

- **form-editor** — every programmatic write is gated behind the field-permission clamp, so a write to a field the current permissions mark read-only or hidden no longer lands.
- **approval-form-bridge** — the projection emits a bare field array (`ProjectionResult.fields: ApprovalFormField[]` replaces the `definition` wrapper object), and the rich form schema is sent at deploy time. The `ApprovalFormDefinition` type was removed with no replacement — see the [migration note](../editors/approval-form-bridge.md).

### Features

- **starter** — built-in `password_change` challenge renderer for the backend's forced password-change login challenge: the `PasswordChangeChallenge` component, the `PASSWORD_CHANGE_CHALLENGE_TYPE` constant (`"password_change"`), and the `PasswordChangeChallengeSpec` / `PasswordChangeChallengeData` / `PasswordChangeChallengeProps` / `PasswordChangeReason` types. Register it in `challengeRenderers` and augment `Register['challenges']` — see [Application Shell](./starter/application-shell.md#login-challenges).
- **approval-flow-editor** — tri-state `formFields` inventory and a required auto-pass mirror in the designer; deploy-time field-permission validation is mirrored at design time.
- **form-editor** — runtime field state is clamped with server-resolved `fieldPermissions`; stack blocks gain width/min/max/align sizing; the designer scrolls the selection into view, adds a container drag chip, and supports option reordering.
- **approval-form-bridge** — cross-device classification stays in sync, and hidden required fields produce a warning at projection time.

### Fixes worth knowing

- **components** — pro-search fields keep their width when an input uses `allowClear`.
- **dev** — `VEF_APP_NAME` now takes effect for the injected config global. `defineViteConfig` previously loaded only `VEF_BUILD_*` variables from `env/`, so the name never reached the config plugin; additionally, the production `__VEF_APP_CONFIG__` define and the generated `app.config.js` derived the global's name differently and could disagree. Both sides now resolve the same `__PRODUCTION__VEF_<CONSTANT_CASE_NAME>__CONF__` global. See [Dev Package](./dev/overview.md#runtime-injected-vef_app_).

## v2.9.0 (2026-07-06)

No breaking changes.

### Features

- **starter** — the app-switcher popover now fits four apps per row.

## v2.8.0 (2026-07-06)

No breaking changes.

### Features

- **New package: `@vef-framework-react/approval-form-bridge`** — a pure-function projection bridge between `form-editor` schemas and the approval backend's flat form contract. It exports `projectFormSchema`, `createApprovalRegistries`, `validateApprovalSchema`, and `APPROVAL_EXCLUDED_FIELD_TYPES`. Add it to your dependencies at the same version as the other packages. See [Approval Form Bridge](../editors/approval-form-bridge.md).
- **approval-flow-editor** — the designer now mirrors the backend's aggregate and branch-condition validation, including detail-table aggregate conditions, so contract violations surface at design time instead of at deploy.

### Fixes worth knowing

- **approval-flow-editor** — parallel add-assignee is excluded from sequential-approval defaults, matching what the backend accepts.

## v2.7.0 (2026-07-05)

The largest release in this range: the form-editor expression engine and the approval-flow-editor state engine were both replaced. If you persist form schemas with linkage expressions, audit them before upgrading.

### Breaking: `@vef-framework-react/expression` removed

The ZEN (GoRules) expression runtime package was deleted outright. Remove it from your dependencies. The only surviving public surface, the condition-operator vocabulary, moved to `approval-flow-editor`:

```ts
// Before (≤ v2.6.0)
import { CONDITION_OPERATORS, type ConditionOperator } from "@vef-framework-react/expression";

// After (≥ v2.7.0)
import { CONDITION_OPERATORS, type ConditionOperator } from "@vef-framework-react/approval-flow-editor";
```

Everything else — `evaluate` / `evaluateSync`, `loadEngine` / `configureEngine`, `ExpressionError` — is gone with no replacement.

### Breaking: form-editor linkage expressions are now plain JavaScript

Linkage `expression` conditions and expression-valued assignments used to run through the shared ZEN evaluator; they are now plain JavaScript compiled with `new Function` (script actions always were). **This changes the language of stored schemas**: any persisted expression written in ZEN dialect must be rewritten as a JavaScript expression.

```js
// Before (ZEN dialect)
field.age >= 18 and field.status == "active"

// After (JavaScript)
$form.age >= 18 && $form.status === "active"
```

- The evaluation scope is unchanged: `field` / `$form` (form values — `field` is the legacy alias), `$vars`, `$user`, `$node`, `$now`. An expression that is valid in both dialects (e.g. `$form.age >= 18`) keeps working as-is.
- ZEN-only syntax (`and` / `or` / `not`, ZEN built-in functions) no longer parses; a malformed source degrades to `false` for conditions and `undefined` for assignment values rather than throwing.
- The type `ExpressionContext` was renamed to `EvaluationContext`; the `LinkageEvaluators` callback signatures now take `EvaluationContext`.
- **CSP**: the default evaluators now require `'unsafe-eval'` for *all* expression kinds, where previously only script actions did. Supply your own [`LinkageEvaluators`](../editors/form-editor/linkage.md) to swap in a sandboxed engine.

Alongside the engine swap, `FormEditor` gained host context injection: an `evaluationContext` prop carrying the live `$vars` / `$user` / `$node` values, and a `contextSources` prop (`LinkageContextSource[]`) that publishes host-declared paths such as `"$user.departmentId"` to the visual condition builder's source picker. Declaring a source only affects the pick list — evaluation reads `evaluationContext` either way.

### Breaking: approval-flow-editor state engine rebuilt on nodeloom

The editor's state engine was rebuilt on `@coldsmirk/nodeloom-core`. In-memory node and edge shapes are now nodeloom's uniform ones: every node carries `type: "flowNode"`, the kind discriminator lives at `data.kind`, and the business fields sit under `data.config`.

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

- The per-kind type aliases `StartNode`, `EndNode`, `ApprovalNode`, `HandleNode`, `ConditionNode`, and `CcNode` are no longer exported; `FlowNode` / `FlowEdge` are re-exports of nodeloom's types. `AnyNodeData` remains exported.
- The internal store was restructured; hosts selecting from `useEditorStore` must adapt to the new `EditorState` shape.
- **The wire format is untouched.** `toFlowDefinition` / `fromFlowDefinition` and the `NodeDefinition` (`value` / `onChange`) contract are unchanged, so saved flow definitions load without migration.

### Features

- **approval-flow-editor** — new `plugins.globalSubjects` (`FormFieldDefinition[]`) injects host-declared subjects into the condition builder alongside the built-in applicant attributes and `formFields`. See [Host Integration](../editors/approval-flow-editor/host-integration.md#globalsubjects).
- **starter** — the `Login` component surfaces login and challenge errors instead of failing silently.

### Dependencies

- `components` now requires `antd@^6.4.5` (was `^6.4.3`). As part of the same sweep, `starter` migrated off the deprecated antd `Alert` `message` / `onClose` props to `title` / `closable` — if your app still uses the deprecated props on its own alerts, plan the same migration.

## v2.6.0 (2026-06-25)

No breaking changes.

### Features

- **form-editor** — `FormEditor` gained `publishText` and `publishLoading` props for customizing the toolbar's publish action.
- **form-editor** — table-storage column types are now inferred from field widgets instead of defaulting untyped.

## v2.5.0 (2026-06-25)

### Behavior change: `AppItem.icon` is a `ReactNode`

The starter app switcher's `AppItem.icon` changed from a kebab-case lucide icon *name* (`icon?: string`, resolved through `DynamicIcon`) to a render-ready node (`icon?: ReactNode`, rendered as-is). A plain string still type-checks — but it now renders as literal text. Released as a minor, yet hosts passing icon names must update:

```tsx
// Before (≤ v2.4.4)
{ id: "crm", name: "CRM", icon: "briefcase" }

// After (≥ v2.5.0)
{ id: "crm", name: "CRM", icon: <DynamicIcon name="briefcase" /> }
```

### Features

- **approval-flow-editor** — `ApprovalFlowEditor` gained an `onPublish` prop (`(definition: FlowDefinition) => void`); the toolbar's publish button renders only when it is provided.

## v2.4.1 – v2.4.4 (2026-06-17 – 2026-06-18)

### Breaking (v2.4.1): slimmed ZEN expression runtime

`@vef-framework-react/expression` was cut down to the bare evaluator, and form-editor linkage was routed through the slimmed runtime. Removed from the public surface: the condition compiler (`compileCondition`, `compileGroup`, `compileBranch`, `selectBranch`, `toZenLiteral`), the intellisense API (`analyzeTypes`, `getCompletionItems`, `getDiagnostics`, …), the locale helpers, and the React bindings. All of the remainder was deleted in v2.7.0, so treat any dependency on this package as an upgrade blocker there.

### Features

- **form-editor** — docked and drawer editor layout modes, per-column width for table subforms, a wider collapsed palette rail, and table subforms displayed as a column table in the designer (all v2.4.1).
- **components** — `ScrollArea` gained a `scrollbars` axis option (v2.4.1).

### Fixes worth knowing

- **starter** — a series of top-menu fixes: overflowing items fold into the rest indicator without spillover (v2.4.2, v2.4.3), menu access checks match against the route template (v2.4.2), and menus are identified by path + params + search so parameterized routes highlight distinctly (v2.4.3). `UserMenu.meta` params/search were typed accordingly (v2.4.4).
- **core** — a token-expired request now resolves with the retried response after a silent refresh, instead of surfacing the original 401 (v2.4.2).
- **build** — package type declarations are kept flat under `dist/types`, fixing broken type resolution in consumers (v2.4.1).

## Earlier releases (before v2.4.0)

v2.4.0 (2026-06-15) is the initial public release; the repository's git history starts there, so earlier changes are summarized from the documentation rather than from commits.

The one earlier migration you will still encounter in these docs: **v2.1.6 moved the VEF page and CRUD components from `@vef-framework-react/starter` to `@vef-framework-react/components`** — `Page`, `Crud` / `CrudPage`, `ProTable`, `ProSearch`, `FlexCard`, `FormModal`, and `FormDrawer` — and introduced `LogoIcon` in `components`. If you are coming from a pre-2.1.6 codebase, update those imports from `starter` to `components`; each affected page in [Components](../components/overview.md) carries a note to the same effect.
