---
title: Approval Package Overview
description: What @vef-framework-react/approval ships — the approval engine's management and self-service pages, the ApprovalProvider plugin system, and how it embeds the visual editors.
---

# Approval Package Overview

`@vef-framework-react/approval` (v2.12.0, first released with framework v2.12.0 on 2026‑07‑17) is the frontend console for the VEF server's approval workflow engine. It covers both sides of the engine in one package:

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
| `registries` | Form design step and every form render (`InstanceFormPanel`) | `createApprovalRegistries()` created once per mount |
| `globalSubjects` | The designer's condition editor, alongside built-in applicant attributes | Only built-in subjects offered |
| `renderBusinessRef` | Instance detail headers | Business ref rendered as plain code text |

`useApprovalPlugins()` is usable **without** a provider — every point then falls back to its built-in default, which is why standalone usage of the runtime components also works.

## Relationship to the visual editors

The flow designer inside [`ApprovalFlowPage`](./pages.md#approvalflowpage) is a four-step wizard (settings → form → flow → review) that embeds:

- [`FormEditor`](../../editors/form-editor/overview.md) for the form step, using the provider's `registries`;
- [`ApprovalFlowEditor`](../../editors/approval-flow-editor/overview.md) for the flow step;
- [`approval-form-bridge`](../../editors/approval-form-bridge.md)'s `projectFormSchema` / `validateApprovalSchema` as the seam between them — the projected `FormFieldDefinition[]` feeds the flow editor's condition/permission surfaces, and both editors' validations gate the wizard's step transitions.

`toEditorPlugins(plugins, formFields)` projects the approval plugin set into the flow editor's `EditorPlugins` shape, layering the deploy-derived form fields on top. So hosts configure **one** plugin object and both editors see it.

Because the pickers contract belongs to the flow editor, this package re-exports the types a host needs to implement them — `EditorPlugins`, `PickerProps`, and `PrincipalKind` from `@vef-framework-react/approval-flow-editor` — so wiring the provider needs imports from this package alone.

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
