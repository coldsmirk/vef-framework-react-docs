---
title: 嵌入 Form Editor
description: 将 FormEditor 与 FormRenderer 接入宿主应用，从一行代码的开箱即用到完全自定义的外壳。
---

# 嵌入 Form Editor

本页介绍宿主集成：挂载设计器（`FormEditor`）、挂载运行时（`FormRenderer`）、注册自定义字段类型，以及宿主在构建自己的字段渲染器或属性面板时可用的扩展点。两个组件读写的 JSON 结构见 [Schema](./schema.md)；联动/表达式模型见 [Linkage](./linkage.md)。

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

`FormEditor` 会撑满其容器（`width: 100%; height: 100%`），因此宿主需要负责给它一个有明确尺寸的盒子——一个具有确定高度的 flex/grid 单元格，而不是自动高度的页面流。

值得关注的 `FormEditorProps`（完整表格见 [Reference](./reference.md#formeditor)）：

- **`initialSchema`** 和 **`registries`** / **`registry`** 只在挂载时读取一次——之后更新它们不会产生任何效果。挂载后如需替换文档，请使用 `FormEditorApi.setSchema`。
- **`onSchemaChange`** 在每次已提交的编辑上触发，参数为新的 `FormSchema`；**`onPublish`**（与 `publishText` / `publishLoading` 搭配使用）会先跑一遍校验——error 会阻止发布，warning 会请设计者确认——省略 `onPublish` 时，发布按钮根本不会渲染。
- **`apiRef`** 暴露 `FormEditorApi`：`getSchema` / `setSchema`、`undo` / `redo` / `canUndo` / `canRedo`、`selectNode`、`setDevice`、`setViewMode`。
- **`evaluators`**、**`dataSourceResolver`**、**`evaluationContext`**、**`contextSources`** 会转发给编辑器自身的实时预览——参见下文的 [Linkage](./linkage.md) 与[加载远程选项](#加载远程选项)。

内置的工具栏、组件面板与属性面板 UI 文案默认是中文（例如"发布" / "导入" / "导出"这类标签）。`brand`、`publishText` 和 `onPublish` 是工具栏的定制入口；如果宿主需要在全局范围内替换不同的界面文案，可以围绕相同的面板组合出自己的外壳（见下一节），或者完全提供自己的工具栏。

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

- **`FormEditor.Provider`**（也单独导出为 `FormEditorProvider`）是上下文根节点：编辑器 store、按设备划分的字段注册表，以及预览运行时（求值器 / 数据源解析器 / 求值上下文）。它接受 `FormEditorProps` 的所有属性，除了仅供工具栏使用的属性（`brand`、`onPublish`、`publishText`、`publishLoading`）。
- **`FormEditor.Shell`**（`FormEditorShell`）负责建立布局自适应测量、设备上下文、共享的拖放上下文，以及外壳级别的键盘快捷键（撤销/重做等）。它只接受 `children`。
- **`FormEditor.Workspace`**（`FormEditorWorkspace`）是水平排布的组件面板 / 画布 / 属性面板区域。
- **`FormEditor.Stage`**（`FormEditorStage`）是画布列（设计区域 + 表单配置抽屉 + 编辑模式状态栏）。它不接受任何属性——所有内容都从 store 中读取。
- **`FormEditor.Toolbar`**（也导出为 `FormEditorToolbar`）是默认工具栏，如果你只想替换品牌信息，可以独立使用它。
- **`FormEditor.Palette`** 和 **`FormEditor.Properties`** 分别是字段组件面板和属性面板；两者都从上下文中读取数据，且不接受任何属性。

## 字段注册表

编辑器和渲染器所知道的每一种字段与容器类型，都存放在一个 `FormFieldRegistry` 中。`createDefaultRegistry()` 会构建一个预置了约 20 种内置类型（`textfield`、`number`、`select`、`subform`、`grid`……）以及 antd 容器外观的 PC 端注册表；`createDefaultMobileRegistry()` 会构建对应的 antd-mobile 版本。当没有提供注册表时，`FormEditor` 会使用这些默认注册表。

```tsx
import { createDefaultRegistry, FormEditor } from "@vef-framework-react/form-editor";

const registry = createDefaultRegistry();

registry.register(ratingFieldDefinition);

<FormEditor registry={registry} />;
```

- **`registry`** 是"两种设备共用一份注册表"的简写形式；**`registries`**（`{ pc, mobile }`）允许两种设备拥有不同的字段集合。只需提供你要定制的设备，未提供的设备会回退到 `registry`，再回退到内置默认值。
- 使用 `defineFieldDefinition`（叶子字段——需要 `Component`）或 `defineContainerDefinition`（容器——结构化渲染，因此不需要 `Component`）来注册自定义字段类型。`FieldDefinition` 的结构见 [Reference → 定义构建函数](./reference.md#定义构建函数)，自定义类型自身 schema 接口所要接入的 `FormFieldTypeMap` 模块扩充模式见 [Schema → 叶子字段](./schema.md#叶子字段)。
- `registerDefaults(registry)` 会将内置字段集合和 PC 容器外观应用到一个已存在的注册表上（而不是新建一个），适合宿主在自己的基础上组合内置类型的场景。
- `FormFieldRegistry` 是一个精简的可变类：`register` / `unregister` / `get` / `has` / `list`，`registerPropertyEntry` / `getPropertyEntry`（设计时的属性面板渲染器，按 `EntryType` 索引——见 [Reference](./reference.md#属性条目property-entries)），以及 `setContainerChrome` / `getContainerChrome`。每次变更都会通知订阅者（`subscribe`），因此如果你在挂载之后才注册字段，组件面板和属性面板也会实时更新。

### 替换容器外观

`section` / `tabs` / `subform` 通过 `ContainerChromeSet` 渲染——从当前激活的注册表中解析出的六个展示型外壳组件（`Section`、`Tabs`、`Subform`、`SubformRow`、`AddButton`、`RemoveButton`）。`flex` 和 `grid` 是纯 CSS 布局，不使用任何外观组件。要在不改动字段级渲染的前提下重新设计容器样式，可以构建一个 `ContainerChromeSet`，并在传给 `FormEditor` / `FormRenderer` 之前，在你自己的注册表上调用 `registry.setContainerChrome(chrome)`。

## FormRenderer

`FormRenderer` 将一个 `FormSchema` 渲染为实时的、数据绑定的表单——这是终端用户（而非表单的设计者）实际交互的对象：

:::info
`FormRenderer` 内部只安装了 `DeviceProvider`——与 `FormEditor` 不同，它并不提供 `RegistryProvider`。请用 `RegistryProvider` 包裹它（或某个共同的祖先节点），并传入它应渲染所依据的设备注册表；否则每个字段都会抛出 `"A <RegistryProvider> ancestor is required..."`。
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

`onSubmit` 接收到的提交值类型为 `Record<string, unknown>`——该表单没有编译期的值类型，因为它的结构只能在运行时从 schema 中得知。

值得关注的 `FormRendererProps`（完整表格见 [Reference](./reference.md#formrenderer)）：

- **`device`**（默认 `"pc"`）选择要渲染哪种呈现方式。没有设计过的设备（例如没有移动端设计的表单）会渲染空状态，而不是回退到另一种设备。`mobile` 呈现方式渲染的 antd-mobile 控件始终使用 `zh-CN` 语言环境，与宿主应用自身的语言环境无关。
- **`defaultValues`**、**`disabled`**、**`onSubmit`** 的行为与普通表单一致：只有当 schema 自身的校验规则通过后，`onSubmit` 才会触发。
- **`fieldPermissions`**（v2.10.0）是服务端为每个字段 key 解析出的钳制（`Record<string, FieldPermission>`）——它是联动可以在其内部收窄、但永远不能突破的外层边界（`"hidden"` 会彻底卸载该字段，`"visible"` 会将其渲染为只读，`"required"` 会强制执行非空校验，`"editable"` 则不受钳制）。这层钳制同样把关每一次程序化写入（`assign` / `set_field`），并把提交负载过滤到只剩可写的 key。其标准来源是审批引擎为当前查看者解析出的某个审批节点的权限矩阵，但任何宿主侧解析出的映射都可以。见 [Linkage → 字段权限钳制](./linkage.md#字段权限钳制)。
- **`apiRef`** 暴露 `FormRendererApi`：`submit()`（运行与 schema 中 `submit` 按钮相同的校验流程）、`reset()`、`getValues()`（原始的实时状态），以及 `getSubmitValues()`（`onSubmit` 此刻将收到的、经过滤后的精确载荷——v2.10.0）——供模态框底部确认按钮之类的宿主界面元素使用。
- **`evaluators`**、**`dataSourceResolver`**、**`evaluationContext`** 与编辑器同名属性一一对应，驱动的是完全相同的联动引擎——见 [Linkage](./linkage.md)。
- **`containOverlays`** 会将移动端浮层选择器（遮罩/弹出层）固定在渲染器自身的盒子内，而不是浏览器视口——只在 `device="mobile"` 时有意义，用于桌面端的"手机边框"预览场景。

## 加载远程选项

`select` / `radio` / `checkbox-group` 字段的 `dataSource` 可以是 `static`（内联选项，同步解析）、`ref`（指向表单全局的 `FormSchema.dataSources` 条目），或 `remote`（渲染时解析的 RPC 形态请求）。该包自身没有任何网络依赖——远程数据源通过宿主提供的 `DataSourceResolver` 解析：

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

不传入解析器（默认使用 `noopDataSourceResolver`）会让每个远程数据源都解析为空列表，而不是报错。如果你正在构建一个**自定义字段组件**，需要相同的解析逻辑（static / ref-to-static 同步解析，remote / ref-to-remote 带加载/错误状态与结果缓存的异步获取），可以在被同一个 `DataSourceProvider`（编辑器和渲染器已经安装好的那个）包裹的组件内部调用 `useFieldOptions(field.dataSource)`——你几乎不需要自己安装 `DataSourceProvider`。

## 构建自定义字段渲染器

字段定义的 `Component` 接收 `FieldComponentProps`（`field`、`value`、`onChange`、`errors`、`domId`、`disabled`、`required`、`labelPosition`），可以自由渲染任何内容，但有几个导出的基础组件可以让自定义字段在视觉上与内置字段保持一致：

- **`FieldShell`** / **`Label`** 实现了大多数内置类输入字段共用的标签-控件布局（顶部/左侧/右侧标签位置、辅助文本、错误提示区)——少数字段（例如 `switch`）不经过 `FieldShell`，而是直接组合 `Label` 与字段 footer。
- **`useFieldRegistry()`** 和 **`useDeviceRegistries()`**（来自同一个 `DeviceProvider` / `RegistryProvider` 上下文）用于解析当前激活设备的注册表——适用于需要检查同级字段定义的自定义容器或字段。`FormEditor` 会自行安装这两个 provider；`FormRenderer` 只安装 `DeviceProvider`，因此单独挂载 `FormRenderer` 的宿主必须自行提供 `RegistryProvider` 祖先节点（见上文 [FormRenderer](#formrenderer)）。
- **`useMobileScopeContainer()`** 返回一个供 antd-mobile 弹出式控件（`Picker`、`DatePicker`……）使用的 `getContainer` 回调。当存在包裹的手机边框元素时（编辑器自身的设计时预览），它会解析到该元素；在真实的移动端运行时则回退到 `document.body`——请像内置移动端字段那样，将其接入你自定义移动端字段的弹出层。

`defineFieldDefinition`、`defineContainerDefinition` 以及完整的 `FieldComponentProps` / `FieldDefinitionConfig` 结构见 [Reference](./reference.md#定义构建函数)。

## 完整示例

一个将 `FormEditor` 与宿主上下文一起挂载的路由（取自框架自身的 playground）：

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
