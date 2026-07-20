---
title: Form Editor 概览
description: 一款专为数百字段规模的表单打造的可视化拖拽式表单设计器与 schema 驱动运行时渲染器。
---

# Form Editor 概览

`@vef-framework-react/form-editor` 既是一个可视化表单设计器，也是一个运行时渲染器，两者共享同一套引擎。设计者将字段拖拽到画布上，在属性面板中配置校验和联动规则，最终产出一个单一的 JSON 值——一个 `FormSchema`——供宿主应用存储、版本化，并通过 `FormRenderer` 在任意位置渲染。

这里没有代码生成步骤，也没有第二套"运行时"格式：驱动编辑器实时预览的字段渲染器、布局引擎和联动求值器，同样也驱动着 `FormRenderer`。设计者在搭建表单时所见到的样子，就是终端用户运行该表单时所见到的样子。

## 何时使用

当表单的形态需要**由开发者以外的人来编写**时——比如管理员配置一个信息收集表单，或业务用户搭建一个审批申请表单——就适合使用表单编辑器；又或者当你的应用需要管理大量结构相似但并不完全相同的表单时（工作流节点表单、按租户定制的字段、动态问卷）也是如此。如果一个表单的字段在开发时就已固定，那么更简单的做法是使用普通的 [`useForm`](../../components/form.md) 封装，它不需要额外的 schema 层。

该引擎专为**数百字段规模的表单**做了明确调优：schema 的修改器（mutator）使用结构共享，因此单个字段的编辑只会重建通往该字段的路径；画布行与运行时字段单元格都基于这种共享结构做了 memo 化；联动表达式/脚本的编译结果也会被缓存——因此某一字段中的一次按键不会重新求值或重新渲染其余 300 个字段。设计器的界面同样针对大型表单做了调优（v2.10.0）：选中一个节点——包括拖放之后，被移动的节点现在会保持选中——会让画布滚动到它所在的位置；拖动容器时提起的是一枚紧凑的小卡片，而不是整棵嵌套子树（这样下方的放置区域依然可见）；选择类字段的静态选项可以在属性面板中通过拖拽重新排序。

## `FormEditor` / `FormRenderer` 的划分

| | 设计时 | 运行时 |
| --- | --- | --- |
| 组件 | [`FormEditor`](./embedding.md#formeditor) | [`FormRenderer`](./embedding.md#formrenderer) |
| 输入 | 可选的 `initialSchema` | 编辑器产出的 `FormSchema` |
| 输出 | 一个 `FormSchema`（通过 `onSchemaChange` / `onPublish` / `FormEditorApi.getSchema`） | 提交的表单值，通过 `onSubmit` |
| 面向对象 | 搭建表单的人 | 填写表单的人 |

两者都读取自同一份字段类型 [`FormFieldRegistry`](./embedding.md#字段注册表) 和同一套[联动引擎](./linkage.md)，因此为编辑时注册的自定义字段类型或自定义联动求值器，在运行时同样自动可用——不需要手动做任何同步。

## 两种设备呈现方式

一个 `FormSchema` 承载**一份共享数据层**（变量、数据源、表单级联动，以及每个字段的数据绑定 `key`）和**两套独立布局**：`presentations.pc` 与 `presentations.mobile`。每种呈现方式都是一棵独立的字段树，因此同一份表单可以在桌面端（antd）和移动端（antd-mobile）采用不同的布局，同时两者绑定的是同一套底层数据。`pc` 始终存在；`mobile` 是可选的——没有设计移动端版式的表单，在该设备上只会渲染一个空状态。完整结构见 [Schema](./schema.md#按设备划分的呈现方式)，PC 到移动端的最佳努力起点转换见 [`convertPresentation`](./schema.md#pc-到移动端的转换)。

## 可扩展性

字段集合、表达式语言、选项加载策略都没有硬编码进这个包中：

- **字段类型**是 [`FormFieldRegistry`](./embedding.md#字段注册表) 中的条目——你可以通过 `defineFieldDefinition` / `defineContainerDefinition` 在约 20 个内置类型之外（或代替它们）注册自己的类型。
- **联动表达式与脚本**默认是通过 `new Function` 编译的纯 JavaScript，但宿主可以通过提供 [`LinkageEvaluators`](./linkage.md#可插拔求值器) 换成沙箱化引擎或完全不同的 DSL。
- **选择类字段的选项**默认是内联静态列表；`remote` 或指向远程的 `ref` 数据源，会通过宿主提供的、基于你自己的 `apiClient` 构建的 [`DataSourceResolver`](./embedding.md#加载远程选项) 来解析——这个包本身没有任何网络依赖。

## 定位

Form Editor 是三个[可视化编辑器](../overview.md)包之一。它不依赖另外两者，独立使用也很有价值（适用于任何宿主希望让终端用户自行配置的表单）。当一个表单要接入审批流程时，[`@vef-framework-react/approval-form-bridge`](../approval-form-bridge.md) 会将其 `FormSchema` 投影为后端的审批契约，以及 [`@vef-framework-react/approval-flow-editor`](../approval-flow-editor/overview.md) 的条件构建器和权限矩阵所需的字段清单。

## 后续内容

- [Embedding](./embedding.md) —— 将 `FormEditor` 与 `FormRenderer` 接入宿主应用。
- [Schema](./schema.md) —— `FormSchema` 的结构、字段与容器类型、布局与尺寸。
- [Linkage](./linkage.md) —— 条件性的显示/隐藏/必填、计算值与副作用。
- [Reference](./reference.md) —— 精简的导出、属性与类型表格。
