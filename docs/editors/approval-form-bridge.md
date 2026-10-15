---
title: Approval Form Bridge
description: Projects a form-editor FormSchema into the flow editor's field inventory and a designer-side preview of the approval backend's flat field list, with a save gate, an in-editor validator, and an approval-profile registry.
---

# Approval Form Bridge

`@vef-framework-react/approval-form-bridge` is a pure-function projection library — it renders nothing. It sits between `form-editor` and the approval backend / `approval-flow-editor`, converting a designed `FormSchema` into the field inventory `ApprovalFlowEditor`'s `plugins.formFields` consumes, plus a designer-side preview of the flat field list the Go backend derives from the deployed schema. Its validators check a schema against the approval contract: [`validateApprovalSchema`](#validateapprovalschema) as the save gate, and [`validateApprovalProjection`](#validateapprovalprojection) inside the designer.

## `createApprovalRegistries`

```ts
function createApprovalRegistries(): DeviceRegistries;
```

Builds the form-editor default `DeviceRegistries` (pc + mobile) minus `APPROVAL_EXCLUDED_FIELD_TYPES` — `["switch", "daterange", "button"]`:

- `switch` / `daterange` bind values (boolean / `[start, end]` array) the approval contract can't carry — see [supported field types](#supported-field-types) below.
- `button` binds no value, and its submit/reset actions would fight the approval shell's own submission control.

Pass the result to `<FormEditor registries={...}>` so the excluded widgets never appear in the palette — a user simply cannot author a form the approval backend would reject on those types. The `registries` prop is honored on first mount only, and `createApprovalRegistries` returns fresh instances on every call, so memoize it:

```tsx
import { createApprovalRegistries } from "@vef-framework-react/approval-form-bridge";
import { FormEditor } from "@vef-framework-react/form-editor";
import { useState } from "react";

function ApprovalFormDesigner() {
  const [registries] = useState(createApprovalRegistries);

  return <FormEditor registries={registries} onSchemaChange={handleSchemaChange} />;
}
```

## `projectFormSchema`

```ts
function projectFormSchema(schema: FormSchema): ProjectionResult;

interface ProjectionResult {
  fields: ApprovalFormField[];
  formFields: FlowFormFieldDefinition[]; // FormFieldDefinition from approval-flow-editor
  issues: ProjectionIssue[];
  valid: boolean; // true iff no error-severity issue
}
```

Walks the schema **once** and derives both outputs from that single pass, so they can never disagree:

- **`fields`** — the flat `ApprovalFormField[]` inventory, matching what the Go backend's own parser (`internal/approval/formeditor`) derives from the deployed schema at deploy time. Kept in lockstep with the backend through shared golden fixtures (`__fixtures__/formeditor-parity/`). `sortOrder` is the walk's emission index; `label` falls back to the field's `key` when unset.
- **`formFields`** — the same inventory reshaped as `FormFieldDefinition[]`, ready to pass straight into `ApprovalFlowEditor`'s `plugins.formFields`. A `table` field carries its `columns`; a field whose visibility form linkage can toggle off (its own hide-capable linkage, a hidden default, or a hide-capable ancestor container) is annotated `hasConditionalVisibility: true`, which the flow editor's field-permission table turns into a "required + linkage-hidden can deadlock the approval" warning (see [Approval Flow Editor: Host Integration](./approval-flow-editor/host-integration.md#formfields)).

This is a designer-side aid, not part of the deploy path: the backend receives the rich `FormSchema` verbatim (`DeployFlowCmd.FormSchema`) and derives the flat field list itself. `projectFormSchema` exists to preview that derivation and catch contract-fit problems before deploy.

:::warning[Migration: v2.10.0 changed the projection result and the deploy payload]
Before v2.10.0 the projection produced a wrapper object — `ProjectionResult.definition: ApprovalFormDefinition` (`{ fields: ApprovalFormField[] }`) — and that flat definition **was** the deploy payload (`DeployFlowCmd.FormDefinition`). v2.10.0 (breaking, `36dff11`) flattened the result to the bare `fields: ApprovalFormField[]` array and moved deploy onto the rich schema: the backend now receives the `FormSchema` itself and derives the flat list server-side, so the projection can never drift from what actually deploys. The `ApprovalFormDefinition` type was removed from the package exports — migrate `projection.definition.fields` to `projection.fields`, and send the schema (not the projection) at deploy.
:::

### Projection rules

- **Both device presentations are walked** (pc first, then mobile) and **deduplicated by key** — the submitted data contract is shared across devices, so a mobile-only field still projects, and a field appearing on both devices (or twice on one device) projects once, first sighting winning.
- **Widget classification runs before the dedupe** (v2.10.0, mirroring the Go parser's `classifyWidget`-before-seen order): an unmappable or unknown widget breaks the submit contract on *every* device, so a key first sighted as a mappable widget and sighted again as an unmappable one still errors — no matter which device sees the key first. Repeat sightings of an already-failed key are deduped to a single issue.
- **Cross-device conflicts are errors.** If the same key maps to a different `ApprovalFieldKind` on pc vs. mobile (`cross_device_kind_mismatch`), or a detail-table's column set differs between devices (`cross_device_table_mismatch`, compared as the ordered `key:kind` column signature), the pc projection wins but the issue is raised — the losing device would submit a value shape the deployed definition rejects. A same-kind divergence in options or validation is *not* detected (documented limitation).
- **Only root-scope keyed nodes become fields.** Layout containers (rows, sections, tabs) are transparent; only a node that binds a value opens a field.
- **A subform becomes a single-level `table` field** — its template's keyed leaves become columns (duplicate column keys dedupe, first sighting wins). A subform nested inside another subform's template is a contract violation (`nested_subform_unsupported`; approval detail tables are single-level only). `minRows` ≥ 1 sets `isRequired`; `minRows` / `maxRows` become the field's `validation.minLength` / `maxLength` row-count bounds.
- **Conservation rule: nothing is silently dropped.** A keyed node whose widget type can't be mapped is always an error-severity `ProjectionIssue`, never a silent omission — approval form data is a closed contract, and an unprojected field would cause every submit to be rejected.

### Supported field types

| Designer widget | `ApprovalFieldKind` |
| --- | --- |
| `textfield` | `input` |
| `code-editor`, `textarea` | `textarea` |
| `number` | `number` |
| `select`, `radio`, `checkbox-group` | `select` |
| `date`, `datetime` | `date` |
| subform | `table` |

`switch` and `daterange` always raise `unmappable_field_type` — their runtime values (boolean, `[start, end]`) can't satisfy the Go backend's string/number/scalar submit validation, so `createApprovalRegistries` excludes their widgets from the palette up front. Any other unregistered widget type raises `unknown_field_type_unprojectable`.

## Contract types

| Export | Shape |
| --- | --- |
| `ApprovalFormField` | `{ key, kind, label, placeholder?, defaultValue?, isRequired?, options?, optionSource?, validation?, props?, sortOrder, columnType?, scale?, columns? }` — the bare `ApprovalFormField[]` array **is** the contract; there's no wrapper object |
| `ApprovalFieldKind` | `"input" \| "textarea" \| "select" \| "number" \| "date" \| "upload" \| "table"` |
| `ApprovalFieldOption` | `{ label: string; value: unknown }` |
| `ApprovalValidationRule` | `{ minLength?, maxLength?, min?, max?, pattern?, message? }` — on a `table` field, `minLength`/`maxLength` bound the row count, not a string length |
| `ApprovalFieldOptionSource` | `{ kind: ApprovalOptionSourceKind; request?: RemoteDataSourceRequest; mapping?: RemoteOptionMapping; codeSet?: string }` — `request` / `mapping` are form-editor's own types, re-used unchanged |
| `ApprovalOptionSourceKind` | `"remote" \| "codeSet"` — deliberately narrower than the designer's source union; see [Remote option sources](#remote-option-sources) and [Data-dictionary sources](#data-dictionary-sources) |

`options` is only populated for a `select` field whose source is an inline `static` list or a `ref` to a form-global `static` data source. A source whose options cannot be enumerated — a `remote` source, inline or reached through a `ref` — projects [`optionSource`](#remote-option-sources) instead; a dangling `ref` or an unknown kind projects neither. Every one of those cases still raises `options_not_static`, and the backend still accepts any submitted value for the field, because its select validation reads `options` alone. A [data dictionary](#data-dictionary-sources) projects `optionSource` too, but raises nothing: the backend checks its values against the dictionary. `columnType` mirrors the backend's `ColumnDataType` and is only meaningful under `table` storage mode; an explicit designer override is always honored, but a number field with no configured `precision` deliberately emits **no** `columnType` (the widget-inferred `"integer"` would make the Go runtime reject fractional values, so the backend falls back to a gate-free numeric column). A `decimal` column with no configured `precision` raises `decimal_scale_missing` (a warning — the storage layer rounds to 0 decimal places); with a positive `precision`, it is emitted as `scale`. `defaultValue` and `props` exist on the wire contract but are never emitted by the projector — they are declared so hand-built or host-enriched definitions round-trip losslessly.

### Remote option sources

A selection field whose options could not be enumerated projects a descriptor in `optionSource` rather than leaving the consumer with nothing:

```ts
interface ApprovalFieldOptionSource {
  kind: ApprovalOptionSourceKind; // "remote"
  request?: RemoteDataSourceRequest;
  mapping?: RemoteOptionMapping;
}
```

Three properties are worth stating outright:

- **It is post-dereference.** A `ref` is resolved before the branch is taken, so `request` / `mapping` are the ones the referenced `FormSchema.dataSources` entry carries. A consumer never chases a `dataSourceId` it has no schema to look up. The mapping is [normalized](./form-editor/schema.md#options-and-data-sources) on the way out — blank keys dropped, omitted entirely when nothing is left — so `mapping?.labelKey ?? "label"` is safe for a consumer to read.
- **`request.params` travel unevaluated.** Each parameter stays the `DynamicValue` the designer authored — `{ kind: "literal"; value }` or `{ kind: "expression"; source }` — see [bound parameters](./form-editor/embedding.md#bound-parameters). Neither the backend nor a list-rendering consumer holds the form values an expression reads, so evaluating them at projection time would be inventing an answer; carrying them verbatim lets a consumer that *does* have values evaluate them, and one that does not drop the parameter.
- **`request` is optional only for the unfinished case.** A remote source whose request the designer left unset is emitted rather than silently degraded to a source-less field, so the Go deploy validation names it. A deployed version always carries one.

The consumer this exists for is **display, not validation**. A list view rendering a stored `select` value holds an id (`"dept-7"`) and needs the label (`"Cardiology"`). With a static source the label sits right there in `options`; with a remote one the definition used to say nothing at all, so a list either showed the raw id or re-hard-coded the request the designer had already authored. `optionSource` hands over both halves — the request to call and the `labelKey` / `valueKey` mapping to read the reply with.

The backend still never resolves it, and it does not make a value checked: a remote-sourced field accepts anything submitted, exactly as before.

### Data-dictionary sources

A field whose options come from a host data dictionary (`{ kind: "codeSet", codeSet }` — see [Data dictionaries](./form-editor/embedding.md#data-dictionaries)) projects the dictionary it names:

```ts
{ kind: "codeSet", codeSet: "sys.user.gender" }
```

Unlike a remote source, it is checked: when the host registers a `mold.CodeSetLoader`, the Go backend rejects a submitted value that is not one of the dictionary's codes — every item of a multiple selection and every detail-table cell included — so the projection raises no `options_not_static`. A list view translates a stored value with a single dictionary lookup for the whole column, since a dictionary takes no parameters. A field whose dictionary the designer left unpicked is still emitted, as `{ kind: "codeSet" }` with no key (Go's `omitempty` drops a blank one), so the Go deploy validation names it.

## `validateApprovalSchema`

```ts
function validateApprovalSchema(
  candidate: unknown,
  registries: DeviceRegistries
): ApprovalSchemaValidationResult;

interface ApprovalSchemaValidationResult {
  valid: boolean;
  issues: ApprovalSchemaIssue[]; // ValidationIssue (form-editor) | ProjectionIssue (this package)
}
```

The single save-time gate for an approval-bound form schema, run as two layers:

1. form-editor's `validateSchema` (structural integrity + registry membership) — a nested subform, for instance, is legal in a general-purpose form but not here.
2. `projectFormSchema`'s contract-fit check, run only if step 1 found no error — a malformed tree isn't worth running through the projector, which assumes well-typed input.

Both layers' issues share the `{ path, code, severity, message }` shape, so a host handles them through one list:

```tsx
import { validateApprovalSchema } from "@vef-framework-react/approval-form-bridge";

const result = validateApprovalSchema(candidate, registries);

if (!result.valid) {
  for (const issue of result.issues) {
    console.warn(`[${issue.severity}] ${issue.path}: ${issue.message}`);
  }
}
```

Use it where a schema is saved or deployed — the designer cannot enforce everything on its own (`initialSchema` is ingested without validation, for one), so this is the single choke point. While the form is being *designed*, show the same issues inside the editor instead, with `validateApprovalProjection`.

## `validateApprovalProjection`

```ts
function validateApprovalProjection(schema: FormSchema): ProjectionIssue[];
```

The approval layer of the save gate alone — exactly the `issues` of `projectFormSchema` — shaped as form-editor's [`SchemaValidator`](./form-editor/embedding.md#host-diagnostics), so it plugs straight into `FormEditor`'s `validate` prop:

```tsx
import { createApprovalRegistries, validateApprovalProjection } from "@vef-framework-react/approval-form-bridge";
import { FormEditor } from "@vef-framework-react/form-editor";
import { useState } from "react";

function ApprovalFormDesigner() {
  const [registries] = useState(createApprovalRegistries);

  return (
    <FormEditor
      registries={registries}
      validate={validateApprovalProjection}
      onSchemaChange={handleSchemaChange}
    />
  );
}
```

The editor runs its own structural pass and calls `validate` only for a structurally sound schema, so between the two a designer sees every issue `validateApprovalSchema` would report — each exactly once — in the editor's status bar, and the editor's publish gate blocks on the projection's errors as it does on its own. Because a projection issue's `path` is the field-key chain (`amount`, `items.price`), clicking one in the status bar selects the field it is about. No banner above the editor is needed, so the canvas keeps its full height.

The function is module-level and therefore identity-stable, as the `validate` prop requires.

## Projection issues

`ProjectionIssue`: `{ path: string; code: ProjectionIssueCode; severity: "error" | "warning"; message: string }`. `path` is the field-key chain — `"amount"` for a top-level field, `"items.price"` for a detail-table column. As with form-editor's `ValidationIssue`, `message` is pre-rendered Chinese product copy; program against `code` and `path`.

| Code | Severity | Meaning |
| --- | --- | --- |
| `unmappable_field_type` | error | The widget's value shape can't satisfy the approval contract (e.g. `switch`, `daterange`). |
| `unknown_field_type_unprojectable` | error | The widget type isn't registered / mappable at all. |
| `nested_subform_unsupported` | error | A subform's template contains another subform; approval detail tables are single-level. |
| `table_columns_empty` | error | A subform has no projectable columns. |
| `pattern_unsupported` | error | The field's regex uses a construct the backend's RE2 engine doesn't support (lookahead/lookbehind/backreferences) — deploy would be rejected. |
| `cross_device_kind_mismatch` | error | The same field key maps to a different kind on pc vs. mobile. |
| `cross_device_table_mismatch` | error | A subform's column set differs between pc and mobile. |
| `decimal_scale_missing` | warning | A `decimal` column has no configured precision; storage rounds to 0 decimal places. |
| `options_not_static` | warning | A select field's options come from a non-static source other than a data dictionary; the projection omits them — emitting [`optionSource`](#remote-option-sources) when the source is remote — and the backend accepts any submitted value. |
| `linkage_not_projected` | warning | The field has linkage rules the approval backend doesn't evaluate — a linkage-hidden field still drops its value from the submit payload, which can conflict with a static `isRequired`. |

## End-to-end example

Combining the bridge with both editors — the composition the approval package's [flow designer wizard](../engines/approval/pages.md#flowdesignerdrawer) is built on:

```tsx
import type { EditorPlugins, FlowDefinition } from "@vef-framework-react/approval-flow-editor";
import type { FormSchema } from "@vef-framework-react/form-editor";

import { ApprovalFlowEditor, validateFlowDefinition } from "@vef-framework-react/approval-flow-editor";
import {
  createApprovalRegistries,
  projectFormSchema,
  validateApprovalProjection,
  validateApprovalSchema
} from "@vef-framework-react/approval-form-bridge";
import { FormEditor } from "@vef-framework-react/form-editor";
import { useMemo, useState } from "react";

function ApprovalDesigner() {
  const [registries] = useState(createApprovalRegistries);
  const [formSchema, setFormSchema] = useState<FormSchema | null>(null);
  const [flowDefinition, setFlowDefinition] = useState<FlowDefinition>({ nodes: [], edges: [] });

  // One walk feeds the flow editor's field inventory.
  const projection = useMemo(() => formSchema ? projectFormSchema(formSchema) : null, [formSchema]);

  // The save gate. The designer already shows these issues in its own status
  // bar (through `validate` below); this only decides whether to deploy.
  const formValid = useMemo(
    () => formSchema === null || validateApprovalSchema(formSchema, registries).valid,
    [formSchema, registries]
  );

  const plugins = useMemo<EditorPlugins>(
    () => ({ formFields: projection?.formFields ?? [] }),
    [projection]
  );

  const flowErrors = useMemo(
    () => validateFlowDefinition(flowDefinition, { formFields: projection?.formFields ?? [] }),
    [flowDefinition, projection]
  );

  return (
    <>
      <FormEditor registries={registries} validate={validateApprovalProjection} onSchemaChange={setFormSchema} />

      <ApprovalFlowEditor plugins={plugins} value={flowDefinition} onChange={setFlowDefinition} />

      <Button disabled={!formValid || flowErrors.length > 0} onClick={() => deploy(formSchema, flowDefinition)}>
        Deploy
      </Button>
    </>
  );
}
```

See [Approval Flow Editor: Host Integration](./approval-flow-editor/host-integration.md) for what `plugins.formFields` and `validateFlowDefinition` do on the flow side, and the [form-editor reference](./form-editor/reference.md) for `FormSchema`, `DeviceRegistries`, and `validateSchema`.
