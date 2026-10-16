---
title: Approval Package Overview
description: What @vef-framework-react/approval ships — the approval engine's management and self-service pages, the ApprovalProvider plugin system, and how it embeds the visual editors.
---

# Approval Package Overview

`@vef-framework-react/approval` (v2.15.0, released with framework v2.15.0 on 2026‑08‑07) is the frontend console for the VEF server's approval workflow engine. It covers both sides of the engine in one package:

- **Self-service** — what a regular employee sees: initiate an approval, process tasks, track submissions and carbon copies. Backed by the user-scoped `approval/my` and `approval/instance` resources, which carry no permission codes.
- **Management** — what an administrator sees: flow categories, the flow designer with versioning, delegations, and a supervision console (cross-user instances/tasks, business write-back convergence, engine metrics). Backed by the permission-coded `approval/category`, `approval/flow`, `approval/delegation`, and `approval/admin` resources.

## When to Use

- Your VEF server runs the approval engine and you want its full UI — designer included — by mounting seven components on routes.
- You are building custom approval screens and want the typed API surface (`useMyApprovalApi`, `useInstanceApi`, …) and runtime components (detail panel, timeline, flow-graph viewer, status tags) rather than raw RPC calls.

For designing flows *outside* these pages (your own wizard, a different persistence model), use [`@vef-framework-react/approval-flow-editor`](../../editors/approval-flow-editor/overview.md) directly — this package embeds it and adds the engine's persistence chain around it.

## Architecture

Everything is re-exported flat from the package root, organized internally as five layers:

| Layer | Contents | Purpose |
| --- | --- | --- |
| `pages` | 7 page components + 3 standalone drawers (`FlowDesignerDrawer`, `FlowVersionsDrawer`, `StartInstanceDrawer`) | Complete screens, one per route ([Pages](./pages.md)) |
| `api` | 6 hooks (`useCategoryApi`, `useFlowApi`, `useDelegationApi`, `useInstanceApi`, `useMyApprovalApi`, `useAdminApprovalApi`) + `API_PATH`, `toPagedParams` | Typed query/mutation functions over the `/api` RPC endpoint |
| `plugins` | `ApprovalProvider`, `useApprovalPlugins`, `toEditorPlugins` | Host-integration context shared by every page and component |
| `permissions` | `APPROVAL_PERMISSIONS` + per-group code types | Backend `RequiredPermission` strings, verbatim |
| `types` | ~60 interfaces/unions mirroring the Go contracts | Wire shapes for rows, details, params, and enums |

Presentation building blocks (status tags, `UserLabel`, `InstanceTimeline`, `InstanceFlowGraphViewer`, `InstanceDetailPanel`/`Drawer`, `InstanceFormPanel`, `PrincipalSelect`) are exported too, so hosts can compose their own detail surfaces — see the [API Reference](./reference.md#runtime-components).

## `ApprovalProvider` — wiring host plugins

Approval UIs need host knowledge the framework cannot supply: who your users/roles/departments are, how business documents are opened, which extra subjects conditions may branch on. `ApprovalProvider` carries those integration points as React context; **pages never take them as props**. Wrap the approval routes once:

```tsx
import type { ApprovalPlugins } from "@vef-framework-react/approval";

import { ApprovalProvider } from "@vef-framework-react/approval";

const PLUGINS: ApprovalPlugins = {
  // Resolve principal ids with the host's org pickers (user / role / department).
  pickers: { user: UserPicker, role: RolePicker, department: DepartmentPicker },
  // Render an instance's opaque business reference as a navigable link.
  renderBusinessRef: ref => <a onClick={() => openBusinessDoc(ref)}>{ref}</a>
};

<ApprovalProvider plugins={PLUGINS}>
  <ApprovalRoutes />
</ApprovalProvider>;
```

The resolved plugin set (`ResolvedApprovalPlugins`) always contains form `registries` — defaulting to the approval profile from [`approval-form-bridge`](../../editors/approval-form-bridge.md) (`createApprovalRegistries`), which excludes field types the backend form parser rejects. Every integration point degrades gracefully:

| Plugin | Used by | Fallback when unset |
| --- | --- | --- |
| `pickers` | Flow designer (assignees, CC, initiators) and runtime dialogs (transfer, add assignee, CC) via `PrincipalSelect` | Plain id-tags input — pages stay functional |
| `tenants` | The flow designer's user and department rules of a shared flow, which pick the tenant first and hand it to the picker | A shared flow picks people through the plain pickers |
| `registries` | Form design step and every form render (`InstanceFormPanel`) | `createApprovalRegistries()` created once per mount |
| `globalSubjects` | The flow designer's condition editor, alongside built-in applicant attributes | Only built-in subjects offered |
| `formGlobals` | The form designer's system variables, offered as `$globals.<key>` beside the built-in `$applicant` attributes | Only the applicant attributes offered |
| `dataSourceResolver` | Every form render and the form designer's preview — resolves remote option sources | Remote sources resolve to an empty list |
| `dataSourceApis` | The form designer's remote option sources, which lead with a picker over the catalog | Endpoints and field mappings are typed by hand |
| `codeSets` | The form designer's 数据字典 option source, which picks from the catalog | Dictionary keys are typed by hand |
| `evaluators` | Every form render and the form designer's preview — expression / script evaluation and host effects | The built-in JavaScript evaluator; `alert` / `api_call` / `navigate` are no-ops at runtime |
| `renderBusinessRef` | Instance detail headers | Business ref rendered as plain code text |

`useApprovalPlugins()` is usable **without** a provider — every point then falls back to its built-in default, which is why standalone usage of the runtime components also works.

## Relationship to the visual editors

The flow designer inside [`ApprovalFlowPage`](./pages.md#approvalflowpage) is a four-step wizard (settings → form → flow → review) that embeds:

- [`FormEditor`](../../editors/form-editor/overview.md) for the form step, wired from the provider: its `registries`, `dataSourceResolver`, `dataSourceApis`, `codeSets`, and `evaluators`, the [form system variables](#form-system-variables) as `contextSources`, and [`validateApprovalProjection`](../../editors/approval-form-bridge.md#validateapprovalprojection) as `validate` — so approval-contract problems appear in the editor's own status bar, each one clickable to its field;
- [`ApprovalFlowEditor`](../../editors/approval-flow-editor/overview.md) for the flow step;
- [`approval-form-bridge`](../../editors/approval-form-bridge.md)'s `projectFormSchema` / `validateApprovalSchema` as the seam between them — the projected `FormFieldDefinition[]` feeds the flow editor's condition/permission surfaces, and both editors' validations gate the wizard's step transitions.

Neither editor gets an issue banner above it, which would eat canvas height: each editor shows its own diagnostics, and the wizard only says, beside the disabled 下一步, why the step cannot advance.

`toEditorPlugins(plugins, formFields, kindOptions?)` projects the approval plugin set into the flow editor's `EditorPlugins` shape, layering the deploy-derived form fields and the application's kind catalog (from `approval/flow.list_kind_options`) on top. So hosts configure **one** plugin object and both editors see it.

Because the pickers and kind-catalog contracts belong to the flow editor, this package re-exports the types a host needs to implement them — `EditorPlugins`, `PickerProps`, `PrincipalKind`, `KindDescriptor`, and `SelectionMode` from `@vef-framework-react/approval-flow-editor` — so wiring the provider needs imports from this package alone.

## Form system variables

An approval form often has to read who started it — "show the budget field when the initiator is in Finance", "default the cost center to the initiator's department". Form rules evaluate for every participant who opens the instance, so the initiator cannot be `$user` (that is whoever is viewing); it is **`$applicant`**, and it reads the same for the initiator and every approver.

The package wires this end to end:

- **At runtime**, `InstanceFormPanel` renders every approval form with the instance's applicant as `$applicant` (`id`, `name`, `departmentId`, `departmentName`) and its form-visible host globals as `$globals`. The start drawer takes both from `approval/my.get_start_form`, which resolves the applicant exactly as starting the instance will, so a rule reads the same before submission as on every detail view; the self-service and admin details take them from the instance itself.
- **In the designer**, the form step declares them as system variables: 发起人 ID / 发起人姓名 / 发起人部门 ID / 发起人部门 (`$applicant.id`, `$applicant.name`, `$applicant.departmentId`, `$applicant.departmentName`), followed by one `$globals.<key>` per entry of `ApprovalPlugins.formGlobals`. The designer lists them in the 变量 tab — with preview values to try a rule before any real initiator exists — and offers them in the condition builder and as bound parameters of remote option sources.

Host globals are routing inputs first: the host's `InstanceGlobalsResolver` resolves them server-side at instance start, and `Instance.Globals` snapshots them. Shipping one to the browser, where every participant can read it, is a separate decision, so **a form sees no global by default**. To expose some, the host's Go resolver also implements `approval.FormGlobalsExposer`:

```go
// FormGlobalKeys names the globals the form of an instance of flowCode may read.
func (r *GlobalsResolver) FormGlobalKeys(flowCode string) []string {
	return []string{"staffCategory", "staffTitle"}
}
```

and the frontend declares the same keys, with display names, for the designer:

```tsx
const PLUGINS: ApprovalPlugins = {
  formGlobals: [
    { key: "staffCategory", label: "人员类别" },
    { key: "staffTitle", label: "聘任职称" }
  ]
};
```

Keep the two lists in lockstep: a key the resolver exposes but `formGlobals` does not declare still evaluates at runtime but is not offered in the designer, and a key declared but not exposed is offered yet always reads as empty. A resolver that does not implement `FormGlobalsExposer` exposes nothing and is not even called for the start form.

On submit the wizard runs one chain against `useFlowApi`: `create`/`update` → `deploy` (a new draft `FlowVersion` carrying `flowSchema`, the opaque `formSchema`, and the derived `formFields`) → optional `publish_version`. Publishing archives the previously published version; running instances keep the version they started on.

## Notable v2.12.0 behavior

All of these landed within the v2.12.0 cycle (the package's first release), but they are worth knowing when reading older examples:

- **Designer seeding via slim version summaries** (breaking within the cycle, commit `40b6714`): `FlowApi.findVersions` returns `FlowVersionSummary[]` — identity and lifecycle metadata *without* the definition payloads. The designer resolves the latest deployed version id from that list, then fetches the full definition through `getGraph({ flowId, versionId })`. Editing therefore seeds from the newest **deployment** (published or not) — deploying without publishing no longer hides that work from the next editing session. A single version's full payload is only ever fetched through `get_graph`.
- **Flow labels on instance detail** (`e966464`, `a1264da`): `MyInstanceInfo.labels` and `AdminInstanceInfo.labels` mirror the flow's host-owned selection metadata, read from the mutable flow at query time (display identity, not a version-pinned snapshot). The shared `InstanceHeader` renders them on operator-facing views — the admin detail passes `labels`, the applicant-facing self-service detail omits them.
- **Remove-assignee runtime action** (`dacee0b`): the instance detail action bar offers 减签 when the server includes `remove_assignee` in `availableActions`, targeting a peer task from `myTask.removableAssignees` and calling `approval/instance.remove_assignee`.
- **Metrics failure surfaced with retry** (`d6e338e`): queries have no global failure feedback (only mutations do), so the admin metrics tab renders a failed load as an explicit error state with a retry button instead of an empty dashboard.

## Terminology

- **Flow vs. version** — a `Flow` is the mutable identity (code, name, category, labels, initiators, binding mode); a `FlowVersion` is an immutable deployed snapshot (definition + form + storage mode). Instances pin to the version they started on.
- **Binding mode** — `standalone` stores form data in the approval tables; `business` writes back into an existing business table through a `BusinessBindingConfig`, with convergence tracked as *business projections* (visible in the admin console).
- **Principals** — assignees/initiators are `user` / `role` / `department` ids; the host resolves display and picking.

Continue with [Pages](./pages.md) for every page's contract, or the [API Reference](./reference.md) for the full export tables.
