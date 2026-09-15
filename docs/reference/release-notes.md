---
title: Release Notes & Upgrade Guide
description: Per-version breaking changes, features, and notable fixes for every released version plus unreleased changes, with before/after upgrade snippets.
---

# Release Notes & Upgrade Guide

All packages release together from a single repository: one release commit bumps every `packages/*/package.json`, and the release is tagged `vX.Y.Z`. The bump is applied per package relative to its own manifest (the release script runs `pnpm version` in each package), so all packages move by the same increment — but a package added mid-cycle starts from whatever version its scaffold declared, and its number can trail the tag until the repository's `sync-meta` maintenance script realigns it with the root. This is not theoretical: **the v2.12.0 release published `@vef-framework-react/integration` as 2.10.0** while every other package published as 2.12.0.

The upgrade rule is therefore: upgrade every `@vef-framework-react/*` dependency together, each to the version published by the *same* release — [Installation](../getting-started/installation.md) pins the current set. Mixing packages from different releases in one app is not supported.

The package *set* itself can change between releases: v2.7.0 removed `@vef-framework-react/expression`, v2.8.0 added `@vef-framework-react/approval-form-bridge`, v2.12.0 added `@vef-framework-react/approval` and `@vef-framework-react/integration`, and v2.13.0 added `@vef-framework-react/cron` — all are called out below.

Versions are listed newest-first, starting with changes that are merged but not yet released. Each version leads with breaking changes, then features, then fixes worth knowing. Changes to the internal playground demo and repository tooling are omitted.

## Unreleased (after v2.21.0)

### Fixes worth knowing

- **form-editor** — `uploadFieldDefinition` is now exported from the package index, so custom registries can reuse the built-in upload definition directly. The `EditCoalesceOptions` documentation now states that undo folding is opt-in: omit `coalesceKey` for a discrete undo step, and pass a stable fine-grained key to fold a run of edits.

## v2.21.0 (2026-09-14)

No breaking changes.

### Features

- **core** — `HttpClientOptions.protectedBodyEncoding` enables mandatory bidirectional `aes-gcm+base64` JSON body transport. It uses the browser Web Crypto API, matches the Go framework's nonce/ciphertext/tag wire layout, takes precedence over legacy body encodings, and rejects unmarked or mismatched protected responses. See [HTTP and API Client](./core/http-and-api.md#protected-body-transport).
- **starter** — `starter.createApiClient()` accepts `protectedBodyEncoding` and forwards it to the core HTTP client.

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
