---
title: Host Integration
description: Wiring principal pickers, form field metadata, global subjects, condition operators, and validation into ApprovalFlowEditor.
---

# Host Integration

`@vef-framework-react/approval-flow-editor` is a self-contained business component. Its main integration surface is the `plugins` prop, not styling or slots — a host injects pickers and field metadata, and reads back a `FlowDefinition` through `onChange`.

## `plugins`: `EditorPlugins`

```tsx
import type { EditorPlugins, FlowDefinition } from "@vef-framework-react/approval-flow-editor";

import { ApprovalFlowEditor } from "@vef-framework-react/approval-flow-editor";
import { useState } from "react";

const [definition, setDefinition] = useState<FlowDefinition>(initialValue);

const plugins: EditorPlugins = {
  pickers: { user: UserPicker, role: RolePicker, department: DepartmentPicker },
  formFields: [
    { key: "amount", kind: "number", label: "Amount" },
    { key: "reason", kind: "textarea", label: "Reason" }
  ]
};

<ApprovalFlowEditor plugins={plugins} value={definition} onChange={setDefinition} />;
```

`EditorPlugins` has three optional fields:

| Field | Type | Purpose |
| --- | --- | --- |
| `pickers` | `Partial<Record<PrincipalKind, FC<PickerProps>>>` | Resolves concrete ids for `user` / `role` / `department` assignees and CC recipients. A kind left unset degrades gracefully to an inline hint instead of a picker. |
| `formFields` | `FormFieldDefinition[]` | The form's top-level field inventory — feeds the condition editor, the field-permission table, and `validateFlowDefinition`'s `fieldPermissions` cross-check. Leaving it `undefined` means "no inventory available" and is distinct from `[]` — see [`formFields`](#formfields) below. |
| `globalSubjects` | `FormFieldDefinition[]` | Host-declared variables the condition editor offers alongside the built-in applicant attributes and `formFields`. |

### Pickers

`PickerProps` is deliberately minimal — the editor only stores ids; the picker owns its own display (resolving names, rendering chips, search, etc.):

```ts
interface PickerProps {
  value: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
}
```

```tsx
import type { PickerProps } from "@vef-framework-react/approval-flow-editor";
import type { FC } from "react";

import { Select } from "@vef-framework-react/components";

function createUserPicker(): FC<PickerProps> {
  return function UserPicker({ value, onChange, disabled }) {
    const { data: options } = useUserOptionsQuery();

    return (
      <Select
        allowClear
        disabled={disabled}
        mode="multiple"
        options={options}
        value={value}
        onChange={onChange}
      />
    );
  };
}
```

`isPrincipalKind` and `PRINCIPAL_KINDS` (`["user", "role", "department"]`) are exported for hosts that need to build the picker map or a settings UI generically, without re-hardcoding the three kinds.

### `formFields`

Typically sourced from `@vef-framework-react/approval-form-bridge`'s `projectFormSchema(schema).formFields` — see [Approval Form Bridge](../approval-form-bridge.md) — but any `FormFieldDefinition[]` works, including a hand-written one for a flow that isn't backed by a designed form.

Since v2.10.0 the inventory is **tri-state**, and the editor passes it through to `validateFlowDefinition` as-is (including `undefined`):

- **`undefined`** (the field omitted) — the inventory is *unavailable*: a host rendering the flow editor without any form integration. The live validation and the publish gate skip only the key-existence cross-check (`field_permission_key_unknown`), since there is nothing to check keys against; the permission-value and CC-subset checks still run. A definition with dangling `fieldPermissions` keys is *not* flagged in this state, so a form-less host is never falsely blocked.
- **`[]`** (an explicit empty array) — the form is known to have *zero* fields: every `fieldPermissions` entry is a dangling reference and errors, mirroring the backend's "flow whose form has zero fields" case.
- **A populated array** — every `fieldPermissions` key must name an entry, and the condition editor / field-permission table render from it.

Pass the projection's real `formFields` (populated or `[]`) whenever a form exists; omit the plugin field entirely only when there is genuinely no form integration.

A projection-sourced entry may carry `hasConditionalVisibility: true` (v2.10.0), meaning form linkage can hide that field at runtime. The field-permission table pairs this with a per-row warning: granting `required` on such a field can deadlock the approval — the backend's required check is linkage-blind, so if linkage hides the field at approval time, its empty value rejects the approve forever. The warning is a non-blocking tooltip (the combination is legitimate when the approver can edit the controlling field) and never enters `validateFlowDefinition`'s publish gate. A related conflict *is* blocking: pairing a `required` permission with `timeoutAction: "auto_pass"` raises `field_permission_required_auto_pass`, because the auto-pass timeout path finishes the node without the manual-approve required check (see [API Reference → Validation](./reference.md#validation)).

### `globalSubjects`

Variables the engine resolves from the instance's server-side globals snapshot (`Instance.Globals` on the backend, populated by the host's `InstanceGlobalsResolver` at instance start — never from the client) rather than from form data. `kind` drives the operator set and value input exactly as it does for `formFields`:

```tsx
const plugins: EditorPlugins = {
  globalSubjects: [
    { key: "applicantLevel", kind: "number", label: "Applicant level" },
    {
      key: "applicantDepartmentName",
      kind: "select",
      label: "Applicant department",
      options: [
        { label: "Engineering", value: "engineering" },
        { label: "Sales", value: "sales" }
      ]
    }
  ]
};
```

Resolution order matters when keys collide: a `globalSubjects` key colliding with a built-in applicant subject is dropped, and a `formFields` key colliding with either a built-in subject or a global subject is shadowed.

## Condition operators

`ConditionDefinition.operator` draws from a closed vocabulary the backend's `approval.ConditionOperator` mirrors literal-for-literal:

```ts
const CONDITION_OPERATORS = [
  "eq", "ne", "gt", "gte", "lt", "lte",
  "contains", "not_contains", "starts_with", "ends_with",
  "in", "not_in", "is_empty", "is_not_empty"
] as const;
```

Import `CONDITION_OPERATORS` (the runtime array) and `ConditionOperator` (the derived type) when building a custom condition UI on top of the same vocabulary — one definition site backs both the type and the allow-list `validateFlowDefinition` checks against.

## Serialization: `fromFlowDefinition` / `toFlowDefinition`

The editor uses these internally to convert between the wire `FlowDefinition` and its live canvas graph on every controlled `value` / `onChange` round-trip, so most hosts never call them directly. They're exported for cases where a host needs the same conversion outside a mounted editor — e.g. constructing/inspecting a `FlowDefinition` in a test, or normalizing a hand-authored definition before first passing it in as `value`.

```ts
import { fromFlowDefinition, toFlowDefinition } from "@vef-framework-react/approval-flow-editor";

const { nodes, edges } = fromFlowDefinition(savedDefinition); // wire → live graph
const definition = toFlowDefinition(nodes, edges); // live graph → wire (detached deep copy)
```

`fromFlowDefinition` normalizes omitted fields to designer defaults, so a definition saved by an older editor version or authored externally still hydrates to fully-explicit configuration.

## Validation: `validateFlowDefinition`

```ts
import { validateFlowDefinition } from "@vef-framework-react/approval-flow-editor";

const errors = validateFlowDefinition(definition, formFields);
// errors: FlowValidationError[] — empty means the flow is deploy-ready
```

Mirrors the backend's deploy-time `ValidateFlowDefinition` rule-for-rule — including, since v2.10.0, the field-permission rules (permission values must be in-vocabulary, keys must name real form fields, CC nodes are restricted to `visible`/`hidden`, and a `required` permission must not pair with an auto-pass timeout) — but, unlike the backend, which returns the first error, collects every violation so a host can surface them all at once. A definition that passes this validator passes backend deploy validation.

The second parameter is the [tri-state `formFields` inventory](#formfields): pass the same list handed to `plugins.formFields` so `fieldPermissions` keys are cross-checked against the real field inventory. `[]` means "the form has zero fields" (every permission key errors); omitting the argument means "no inventory available" and skips only the key-existence check.

Use it to gate a save/deploy action outside the editor's own publish button — for example, disabling a wizard's "next step" control:

```tsx
const errors = useMemo(
  () => validateFlowDefinition(flowDefinition, formFields),
  [flowDefinition, formFields]
);

<Button disabled={errors.length > 0} onClick={handleNext}>Next</Button>;
```

Each `FlowValidationError` carries a stable `code` (`FlowValidationCode`), a human-readable `message`, and — depending on the rule — `nodeId`, `edgeId`, and/or `branchId` for surfacing the error next to the offending element. See [API Reference](./reference.md) for the full code list.

## Putting it together

A host building an end-to-end designer typically combines all three pieces — pickers, `formFields` sourced from `approval-form-bridge`, and `validateFlowDefinition` as a step gate:

```tsx
import type { EditorPlugins, FlowDefinition } from "@vef-framework-react/approval-flow-editor";

import { ApprovalFlowEditor, validateFlowDefinition } from "@vef-framework-react/approval-flow-editor";
import { projectFormSchema } from "@vef-framework-react/approval-form-bridge";
import { useMemo, useState } from "react";

function FlowStep({ formSchema, pickers }: { formSchema: FormSchema; pickers: EditorPlugins["pickers"] }) {
  const [definition, setDefinition] = useState<FlowDefinition>({ nodes: [], edges: [] });
  const projection = useMemo(() => projectFormSchema(formSchema), [formSchema]);
  const plugins = useMemo<EditorPlugins>(
    () => ({ pickers, formFields: projection.formFields }),
    [pickers, projection]
  );
  const errors = useMemo(
    () => validateFlowDefinition(definition, projection.formFields),
    [definition, projection]
  );

  return (
    <>
      <ApprovalFlowEditor plugins={plugins} value={definition} onChange={setDefinition} />
      <Button disabled={errors.length > 0} onClick={() => saveFlow(definition)}>Save</Button>
    </>
  );
}
```
