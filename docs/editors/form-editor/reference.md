---
title: Form Editor Reference
description: Dry export, prop, and type tables for @vef-framework-react/form-editor — every symbol exported from its package entry point.
---

# Form Editor Reference

Every export documented here comes from `@vef-framework-react/form-editor`'s package entry point (`import { ... } from "@vef-framework-react/form-editor"`) — no internal module paths. For narrative explanations, see [Overview](./overview.md), [Embedding](./embedding.md), [Schema](./schema.md), and [Linkage](./linkage.md).

## FormEditor

| Export | Shape |
| --- | --- |
| `FormEditor` | Pre-composed component. `Object.assign`'d with `.Provider`, `.Shell`, `.Workspace`, `.Stage`, `.Toolbar`, `.Palette`, `.Properties` — see [Embedding](./embedding.md#composing-your-own-shell). |
| `FormEditorProvider` (= `FormEditor.Provider`) | Context root: store + registries + preview runtime. Props: `FormEditorProviderProps`. |
| `FormEditorShell` (= `FormEditor.Shell`) | Chrome frame (layout measurement, device context, drag-drop, shortcuts). Props: `FormEditorShellProps` (`children` only). |
| `FormEditorWorkspace` (= `FormEditor.Workspace`) | Palette / stage / properties band. Props: `{ children: ReactNode }`. |
| `FormEditorStage` (= `FormEditor.Stage`) | Canvas column. No props. |
| `FormEditorToolbar` (= `FormEditor.Toolbar`) | Default toolbar. Props: `ToolbarProps`. |

### `FormEditorProps`

Extends `FormEditorProviderProps` (below) plus:

| Prop | Type | Notes |
| --- | --- | --- |
| `brand` | `ToolbarBrand` (`{ name?, tag?, icon? }`) | Toolbar brand mark; defaults to the framework's own name/glyph. |
| `onPublish` | `(schema: FormSchema) => void` | Runs the editor's validation plus the host's `validate` first (errors block, warnings ask for confirmation); the publish button is not rendered when omitted. |
| `publishText` | `string` | Defaults to `"发布"`. Ignored when `onPublish` is omitted. |
| `publishLoading` | `boolean` | Loading state on the publish button. Ignored when `onPublish` is omitted. |

### `FormEditorProviderProps`

| Prop | Type | Notes |
| --- | --- | --- |
| `initialSchema` | `FormSchema` | Read once, on mount. Not validated — see [Schema → Validating an imported schema](./schema.md#validating-an-imported-schema). |
| `registries` | `Partial<DeviceRegistries>` | Per-device registry override; an omitted device falls back to `registry`, then the built-in defaults. Read once, on mount. |
| `registry` | `FormFieldRegistry` | Shorthand for one registry shared by both devices (container chrome included). Read once, on mount. |
| `evaluators` | `LinkageEvaluators` | Forwarded to the live preview and JSON view — see [Linkage](./linkage.md#pluggable-evaluators). Without a `dispatchEffect`, the preview shows `alert` / `navigate` / `api_call` as toasts. |
| `dataSourceResolver` | `DataSourceResolver` | Forwarded to the live preview and JSON view — see [Embedding](./embedding.md#loading-remote-options). |
| `dataSourceApis` | `DataSourceApi[]` | The host's option-API catalog; remote option sources lead with a picker over it. Design-time only — see [Embedding → Offering an API catalog](./embedding.md#offering-an-api-catalog). |
| `evaluationContext` | `EvaluationContext` | Forwarded to the live preview and JSON view, with the 变量 tab's preview values laid over it — see [Linkage](./linkage.md#host-context-and-system-variables). |
| `contextSources` | `LinkageContextSource[]` | The form's system variables: listed in the 变量 tab with preview values and offered by the condition builder — see [Linkage](./linkage.md#system-variables-in-the-designer). Design-time only. |
| `validate` | `SchemaValidator` | The host's own checks, called only for a schema free of structural errors; its issues join the status-bar diagnostics and the publish gate. Pass a stable function — see [Embedding → Host diagnostics](./embedding.md#host-diagnostics). |
| `onSchemaChange` | `(schema: FormSchema) => void` | Fires whenever the document changes — edits, undo / redo, import, clear, `setSchema` — but not for the initial schema. |
| `apiRef` | `Ref<FormEditorApi>` | See below. |
| `children` | `ReactNode` | — |

### `FormEditorApi`

| Member | Signature |
| --- | --- |
| `getSchema` | `() => FormSchema` |
| `setSchema` | `(schema: FormSchema) => void` — import semantics: resets the undo timeline and the selection; does not validate |
| `undo` / `redo` | `() => void` |
| `canUndo` / `canRedo` | `() => boolean` |
| `selectNode` | `(nodeId: string \| null) => void` |
| `setDevice` | `(device: EditorDeviceMode) => void` |
| `setViewMode` | `(mode: EditorViewMode) => void` |

### `ToolbarBrand` / `ToolbarProps`

| Type | Shape |
| --- | --- |
| `ToolbarBrand` | `{ name?: string; tag?: string; icon?: ReactNode }` |
| `ToolbarProps` | `{ brand?: ToolbarBrand; onPublish?: (schema: FormSchema) => void; publishText?: string; publishLoading?: boolean }` |

## FormRenderer

| Export | Shape |
| --- | --- |
| `FormRenderer` | Runtime component. Props: `FormRendererProps`. |

### `FormRendererProps`

| Prop | Type | Notes |
| --- | --- | --- |
| `schema` | `FormSchema` | Required. Not validated. |
| `device` | `PresentationDevice` (`"pc" \| "mobile"`) | Default `"pc"`. An undesigned device renders an empty state. |
| `defaultValues` | `Record<string, unknown>` | Seeds the root-scope keyed fields — see [Embedding → Default values](./embedding.md#default-values). |
| `disabled` | `boolean` | Renders the whole form read-only; a disabled form skips submit validation. |
| `fieldPermissions` | `Record<string, FieldPermission>` | Server-resolved clamp — see [Linkage](./linkage.md#field-permission-clamp). |
| `evaluators` | `LinkageEvaluators` | See [Linkage](./linkage.md#pluggable-evaluators). |
| `dataSourceResolver` | `DataSourceResolver` | See [Embedding](./embedding.md#loading-remote-options). Default `noopDataSourceResolver`. |
| `evaluationContext` | `EvaluationContext` | See [Linkage](./linkage.md#host-context-and-system-variables). Read slot by slot; `variables` re-seeds `$vars` only on a content change. |
| `onSubmit` | `(values: Record<string, unknown>) => void \| Promise<void>` | Receives the filtered payload after validation and `beforeSubmit` — see [Embedding → Submission](./embedding.md#submission). |
| `apiRef` | `Ref<FormRendererApi>` | See below. |
| `containOverlays` | `boolean` | Default `false`. Mobile-only; pins overlay pickers to the renderer's own box. |

### `FormRendererApi`

| Member | Signature |
| --- | --- |
| `submit` | `() => Promise<void>` — same validation pipeline as a schema `submit` button |
| `reset` | `() => void` |
| `getValues` | `() => Record<string, unknown>` — the RAW live form state, including hidden fields' seeded defaults and read-only (non-writable-clamped) values |
| `getSubmitValues` | `() => Record<string, unknown>` — exactly what the submit pipeline would deliver to `onSubmit` right now: the live values run through the same payload filtering (effectively-hidden fields dropped, non-writable-clamped keys excluded, subforms recursed per row), without running validation or the submit lifecycle. Added in v2.10.0 alongside the [field-permission clamp](./linkage.md#field-permission-clamp) |

## Field registries

| Export | Signature |
| --- | --- |
| `createDefaultRegistry` | `() => FormFieldRegistry` — PC registry: the built-in field/container definitions + the antd container chrome |
| `createDefaultMobileRegistry` | `() => FormFieldRegistry` — antd-mobile registry: `mobileFieldDefinitions` + the antd-mobile container chrome |
| `registerDefaults` | `(registry: FormFieldRegistry) => void` — applies the built-in field set + PC chrome to an existing registry |
| `DeviceRegistries` (type) | `{ pc: FormFieldRegistry; mobile: FormFieldRegistry }` |

### `FormFieldRegistry`

| Member | Signature | Notes |
| --- | --- | --- |
| `register` | `(definition: FieldDefinition) => void` | Keyed by `definition.config.type`. |
| `unregister` | `(type: string) => boolean` | — |
| `get` | `(type: string) => FieldDefinition \| undefined` | — |
| `has` | `(type: string) => boolean` | — |
| `list` | `() => FieldDefinition[]` | — |
| `registerPropertyEntry` | `(type: EntryType, component: FC<EntryComponentProps>) => void` | Design-time property-panel renderer. |
| `getPropertyEntry` | `(type: EntryType) => FC<EntryComponentProps> \| undefined` | Falls back to the panel's statically-imported built-ins when `undefined`. |
| `setContainerChrome` | `(chrome: ContainerChromeSet) => void` | — |
| `getContainerChrome` | `() => ContainerChromeSet` | Throws if none installed. |
| `subscribe` | `(listener: () => void) => () => void` | Notified on every mutation. |
| `getRevision` | `() => number` | Monotonic; for `useSyncExternalStore` snapshots. |

## Property entries

Built-in property-entry renderer components (each `FC<EntryComponentProps>`), resolvable by `EntryType`:

| `EntryType` | Component |
| --- | --- |
| `"text"` | `TextEntry` |
| `"key"` | `KeyEntry` |
| `"number"` | `NumberEntry` |
| `"checkbox"` | `CheckboxEntry` |
| `"select"` | `SelectEntry` |
| `"icon"` | `IconEntry` |
| `"options-editor"` | `OptionsSourceEntry` |
| `"linkage-rules"` | `LinkageRulesEntry` |

`EntryComponentProps`: `{ entry: PropertyEntry; field: FormField; schema: FormSchema; onChange: (value: unknown) => void }`. `PropertyEntryTypeMap` is the open interface `EntryType` is keyed from — augment it (`declare module`) to register a new entry kind alongside `registerPropertyEntry`.

## Definition builders

| Export | Signature |
| --- | --- |
| `defineFieldDefinition` | `<TField extends FormField, TValue = unknown>(definition: { config: FieldDefinitionConfig; Component: FC<FieldComponentProps<TField, TValue>>; properties: PropertiesDescriptor }) => FieldDefinition` |
| `defineContainerDefinition` | `(definition: { config: FieldDefinitionConfig }) => FieldDefinition` — no `Component` slot (containers render structurally) |
| `definePropertyEntry` | `<TField extends FormField, TValue>(entry: PropertyEntry<TField, TValue>) => PropertyEntry` — pins the entry's field/value types at its declaration site |

### `FieldDefinitionConfig`

| Field | Type | Notes |
| --- | --- | --- |
| `type` | `Block["type"]` | Discriminator. |
| `name` | `string` | Palette display name. |
| `group` | `FieldGroup` (`"basic-input" \| "selection" \| "date-file" \| "container" \| "action" \| "presentation"`) | Palette category. |
| `keyed` | `boolean` | Whether the field needs a unique data-binding `key`. |
| `icon` | `DynamicIconName` | Optional; palette card / properties header icon. |
| `iconUrl` | `string` | Optional. |
| `create` | `() => FieldCreateResult` | Factory returning type-specific defaults; `id` / `key` are engine-minted. |

### `FieldComponentProps<TField, TValue>`

| Field | Type |
| --- | --- |
| `field` | `TField` |
| `value` | `TValue` |
| `onChange` | `(value: TValue) => void` |
| `errors` | `string[] \| undefined` |
| `domId` | `string` |
| `disabled` | `boolean \| undefined` |
| `required` | `boolean \| undefined` |
| `labelPosition` | `LabelPosition \| undefined` |

`FieldCreateResult = DistributedOmit<Block, "id" | "key">`. `FieldDefinition = { config: FieldDefinitionConfig; Component?: FC<FieldComponentProps>; properties: PropertiesDescriptor }`.

### `PropertyEntry` / `PropertiesDescriptor`

| Type | Shape |
| --- | --- |
| `PropertyEntry<TField, TValue>` | `{ id, label, type: EntryType, options?: PropertyEntryOption[], visible?: (field: TField) => boolean, readOnly?, description?, placeholder?, read: (field: TField) => TValue, write: (field: TField, value: TValue) => TField }` |
| `PropertyEntryOption` | `{ value: string; label: string }` |
| `PropertyGroup` | `{ id: string; label: string; tab?: PropertyTabId; entries: PropertyEntry[] }` |
| `PropertiesDescriptor` | `PropertyGroup[]` |
| `PropertyTabId` | `"props" \| "validation" \| "linkage" \| "layout"` |

## Editor store

| Export | Signature |
| --- | --- |
| `FormEditorStoreProvider` | Store context provider (installed by `FormEditorProvider`) |
| `useFormEditorStore` | `<T>(selector: (state: FormEditorStoreState) => T) => T` |
| `useFormEditorStoreApi` | `() => FormEditorStoreApi` (`UnboundStore<FormEditorStoreState>`) |
| `useCurrentLayer` | `() => PresentationLayer` — the active device's presentation |
| `isPaletteVisible` | `(state: Pick<FormEditorStoreState, "viewMode">) => boolean` |

`FormEditorStoreState` is the store's full state + actions — most consumers read it through `useFormEditorStore(selector)` rather than the whole shape. Notable pieces:

| Member | Type | Notes |
| --- | --- | --- |
| `schema` | `FormSchema` | — |
| `selectedId` | `string \| null` | — |
| `viewMode` | `EditorViewMode` (`"edit" \| "preview" \| "json"`) | — |
| `device` | `EditorDeviceMode` (= `PresentationDevice`) | — |
| `formConfigOpen` / `formConfigTab` | `boolean` / `FormConfigTabId` | `FormConfigTabId = "outline" \| "form" \| "variables" \| "dataSources" \| "linkage"` — the drawer's 大纲 / 表单 / 变量 / 数据源 / 联动 tabs |
| `past` / `future` | `HistoryEntry[]` | `HistoryEntry = { schema: FormSchema; device: EditorDeviceMode }`; at most 100 entries, global across devices |
| `setSchema` | `(schema: FormSchema) => void` | Replace the document; resets the history and the selection. |
| `clearSchema` | `() => void` | Reset to an empty schema as an ordinary undoable edit. |
| `selectNode`, `setViewMode`, `setDevice` | actions | View state — never checkpointed. |
| `setFormConfigOpen`, `setFormConfigTab` | actions | Open / collapse the form-config drawer, or switch it to a tab (opening it); no-ops outside edit mode. |
| `initMobile` | `(layer: PresentationLayer) => void` | Seed the mobile presentation (blank or converted) and switch to it; one undo removes it again. |
| `insertField`, `moveNode`, `removeNode`, `removeTab`, `duplicateNode` | actions | Structural edits, each one checkpointed undo step. `removeNode` / `removeTab` prune the linkage rules referencing the keys that die with the removed subtree in the same step. |
| `setSpan`, `setFlex`, `setColumnWidth`, `setStackSlot` | actions | Layout edits, coalesced per node. |
| `editField(args, options?: EditCoalesceOptions)`, `updateBlock(args, options?)` | actions | `EditCoalesceOptions = { coalesceKey?: string }` — consecutive edits sharing a key fold into one undo step. **Folding is opt-in:** omit `coalesceKey` and the edit takes its own undo entry *and* ends the current run, so the next edit takes one too. Name what is being edited (the built-in property panel passes `field:<id>:<entryId>`) to fold a run of keystrokes in one input; leave it off for discrete actions — a select, a switch, an add/remove — that each deserve their own step. |
| `setFieldKey` | action | Sanitizes, dedupes, and renames every reference to the old key. Deduplication spans **both** device presentations at the field's own value scope, and the twin bound to the same key at the same scope on the other device is renamed in the same undo step — see [Schema → Per-device presentations](./schema.md#per-device-presentations). |
| `patchSchema` | `(patch: FormSchemaPatch) => void` | `FormSchemaPatch = Partial<Pick<FormSchema, "dataSources" \| "id" \| "linkage" \| "variables">> & { gap?: GapScale }` |
| `renameVariable`, `removeVariable`, `removeDataSource` | actions | Rename/remove + reference cleanup. |
| `undo`, `redo`, `canUndo`, `canRedo` | actions | — |

## Device and registry hooks

| Export | Signature | Notes |
| --- | --- | --- |
| `DeviceProvider` | `(props: { device: PresentationDevice; children }) => ReactElement` | Sets the active device for registry resolution. |
| `RegistryProvider` | `(props: { registries: DeviceRegistries; children }) => ReactElement` | — |
| `useDeviceRegistries` | `() => DeviceRegistries` | Throws without an ancestor `RegistryProvider`. |
| `useFieldRegistry` | `() => FormFieldRegistry` | The active device's registry; re-renders on registration changes. |
| `useMobileScopeContainer` | `() => () => HTMLElement` | `getContainer` callback for antd-mobile overlays — the containing phone-frame element when one is present (design-time preview), else `document.body` (real mobile runtime). |

## Rendering parts

| Export | Props |
| --- | --- |
| `FieldShell` | `FieldShellProps`: `{ children, domId, errors?, helperText?, label, labelPosition?, required?, labelledBy? }` — shared label/control/helper/error layout. `labelledBy` (`"control"` default \| `"group"`) picks how the label associates with what it names: `"control"` emits `<label for={domId}>`, which needs `domId` on a labelable element; `"group"` is for a field that renders a *set* rather than one control (`radio`, `checkbox-group`, `code-editor`, `upload`) — `for` is inert against their wrapper, so the label carries an id and the body becomes a `role="group"` pointing back at it with `aria-required` / `aria-invalid`. Without it such a field has no accessible name at all: a screen reader announces the first option and nothing about the question. |
| `Label` | `LabelProps`: `{ children, htmlFor?, id?, position?: LabelPosition, required?, title?, "aria-hidden"? }` — `id` lets a `role="group"` body point back at the label (used instead of `htmlFor`); `title` is the native tooltip a truncated side label shows; `aria-hidden` hides a label whose control already carries the same `aria-label` |

## Data sources

| Export | Signature |
| --- | --- |
| `DataSourceProvider` | `(props: { children, dataSources?: FormDataSource[], resolver?: DataSourceResolver, versions?: Record<string, number> }) => ReactElement` — installed by `FormEditor` and `FormRenderer`; owns the option cache for its lifetime. |
| `useFieldOptions` | `(source: FieldOptionSource \| undefined) => { options: FieldOption[]; loading: boolean; error: boolean }` — `error` is set after a rejected resolve, which keeps the previous options |
| `DataSourceResolver` (type) | `{ resolve: (request: ResolvedDataSourceRequest, mapping?: RemoteOptionMapping) => Promise<FieldOption[]> }` — a resolver only ever sees evaluated parameters and a normalized mapping |
| `noopDataSourceResolver` | `DataSourceResolver` whose `resolve` always returns `[]` — the default. |
| `RemoteDataSourceRequest` (type) | `{ resource: string; action: string; version?: string; params?: Record<string, DynamicValue> }` — the schema shape, carrying bindings |
| `ResolvedDataSourceRequest` (type) | `{ resource: string; action: string; version?: string; params?: Record<string, unknown> }` — the runtime shape, carrying data; see [Embedding → Bound parameters](./embedding.md#bound-parameters) |
| `DynamicValue` (type) | `{ kind: "literal"; value: unknown } \| { kind: "expression"; source: string }` — one declaration shared with `LinkageActionValue` |
| `isDynamicValue` | `(value: unknown) => value is DynamicValue` — narrowing guard for values that crossed a serialization boundary |
| `RemoteOptionMapping` (type) | `{ labelKey?: string; valueKey?: string; disabledKey?: string; descriptionKey?: string }` — `labelKey` / `valueKey` default to `"label"` / `"value"` |
| `normalizeOptionMapping` | `(mapping: RemoteOptionMapping \| undefined) => RemoteOptionMapping \| undefined` — drops blank and whitespace-only keys, trims the rest, returns `undefined` when nothing is left; see [Schema → Options and data sources](./schema.md#options-and-data-sources) |
| `DataSourceApi` (type) | `{ label: string; description?: string; group?: string; resource: string; action: string; version?: string; mapping?: RemoteOptionMapping; params?: DataSourceApiParam[] }` — one entry of the designer's API catalog; see [Embedding → Offering an API catalog](./embedding.md#offering-an-api-catalog) |
| `DataSourceApiParam` (type) | `{ name: string; label?: string; description?: string; required?: boolean; defaultValue?: DynamicValue }` — a parameter an API declares |

## Mobile

| Export | Shape |
| --- | --- |
| `mobileFieldDefinitions` | `FieldDefinition[]` — antd-mobile leaf renderers (every built-in leaf type except `code-editor`) plus the structural containers, reusing each PC field's `config` / `properties`. |
| `useMobileScopeContainer` | See [Device and registry hooks](#device-and-registry-hooks). |

## Schema types

See [Schema](./schema.md) for the narrative model. Top-level and supporting types:

| Export | Shape |
| --- | --- |
| `FormSchema` | `{ id, version: 2, variables?, dataSources?, linkage?, presentations: { pc: PresentationLayer; mobile?: PresentationLayer } }` |
| `PresentationLayer` | `{ gap?: GapScale; children: Block[] }` |
| `RuntimeSchema` | `PresentationLayer & { id: string; variables?, dataSources?, linkage? }` — produced by `toRuntimeSchema` |
| `Block` | `FormField \| ContainerNode` |
| `FormField` | `FormFieldTypeMap[keyof FormFieldTypeMap]` — see [Leaf field interfaces](#leaf-field-interfaces) |
| `FormFieldTypeMap` | Open interface (module-augmentable) mapping `type` → field interface |
| `KeyedFormField` | `Extract<FormField, KeyedNode>` |
| `ContainerNode` | `SectionNode \| TabsNode \| SubformNode \| FlexNode \| GridNode` (closed set) |
| `CONTAINER_TYPES` | `Array<ContainerNode["type"]>` |
| `KeyedNode` | `{ key: string; columnType?: ColumnDataType }` |
| `KeyedNodeUnion` | `Extract<Block, KeyedNode>` |
| `Validatable` | `{ validate?: { required?, minLength?, maxLength?, min?, max?, pattern?, message? } }` |
| `PresentationDevice` | `"pc" \| "mobile"` |
| `LabelPosition` | `"top" \| "left" \| "right"` |
| `GapScale` | `"small" \| "medium" \| "large"` |
| `GAP_SCALES` | `readonly GapScale[]` |
| `DEFAULT_GAP_SCALE` | `"medium"` |
| `ROW_COLS` | `24` |
| `FlexSlot` | `{ grow?: number; shrink?: number; basis?: string }` |
| `CssLength` | `{ value: number; unit: "px" \| "%" }` |
| `StackSlot` | `{ width?: CssLength; minWidth?: CssLength; maxWidth?: CssLength; align?: "start" \| "center" \| "end" }` |
| `ColumnDataType` | `"string" \| "text" \| "integer" \| "decimal" \| "boolean" \| "date" \| "datetime" \| "json"` |
| `FieldOption` | `{ label: string; value: string \| number }` |
| `FieldOptionSource` | `StaticOptionSource \| RefOptionSource \| RemoteOptionSource` (`kind: "static" \| "ref" \| "remote"`) |
| `FormDataSource` | `StaticDataSource \| RemoteDataSource` (each `{ id, name, kind, ... }`) |
| `FormVariable` | `{ id, name, type: "string" \| "number" \| "boolean" \| "json", defaultValue? }` — `name` is identifier-shaped (`^[A-Za-z_]\w*$`) and unique; see [Schema → Form variables](./schema.md#form-variables) |

## Leaf field interfaces

Every leaf field extends the shared base: `{ id: string; label?: string; labelPosition?: LabelPosition; span?: number; flex?: FlexSlot; columnWidth?: number; stack?: StackSlot; linkage?: FieldLinkage }`. Keyed fields additionally carry `{ key: string; columnType?: ColumnDataType }`; `Validatable` fields additionally carry `{ validate?: {...} }` (see [Schema types](#schema-types)). Only each interface's **own** fields are listed below.

| Interface | `type` | Extends | Own fields |
| --- | --- | --- | --- |
| `TextfieldField` | `"textfield"` | Keyed, Validatable | `placeholder?, helperText?, prefixIcon?: DynamicIconName, size?: "small"\|"middle"\|"large", allowClear?: boolean, maxLength?: number, inputType?: "text"\|"password"` |
| `CodeEditorField` | `"code-editor"` | Keyed, Validatable | `placeholder?, helperText?, language?: CodeEditorLanguage, minHeight?: number, maxHeight?: number, showLineNumbers?: boolean, showFoldGutter?: boolean, tabSize?: number` |
| `NumberField` | `"number"` | Keyed, Validatable | `placeholder?, helperText?, min?: number, max?: number, step?: number, size?, prefix?: string, suffix?: string, precision?: number, controls?: boolean` (default shown) |
| `SwitchField` | `"switch"` | Keyed (not Validatable) | `helperText?, onText?: string, offText?: string, size?: "default"\|"small"` |
| `SelectField` | `"select"` | Keyed, Validatable | `placeholder?, helperText?, allowClear?: boolean, size?, showSearch?: boolean, dataSource?: FieldOptionSource` |
| `RadioField` | `"radio"` | Keyed, Validatable | `helperText?, dataSource?: FieldOptionSource, optionType?: "default"\|"button", buttonStyle?: "outline"\|"solid", direction?: "horizontal"\|"vertical"` (default `"vertical"`, applied explicitly on both devices, whose native defaults differ) |
| `CheckboxGroupField` | `"checkbox-group"` | Keyed, Validatable | `helperText?, dataSource?: FieldOptionSource, direction?: "horizontal"\|"vertical"` (default `"vertical"`) |
| `TextareaField` | `"textarea"` | Keyed, Validatable | `placeholder?, helperText?, rows?: number, autoSize?: boolean, maxLength?: number, showCount?: boolean, size?, allowClear?: boolean` |
| `DateField` | `"date"` | Keyed, Validatable | `placeholder?, helperText?, allowClear?: boolean` (default `true`) |
| `DatetimeField` | `"datetime"` | Keyed, Validatable | `placeholder?, helperText?, allowClear?: boolean` (default `true`) |
| `DateRangeField` | `"daterange"` | Keyed, Validatable | `helperText?, allowClear?: boolean` (default `true`) |
| `UploadField` | `"upload"` | Keyed, Validatable | `helperText?, maxCount?: number` (default `1`)`, public?: boolean, accept?: string, dragger?: boolean` — `maxCount: 1` makes the value a single storage key, `> 1` an array of them; `public` lands objects under `pub/` instead of `priv/` and needs the backend's `vef.storage.allow_public_uploads` |
| `ButtonField` | `"button"` | (non-keyed) | `action?: "submit"\|"reset"\|"button"` (default `"submit"`)`, buttonType?: "primary"\|"default"\|"dashed"\|"text"\|"link"` (default `"primary"`)`, danger?: boolean, size?, block?: boolean, ghost?: boolean, shape?: "default"\|"round", icon?: DynamicIconName` |
| `DividerField` | `"divider"` | (non-keyed) | `title?: string, titlePlacement?: "left"\|"center"\|"right"` (default `"center"`)`, dashed?: boolean` |
| `AlertBlockField` | `"alert-block"` | (non-keyed) | `message?: string, description?: string, alertType?: "info"\|"success"\|"warning"\|"error", showIcon?: boolean` (default `true`)`, closable?: boolean, banner?: boolean` |
| `ParagraphField` | `"paragraph"` | (non-keyed) | `text?: string, textType?: "secondary"\|"success"\|"warning"\|"danger", strong?: boolean, italic?: boolean` |

Some props have no antd-mobile counterpart, so the mobile renderers ignore them: `size` on `textfield` / `number` / `select` / `textarea` / `switch`, `showSearch` on `select`, `optionType` / `buttonStyle` on `radio`, `controls` on `number`, `allowClear` on `textarea`, `ghost` on `button`, `dashed` on `divider`, and `banner` on `alert-block`. A mobile `button` is full-width unless `block` is stored as `false`.

## Container node interfaces

Every container extends the shared block base (`id`, `span?`, `flex?`, `columnWidth?`, `stack?`, `linkage?`).

| Interface | `type` | Own fields |
| --- | --- | --- |
| `CardSection` / `CollapseSection` (`SectionNode`) | `"section"` | `variant: "card" \| "collapse", title?: string, gap?: GapScale, children: Block[]` — `CollapseSection` adds `defaultCollapsed?: boolean` |
| `TabsNode` | `"tabs"` | `gap?: GapScale, tabs: TabItem[]` — `TabItem = { id: string; label: string; children: Block[] }` |
| `StackSubform` / `TableSubform` (`SubformNode`) | `"subform"` | Keyed. `variant: "stack" \| "table", label?: string, template: Block[], minRows?: number, maxRows?: number, addLabel?: string` — `StackSubform` adds `gap?: GapScale`; `TableSubform` adds `size?: "small" \| "middle" \| "large"` |
| `FlexNode` | `"flex"` | `children: Block[], direction?: "row" \| "column"` (default `"row"`)`, justify?: FlexJustify, align?: FlexAlign, wrap?: boolean` (default `false`)`, gap?: number` |
| `GridNode` | `"grid"` | `children: Block[], columns?: number` (default `2`)`, gap?: number, rowGap?: number` (default = `gap`) |

`FlexJustify = "start" | "center" | "end" | "between" | "around"`. `FlexAlign = "start" | "center" | "end" | "stretch"`.

## Field and container definition exports

One `FieldDefinition` constant per built-in type, registered by `createDefaultRegistry`/`createDefaultMobileRegistry` — see [Schema → Leaf fields](./schema.md#leaf-fields) and [Schema → Containers](./schema.md#containers) for the `type` / group mapping.

`textfieldDefinition`, `codeEditorDefinition`, `numberFieldDefinition`, `switchFieldDefinition`, `selectFieldDefinition`, `radioFieldDefinition`, `checkboxGroupFieldDefinition`, `textareaFieldDefinition`, `dateFieldDefinition`, `datetimeFieldDefinition`, `dateRangeFieldDefinition`, `uploadFieldDefinition`, `buttonDefinition`, `sectionDefinition`, `tabsDefinition`, `subformDefinition`, `flexDefinition`, `gridDefinition`, `dividerDefinition`, `alertBlockDefinition`, `paragraphDefinition`.

## Schema engine functions

| Export | Signature | Purpose |
| --- | --- | --- |
| `createEmptySchema` | `() => FormSchema` | Fresh document, empty `pc` presentation. |
| `createId` | `(prefix: IdPrefix) => string` | Mint a prefixed cuid2 node id. |
| `generateUniqueKey` | `(layer, baseKey, scope?) => string` | Scope-unique key allocation. |
| `nextUniqueKey` | `(used: Set<string>, baseKey: string) => string` | Same, against a pre-collected set. |
| `sanitizeKey` | `(key: string) => string` | Strip non-word characters. |
| `isKeyedNode` | `(node: Block) => node is KeyedNodeUnion` | — |
| `isKeyedField` | `(field: FormField) => field is KeyedFormField` | — |
| `isContainerNode` | `(node: Block) => node is ContainerNode` | — |
| `isLeafField` | `(node: Block) => node is FormField` | — |
| `walkNodes` | `(layer, visit: (node: Block, scope: readonly string[]) => void) => void` | Depth-first, every node. `scope` is the chain of enclosing subform keys (`[]` at the root). |
| `walkFields` | `(layer, visit: (field: FormField, scope: readonly string[]) => void) => void` | Depth-first, leaf fields only. |
| `findNode` / `findField` | `(layer, id: string) => Block \| undefined` / `FormField \| undefined` | — |
| `findParentContainer` | `(layer, blockId: string) => ContainerNode \| undefined` | — |
| `insertBlock` | `(layer, block: Block, target: DropTarget) => PresentationLayer` | — |
| `moveBlock` | `(layer, nodeId: string, target: DropTarget) => PresentationLayer` | — |
| `cloneBlock` | `(block: Block, allocateKey: ((base: string) => string) \| null) => Block` | — |
| `setSpan` | `(layer, blockId: string, span: number \| undefined) => PresentationLayer` | — |
| `setFlex` | `(layer, blockId: string, flex: FlexSlot \| undefined) => PresentationLayer` | — |
| `editField` | `(layer, fieldId: string, updater: (field: FormField) => FormField) => PresentationLayer` | — |
| `removeBlock` | `(layer, id: string) => PresentationLayer` | — |
| `updateNode` | `(layer, id: string, updater: (node: Block) => Block) => PresentationLayer` | — |
| `currentLayer` | `(schema: FormSchema, device: PresentationDevice) => PresentationLayer` | — |
| `emptyLayer` | `() => PresentationLayer` | — |
| `resolvePresentation` | `(schema, device) => PresentationLayer \| undefined` | — |
| `withPresentation` | `(schema, device, layer) => FormSchema` | — |
| `toRuntimeSchema` | `(schema, device) => RuntimeSchema \| undefined` | — |
| `validateSchema` | `(candidate: unknown, registries: DeviceRegistries) => ValidateSchemaResult` | `ValidateSchemaResult = { valid: boolean; schema?: FormSchema; issues: ValidationIssue[] }` |
| `inferColumnType` | `(field: FormField) => ColumnDataType` | — |
| `toColumnDefinitions` | `(schema: FormSchema) => ColumnDefinition[]` | `ColumnDefinition = { key, columnType, maxLength?, precision? }` |
| `toFormFieldDefinitions` | `(schema: FormSchema) => FormFieldDefinition[]` | `FormFieldDefinition = { key, kind: FieldKind, label, options? }`; `FieldKind = "input" \| "textarea" \| "select" \| "number" \| "date" \| "upload"` |
| `convertPresentation` | `(pc: PresentationLayer, rules: ConversionRegistry, target: FormFieldRegistry) => { layer: PresentationLayer; report: ConversionReport }` | `ConversionReport = { convertedCount: number; dropped: Array<{ sourceType, reason, label? }> }` |
| `createDefaultConversionRules` | `() => ConversionRegistry` | — |
| `ConversionRegistry` (class) | `.register({ type, convert }): this` / `.convert(block, ctx): BlockConversion` | `BlockConversion = { status: "converted"; block } \| { status: "unwrapped"; blocks } \| { status: "dropped"; sourceType; reason }` |
| `BlockConversionRule` | `{ type: Block["type"]; convert: (source: Block, ctx: ConversionContext) => BlockConversion }` | The shape `.register()` takes — one rule per source block type. |
| `ConversionContext` | `{ target: FormFieldRegistry; convertBlocks: (blocks: Block[]) => Block[] }` | Passed to `convert`; `convertBlocks` recurses a container's body through the same rule set. |

`DropTarget = { kind: "beside"; anchorId: string; side: "before" \| "after" } | { kind: "container"; containerId: string; tabIndex?: number } | { kind: "append" }`.

## Linkage

See [Linkage](./linkage.md) for the full model. Exported surface:

| Export | Signature / Shape |
| --- | --- |
| `validateLinkageSchema` | `(layer: PresentationLayer, formLinkage?: FieldLinkage) => LinkageValidationResult` (`{ issues: ValidationIssue[] }`) |
| `resolveLinkageEvaluators` | `(overrides?: LinkageEvaluators) => Required<LinkageEvaluators>` |
| `defaultEvaluateExpression` | `(source, values, context?) => boolean` |
| `defaultEvaluateAssignExpression` | `(source, values, context?) => unknown` |
| `defaultEvaluateScriptAction` | `(source, values, context?) => LinkageScriptResult \| void` |
| `isStateAction` / `isEffectAction` | `(action: FieldLinkageAction) => action is StateAction / EffectAction` |
| `isFieldEventTriggerKind` | `(kind: LinkageTriggerKind) => boolean` |
| `getFieldPermission` | `(permissions: Record<string, FieldPermission> \| undefined, key: string) => FieldPermission \| undefined` — own-property-guarded lookup (a field keyed like an `Object` prototype member never reads a prototype slot). Added in v2.10.0 |
| `isWritableFieldPermission` | `(permission: FieldPermission \| undefined) => boolean` — `true` for `undefined` (no clamp entry), `"editable"`, and `"required"`; `false` for `"visible"` / `"hidden"`. Added in v2.10.0 |
| `STATE_ACTION_TYPES` | `readonly StateActionType[]` (`show, hide, enable, disable, require, optional, assign, script`) |
| `EFFECT_ACTION_TYPES` | `readonly EffectActionType[]` (`set_field, set_variable, refresh_data_source, alert, api_call, navigate, submit, reset`) |
| `LINKAGE_ACTION_TYPES` | `readonly LinkageActionType[]` — the union of the two above |
| `KEYED_ONLY_ACTIONS` | `ReadonlySet<LinkageActionType>` (`require, optional, assign`) |
| `FIELD_TRIGGER_KINDS` | `readonly LinkageTriggerKind[]` (`condition, change, focus, blur, click`) — legal on a field / container rule |
| `FORM_TRIGGER_KINDS` | `readonly LinkageTriggerKind[]` (`condition, load, beforeSubmit, afterSubmit`) — legal on a form-scope rule |
| `FIELD_EVENT_TRIGGER_KINDS` | `readonly LinkageTriggerKind[]` (`change, focus, blur, click`) |
| `LINKAGE_OPERATORS` | `readonly LinkageOperator[]` (`eq, ne, gt, lt, gte, lte, contains, empty, notEmpty`) — semantics in [Linkage → Operators](./linkage.md#operators) |
| `ALERT_LEVELS` | `readonly LinkageAlertLevel[]` (`info, success, warning, error`) |

Context and dispatch shapes:

| Type | Shape |
| --- | --- |
| `EvaluationContext` | `{ variables?, user?, node?, applicant?, globals? }`, each `Record<string, unknown>` — bound as `$vars` / `$user` / `$node` / `$applicant` / `$globals`; see [Linkage → Host context and system variables](./linkage.md#host-context-and-system-variables) |
| `LinkageContextSource` | `{ key: string; label: string }` — a system variable: `key` is the full scope path (`"$applicant.departmentId"`), stored verbatim as a leaf's `sourceKey` |
| `EffectDispatchContext` | `{ values: Record<string, unknown>; resolveValue: (value: LinkageActionValue) => unknown; resolveRequest: (request: RemoteDataSourceRequest) => ResolvedDataSourceRequest }` — scoped to the firing rule's value scope |
| `LinkageScriptResult` | `{ hidden?: boolean; disabled?: boolean; required?: boolean; value?: unknown }` — a `script` action's partial state patch |

Other types: `FieldLinkage`, `FieldLinkageRule`, `FieldLinkageAction`, `FieldLinkageDefaults`, `LinkageTrigger`, `LinkageTriggerKind`, `LinkageCondition` (`LinkageConditionLeaf | LinkageConditionGroup | LinkageConditionExpression`), `LinkageOperator`, `StateAction`, `StateActionType`, `EffectAction`, `EffectActionType`, `LinkageActionType`, `LinkageActionValue`, `LinkageAlertLevel`, `ConditionRetrigger` (`"edge" | "always"`), `LinkageEvaluators`, `FieldPermission` (`"hidden" | "visible" | "editable" | "required"`).

## Validation

| Export | Signature |
| --- | --- |
| `formatIssueMessage` | `(code: ValidationIssueCode, params?) => string` — every issue message flows through this |
| `SchemaIssue` (type) | `{ path: string; code: string; severity: ValidationSeverity; message: string }` — any diagnostic the editor shows, its own or a host's |
| `ValidationIssue` (type) | `SchemaIssue & { code: ValidationIssueCode; ruleId?: string }` — the editor's own; `ruleId` names the rule a rule-scoped linkage issue belongs to |
| `SchemaValidator` (type) | `(schema: FormSchema) => readonly SchemaIssue[]` — the `validate` prop; see [Embedding → Host diagnostics](./embedding.md#host-diagnostics) |
| `ValidationIssueCode` (type) | Closed union of the codes below |
| `ValidationSeverity` (type) | `"error" \| "warning"` |

`message` is pre-rendered Chinese product copy; program against `code` and `path`, which are stable across locales. An issue's `path` is either a presentation path (`presentations.pc.children[0].key`), a node path (`node[Field_1].linkage.rules[0]`), a form-level path (`variables[1].name`, `dataSources[0].request`, `schema.linkage.rules[0]`), or `linkage` for a dependency cycle.

### Validation issue codes

*Error* means the schema is structurally broken and fails validation; *warning* marks legitimate mid-authoring state (incomplete or dangling configuration) that round-trips through export → import.

| Code | Severity | Raised when |
| --- | --- | --- |
| `schema_not_object` | error | The candidate is not a plain object. |
| `id_required` | error | The schema, a node, a tab, or a rule lacks a non-empty string `id`. |
| `duplicate_id` | error | A node or tab id repeats within one presentation. |
| `version_unsupported` | error | `version` is not `2`. |
| `presentation_not_object` | error | `presentations`, or one device's layer, is not an object. |
| `variables_invalid` | error | `variables` is not an array of declarations with unique non-empty ids, unique identifier-shaped names, and a known `type`. |
| `data_sources_invalid` | error | `dataSources` is not an array of entries with unique non-empty ids, a string `name`, and a valid `static` / `remote` payload and mapping. |
| `block_not_object` | error | A block is not a plain object. |
| `children_not_array` | error | A body — `children`, `tabs`, `template`, or a condition group's `children` — is not an array. |
| `tabs_empty` | error | A `tabs` container has no tab. |
| `tab_malformed` | error | A tab is not an object, or its `label` is not a string. |
| `type_required` | error | A block has no non-empty `type`. |
| `unknown_field_type` | error | The `type` is not registered on that device's registry. |
| `key_required` | error | A keyed field type, or a subform, has no key. |
| `stray_key` | error | A non-keyed field type carries a key. |
| `stray_key_on_container` | error | A layout container (`section` / `tabs` / `flex` / `grid`) carries a key. |
| `duplicate_key` | error | A key repeats within one value scope. |
| `key_invalid_charset` | error | A key holds anything other than letters, digits, and underscores. |
| `span_invalid` | error | `span` is not an integer in `1..24`. |
| `flex_invalid` | error | A malformed `flex` slot, or a flex container's `direction` / `justify` / `align` / `wrap` out of range. |
| `column_width_invalid` | error | `columnWidth` is not a positive number. |
| `stack_invalid` | error | A malformed `stack` slot. |
| `gap_invalid` | error | A stack container's `gap` is not a `GapScale`, or a flex / grid `gap` / `rowGap` is not a non-negative integer. |
| `columns_invalid` | error | A grid's `columns` is not an integer in `1..24`. |
| `variant_invalid` | error | A section's `variant` is not `"card"` / `"collapse"`. |
| `subform_variant_invalid` | error | A subform's `variant` is not `"stack"` / `"table"`. |
| `title_invalid` | error | A section's `title` is not a string. |
| `display_text_invalid` | error | `label` / `placeholder` / `helperText` / `title` / `text` / `message` is not a string. |
| `rows_bound_invalid` | error | `minRows` / `maxRows` is not a non-negative integer, or `minRows` exceeds `maxRows`. |
| `subform_table_column` | warning | A `table` subform's template holds a container or a non-keyed block; the renderer skips it. |
| `validate_malformed` | error | `validate` is not an object. |
| `validate_range_invalid` | error | `minLength` exceeds `maxLength`, or `min` exceeds `max`. |
| `pattern_invalid` | error | `pattern` is not a compilable regular expression. |
| `data_source_invalid` | error | A field's `dataSource` is malformed — an unknown `kind`, a malformed option list, or a malformed mapping. |
| `data_source_ref_unknown` | warning | A `ref` names no declared data source. |
| `request_malformed` | error | A request is not an object, or its `resource` / `action` is not a string. |
| `request_incomplete` | warning | A request's `resource` and/or `action` is empty. Reported once per request, naming what is missing — at the request when both are, at the empty one otherwise. |
| `linkage_malformed` | error | `linkage`, or its `defaults`, is not an object. |
| `rules_not_array` | error | `rules` is not an array. |
| `rule_malformed` | error | A rule is not an object. |
| `trigger_malformed` | error | A trigger is not an object with a string `kind`. |
| `trigger_kind_invalid` | error | The trigger kind is not legal at the rule's scope. |
| `trigger_requires_keyed_leaf` | error | A `change` trigger on anything but a keyed leaf field. |
| `condition_malformed` | error | A condition is not an object, or a leaf's `sourceKey` / an expression's `source` is not a string. |
| `condition_kind_invalid` | error | A condition's `kind` is not `leaf` / `group` / `expression`. |
| `logic_invalid` | error | A group's `logic` is not `"all"` / `"any"`. |
| `condition_group_empty` | warning | A group has no children: under `all` the rule always applies, under `any` it never does. |
| `operator_invalid` | error | A leaf's `operator` is not one of `LINKAGE_OPERATORS`. |
| `source_key_empty` | warning | A leaf has no source selected. |
| `source_key_unresolved` | warning | A leaf's form key (plain or `$form.`) names no keyed node in the rule's value scope. |
| `source_scope_unknown` | warning | A leaf's `$` root is none of `$form` / `$vars` / `$user` / `$node` / `$applicant` / `$globals`. |
| `source_empty` | warning | An expression condition, an expression value, or a script is empty. |
| `actions_not_array` | error | `actions` is not an array. |
| `actions_empty` | warning | A rule has no actions. |
| `action_malformed` | error | An action is not an object, or its `targetKey` / `variable` / `dataSourceId` / `source` is not a string. |
| `action_unknown_type` | error | An action `type` is not one of `LINKAGE_ACTION_TYPES`. |
| `state_action_on_edge_trigger` | error | A state action under an edge trigger. |
| `state_action_on_form_scope` | error | A state action in a form-scope rule. |
| `action_requires_keyed_leaf` | error | `require` / `optional` / `assign` on anything but a keyed leaf field. |
| `defaults_requires_keyed_leaf` | error | `defaults.required` on anything but a keyed leaf field. |
| `defaults_on_form_scope` | error | A `defaults` block on the form-scope linkage. |
| `default_hidden_unreachable` | warning | A block is hidden by default and none of its own condition rules shows it. |
| `target_key_empty` | warning | A `set_field` has no target selected. |
| `target_key_unresolved` | warning | A `set_field` target names no keyed node in the rule's value scope. |
| `variable_empty` | warning | A `set_variable` has no variable name. |
| `data_source_id_empty` | warning | A `refresh_data_source` action, or a `ref` option source, has no data source selected. |
| `value_malformed` | error | An action value is not a `literal` / `expression` shape. |
| `alert_level_invalid` | error | An `alert`'s `level` is not one of `ALERT_LEVELS`. |
| `retrigger_invalid` | error | `retrigger` is not `"edge"` / `"always"`. |
| `retrigger_ignored` | warning | `retrigger` on an effect under an edge trigger, where it has no effect. |
| `self_reference` | error | A value-writing rule's condition reads the very field the rule writes. |
| `cycle_detected` | error | Value-writing rules form a dependency loop; the message names it. |

## Chrome

`ContainerChromeSet` is the per-device set of presentational shells for structural containers, installed via `FormFieldRegistry.setContainerChrome`:

| Member | Props type |
| --- | --- |
| `Section` | `SectionChromeProps = { title?: ReactNode; variant?: "card" \| "collapse"; defaultCollapsed?: boolean; children: ReactNode }` |
| `Tabs` | `TabsChromeProps = { items: ChromeTabItem[]; activeKey?: string; onChange?: (key: string) => void }` — `ChromeTabItem = { key: string; label: ReactNode; children: ReactNode }` |
| `Subform` | `SubformChromeProps = { title?: ReactNode; errors?: string[]; children: ReactNode }` — a custom chrome should render `errors`: a subform mounts **one** field for the whole array, so its own errors ("at least one row" on a required subform, a `table` variant's rolled-up row error) have no other slot and would otherwise block submission with nothing on screen. Both built-in chromes render it under the body through the same footer a leaf field uses. |
| `SubformRow` | `SubformRowChromeProps = { removeControl?: ReactNode; children: ReactNode }` |
| `AddButton` | `AddControlChromeProps = { label: ReactNode; onClick: () => void }` |
| `RemoveButton` | `RemoveControlChromeProps = { onClick: () => void }` |

`flex` and `grid` are pure CSS layout and use no chrome — identical on both devices.
