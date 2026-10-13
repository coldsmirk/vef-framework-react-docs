---
title: 嵌入 Form Editor
description: 将 FormEditor 与 FormRenderer 接入宿主应用——属性、宿主诊断、系统变量、远程选项与接口目录、提交流程，以及自定义字段渲染器。
---

# 嵌入 Form Editor

本页介绍宿主集成：挂载设计器（`FormEditor`）、挂载运行时（`FormRenderer`）、把宿主的上下文、诊断与选项接口提供给两者、注册自定义字段类型，以及宿主在构建自己的字段渲染器时可用的扩展点。两个组件读写的 JSON 结构见 [Schema](./schema.md)；联动/表达式模型见 [Linkage](./linkage.md)。

## FormEditor

嵌入设计器最快的方式是使用预先组合好的 `FormEditor`：

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

`FormEditor` 会撑满其容器（`width: 100%; height: 100%`，最小高度 480px），因此宿主需要负责给它一个有明确尺寸的盒子——一个具有确定高度的 flex/grid 单元格，而不是自动高度的页面流。

值得关注的 `FormEditorProps`（完整表格见 [Reference](./reference.md#formeditor)）：

- **`initialSchema`** 和 **`registries`** / **`registry`** 只在挂载时读取一次——之后更新它们不会产生任何效果。挂载后如需替换文档，请使用 `FormEditorApi.setSchema`。`initialSchema` 与 `setSchema` 都不做校验；对不是你自己产出的 schema，请先运行 [`validateSchema`](./schema.md#校验导入的-schema)。
- **`onSchemaChange`** 在文档发生任何变化时触发，参数为新的 `FormSchema`——每次已提交的编辑、撤销 / 重做、导入、清空以及 `setSchema` 都会触发，但初始 schema 不会。
- **`onPublish`**（与 `publishText` / `publishLoading` 搭配使用）会渲染工具栏上的「发布」按钮；省略它时，按钮根本不会渲染。发布前会先运行编辑器自身的校验以及宿主的 [`validate`](#宿主诊断)：任何 error 都会以"表单存在 N 个错误，已阻止发布"的提示阻止发布，warning 则列在一个确认对话框里，设计者可以确认后继续发布。
- **`apiRef`** 暴露 `FormEditorApi`：`getSchema` / `setSchema`（导入语义——撤销历史与当前选中都会被重置）、`undo` / `redo` / `canUndo` / `canRedo`、`selectNode`、`setDevice`、`setViewMode`。
- **`evaluators`**、**`dataSourceResolver`**、**`evaluationContext`** 会转发给编辑器的实时预览及其 JSON 分屏视图，因此自定义表达式引擎、真实的远程选项和宿主上下文在那里的表现与运行时完全一致——见 [Linkage](./linkage.md) 与[加载远程选项](#加载远程选项)。在宿主没有提供 `dispatchEffect` 时，预览会把 `alert` / `navigate` / `api_call` 副作用显示为提示消息。
- **`contextSources`** 声明宿主的**系统变量**——「变量」页会连同预览值一起列出、条件构建器会作为来源提供的那些上下文路径（`$applicant.departmentId`、`$globals.region`……）。见 [Linkage → 设计器中的系统变量](./linkage.md#设计器中的系统变量)。
- **`dataSourceApis`** 把远程选项来源变成从宿主接口目录中挑选——见[提供接口目录](#提供接口目录)。
- **`validate`** 把宿主自己的检查加进编辑器的诊断与发布关卡——见[宿主诊断](#宿主诊断)。

内置的工具栏、组件面板、属性面板与各个抽屉的 UI 文案都是中文（例如"发布" / "导入" / "导出"这类标签）。`brand`、`publishText` 和 `onPublish` 是工具栏的定制入口；如果宿主需要在全局范围内替换不同的界面文案，可以围绕相同的面板组合出自己的外壳（见下文），或者完全提供自己的工具栏。

### 布局与快捷键

编辑器测量的是**它自己的宽度**，而不是视口宽度，因为宿主外壳可能已经占用了一部分水平空间：

- 宽度不小于 1220px 时为**停靠**布局：296px 的组件面板和 400px 的属性面板分列画布两侧，工具栏显示全部操作。
- 低于该宽度时切换为**抽屉**布局：属性面板脱离成一个全高的浮层，组件面板收缩为图标栏，工具栏把「导入」/「导出」/「清空」收进「更多」菜单，视图切换按钮只保留图标，并隐藏字段计数。

键盘快捷键监听的是编辑器自身的根节点，因此同时挂载的两个编辑器不会互相响应对方的按键，宿主页面也保留自己的按键处理。焦点位于输入框、文本域、下拉框或可编辑内容中时，快捷键会被忽略；预览模式下全部快捷键都不生效：

| 按键 | 动作 |
| --- | --- |
| `Delete` | 删除选中的节点（仅编辑模式）；若会连带清理引用它的规则，先弹出确认 |
| `Cmd/Ctrl + D` | 在下方复制选中的节点（仅编辑模式；JSON 视图下也会拦截该按键，避免浏览器弹出收藏对话框） |
| `Cmd/Ctrl + Z` | 撤销 |
| `Cmd/Ctrl + Shift + Z`、`Cmd/Ctrl + Y` | 重做 |
| `Esc` | 取消选中 |

`Backspace` 有意没有绑定为删除。撤销历史在两种设备之间是全局的——撤销时视图会跳到改动发生的那个设备——最多保留 100 步，并且从不记录视图状态（设备、视图模式、选中项）。

## 组合你自己的外壳

`FormEditor` 是通过 `Object.assign` 拼装其各个部件而成的，因此需要不同排布方式的宿主——自定义工具栏、重新排布的面板——可以直接组合这些相同的部件，而不使用预制布局：

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

- **`FormEditor.Provider`**（也单独导出为 `FormEditorProvider`）是上下文根节点：编辑器 store、按设备划分的字段注册表、预览运行时（求值器 / 数据源解析器 / 求值上下文，以及系统变量的预览值）、系统变量、宿主校验器与接口目录。它接受 `FormEditorProps` 的所有属性，除了仅供工具栏使用的属性（`brand`、`onPublish`、`publishText`、`publishLoading`）。
- **`FormEditor.Shell`**（`FormEditorShell`）负责建立布局自适应测量、设备上下文、共享的拖放上下文，以及外壳级别的键盘快捷键。它只接受 `children`。
- **`FormEditor.Workspace`**（`FormEditorWorkspace`）是水平排布的组件面板 / 画布 / 属性面板区域，也是抽屉布局下属性浮层的定位锚点。
- **`FormEditor.Stage`**（`FormEditorStage`）是画布列：设计区域、表单配置抽屉，以及状态栏（仅编辑模式）。它不接受任何属性——所有内容都从 store 中读取。
- **`FormEditor.Toolbar`**（也导出为 `FormEditorToolbar`）是默认工具栏，如果你只想替换品牌信息，可以独立使用它。它从 provider 中读取宿主校验器，因此即便放在自定义外壳里，发布关卡依然完整。
- **`FormEditor.Palette`** 和 **`FormEditor.Properties`** 分别是字段组件面板和属性面板；两者都从上下文中读取数据，且不接受任何属性。

## 宿主诊断

编辑器会持续校验自己的 schema——结构、key、选项来源、联动。宿主往往在此之上还有自己的契约：审批后端不接受某些字段类型、存储层限制字段数量。`validate` 把这些检查加进编辑器的诊断，而不必由宿主自己渲染一个横幅（那会挤占画布的高度）：

```ts
type SchemaValidator = (schema: FormSchema) => readonly SchemaIssue[];

interface SchemaIssue {
  path: string;
  code: string;
  severity: "error" | "warning";
  message: string;
}
```

- 它只会在 schema 没有结构性 **error** 时被调用，并收到这个 schema——因此可以假定树是结构良好的。它只返回宿主自己的问题；结构性问题归编辑器管。它的 `code` 属于宿主自己的命名空间。
- 它的问题与编辑器自己的问题一起出现在画布底部的**状态栏**里。那里的提示在存在 error 时显示"N 项问题"，只有 warning 时显示"N 项提示"，schema 干净时则完全隐藏。点击它会展开完整列表——每一行先是问题描述，再是它的路径——点击某一行就会把设计者带到问题所在：选中对应节点（必要时切换设备；画布会把它滚动到可见区域），或打开它所属的表单配置页签。
- 它的问题同样进入**发布关卡**：宿主的 error 会像结构性 error 一样阻止发布，宿主的 warning 会列在确认对话框里。
- 校验以过渡优先级、在 schema 的延迟副本上运行，因此输入永远不必等它。请传入一个**稳定的函数**——放在模块作用域或用 `useCallback` 包裹；函数身份变化会触发重新校验。

状态栏能够定位的 `path` 有以下几种形式：

| 路径形式 | 定位到 |
| --- | --- |
| 字段 key 链——`amount`、`lines.price`（子表单 `lines` 的 `price` 列） | 该作用域下带此 key 的节点，优先在当前显示的设备上查找 |
| `presentations.<pc\|mobile>.children[0].tabs[1].children[2]…` | 路径能到达的最深节点 |
| `node[<id>]…` | 该节点，优先在当前显示的设备上查找 |
| `variables…` / `dataSources…` / `linkage…`、`schema.linkage…` | 「变量」/「数据源」/「联动」页签 |

宿主应当输出的正是字段 key 链：它用宿主熟悉的方式指明字段，审批桥接包的问题也已经采用这种形式。信封路径（`id`、`version`）或指向已不存在节点的路径会被列出，但不可点击。

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

审批相关的包自带了一个：`approval-form-bridge` 的 [`validateApprovalProjection`](../approval-form-bridge.md#validateapprovalprojection) 会报告审批后端将会拒绝的内容，审批设计器就把它作为 `validate` 传入。

## 字段注册表

编辑器和渲染器所知道的每一种字段与容器类型，都存放在一个 `FormFieldRegistry` 中。`createDefaultRegistry()` 会构建一个预置了 21 种内置类型——16 种叶子字段（`textfield`、`number`、`select`、`upload`……）和 5 种容器（`section`、`tabs`、`subform`、`flex`、`grid`）——以及 antd 容器外观的 PC 端注册表；`createDefaultMobileRegistry()` 会构建对应的 antd-mobile 版本（除 `code-editor` 外的所有类型）。当没有提供注册表时，`FormEditor` 会使用这些默认注册表。

```tsx
import { createDefaultRegistry, FormEditor } from "@vef-framework-react/form-editor";

const registry = createDefaultRegistry();

registry.register(ratingFieldDefinition);

<FormEditor registry={registry} />;
```

- **`registry`** 是"两种设备共用一份注册表"的简写形式；**`registries`**（`{ pc, mobile }`）允许两种设备拥有不同的字段集合。只需提供你要定制的设备，未提供的设备会回退到 `registry`，再回退到内置默认值。简写形式同样会让两种设备共用一套容器外观。
- 使用 `defineFieldDefinition`（叶子字段——需要 `Component`）或 `defineContainerDefinition`（容器——结构化渲染，因此不需要 `Component`）来注册自定义字段类型。`FieldDefinition` 的结构见 [Reference → 定义构建函数](./reference.md#定义构建函数)，自定义类型自身 schema 接口所要接入的 `FormFieldTypeMap` 模块扩充模式见 [Schema → 叶子字段](./schema.md#叶子字段)。
- `registerDefaults(registry)` 会将内置字段集合和 PC 容器外观应用到一个已存在的注册表上（而不是新建一个），适合宿主在自己的基础上组合内置类型的场景。
- `FormFieldRegistry` 是一个精简的可变类：`register` / `unregister` / `get` / `has` / `list`，`registerPropertyEntry` / `getPropertyEntry`（设计时的属性面板渲染器，按 `EntryType` 索引——见 [Reference](./reference.md#属性条目property-entries)），以及 `setContainerChrome` / `getContainerChrome`。每次变更都会通知订阅者（`subscribe`），因此如果你在挂载之后才注册字段，组件面板和属性面板也会实时更新。

### 替换容器外观

`section` / `tabs` / `subform` 通过 `ContainerChromeSet` 渲染——从当前激活的注册表中解析出的六个展示型外壳组件（`Section`、`Tabs`、`Subform`、`SubformRow`、`AddButton`、`RemoveButton`）。`flex` 和 `grid` 是纯 CSS 布局，不使用任何外观组件。要在不改动字段级渲染的前提下重新设计容器样式，可以构建一个 `ContainerChromeSet`，并在传给 `FormEditor` / `FormRenderer` 之前，在你自己的注册表上调用 `registry.setContainerChrome(chrome)`。

有一个属性很容易被忽略，但绝不能忽略：**`SubformChromeProps.errors`（`string[]`）必须被渲染出来。** 一个子表单为整个数组只挂载一个字段，因此它自身的错误——必填子表单的"至少一行"，以及 `table` 变体上卷起来的行内错误——没有别的落脚点；忽略它们的外观会在屏幕上不显示任何东西的情况下阻断提交。两套内置外观都把它们渲染在主体下方，用的是叶子字段所用的同一个 footer。

## FormRenderer

`FormRenderer` 将一个 `FormSchema` 渲染为实时的、数据绑定的表单——这是终端用户（而非表单的设计者）实际交互的对象：

:::info
`FormRenderer` 内部只安装了 `DeviceProvider`——与 `FormEditor` 不同，它并不提供 `RegistryProvider`。请用 `RegistryProvider` 包裹它（或某个共同的祖先节点），并传入它应渲染所依据的设备注册表；否则每个字段都会抛出 `"A <RegistryProvider> ancestor is required..."`。
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

`onSubmit` 接收到的提交值类型为 `Record<string, unknown>`——该表单没有编译期的值类型，因为它的结构只能在运行时从 schema 中得知。

值得关注的 `FormRendererProps`（完整表格见 [Reference](./reference.md#formrenderer)）：

- **`device`**（默认 `"pc"`）选择要渲染哪种呈现方式。没有设计过的设备（例如没有移动端设计的表单）会渲染空状态（"此设备尚未配置表单"），而不是回退到另一种设备。`mobile` 呈现方式渲染的 antd-mobile 控件始终使用 `zh-CN` 语言环境，与宿主应用自身的语言环境无关。
- **`defaultValues`**、**`disabled`**、**`onSubmit`** 的行为与普通表单一致——见[默认值](#默认值)与[提交](#提交)。
- **`fieldPermissions`**（v2.10.0）是服务端为每个字段 key 解析出的钳制（`Record<string, FieldPermission>`）——它是联动可以在其内部收窄、但永远不能突破的外层边界（`"hidden"` 会彻底卸载该字段，`"visible"` 会将其渲染为只读，`"required"` 会强制执行非空校验，`"editable"` 则不受钳制）。这层钳制同样把关每一次程序化写入（`assign` / `set_field`），并把提交负载过滤到只剩可写的 key。其标准来源是审批引擎为当前查看者解析出的某个审批节点的权限矩阵，但任何宿主侧解析出的映射都可以。见 [Linkage → 字段权限钳制](./linkage.md#字段权限钳制)。
- **`apiRef`** 暴露 `FormRendererApi`：`submit()`（运行与 schema 中 `submit` 按钮相同的流程）、`reset()`、`getValues()`（原始的实时状态），以及 `getSubmitValues()`（`onSubmit` 此刻将收到的、经过滤后的精确载荷——v2.10.0）——供模态框底部确认按钮之类的宿主界面元素使用。
- **`evaluators`**、**`dataSourceResolver`**、**`evaluationContext`** 与编辑器同名属性一一对应，驱动的是完全相同的联动引擎——见 [Linkage](./linkage.md)。渲染器按插槽逐个读取 `evaluationContext`，因此传入内联对象字面量不会让表单每次都重新渲染；`variables` 也只有在内容变化时才会重新播种 `$vars`。
- **`containOverlays`** 会将移动端浮层选择器（遮罩/弹出层）固定在渲染器自身的盒子内，而不是浏览器视口——只在 `device="mobile"` 时有意义，用于桌面端的"手机边框"预览场景。

### 默认值

表单挂载时，每个根作用域的带 key 字段都会得到一个值槽——提供了 `defaultValues[key]` 就用它，否则用该类型的空值：

| 字段类型 | 空值 |
| --- | --- |
| `number` | `undefined` |
| `switch` | `false` |
| `checkbox-group`、`daterange` | `[]` |
| `upload` | `maxCount` 为 1（默认）时为 `null`，否则为 `[]` |
| 其余带 key 类型 | `""` |
| `subform` | 提供的各行，每行都合并在一个空白行之上，因此缺少的模板 key 仍会拿到自己的值槽；未提供时为 `minRows` 个空白行 |

`defaultValues` 中携带的、schema 并未声明的 key 不会进入表单，因此也永远不会到达 `onSubmit`。

### 提交

一次提交——schema 里的 `submit` 按钮，或 `apiRef.submit()`——走的是同一条流程：

1. **校验，以 schema 为准。** 根作用域以及每个子表单行中的每个带 key 字段都会被检查，无论是否已挂载——antd 对标签页面板与折叠区块是懒挂载的，因此一个从没被打开过的面板里的必填字段同样会被拦下，错误会在该面板被访问时显示。实际处于隐藏或禁用状态的字段（由它自己的联动或某个祖先容器的联动导致）不参与校验。`table` 子表单会把第一条行错误显示在子表单自身上，并注明行与列。只要有任何错误，提交就在这里停止。
2. **`beforeSubmit`** 表单级副作用运行，并被等待完成，包括异步的宿主副作用。
3. **构建载荷**，基于第 2 步*之后*的实时值——因此 `beforeSubmit` 中的 `set_field` 会进入载荷。实际处于隐藏状态的字段整体剔除，被服务端钳制为 `"visible"` 或 `"hidden"` 的 key 也被剔除，子表单则逐行按各行自己的记录过滤。
4. **`onSubmit(payload)`** 运行并被等待完成。
5. **`afterSubmit`** 副作用运行。

`getSubmitValues()` 返回此刻第 3 步得到的载荷，既不校验也不运行副作用；`getValues()` 返回原始的实时状态，包括隐藏字段的值。

逐字段的规则：必填的字段（静态必填、`require` 规则或 `"required"` 钳制）在值为[空](./linkage.md#运算符)时报"此项为必填"。约束规则只作用于有值的情况——`minLength` / `maxLength` 作用于字符串，按字符（码点，与 Go 后端的 `utf8.RuneCountInString` 一致）计数；`min` / `max` 作用于数字；`pattern` 作用于字符串，用 `new RegExp(pattern).test(value)` 检验，它不带锚点，因此要约束整个值请写成 `^…$`。设置了 `validate.message` 时，它会替换每条约束规则的默认文案。已挂载的字段在值变化时也会运行同样的检查。

## 加载远程选项

`select` / `radio` / `checkbox-group` 字段的 `dataSource` 可以是 `static`（内联选项，同步解析）、`ref`（指向表单全局的 `FormSchema.dataSources` 条目），或 `remote`（渲染时解析的 RPC 形态请求）。该包自身没有任何网络依赖——远程数据源通过宿主提供的 `DataSourceResolver` 解析：

```ts
interface DataSourceResolver {
  resolve: (request: ResolvedDataSourceRequest, mapping?: RemoteOptionMapping) => Promise<FieldOption[]>;
}
```

`RemoteDataSourceRequest` 与 core `apiClient` 的 resource / action / version 寻址方式一致，因此 `createApiRequest` 构建出的信封与手写查询函数构建出的完全相同——只不过这里的接口来自渲染时的 schema。一个基于框架 API 客户端的解析器（取自框架的 playground，其中 `API_PATH` 是你的服务端暴露的 RPC 入口，在那里为 `"/api"`）：

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

运行时对解析器的保证：

- **纯数据。** 绑定参数已经求值完毕（见[下文](#绑定参数)），映射也已经[规范化](./schema.md#选项与数据源)——不会有空 key 抵达解析器，因此 `mapping?.labelKey ?? "label"` 可以放心使用。
- **按渲染器缓存。** 结果在 `FormRenderer` 的整个生命周期内缓存，缓存 key 是求值后的请求、映射以及该来源的刷新 nonce。在同一个渲染器下重新挂载的字段——比如再次打开的懒挂载标签页面板——会直接用缓存绘制选项，不再发起请求；而对某个被 `ref` 的来源执行 `refresh_data_source` 会改变缓存 key、强制重新获取。像上例那样用 `fetchQuery` 包装请求，还能在多个渲染器之间共享 TanStack Query 的缓存。
- **失败时保留上一份列表。** `resolve` 被 reject 时，字段保留已有的选项，打印一条注明来源的 `console.warn`，并通过 `useFieldOptions` 报告 `error: true`；刷新进行中同样保留旧选项，直到新结果到达，因此下拉框永远不会突然变空。

不传入解析器（默认使用 `noopDataSourceResolver`）会让每个远程数据源都解析为空列表，而不是报错——这看起来就像"框架从不发请求"，因此凡是 schema 可能携带远程来源的地方都要接好解析器。在设计器中，解析器驱动的是**预览**与 **JSON** 视图；编辑画布只解析静态选项和指向静态数据源的 `ref`。

如果你正在构建一个**自定义字段组件**，需要相同的解析逻辑（static / ref-to-static 同步解析，remote / ref-to-remote 带加载/错误状态与缓存的异步获取），可以在编辑器和渲染器已经安装好的 `DataSourceProvider` 之下渲染的组件里调用 `useFieldOptions(field.dataSource)`——你几乎不需要自己安装 `DataSourceProvider`。

### 绑定参数

`RemoteDataSourceRequest.params` 的类型是 `Record<string, DynamicValue>`——每个参数要么是 `{ kind: "literal"; value }`，要么是绑定到实时表单的 `{ kind: "expression"; source }`。级联下拉之所以能成立，靠的就是绑定参数——"上面选中的那个科室下面的病区"：

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

运行时会在请求抵达解析器**之前**先完成表达式求值——走的是 `evaluateAssignExpression`，与联动 `assign` 取值用的是同一个接缝，作用域也相同（`$form`、`$vars`、`$applicant`、`$globals`……），因此一套表达式语言同时覆盖两边——然后交出一个只携带纯数据的 `ResolvedDataSourceRequest`（`{ resource, action, version?, params?: Record<string, unknown> }`）。解析器根本不会知道曾经存在过表达式，从而保持纯传输层的角色。表达式既可以读字段，也可以读[系统变量](./linkage.md#宿主上下文与系统变量)：`$applicant.departmentId` 就能把列表限定在发起人所在的部门。

求值结果为 `undefined` 的参数会被**省略，而不是照样发送**——比如表达式读取了表单并不携带的 key，或者压根没有求值器可用的情况。把这个 key 带着 `undefined` 值发出去，等于在线上格式里留了个后端必须特判的洞；省略它则用每种传输方式本来就理解的词汇说了同一件事。而表单真正持有的空值（`""`）是一个值、不是缺失，会被照常发送。

选项缓存的 key 是**求值之后**的请求，因此绑定值发生变化会重新解析选项，无关按键则不会——而一个哪里都没有绑定参数的 schema，压根不会去订阅表单值。

### 逐行的参数作用域

绑定参数按**它自己所在的值作用域**求值：根级字段按整个表单求值，子表单行内的字段按该行自己的记录求值。因此两行各自选了不同科室时，会发出两个不同的请求，拿回两份不同的病区列表。

编写逐行级联的写法与根级完全一致——表达式直接写本行的同级 key，因为在行内 `field` / `$form` 绑定的就是当前作用域的值（见 [Linkage → 表达式与脚本求值](./linkage.md#表达式与脚本求值)）：

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

:::warning[行为变更]
选项解析此前无论字段位于哪个作用域，都把绑定参数放到整个表单上求值。在子表单行内，这意味着表达式读的是一个根本不存在的根级 key，于是参数被丢弃——又因为选项缓存的 key 是**求值之后**的请求，每一行发出的都是完全相同的无过滤请求，最终塌缩到同一份共享选项列表上。逐行级联在结构上就不可能成立，而不只是偶尔出错一次。`api_call` 效果那条链路本来就是按作用域求值的；现在两条链路给出的答案一致了。
:::

## 提供接口目录

手动填写 `resource`、`action` 和字段映射，等于要求表单设计者了解后端。`dataSourceApis` 让宿主把它已经维护好的接口交给设计器，于是远程来源变成一次挑选——"部门列表"——外加该接口需要的参数：

```ts
interface DataSourceApi {
  label: string;           // shown in the picker, e.g. "部门列表"
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
    label: "部门列表",
    group: "组织架构",
    resource: "sys/department",
    action: "find_options",
    mapping: { labelKey: "name", valueKey: "id" },
    params: [
      {
        name: "parentId",
        label: "上级部门",
        description: "不绑定则查询顶级部门",
        defaultValue: { kind: "expression", source: "$applicant.departmentId" }
      }
    ]
  }
];

<FormEditor dataSourceApis={FORM_DATA_SOURCE_APIS} dataSourceResolver={formDataSourceResolver} />;
```

有了接口目录，两种远程来源编辑器——「数据源」页中的表单全局数据源，以及字段内联的远程来源——都会以一个**接口**选择器打头：目录按 `group` 分组（未分组的条目排在最前），可按名称和接口地址搜索，最后是**自定义接口**，用于目录里没有的接口。

- **选中一个接口**会把它的 `resource` / `action` / `version` 以及规范化后的 `mapping` 存进 schema。每个声明的参数，若已经有同名参数绑定了值则保留该值，否则取它的 `defaultValue`；接口没有声明的参数属于之前那个接口，会被丢弃。
- **已选中的接口**会以只读形式显示它的说明、接口地址与字段映射，然后把它声明的参数显示为一行行具名的参数——每行带有名称（`required` 时带星号）、参数名与说明——设计者只需要绑定值，字面量或表达式均可。必填参数在未绑定时会标出"必填参数尚未绑定"，但请求仍会在缺少它的情况下发出。清空某个声明参数的字面量值，会把它从请求中移除，而不是发出一个空的过滤条件。下方仍可以添加自由参数行。
- **自定义接口**保留手动填写的编辑器：`resource` / `action` / `version`（清空的 version 会被省略，即使用默认值）、四个映射 key（清空的 key 会被省略，即使用其默认值），以及自由参数行。

接口目录**只在设计时使用**。选中的结果以请求本身的形式存储，因此 schema 是自包含的：运行时解析器、[审批投影](../approval-form-bridge.md#远程选项来源)以及其他所有消费者读的都是存下来的请求，永远不需要接口目录。一个已存储的请求靠接口地址——`resource` + `action` + `version`，其中省略的 version 与空 version 视为相同——被重新识别为某个接口，因此每个接口地址在目录中只应出现一次；不匹配任何条目的请求会以「自定义接口」打开。由于选中的接口与其他请求一样经由 `dataSourceResolver` 解析，解析器必须能服务目录中列出的每一个接口。

两种编辑器中的参数名都在失焦或按回车时才提交，并且只有在非空且未被占用时才会提交——草稿与已有参数名冲突时会显示"参数名已存在"——因此改名进行到一半时，永远不会把两行合并成一行，也不会存下一个名为 `""` 的参数。新添加的行在命名之前只保存在本地。

## 构建自定义字段渲染器

字段定义的 `Component` 接收 `FieldComponentProps`（`field`、`value`、`onChange`、`errors`、`domId`、`disabled`、`required`、`labelPosition`），可以自由渲染任何内容，但有几个导出的基础组件可以让自定义字段在视觉上与内置字段保持一致：

- **`FieldShell`** / **`Label`** 实现了大多数内置类输入字段共用的标签-控件布局（顶部/左侧/右侧标签位置、辅助文本、错误提示区）——少数字段（例如 `switch`）不经过 `FieldShell`，而是直接组合 `Label` 与字段 footer。当你的字段渲染出的是一**组**东西、而不是单个可被 label 关联的控件时（一个选项组、一个拖拽上传区），请传 `labelledBy="group"`：`<label for>` 对包裹用的 `div` 是无效的，不传的话这个字段就完全没有可访问名称——读屏软件会念出第一个选项，却从不念出问题本身。传了之后，外壳会把主体标注成 `role="group"` 并由标签为它命名，同时把 `aria-required` / `aria-invalid` 挂到它上面。用到它的内置字段是 `radio`、`checkbox-group`、`code-editor` 与 `upload`。
- **`useFieldRegistry()`** 和 **`useDeviceRegistries()`**（来自同一个 `DeviceProvider` / `RegistryProvider` 上下文）用于解析当前激活设备的注册表——适用于需要检查同级字段定义的自定义容器或字段。`FormEditor` 会自行安装这两个 provider；`FormRenderer` 只安装 `DeviceProvider`，因此单独挂载 `FormRenderer` 的宿主必须自行提供 `RegistryProvider` 祖先节点（见上文 [FormRenderer](#formrenderer)）。
- **`useMobileScopeContainer()`** 返回一个供 antd-mobile 弹出式控件（`Picker`、`DatePicker`……）使用的 `getContainer` 回调。当存在包裹的手机边框元素时（编辑器自身的设计时预览），它会解析到该元素；在真实的移动端运行时则回退到 `document.body`——请像内置移动端字段那样，将其接入你自定义移动端字段的弹出层。

对非 key 字段，`value` 为 `undefined`，`onChange` 是空操作；`required` 是实时的必填状态（静态、联动或钳制），标签上的星号正是由它驱动。`defineFieldDefinition`、`defineContainerDefinition` 以及完整的 `FieldComponentProps` / `FieldDefinitionConfig` 结构见 [Reference](./reference.md#定义构建函数)。

## 完整示例

一个挂载 `FormEditor` 的路由，接好了宿主的系统变量、预览上下文、选项接口、解析器与检查（改编自框架自身的 playground）：

```tsx
import type { DataSourceApi, EvaluationContext, LinkageContextSource } from "@vef-framework-react/form-editor";

import { FormEditor } from "@vef-framework-react/form-editor";

// What the preview evaluates against. In production the host fills these
// from the record being edited; preview values typed into the 变量 tab
// override them while designing.
const PREVIEW_CONTEXT: EvaluationContext = {
  applicant: { id: "u-1001", name: "张三", departmentId: "dept-finance", departmentName: "财务部" },
  globals: { region: "east" }
};

// The system variables the 变量 tab lists and the condition builder offers.
const SYSTEM_VARIABLES: LinkageContextSource[] = [
  { key: "$applicant.name", label: "发起人姓名" },
  { key: "$applicant.departmentId", label: "发起人部门 ID" },
  { key: "$applicant.departmentName", label: "发起人部门" },
  { key: "$globals.region", label: "所属区域" }
];

// Every endpoint here must be served by formDataSourceResolver.
const OPTION_APIS: DataSourceApi[] = [
  { label: "用户列表", group: "系统", resource: "sys/user", action: "find_options" },
  {
    label: "职员列表",
    group: "主数据",
    resource: "md/staff",
    action: "find_options",
    params: [{ name: "keyword", label: "关键字", description: "匹配工号、姓名、电话或邮箱" }]
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

所有常量都放在模块作用域，因此它们在渲染之间都不会改变身份。
