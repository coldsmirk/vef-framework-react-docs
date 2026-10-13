---
title: Embedding the Form Editor
description: Wire FormEditor and FormRenderer into a host application — props, host diagnostics, system variables, remote options and an API catalog, submission, and custom field renderers.
---

# Embedding the Form Editor

This page covers host integration: mounting the designer (`FormEditor`), mounting the runtime (`FormRenderer`), feeding both the host's context, diagnostics, and option APIs, registering custom field types, and the extension points a host reaches for when building its own field renderers. For the JSON shape both components read and write, see [Schema](./schema.md); for the linkage/expression model, see [Linkage](./linkage.md).

## FormEditor

The fastest way to embed the designer is the pre-composed `FormEditor`:

```tsx
import type { FormEditorApi, FormSchema } from "@vef-framework-react/form-editor";

import { FormEditor } from "@vef-framework-react/form-editor";
import { useRef } from "react";

function FormDesignerPage() {
  const apiRef = useRef<FormEditorApi>(null);

  return (
    <div style={{ width: "100%", height: "100%", minHeight: 0 }}>
      <FormEditor
        apiRef={apiRef}
        initialSchema={initialSchema}
        onPublish={(schema: FormSchema) => saveSchema(schema)}
      />
    </div>
  );
}
```

`FormEditor` fills its container (`width: 100%; height: 100%`, with a 480px minimum height), so the host is responsible for giving it a sized box — a flex/grid cell with a definite height, not an auto-height page flow.

Notable `FormEditorProps` (the full table is in the [Reference](./reference.md#formeditor)):

- **`initialSchema`** and **`registries`** / **`registry`** are read once, on mount — updating them later has no effect. Use `FormEditorApi.setSchema` to replace the document after mount. Neither `initialSchema` nor `setSchema` validates; run [`validateSchema`](./schema.md#validating-an-imported-schema) first on a schema you did not produce.
- **`onSchemaChange`** fires with the new `FormSchema` whenever the document changes — every committed edit, undo / redo, an import, 清空, and `setSchema` — but not for the initial schema.
- **`onPublish`** (paired with `publishText` / `publishLoading`) renders the toolbar's 发布 button; without it the button is not rendered at all. Publishing first runs the editor's validation plus the host's [`validate`](#host-diagnostics): any error blocks with a "表单存在 N 个错误，已阻止发布" toast, and warnings are listed in a confirmation dialog the designer can publish through.
- **`apiRef`** exposes `FormEditorApi`: `getSchema` / `setSchema` (import semantics — the undo history and the selection reset), `undo` / `redo` / `canUndo` / `canRedo`, `selectNode`, `setDevice`, `setViewMode`.
- **`evaluators`**, **`dataSourceResolver`**, and **`evaluationContext`** forward into the editor's live preview and its JSON split view, so a custom expression engine, real remote options, and the host's context behave there exactly as at runtime — see [Linkage](./linkage.md) and [Loading remote options](#loading-remote-options). Without a host `dispatchEffect`, the preview shows `alert` / `navigate` / `api_call` effects as toasts.
- **`contextSources`** declares the host's **system variables** — the context paths (`$applicant.departmentId`, `$globals.region`, …) the 变量 tab lists with preview values and the condition builder offers as sources. See [Linkage → System variables in the designer](./linkage.md#system-variables-in-the-designer).
- **`dataSourceApis`** turns remote option sources into a pick from the host's API catalog — see [Offering an API catalog](#offering-an-api-catalog).
- **`validate`** adds the host's own checks to the editor's diagnostics and publish gate — see [Host diagnostics](#host-diagnostics).

The built-in toolbar, palette, properties panel, and drawers ship with Chinese UI text (labels like "发布" / "导入" / "导出"). `brand`, `publishText`, and `onPublish` are the toolbar's customization points; a host that needs different chrome copy throughout composes its own shell (below) around the same panels, or supplies its own toolbar entirely.

### Layout and keyboard

The editor measures **its own width**, not the viewport, since a host shell may already take horizontal space:

- At 1220px or wider it is **docked**: the 296px palette and the 400px properties panel sit beside the canvas, and the toolbar shows every action.
- Below that it switches to the **drawer** layout: the properties panel detaches into a 360px full-height overlay, the palette collapses to an icon rail, and the toolbar folds 导入 / 导出 / 清空 into a 更多 menu, drops the labels of its view toggles, and hides the field count.

Keyboard shortcuts listen on the editor's own root, so two mounted editors never act on each other's keystrokes and the host page keeps its own key handling. They are ignored while focus is in an input, a textarea, a select, or a content-editable element, and all of them are off in preview mode:

| Key | Action |
| --- | --- |
| `Delete` | remove the selected node (edit mode only), confirming first when rules referencing it would be pruned |
| `Cmd/Ctrl + D` | duplicate the selected node below itself (edit mode only; swallowed in JSON view so the browser's bookmark dialog never opens) |
| `Cmd/Ctrl + Z` | undo |
| `Cmd/Ctrl + Shift + Z`, `Cmd/Ctrl + Y` | redo |
| `Esc` | clear the selection |

`Backspace` is deliberately not bound to delete. The undo timeline is global across both devices — undo jumps the view to the device the change was made on — holds up to 100 steps, and never records view state (device, view mode, selection).

## Composing your own shell

`FormEditor` is `Object.assign`'d with its parts, so a host that needs a different arrangement — a custom toolbar, relocated panels — composes the same pieces directly instead of the pre-built layout:

```tsx
import { FormEditor } from "@vef-framework-react/form-editor";

function CustomDesignerShell() {
  return (
    <FormEditor.Provider initialSchema={initialSchema} apiRef={apiRef}>
      <FormEditor.Shell>
        <MyToolbar />

        <FormEditor.Workspace>
          <FormEditor.Palette />
          <FormEditor.Stage />
          <FormEditor.Properties />
        </FormEditor.Workspace>
      </FormEditor.Shell>
    </FormEditor.Provider>
  );
}
```

- **`FormEditor.Provider`** (also exported standalone as `FormEditorProvider`) is the context root: the editor store, the per-device field registries, the preview runtime (evaluators / data source resolver / evaluation context and the preview values of system variables), the system variables, the host validator, and the API catalog. It accepts everything `FormEditorProps` does except the toolbar-only props (`brand`, `onPublish`, `publishText`, `publishLoading`).
- **`FormEditor.Shell`** (`FormEditorShell`) sets up layout-adaptivity measurement, the device context, the shared drag-and-drop context, and the shell-scoped keyboard shortcuts. It takes only `children`.
- **`FormEditor.Workspace`** (`FormEditorWorkspace`) is the horizontal palette / stage / properties band, and the positioning anchor of the drawer-layout properties overlay.
- **`FormEditor.Stage`** (`FormEditorStage`) is the canvas column: the design surface, the form-config drawer, and the status bar (edit mode only). It takes no props — it reads everything from the store.
- **`FormEditor.Toolbar`** (also exported as `FormEditorToolbar`) is the default toolbar, usable standalone if you only want to swap its brand. It reads the host validator from the provider, so its publish gate stays complete inside a custom shell.
- **`FormEditor.Palette`** and **`FormEditor.Properties`** are the field palette and the properties panel; both read from context and take no props.

## Host diagnostics

The editor validates its own schema continuously — the structure, the keys, the option sources, the linkage. A host often has a contract of its own on top: an approval backend that rejects some field types, a storage layer that caps the field count. `validate` adds those checks to the editor's diagnostics instead of a banner the host would have to render (and that would eat the canvas's height):

```ts
type SchemaValidator = (schema: FormSchema) => readonly SchemaIssue[];

interface SchemaIssue {
  path: string;
  code: string;
  severity: "error" | "warning";
  message: string;
}
```

- It is called only for a schema free of structural **errors**, and receives that schema — so it may assume a well-formed tree. It returns the host's issues only; the structural ones are the editor's. Its `code` lives in the host's own namespace.
- Its issues join the editor's in the **status bar** at the bottom of the canvas. The chip there reads "N 项问题" when any issue is an error and "N 项提示" for warnings only, and stays hidden while the schema is clean. Clicking it opens the whole list — each row the message, then where it is in the designer's own words (the field's label, `移动端 · 备注` for a mobile-layout field, `数据源「部门」`, `变量「quota」`, `表单联动`; the raw path when there are none, and as the location's tooltip always) — and clicking a row takes the designer to it: it selects the node (switching device when needed; the canvas scrolls it into view) or opens the form-config tab it belongs to.
- They join the **publish gate** too: a host error blocks publishing exactly like a structural one, and a host warning is listed in the confirmation.
- Validation runs at transition priority on a deferred copy of the schema, so typing never waits for it. Pass a **stable function** — module scope or `useCallback`; a new identity re-runs validation.

A `path` the status bar can locate is one of:

| Path form | Takes the designer to |
| --- | --- |
| a field-key chain — `amount`, `lines.price` (subform `lines`, column `price`) | the keyed node at that scope, on the device on screen first |
| `presentations.<pc\|mobile>.children[0].tabs[1].children[2]…` | the deepest node the path reaches |
| `node[<id>]…` | that node, on the device on screen first |
| `variables…` / `dataSources…` / `linkage…`, `schema.linkage…` | the 变量 / 数据源 / 联动 tab |

The field-key chain is the form a host should emit: it names a field the way the host knows it, and it is the form the approval bridge's issues already use. An envelope path (`id`, `version`) or a path naming a node that no longer exists is listed but not clickable.

```ts
import type { SchemaIssue, SchemaValidator } from "@vef-framework-react/form-editor";

import { isKeyedField, walkFields } from "@vef-framework-react/form-editor";

// Module scope keeps the identity stable.
export const validateTemporaryKeys: SchemaValidator = schema => {
  const issues: SchemaIssue[] = [];

  walkFields(schema.presentations.pc, (field, scope) => {
    if (isKeyedField(field) && field.key.startsWith("tmp_")) {
      issues.push({
        path: [...scope, field.key].join("."),
        code: "temporary_key",
        severity: "warning",
        message: `字段 ${field.key} 仍在使用临时 key`
      });
    }
  });

  return issues;
};
```

The approval packages ship one: [`validateApprovalProjection`](../approval-form-bridge.md#validateapprovalprojection) from `approval-form-bridge` reports what the approval backend would reject, and the approval designer passes it as `validate`.

## Field registries

Every field and container type the editor and renderer know about lives in a `FormFieldRegistry`. `createDefaultRegistry()` builds a PC registry pre-populated with the 21 built-in types — 16 leaf fields (`textfield`, `number`, `select`, `upload`, …) and 5 containers (`section`, `tabs`, `subform`, `flex`, `grid`) — and the antd container chrome; `createDefaultMobileRegistry()` builds the antd-mobile equivalent (every type except `code-editor`). `FormEditor` uses these when no registry is supplied.

```tsx
import { createDefaultRegistry, FormEditor } from "@vef-framework-react/form-editor";

const registry = createDefaultRegistry();

registry.register(ratingFieldDefinition);

<FormEditor registry={registry} />;
```

- **`registry`** is a shorthand for one registry shared by both devices; **`registries`** (`{ pc, mobile }`) lets the two devices carry different field sets. Supply only the device(s) you customize — an omitted device falls back to `registry`, then to the built-in defaults. The shorthand shares one container-chrome set across devices too.
- Register a custom field type with `defineFieldDefinition` (leaf fields — requires a `Component`) or `defineContainerDefinition` (containers — renders structurally, so it takes no `Component`). See [Reference → Definition builders](./reference.md#definition-builders) for the `FieldDefinition` shape and [Schema → Leaf fields](./schema.md#leaf-fields) for the `FormFieldTypeMap` module-augmentation pattern a custom type's own schema interface plugs into.
- `registerDefaults(registry)` applies the built-in field set and PC container chrome to an existing registry (without building a fresh one), for a host composing its own base + built-ins.
- `FormFieldRegistry` is a small mutable class: `register` / `unregister` / `get` / `has` / `list`, `registerPropertyEntry` / `getPropertyEntry` (design-time property-panel renderers, keyed by `EntryType` — see [Reference](./reference.md#property-entries)), and `setContainerChrome` / `getContainerChrome`. Subscribers (`subscribe`) are notified on every mutation, so the palette and properties panel update live if you register fields after mount.

### Swapping container chrome

`section` / `tabs` / `subform` render through a `ContainerChromeSet` — six presentational shell components (`Section`, `Tabs`, `Subform`, `SubformRow`, `AddButton`, `RemoveButton`) resolved from the active registry. `flex` and `grid` are pure CSS layout and use no chrome. To restyle containers without touching field-level rendering, build a `ContainerChromeSet` and call `registry.setContainerChrome(chrome)` on your own registry before passing it to `FormEditor` / `FormRenderer`.

One prop is easy to drop and must not be: **`SubformChromeProps.errors` (`string[]`) has to be rendered.** A subform mounts a single field for the whole array, so its own errors — "at least one row" on a required subform, and a `table` variant's rolled-up row error — have no other slot; a chrome that ignores them blocks submission with nothing on screen. Both built-in chromes render them beneath the body, through the same footer a leaf field uses.

## FormRenderer

`FormRenderer` renders a `FormSchema` as a live, data-bound form — this is what an end user (not the form's designer) interacts with:

:::info
`FormRenderer` only installs `DeviceProvider` internally — unlike `FormEditor`, it does not supply a `RegistryProvider`. Wrap it (or a shared ancestor) in `RegistryProvider` with the device registries it should render against; without one, every field throws `"A <RegistryProvider> ancestor is required..."`.
:::

```tsx
import type { FormSchema } from "@vef-framework-react/form-editor";

import { createDefaultMobileRegistry, createDefaultRegistry, FormRenderer, RegistryProvider } from "@vef-framework-react/form-editor";

// Registries are stateful: create them once, not per render.
const REGISTRIES = { pc: createDefaultRegistry(), mobile: createDefaultMobileRegistry() };

function ApplicationForm({ schema }: { schema: FormSchema }) {
  return (
    <RegistryProvider registries={REGISTRIES}>
      <FormRenderer
        schema={schema}
        onSubmit={values => submitApplication(values)}
      />
    </RegistryProvider>
  );
}
```

`onSubmit` receives the submitted values as `Record<string, unknown>` — the form has no compile-time value type, since its shape is only known at runtime from the schema.

Notable `FormRendererProps` (full table in the [Reference](./reference.md#formrenderer)):

- **`device`** (default `"pc"`) selects which presentation to render. An undesigned device (e.g. a form with no mobile design) renders an empty state ("此设备尚未配置表单") rather than falling back to the other device. The `mobile` presentation always renders its antd-mobile controls under a `zh-CN` locale, regardless of the host application's own locale.
- **`defaultValues`**, **`disabled`**, **`onSubmit`** behave like an ordinary form — see [Default values](#default-values) and [Submission](#submission).
- **`fieldPermissions`** (v2.10.0) is a server-resolved clamp per field key (`Record<string, FieldPermission>`) — the outer bound that linkage may narrow within but never widen past (`"hidden"` unmounts a field entirely, `"visible"` renders it read-only, `"required"` forces the empty check, `"editable"` is unclamped). The clamp also gates every programmatic write (`assign` / `set_field`) and filters the submit payload down to writable keys. The canonical source is the approval engine resolving one approval node's permission matrix for the current viewer, but any host-resolved map works. See [Linkage → Field permission clamp](./linkage.md#field-permission-clamp).
- **`apiRef`** exposes `FormRendererApi`: `submit()` (runs the same pipeline as a schema `submit` button), `reset()`, `getValues()` (the raw live state), and `getSubmitValues()` (the exact filtered payload `onSubmit` would receive — v2.10.0) — for host chrome like a modal footer's confirm button.
- **`evaluators`**, **`dataSourceResolver`**, **`evaluationContext`** mirror the editor's props of the same name and drive the exact same linkage engine — see [Linkage](./linkage.md). The renderer reads `evaluationContext` slot by slot, so passing an inline object literal does not re-render the form each time, and `variables` re-seeds `$vars` only when its content changes.
- **`containOverlays`** pins mobile overlay pickers (masks/sheets) to the renderer's own box instead of the browser viewport — only meaningful with `device="mobile"`, for a desktop "phone frame" preview.

### Default values

Every root-scope keyed field gets a value slot when the form mounts — `defaultValues[key]` when supplied, otherwise the type's empty value:

| Field type | Empty value |
| --- | --- |
| `number` | `undefined` |
| `switch` | `false` |
| `checkbox-group`, `daterange` | `[]` |
| `upload` | `null` when `maxCount` is 1 (the default), `[]` otherwise |
| every other keyed type | `""` |
| `subform` | the supplied rows, each merged over a blank row so a missing template key still gets its slot; otherwise `minRows` blank rows |

Keys `defaultValues` carries that the schema does not declare are not carried into the form, and so never reach `onSubmit`.

### Submission

A submit — a schema `submit` button, or `apiRef.submit()` — runs one pipeline:

1. **Validation, schema-driven.** Every keyed field of the root scope and of every subform row is checked, mounted or not — antd mounts tab panes and collapsed sections lazily, so a required field in a pane nobody opened is still caught; its error shows when the pane is visited. A field that is effectively hidden or disabled (by its own linkage or by an ancestor container's) is exempt. A `table` subform shows its first row error on the subform itself, naming the row and column. Any error stops the submit here.
2. **`beforeSubmit`** form-scope effects run and are awaited, async host effects included.
3. **The payload is built** from the live values as they stand *after* step 2 — so a `set_field` at `beforeSubmit` lands in it. A field that is effectively hidden is dropped whole, a key the server clamped `"visible"` or `"hidden"` is dropped, and subforms are filtered row by row against each row's own record.
4. **`onSubmit(payload)`** runs and is awaited.
5. **`afterSubmit`** effects run.

`getSubmitValues()` returns step 3's payload right now, without validating or running effects; `getValues()` returns the raw live state, hidden fields' values included.

The per-field rules: a required field (statically, by a `require` rule, or by a `"required"` clamp) fails "此项为必填" when its value is [empty](./linkage.md#operators). The constraint rules apply only to a present value — `minLength` / `maxLength` to strings, counted in characters (code points, matching the Go backend's `utf8.RuneCountInString`); `min` / `max` to numbers; `pattern` to strings, tested with `new RegExp(pattern).test(value)`, which is unanchored, so write `^…$` to constrain the whole value. `validate.message`, when set, replaces the default text of every constraint rule. A mounted field also runs the same checks as its value changes.

## Loading remote options

A `select` / `radio` / `checkbox-group` field's `dataSource` can be `static` (inline options, resolved synchronously), `ref` (a form-global `FormSchema.dataSources` entry), or `remote` (an RPC-shaped request resolved at render time). The package has no networking dependency of its own — remote sources resolve through a host-supplied `DataSourceResolver`:

```ts
interface DataSourceResolver {
  resolve: (request: ResolvedDataSourceRequest, mapping?: RemoteOptionMapping) => Promise<FieldOption[]>;
}
```

`RemoteDataSourceRequest` mirrors the core `apiClient`'s resource / action / version addressing, so `createApiRequest` builds the same envelope a hand-written query function would — only here the endpoint comes from the schema at render time. A resolver on the framework's API client (this is the framework playground's, with `API_PATH` the RPC endpoint your server exposes, `"/api"` there):

```ts
import type { DataSourceResolver, ResolvedDataSourceRequest } from "@vef-framework-react/form-editor";

import { createApiRequest } from "@vef-framework-react/core";

const fetchOptionRows = apiClient.createQueryFn(
  "fetch_form_option_rows",
  ({ post }) => async (request: ResolvedDataSourceRequest) => {
    const result = await post<Array<Record<string, unknown>>>(API_PATH, {
      data: createApiRequest(request.resource, request.action, request.version ?? "v1", request.params ?? {})
    });

    return result.data;
  }
);

export const formDataSourceResolver: DataSourceResolver = {
  async resolve(request, mapping) {
    const rows = await apiClient.fetchQuery({
      queryKey: [fetchOptionRows.key, request] as const,
      queryFn: fetchOptionRows
    });

    return rows.map(row => ({
      label: String(row[mapping?.labelKey ?? "label"] ?? ""),
      value: row[mapping?.valueKey ?? "value"] as string | number
    }));
  }
};
```

```tsx
<RegistryProvider registries={REGISTRIES}>
  <FormRenderer schema={schema} dataSourceResolver={formDataSourceResolver} />
</RegistryProvider>;
```

What the runtime guarantees a resolver:

- **Plain data.** Bound parameters are already evaluated (see [below](#bound-parameters)), and the mapping is already [normalized](./schema.md#options-and-data-sources) — no blank key reaches it, so `mapping?.labelKey ?? "label"` is safe.
- **Caching per renderer.** Results are cached for the life of the `FormRenderer`, keyed on the resolved request, the mapping, and the source's refresh nonce. A field that remounts under the same renderer — a lazily mounted tab pane opened again, say — paints its options from the cache without another call, while a `refresh_data_source` action on a `ref`'d source changes the key and forces a fetch. Wrapping the fetch in `fetchQuery`, as above, adds TanStack Query's cache across renderers too.
- **Failures keep the last list.** A rejected `resolve` keeps the options the field already had, logs a `console.warn` naming the source, and reports `error: true` through `useFieldOptions`; a refresh in flight likewise keeps the old options until the new ones land, so a select never blanks out.

Passing no resolver (the default, `noopDataSourceResolver`) makes every remote source resolve to an empty list rather than error — which reads as "the framework never fetches", so wire one wherever a schema may carry remote sources. In the designer the resolver drives the **preview** and the **JSON** view; the edit canvas resolves static and `ref`-to-static options only.

If you are building a **custom field component** that needs the same resolution logic (static / ref-to-static synchronous, remote / ref-to-remote fetched with loading/error state and caching), call `useFieldOptions(field.dataSource)` inside a component rendered under the `DataSourceProvider` the editor and renderer already install — you rarely need to install `DataSourceProvider` yourself.

### Bound parameters

`RemoteDataSourceRequest.params` is `Record<string, DynamicValue>` — each parameter is either `{ kind: "literal"; value }` or `{ kind: "expression"; source }` bound to the live form. Binding one is what makes a cascading select work — "the wards of the department picked above":

```ts
{
  resource: "sys/ward",
  action: "find_options",
  params: {
    departmentId: { kind: "expression", source: "$form.deptId" },
    active: { kind: "literal", value: true }
  }
}
```

The runtime evaluates expressions **before** the request reaches the resolver — through `evaluateAssignExpression`, the same seam a linkage `assign` value uses, with the same scope (`$form`, `$vars`, `$applicant`, `$globals`, …), so one expression language covers both — and hands over a `ResolvedDataSourceRequest` (`{ resource, action, version?, params?: Record<string, unknown> }`) carrying plain data. A resolver never learns that an expression existed and stays transport-only. An expression may read a [system variable](./linkage.md#host-context-and-system-variables) as well as a field: `$applicant.departmentId` scopes a list to the initiator's department.

A parameter that evaluates to `undefined` is **omitted rather than sent** — an expression reading a key the form does not carry, or any expression at all when no evaluator resolves. Sending the key with an `undefined` value would put a hole on the wire the backend has to special-case; omitting it says the same thing in the vocabulary every transport already understands. An empty value the form really holds (`""`) is a value, not an absence, and is sent.

Options are cached on the **resolved** request, so a bound value changing re-resolves the list while an unrelated keystroke does not — and a schema that binds no parameter anywhere never opens the form-values subscription in the first place.

### Per-row parameter scopes

A bound parameter is evaluated against **its own value scope**: the root form for a root-level field, and the row's own record for a field inside a subform row. Two rows that pick different departments therefore issue two different requests and get two different ward lists.

Author a per-row cascade exactly as you would at the root — the expression names the row's sibling key, because `field` / `$form` bind the current scope's values inside a row (see [Linkage → Expression and script evaluation](./linkage.md#expression-and-script-evaluation)):

```ts
{
  type: "subform",
  key: "lines",
  template: [
    { type: "textfield", key: "deptId", label: "Department" },
    {
      type: "select",
      key: "wardId",
      label: "Ward",
      dataSource: {
        kind: "remote",
        request: {
          resource: "sys/ward",
          action: "find_options",
          params: { departmentId: { kind: "expression", source: "$form.deptId" } }
        }
      }
    }
  ]
}
```

:::warning[Behavior change]
Option resolution previously evaluated bound parameters against the whole form regardless of the field's scope. Inside a subform row that meant the expression read a root key that does not exist, so the parameter dropped out — and because the option cache is keyed on the *resolved* request, every row issued the identical unfiltered request and collapsed onto one shared option list. Per-row cascading was structurally impossible rather than merely wrong once. The `api_call` effect lane already scoped itself this way; both lanes now answer identically.
:::

## Offering an API catalog

Typing `resource`, `action`, and a field mapping by hand asks a form designer to know the backend. `dataSourceApis` lets the host hand the designer the endpoints it already maintains, so a remote source becomes a pick — "Department list" — plus the parameters that endpoint takes:

```ts
interface DataSourceApi {
  label: string;           // shown in the picker, e.g. "Department list"
  description?: string;    // one line, shown once picked
  group?: string;          // picker group heading for a long catalog
  resource: string;
  action: string;
  version?: string;
  mapping?: RemoteOptionMapping; // omit when the records already carry label / value
  params?: DataSourceApiParam[]; // in display order
}

interface DataSourceApiParam {
  name: string;               // the request parameter, params.<name>
  label?: string;             // display name; defaults to name
  description?: string;       // one line under the row
  required?: boolean;         // flagged while unbound
  defaultValue?: DynamicValue; // bound on pick — a literal or an expression
}
```

```tsx
const FORM_DATA_SOURCE_APIS: DataSourceApi[] = [
  {
    label: "Departments",
    group: "Organization",
    resource: "sys/department",
    action: "find_options",
    mapping: { labelKey: "name", valueKey: "id" },
    params: [
      {
        name: "parentId",
        label: "Parent department",
        description: "Leave unbound for the top level",
        defaultValue: { kind: "expression", source: "$applicant.departmentId" }
      }
    ]
  }
];

<FormEditor dataSourceApis={FORM_DATA_SOURCE_APIS} dataSourceResolver={formDataSourceResolver} />;
```

With a catalog, both remote-source editors — a form-global data source in the 数据源 tab and a field's inline remote source — lead with an **接口** picker: the catalog grouped by `group` (ungrouped entries first), searchable by name and by endpoint, followed by **自定义接口** for anything the catalog does not list.

- **Picking an API** stores its `resource` / `action` / `version` and its normalized `mapping` in the schema. Each declared parameter keeps the value already bound to a parameter of the same name, otherwise takes its `defaultValue`; parameters the API does not declare belonged to the previous endpoint and are dropped.
- **A picked API** shows its description, endpoint, and mapping read-only, then its declared parameters as named rows — each with its label (an asterisk when `required`), its name, and its description — where the designer binds only the value, a literal or an expression. A required parameter is flagged "必填参数尚未绑定" while unbound, but the request is still sent without it. Clearing a declared parameter's literal removes it from the request rather than sending an empty filter. Free-form rows can still be added below.
- **自定义接口** keeps the hand-entered editor: `resource` / `action` / `version` (a cleared version is omitted, meaning the default), the four mapping keys (a cleared key is omitted, meaning its default), and free parameter rows.

The catalog is **design-time only**. A pick is stored as the request itself, so the schema stays self-contained: the runtime resolver, the [approval projection](../approval-form-bridge.md#remote-option-sources), and every other consumer read the stored request and never need the catalog. A stored request is recognized as an API again by its endpoint — `resource` + `action` + `version`, with an omitted and an empty version the same — so list each endpoint once; a request that matches no entry opens as 自定义接口. Because a pick resolves through `dataSourceResolver` like any request, the resolver must serve every endpoint the catalog lists.

Parameter names, in both editors, are committed when the row loses focus or on Enter, and only when the name is non-blank and not already taken — a "参数名已存在" hint shows while a draft collides — so a rename in progress can never collapse two rows into one or store a parameter named `""`. A new row waits locally until it is named.

## Building custom field renderers

A field definition's `Component` receives `FieldComponentProps` (`field`, `value`, `onChange`, `errors`, `domId`, `disabled`, `required`, `labelPosition`) and is free to render anything, but a few exported primitives keep a custom field visually consistent with the built-ins:

- **`FieldShell`** / **`Label`** implement the shared label-vs-control layout (top / left / right label placement, helper text, error band) that most built-in input-like fields use — a few (e.g. `switch`) compose `Label` and the field footer directly instead of going through `FieldShell`. Pass `labelledBy="group"` when your field renders a *set* rather than one labelable control (an option group, a dropzone): `<label for>` is inert against a wrapper `div`, so without it the field has no accessible name at all — a screen reader announces the first option and never the question. The shell then labels the body as a `role="group"` and carries `aria-required` / `aria-invalid` onto it. The built-ins using it are `radio`, `checkbox-group`, `code-editor`, and `upload`.
- **`useFieldRegistry()`** and **`useDeviceRegistries()`** (from the same `DeviceProvider` / `RegistryProvider` context) resolve the active device's registry — useful for a custom container or a field that needs to inspect sibling definitions. `FormEditor` installs both providers itself; `FormRenderer` installs only `DeviceProvider`, so a host mounting `FormRenderer` standalone must supply its own `RegistryProvider` ancestor (see [FormRenderer](#formrenderer) above).
- **`useMobileScopeContainer()`** returns a `getContainer` callback for antd-mobile popup-based controls (`Picker`, `DatePicker`, …). It resolves to the surrounding phone-frame element when one is contained (the editor's own design-time preview), and falls back to `document.body` at real mobile runtime — wire it into a custom mobile field's popup the same way the built-in mobile fields do.

`value` is `undefined` and `onChange` a no-op for a non-keyed field; `required` is the live required state (static, linkage, or clamp), which is what drives the label's asterisk. See [Reference](./reference.md#definition-builders) for `defineFieldDefinition`, `defineContainerDefinition`, and the full `FieldComponentProps` / `FieldDefinitionConfig` shapes.

## Full example

A route mounting `FormEditor` with the host's system variables, preview context, option APIs, resolver, and checks wired in (adapted from the framework's own playground):

```tsx
import type { DataSourceApi, EvaluationContext, LinkageContextSource } from "@vef-framework-react/form-editor";

import { FormEditor } from "@vef-framework-react/form-editor";

// What the preview evaluates against. In production the host fills these
// from the record being edited; preview values typed into the 变量 tab
// override them while designing.
const PREVIEW_CONTEXT: EvaluationContext = {
  applicant: { id: "u-1001", name: "Alice", departmentId: "dept-finance", departmentName: "Finance" },
  globals: { region: "east" }
};

// The system variables the 变量 tab lists and the condition builder offers.
const SYSTEM_VARIABLES: LinkageContextSource[] = [
  { key: "$applicant.name", label: "Initiator" },
  { key: "$applicant.departmentId", label: "Initiator department ID" },
  { key: "$applicant.departmentName", label: "Initiator department" },
  { key: "$globals.region", label: "Region" }
];

// Every endpoint here must be served by formDataSourceResolver.
const OPTION_APIS: DataSourceApi[] = [
  { label: "Users", group: "System", resource: "sys/user", action: "find_options" },
  {
    label: "Staff",
    group: "Master data",
    resource: "md/staff",
    action: "find_options",
    params: [{ name: "keyword", label: "Keyword", description: "Matches number, name, phone, or email" }]
  }
];

function FormDesignerRoute() {
  return (
    <FormEditor
      contextSources={SYSTEM_VARIABLES}
      dataSourceApis={OPTION_APIS}
      dataSourceResolver={formDataSourceResolver}
      evaluationContext={PREVIEW_CONTEXT}
      initialSchema={initialSchema}
      validate={validateTemporaryKeys}
      onPublish={schema => saveSchema(schema)}
    />
  );
}
```

Every constant lives at module scope, so none of them changes identity between renders.
