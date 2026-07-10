---
title: Release Notes & Upgrade Guide
description: Per-version breaking changes, features, and notable fixes for every released version, with before/after upgrade snippets.
---

# Release Notes & Upgrade Guide

All published packages release in lockstep from a single repository: one release commit bumps every `packages/*/package.json` to the same version, and the release is tagged `vX.Y.Z`. Upgrade every `@vef-framework-react/*` dependency together — [Installation](../getting-started/installation.md) pins them all to `^2.9.0` for exactly this reason. Mixing versions across packages in one app is not supported.

The package *set* itself can change between releases: v2.7.0 removed `@vef-framework-react/expression`, and v2.8.0 added `@vef-framework-react/approval-form-bridge` — both are called out below.

Versions are listed newest-first. Each version leads with breaking changes, then features, then fixes worth knowing. Changes to the internal playground demo and repository tooling are omitted.

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
{ key: "crm", name: "CRM", icon: "briefcase" }

// After (≥ v2.5.0)
{ key: "crm", name: "CRM", icon: <DynamicIcon name="briefcase" /> }
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
