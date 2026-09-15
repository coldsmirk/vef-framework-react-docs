---
title: Form Editor API 参考
description: "@vef-framework-react/form-editor 的精简导出、属性与类型表格——包入口点导出的每一个符号。"
---

# Form Editor API 参考

本页记录的每一项导出都来自 `@vef-framework-react/form-editor` 的包入口点（`import { ... } from "@vef-framework-react/form-editor"`）——不涉及任何内部模块路径。叙述性说明见 [Overview](./overview.md)、[Embedding](./embedding.md)、[Schema](./schema.md) 和 [Linkage](./linkage.md)。

## FormEditor

| 导出 | 结构 |
| --- | --- |
| `FormEditor` | 预先组合好的组件。通过 `Object.assign` 挂载了 `.Provider`、`.Shell`、`.Workspace`、`.Stage`、`.Toolbar`、`.Palette`、`.Properties`——见 [Embedding](./embedding.md#组合你自己的外壳)。 |
| `FormEditorProvider`（= `FormEditor.Provider`） | 上下文根节点：store + 注册表 + 预览运行时。属性：`FormEditorProviderProps`。 |
| `FormEditorShell`（= `FormEditor.Shell`） | 外壳框架（布局测量、设备上下文、拖放、快捷键）。属性：`FormEditorShellProps`（仅 `children`）。 |
| `FormEditorWorkspace`（= `FormEditor.Workspace`） | 组件面板 / 画布 / 属性面板区域。属性：`{ children: ReactNode }`。 |
| `FormEditorStage`（= `FormEditor.Stage`） | 画布列。无属性。 |
| `FormEditorToolbar`（= `FormEditor.Toolbar`） | 默认工具栏。属性：`ToolbarProps`。 |

### `FormEditorProps`

在下方 `FormEditorProviderProps` 的基础上扩展，额外增加：

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `brand` | `ToolbarBrand`（`{ name?, tag?, icon? }`） | 工具栏品牌标识；默认使用框架自身的名称/图标。 |
| `onPublish` | `(schema: FormSchema) => void` | 先执行一次校验（error 会阻止发布，warning 会请求确认）；省略时不渲染发布按钮。 |
| `publishText` | `string` | 默认为 `"发布"`。当省略 `onPublish` 时被忽略。 |
| `publishLoading` | `boolean` | 发布按钮的加载状态。当省略 `onPublish` 时被忽略。 |

### `FormEditorProviderProps`

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `initialSchema` | `FormSchema` | 仅在挂载时读取一次。 |
| `registries` | `Partial<DeviceRegistries>` | 按设备划分的注册表覆盖项；省略的设备会回退到 `registry`，再回退到内置默认值。仅在挂载时读取一次。 |
| `registry` | `FormFieldRegistry` | 两种设备共用一份注册表的简写形式。仅在挂载时读取一次。 |
| `evaluators` | `LinkageEvaluators` | 转发给实时预览——见 [Linkage](./linkage.md#可插拔求值器)。 |
| `dataSourceResolver` | `DataSourceResolver` | 转发给实时预览——见 [Embedding](./embedding.md#加载远程选项)。 |
| `evaluationContext` | `EvaluationContext` | 转发给实时预览——见 [Linkage](./linkage.md#宿主上下文)。 |
| `contextSources` | `LinkageContextSource[]` | 条件构建器的设计时选择列表——见 [Linkage](./linkage.md#宿主上下文)。 |
| `onSchemaChange` | `(schema: FormSchema) => void` | 每次已提交的编辑都会触发。 |
| `apiRef` | `Ref<FormEditorApi>` | 见下文。 |
| `children` | `ReactNode` | — |

### `FormEditorApi`

| 成员 | 签名 |
| --- | --- |
| `getSchema` | `() => FormSchema` |
| `setSchema` | `(schema: FormSchema) => void` —— 导入语义；会重置撤销时间线 |
| `undo` / `redo` | `() => void` |
| `canUndo` / `canRedo` | `() => boolean` |
| `selectNode` | `(nodeId: string \| null) => void` |
| `setDevice` | `(device: EditorDeviceMode) => void` |
| `setViewMode` | `(mode: EditorViewMode) => void` |

### `ToolbarBrand` / `ToolbarProps`

| 类型 | 结构 |
| --- | --- |
| `ToolbarBrand` | `{ name?: string; tag?: string; icon?: ReactNode }` |
| `ToolbarProps` | `{ brand?: ToolbarBrand; onPublish?: (schema: FormSchema) => void; publishText?: string; publishLoading?: boolean }` |

## FormRenderer

| 导出 | 结构 |
| --- | --- |
| `FormRenderer` | 运行时组件。属性：`FormRendererProps`。 |

### `FormRendererProps`

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `schema` | `FormSchema` | 必填。 |
| `device` | `PresentationDevice`（`"pc" \| "mobile"`） | 默认 `"pc"`。 |
| `defaultValues` | `Record<string, unknown>` | — |
| `disabled` | `boolean` | — |
| `fieldPermissions` | `Record<string, FieldPermission>` | 服务端解析的钳制——见 [Linkage](./linkage.md#字段权限钳制)。 |
| `evaluators` | `LinkageEvaluators` | 见 [Linkage](./linkage.md#可插拔求值器)。 |
| `dataSourceResolver` | `DataSourceResolver` | 见 [Embedding](./embedding.md#加载远程选项)。 |
| `evaluationContext` | `EvaluationContext` | 见 [Linkage](./linkage.md#宿主上下文)。 |
| `onSubmit` | `(values: Record<string, unknown>) => void \| Promise<void>` | 在 schema 驱动的校验通过后运行。 |
| `apiRef` | `Ref<FormRendererApi>` | 见下文。 |
| `containOverlays` | `boolean` | 默认 `false`。仅限移动端；将浮层选择器固定在渲染器自身的盒子内。 |

### `FormRendererApi`

| 成员 | 签名 |
| --- | --- |
| `submit` | `() => Promise<void>` —— 与 schema 中 `submit` 按钮相同的校验流程 |
| `reset` | `() => void` |
| `getValues` | `() => Record<string, unknown>` —— 原始（RAW）的实时表单状态，包含隐藏字段播种的默认值，以及只读（被钳制为不可写）的值 |
| `getSubmitValues` | `() => Record<string, unknown>` —— 提交流水线此刻将交给 `onSubmit` 的精确内容：实时值经过同一套载荷过滤（丢弃实际隐藏的字段、排除被钳制为不可写的 key、子表单逐行递归处理），但不运行校验，也不走提交生命周期。在 v2.10.0 中与[字段权限钳制](./linkage.md#字段权限钳制)一同新增 |

## 字段注册表

| 导出 | 签名 |
| --- | --- |
| `createDefaultRegistry` | `() => FormFieldRegistry` —— PC 端注册表：内置字段/容器定义 + antd 容器外观 |
| `createDefaultMobileRegistry` | `() => FormFieldRegistry` —— antd-mobile 注册表：`mobileFieldDefinitions` + antd-mobile 容器外观 |
| `registerDefaults` | `(registry: FormFieldRegistry) => void` —— 将内置字段集合 + PC 外观应用到一个已存在的注册表上 |
| `DeviceRegistries`（类型） | `{ pc: FormFieldRegistry; mobile: FormFieldRegistry }` |

### `FormFieldRegistry`

| 成员 | 签名 | 说明 |
| --- | --- | --- |
| `register` | `(definition: FieldDefinition) => void` | 以 `definition.config.type` 为键。 |
| `unregister` | `(type: string) => boolean` | — |
| `get` | `(type: string) => FieldDefinition \| undefined` | — |
| `has` | `(type: string) => boolean` | — |
| `list` | `() => FieldDefinition[]` | — |
| `registerPropertyEntry` | `(type: EntryType, component: FC<EntryComponentProps>) => void` | 设计时的属性面板渲染器。 |
| `getPropertyEntry` | `(type: EntryType) => FC<EntryComponentProps> \| undefined` | 当返回 `undefined` 时，回退到面板静态导入的内置项。 |
| `setContainerChrome` | `(chrome: ContainerChromeSet) => void` | — |
| `getContainerChrome` | `() => ContainerChromeSet` | 未安装时抛出异常。 |
| `subscribe` | `(listener: () => void) => () => void` | 每次变更都会通知。 |
| `getRevision` | `() => number` | 单调递增；供 `useSyncExternalStore` 做快照使用。 |

## 属性条目（Property entries）

内置的属性条目渲染器组件（均为 `FC<EntryComponentProps>`），可按 `EntryType` 解析：

| `EntryType` | 组件 |
| --- | --- |
| `"text"` | `TextEntry` |
| `"key"` | `KeyEntry` |
| `"number"` | `NumberEntry` |
| `"checkbox"` | `CheckboxEntry` |
| `"select"` | `SelectEntry` |
| `"icon"` | `IconEntry` |
| `"options-editor"` | `OptionsSourceEntry` |
| `"linkage-rules"` | `LinkageRulesEntry` |

`EntryComponentProps`：`{ entry: PropertyEntry; field: FormField; schema: FormSchema; onChange: (value: unknown) => void }`。`PropertyEntryTypeMap` 是 `EntryType` 所键控的开放接口——通过 `declare module` 扩充它，即可搭配 `registerPropertyEntry` 注册一种新的条目类型。

## 定义构建函数

| 导出 | 签名 |
| --- | --- |
| `defineFieldDefinition` | `<TField extends FormField, TValue = unknown>(definition: { config: FieldDefinitionConfig; Component: FC<FieldComponentProps<TField, TValue>>; properties: PropertiesDescriptor }) => FieldDefinition` |
| `defineContainerDefinition` | `(definition: { config: FieldDefinitionConfig }) => FieldDefinition` —— 没有 `Component` 插槽（容器是结构化渲染的） |
| `definePropertyEntry` | `<TField extends FormField, TValue>(entry: PropertyEntry<TField, TValue>) => PropertyEntry` —— 在声明处就固定条目的字段/值类型 |

### `FieldDefinitionConfig`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `type` | `Block["type"]` | 判别字段。 |
| `name` | `string` | 组件面板中展示的名称。 |
| `group` | `FieldGroup`（`"basic-input" \| "selection" \| "date-file" \| "container" \| "action" \| "presentation"`） | 组件面板分类。 |
| `keyed` | `boolean` | 该字段是否需要一个唯一的数据绑定 `key`。 |
| `icon` | `DynamicIconName` | 可选；组件面板卡片/属性面板标题图标。 |
| `iconUrl` | `string` | 可选。 |
| `create` | `() => FieldCreateResult` | 返回该类型专属默认值的工厂函数；`id` / `key` 由引擎铸造。 |

### `FieldComponentProps<TField, TValue>`

| 字段 | 类型 |
| --- | --- |
| `field` | `TField` |
| `value` | `TValue` |
| `onChange` | `(value: TValue) => void` |
| `errors` | `string[] \| undefined` |
| `domId` | `string` |
| `disabled` | `boolean \| undefined` |
| `required` | `boolean \| undefined` |
| `labelPosition` | `LabelPosition \| undefined` |

`FieldCreateResult = DistributedOmit<Block, "id" | "key">`。`FieldDefinition = { config: FieldDefinitionConfig; Component?: FC<FieldComponentProps>; properties: PropertiesDescriptor }`。

### `PropertyEntry` / `PropertiesDescriptor`

| 类型 | 结构 |
| --- | --- |
| `PropertyEntry<TField, TValue>` | `{ id, label, type: EntryType, options?: PropertyEntryOption[], visible?: (field: TField) => boolean, readOnly?, description?, placeholder?, read: (field: TField) => TValue, write: (field: TField, value: TValue) => TField }` |
| `PropertyEntryOption` | `{ value: string; label: string }` |
| `PropertyGroup` | `{ id: string; label: string; tab?: PropertyTabId; entries: PropertyEntry[] }` |
| `PropertiesDescriptor` | `PropertyGroup[]` |
| `PropertyTabId` | `"props" \| "validation" \| "linkage" \| "layout"` |

## 编辑器 store

| 导出 | 签名 |
| --- | --- |
| `FormEditorStoreProvider` | Store 上下文提供者（由 `FormEditorProvider` 安装） |
| `useFormEditorStore` | `<T>(selector: (state: FormEditorStoreState) => T) => T` |
| `useFormEditorStoreApi` | `() => FormEditorStoreApi`（`UnboundStore<FormEditorStoreState>`） |
| `useCurrentLayer` | `() => PresentationLayer` —— 当前激活设备的呈现层 |
| `isPaletteVisible` | `(state: Pick<FormEditorStoreState, "viewMode">) => boolean` |

`FormEditorStoreState` 是该 store 的完整状态 + 动作集合——大多数消费者通过 `useFormEditorStore(selector)` 读取其中的一部分，而非整个结构。值得关注的成员：

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `schema` | `FormSchema` | — |
| `selectedId` | `string \| null` | — |
| `viewMode` | `EditorViewMode`（`"edit" \| "preview" \| "json"`） | — |
| `device` | `EditorDeviceMode`（= `PresentationDevice`） | — |
| `formConfigOpen` / `formConfigTab` | `boolean` / `FormConfigTabId` | `FormConfigTabId = "outline" \| "form" \| "variables" \| "dataSources" \| "linkage"` |
| `past` / `future` | `HistoryEntry[]` | `HistoryEntry = { schema: FormSchema; device: EditorDeviceMode }` |
| `insertField`、`moveNode`、`removeNode`、`duplicateNode` | 动作 | 结构性编辑，每一个都是一个撤销检查点。 |
| `setSpan`、`setFlex`、`setColumnWidth`、`setStackSlot` | 动作 | 布局编辑，按节点合并为单步。 |
| `editField(args, options?: EditCoalesceOptions)`、`updateBlock(args, options?)` | 动作 | `EditCoalesceOptions = { coalesceKey?: string }` —— 共享同一个 key 的连续编辑会折叠为一个撤销步骤。**折叠是需要显式选择的**：省略 `coalesceKey` 时，这次编辑会独占一个撤销条目**并且**结束当前这一轮折叠，于是下一次编辑同样独占一个。想把一个输入框里的一串按键折叠起来，就为正在编辑的那样东西命名（内置属性面板传的是 `field:<id>:<entryId>`）；而离散动作——一次下拉选择、一次开关、一次增删——就别传，让它们各自成为一步。 |
| `setFieldKey` | 动作 | 清洗、去重，并重命名对旧 key 的每一处引用。去重会在该字段自身的值作用域下**跨两种设备呈现方式**进行，并且另一台设备上在相同作用域绑定同一 key 的孪生字段会在同一个撤销步骤里一并重命名——见 [Schema → 按设备划分的呈现方式](./schema.md#按设备划分的呈现方式)。 |
| `patchSchema` | `(patch: FormSchemaPatch) => void` | `FormSchemaPatch = Partial<Pick<FormSchema, "dataSources" \| "id" \| "linkage" \| "variables">> & { gap?: GapScale }` |
| `renameVariable`、`removeVariable`、`removeDataSource` | 动作 | 重命名/移除 + 引用清理。 |
| `undo`、`redo`、`canUndo`、`canRedo` | 动作 | — |

## 设备与注册表 hook

| 导出 | 签名 | 说明 |
| --- | --- | --- |
| `DeviceProvider` | `(props: { device: PresentationDevice; children }) => ReactElement` | 为注册表解析设置当前激活设备。 |
| `RegistryProvider` | `(props: { registries: DeviceRegistries; children }) => ReactElement` | — |
| `useDeviceRegistries` | `() => DeviceRegistries` | 若祖先没有 `RegistryProvider` 则抛出异常。 |
| `useFieldRegistry` | `() => FormFieldRegistry` | 当前激活设备的注册表；注册变化时重新渲染。 |
| `useMobileScopeContainer` | `() => () => HTMLElement` | antd-mobile 浮层的 `getContainer` 回调——存在包裹的手机边框元素时（设计时预览）返回该元素，否则返回 `document.body`（真实移动端运行时）。 |

## 渲染部件

| 导出 | 属性 |
| --- | --- |
| `FieldShell` | `{ children, domId, errors?, helperText?, label, labelPosition?, required?, labelledBy? }` —— 共享的标签/控件/辅助文本/错误提示布局。`labelledBy`（默认 `"control"` \| `"group"`）决定标签以何种方式与它所命名的东西关联：`"control"` 输出 `<label for={domId}>`，这要求字段把 `domId` 放在一个可被 label 关联的元素上；`"group"` 面向渲染出一**组**而非单个控件的字段（`radio`、`checkbox-group`、`code-editor`、`upload`）——`for` 对它们的包裹层是无效的，因此标签改为携带一个 id，主体变成一个 `role="group"` 并通过 `aria-labelledby` 指回标签，同时带上 `aria-required` / `aria-invalid`。不这么做，这类字段就完全没有可访问名称：读屏软件念出第一个选项，却完全不提正在问的是什么问题。 |
| `Label` | `{ children, htmlFor?, position?: LabelPosition, required?, title? }` |

## 数据源

| 导出 | 签名 |
| --- | --- |
| `DataSourceProvider` | `(props: { children, dataSources?: FormDataSource[], resolver?: DataSourceResolver, versions?: Record<string, number> }) => ReactElement` —— 由 `FormEditor` 和 `FormRenderer` 安装。 |
| `useFieldOptions` | `(source: FieldOptionSource \| undefined) => { options: FieldOption[]; loading: boolean; error: boolean }` |
| `DataSourceResolver`（类型） | `{ resolve: (request: ResolvedDataSourceRequest, mapping?: RemoteOptionMapping) => Promise<FieldOption[]> }`——解析器只会看到已求值的参数 |
| `noopDataSourceResolver` | `resolve` 始终返回 `[]` 的 `DataSourceResolver`——即默认值。 |
| `RemoteDataSourceRequest`（类型） | `{ resource: string; action: string; version?: string; params?: Record<string, DynamicValue> }`——schema 形态，携带的是绑定 |
| `ResolvedDataSourceRequest`（类型） | `{ resource: string; action: string; version?: string; params?: Record<string, unknown> }`——运行时形态，携带的是数据；见 [Embedding → 绑定参数](./embedding.md#绑定参数) |
| `DynamicValue`（类型） | `{ kind: "literal"; value: unknown } \| { kind: "expression"; source: string }`——与 `LinkageActionValue` 共用同一份声明 |
| `isDynamicValue` | `(value: unknown) => value is DynamicValue`——用于收窄跨越了序列化边界的值 |
| `RemoteOptionMapping`（类型） | `{ labelKey?: string; valueKey?: string; disabledKey?: string; descriptionKey?: string }` —— 均默认为 `"label"` / `"value"`。 |

## 移动端

| 导出 | 结构 |
| --- | --- |
| `mobileFieldDefinitions` | `FieldDefinition[]` —— antd-mobile 叶子渲染器（除 `code-editor` 外的所有内置叶子类型）加上结构化容器，复用各 PC 字段的 `config` / `properties`。 |
| `useMobileScopeContainer` | 见[设备与注册表 hook](#设备与注册表-hook)。 |

## Schema 类型

叙述性模型见 [Schema](./schema.md)。顶层类型与支持类型：

| 导出 | 结构 |
| --- | --- |
| `FormSchema` | `{ id, version: 2, variables?, dataSources?, linkage?, presentations: { pc: PresentationLayer; mobile?: PresentationLayer } }` |
| `PresentationLayer` | `{ gap?: GapScale; children: Block[] }` |
| `RuntimeSchema` | `PresentationLayer & { id: string; variables?, dataSources?, linkage? }` —— 由 `toRuntimeSchema` 产出 |
| `Block` | `FormField \| ContainerNode` |
| `FormField` | `FormFieldTypeMap[keyof FormFieldTypeMap]` —— 见[叶子字段接口](#叶子字段接口) |
| `FormFieldTypeMap` | 开放接口（可通过模块扩充），映射 `type` → 字段接口 |
| `KeyedFormField` | `Extract<FormField, KeyedNode>` |
| `ContainerNode` | `SectionNode \| TabsNode \| SubformNode \| FlexNode \| GridNode`（封闭集合） |
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
| `FieldOptionSource` | `StaticOptionSource \| RefOptionSource \| RemoteOptionSource`（`kind: "static" \| "ref" \| "remote"`） |
| `FormDataSource` | `StaticDataSource \| RemoteDataSource`（各自为 `{ id, name, kind, ... }`） |
| `FormVariable` | `{ id, name, type: "string" \| "number" \| "boolean" \| "json", defaultValue? }` |

## 叶子字段接口

每个叶子字段都继承共享基础结构：`{ id: string; label?: string; labelPosition?: LabelPosition; span?: number; flex?: FlexSlot; columnWidth?: number; stack?: StackSlot; linkage?: FieldLinkage }`。带 key 的字段额外携带 `{ key: string; columnType?: ColumnDataType }`；实现 `Validatable` 的字段额外携带 `{ validate?: {...} }`（见 [Schema 类型](#schema-类型)）。以下只列出各接口**自有**的字段。

| 接口 | `type` | 继承 | 自有字段 |
| --- | --- | --- | --- |
| `TextfieldField` | `"textfield"` | Keyed, Validatable | `placeholder?, helperText?, prefixIcon?: DynamicIconName, size?: "small"\|"middle"\|"large", allowClear?: boolean, maxLength?: number, inputType?: "text"\|"password"` |
| `CodeEditorField` | `"code-editor"` | Keyed, Validatable | `placeholder?, helperText?, language?: CodeEditorLanguage, minHeight?: number, maxHeight?: number, showLineNumbers?: boolean, showFoldGutter?: boolean, tabSize?: number` |
| `NumberField` | `"number"` | Keyed, Validatable | `placeholder?, helperText?, min?: number, max?: number, step?: number, size?, prefix?: string, suffix?: string, precision?: number, controls?: boolean`（默认显示） |
| `SwitchField` | `"switch"` | Keyed（非 Validatable） | `helperText?, onText?: string, offText?: string, size?: "default"\|"small"` |
| `SelectField` | `"select"` | Keyed, Validatable | `placeholder?, helperText?, allowClear?: boolean, size?, showSearch?: boolean, dataSource?: FieldOptionSource` |
| `RadioField` | `"radio"` | Keyed, Validatable | `helperText?, dataSource?: FieldOptionSource, optionType?: "default"\|"button", buttonStyle?: "outline"\|"solid", direction?: "horizontal"\|"vertical"` |
| `CheckboxGroupField` | `"checkbox-group"` | Keyed, Validatable | `helperText?, dataSource?: FieldOptionSource, direction?: "horizontal"\|"vertical"` |
| `TextareaField` | `"textarea"` | Keyed, Validatable | `placeholder?, helperText?, rows?: number, autoSize?: boolean, maxLength?: number, showCount?: boolean, size?, allowClear?: boolean` |
| `DateField` | `"date"` | Keyed, Validatable | `placeholder?, helperText?, allowClear?: boolean`（默认 `true`） |
| `DatetimeField` | `"datetime"` | Keyed, Validatable | `placeholder?, helperText?, allowClear?: boolean`（默认 `true`） |
| `DateRangeField` | `"daterange"` | Keyed, Validatable | `helperText?, allowClear?: boolean`（默认 `true`） |
| `UploadField` | `"upload"` | Keyed, Validatable | `helperText?, maxCount?: number`（默认 `1`）`, public?: boolean, accept?: string, dragger?: boolean` —— `maxCount: 1` 时值是单个存储 key，`> 1` 时是 key 数组；`public` 把对象落到 `pub/` 而不是 `priv/`，需要后端开启 `vef.storage.allow_public_uploads` |
| `ButtonField` | `"button"` | （非键控） | `action?: "submit"\|"reset"\|"button"`（默认 `"submit"`）`, buttonType?: "primary"\|"default"\|"dashed"\|"text"\|"link"`（默认 `"primary"`）`, danger?: boolean, size?, block?: boolean, ghost?: boolean, shape?: "default"\|"round", icon?: DynamicIconName` |
| `DividerField` | `"divider"` | （非键控） | `title?: string, titlePlacement?: "left"\|"center"\|"right"`（默认 `"center"`）`, dashed?: boolean` |
| `AlertBlockField` | `"alert-block"` | （非键控） | `message?: string, description?: string, alertType?: "info"\|"success"\|"warning"\|"error", showIcon?: boolean`（默认 `true`）`, closable?: boolean, banner?: boolean` |
| `ParagraphField` | `"paragraph"` | （非键控） | `text?: string, textType?: "secondary"\|"success"\|"warning"\|"danger", strong?: boolean, italic?: boolean` |

## 容器节点接口

每个容器都继承共享的节点基础结构（`id`、`span?`、`flex?`、`columnWidth?`、`stack?`、`linkage?`）。

| 接口 | `type` | 自有字段 |
| --- | --- | --- |
| `CardSection` / `CollapseSection`（`SectionNode`） | `"section"` | `variant: "card" \| "collapse", title?: string, gap?: GapScale, children: Block[]` —— `CollapseSection` 额外增加 `defaultCollapsed?: boolean` |
| `TabsNode` | `"tabs"` | `gap?: GapScale, tabs: TabItem[]` —— `TabItem = { id: string; label: string; children: Block[] }` |
| `StackSubform` / `TableSubform`（`SubformNode`） | `"subform"` | 带 key。`variant: "stack" \| "table", label?: string, template: Block[], minRows?: number, maxRows?: number, addLabel?: string` —— `StackSubform` 额外增加 `gap?: GapScale`；`TableSubform` 额外增加 `size?: "small" \| "middle" \| "large"` |
| `FlexNode` | `"flex"` | `children: Block[], direction?: "row" \| "column"`（默认 `"row"`）`, justify?: FlexJustify, align?: FlexAlign, wrap?: boolean`（默认 `false`）`, gap?: number` |
| `GridNode` | `"grid"` | `children: Block[], columns?: number`（默认 `2`）`, gap?: number, rowGap?: number`（默认等于 `gap`） |

`FlexJustify = "start" | "center" | "end" | "between" | "around"`。`FlexAlign = "start" | "center" | "end" | "stretch"`。

## 字段与容器定义导出

每个内置类型对应一个 `FieldDefinition` 常量，由 `createDefaultRegistry`/`createDefaultMobileRegistry` 负责注册——`type` / 分组的对应关系见 [Schema → 叶子字段](./schema.md#叶子字段) 和 [Schema → 容器](./schema.md#容器)。

`textfieldDefinition`、`codeEditorDefinition`、`numberFieldDefinition`、`switchFieldDefinition`、`selectFieldDefinition`、`radioFieldDefinition`、`checkboxGroupFieldDefinition`、`textareaFieldDefinition`、`dateFieldDefinition`、`datetimeFieldDefinition`、`dateRangeFieldDefinition`、`uploadFieldDefinition`、`buttonDefinition`、`sectionDefinition`、`tabsDefinition`、`subformDefinition`、`flexDefinition`、`gridDefinition`、`dividerDefinition`、`alertBlockDefinition`、`paragraphDefinition`。

## Schema 引擎函数

| 导出 | 签名 | 用途 |
| --- | --- | --- |
| `createEmptySchema` | `() => FormSchema` | 全新文档，空的 `pc` 呈现层。 |
| `createId` | `(prefix: IdPrefix) => string` | 铸造一个带前缀的 cuid2 节点 id。 |
| `generateUniqueKey` | `(layer, baseKey, scope?) => string` | 分配一个作用域内唯一的 key。 |
| `nextUniqueKey` | `(used: Set<string>, baseKey: string) => string` | 同上，但针对一个预先收集好的集合。 |
| `sanitizeKey` | `(key: string) => string` | 剥离非单词字符。 |
| `isKeyedNode` | `(node: Block) => node is KeyedNodeUnion` | — |
| `isKeyedField` | `(field: FormField) => field is KeyedFormField` | — |
| `isContainerNode` | `(node: Block) => node is ContainerNode` | — |
| `isLeafField` | `(node: Block) => node is FormField` | — |
| `walkNodes` | `(layer, visit: (node: Block, scope: readonly string[]) => void) => void` | 深度优先，遍历所有节点。`scope` 是所处外层子表单 key 组成的链条（根节点为 `[]`）。 |
| `walkFields` | `(layer, visit: (field: FormField, scope: readonly string[]) => void) => void` | 深度优先，仅遍历叶子字段。 |
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
| `toFormFieldDefinitions` | `(schema: FormSchema) => FormFieldDefinition[]` | `FormFieldDefinition = { key, kind: FieldKind, label, options? }`；`FieldKind = "input" \| "textarea" \| "select" \| "number" \| "date" \| "upload"` |
| `convertPresentation` | `(pc: PresentationLayer, rules: ConversionRegistry, target: FormFieldRegistry) => { layer: PresentationLayer; report: ConversionReport }` | `ConversionReport = { convertedCount: number; dropped: Array<{ sourceType, reason, label? }> }` |
| `createDefaultConversionRules` | `() => ConversionRegistry` | — |
| `ConversionRegistry`（类） | `.register({ type, convert }): this` / `.convert(block, ctx): BlockConversion` | `BlockConversion = { status: "converted"; block } \| { status: "unwrapped"; blocks } \| { status: "dropped"; sourceType; reason }` |
| `BlockConversionRule` | `{ type: Block["type"]; convert: (source: Block, ctx: ConversionContext) => BlockConversion }` | `.register()` 接收的规则结构——每种来源节点类型对应一条规则。 |
| `ConversionContext` | `{ target: FormFieldRegistry; convertBlocks: (blocks: Block[]) => Block[] }` | 传给 `convert`；`convertBlocks` 会用同一套规则递归转换容器的子节点。 |

`DropTarget = { kind: "beside"; anchorId: string; side: "before" \| "after" } | { kind: "container"; containerId: string; tabIndex?: number } | { kind: "append" }`。

## Linkage

完整模型见 [Linkage](./linkage.md)。导出的表面 API：

| 导出 | 签名 / 结构 |
| --- | --- |
| `validateLinkageSchema` | `(layer: PresentationLayer, formLinkage?: FieldLinkage) => LinkageValidationResult`（`{ issues: ValidationIssue[] }`） |
| `resolveLinkageEvaluators` | `(overrides?: LinkageEvaluators) => Required<LinkageEvaluators>` |
| `defaultEvaluateExpression` | `(source, values, context?) => boolean` |
| `defaultEvaluateAssignExpression` | `(source, values, context?) => unknown` |
| `defaultEvaluateScriptAction` | `(source, values, context?) => LinkageScriptResult \| void` |
| `isStateAction` / `isEffectAction` | `(action: FieldLinkageAction) => action is StateAction / EffectAction` |
| `isFieldEventTriggerKind` | `(kind: LinkageTriggerKind) => boolean` |
| `getFieldPermission` | `(permissions: Record<string, FieldPermission> \| undefined, key: string) => FieldPermission \| undefined` —— 带自有属性守卫的查找（key 与 `Object` 原型成员同名的字段永远不会读到原型上的槽位）。v2.10.0 新增 |
| `isWritableFieldPermission` | `(permission: FieldPermission \| undefined) => boolean` —— 对 `undefined`（没有钳制条目）、`"editable"` 和 `"required"` 返回 `true`；对 `"visible"` / `"hidden"` 返回 `false`。v2.10.0 新增 |
| `STATE_ACTION_TYPES` | `readonly StateActionType[]`（`show, hide, enable, disable, require, optional, assign, script`） |
| `EFFECT_ACTION_TYPES` | `readonly EffectActionType[]`（`set_field, set_variable, refresh_data_source, alert, api_call, navigate, submit, reset`） |
| `LINKAGE_ACTION_TYPES` | `readonly LinkageActionType[]` —— 上面两者的并集 |
| `KEYED_ONLY_ACTIONS` | `ReadonlySet<LinkageActionType>`（`require, optional, assign`） |
| `FIELD_TRIGGER_KINDS` / `FORM_TRIGGER_KINDS` | `readonly LinkageTriggerKind[]` —— 各规则作用域下的合法触发条件 |
| `FIELD_EVENT_TRIGGER_KINDS` | `readonly LinkageTriggerKind[]`（`change, focus, blur, click`） |
| `LINKAGE_OPERATORS` | `readonly LinkageOperator[]`（`eq, ne, gt, lt, gte, lte, contains, empty, notEmpty`） |
| `ALERT_LEVELS` | `readonly LinkageAlertLevel[]`（`info, success, warning, error`） |

类型：`FieldLinkage`、`FieldLinkageRule`、`FieldLinkageAction`、`FieldLinkageDefaults`、`LinkageTrigger`、`LinkageTriggerKind`、`LinkageCondition`（`LinkageConditionLeaf | LinkageConditionGroup | LinkageConditionExpression`）、`LinkageOperator`、`StateAction`、`StateActionType`、`EffectAction`、`EffectActionType`、`LinkageActionType`、`LinkageActionValue`、`LinkageAlertLevel`、`ConditionRetrigger`（`"edge" | "always"`）、`LinkageScriptResult`、`LinkageEvaluators`、`EvaluationContext`、`LinkageContextSource`、`EffectDispatchContext`、`FieldPermission`（`"hidden" | "visible" | "editable" | "required"`）。

## 校验

| 导出 | 签名 |
| --- | --- |
| `formatIssueMessage` | `(code: ValidationIssueCode, params?) => string` —— 每一条问题消息都通过它产出 |
| `ValidationIssue`（类型） | `{ path: string; code: ValidationIssueCode; severity: ValidationSeverity; message: string; ruleId?: string }` |
| `ValidationIssueCode`（类型） | 由数十个稳定、机器可读的代码组成的封闭联合类型（schema 信封、节点树、布局、联动……） |
| `ValidationSeverity`（类型） | `"error" \| "warning"` |

`message` 是预先渲染好的中文产品文案；请针对 `code` 和 `path` 编程，它们不随语言环境变化，是稳定的。

## 外观（Chrome）

`ContainerChromeSet` 是通过 `FormFieldRegistry.setContainerChrome` 安装的、按设备划分的结构化容器展示型外壳集合：

| 成员 | 属性类型 |
| --- | --- |
| `Section` | `SectionChromeProps = { title?: ReactNode; variant?: "card" \| "collapse"; defaultCollapsed?: boolean; children: ReactNode }` |
| `Tabs` | `TabsChromeProps = { items: ChromeTabItem[]; activeKey?: string; onChange?: (key: string) => void }` —— `ChromeTabItem = { key: string; label: ReactNode; children: ReactNode }` |
| `Subform` | `SubformChromeProps = { title?: ReactNode; errors?: string[]; children: ReactNode }`——自定义外观应当渲染 `errors`：一个子表单为整个数组只挂载**一个**字段，因此它自身的错误（必填子表单的"至少一行"、`table` 变体上卷起来的行内错误）没有别的落脚点，否则就会在屏幕上不显示任何东西的情况下阻断提交。两套内置外观都把它渲染在主体下方，用的是叶子字段所用的同一个 footer。 |
| `SubformRow` | `SubformRowChromeProps = { removeControl?: ReactNode; children: ReactNode }` |
| `AddButton` | `AddControlChromeProps = { label: ReactNode; onClick: () => void }` |
| `RemoveButton` | `RemoveControlChromeProps = { onClick: () => void }` |

`flex` 和 `grid` 是纯 CSS 布局，不使用任何外观组件——在两种设备上表现一致。
