---
title: Linkage
description: Conditional show/hide/require, computed values, and side effects — the rule model, the plain-JavaScript expression engine, and how to swap it.
---

# Linkage

Linkage is how a block reacts to the form around it: hiding a field until a prior answer qualifies, requiring it conditionally, computing one field from others, or firing a side effect like an alert or an API call. One model covers both what is traditionally called "linkage" (a condition drives visible state) and "events" (a field or form moment drives a side effect) — an event is simply a rule whose trigger is an edge instead of a value condition.

## Rules, triggers, and actions

Any block — leaf field or container — declares its behavior as `linkage?: FieldLinkage`:

```ts
interface FieldLinkage {
  defaults?: { hidden?: boolean; disabled?: boolean; required?: boolean };
  rules?: FieldLinkageRule[];
}

interface FieldLinkageRule {
  id: string;
  trigger: LinkageTrigger;
  actions: FieldLinkageAction[];
}
```

`defaults` applies before any rule fires — the standard way to author "hidden until a condition shows it." Each rule pairs one **trigger** with an ordered list of **actions**:

- **`{ kind: "condition"; condition }`** is a *level* signal — continuously true or false as values change. It is the only trigger kind that drives durable state (`show` / `hide` / `require` / …); its false→true rising edge can also fire side effects.
- **`{ kind: "change" | "focus" | "blur" | "click" }`** are field DOM *edges* — they pulse once when the event happens and never derive state, only side effects.
- **`{ kind: "load" | "beforeSubmit" | "afterSubmit" }`** are form lifecycle *edges*, valid on [form-scope rules](#field-scope-vs-form-scope-rules) only.

`FIELD_TRIGGER_KINDS` / `FORM_TRIGGER_KINDS` list which kinds are legal at each scope; `FIELD_EVENT_TRIGGER_KINDS` (and the `isFieldEventTriggerKind` guard) isolate the four field-DOM edges from the three lifecycle edges.

## Conditions

```ts
type LinkageCondition =
  | { kind: "leaf"; sourceKey: string; operator: LinkageOperator; value?: unknown }
  | { kind: "group"; logic: "all" | "any"; children: LinkageCondition[] }
  | { kind: "expression"; source: string };
```

A **leaf** compares one source's value with an operator; **`LINKAGE_OPERATORS`** is the full set: `eq` / `ne` / `gt` / `lt` / `gte` / `lte` / `contains`, plus `empty` / `notEmpty` (no `value` needed — a value counts as empty when it is nullish, a blank string *after trimming*, `[]`, or an array of only-empty entries; `0` and `false` are not empty). Strings are trimmed since v2.10.0, matching the Go backend's `isEmptyFormValue`, so a whitespace-only value fails `required` client-side instead of bouncing off the server with no inline error. `sourceKey` is a sibling field's `key` by default; a `$`-rooted path (`$user.departmentId`, `$vars.quota`, `$form.someKey`) resolves against the [evaluation context](#host-context) instead. A **group** combines children with `all` (short-circuits on the first `false`) or `any` (short-circuits on the first `true`). An **expression** is an escape hatch for anything the visual builder can't express — plain JavaScript run through the [default evaluator](#expression-and-script-evaluation) or a host override.

```json
{
  "kind": "condition",
  "condition": {
    "kind": "group",
    "logic": "all",
    "children": [{ "kind": "leaf", "sourceKey": "age", "operator": "gte", "value": "18" }]
  }
}
```

## Actions

Every action carries a `type` that puts it in exactly one of two families — `isStateAction` / `isEffectAction` narrow a `FieldLinkageAction` to its family, and `LINKAGE_ACTION_TYPES` lists every known type.

**State actions** (`STATE_ACTION_TYPES`) derive a field's runtime state and are only meaningful under a `condition` trigger — while the condition holds the state applies, and it reverts the moment the condition stops holding:

| `type` | Effect |
| --- | --- |
| `show` / `hide` | visibility (containers too — a container's `hide`/`disable` propagates to every descendant) |
| `enable` / `disable` | interactivity |
| `require` / `optional` | overrides the field's static `validate.required` |
| `assign` | sets the field's value from a `LinkageActionValue` |
| `script` | escape hatch — see [below](#expression-and-script-evaluation) |

`require` / `optional` / `assign` are keyed-leaf-only (`KEYED_ONLY_ACTIONS`) — they touch a value, so `validateSchema` rejects them on a non-keyed or container block.

**Effect actions** (`EFFECT_ACTION_TYPES`) are edge-fired side effects — they run once when the trigger fires and never derive durable state:

| `type` | Effect |
| --- | --- |
| `set_field` | imperative one-shot write to another field (`targetKey`) — distinct from the continuous self-`assign`; dropped when the target is clamped non-writable (see [Field permission clamp](#field-permission-clamp)) |
| `set_variable` | writes a form-global `$vars` entry |
| `refresh_data_source` | bumps a data source's refresh nonce, forcing every field referencing it to re-resolve |
| `alert` | shows a message at a given `level` (`ALERT_LEVELS`: `info` / `success` / `warning` / `error`) |
| `api_call` | fires a `RemoteDataSourceRequest`, delegated to the host |
| `navigate` | delegated to the host |
| `submit` / `reset` | drives the form's own submit / reset |

`set_field` / `set_variable` / `refresh_data_source` / `submit` / `reset` are handled natively by the runtime; `alert` / `api_call` / `navigate` are delegated to the host's `dispatchEffect` (see [Pluggable evaluators](#pluggable-evaluators)) and no-op by default. Every effect action accepts an optional `retrigger?: ConditionRetrigger` (`"edge"` default — fires once on the false→true transition; `"always"` — re-fires whenever a field the condition reads changes while it keeps holding); it is ignored under an edge trigger, which already pulses per-event.

A `LinkageActionValue` (used by `assign`, `set_field`, `set_variable`, `alert`'s `message`, `navigate`'s `to`) is either `{ kind: "literal"; value }` or `{ kind: "expression"; source }`.

## Field-scope vs. form-scope rules

Most rules live on a block's own `linkage` and can use any `FIELD_TRIGGER_KINDS` trigger with state or effect actions. `FormSchema.linkage` is the **form-scope** rule set (the unified "events" panel): the form has no self field whose state could be derived, so it accepts only `FORM_TRIGGER_KINDS` (`condition`, `load`, `beforeSubmit`, `afterSubmit`) and **effect actions only** — `validateLinkageSchema` rejects a state action or a `defaults` block at form scope. `beforeSubmit` / `afterSubmit` bracket the actual submission (including any async host effects); `load` fires once, fire-and-forget, when the form mounts.

## Expression and script evaluation

Conditions of `kind: "expression"`, `assign`/action values of `kind: "expression"`, and `script` actions are all plain JavaScript, compiled through `new Function` and cached by source string. An expression is wrapped as a single returned expression (`"field.age >= 18"`); a script is a statement block that may `return` a partial state patch (`{ hidden?, disabled?, required?, value? }` — any omitted key leaves that slot untouched).

The evaluation scope: `field` and `$form` both bind the current form values (`field` is the legacy alias — inside a subform row, this is the row's own record, not the root form); `$vars` is the form's variables; `$user` / `$node` are host-supplied via [`EvaluationContext`](#host-context); `$now` is a fresh `Date` per evaluation.

```js
// assign — expression action value
"field.qty * field.unitPrice"

// script action
"if (field.age < 18) { return { required: true }; }"
```

**Security model:** these sources run in the host page via `new Function`, so the framework assumes schemas come from a trusted source — sandboxing beyond that is the host's responsibility (see [Pluggable evaluators](#pluggable-evaluators) to swap in one). The default evaluators require CSP `'unsafe-eval'`; a blocked or malformed source degrades to `false` for a condition and `undefined` for an assignment or script rather than throwing.

`defaultEvaluateExpression`, `defaultEvaluateAssignExpression`, and `defaultEvaluateScriptAction` are the three default evaluator functions, exported individually so a host override can call through to the default for sources it doesn't want to special-case.

## Pluggable evaluators

`LinkageEvaluators` is the seam a host uses to replace the `new Function` engine — a sandboxed runtime, a different expression DSL, or a real effect dispatcher for `alert` / `api_call` / `navigate`:

```ts
interface LinkageEvaluators {
  evaluateExpression?: (source, values, context?) => boolean;
  evaluateScriptAction?: (source, values, context?) => LinkageScriptResult | void;
  evaluateAssignExpression?: (source, values, context?) => unknown;
  dispatchEffect?: (action: EffectAction, context: EffectDispatchContext) => void | Promise<void>;
}
```

Supply overrides via the `evaluators` prop on `FormEditor` / `FormRenderer` (see [Embedding](./embedding.md)) — a slot you omit falls back to the matching default. `resolveLinkageEvaluators(overrides?)` performs that fill-in and is what the engine calls internally; use it directly if you're building tooling that needs a fully-populated evaluator set outside the editor/renderer. `dispatchEffect` receives an `EffectDispatchContext` (`{ values, resolveValue }`) scoped to the firing rule's value scope — a subform row's effect sees that row's record, not the root form — so a host `alert` implementation can read the values that triggered it.

## Host context

`EvaluationContext` (`{ variables?, user?, node? }`) is how host runtime data reaches every expression, script, and `$`-rooted condition. `FormRenderer` / `FormEditor`'s `evaluationContext` prop supplies `user` / `node`; `variables` seeds from `FormSchema.variables` automatically and only needs a prop override to inject or override a value at runtime. A `$user`-rooted leaf condition:

```json
{
  "kind": "leaf",
  "sourceKey": "$user.departmentName",
  "operator": "eq",
  "value": "Finance"
}
```

`contextSources: LinkageContextSource[]` (`{ key, label }`, e.g. `{ key: "$user.departmentId", label: "Applicant department" }`) is purely design-time metadata — it populates the visual condition builder's source picker with these host paths alongside the form's own fields. The runtime resolves a `$`-rooted path against the live `EvaluationContext` whether or not it was declared here, so a hand-written condition referencing an undeclared path still works.

## Field permission clamp

`FieldPermission` (`"hidden" | "visible" | "editable" | "required"`) is a **server-resolved** interactivity clamp, separate from linkage — passed to `FormRenderer` as `fieldPermissions: Record<string, FieldPermission>`, keyed by root-scope field `key` (see [Embedding → FormRenderer](./embedding.md#formrenderer)). It landed in v2.10.0 as the client half of the approval engine's per-node field permissions (it mirrors the backend's `approval.Permission` and approval-flow-editor's `FieldPermission` literal-for-literal), but is host-agnostic — any server that resolves per-viewer permissions can feed it. It is the *outer bound*: linkage may narrow within it but never widen past it.

| Value | Effect |
| --- | --- |
| `"hidden"` | never mounted; value never submitted |
| `"visible"` | mounted read-only (via the disabled channel); value excluded from payload and validation, never required |
| `"editable"` | no clamp — linkage governs alone |
| `"required"` | editable and always required, overruling a linkage `optional` outcome; fails an empty value at submit even without a static `validate.required` |

An absent prop, or an absent key within it, means no clamp for that field — the renderer stays fully permissive unless the server says otherwise; a host wanting default-deny materializes the full map server-side. A keyed `subform` is clamped whole — its template fields are never addressed individually, since permissions address root-scope keys only (a subform-level `"required"` means "at least one row").

**Every programmatic write is gated too** (breaking, v2.10.0). The state lane's continuous `assign` and the effect lane's one-shot `set_field` land in one shared write gate, so the clamp holds on every write path, not just user edits:

- A write whose target's top-level key is clamped non-writable (`"visible"` / `"hidden"`) is **dropped silently**, mirroring the render path's never-crash posture. A non-writable field's pending `assign` outcome is likewise suppressed, so no phantom edit reaches a field the server would reject.
- **The value is coerced to the target field's shape first.** A `number` field receives a `number` — a blank or non-numeric string becomes `undefined`, leaving the control empty so the required check reports honestly instead of parking a value the backend will reject at submit; a `switch` receives a boolean, with `"true"` / `"1"` true and everything else (`"false"` included) false. Every other field type takes what it is given, since an expression resolving to a number is a legitimate thing to put in a text field. The rule is *type*-driven, not `kind`-driven: it fires whenever the resolved value is a string, so an expression yielding `"3.5"` is coerced exactly like a literal, and a `script` action's returned `value` goes through it too. A `set_field` naming a key the firing scope's schema does not declare has no target field to coerce against and is written verbatim. The motivation is the designer's literal editor — a plain text input, so every literal arrives as a string: a string in a number field silently disables the numeric constraint checks (they gate on `typeof value === "number"`), and `"false"` in a switch is truthy, so the control reads *on*.
- A write of the value the target already holds (deep-equal, compared **after** coercion) is dropped — an identical write would otherwise read as a change and re-fire an `always`-retriggered rule forever.
- A programmatic write never runs the target's change listeners or marks it touched, so a `load`-effect write never surfaces a premature validation error; the written value is still validated like an edit.
- The gate resolves a path-shaped target (`"lines[0].amount"`) to its top-level binding (`lines`) before checking the clamp; inside a subform row's own scope no clamp applies (top-level permissions never address template fields).

Two helper exports back the gate and are available to hosts building their own permission-aware chrome: `getFieldPermission(permissions, key)` (own-property-guarded lookup) and `isWritableFieldPermission(permission)` (`true` for `undefined` / `"editable"` / `"required"`). The submit payload carries only writable keys — see `FormRendererApi.getSubmitValues` in the [Reference](./reference.md#formrendererapi) for previewing exactly what would submit.

## Validation

`validateLinkageSchema(layer, formLinkage?): LinkageValidationResult` is the boundary guard for linkage on externally-supplied schema (paired with [`validateSchema`](./schema.md#validating-an-imported-schema), which calls it once the tree structure itself is clean). It flags malformed nodes, resolves `sourceKey` / `targetKey` against the keyed nodes in the rule's own value scope, rejects a state action on an edge trigger or a keyed-only action on a non-keyed block, and detects dependency cycles (a condition whose actions write back into a field the condition itself reads).

Every issue is a `ValidationIssue` (`{ path, code: ValidationIssueCode, severity: "error" | "warning", message, ruleId? }`). Program against `code` and `path` — they are stable and machine-readable; `message` is pre-rendered Chinese product copy (the package's issue messages are not currently localizable) produced exclusively through `formatIssueMessage(code, params?)`. *Error*-severity issues mean the schema is structurally broken; *warning*-severity issues (a dangling reference, an empty condition group) are legitimate mid-authoring state and do not fail validation.

## Worked example

Two sibling blocks: a number field that alerts differently above and below a threshold, and a field whose visibility and required-ness are gated on that same value:

```json
[
  {
    "type": "number",
    "key": "age",
    "linkage": {
      "rules": [
        {
          "id": "Rule_age_ok",
          "trigger": { "kind": "condition", "condition": { "kind": "group", "logic": "all", "children": [
            { "kind": "leaf", "sourceKey": "age", "operator": "gte", "value": "18" }
          ] } },
          "actions": [{ "id": "Action_ok", "type": "alert", "level": "info", "message": { "kind": "literal", "value": "Age requirement met" } }]
        },
        {
          "id": "Rule_age_low",
          "trigger": { "kind": "condition", "condition": { "kind": "group", "logic": "all", "children": [
            { "kind": "leaf", "sourceKey": "age", "operator": "lt", "value": "18" }
          ] } },
          "actions": [{ "id": "Action_low", "type": "alert", "level": "warning", "message": { "kind": "expression", "source": "'Age too low: ' + field.age" } }]
        }
      ]
    }
  },
  {
    "type": "textfield",
    "key": "bio",
    "linkage": {
      "defaults": { "hidden": true },
      "rules": [{
        "id": "Rule_bio_show",
        "trigger": { "kind": "condition", "condition": { "kind": "group", "logic": "all", "children": [
          { "kind": "leaf", "sourceKey": "age", "operator": "gte", "value": "18" }
        ] } },
        "actions": [
          { "id": "Action_show", "type": "show" },
          { "id": "Action_require", "type": "require" }
        ]
      }]
    }
  }
]
```
