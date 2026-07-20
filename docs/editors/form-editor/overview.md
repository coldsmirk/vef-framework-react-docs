---
title: Form Editor
description: A visual, drag-and-drop form designer and schema-driven runtime renderer built for forms with hundreds of fields.
---

# Form Editor

`@vef-framework-react/form-editor` is a visual form designer plus a runtime renderer that share one engine. A designer drags fields onto a canvas, configures validation and linkage in a properties panel, and the result is a single JSON value — a `FormSchema` — that a host application stores, versions, and renders anywhere with `FormRenderer`.

There is no code generation step and no second "runtime" format: the same field renderers, the same layout engine, and the same linkage evaluator that power the editor's live preview also power `FormRenderer`. What the designer sees while building the form is what end users see when the form runs.

## When to use it

Reach for the form editor when a form's shape needs to be **authored by someone other than a developer** — an admin configuring an intake form, a business user building an approval request form — or when your application manages many structurally similar but not identical forms (workflow node forms, per-tenant custom fields, dynamic surveys). For a form whose fields are fixed at development time, the plain [`useForm`](../../components/form.md) wrapper is simpler and needs no schema layer.

The engine is explicitly tuned for **forms with hundreds of fields**: the schema mutators use structural sharing so a single-field edit rebuilds only the path to that field, the canvas rows and runtime field cells are memoized against that sharing, and linkage expression/script compilation is cached — so a keystroke in one field does not re-evaluate or re-render the other 300. The designer chrome is tuned for large forms too (v2.10.0): selecting a block — including after a drop, which now keeps the moved block selected — scrolls it into view on the canvas, dragging a container lifts a compact chip instead of the whole nested subtree (so the drop zones underneath stay visible), and a selection field's static options reorder by drag in the properties panel.

## The `FormEditor` / `FormRenderer` split

| | Design time | Runtime |
| --- | --- | --- |
| Component | [`FormEditor`](./embedding.md#formeditor) | [`FormRenderer`](./embedding.md#formrenderer) |
| Input | an optional `initialSchema` | a `FormSchema` produced by the editor |
| Output | a `FormSchema` (via `onSchemaChange` / `onPublish` / `FormEditorApi.getSchema`) | submitted form values, via `onSubmit` |
| Audience | the person building the form | the person filling it out |

Both read from the same [`FormFieldRegistry`](./embedding.md#field-registries) of field types and the same [linkage engine](./linkage.md), so a custom field type or a custom linkage evaluator registered for editing is automatically available at runtime too — there is nothing to keep in sync by hand.

## Two device presentations

A `FormSchema` carries **one shared data layer** (variables, data sources, form-scope linkage, and every field's data-binding `key`) and **two independent layouts**: `presentations.pc` and `presentations.mobile`. Each presentation is its own field tree, so a form can be laid out differently for desktop (antd) and mobile (antd-mobile) while both bind the same underlying values. `pc` is always present; `mobile` is optional — a form with no mobile design simply renders an empty state on that device. See [Schema](./schema.md#per-device-presentations) for the full shape and [`convertPresentation`](./schema.md#pc-to-mobile-conversion) for a best-effort PC-to-mobile starting point.

## Extensibility

Nothing about the field set, the expression language, or the option-loading strategy is hard-coded into the package:

- **Field types** are entries in a [`FormFieldRegistry`](./embedding.md#field-registries) — register your own alongside (or instead of) the ~20 built-ins via `defineFieldDefinition` / `defineContainerDefinition`.
- **Linkage expressions and scripts** default to plain JavaScript compiled through `new Function`, but a host can swap in a sandboxed engine or a different DSL entirely by supplying [`LinkageEvaluators`](./linkage.md#pluggable-evaluators).
- **Selection-field options** default to inline static lists; a `remote` or `ref`-to-remote source resolves through a host-supplied [`DataSourceResolver`](./embedding.md#loading-remote-options) built on your own `apiClient` — the package itself has zero networking dependency.

## Where it fits

Form Editor is one of three [Visual Editors](../overview.md) packages. It has no dependency on the other two and is useful standalone (any form a host wants end users to configure). When a form feeds an approval workflow, [`@vef-framework-react/approval-form-bridge`](../approval-form-bridge.md) projects its `FormSchema` into the backend's approval contract and into the field inventory [`@vef-framework-react/approval-flow-editor`](../approval-flow-editor/overview.md) needs for its condition builder and permission matrix.

## Next steps

- [Embedding](./embedding.md) — wire `FormEditor` and `FormRenderer` into a host application.
- [Schema](./schema.md) — the `FormSchema` shape, field and container types, layout and sizing.
- [Linkage](./linkage.md) — conditional show/hide/require, computed values, and side effects.
- [Reference](./reference.md) — dry export, prop, and type tables.
