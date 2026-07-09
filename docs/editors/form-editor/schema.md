---
title: Form Schema
description: The FormSchema block-tree shape — field and container types, per-device presentations, value scopes, and layout sizing.
---

# Form Schema

A `FormSchema` is the single artifact `FormEditor` produces and `FormRenderer` consumes — a plain, JSON-serializable object. This page covers its shape; see [Linkage](./linkage.md) for the conditional-behavior model attached to individual blocks, and [Reference](./reference.md) for exhaustive export tables.

## Top-level shape

```ts
interface FormSchema {
  id: string;
  version: 2;
  variables?: FormVariable[];
  dataSources?: FormDataSource[];
  linkage?: FieldLinkage; // form-scope "events" — see Linkage
  presentations: {
    pc: PresentationLayer;
    mobile?: PresentationLayer;
  };
}
```

`variables`, `dataSources`, and the form-scope `linkage` are the **shared data layer** — one set for the whole form, regardless of device. `presentations` holds each device's independent layout. Create an empty document with `createEmptySchema()` (mints a fresh `id` and an empty `pc` presentation).

## Per-device presentations

```ts
interface PresentationLayer {
  gap?: GapScale; // "small" | "medium" | "large", default "medium"
  children: Block[];
}
```

`pc` and `mobile` are independent block trees — a form can be laid out completely differently on each device while both bind the same `variables` / `dataSources` and the same field `key`s. `pc` always exists; `mobile` is `undefined` until a design is started for it, and `FormRenderer` shows an empty state for an undesigned device rather than falling back to `pc`.

A few helpers bridge the device-keyed `FormSchema` and the flat `PresentationLayer` the engine walks:

| Export | Signature | Purpose |
| --- | --- | --- |
| `currentLayer` | `(schema, device) => PresentationLayer` | The editable layer for a device; an undesigned `mobile` resolves to a stable shared empty layer. |
| `resolvePresentation` | `(schema, device) => PresentationLayer \| undefined` | Same, but `undefined` (not a fallback) for an undesigned device — the render-time semantic. |
| `withPresentation` | `(schema, device, layer) => FormSchema` | Write a layer back to one device, leaving the other and the shared data layer untouched. |
| `emptyLayer` | `() => PresentationLayer` | The shared empty-layer constant. |
| `toRuntimeSchema` | `(schema, device) => RuntimeSchema \| undefined` | Flatten one device's layer plus the shared data layer into the `RuntimeSchema` the renderer and linkage engine actually evaluate. |

### PC-to-mobile conversion

`convertPresentation(pc, rules, targetRegistry)` produces a best-effort, single-column mobile starting point from a PC layer: it strips PC-only layout (`span` / `flex`), reflows `flex` / `grid` containers by unwrapping them (their children splice in place, since a phone has no side-by-side layout), degrades `code-editor` to `textarea` (no mobile code control), and drops anything the mobile registry has no type for — returning a `ConversionReport` of what converted and what was dropped so the host can surface it. `createDefaultConversionRules()` builds the rule set the editor uses by default; extend it via `new ConversionRegistry().register({ type, convert })` for a custom field's own conversion behavior.

## The block tree

Every node in a `PresentationLayer.children` array — and every node nested inside a container — is a **block**: either a leaf field (`FormField`) or a container (`ContainerNode`).

```ts
type Block = FormField | ContainerNode;
```

Blocks stack **vertically** in document-flow order. There is no implicit multi-column row — side-by-side placement is always an explicit `grid` or `flex` container the author drags in. This keeps the tree shape and the visual layout in agreement without a separate "row" concept to keep in sync.

### Leaf fields

`FormField` is the union of every registered leaf type, keyed by its `type` discriminator (`FormFieldTypeMap`). Unlike containers, this map is **open** — a host adds its own field type's interface to the union by augmenting the module:

```ts
declare module "@vef-framework-react/form-editor" {
  interface FormFieldTypeMap {
    rating: RatingField;
  }
}
```

paired with a `FieldDefinition` registered on a `FormFieldRegistry` (see [Embedding → Field registries](./embedding.md#field-registries) and [Reference → Definition builders](./reference.md#definition-builders)). The built-in types:

| `type` | Registry export | Keyed | Group | Notes |
| --- | --- | --- | --- | --- |
| `textfield` | `textfieldDefinition` | yes | basic-input | single-line text; `inputType: "password"` masks it |
| `code-editor` | `codeEditorDefinition` | yes | basic-input | CodeMirror-backed multi-line code; lazy-loaded (heaviest dependency in the stack) |
| `number` | `numberFieldDefinition` | yes | basic-input | distinguishes input **bounds** (`min`/`max`, clamp the committed value) from `validate.min`/`max` (submit-time rule) |
| `textarea` | `textareaFieldDefinition` | yes | basic-input | multi-line text |
| `switch` | `switchFieldDefinition` | yes | selection | boolean toggle; not `Validatable` — a switch always holds a value, so static `required` has no meaning (a `require` linkage rule still applies) |
| `select` | `selectFieldDefinition` | yes | selection | single-select dropdown; `dataSource` is static / ref / remote |
| `radio` | `radioFieldDefinition` | yes | selection | single-select radio group; `optionType: "button"` renders a segmented group |
| `checkbox-group` | `checkboxGroupFieldDefinition` | yes | selection | multi-select; contributes an array value |
| `date` | `dateFieldDefinition` | yes | date-file | contributes a `YYYY-MM-DD` string |
| `datetime` | `datetimeFieldDefinition` | yes | date-file | contributes a `YYYY-MM-DD HH:mm:ss` string |
| `daterange` | `dateRangeFieldDefinition` | yes | date-file | contributes a `[start, end]` string pair |
| `button` | `buttonDefinition` | no | action | non-keyed; `action` (html `type`, default `"submit"`) is orthogonal to `buttonType` (visual style) |
| `divider` | `dividerDefinition` | no | presentation | section rule with an optional inline title |
| `alert-block` | `alertBlockDefinition` | no | presentation | inline alert banner |
| `paragraph` | `paragraphDefinition` | no | presentation | static explanatory text |

Every leaf field shares `id`, `label`, `labelPosition` (`"top" | "left" | "right"`), plus the [layout sizing](#layout-and-sizing) and [linkage](./linkage.md) slots. Fields marked "keyed" additionally carry a `key: string` (the data-binding path) and an optional `columnType` override (see [table-storage projection](#table-storage-projection)); most also implement `Validatable` (`validate: { required, minLength, maxLength, min, max, pattern, message }`) — `switch` is the one exception noted above. The exact per-field props (`placeholder`, `allowClear`, `size`, `dataSource`, …) are documented per interface in the [Reference](./reference.md#leaf-field-interfaces).

`mobileFieldDefinitions` is the parallel antd-mobile renderer set — every built-in leaf type except `code-editor` (which has no mobile control; the PC → mobile converter degrades it to `textarea`), reusing each PC field's `config` and property-panel descriptors with only the rendered `Component` swapped.

### Containers

Containers are a **closed set** — `ContainerNode = SectionNode | TabsNode | SubformNode | FlexNode | GridNode`. Unlike leaf fields, hosts cannot add a new container kind through the registry (each one has distinct value-scope and tree-walk semantics baked into the engine); a custom layout need generally fits inside `flex` or `grid`.

| `type` | Registry export | Keyed | Opens a value scope | Notes |
| --- | --- | --- | --- | --- |
| `section` | `sectionDefinition` | no | no | `variant: "card"` (antd `Card`, never collapses) or `"collapse"` (antd `Collapse`, `defaultCollapsed`) |
| `tabs` | `tabsDefinition` | no | no | ordered `TabItem[]` (`{ id, label, children }`); panes mount lazily |
| `subform` | `subformDefinition` | **yes** | **yes** | repeating record group — see [Subforms](#subforms) |
| `flex` | `flexDefinition` | no | no | CSS flexbox row/column; each child sized by its own `flex: FlexSlot` |
| `grid` | `gridDefinition` | no | no | CSS grid, `columns` (default 2, `1..24`); each child's `span` widens it |

`section`, `tabs`, `flex`, and `grid` are pure layout: they pass their enclosing value scope straight through to their children. Only `subform` opens a new one.

### Subforms

A `subform` binds an `Array<Record<string, unknown>>` under its own `key`; its `template: Block[]` is the per-row field set, and — uniquely among containers — **opens a new value scope**: a template field's `key` only has to be unique among its row siblings, not against the whole form (its runtime path is `lines[i].amount`, never colliding with a root `amount`). `minRows` / `maxRows` bound the row count; `addLabel` customizes the add control's text.

Two variants share this data contract and differ only in presentation:

- **`stack`** (default) — each row renders its template as a normal vertical stack of fully editable, individually laid-out fields. Supports nesting and per-row linkage.
- **`table`** — rows render through the components package's `EditableTable` (desktop only; the mobile presentation always falls back to `stack`). Since every template field becomes a column, a non-keyed or container block in a `table` subform's template flags `subform_table_column` — a warning (not a rejection); the renderer skips that block.

## Value binding and keys

A node that contributes data carries a `key` (`KeyedNode`); a keyed leaf field or a `subform` narrows to `KeyedNodeUnion`. Keys are unique **per value scope**, not globally — the root scope and each subform's template scope are independent namespaces.

| Export | Signature | Purpose |
| --- | --- | --- |
| `isKeyedNode` | `(node: Block) => node is KeyedNodeUnion` | Structural guard catching both keyed leaf fields and `subform`. |
| `isKeyedField` | `(field: FormField) => field is KeyedFormField` | Same, narrowed to the `FormField` union only. |
| `createId` | `(prefix) => string` | Mint a node id (`Field_…`, `Section_…`, `Rule_…`, …) via the shared cuid2 generator. |
| `generateUniqueKey` | `(layer, baseKey, scope?) => string` | Allocate a scope-unique key, trying `base`, then `base_2`, `base_3`, … |
| `nextUniqueKey` | `(used: Set<string>, baseKey) => string` | The same allocation against an already-collected key set (for minting several keys in one pass). |
| `sanitizeKey` | `(key: string) => string` | Strip every non-word character, so a user-typed key can never break value-path resolution. |

## Options and data sources

A selection field's `dataSource: FieldOptionSource` is one of:

```ts
type FieldOptionSource =
  | { kind: "static"; options: FieldOption[] }             // inline, resolved synchronously
  | { kind: "ref"; dataSourceId: string }                   // points at FormSchema.dataSources
  | { kind: "remote"; request: RemoteDataSourceRequest; mapping?: RemoteOptionMapping }; // inline RPC
```

`FormSchema.dataSources: FormDataSource[]` holds form-global, reusable sources (`{ id, name, kind: "static", options }` or `{ id, name, kind: "remote", request, mapping }`) that `ref` sources point at by id. `RemoteDataSourceRequest` (`{ resource, action, version?, params? }`) is transport-agnostic — the package has no `apiClient` dependency; a host resolves it via a `DataSourceResolver` (see [Embedding → Loading remote options](./embedding.md#loading-remote-options)). `RemoteOptionMapping` (`labelKey` / `valueKey` / `disabledKey` / `descriptionKey`, all defaulting to `"label"` / `"value"`) maps raw remote records into `{ label, value }` pairs.

`FormSchema.variables: FormVariable[]` (`{ id, name, type: "string" | "number" | "boolean" | "json", defaultValue? }`) declares the form-global `$vars` surfaced to [linkage expressions](./linkage.md).

## Layout and sizing

A block carries at most one meaningful layout prop, selected by its parent — the type system does not prevent setting more than one, but only the one the parent honors has any effect:

| Prop | Honored when the block is | Shape |
| --- | --- | --- |
| `span` | a `grid` cell | integer `1..24` (`ROW_COLS`); omitted means one column |
| `flex` | a `flex` child | `{ grow?, shrink?, basis? }` |
| `columnWidth` | a `table` subform column | fixed pixel width; omitted shares remaining width |
| `stack` | a direct child of a stack body (root / `section` / `tabs` pane / `stack` subform row) | `{ width?, minWidth?, maxWidth?: CssLength, align?: "start" \| "center" \| "end" }`, `CssLength = { value: number; unit: "px" \| "%" }` |

A stacking body's own vertical rhythm is `gap: GapScale` (`"small" | "medium" | "large"`, `DEFAULT_GAP_SCALE = "medium"`, valid values in `GAP_SCALES`) on the `PresentationLayer` itself or on a `section` / `tabs` / `stack`-subform — omitted means inherit the form-level (or subform-level) default. `linkage` (see [Linkage](./linkage.md)) is honored on **any** block, leaf or container.

## Editing the tree

Every mutator in this section is pure (returns a new `PresentationLayer`) and follows one identity contract: **a no-op returns the exact input reference**, and a successful edit rebuilds only the path from the root to the change, so every untouched branch keeps its previous object identity. This is what lets the canvas and the runtime renderer memoize blocks by reference at hundreds of fields.

| Export | Signature | Purpose |
| --- | --- | --- |
| `insertBlock` | `(layer, block, target: DropTarget) => PresentationLayer` | Insert a block at a drop target (`{ kind: "beside", anchorId, side }`, `{ kind: "container", containerId, tabIndex? }`, or `{ kind: "append" }`). |
| `moveBlock` | `(layer, nodeId, target) => PresentationLayer` | Move an existing block; re-keys it if the move crosses a value scope. Transactional — rolls back on a target that doesn't land. |
| `cloneBlock` | `(block, allocateKey: ((base: string) => string) \| null) => Block` | Deep-clone with fresh ids throughout; `allocateKey` reallocates keys in the clone's own scope, `null` preserves them verbatim (used inside an already-isolated subform template). |
| `setSpan` / `setFlex` | `(layer, blockId, value) => PresentationLayer` | Normalize-and-write a block's grid span / flex slot. |
| `editField` | `(layer, fieldId, updater: (field: FormField) => FormField) => PresentationLayer` | Apply a pure updater to one leaf field, matched by id. |
| `removeBlock` | `(layer, id) => PresentationLayer` | Remove a block anywhere in the tree. Does **not** prune dangling linkage references to its key — that is an editor-store concern layered on top. |
| `updateNode` | `(layer, id, updater: (node: Block) => Block) => PresentationLayer` | Apply a pure updater to any node (field or container), matched by id. |

Read/query the tree with `walkNodes` / `walkFields` (depth-first visitors receiving each node plus its enclosing scope — the chain of subform keys it sits under), `findNode` / `findField` / `findParentContainer`, and the `isContainerNode` / `isLeafField` type guards.

## Validating an imported schema

`FormEditor`'s own mutators always produce a well-formed tree. `validateSchema(candidate: unknown, registries: DeviceRegistries): ValidateSchemaResult` is the boundary guard for schema that did **not** come from the editor — a pasted import, an API payload. It checks the data envelope, per-presentation id/key uniqueness and key grammar, span ranges, known field types (against the registries you pass in), option-source shapes, and delegates to `validateLinkageSchema` (see [Linkage → Validation](./linkage.md#validation)) once the structural pass is clean. A result is `valid` (and carries the narrowed `schema`) as long as it has no *error*-severity issue — *warning*-severity issues (dangling references, empty condition groups) are legitimate mid-authoring state and round-trip through export → import.

## Table-storage projection

For a host that persists submitted values in a relational column per keyed field, `toColumnDefinitions(schema): ColumnDefinition[]` projects every root-scope keyed leaf field (deduplicated across both device presentations, `pc` winning a collision) to a `{ key, columnType, maxLength?, precision? }` record. `columnType: ColumnDataType` (`"string" | "text" | "integer" | "decimal" | "boolean" | "date" | "datetime" | "json"`) is inferred deterministically from the widget by `inferColumnType(field)`, honoring a field's explicit `columnType` override first — only `number` (integer vs. decimal, by `precision`) and the string family (sized `string` vs. unbounded `text`, by `validate.maxLength`) are ambiguous enough to need it.

## Approval flow editor bridge

`toFormFieldDefinitions(schema): FormFieldDefinition[]` flattens the same root-scope keyed field inventory into the coarse `{ key, kind: FieldKind, label, options? }` shape `@vef-framework-react/approval-flow-editor` consumes through its `EditorPlugins.formFields` seam to drive its per-node field-permission matrix. `FieldKind` is a lossy, lowest-common-denominator set (`"input" | "textarea" | "select" | "number" | "date" | "upload"`) shared with the Go backend's `FieldKind`.

This mapping is intentionally simple and is **not** the authoritative approval integration path — for approval-backend integrations, project the schema with `projectFormSchema` from [`@vef-framework-react/approval-form-bridge`](../approval-form-bridge.md) instead. It walks the schema once and derives the same `FormFieldDefinition[]` shape (as `formFields`) alongside the flat `ApprovalFormField[]` the Go backend's own parser expects (as `fields`), with a conservation rule — an unprojectable keyed field is always a reported error, never a silent drop.
