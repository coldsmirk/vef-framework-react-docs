---
title: Package API Map
description: Which of the nine published packages to open first for a given need, with links into the dry reference for each.
---

# Package API Map

This section is dry, information-oriented reference: per-package signatures, types, and option tables. It does not repeat the "why" — that lives in [Guides](../guide/routing.md) — or component prop tables and examples, which live in [Components](../components/overview.md).

This page answers a narrower question first: given a need, which of the nine published packages should be opened, and where does its reference live?

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

The runtime foundation: HTTP client, API client (Axios + TanStack Query), state management (Zustand/Jotai/XState), Immer, selector-based contexts, and an SSE client.

Best suited for:

- query and mutation
- stores and atoms
- permission checks
- HTTP and SSE
- chunked, resumable file uploads (Storage / Uploader)

Start with:

- `useQuery`
- `useMutation`
- `createStore`
- `createComponentStore`
- `atom`
- `checkPermission`

Reference: [Core Package](./core/overview.md)

## `@vef-framework-react/hooks`

Reusable React hook library: permission, event, dictionary, upload, and deep-compare hooks, plus stable re-exports of common Mantine / hotkey hooks.

Best suited for:

- data dictionaries
- option transformation
- loading-state checks
- permission-aware filtering and checks

Start with:

- `useDictionaryQuery`
- `useDataOptionsQuery`
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

## `@vef-framework-react/dev`

Shared Vite, ESLint, Stylelint, and Commitlint configuration for VEF-based projects.

Best suited for:

- Vite build configuration
- ESLint rules
- Stylelint rules
- Commitlint rules

Start with:

- `defineViteConfig`
- `defineEslintConfig`
- `defineStylelintConfig`
- `defineCommitlintConfig`

Reference: [Dev Package](./dev/overview.md)
