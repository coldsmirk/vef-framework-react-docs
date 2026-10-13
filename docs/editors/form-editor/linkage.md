---
title: Linkage
description: Conditional show/hide/require, computed values, and side effects — the rule model, the plain-JavaScript expression engine, system variables, and how to swap the engine.
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

`defaults` applies before any rule fires — the standard way to author "hidden until a condition shows it." Each rule pairs one **trigger** with an ordered list of **actions**. Rules apply in declaration order, so when two matching rules set the same state slot, the later one wins.

- **`{ kind: "condition"; condition }`** is a *level* signal — continuously true or false as values change. It is the only trigger kind that drives durable state (`show` / `hide` / `require` / …); its false→true rising edge can also fire side effects.
- **`{ kind: "change" | "focus" | "blur" | "click" }`** are field DOM *edges* — they pulse once when the event happens and never derive state, only side effects. `change` rides a keyed leaf field's own `onChange`, so it is legal only there (`trigger_requires_keyed_leaf`); the designer does not offer it on a container or a presentation block.
- **`{ kind: "load" | "beforeSubmit" | "afterSubmit" }`** are form lifecycle *edges*, valid on [form-scope rules](#field-scope-vs-form-scope-rules) only.

`FIELD_TRIGGER_KINDS` (`condition`, `change`, `focus`, `blur`, `click`) and `FORM_TRIGGER_KINDS` (`condition`, `load`, `beforeSubmit`, `afterSubmit`) list which kinds are legal at each scope; `FIELD_EVENT_TRIGGER_KINDS` (and the `isFieldEventTriggerKind` guard) isolate the four field-DOM edges from the three lifecycle edges.

## Conditions

```ts
type LinkageCondition =
  | { kind: "leaf"; id?: string; sourceKey: string; operator: LinkageOperator; value?: unknown }
  | { kind: "group"; id?: string; logic: "all" | "any"; children: LinkageCondition[] }
  | { kind: "expression"; id?: string; source: string };
```

A **leaf** compares one source's value with an operator. A **group** combines children with `all` (short-circuits on the first `false`) or `any` (short-circuits on the first `true`). An **expression** is the escape hatch for anything the visual builder can't express — plain JavaScript run through the [default evaluator](#expression-and-script-evaluation) or a host override. The optional `id` is a client-stable identity the designer mints so its condition rows key by identity rather than array index; the runtime and the validator ignore it.

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

An empty group is legal but almost always a mistake: `all` over no children holds, so its rule **always** applies, while `any` over no children never does. The validator warns about it (`condition_group_empty`), and the designer never authors one — removing the last condition of a nested group removes the group, and the root group reseeds a fresh condition row instead.

### Leaf sources

A leaf's `sourceKey` names what it reads:

| `sourceKey` | Reads | Example |
| --- | --- | --- |
| a plain key | a keyed field of the rule's own value scope — inside a subform row, that row's siblings | `amount` |
| `$form.<key>[.<path>]` | the same field, spelled explicitly; a trailing path walks into an object value | `$form.address.city` |
| `$vars.<name>[.<path>]` | a [form variable](./schema.md#options-and-data-sources) | `$vars.quota` |
| `$user.<path>` | whoever is viewing the form now | `$user.roleCode` |
| `$node.<path>` | the workflow node the form is shown at | `$node.code` |
| `$applicant.<path>` | the subject the form is filled on behalf of — in an approval, the initiator | `$applicant.departmentId` |
| `$globals.<path>` | read-only host attributes | `$globals.staffTitle` |

The `$`-rooted context paths resolve against the [evaluation context](#host-context-and-system-variables). Resolution follows three rules:

- **Every segment is read as an own property.** A prototype member (`$user.constructor`, `toString`) never resolves, so it can never make `notEmpty` hold forever.
- **A broken path resolves to `undefined`** — a missing member, a member of a primitive, or a context slot the host did not supply. No positive operator matches `undefined`, exactly as with an absent form key.
- **An unknown root never resolves.** A typo such as `$applcant.departmentId` would otherwise silently never match; the validator reports it as `source_scope_unknown` (a warning) instead.

`$form.amount` and `amount` are the same source everywhere it matters: dependency tracking, the cycle detector, the dangling-reference check (`source_key_unresolved`), and the editor's key renames — renaming `amount` to `total` rewrites `$form.amount.value` to `$form.total.value`, keeping your spelling. A context path names no form key, so none of those touch it.

### Operators

`LINKAGE_OPERATORS` is the full set, in the designer's display order. The visual builder's value editor is a text input, so the right-hand value usually arrives as a string — the operators are written for that:

| Operator | Matches when |
| --- | --- |
| `eq` / `ne` | `eq` holds when the two values are `Object.is`-identical, or both are primitives with equal string forms (`"5"` eq `5`). A nullish value equals only the identical nullish value, and an array or object source never equals anything — use `contains` for membership. `ne` is the exact negation of `eq`. |
| `gt` / `lt` / `gte` / `lte` | Both sides are non-empty and convert to finite numbers, which are then compared. An empty side never matches: an empty field does not satisfy `gte 0`, and an operator with no value does not behave as `gt 0`. |
| `contains` | A string source contains the value's string form, or an array source has an element that `eq`s the value. An empty value never matches (otherwise every string would "contain" `""`). |
| `empty` / `notEmpty` | The value is empty: nullish, a string that is blank after trimming, or an array whose every entry is itself empty (so a date range cleared to `["", ""]` is empty). `0` and `false` are not empty. These two take no `value`. |

The emptiness rule is the same one the runtime uses for `required`, and it pairs with the Go approval backend's `isEmptyFormValue` — both trim strings (since v2.10.0), so a whitespace-only value fails `required` in the browser instead of bouncing off the server with no inline error. One residual asymmetry is deliberate: the client treats an array of only-empty entries as empty where Go checks `len == 0`, so the client is the stricter side.

## Actions

Every action carries a `type` that puts it in exactly one of two families — `isStateAction` / `isEffectAction` narrow a `FieldLinkageAction` to its family, and `LINKAGE_ACTION_TYPES` lists every known type. Like conditions, an action may carry an optional editor-minted `id`, which the runtime ignores.

**State actions** (`STATE_ACTION_TYPES`) derive a field's runtime state and are only meaningful under a `condition` trigger — while the condition holds the state applies, and it reverts the moment the condition stops holding:

| `type` | Effect |
| --- | --- |
| `show` / `hide` | visibility (containers too — a container's `hide` / `disable` propagates to every descendant) |
| `enable` / `disable` | interactivity |
| `require` / `optional` | required-ness. The field's static `validate.required` seeds the fold rather than being OR-ed onto its result, so `optional` really does relax a statically required field. |
| `assign` | sets the field's value from a `LinkageActionValue` |
| `script` | escape hatch — see [below](#expression-and-script-evaluation) |

`require` / `optional` / `assign` are keyed-leaf-only (`KEYED_ONLY_ACTIONS`) — they touch a value, so the validator rejects them on a container (a subform included) or a non-keyed block (`action_requires_keyed_leaf`). Hiding a field does not clear its value; it only drops it from the [submit payload](./embedding.md#submission).

**Effect actions** (`EFFECT_ACTION_TYPES`) are edge-fired side effects — they run once when the trigger fires and never derive durable state:

| `type` | Payload | Effect |
| --- | --- | --- |
| `set_field` | `targetKey`, `value` | imperative one-shot write to another field of the same value scope — distinct from the continuous self-`assign`; dropped when the target is clamped non-writable (see [Field permission clamp](#field-permission-clamp)). A subform's key is a legal target: writing an array replaces its rows. |
| `set_variable` | `variable`, `value` | writes a `$vars` entry. The name does not have to be declared in `FormSchema.variables` — the `$vars` store accepts any name. |
| `refresh_data_source` | `dataSourceId` | bumps a form-global data source's refresh nonce, forcing every field that `ref`s it to re-resolve. An inline `remote` source has no id and cannot be refreshed. |
| `alert` | `level?`, `message` | shows `message` at `level` (`ALERT_LEVELS`: `info` / `success` / `warning` / `error`) |
| `api_call` | `request` | fires a `RemoteDataSourceRequest` |
| `navigate` | `to` | navigates to a location |
| `submit` / `reset` | — | drives the form's own submit / reset |

`set_field` / `set_variable` / `refresh_data_source` / `submit` / `reset` are handled natively by the runtime; `alert` / `api_call` / `navigate` are delegated to the host's `dispatchEffect` (see [Pluggable evaluators](#pluggable-evaluators)) and are no-ops by default. The designer's own preview is the exception: unless the host supplies a `dispatchEffect`, it shows an `alert` as a message at its level (`info` when unset), and `navigate` / `api_call` — which cannot really run while designing — as an informational toast naming the target, so a designer can watch the rule fire.

Every effect action accepts an optional `retrigger?: ConditionRetrigger` that tunes how it re-fires under a `condition` trigger:

- **`"edge"`** (default) fires once on the false→true transition, then stays quiet while the condition keeps holding — the standard side-effect semantic, which keeps `api_call` / `navigate` / `submit` from firing on every keystroke.
- **`"always"`** also re-fires whenever a field the condition reads changes while it keeps holding ("re-warn on each edit while the value is out of range"). An unrelated field changing does not re-fire it. An expression condition's dependencies are opaque, so it re-fires on any value change while it holds.

A condition that is already true when the form mounts does **not** fire its effects — only a later rising edge does; use a form-scope `load` rule for mount-time effects. `retrigger` is ignored under an edge trigger, which already pulses per event — the validator flags the dead configuration (`retrigger_ignored`).

### Action values

`assign`, `set_field`, and `set_variable` (`value`), `alert` (`message`), and `navigate` (`to`) take a `LinkageActionValue` — an alias of `DynamicValue`:

```ts
type DynamicValue =
  | { kind: "literal"; value: unknown }
  | { kind: "expression"; source: string };
```

A literal is used verbatim; an expression is evaluated through `evaluateAssignExpression` against the firing rule's value scope. The same union types a [remote request parameter](./embedding.md#bound-parameters), so the designer offers one "fixed value or expression" control in both places. A value written into a field is coerced to the target field's shape first — see [Field permission clamp](#field-permission-clamp) for the full write path.

`api_call` carries a whole `RemoteDataSourceRequest` (`resource` / `action` / `version?` / `params?`). The designer edits it with the same endpoint and parameter editor a remote option source uses (minus the API picker and the field mapping, which only make sense for options), and the host's `dispatchEffect` receives it with `context.resolveRequest` to evaluate its bound parameters — see [Pluggable evaluators](#pluggable-evaluators).

## Field-scope vs. form-scope rules

Most rules live on a block's own `linkage` and can use any `FIELD_TRIGGER_KINDS` trigger with state or effect actions. `FormSchema.linkage` is the **form-scope** rule set (the 联动 tab of the form-config drawer): the form has no self field whose state could be derived, so it accepts only `FORM_TRIGGER_KINDS` (`condition`, `load`, `beforeSubmit`, `afterSubmit`) and **effect actions only** — the validator rejects a state action (`state_action_on_form_scope`) or a `defaults` block (`defaults_on_form_scope`) at form scope. A form-scope condition resolves its leaf sources against the root value scope.

The three lifecycle edges bracket the form's life:

- **`load`** fires once per form instance, after mount, fire-and-forget.
- **`beforeSubmit`** runs after validation passes and before the host's `onSubmit`, and is awaited — including any async host effect — before the payload is built. A `set_field` here therefore lands in the submitted payload.
- **`afterSubmit`** runs only after `onSubmit` resolves.

See [Embedding → Submission](./embedding.md#submission) for the whole pipeline.

## Expression and script evaluation

Conditions of `kind: "expression"`, action values of `kind: "expression"`, and `script` actions are all plain JavaScript, compiled through `new Function` in strict mode and cached by source string (an LRU of 500 compiled sources per kind, sized for forms with hundreds of rules).

- An **expression** is wrapped as a single returned expression (`"field.age >= 18"`). A condition holds only when it evaluates to the boolean `true` — a truthy `1` or `"yes"` does not count, so write the comparison out.
- A **script** is a statement block that may `return` a partial state patch `{ hidden?, disabled?, required?, value? }` — any omitted key leaves that slot untouched, `value` acts like `assign`, and returning nothing is a valid no-op.

The scope every source sees:

| Name | Binds |
| --- | --- |
| `field` / `$form` | the current value scope's values — the root form, or inside a subform row that row's own record (`field` is the legacy alias) |
| `$vars` | the form variables (`FormSchema.variables` defaults, host overrides, `set_variable` writes) |
| `$user` | `evaluationContext.user` — the viewer |
| `$node` | `evaluationContext.node` — the workflow node |
| `$applicant` | `evaluationContext.applicant` — the subject the form is filled for |
| `$globals` | `evaluationContext.globals` — read-only host attributes |
| `$now` | a fresh `Date` per evaluation |

Context slots the host does not supply bind an empty frozen object, so `$applicant.departmentId` reads `undefined` rather than throwing.

```js
// assign — expression action value
"field.qty * field.unitPrice"

// condition — must evaluate to the boolean true
"$applicant.departmentId === 'dept-finance' && $form.amount > 5000"

// script action
"if (field.age < 18) { return { required: true }; }"
```

**Security model:** these sources run in the host page via `new Function`, so the framework assumes schemas come from a trusted source — sandboxing beyond that is the host's responsibility (see [Pluggable evaluators](#pluggable-evaluators) to swap one in). The default evaluators require CSP `'unsafe-eval'`. A source that fails to compile (a syntax error, or `new Function` blocked by CSP) is cached as inert, so it fails once rather than on every keystroke; a failing or throwing source degrades to `false` for a condition and `undefined` for an assignment or script rather than throwing.

`defaultEvaluateExpression`, `defaultEvaluateAssignExpression`, and `defaultEvaluateScriptAction` are the three default evaluator functions, exported individually so a host override can call through to the default for sources it doesn't want to special-case.

## Pluggable evaluators

`LinkageEvaluators` is the seam a host uses to replace the `new Function` engine — a sandboxed runtime, a different expression DSL, or a real effect dispatcher for `alert` / `api_call` / `navigate`:

```ts
interface LinkageEvaluators {
  evaluateExpression?: (source: string, values: Record<string, unknown>, context?: EvaluationContext) => boolean;
  evaluateScriptAction?: (source: string, values: Record<string, unknown>, context?: EvaluationContext) => LinkageScriptResult | void;
  evaluateAssignExpression?: (source: string, values: Record<string, unknown>, context?: EvaluationContext) => unknown;
  dispatchEffect?: (action: EffectAction, context: EffectDispatchContext) => void | Promise<void>;
}

interface EffectDispatchContext {
  values: Record<string, unknown>;
  resolveValue: (value: LinkageActionValue) => unknown;
  resolveRequest: (request: RemoteDataSourceRequest) => ResolvedDataSourceRequest;
}
```

Supply overrides via the `evaluators` prop on `FormEditor` / `FormRenderer` (see [Embedding](./embedding.md)) — a slot you omit falls back to the matching default (`dispatchEffect` to a no-op). `resolveLinkageEvaluators(overrides?)` performs that fill-in and is what the engine calls internally; use it directly if you build tooling that needs a fully populated evaluator set outside the editor and renderer.

`dispatchEffect` receives only the host-delegated effects (`alert` / `api_call` / `navigate`), with an `EffectDispatchContext` scoped to the firing rule's value scope — a subform row's effect sees that row's record, not the root form:

- **`values`** — the scope's values at the moment the effect fired.
- **`resolveValue(value)`** — evaluates an `alert` message or a `navigate` target the same way the runtime evaluates any action value.
- **`resolveRequest(request)`** — evaluates an `api_call` request's bound parameters exactly as the option resolver's are (an `undefined` result omits the parameter), so the handler receives plain data.

A promise returned from `dispatchEffect` is awaited under `beforeSubmit`; a rejected `load` effect is contained rather than surfacing as an unhandled rejection.

```ts
import type { LinkageAlertLevel, LinkageEvaluators } from "@vef-framework-react/form-editor";

import { showErrorMessage, showInfoMessage, showSuccessMessage, showWarningMessage } from "@vef-framework-react/components";

const SHOW_BY_LEVEL: Record<LinkageAlertLevel, (text: string) => void> = {
  info: showInfoMessage,
  success: showSuccessMessage,
  warning: showWarningMessage,
  error: showErrorMessage
};

export const evaluators: LinkageEvaluators = {
  dispatchEffect: async (action, context) => {
    switch (action.type) {
      case "alert": {
        SHOW_BY_LEVEL[action.level ?? "info"](String(context.resolveValue(action.message) ?? ""));
        return;
      }

      case "api_call": {
        // Bound parameters arrive evaluated: plain data, ready for the wire.
        await callRpc(context.resolveRequest(action.request)); // your own RPC helper
        return;
      }

      case "navigate": {
        await router.navigate({ to: String(context.resolveValue(action.to)) }); // your app's router
      }
    }
  }
};
```

## Host context and system variables

`EvaluationContext` is how host runtime data reaches every expression, script, `$`-rooted leaf condition, and bound data-source parameter:

```ts
interface EvaluationContext {
  variables?: Record<string, unknown>; // $vars
  user?: Record<string, unknown>;      // $user
  node?: Record<string, unknown>;      // $node
  applicant?: Record<string, unknown>; // $applicant
  globals?: Record<string, unknown>;   // $globals
}
```

Pass it as `FormRenderer`'s (and `FormEditor`'s) `evaluationContext`. `variables` seeds from `FormSchema.variables` automatically, so it only needs a prop entry to inject or override a value; the other slots carry host data. Choosing the slot matters:

- **`$user` vs. `$applicant`.** `$user` is whoever is viewing the form *now*. `$applicant` is the subject the form is filled *on behalf of* — in a workflow, the initiator — and is the same for everyone who opens one record. A rule like "show the budget field when the initiator is in Finance" must read `$applicant`: read from `$user`, it evaluates against each approver in turn and changes meaning as the record moves through the flow. Never put the initiator in `$user`.
- **`$globals` vs. `$vars`.** `$globals` are read-only attributes the host resolves (tenant settings, the initiator's title, business limits); the schema cannot declare or write them. `$vars` are the form's own variables, declared in `FormSchema.variables` and writable with `set_variable`.

A leaf condition on the initiator's department:

```json
{
  "kind": "leaf",
  "sourceKey": "$applicant.departmentName",
  "operator": "eq",
  "value": "Finance"
}
```

### System variables in the designer

The runtime resolves a `$`-rooted path against whatever context it is given, but a designer cannot pick what the editor does not know exists. `contextSources: LinkageContextSource[]` on `FormEditor` declares the context paths a host supplies — the form's **system variables**:

```ts
interface LinkageContextSource {
  key: string;   // full scope path, e.g. "$applicant.departmentId"
  label: string; // display name, e.g. "Initiator department ID"
}
```

Declared sources appear in two places:

- **The 变量 tab** of the form-config drawer gains a 系统变量 section above the form's own variables: each row shows the label, the copyable path, and a **preview value** input. Without declared sources the tab is the plain form-variable list.
- **The visual condition builder** offers them as a 系统变量 group beside the form's fields, so a leaf condition on the initiator is picked, not typed.

A preview value exists so a rule about the initiator can be tried before any real initiator exists. It is typed as text and read the way the designer means it — `500` becomes a number, `true` a boolean, `{"a":1}` an object, and anything that is not JSON (`dept-01`) stays text. Preview values are laid over the host's `evaluationContext` in the designer's preview (and its JSON split view) only; they are never written into the schema, they are not part of the undo history, and only values for currently declared sources apply, so a source the host stops declaring cannot keep steering the preview.

Declaring a source affects only the designer. The runtime resolves the path against the live `EvaluationContext` whether or not it was declared, so a hand-written condition on an undeclared path still works — and a declared path the host never supplies at runtime simply reads `undefined`.

The approval package wires all of this end to end: its designer declares the four applicant attributes plus the host's declared form globals, and every approval form renders with the instance's applicant as `$applicant` — see [Approval: form system variables](../../engines/approval/overview.md#form-system-variables).

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

`validateLinkageSchema(layer, formLinkage?): LinkageValidationResult` is the boundary guard for linkage on externally supplied schema (paired with [`validateSchema`](./schema.md#validating-an-imported-schema), which calls it per presentation once that presentation's tree is structurally clean, passing the form-scope linkage along with the `pc` tree). It:

- flags malformed rules, triggers, conditions, actions, and values;
- resolves each leaf `sourceKey` and each `set_field` `targetKey` against the keyed nodes of the rule's own value scope — a dangling one is a warning (`source_key_unresolved` / `target_key_unresolved`), because deleting a field after a rule referenced it is legitimate mid-authoring state — and reports an unknown `$` root (`source_scope_unknown`);
- rejects a state action on an edge trigger (`state_action_on_edge_trigger`) or at form scope, a keyed-only action on a non-keyed block, and a `change` trigger on anything but a keyed leaf;
- warns when a block is hidden by default with no condition-triggered `show` rule of its own — it could never become visible (`default_hidden_unreachable`);
- detects dependency cycles. An edge runs from each field a condition reads to each field the rule writes — the block's own key for a value-writing state action (`assign`, or `script` through its `value`), and the target of a `set_field` whose `retrigger` is `"always"`. A rule that writes the very field its condition reads is a `self_reference` error; a longer loop is a `cycle_detected` error. Level-stable actions (`show` / `hide` / `require` / …) and edge-retriggered effects write nothing back, so they may reference any field, the block itself included.

Every issue is a `ValidationIssue`: `{ path, code: ValidationIssueCode, severity: "error" | "warning", message, ruleId? }`, where `ruleId` names the rule a rule-scoped issue belongs to. Program against `code` and `path` — they are stable and machine-readable; `message` is pre-rendered Chinese product copy (the package's issue messages are not localizable) produced exclusively through `formatIssueMessage(code, params?)`. *Error*-severity issues mean the schema is structurally broken; *warning*-severity issues are legitimate mid-authoring state and do not fail validation. Every code, its severity, and its meaning are tabled in the [Reference](./reference.md#validation-issue-codes).

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

The alerts on `age` read their own field: they are effect actions, which write nothing back, so referencing the block itself is fine. Both fire on a rising edge only — typing `20` after `19` does not alert twice.
