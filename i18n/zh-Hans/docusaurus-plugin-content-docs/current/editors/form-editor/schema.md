---
title: 表单 Schema
description: FormSchema 的块树结构——字段与容器类型、按设备划分的呈现方式、值作用域，以及布局尺寸。
---

# 表单 Schema

`FormSchema` 是 `FormEditor` 产出、`FormRenderer` 消费的单一制品——一个可被 JSON 序列化的普通对象。本页介绍它的结构；各节点上附加的条件行为模型见 [Linkage](./linkage.md)，详尽的导出表格见 [Reference](./reference.md)。

## 顶层结构

```ts
interface FormSchema {
  id: string;
  version: 2;
  variables?: FormVariable[];
  dataSources?: FormDataSource[];
  linkage?: FieldLinkage; // form-scope "events" — see Linkage
  presentations: {
    pc: PresentationLayer;
    mobile?: PresentationLayer;
  };
}
```

`variables`、`dataSources` 以及表单级 `linkage` 构成**共享数据层**——无论设备如何，整个表单只有一份。`presentations` 保存各设备独立的布局。使用 `createEmptySchema()` 创建一份空文档（会铸造一个全新的 `id` 和一个空的 `pc` 呈现层）。

## 按设备划分的呈现方式

```ts
interface PresentationLayer {
  gap?: GapScale; // "small" | "medium" | "large", default "medium"
  children: Block[];
}
```

`pc` 与 `mobile` 是两棵独立的节点树——同一份表单可以在两种设备上采用完全不同的布局，同时两者绑定的是相同的 `variables` / `dataSources` 以及相同的字段 `key`。`pc` 始终存在；`mobile` 在其设计开始之前一直是 `undefined`，对于未设计过的设备，`FormRenderer` 会显示空状态，而不是回退到 `pc`。

**设计可以不同，数据层不行。** 某个字段只存在于一种设备上、或者两种设备都有但摆在不同的容器里、顺序也不一样——这些都是合理的差异。**分叉的 key** 不是：两棵树命名的是同一个值，所以 `setFieldKey` 会在同一个撤销步骤里连带重命名另一台设备上的孪生字段（在相同值作用域下绑定同一个 key 的那个字段），并且是针对**两棵树**在该作用域下已经绑定的全部 key 去分配新 key，冲突时依次追加 `_2`、`_3`……。放任二者漂移会给后端塞一个幽灵字段——[审批投影](../approval-form-bridge.md#投影规则)会把两种设备的根作用域带 key 节点折叠成一份按 key 去重的清单，于是一个分叉会把同一个字段投影成两个。

有两条边界值得知道。`validateSchema` 检查 id 与 key 唯一性时是**按呈现方式分别检查**的——两棵设备树各自拥有独立的命名空间——所以跨设备这条保证来自编辑器 store 的重命名动作，而不是来自校验。另外，key 的**铸造**（拖入新字段、复制一个字段）仍然只针对当前设备的 layer 分配。

有几个辅助函数用于在按设备划分的 `FormSchema` 与引擎实际遍历的扁平 `PresentationLayer` 之间搭桥：

| 导出 | 签名 | 用途 |
| --- | --- | --- |
| `currentLayer` | `(schema, device) => PresentationLayer` | 某设备的可编辑层；未设计的 `mobile` 会解析为一个稳定的共享空图层。 |
| `resolvePresentation` | `(schema, device) => PresentationLayer \| undefined` | 与上者相同，但对未设计的设备返回 `undefined`（而非回退值）——这是渲染时的语义。 |
| `withPresentation` | `(schema, device, layer) => FormSchema` | 将一个图层写回某个设备，不改动另一设备与共享数据层。 |
| `emptyLayer` | `() => PresentationLayer` | 共享的空图层常量。 |
| `toRuntimeSchema` | `(schema, device) => RuntimeSchema \| undefined` | 将某设备的图层与共享数据层拍平为渲染器和联动引擎实际求值所用的 `RuntimeSchema`。 |

### PC 到移动端的转换

`convertPresentation(pc, rules, targetRegistry)` 会从一个 PC 图层出发，产出一个"尽力而为"的单列移动端起点：它会剥离仅限 PC 的布局属性（`span` / `flex`），通过展开 `flex` / `grid` 容器来重排它们（其子节点会原地拼接进来，因为手机没有并排布局的概念），将 `code-editor` 降级为 `textarea`（移动端没有代码控件），并丢弃移动端注册表中没有对应类型的一切——同时返回一份 `ConversionReport`，记录哪些内容转换成功、哪些被丢弃，供宿主展示。`createDefaultConversionRules()` 构建的是编辑器默认使用的规则集；如需为自定义字段扩展转换行为，可以通过 `new ConversionRegistry().register({ type, convert })` 来扩展。

## 节点树

`PresentationLayer.children` 数组中的每一个节点——以及嵌套在容器内部的每一个节点——都是一个**节点（block）**：要么是叶子字段（`FormField`），要么是容器（`ContainerNode`）。

```ts
type Block = FormField | ContainerNode;
```

节点按文档流顺序**竖直**堆叠。没有隐式的多列行——并排布局始终是作者显式拖入的 `grid` 或 `flex` 容器。这样可以让节点树结构与视觉布局始终保持一致，无需另外维护一个"行"的概念来同步两者。

### 叶子字段

`FormField` 是所有已注册叶子类型的联合类型，以其 `type` 判别字段（`FormFieldTypeMap`）为键。与容器不同，这张映射表是**开放**的——宿主通过扩充模块，将自己的字段类型接口加入这个联合类型：

```ts
declare module "@vef-framework-react/form-editor" {
  interface FormFieldTypeMap {
    rating: RatingField;
  }
}
```

再搭配一个注册在 `FormFieldRegistry` 上的 `FieldDefinition`（见 [Embedding → 字段注册表](./embedding.md#字段注册表) 和 [Reference → 定义构建函数](./reference.md#定义构建函数)）。内置类型如下：

| `type` | 注册表导出 | 是否需要 key | 分组 | 说明 |
| --- | --- | --- | --- | --- |
| `textfield` | `textfieldDefinition` | 是 | basic-input | 单行文本；`inputType: "password"` 会将其遮罩显示 |
| `code-editor` | `codeEditorDefinition` | 是 | basic-input | 基于 CodeMirror 的多行代码；懒加载（整套技术栈中最重的依赖） |
| `number` | `numberFieldDefinition` | 是 | basic-input | 区分了输入**边界**（`min`/`max`，对已提交的值做钳制）与 `validate.min`/`max`（提交时的校验规则） |
| `textarea` | `textareaFieldDefinition` | 是 | basic-input | 多行文本 |
| `switch` | `switchFieldDefinition` | 是 | selection | 布尔开关；不实现 `Validatable`——开关始终持有一个值，因此静态的 `required` 没有意义（`require` 联动规则依然生效） |
| `select` | `selectFieldDefinition` | 是 | selection | 单选下拉框；`dataSource` 可以是 static / ref / remote |
| `radio` | `radioFieldDefinition` | 是 | selection | 单选按钮组；`optionType: "button"` 会渲染为分段控件 |
| `checkbox-group` | `checkboxGroupFieldDefinition` | 是 | selection | 多选；贡献一个数组类型的值 |
| `date` | `dateFieldDefinition` | 是 | date-file | 贡献一个 `YYYY-MM-DD` 字符串 |
| `datetime` | `datetimeFieldDefinition` | 是 | date-file | 贡献一个 `YYYY-MM-DD HH:mm:ss` 字符串 |
| `daterange` | `dateRangeFieldDefinition` | 是 | date-file | 贡献一个 `[start, end]` 字符串二元组 |
| `upload` | `uploadFieldDefinition` | 是 | date-file | 由存储服务支撑的文件上传；贡献一个对象 key（或一组 key）——见[下文](#多值字段与上传字段)。它由 `createDefaultRegistry()` / `registerDefaults()` 注册，并从包入口导出 |
| `button` | `buttonDefinition` | 否 | action | 非键控；`action`（html 的 `type`，默认 `"submit"`）与 `buttonType`（视觉样式）相互独立 |
| `divider` | `dividerDefinition` | 否 | presentation | 带可选内联标题的分节线 |
| `alert-block` | `alertBlockDefinition` | 否 | presentation | 内联提示横幅 |
| `paragraph` | `paragraphDefinition` | 否 | presentation | 静态说明文本 |

每个叶子字段都共享 `id`、`label`、`labelPosition`（`"top" | "left" | "right"`），以及[布局尺寸](#布局与尺寸)与[联动](./linkage.md)相关的插槽。标记为"需要 key"的字段还会额外携带一个 `key: string`（数据绑定路径）以及一个可选的 `columnType` 覆盖项（见[表存储投影](#表存储投影)）；大多数字段还实现了 `Validatable`（`validate: { required, minLength, maxLength, min, max, pattern, message }`）——`switch` 是上文提到的唯一例外。`validate.minLength` / `validate.maxLength` 统计的是**字符数（code point）**，与 Go 后端的 `utf8.RuneCountInString` 一致：一个 emoji 或一个增补平面的 CJK 字符在两端都只算一个，因此设计者只写一次的限制，在浏览器和服务端表示的是同一件事。而字段级的 `maxLength`（`textfield` / `textarea` 上的那个）是另一条轴——它是那个"打满 N 个就打不下去"的原生输入上限，由 DOM 强制执行，因此按 UTF-16 code unit 计数。各字段接口具体的属性（`placeholder`、`allowClear`、`size`、`dataSource`……）逐一记录在 [Reference](./reference.md#叶子字段接口) 中。

`mobileFieldDefinitions` 是与之平行的 antd-mobile 渲染器集合——涵盖除 `code-editor`（没有移动端控件；PC → 移动端转换器会将其降级为 `textarea`）之外的所有内置叶子类型，复用各 PC 字段的 `config` 与属性面板描述符，只替换了渲染用的 `Component`。

移动端的 `date` 与 `datetime` 选择器被显式指定了 `1900-01-01` … `2099-12-31 23:59:59` 的范围。antd-mobile 的 `DatePicker` 默认范围是"今年 ± 10 年"，**并且会在渲染滚轮之前先把传入的值夹取到这个窗口里**——于是一个存着 1980 年的出生日期打开时停在今天，什么都不动直接点确定就把今天写了回去，而触发器（它直接格式化存储值）显示的仍然是 1980。窗口之外的日期同样根本无法输入。PC 端的 `DatePicker` 不施加任何范围，而这个值在两种呈现方式之间是共享的，所以移动端的边界必须宽到不会对表单数据构成约束。移动端的 `daterange` 渲染的是 `CalendarPicker`，本身不带边界，从来不受影响。

### 多值字段与上传字段

**`checkbox-group` 的值按选项列表排序，而不是按点击顺序。** antd 的 `Checkbox.Group` 会按选项下标对它抛出的数组排序，而 antd-mobile 的则按勾选先后追加，所以同样的两次点击原本会在桌面端得到 `["read", "music"]`、在手机上得到 `["music", "read"]`——同一个用户意图落成两条不同的存储记录，并且任何人换一台设备重新提交都会凭空多出一个 diff。现在两端的渲染器都会在变更时归一化：值被排成选项列表自身的顺序，任何选项列表已经不再提供的条目会被丢弃，因为后端会拿字段枚举出的选项去校验选择结果，其余一律拒绝。归一化发生在用户的下一次勾选，所以一个陈旧的值不会仅仅因为远程选项列表加载完成就被改写。

**`upload` 字段保存的是存储对象 key，它的空值只有一种形态。** `maxCount` 取默认值 `1` 时，值是单个 key，空值是 `null`；`maxCount > 1` 时值是 key 数组，空值是 `[]`。"从未被碰过"与"被用户清空"刻意保持同一种形态，这样下游就不必去分辨两者。存储列也走同一条轴、而不是字符串那套规则——`inferColumnType` 在 `maxCount > 1` 时返回 `"json"`，否则返回 `"text"`，并且从不参考 `validate.maxLength`：后者约束的是字符串长度，而上传字段的约束是文件个数。

### 容器

容器是一个**封闭集合**——`ContainerNode = SectionNode | TabsNode | SubformNode | FlexNode | GridNode`。与叶子字段不同，宿主无法通过注册表添加新的容器种类（每一种都在引擎中内置了独特的值作用域与树遍历语义）；自定义布局通常需要塞进 `flex` 或 `grid` 内部实现。

| `type` | 注册表导出 | 是否需要 key | 是否开启值作用域 | 说明 |
| --- | --- | --- | --- | --- |
| `section` | `sectionDefinition` | 否 | 否 | `variant: "card"`（antd `Card`，永不折叠）或 `"collapse"`（antd `Collapse`，`defaultCollapsed`） |
| `tabs` | `tabsDefinition` | 否 | 否 | 有序的 `TabItem[]`（`{ id, label, children }`）；面板懒加载挂载 |
| `subform` | `subformDefinition` | **是** | **是** | 重复记录组——见[子表单](#子表单) |
| `flex` | `flexDefinition` | 否 | 否 | CSS flexbox 行/列；每个子节点由自身的 `flex: FlexSlot` 决定尺寸 |
| `grid` | `gridDefinition` | 否 | 否 | CSS grid，`columns`（默认 2，`1..24`）；每个子节点的 `span` 决定其宽度 |

`section`、`tabs`、`flex`、`grid` 都是纯布局容器：它们将外层的值作用域原样传递给自己的子节点。只有 `subform` 会开启一个新的值作用域。

### 子表单

`subform` 在自己的 `key` 下绑定一个 `Array<Record<string, unknown>>`；其 `template: Block[]` 是逐行字段集合，并且——在所有容器中独一无二地——**开启一个新的值作用域**：模板字段的 `key` 只需要在同一行的兄弟节点之间唯一，不需要在整个表单范围内唯一（它的运行时路径是 `lines[i].amount`，永远不会与根节点的 `amount`冲突）。`minRows` / `maxRows` 限定行数；`addLabel` 定制"添加"控件的文案。

有两种变体共享这套数据契约，仅在展示方式上有所不同：

- **`stack`**（默认）——每一行将其模板渲染为一列垂直堆叠、完全可编辑、各自独立布局的字段。支持嵌套与逐行联动。
- **`table`** —— 各行通过组件包的 `EditableTable` 渲染（仅限桌面端；移动端呈现方式始终回退到 `stack`）。由于每个模板字段都会成为一列，`table` 类型子表单模板中出现容器或非键控字段会被标记为 `subform_table_column`——这是一条警告（而非拒绝）；渲染器会跳过该节点。

## 值绑定与 key

会产出数据的节点都携带一个 `key`（`KeyedNode`）；有 key 的叶子字段或 `subform` 会收窄为 `KeyedNodeUnion`。key 是**按值作用域**唯一的，而不是全局唯一——根作用域与每个子表单模板的作用域都是相互独立的命名空间。

| 导出 | 签名 | 用途 |
| --- | --- | --- |
| `isKeyedNode` | `(node: Block) => node is KeyedNodeUnion` | 结构判定守卫，同时捕获带 key 的叶子字段和 `subform`。 |
| `isKeyedField` | `(field: FormField) => field is KeyedFormField` | 同上，但仅收窄到 `FormField` 联合类型。 |
| `createId` | `(prefix) => string` | 通过共享的 cuid2 生成器铸造一个节点 id（`Field_…`、`Section_…`、`Rule_…`……）。 |
| `generateUniqueKey` | `(layer, baseKey, scope?) => string` | 分配一个作用域内唯一的 key，依次尝试 `base`、`base_2`、`base_3`…… |
| `nextUniqueKey` | `(used: Set<string>, baseKey) => string` | 与上者相同的分配逻辑，但针对一个已收集好的 key 集合（用于在一次遍历中铸造多个 key）。 |
| `sanitizeKey` | `(key: string) => string` | 剥离所有非单词字符，确保用户手动输入的 key 永远不会破坏值路径的解析。 |

## 选项与数据源

选择类字段的 `dataSource: FieldOptionSource` 是以下三者之一：

```ts
type FieldOptionSource =
  | { kind: "static"; options: FieldOption[] }             // inline, resolved synchronously
  | { kind: "ref"; dataSourceId: string }                   // points at FormSchema.dataSources
  | { kind: "remote"; request: RemoteDataSourceRequest; mapping?: RemoteOptionMapping }; // inline RPC
```

`FormSchema.dataSources: FormDataSource[]` 保存表单全局、可复用的数据源（`{ id, name, kind: "static", options }` 或 `{ id, name, kind: "remote", request, mapping }`），`ref` 类型的数据源会按 id 指向它们。`RemoteDataSourceRequest`（`{ resource, action, version?, params? }`）与传输方式无关——这个包本身没有 `apiClient` 依赖；宿主通过 `DataSourceResolver` 来解析它（见 [Embedding → 加载远程选项](./embedding.md#加载远程选项)）。`params` 的每一项都是一个 `DynamicValue`，因此参数可以绑定到表单值上——级联下拉正是这样写出来的，子表单内的逐行级联也一样（见[绑定参数](./embedding.md#绑定参数)）。`RemoteOptionMapping`（`labelKey` / `valueKey` / `disabledKey` / `descriptionKey`，均默认为 `"label"` / `"value"`）负责把远程返回的原始记录映射为 `{ label, value }` 键值对。

`FormSchema.variables: FormVariable[]`（`{ id, name, type: "string" | "number" | "boolean" | "json", defaultValue? }`）声明了暴露给[联动表达式](./linkage.md)的表单全局 `$vars`。

## 布局与尺寸

一个节点最多携带一个有意义的布局属性，具体由其父节点决定——类型系统并不阻止同时设置多个属性，但只有父节点认可的那一个会真正生效：

| 属性 | 在何种节点下生效 | 结构 |
| --- | --- | --- |
| `span` | 作为 `grid` 的单元格时 | 整数 `1..24`（`ROW_COLS`）；省略表示占一列 |
| `flex` | 作为 `flex` 的子节点时 | `{ grow?, shrink?, basis? }` |
| `columnWidth` | 作为 `table` 子表单的一列时 | 固定像素宽度；省略则平分剩余宽度 |
| `stack` | 作为堆叠体（根节点 / `section` / `tabs` 面板 / `stack` 子表单的一行）的直接子节点时 | `{ width?, minWidth?, maxWidth?: CssLength, align?: "start" \| "center" \| "end" }`，`CssLength = { value: number; unit: "px" \| "%" }` |

`stack: StackSlot`（v2.10.0）用于在唯一一个原本让节点占满整行的父级上下文——堆叠体——中设置节点的尺寸与摆放位置。逐字段说明：

| `StackSlot` 字段 | 类型 | 默认值 | 效果 |
| --- | --- | --- | --- |
| `width` | `CssLength` | 省略时解析为 `100%` | 节点的 CSS `width`。`%` 相对于堆叠体的宽度，`px` 是绝对值。`value` 必须 ≥ 1——宽度为零的盒子会让节点坍缩。 |
| `minWidth` | `CssLength` | 省略 = CSS 默认值（`0`） | CSS `min-width` 下限；这里 `value` 取 `0` 是合法的（与 `width` / `maxWidth` 不同）。 |
| `maxWidth` | `CssLength` | 省略 = 不设上限 | CSS `max-width` 上限；`value` 必须 ≥ 1。与 `%` 形式的 `width` 组合可实现响应式尺寸（例如 `width: 100%` 配合 `maxWidth: 480px` 封顶）。 |
| `align` | `"start" \| "center" \| "end"` | 省略 = 文档流（视觉上等于 start） | 交叉轴上的摆放位置，通过自动 margin 实现，因此只有当 `width` / `maxWidth` 让节点窄于堆叠体时才会起作用——满宽时是空操作。 |

当父级是 `grid` / `flex` / `table` 类子表单时，该插槽会被忽略，此时生效的分别是 `span` / `flex` / `columnWidth`。`validateSchema` 在导入时会检查其形态（`stack_invalid`）：非记录类型的插槽、越界或格式错误的 `CssLength`，或未知的 `align` 都会失败。长度总是以显式的 `{ value, unit }` 形式书写——绝不使用原始 CSS 字符串——因此持久化下来的长度永远是一个合法、可再次编辑的尺寸。

堆叠体自身的垂直间距节奏是 `gap: GapScale`（`"small" | "medium" | "large"`，`DEFAULT_GAP_SCALE = "medium"`，合法取值见 `GAP_SCALES`），可设置在 `PresentationLayer` 本身，或设置在 `section` / `tabs` / `stack` 类子表单上——省略则继承表单级（或子表单级）的默认值。`linkage`（见 [Linkage](./linkage.md)）在**任意**节点上都生效，无论叶子字段还是容器。

## 编辑节点树

本节中的每一个修改器（mutator）都是纯函数（返回一个新的 `PresentationLayer`），并遵循一条身份契约：**空操作会原样返回输入引用本身**，成功的编辑只会重建从根节点到变更处的路径，因此每一个未受影响的分支都保留其先前的对象引用。正是这一点，让画布和运行时渲染器得以在数百字段规模下按引用对节点做 memo 化。

| 导出 | 签名 | 用途 |
| --- | --- | --- |
| `insertBlock` | `(layer, block, target: DropTarget) => PresentationLayer` | 在某个放置目标处插入一个节点（`{ kind: "beside", anchorId, side }`、`{ kind: "container", containerId, tabIndex? }`，或 `{ kind: "append" }`）。 |
| `moveBlock` | `(layer, nodeId, target) => PresentationLayer` | 移动一个已有节点；若移动跨越了值作用域，会为其重新分配 key。事务性操作——如果目标未能落位，会自动回滚。 |
| `cloneBlock` | `(block, allocateKey: ((base: string) => string) \| null) => Block` | 深拷贝并为所有节点重新铸造 id；`allocateKey` 会在克隆体自身的作用域内重新分配 key，传 `null` 则原样保留（用于已经处于隔离作用域内的子表单模板）。 |
| `setSpan` / `setFlex` | `(layer, blockId, value) => PresentationLayer` | 规范化并写入某个节点的 grid span / flex 插槽。 |
| `editField` | `(layer, fieldId, updater: (field: FormField) => FormField) => PresentationLayer` | 对按 id 匹配到的某个叶子字段应用一个纯更新函数。 |
| `removeBlock` | `(layer, id) => PresentationLayer` | 移除树中任意位置的一个节点。**不会**清理指向其 key 的悬空联动引用——这是叠加在其上的编辑器 store 层需要关心的事。 |
| `updateNode` | `(layer, id, updater: (node: Block) => Block) => PresentationLayer` | 对按 id 匹配到的任意节点（字段或容器）应用一个纯更新函数。 |

使用 `walkNodes` / `walkFields`（深度优先访问器，接收每个节点及其所处的外层作用域——即它所在的一串子表单 key 组成的链条）、`findNode` / `findField` / `findParentContainer`，以及 `isContainerNode` / `isLeafField` 类型守卫来读取/查询节点树。

## 校验导入的 schema

`FormEditor` 自身的修改器始终产出结构良好的树。`validateSchema(candidate: unknown, registries: DeviceRegistries): ValidateSchemaResult` 是针对**非**来自编辑器的 schema（粘贴导入、API 载荷）的边界守卫。它会检查数据信封、每个呈现层内 id/key 的唯一性与 key 的语法规则、span 取值范围、[stack 插槽形态](#布局与尺寸)（v2.10.0）、已知字段类型（对照你传入的注册表）、选项数据源的结构，并在结构性检查通过后委托给 `validateLinkageSchema`（见 [Linkage → 校验](./linkage.md#校验)）。只要没有*error*级别的问题，结果就是 `valid`（并携带收窄后的 `schema`）——*warning*级别的问题（悬空引用、空条件组）属于编写过程中的合法中间状态，会在导出→导入的往返过程中保留下来。

## 表存储投影

对于将已提交的值持久化到关系型数据库、每个带 key 字段对应一列的宿主，`toColumnDefinitions(schema): ColumnDefinition[]` 会将每个根作用域内带 key 的叶子字段（跨两种设备呈现方式去重，冲突时以 `pc` 为准）投影为一条 `{ key, columnType, maxLength?, precision? }` 记录。`columnType: ColumnDataType`（`"string" | "text" | "integer" | "decimal" | "boolean" | "date" | "datetime" | "json"`）由 `inferColumnType(field)` 根据控件类型确定性地推断得出，并优先尊重字段显式设置的 `columnType` 覆盖项——只有 `number`（整数还是小数，取决于 `precision`）、`upload`（`json` 还是 `text`，取决于 `maxCount`）以及字符串家族（有长度限制的 `string` 还是不限长度的 `text`，取决于 `validate.maxLength`）足够模糊，才各自需要一条规则。

## Approval flow editor 桥接

`toFormFieldDefinitions(schema): FormFieldDefinition[]` 会将同一份根作用域带 key 字段清单，扁平化为粗粒度的 `{ key, kind: FieldKind, label, options? }` 结构，供 `@vef-framework-react/approval-flow-editor` 通过其 `EditorPlugins.formFields` 接口消费，驱动其按节点划分的字段权限矩阵。`FieldKind` 是一个有损的、取最大公约数的集合（`"input" | "textarea" | "select" | "number" | "date" | "upload"`），与 Go 后端的 `FieldKind` 共用。

这份映射刻意保持简单，**并非**权威的审批集成路径——对于审批后端集成，应改用 [`@vef-framework-react/approval-form-bridge`](../approval-form-bridge.md) 中的 `projectFormSchema` 来投影 schema。它只遍历一次 schema，就同时推导出一份更丰富的 `FormFieldDefinition[]`（作为 `formFields`）以及 Go 后端自身解析器所期望的扁平化 `ApprovalFormField[]`（作为 `fields`），并遵循一条守恒规则——无法投影的带 key 字段永远会被上报为错误，绝不会被静默丢弃。本函数会把子表单折叠掉、把每种控件归并到最接近的 kind；而桥接包则会把子表单投影为携带 `columns` 的 `table` 条目，并为可能被联动隐藏的字段标注 `hasConditionalVisibility`，供流程编辑器的权限表使用。
