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
| `onPublish` | `(schema: FormSchema) => void` | Runs a validation pass first (errors block, warnings ask for confirmation); publish button is not rendered when omitted. |
| `publishText` | `string` | Defaults to `"发布"`. Ignored when `onPublish` is omitted. |
| `publishLoading` | `boolean` | Loading state on the publish button. Ignored when `onPublish` is omitted. |

### `FormEditorProviderProps`

| Prop | Type | Notes |
| --- | --- | --- |
| `initialSchema` | `FormSchema` | Read once, on mount. |
| `registries` | `Partial<DeviceRegistries>` | Per-device registry override; an omitted device falls back to `registry`, then the built-in defaults. Read once, on mount. |
| `registry` | `FormFieldRegistry` | Shorthand for one registry shared by both devices. Read once, on mount. |
| `evaluators` | `LinkageEvaluators` | Forwarded to the live preview — see [Linkage](./linkage.md#pluggable-evaluators). |
| `dataSourceResolver` | `DataSourceResolver` | Forwarded to the live preview — see [Embedding](./embedding.md#loading-remote-options). |
| `evaluationContext` | `EvaluationContext` | Forwarded to the live preview — see [Linkage](./linkage.md#host-context). |
| `contextSources` | `LinkageContextSource[]` | Design-time pick list for the condition builder — see [Linkage](./linkage.md#host-context). |
| `onSchemaChange` | `(schema: FormSchema) => void` | Fires on every committed edit. |
| `apiRef` | `Ref<FormEditorApi>` | See below. |
| `children` | `ReactNode` | — |

### `FormEditorApi`

| Member | Signature |
| --- | --- |
| `getSchema` | `() => FormSchema` |
| `setSchema` | `(schema: FormSchema) => void` — import semantics; resets the undo timeline |
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
| `schema` | `FormSchema` | Required. |
| `device` | `PresentationDevice` (`"pc" \| "mobile"`) | Default `"pc"`. |
| `defaultValues` | `Record<string, unknown>` | — |
| `disabled` | `boolean` | — |
| `fieldPermissions` | `Record<string, FieldPermission>` | Server-resolved clamp — see [Linkage](./linkage.md#field-permission-clamp). |
| `evaluators` | `LinkageEvaluators` | See [Linkage](./linkage.md#pluggable-evaluators). |
| `dataSourceResolver` | `DataSourceResolver` | See [Embedding](./embedding.md#loading-remote-options). |
| `evaluationContext` | `EvaluationContext` | See [Linkage](./linkage.md#host-context). |
| `onSubmit` | `(values: Record<string, unknown>) => void \| Promise<void>` | Runs after schema-driven validation passes. |
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
| `formConfigOpen` / `formConfigTab` | `boolean` / `FormConfigTabId` | `FormConfigTabId = "outline" \| "form" \| "variables" \| "dataSources" \| "linkage"` |
| `past` / `future` | `HistoryEntry[]` | `HistoryEntry = { schema: FormSchema; device: EditorDeviceMode }` |
| `insertField`, `moveNode`, `removeNode`, `duplicateNode` | actions | Structural edits, each one checkpointed undo step. |
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
| `FieldShell` | `{ children, domId, errors?, helperText?, label, labelPosition?, required?, labelledBy? }` — shared label/control/helper/error layout. `labelledBy` (`"control"` default \| `"group"`) picks how the label associates with what it names: `"control"` emits `<label for={domId}>`, which needs `domId` on a labelable element; `"group"` is for a field that renders a *set* rather than one control (`radio`, `checkbox-group`, `code-editor`, `upload`) — `for` is inert against their wrapper, so the label carries an id and the body becomes a `role="group"` pointing back at it with `aria-required` / `aria-invalid`. Without it such a field has no accessible name at all: a screen reader announces the first option and nothing about the question. |
| `Label` | `{ children, htmlFor?, position?: LabelPosition, required?, title? }` |

## Data sources

| Export | Signature |
| --- | --- |
| `DataSourceProvider` | `(props: { children, dataSources?: FormDataSource[], resolver?: DataSourceResolver, versions?: Record<string, number> }) => ReactElement` — installed by `FormEditor` and `FormRenderer`. |
| `useFieldOptions` | `(source: FieldOptionSource \| undefined) => { options: FieldOption[]; loading: boolean; error: boolean }` |
| `DataSourceResolver` (type) | `{ resolve: (request: ResolvedDataSourceRequest, mapping?: RemoteOptionMapping) => Promise<FieldOption[]> }` — a resolver only ever sees evaluated parameters |
| `noopDataSourceResolver` | `DataSourceResolver` whose `resolve` always returns `[]` — the default. |
| `RemoteDataSourceRequest` (type) | `{ resource: string; action: string; version?: string; params?: Record<string, DynamicValue> }` — the schema shape, carrying bindings |
| `ResolvedDataSourceRequest` (type) | `{ resource: string; action: string; version?: string; params?: Record<string, unknown> }` — the runtime shape, carrying data; see [Embedding → Bound parameters](./embedding.md#bound-parameters) |
| `DynamicValue` (type) | `{ kind: "literal"; value: unknown } \| { kind: "expression"; source: string }` — one declaration shared with `LinkageActionValue` |
| `isDynamicValue` | `(value: unknown) => value is DynamicValue` — narrowing guard for values that crossed a serialization boundary |
| `RemoteOptionMapping` (type) | `{ labelKey?: string; valueKey?: string; disabledKey?: string; descriptionKey?: string }` — all default to `"label"` / `"value"`. |

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
| `FormVariable` | `{ id, name, type: "string" \| "number" \| "boolean" \| "json", defaultValue? }` |

## Leaf field interfaces

Every leaf field extends the shared base: `{ id: string; label?: string; labelPosition?: LabelPosition; span?: number; flex?: FlexSlot; columnWidth?: number; stack?: StackSlot; linkage?: FieldLinkage }`. Keyed fields additionally carry `{ key: string; columnType?: ColumnDataType }`; `Validatable` fields additionally carry `{ validate?: {...} }` (see [Schema types](#schema-types)). Only each interface's **own** fields are listed below.

| Interface | `type` | Extends | Own fields |
| --- | --- | --- | --- |
| `TextfieldField` | `"textfield"` | Keyed, Validatable | `placeholder?, helperText?, prefixIcon?: DynamicIconName, size?: "small"\|"middle"\|"large", allowClear?: boolean, maxLength?: number, inputType?: "text"\|"password"` |
| `CodeEditorField` | `"code-editor"` | Keyed, Validatable | `placeholder?, helperText?, language?: CodeEditorLanguage, minHeight?: number, maxHeight?: number, showLineNumbers?: boolean, showFoldGutter?: boolean, tabSize?: number` |
| `NumberField` | `"number"` | Keyed, Validatable | `placeholder?, helperText?, min?: number, max?: number, step?: number, size?, prefix?: string, suffix?: string, precision?: number, controls?: boolean` (default shown) |
| `SwitchField` | `"switch"` | Keyed (not Validatable) | `helperText?, onText?: string, offText?: string, size?: "default"\|"small"` |
| `SelectField` | `"select"` | Keyed, Validatable | `placeholder?, helperText?, allowClear?: boolean, size?, showSearch?: boolean, dataSource?: FieldOptionSource` |
| `RadioField` | `"radio"` | Keyed, Validatable | `helperText?, dataSource?: FieldOptionSource, optionType?: "default"\|"button", buttonStyle?: "outline"\|"solid", direction?: "horizontal"\|"vertical"` |
| `CheckboxGroupField` | `"checkbox-group"` | Keyed, Validatable | `helperText?, dataSource?: FieldOptionSource, direction?: "horizontal"\|"vertical"` |
| `TextareaField` | `"textarea"` | Keyed, Validatable | `placeholder?, helperText?, rows?: number, autoSize?: boolean, maxLength?: number, showCount?: boolean, size?, allowClear?: boolean` |
| `DateField` | `"date"` | Keyed, Validatable | `placeholder?, helperText?, allowClear?: boolean` (default `true`) |
| `DatetimeField` | `"datetime"` | Keyed, Validatable | `placeholder?, helperText?, allowClear?: boolean` (default `true`) |
| `DateRangeField` | `"daterange"` | Keyed, Validatable | `helperText?, allowClear?: boolean` (default `true`) |
| `UploadField` | `"upload"` | Keyed, Validatable | `helperText?, maxCount?: number` (default `1`)`, public?: boolean, accept?: string, dragger?: boolean` — `maxCount: 1` makes the value a single storage key, `> 1` an array of them; `public` lands objects under `pub/` instead of `priv/` and needs the backend's `vef.storage.allow_public_uploads` |
| `ButtonField` | `"button"` | (non-keyed) | `action?: "submit"\|"reset"\|"button"` (default `"submit"`)`, buttonType?: "primary"\|"default"\|"dashed"\|"text"\|"link"` (default `"primary"`)`, danger?: boolean, size?, block?: boolean, ghost?: boolean, shape?: "default"\|"round", icon?: DynamicIconName` |
| `DividerField` | `"divider"` | (non-keyed) | `title?: string, titlePlacement?: "left"\|"center"\|"right"` (default `"center"`)`, dashed?: boolean` |
| `AlertBlockField` | `"alert-block"` | (non-keyed) | `message?: string, description?: string, alertType?: "info"\|"success"\|"warning"\|"error", showIcon?: boolean` (default `true`)`, closable?: boolean, banner?: boolean` |
| `ParagraphField` | `"paragraph"` | (non-keyed) | `text?: string, textType?: "secondary"\|"success"\|"warning"\|"danger", strong?: boolean, italic?: boolean` |

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
| `FIELD_TRIGGER_KINDS` / `FORM_TRIGGER_KINDS` | `readonly LinkageTriggerKind[]` — legal triggers per rule scope |
| `FIELD_EVENT_TRIGGER_KINDS` | `readonly LinkageTriggerKind[]` (`change, focus, blur, click`) |
| `LINKAGE_OPERATORS` | `readonly LinkageOperator[]` (`eq, ne, gt, lt, gte, lte, contains, empty, notEmpty`) |
| `ALERT_LEVELS` | `readonly LinkageAlertLevel[]` (`info, success, warning, error`) |

Types: `FieldLinkage`, `FieldLinkageRule`, `FieldLinkageAction`, `FieldLinkageDefaults`, `LinkageTrigger`, `LinkageTriggerKind`, `LinkageCondition` (`LinkageConditionLeaf | LinkageConditionGroup | LinkageConditionExpression`), `LinkageOperator`, `StateAction`, `StateActionType`, `EffectAction`, `EffectActionType`, `LinkageActionType`, `LinkageActionValue`, `LinkageAlertLevel`, `ConditionRetrigger` (`"edge" | "always"`), `LinkageScriptResult`, `LinkageEvaluators`, `EvaluationContext`, `LinkageContextSource`, `EffectDispatchContext`, `FieldPermission` (`"hidden" | "visible" | "editable" | "required"`).

## Validation

| Export | Signature |
| --- | --- |
| `formatIssueMessage` | `(code: ValidationIssueCode, params?) => string` — every issue message flows through this |
| `ValidationIssue` (type) | `{ path: string; code: ValidationIssueCode; severity: ValidationSeverity; message: string; ruleId?: string }` |
| `ValidationIssueCode` (type) | Closed union of several dozen stable machine-readable codes (schema envelope, block tree, layout, linkage, …) |
| `ValidationSeverity` (type) | `"error" \| "warning"` |

`message` is pre-rendered Chinese product copy; program against `code` and `path`, which are stable across locales.

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
