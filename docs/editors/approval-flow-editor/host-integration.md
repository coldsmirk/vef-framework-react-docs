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
| `formFields` | `FormFieldDefinition[]` | The form's top-level field inventory — feeds the condition editor, the field-permission table, and `validateFlowDefinition`'s `fieldPermissions` cross-check. |
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

Mirrors the backend's deploy-time `ValidateFlowDefinition` rule-for-rule, but — unlike the backend, which returns the first error — collects every violation so a host can surface them all at once. `formFields` defaults to `[]`; pass the same list handed to `plugins.formFields` so `fieldPermissions` keys are cross-checked against the real field inventory (omitting it is only safe when the definition carries no field permissions).

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
