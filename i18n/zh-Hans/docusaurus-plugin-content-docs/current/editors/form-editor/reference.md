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
| `onPublish` | `(schema: FormSchema) => void` | 先运行编辑器自身的校验以及宿主的 `validate`（error 会阻止发布，warning 会请求确认）；省略时不渲染发布按钮。 |
| `publishText` | `string` | 默认为 `"发布"`。当省略 `onPublish` 时被忽略。 |
| `publishLoading` | `boolean` | 发布按钮的加载状态。当省略 `onPublish` 时被忽略。 |

### `FormEditorProviderProps`

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `initialSchema` | `FormSchema` | 仅在挂载时读取一次。不做校验——见 [Schema → 校验导入的 schema](./schema.md#校验导入的-schema)。 |
| `registries` | `Partial<DeviceRegistries>` | 按设备划分的注册表覆盖项；省略的设备会回退到 `registry`，再回退到内置默认值。仅在挂载时读取一次。 |
| `registry` | `FormFieldRegistry` | 两种设备共用一份注册表（包括容器外观）的简写形式。仅在挂载时读取一次。 |
| `evaluators` | `LinkageEvaluators` | 转发给实时预览与 JSON 视图——见 [Linkage](./linkage.md#可插拔求值器)。没有 `dispatchEffect` 时，预览会把 `alert` / `navigate` / `api_call` 显示为提示消息。 |
| `dataSourceResolver` | `DataSourceResolver` | 转发给实时预览与 JSON 视图——见 [Embedding](./embedding.md#加载远程选项)。 |
| `dataSourceApis` | `DataSourceApi[]` | 宿主的选项接口目录；远程选项来源会以针对它的选择器打头。仅在设计时使用——见 [Embedding → 提供接口目录](./embedding.md#提供接口目录)。 |
| `codeSets` | `CodeSetDescriptor[]` | 宿主的数据字典目录；「数据字典」选项来源从中挑选，而不是手填 key。仅在设计时使用——见 [Embedding → 数据字典](./embedding.md#数据字典)。 |
| `codeSetQueryFn` | `CodeSetQueryFn` | 转发给画布、实时预览与 JSON 视图。默认 `AppContext.codeSetQueryFn`——见 [Embedding → 数据字典](./embedding.md#数据字典)。 |
| `evaluationContext` | `EvaluationContext` | 转发给实时预览与 JSON 视图，并叠加「变量」页中的预览值——见 [Linkage](./linkage.md#宿主上下文与系统变量)。 |
| `contextSources` | `LinkageContextSource[]` | 表单的系统变量：在「变量」页中连同预览值一起列出，并由条件构建器作为来源提供——见 [Linkage](./linkage.md#设计器中的系统变量)。仅在设计时使用。 |
| `validate` | `SchemaValidator` | 宿主自己的检查，只在 schema 没有结构性 error 时调用；它的问题会进入状态栏诊断与发布关卡。请传入稳定的函数——见 [Embedding → 宿主诊断](./embedding.md#宿主诊断)。 |
| `onSchemaChange` | `(schema: FormSchema) => void` | 文档发生任何变化时触发——编辑、撤销 / 重做、导入、清空、`setSchema`——但初始 schema 不会触发。 |
| `apiRef` | `Ref<FormEditorApi>` | 见下文。 |
| `children` | `ReactNode` | — |

### `FormEditorApi`

| 成员 | 签名 |
| --- | --- |
| `getSchema` | `() => FormSchema` |
| `setSchema` | `(schema: FormSchema) => void` —— 导入语义：重置撤销时间线与当前选中；不做校验 |
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
| `schema` | `FormSchema` | 必填。不做校验。 |
| `device` | `PresentationDevice`（`"pc" \| "mobile"`） | 默认 `"pc"`。未设计的设备渲染空状态。 |
| `defaultValues` | `Record<string, unknown>` | 为根作用域的带 key 字段播种——见 [Embedding → 默认值](./embedding.md#默认值)。 |
| `disabled` | `boolean` | 把整个表单渲染为只读；禁用的表单不做提交校验。 |
| `fieldPermissions` | `Record<string, FieldPermission>` | 服务端解析的钳制——见 [Linkage](./linkage.md#字段权限钳制)。 |
| `evaluators` | `LinkageEvaluators` | 见 [Linkage](./linkage.md#可插拔求值器)。 |
| `dataSourceResolver` | `DataSourceResolver` | 见 [Embedding](./embedding.md#加载远程选项)。默认 `noopDataSourceResolver`。 |
| `codeSetQueryFn` | `CodeSetQueryFn` | 一次加载表单中 `codeSet` 来源引用的全部数据字典。默认 `AppContext.codeSetQueryFn`——见 [Embedding → 数据字典](./embedding.md#数据字典)。 |
| `evaluationContext` | `EvaluationContext` | 见 [Linkage](./linkage.md#宿主上下文与系统变量)。按插槽逐个读取；`variables` 只在内容变化时重新播种 `$vars`。 |
| `onSubmit` | `(values: Record<string, unknown>) => void \| Promise<void>` | 在校验与 `beforeSubmit` 之后收到过滤后的载荷——见 [Embedding → 提交](./embedding.md#提交)。 |
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
| `formConfigOpen` / `formConfigTab` | `boolean` / `FormConfigTabId` | `FormConfigTabId = "outline" \| "form" \| "variables" \| "dataSources" \| "linkage"`——即抽屉的「大纲 / 表单 / 变量 / 数据源 / 联动」页签 |
| `past` / `future` | `HistoryEntry[]` | `HistoryEntry = { schema: FormSchema; device: EditorDeviceMode }`；最多 100 条，跨设备全局共享 |
| `setSchema` | `(schema: FormSchema) => void` | 替换整个文档；重置历史与当前选中。 |
| `clearSchema` | `() => void` | 以一次普通的、可撤销的编辑把文档重置为空 schema。 |
| `selectNode`、`setViewMode`、`setDevice` | 动作 | 视图状态——从不记入撤销历史。 |
| `setFormConfigOpen`、`setFormConfigTab` | 动作 | 打开 / 收起表单配置抽屉，或把它切换到某个页签（同时打开）；非编辑模式下不做任何事。 |
| `initMobile` | `(layer: PresentationLayer) => void` | 播种移动端呈现方式（空白或转换而来）并切换过去；撤销一次即可移除。 |
| `insertField`、`moveNode`、`removeNode`、`removeTab`、`duplicateNode` | 动作 | 结构性编辑，每一个都是一个撤销检查点。`removeNode` / `removeTab` 会在同一步中清理引用了随被删子树一起消失的 key 的联动规则。 |
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
| `FieldShell` | `FieldShellProps`：`{ children, domId, errors?, helperText?, label, labelPosition?, required?, labelledBy? }` —— 共享的标签/控件/辅助文本/错误提示布局。`labelledBy`（默认 `"control"` \| `"group"`）决定标签以何种方式与它所命名的东西关联：`"control"` 输出 `<label for={domId}>`，这要求字段把 `domId` 放在一个可被 label 关联的元素上；`"group"` 面向渲染出一**组**而非单个控件的字段（`radio`、`checkbox-group`、`code-editor`、`upload`）——`for` 对它们的包裹层是无效的，因此标签改为携带一个 id，主体变成一个 `role="group"` 并通过 `aria-labelledby` 指回标签，同时带上 `aria-required` / `aria-invalid`。不这么做，这类字段就完全没有可访问名称：读屏软件念出第一个选项，却完全不提正在问的是什么问题。 |
| `Label` | `LabelProps`：`{ children, htmlFor?, id?, position?: LabelPosition, required?, title?, "aria-hidden"? }` —— `id` 让 `role="group"` 的主体能够指回该标签（用来代替 `htmlFor`）；`title` 是被截断的侧边标签所显示的原生提示；`aria-hidden` 用于隐藏一个其控件已带有相同 `aria-label` 的标签 |

## 数据源

| 导出 | 签名 |
| --- | --- |
| `DataSourceProvider` | `(props: { children, dataSources?: FormDataSource[], resolver?: DataSourceResolver, versions?: Record<string, number> }) => ReactElement` —— 由 `FormEditor` 和 `FormRenderer` 安装；在其生命周期内持有选项缓存。 |
| `useFieldOptions` | `(source: FieldOptionSource \| undefined) => { options: FieldOption[]; loading: boolean; error: boolean }` —— 解析被 reject 后 `error` 为真，同时保留之前的选项 |
| `DataSourceResolver`（类型） | `{ resolve: (request: ResolvedDataSourceRequest, mapping?: RemoteOptionMapping) => Promise<FieldOption[]> }`——解析器只会看到已求值的参数与规范化后的映射 |
| `noopDataSourceResolver` | `resolve` 始终返回 `[]` 的 `DataSourceResolver`——即默认值。 |
| `RemoteDataSourceRequest`（类型） | `{ resource: string; action: string; version?: string; params?: Record<string, DynamicValue> }`——schema 形态，携带的是绑定 |
| `ResolvedDataSourceRequest`（类型） | `{ resource: string; action: string; version?: string; params?: Record<string, unknown> }`——运行时形态，携带的是数据；见 [Embedding → 绑定参数](./embedding.md#绑定参数) |
| `DynamicValue`（类型） | `{ kind: "literal"; value: unknown } \| { kind: "expression"; source: string }`——与 `LinkageActionValue` 共用同一份声明 |
| `isDynamicValue` | `(value: unknown) => value is DynamicValue`——用于收窄跨越了序列化边界的值 |
| `RemoteOptionMapping`（类型） | `{ labelKey?: string; valueKey?: string; disabledKey?: string; descriptionKey?: string }` —— `labelKey` / `valueKey` 默认为 `"label"` / `"value"` |
| `normalizeOptionMapping` | `(mapping: RemoteOptionMapping \| undefined) => RemoteOptionMapping \| undefined` —— 去掉空白与只含空白的 key，其余去除首尾空白，什么都不剩时返回 `undefined`；见 [Schema → 选项与数据源](./schema.md#选项与数据源) |
| `DataSourceApi`（类型） | `{ label: string; description?: string; group?: string; resource: string; action: string; version?: string; mapping?: RemoteOptionMapping; params?: DataSourceApiParam[] }` —— 设计器接口目录中的一个条目；见 [Embedding → 提供接口目录](./embedding.md#提供接口目录) |
| `CodeSetQueryFn`（类型） | `QueryFunction<Record<string, DataOption[]>, string[]>`——即 `AppContext.codeSetQueryFn` 的约定：传入一组字典 key，返回每个 key 的字典项 |
| `CodeSetDescriptor`（类型） | `{ codeSet: string; name: string; group?: string }`——设计器数据字典目录中的一项 |
| `DataSourceApiParam`（类型） | `{ name: string; label?: string; description?: string; required?: boolean; defaultValue?: DynamicValue }` —— 接口声明的一个参数 |

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
| `FieldOptionSource` | `StaticOptionSource \| RefOptionSource \| RemoteOptionSource \| CodeSetOptionSource`（`kind: "static" \| "ref" \| "remote" \| "codeSet"`） |
| `CodeSetOptionSource` | `{ kind: "codeSet"; codeSet: string }`——按 key 引用的宿主数据字典；见 [Embedding → 数据字典](./embedding.md#数据字典) |
| `FormDataSource` | `StaticDataSource \| RemoteDataSource`（各自为 `{ id, name, kind, ... }`） |
| `FormVariable` | `{ id, name, type: "string" \| "number" \| "boolean" \| "json", defaultValue? }` —— `name` 为标识符形态（`^[A-Za-z_]\w*$`）且唯一；见 [Schema → 表单变量](./schema.md#表单变量) |

## 叶子字段接口

每个叶子字段都继承共享基础结构：`{ id: string; label?: string; labelPosition?: LabelPosition; span?: number; flex?: FlexSlot; columnWidth?: number; stack?: StackSlot; linkage?: FieldLinkage }`。带 key 的字段额外携带 `{ key: string; columnType?: ColumnDataType }`；实现 `Validatable` 的字段额外携带 `{ validate?: {...} }`（见 [Schema 类型](#schema-类型)）。以下只列出各接口**自有**的字段。

| 接口 | `type` | 继承 | 自有字段 |
| --- | --- | --- | --- |
| `TextfieldField` | `"textfield"` | Keyed, Validatable | `placeholder?, helperText?, prefixIcon?: DynamicIconName, size?: "small"\|"middle"\|"large", allowClear?: boolean, maxLength?: number, inputType?: "text"\|"password"` |
| `CodeEditorField` | `"code-editor"` | Keyed, Validatable | `placeholder?, helperText?, language?: CodeEditorLanguage, minHeight?: number, maxHeight?: number, showLineNumbers?: boolean, showFoldGutter?: boolean, tabSize?: number` |
| `NumberField` | `"number"` | Keyed, Validatable | `placeholder?, helperText?, min?: number, max?: number, step?: number, size?, prefix?: string, suffix?: string, precision?: number, controls?: boolean`（默认显示） |
| `SwitchField` | `"switch"` | Keyed（非 Validatable） | `helperText?, onText?: string, offText?: string, size?: "default"\|"small"` |
| `SelectField` | `"select"` | Keyed, Validatable | `placeholder?, helperText?, allowClear?: boolean, size?, showSearch?: boolean, dataSource?: FieldOptionSource` |
| `RadioField` | `"radio"` | Keyed, Validatable | `helperText?, dataSource?: FieldOptionSource, optionType?: "default"\|"button", buttonStyle?: "outline"\|"solid", direction?: "horizontal"\|"vertical"`（默认 `"vertical"`，两种设备都显式应用，因为它们各自的原生默认值不同） |
| `CheckboxGroupField` | `"checkbox-group"` | Keyed, Validatable | `helperText?, dataSource?: FieldOptionSource, direction?: "horizontal"\|"vertical"`（默认 `"vertical"`） |
| `TextareaField` | `"textarea"` | Keyed, Validatable | `placeholder?, helperText?, rows?: number, autoSize?: boolean, maxLength?: number, showCount?: boolean, size?, allowClear?: boolean` |
| `DateField` | `"date"` | Keyed, Validatable | `placeholder?, helperText?, allowClear?: boolean`（默认 `true`） |
| `DatetimeField` | `"datetime"` | Keyed, Validatable | `placeholder?, helperText?, allowClear?: boolean`（默认 `true`） |
| `DateRangeField` | `"daterange"` | Keyed, Validatable | `helperText?, allowClear?: boolean`（默认 `true`） |
| `UploadField` | `"upload"` | Keyed, Validatable | `helperText?, maxCount?: number`（默认 `1`）`, public?: boolean, accept?: string, dragger?: boolean` —— `maxCount: 1` 时值是单个存储 key，`> 1` 时是 key 数组；`public` 把对象落到 `pub/` 而不是 `priv/`，需要后端开启 `vef.storage.allow_public_uploads` |
| `ButtonField` | `"button"` | （非键控） | `action?: "submit"\|"reset"\|"button"`（默认 `"submit"`）`, buttonType?: "primary"\|"default"\|"dashed"\|"text"\|"link"`（默认 `"primary"`）`, danger?: boolean, size?, block?: boolean, ghost?: boolean, shape?: "default"\|"round", icon?: DynamicIconName` |
| `DividerField` | `"divider"` | （非键控） | `title?: string, titlePlacement?: "left"\|"center"\|"right"`（默认 `"center"`）`, dashed?: boolean` |
| `AlertBlockField` | `"alert-block"` | （非键控） | `message?: string, description?: string, alertType?: "info"\|"success"\|"warning"\|"error", showIcon?: boolean`（默认 `true`）`, closable?: boolean, banner?: boolean` |
| `ParagraphField` | `"paragraph"` | （非键控） | `text?: string, textType?: "secondary"\|"success"\|"warning"\|"danger", strong?: boolean, italic?: boolean` |

有些属性在 antd-mobile 中没有对应物，移动端渲染器会忽略它们：`textfield` / `number` / `select` / `textarea` / `switch` 的 `size`、`select` 的 `showSearch`、`radio` 的 `optionType` / `buttonStyle`、`number` 的 `controls`、`textarea` 的 `allowClear`、`button` 的 `ghost`、`divider` 的 `dashed`，以及 `alert-block` 的 `banner`。移动端的 `button` 默认占满整行，除非 `block` 显式存为 `false`。

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
| `FIELD_TRIGGER_KINDS` | `readonly LinkageTriggerKind[]`（`condition, change, focus, blur, click`）—— 字段 / 容器规则的合法触发条件 |
| `FORM_TRIGGER_KINDS` | `readonly LinkageTriggerKind[]`（`condition, load, beforeSubmit, afterSubmit`）—— 表单级规则的合法触发条件 |
| `FIELD_EVENT_TRIGGER_KINDS` | `readonly LinkageTriggerKind[]`（`change, focus, blur, click`） |
| `LINKAGE_OPERATORS` | `readonly LinkageOperator[]`（`eq, ne, gt, lt, gte, lte, contains, empty, notEmpty`）—— 语义见 [Linkage → 运算符](./linkage.md#运算符) |
| `ALERT_LEVELS` | `readonly LinkageAlertLevel[]`（`info, success, warning, error`） |

上下文与分发相关的结构：

| 类型 | 结构 |
| --- | --- |
| `EvaluationContext` | `{ variables?, user?, node?, applicant?, globals? }`，每项都是 `Record<string, unknown>`——分别绑定为 `$vars` / `$user` / `$node` / `$applicant` / `$globals`；见 [Linkage → 宿主上下文与系统变量](./linkage.md#宿主上下文与系统变量) |
| `LinkageContextSource` | `{ key: string; label: string }` —— 一个系统变量：`key` 是完整的作用域路径（`"$applicant.departmentId"`），原样存为叶子条件的 `sourceKey` |
| `EffectDispatchContext` | `{ values: Record<string, unknown>; resolveValue: (value: LinkageActionValue) => unknown; resolveRequest: (request: RemoteDataSourceRequest) => ResolvedDataSourceRequest }` —— 作用域限定在触发规则所处的值作用域 |
| `LinkageScriptResult` | `{ hidden?: boolean; disabled?: boolean; required?: boolean; value?: unknown }` —— `script` 动作返回的部分状态补丁 |

其他类型：`FieldLinkage`、`FieldLinkageRule`、`FieldLinkageAction`、`FieldLinkageDefaults`、`LinkageTrigger`、`LinkageTriggerKind`、`LinkageCondition`（`LinkageConditionLeaf | LinkageConditionGroup | LinkageConditionExpression`）、`LinkageOperator`、`StateAction`、`StateActionType`、`EffectAction`、`EffectActionType`、`LinkageActionType`、`LinkageActionValue`、`LinkageAlertLevel`、`ConditionRetrigger`（`"edge" | "always"`）、`LinkageEvaluators`、`FieldPermission`（`"hidden" | "visible" | "editable" | "required"`）。

## 校验

| 导出 | 签名 |
| --- | --- |
| `formatIssueMessage` | `(code: ValidationIssueCode, params?) => string` —— 每一条问题消息都通过它产出 |
| `SchemaIssue`（类型） | `{ path: string; code: string; severity: ValidationSeverity; message: string }` —— 编辑器展示的任何诊断，无论是它自己的还是宿主的 |
| `ValidationIssue`（类型） | `SchemaIssue & { code: ValidationIssueCode; ruleId?: string }` —— 编辑器自己的问题；`ruleId` 指明规则级联动问题所属的规则 |
| `SchemaValidator`（类型） | `(schema: FormSchema) => readonly SchemaIssue[]` —— 即 `validate` 属性；见 [Embedding → 宿主诊断](./embedding.md#宿主诊断) |
| `ValidationIssueCode`（类型） | 由下表各问题码组成的封闭联合类型 |
| `ValidationSeverity`（类型） | `"error" \| "warning"` |

`message` 是预先渲染好的中文产品文案；请针对 `code` 和 `path` 编程，它们不随语言环境变化，是稳定的。问题的 `path` 有以下几种形式：呈现路径（`presentations.pc.children[0].key`）、节点路径（`node[Field_1].linkage.rules[0]`）、表单级路径（`variables[1].name`、`dataSources[0].request`、`schema.linkage.rules[0]`），以及表示依赖环的 `linkage`。

### 校验问题码

*error* 表示 schema 在结构上已损坏、校验不通过；*warning* 标记的是编写过程中的合法中间状态（未完成或悬空的配置），会在导出→导入的往返中保留下来。

| 问题码 | 级别 | 触发条件 |
| --- | --- | --- |
| `schema_not_object` | error | 待校验对象不是普通对象。 |
| `id_required` | error | schema、节点、标签页或规则缺少非空字符串 `id`。 |
| `duplicate_id` | error | 节点或标签页的 id 在同一呈现方式内重复。 |
| `version_unsupported` | error | `version` 不是 `2`。 |
| `presentation_not_object` | error | `presentations` 或某个设备的呈现层不是对象。 |
| `variables_invalid` | error | `variables` 不是"id 唯一非空、name 唯一且为标识符形态、`type` 合法"的声明数组。 |
| `data_sources_invalid` | error | `dataSources` 不是"id 唯一非空、`name` 为字符串、`static` / `remote` 载荷与映射合法"的条目数组。 |
| `block_not_object` | error | 节点不是普通对象。 |
| `children_not_array` | error | 某个主体——`children`、`tabs`、`template` 或条件组的 `children`——不是数组。 |
| `tabs_empty` | error | `tabs` 容器没有任何标签页。 |
| `tab_malformed` | error | 标签页不是对象，或其 `label` 不是字符串。 |
| `type_required` | error | 节点缺少非空的 `type`。 |
| `unknown_field_type` | error | 该 `type` 未在对应设备的注册表中注册。 |
| `key_required` | error | 带 key 的字段类型或子表单没有 key。 |
| `stray_key` | error | 非 key 字段类型带了 key。 |
| `stray_key_on_container` | error | 布局容器（`section` / `tabs` / `flex` / `grid`）带了 key。 |
| `duplicate_key` | error | key 在同一值作用域内重复。 |
| `key_invalid_charset` | error | key 中含有字母、数字、下划线以外的字符。 |
| `span_invalid` | error | `span` 不是 `1..24` 之间的整数。 |
| `flex_invalid` | error | `flex` 插槽格式错误，或 flex 容器的 `direction` / `justify` / `align` / `wrap` 取值非法。 |
| `column_width_invalid` | error | `columnWidth` 不是正数。 |
| `stack_invalid` | error | `stack` 插槽格式错误。 |
| `gap_invalid` | error | 堆叠容器的 `gap` 不是 `GapScale` 档位，或 flex / grid 的 `gap` / `rowGap` 不是非负整数。 |
| `columns_invalid` | error | 栅格的 `columns` 不是 `1..24` 之间的整数。 |
| `variant_invalid` | error | 区块的 `variant` 不是 `"card"` / `"collapse"`。 |
| `subform_variant_invalid` | error | 子表单的 `variant` 不是 `"stack"` / `"table"`。 |
| `title_invalid` | error | 区块的 `title` 不是字符串。 |
| `display_text_invalid` | error | `label` / `placeholder` / `helperText` / `title` / `text` / `message` 不是字符串。 |
| `rows_bound_invalid` | error | `minRows` / `maxRows` 不是非负整数，或 `minRows` 大于 `maxRows`。 |
| `subform_table_column` | warning | `table` 子表单的模板中含有容器或非 key 节点；渲染器会跳过它。 |
| `validate_malformed` | error | `validate` 不是对象。 |
| `validate_range_invalid` | error | `minLength` 大于 `maxLength`，或 `min` 大于 `max`。 |
| `pattern_invalid` | error | `pattern` 不是可编译的正则表达式。 |
| `data_source_invalid` | error | 字段的 `dataSource` 格式错误——`kind` 未知、选项列表或映射格式错误。 |
| `data_source_ref_unknown` | warning | `ref` 指向的数据源未声明。 |
| `request_malformed` | error | 请求不是对象，或其 `resource` / `action` 不是字符串。 |
| `request_incomplete` | warning | 请求的 `resource` 和 / 或 `action` 为空。每个请求只报告一次，并写明缺少的是什么——两者都缺时报在请求本身的路径上，否则报在为空的那一项上。 |
| `linkage_malformed` | error | `linkage` 或其 `defaults` 不是对象。 |
| `rules_not_array` | error | `rules` 不是数组。 |
| `rule_malformed` | error | 规则不是对象。 |
| `trigger_malformed` | error | 触发条件不是带字符串 `kind` 的对象。 |
| `trigger_kind_invalid` | error | 该触发条件类型在规则所处的作用域中不合法。 |
| `trigger_requires_keyed_leaf` | error | `change` 触发条件挂在了带 key 叶子字段以外的节点上。 |
| `condition_malformed` | error | 条件不是对象，或叶子的 `sourceKey` / 表达式的 `source` 不是字符串。 |
| `condition_kind_invalid` | error | 条件的 `kind` 不是 `leaf` / `group` / `expression`。 |
| `logic_invalid` | error | 条件组的 `logic` 不是 `"all"` / `"any"`。 |
| `condition_group_empty` | warning | 条件组没有子条件：`all` 时规则始终生效，`any` 时永不生效。 |
| `operator_invalid` | error | 叶子的 `operator` 不在 `LINKAGE_OPERATORS` 中。 |
| `source_key_empty` | warning | 叶子尚未选择来源。 |
| `source_key_unresolved` | warning | 叶子的表单 key（普通写法或 `$form.`）在规则的值作用域中找不到对应的带 key 节点。 |
| `source_scope_unknown` | warning | 叶子的 `$` 根不是 `$form` / `$vars` / `$user` / `$node` / `$applicant` / `$globals` 之一。 |
| `source_empty` | warning | 表达式条件、表达式取值或脚本为空。 |
| `actions_not_array` | error | `actions` 不是数组。 |
| `actions_empty` | warning | 规则没有任何动作。 |
| `action_malformed` | error | 动作不是对象，或其 `targetKey` / `variable` / `dataSourceId` / `source` 不是字符串。 |
| `action_unknown_type` | error | 动作 `type` 不在 `LINKAGE_ACTION_TYPES` 中。 |
| `state_action_on_edge_trigger` | error | 状态动作挂在边沿触发条件下。 |
| `state_action_on_form_scope` | error | 状态动作出现在表单级规则中。 |
| `action_requires_keyed_leaf` | error | `require` / `optional` / `assign` 挂在带 key 叶子字段以外的节点上。 |
| `defaults_requires_keyed_leaf` | error | `defaults.required` 挂在带 key 叶子字段以外的节点上。 |
| `defaults_on_form_scope` | error | 表单级联动带有 `defaults` 块。 |
| `default_hidden_unreachable` | warning | 节点默认隐藏，而它自己的条件规则中没有任何一条会显示它。 |
| `target_key_empty` | warning | `set_field` 尚未选择目标。 |
| `target_key_unresolved` | warning | `set_field` 的目标在规则的值作用域中找不到对应的带 key 节点。 |
| `variable_empty` | warning | `set_variable` 没有填写变量名。 |
| `data_source_id_empty` | warning | `refresh_data_source` 动作或 `ref` 选项来源尚未选择数据源。 |
| `code_set_empty` | warning | `codeSet` 选项来源尚未选择字典。 |
| `value_malformed` | error | 动作取值不是 `literal` / `expression` 形态。 |
| `alert_level_invalid` | error | `alert` 的 `level` 不在 `ALERT_LEVELS` 中。 |
| `retrigger_invalid` | error | `retrigger` 不是 `"edge"` / `"always"`。 |
| `retrigger_ignored` | warning | 边沿触发条件下的副作用设置了 `retrigger`，而它在这里不起作用。 |
| `self_reference` | error | 写值型规则的条件读取的恰好是该规则写入的字段。 |
| `cycle_detected` | error | 写值型规则构成依赖环；消息中会写明环路。 |

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
