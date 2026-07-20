---
title: Engine Pages
description: Drop-in, permission-gated management consoles for the VEF server engines — approval, integration, and durable cron — and how to mount them in a host app.
---

# Engine Pages

The VEF server ships several backend *engines* — long-lived subsystems with their own storage, lifecycle, and management API: the approval (workflow) engine, the integration engine, and the durable cron store. The **engine pages** packages are the matching frontend consoles: each one is a set of ready-made, full-page React components that manage one engine end to end, published as its own package so a host app installs only the consoles it needs.

They are deliberately *drop-in*:

- **A page is one component.** Mount `<ApprovalTaskCenterPage />` on a route and it is a complete screen — list, search, forms, detail drawers, and actions included. No page takes query functions or table columns as props.
- **Permission-gated by default.** Every management page defaults its action gates to the engine's backend permission codes (`APPROVAL_PERMISSIONS`, `INTEGRATION_PERMISSIONS`, `CRON_PERMISSIONS` — mirrored verbatim from the Go resources' `RequiredPermission` strings) and lets the host override them per page through a `permissions` prop. See [Permissions](../guide/permissions.md) for how gates resolve against the current user.
- **Self-serving data layer.** All queries and mutations are built on the app's `ApiClient` (from `useApiClient()` in `@vef-framework-react/core`) and post to the framework RPC endpoint `/api` with `createApiRequest(resource, operation, params)` envelopes. The same hooks the pages use internally (`useFlowApi`, `useOpsApi`, `useScheduleApi`, …) are exported, so a host can build its own screens on the identical wire contract.

## The three packages

| Package | Version | Engine | Pages | Extra integration points |
| --- | --- | --- | --- | --- |
| [`@vef-framework-react/approval`](./approval/overview.md) | 2.12.0 (released in framework v2.12.0, 2026‑07‑17) | Approval workflow engine (`approval/*` resources) | 7 — task center, my instances, initiate portal, categories, flow designer, delegations, admin console | `ApprovalProvider` plugin context (pickers, form registries, global subjects, business-ref renderer); embeds the [Approval Flow Editor](../editors/approval-flow-editor/overview.md) and [Form Editor](../editors/form-editor/overview.md) |
| [`@vef-framework-react/integration`](./integration/overview.md) | 2.10.0 (released in framework v2.12.0; code-map domain is unreleased HEAD) | Integration engine (`integration/*` resources) | 6 — contracts, systems, adapters, routes, code maps, ops console | Script editors with runtime-mirrored completions and hoverable docs; scheme-aware auth parameter editor |
| [`@vef-framework-react/cron`](./cron/overview.md) | 2.10.0 (**unreleased** — added 2026‑07‑19, after v2.12.0) | Durable cron schedule store (`sys/cron/*` resources) | 2 — schedules, run journal | Trigger editor with live next-fire preview |

Package versions move independently of the framework tag: a package's `version` only bumps when that package publishes. All three follow the same internal architecture — `pages` + `api` + `types` + `permissions` (+ shared presentation `components`), re-exported flat from the package root.

## When to Use

- You run the VEF server with one of these engines enabled and want its management UI without building list/form/detail screens yourself.
- You want the engine consoles to obey the same permission codes the backend enforces, with the option to remap codes per deployment.
- You need programmatic access to an engine's management API from custom screens — import the exported API hooks and types instead of hand-writing request envelopes.

If you only need the *visual editors* (flow or form design surfaces) inside your own pages, use the editor packages directly — see [Visual Editors](../editors/overview.md). The engine pages embed those editors for you.

## How they relate to core and starter

Engine pages are plain components; the surrounding application services come from the host:

- **Routing** — pages don't route themselves. Mount each page on a route of your router. The framework playground uses TanStack Router file routes (see [Routing](../guide/routing.md)); any router works since a page is just a component.
- **AppContext** — permission gating reads `hasPermission` from `useAppContext()` (`@vef-framework-react/core`). When no `hasPermission` is provided, tab-style consoles treat every permission as granted; button-level gates follow [`PermissionGate`](../components/permission-gate.md) semantics.
- **ApiClient** — all data access goes through the app's configured API client, so authentication headers, error toasts, and TanStack Query caching behave exactly like the rest of the app (see [Data Fetching](../guide/data-fetching.md)).
- **Backend enforcement** — client-side gates only hide affordances. List queries themselves are authorized server-side; a user reaching a page without the engine's `query` code gets the backend's permission error, not an empty fake.

## Mounting the pages

The playground mounts each page on its own file route. Adapted to a host app, an approval section looks like this:

```tsx
// routes/approval/route.tsx — one provider wraps every approval route.
import type { ApprovalPlugins } from "@vef-framework-react/approval";

import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ApprovalProvider } from "@vef-framework-react/approval";

import { DepartmentPicker, RolePicker, UserPicker } from "../../components/org-pickers";

// Wire the host's organization pickers once; every approval page resolves
// them from context.
const APPROVAL_PLUGINS: ApprovalPlugins = {
  pickers: {
    user: UserPicker,
    role: RolePicker,
    department: DepartmentPicker
  }
};

export const Route = createFileRoute("/_layout/approval")({
  component: () => (
    <ApprovalProvider plugins={APPROVAL_PLUGINS}>
      <Outlet />
    </ApprovalProvider>
  )
});
```

```tsx
// routes/approval/task-center/route.tsx — a page is the whole screen.
import type { ReactNode } from "react";

import { createFileRoute } from "@tanstack/react-router";
import { ApprovalTaskCenterPage } from "@vef-framework-react/approval";

export const Route = createFileRoute("/_layout/approval/task-center")({
  component: (): ReactNode => <ApprovalTaskCenterPage />
});
```

Integration and cron pages have no provider requirement — mount them directly:

```tsx
// routes/sys/integration-console/route.tsx
import { createFileRoute } from "@tanstack/react-router";
import { IntegrationConsolePage } from "@vef-framework-react/integration";

export const Route = createFileRoute("/_layout/sys/integration-console")({
  component: () => <IntegrationConsolePage />
});
```

The playground's reference paths: approval pages under `/approval/*` (`task-center`, `my-instances`, `initiate`, `category`, `flow`, `delegation`, `admin`), integration pages under `/sys/integration-*` (`contract`, `system`, `adapter`, `route`, `code-map`, `console`). The cron pages are not wired into the playground yet (the package is unreleased); mount them the same way, e.g. `/sys/cron-schedule` and `/sys/cron-run`.

## Overriding permission codes

Every management page accepts a `permissions` prop that merges over the package defaults, so a deployment that re-namespaces codes remaps a page without forking it:

```tsx
import { ApprovalCategoryPage, APPROVAL_PERMISSIONS } from "@vef-framework-react/approval";

// Default codes: APPROVAL_PERMISSIONS.category.{query,create,update,delete}
<ApprovalCategoryPage
  permissions={{
    create: "oa.approval.category.manage",
    update: "oa.approval.category.manage",
    delete: "oa.approval.category.manage"
  }}
/>;
```

Self-service approval pages (task center, my instances, initiate) carry **no** permission gates by design — the backend `approval/my` resource scopes every operation to the current user and declares no permission codes.

## Install

Each package is installed separately alongside the framework packages you already use:

```bash
pnpm add @vef-framework-react/approval    # approval engine console (also pulls the editors)
pnpm add @vef-framework-react/integration # integration engine console
pnpm add @vef-framework-react/cron        # durable cron console (unreleased — next release)
```

`@vef-framework-react/approval` depends on `approval-flow-editor`, `form-editor`, and `approval-form-bridge` — its designer embeds them and it re-exports the picker contract types (`EditorPlugins`, `PickerProps`, `PrincipalKind`), so hosts wire everything from the one package.

## Where to go next

- [Approval — Overview](./approval/overview.md) · [Pages](./approval/pages.md) · [API Reference](./approval/reference.md)
- [Integration — Overview](./integration/overview.md) · [Pages](./integration/pages.md) · [API Reference](./integration/reference.md)
- [Cron — Overview](./cron/overview.md) · [API Reference](./cron/reference.md)
