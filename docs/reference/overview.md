---
title: Package API Map
description: Which of the twelve packages to open first for a given need, with links into the dry reference for each.
---

# Package API Map

This section is dry, information-oriented reference: per-package signatures, types, and option tables. It does not repeat the "why" — that lives in [Guides](../guide/routing.md) — or component prop tables and examples, which live in [Components](../components/overview.md).

This page answers a narrower question first: given a need, which of the twelve packages should be opened, and where does its reference live?

## `@vef-framework-react/starter`

Application bootstrap, routing, and the application shell (layouts, login, status pages) on top of TanStack Router.

Best suited for:

- application entry (`createApp`)
- router setup and route-option helpers
- login, layout, and authenticated-route wiring

Start with:

- `createApp`
- `createApiClient`
- `createRouter`
- `createLayoutRouteOptions`
- `createLoginRouteOptions`
- `useAppStore`

Reference: [Starter Package](./starter/overview.md)

## `@vef-framework-react/components`

antd v6 + Emotion UI library (100+ components): page/CRUD containers, form fields, option-driven controls, notifications, icons, and charts.

Best suited for:

- UI components, including `Page`, `ProTable`, and `CrudPage`
- form fields and the TanStack Form integration
- theme tokens and CSS variables

Start with:

- `globalCssVars`
- `useThemeTokens`
- `useIsDarkMode`
- `useForm`
- `useFormContext`
- `Table`
- `PermissionGate`
- `Icon`
- `Chart`

Reference: component prop tables and examples live in [Components](../components/overview.md), not under this section.

## `@vef-framework-react/core`

The runtime foundation: HTTP client, API client (Axios + TanStack Query), state management (Zustand/Jotai/XState), Immer, selector-based contexts, an SSE client, and the `push` module — a WebSocket client for the vef server push channel.

Best suited for:

- query and mutation
- stores and atoms
- permission checks
- HTTP, SSE, and server push (`PushClient`)
- chunked, resumable file uploads (Storage / Uploader)

Start with:

- `useQuery`
- `useMutation`
- `createStore`
- `createComponentStore`
- `atom`
- `checkPermission`
- `createPushClient`

Reference: [Core Package](./core/overview.md)

## `@vef-framework-react/hooks`

Reusable React hook library: permission, event, code-set, push, upload, and deep-compare hooks, plus stable re-exports of common Mantine / hotkey hooks.

Best suited for:

- code sets
- option transformation
- loading-state checks
- permission-aware filtering and checks
- server push subscriptions

Start with:

- `useCodeSetQuery`
- `useDataOptionsQuery`
- `usePushMessage`
- `useHasFetching`
- `useHasMutating`
- `useAuthorizedItems`
- `useIsAuthorized`

Reference: [Hooks Package](./hooks/vef-hooks.md)

## `@vef-framework-react/shared`

Pure-function utility foundation: type utilities, date/formatting/validation helpers, event/object/tree/path/string utilities, and color helpers.

Best suited for:

- validation
- formatting
- tree processing
- event emitters

Start with:

- `z`
- `EventEmitter`
- `formatDate`
- `flattenTree`
- `mapTree`

Reference: [Shared Package](./shared/overview.md)

## `@vef-framework-react/form-editor`

Visual form schema editor targeting forms with 100s of fields. Linkage expressions (conditions, assignments, script actions) compile through `new Function`.

Best suited for:

- embedding a drag-and-drop form designer
- rendering a saved schema at runtime (`FormRenderer`)
- linkage expressions driven by `$form` / `$vars` / `$user` / `$node`

Start with:

- `FormEditor`
- `FormRenderer`
- `FormEditorProvider`

Reference: [Visual Editors / Form Editor](../editors/form-editor/overview.md)

## `@vef-framework-react/approval-flow-editor`

Visual approval flow designer on `@xyflow/react` v12 (ReactFlow) with elkjs auto-layout.

Best suited for:

- embedding an approval flow designer
- editing flow-definition JSON structures
- plugging in custom node pickers (`EditorPlugins`)

Start with:

- `ApprovalFlowEditor`
- `toFlowDefinition`
- `fromFlowDefinition`
- `EditorPlugins`

Reference: [Visual Editors / Approval Flow Editor](../editors/approval-flow-editor/overview.md)

## `@vef-framework-react/approval-form-bridge`

Projection bridge from form-editor schemas to the Go approval form contract.

Best suited for:

- projecting a form-editor schema into a backend `FormDefinition` (`projectFormSchema`)
- building an approval-safe field/operator registry (`createApprovalRegistries`)
- validating a schema is approval-flow-safe before save (`validateApprovalSchema`)

Start with:

- `projectFormSchema`
- `createApprovalRegistries`
- `validateApprovalSchema`

Reference: [Visual Editors / Approval Form Bridge](../editors/approval-form-bridge.md)

## `@vef-framework-react/approval`

Drop-in management and runtime pages for the approval engine, embedding the flow designer end to end.

Best suited for:

- mounting the approval center (flow designer, task center, instance views) onto routes
- host-supplied principal pickers via `ApprovalProvider`
- approval permission catalogs

Start with:

- `ApprovalFlowPage`
- `ApprovalTaskCenterPage`
- `ApprovalProvider`
- `APPROVAL_PERMISSIONS`

Reference: [Engines / Approval](../engines/approval/overview.md)

## `@vef-framework-react/integration`

Drop-in management pages for the integration engine: systems, adapters, contracts, routes, code maps, and a console workbench.

Best suited for:

- mounting the integration management console onto routes
- integration permission catalogs

Start with:

- `IntegrationSystemPage`
- `IntegrationConsolePage`
- `INTEGRATION_PERMISSIONS`

Reference: [Engines / Integration](../engines/integration/overview.md)

## `@vef-framework-react/cron`

Drop-in management pages for the durable cron scheduling engine: schedules and run history.

Best suited for:

- mounting cron schedule and run-history pages onto routes
- cron permission catalogs

Start with:

- `CronSchedulePage`
- `CronRunPage`
- `CRON_PERMISSIONS`

Reference: [Engines / Cron](../engines/cron/overview.md)

## `@vef-framework-react/dev`

Shared Vite, ESLint, Stylelint, and Commitlint configuration for VEF-based projects, plus the `vef` CLI and the code-set key generator.

Best suited for:

- Vite build configuration
- ESLint rules
- Stylelint rules
- Commitlint rules
- generating the `CodeSetKey` union from the backend catalog

Start with:

- `defineViteConfig`
- `defineEslintConfig`
- `defineStylelintConfig`
- `defineCommitlintConfig`
- `defineCodeGenerationConfig`

Reference: [Dev Package](./dev/overview.md)
