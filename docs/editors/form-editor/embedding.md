---
title: Embedding the Form Editor
description: Wire FormEditor and FormRenderer into a host application, from a one-line drop-in to a fully custom shell.
---

# Embedding the Form Editor

This page covers host integration: mounting the designer (`FormEditor`), mounting the runtime (`FormRenderer`), registering custom field types, and the extension points a host reaches for when building its own field renderers or property panels. For the JSON shape both components read and write, see [Schema](./schema.md); for the linkage/expression model, see [Linkage](./linkage.md).

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

`FormEditor` fills its container (`width: 100%; height: 100%`), so the host is responsible for giving it a sized box — a flex/grid cell with a definite height, not an auto-height page flow.

Notable `FormEditorProps` (the full table is in the [Reference](./reference.md#formeditor)):

- **`initialSchema`** and **`registries`** / **`registry`** are read once, on mount — updating them later has no effect. Use `FormEditorApi.setSchema` to replace the document after mount.
- **`onSchemaChange`** fires with the new `FormSchema` on every committed edit; **`onPublish`** (paired with `publishText` / `publishLoading`) runs a validation pass first — errors block publishing, warnings ask the designer for confirmation — and the publish button is not rendered at all when `onPublish` is omitted.
- **`apiRef`** exposes `FormEditorApi`: `getSchema` / `setSchema`, `undo` / `redo` / `canUndo` / `canRedo`, `selectNode`, `setDevice`, `setViewMode`.
- **`evaluators`**, **`dataSourceResolver`**, **`evaluationContext`**, **`contextSources`** forward into the editor's own live preview — see [Linkage](./linkage.md) and [Loading remote options](#loading-remote-options) below.

The built-in toolbar, palette, and properties panel chrome ships with Chinese UI text (labels like "发布" / "导入" / "导出"). `brand`, `publishText`, and `onPublish` are the toolbar's customization points; a host that needs different chrome copy throughout composes its own shell (next section) around the same panels, or supplies its own toolbar entirely.

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

- **`FormEditor.Provider`** (also exported standalone as `FormEditorProvider`) is the context root: the editor store, the per-device field registries, and the preview runtime (evaluators / data source resolver / evaluation context). It accepts everything `FormEditorProps` does except the toolbar-only props (`brand`, `onPublish`, `publishText`, `publishLoading`).
- **`FormEditor.Shell`** (`FormEditorShell`) sets up layout-adaptivity measurement, the device context, the shared drag-and-drop context, and shell-scoped keyboard shortcuts (undo/redo, etc.). It takes only `children`.
- **`FormEditor.Workspace`** (`FormEditorWorkspace`) is the horizontal palette / stage / properties band.
- **`FormEditor.Stage`** (`FormEditorStage`) is the canvas column (design surface + the form-config drawer + the edit-mode status footer). It takes no props — it reads everything from the store.
- **`FormEditor.Toolbar`** (also exported as `FormEditorToolbar`) is the default toolbar, usable standalone if you only want to swap its brand.
- **`FormEditor.Palette`** and **`FormEditor.Properties`** are the field palette and the properties panel; both read from context and take no props.

## Field registries

Every field and container type the editor and renderer know about lives in a `FormFieldRegistry`. `createDefaultRegistry()` builds a PC registry pre-populated with the ~20 built-in types (`textfield`, `number`, `select`, `subform`, `grid`, …) and the antd container chrome; `createDefaultMobileRegistry()` builds the antd-mobile equivalent. `FormEditor` uses these when no registry is supplied.

```tsx
import { createDefaultRegistry, FormEditor } from "@vef-framework-react/form-editor";

const registry = createDefaultRegistry();

registry.register(ratingFieldDefinition);

<FormEditor registry={registry} />;
```

- **`registry`** is a shorthand for one registry shared by both devices; **`registries`** (`{ pc, mobile }`) lets the two devices carry different field sets. Supply only the device(s) you customize — an omitted device falls back to `registry`, then to the built-in defaults.
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

function ApplicationForm({ schema }: { schema: FormSchema }) {
  return (
    <RegistryProvider registries={{ pc: createDefaultRegistry(), mobile: createDefaultMobileRegistry() }}>
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

- **`device`** (default `"pc"`) selects which presentation to render. An undesigned device (e.g. a form with no mobile design) renders an empty state rather than falling back to the other device. The `mobile` presentation always renders its antd-mobile controls under a `zh-CN` locale, regardless of the host application's own locale.
- **`defaultValues`**, **`disabled`**, **`onSubmit`** behave like an ordinary form: `onSubmit` only fires after the schema's own validation rules pass.
- **`fieldPermissions`** (v2.10.0) is a server-resolved clamp per field key (`Record<string, FieldPermission>`) — the outer bound that linkage may narrow within but never widen past (`"hidden"` unmounts a field entirely, `"visible"` renders it read-only, `"required"` forces the empty check, `"editable"` is unclamped). The clamp also gates every programmatic write (`assign` / `set_field`) and filters the submit payload down to writable keys. The canonical source is the approval engine resolving one approval node's permission matrix for the current viewer, but any host-resolved map works. See [Linkage → Field permission clamp](./linkage.md#field-permission-clamp).
- **`apiRef`** exposes `FormRendererApi`: `submit()` (runs the same validation pipeline as a schema `submit` button), `reset()`, `getValues()` (the raw live state), and `getSubmitValues()` (the exact filtered payload `onSubmit` would receive — v2.10.0) — for host chrome like a modal footer's confirm button.
- **`evaluators`**, **`dataSourceResolver`**, **`evaluationContext`** mirror the editor's props of the same name and drive the exact same linkage engine — see [Linkage](./linkage.md).
- **`containOverlays`** pins mobile overlay pickers (masks/sheets) to the renderer's own box instead of the browser viewport — only meaningful with `device="mobile"`, for a desktop "phone frame" preview.

## Loading remote options

A `select` / `radio` / `checkbox-group` field's `dataSource` can be `static` (inline options, resolved synchronously), `ref` (a form-global `FormSchema.dataSources` entry), or `remote` (an RPC-shaped request resolved at render time). The package has no networking dependency of its own — remote sources resolve through a host-supplied `DataSourceResolver`:

```tsx
import type { DataSourceResolver } from "@vef-framework-react/form-editor";

import { createApiRequest, HTTP_CLIENT } from "@vef-framework-react/core";

// `RemoteDataSourceRequest` mirrors the core `apiClient`'s resource/action/version
// addressing, so `createApiRequest` builds the same envelope a `createQueryFn`
// call would — only here the resource/action come from the field at render time
// instead of being fixed ahead of time.
const resolver: DataSourceResolver = {
  resolve: async ({ action, params, resource, version }, mapping) => {
    const result = await apiClient[HTTP_CLIENT].post("/api/rpc", {
      data: createApiRequest(resource, action, version ?? "v1", params)
    });

    return (result.data as Array<Record<string, unknown>>).map(item => ({
      label: String(item[mapping?.labelKey ?? "label"]),
      value: item[mapping?.valueKey ?? "value"] as string | number
    }));
  }
};

<RegistryProvider registries={{ pc: createDefaultRegistry(), mobile: createDefaultMobileRegistry() }}>
  <FormRenderer schema={schema} dataSourceResolver={resolver} />
</RegistryProvider>;
```

Passing no resolver (the default, `noopDataSourceResolver`) makes every remote source resolve to an empty list rather than error. If you are building a **custom field component** that needs the same resolution logic (static / ref-to-static synchronous, remote / ref-to-remote fetched with loading/error state and result caching), call `useFieldOptions(field.dataSource)` inside a component wrapped by the same `DataSourceProvider` the editor and renderer already install — you rarely need to install `DataSourceProvider` yourself.

### Bound parameters

`RemoteDataSourceRequest.params` is `Record<string, DynamicValue>` — each parameter is either `{ kind: "literal"; value }` or `{ kind: "expression"; source }` bound to the live form. Binding one is what makes a cascading select work — "the wards of the department picked above":

```ts
{
  resource: "sys/ward",
  action: "find_options",
  params: {
    departmentId: { kind: "expression", source: "field.deptId" },
    active: { kind: "literal", value: true }
  }
}
```

The runtime evaluates expressions **before** the request reaches the resolver — through `evaluateAssignExpression`, the same seam a linkage `assign` value uses, so one expression language covers both — and hands over a `ResolvedDataSourceRequest` (`{ resource, action, version?, params?: Record<string, unknown> }`) carrying plain data. A resolver never learns that an expression existed and stays transport-only. `DynamicValue` is one declaration shared with [linkage action values](./linkage.md#actions), so the designer offers the same "fixed value or bound value" control in both places.

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
          params: { departmentId: { kind: "expression", source: "field.deptId" } }
        }
      }
    }
  ]
}
```

:::warning[Behavior change]
Option resolution previously evaluated bound parameters against the whole form regardless of the field's scope. Inside a subform row that meant the expression read a root key that does not exist, so the parameter dropped out — and because the option cache is keyed on the *resolved* request, every row issued the identical unfiltered request and collapsed onto one shared option list. Per-row cascading was structurally impossible rather than merely wrong once. The `api_call` effect lane already scoped itself this way; both lanes now answer identically.
:::

## Building custom field renderers

A field definition's `Component` receives `FieldComponentProps` (`field`, `value`, `onChange`, `errors`, `domId`, `disabled`, `required`, `labelPosition`) and is free to render anything, but a few exported primitives keep a custom field visually consistent with the built-ins:

- **`FieldShell`** / **`Label`** implement the shared label-vs-control layout (top / left / right label placement, helper text, error band) that most built-in input-like fields use — a few (e.g. `switch`) compose `Label` and the field footer directly instead of going through `FieldShell`. Pass `labelledBy="group"` when your field renders a *set* rather than one labelable control (an option group, a dropzone): `<label for>` is inert against a wrapper `div`, so without it the field has no accessible name at all — a screen reader announces the first option and never the question. The shell then labels the body as a `role="group"` and carries `aria-required` / `aria-invalid` onto it. The built-ins using it are `radio`, `checkbox-group`, `code-editor`, and `upload`.
- **`useFieldRegistry()`** and **`useDeviceRegistries()`** (from the same `DeviceProvider` / `RegistryProvider` context) resolve the active device's registry — useful for a custom container or a field that needs to inspect sibling definitions. `FormEditor` installs both providers itself; `FormRenderer` installs only `DeviceProvider`, so a host mounting `FormRenderer` standalone must supply its own `RegistryProvider` ancestor (see [FormRenderer](#formrenderer) above).
- **`useMobileScopeContainer()`** returns a `getContainer` callback for antd-mobile popup-based controls (`Picker`, `DatePicker`, …). It resolves to the surrounding phone-frame element when one is contained (the editor's own design-time preview), and falls back to `document.body` at real mobile runtime — wire it into a custom mobile field's popup the same way the built-in mobile fields do.

See [Reference](./reference.md#definition-builders) for `defineFieldDefinition`, `defineContainerDefinition`, and the full `FieldComponentProps` / `FieldDefinitionConfig` shapes.

## Full example

A route mounting `FormEditor` with host context wired in (from the framework's own playground):

```tsx
import type { EvaluationContext, LinkageContextSource } from "@vef-framework-react/form-editor";

import { FormEditor } from "@vef-framework-react/form-editor";

// Host-injected runtime context; expressions and `$`-rooted visual conditions
// read it via `$user.*`.
const EVALUATION_CONTEXT: EvaluationContext = {
  user: {
    id: "user-admin",
    departmentId: "dept-finance",
    departmentName: "Finance"
  }
};

// Design-time pick list: these paths appear in the visual condition builder's
// source dropdown alongside the form's own fields.
const CONTEXT_SOURCES: LinkageContextSource[] = [
  { key: "$user.departmentId", label: "Applicant department ID" },
  { key: "$user.departmentName", label: "Applicant department" }
];

function FormDesignerRoute() {
  return (
    <FormEditor
      contextSources={CONTEXT_SOURCES}
      evaluationContext={EVALUATION_CONTEXT}
      initialSchema={initialSchema}
      onPublish={schema => saveSchema(schema)}
    />
  );
}
```
