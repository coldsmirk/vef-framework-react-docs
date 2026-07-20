---
title: 本地化
description: VEF 内置中文界面文案的来源、如何切换 antd / dayjs / zod 的 locale、哪些文案支持覆盖，以及当前哪些仍然只有中文。
---

# 本地化

VEF 内置的唯一语言是简体中文：Ant Design 的 locale 是 `zh_CN`，`dayjs` 运行在 `zh-cn` 下，zod 校验消息是中文，框架组件的兜底文案也是中文字面量（`Bool` 渲染 `是`/`否`，`ActionButton` 的确认标题是 `确认提示`，编辑器的发布按钮是 `发布`）。

本篇讨论的是**框架自带界面文案的语言** —— 内置按钮标签、确认对话框、校验消息和日期格式化。VEF 不包含翻译框架：没有文案目录，没有 `t()` 函数，也没有按用户切换语言的能力。如果产品需要完整的多语言支持，请为自己的页面引入 i18n 库；本篇帮助你处理页面周围那些由框架提供的文案。

本篇的价值在于精确：下面每一行都明确说明某段文案**能否**被覆盖，以及通过什么机制。凡是标注为不可覆盖的，都是 v2.12.0 的事实，而非文档遗漏。

## 中文默认值从哪里来

有四个相互独立的层会产出中文文案，切换（或无法切换）的方式各不相同：

| 层 | v2.12.0 的接线方式 | 影响范围 |
| --- | --- | --- |
| Ant Design locale | [`ConfigProvider`](../components/config-provider.md) 硬编码了 `zh_CN` locale。`ConfigProviderProps` 没有 `locale` 属性。 | 所有 antd 内置文案：Modal/Popconfirm 的确定与取消、分页每页条数下拉、DatePicker 面板、Transfer、空状态等。 |
| dayjs 全局 locale | `@vef-framework-react/shared` 的 chrono 工具在首次被调用时，惰性地把 dayjs 全局 locale 设为 `zh-cn`（并注册插件）。见 [Chrono](../reference/shared/chrono-event-validation.md)。 | 框架工具以及你自己代码中 dayjs 的本地化输出（`LLLL` 类格式、相对时间）。 |
| zod 全局配置 | `@vef-framework-react/shared` 在包首次被导入时对其再导出的项目级 zod 实例调用 `z.config(zhCN())`。 | 所有未传自定义消息的校验器的默认校验消息。见[表单](./forms.md)。 |
| 组件兜底字面量 | 各组件把可见文案默认为中文字符串字面量。 | `Bool` 的 `是`/`否`、`ActionButton` 的 `确认提示`、ProSearch 的 `搜索`、编辑器的 `发布` 按钮，以及下方契约表中的所有条目。 |

## 切换全局 Locale

### Ant Design 内置文案

VEF 的 `ConfigProvider` 没有暴露 antd locale，但 antd 自己的 `ConfigProvider` 嵌套时会与外层合并 —— 未传入的属性（主题、前缀）保留框架的值。在路由树内嵌套一层即可：

```tsx
// A layout component that wraps every page (e.g. your root route)
import { ConfigProvider } from "antd";
import enUS from "antd/locale/en_US";

export function RootLayout({ children }: PropsWithChildren) {
  return <ConfigProvider locale={enUS}>{children}</ConfigProvider>;
}
```

两个注意事项，均已对照 v2.12.0 的接线验证：

- **在应用自己的依赖里声明 `antd`，且版本范围与框架一致**（v2.12.0 对应 `^6.5.0`）。覆盖生效的前提是你的导入解析到与框架同一份 antd 拷贝；出现第二份拷贝会产生独立的 React context，框架组件永远读不到。
- **命令式辅助函数仍停留在外层 locale。** `showConfirm`、`showSuccessAlert`、message 和 notification 辅助函数通过直接挂在框架 `ConfigProvider` 之下（在你嵌套的 provider *之上*）捕获的 context holder 派发。它们内置的确定/取消按钮仍是中文，除非每次调用时传 `okText` / `cancelText`（见契约表）。

### Zod 校验消息

框架在导入时用 `zh-CN` locale 配置共享的 zod 实例。zod 的 locale 配置是全局的、后调用者生效，因此在启动阶段（框架导入之后、渲染之前）切换一次即可：

```ts
import { z } from "@vef-framework-react/shared";
import { en } from "zod/locales";

z.config(en());
```

这只切换所有*默认*消息（例如显示 "Invalid input" 而不是对应中文）。你在校验器里传入的自定义消息 —— `z.string().min(2, "At least 2 characters")` —— 无论如何都不受影响。为了导入 `zod/locales`，需要在应用依赖里声明 `zod`；locale 对象是纯数据，不要求与框架是同一份 zod 拷贝。

### dayjs

dayjs locale **没有受支持的切换方式**。框架是惰性断言 `zh-cn` 的：第一次调用 chrono 工具（`getNow`、`formatDate`、`tryParseDate` 等）会执行一次性初始化并设置全局 locale，因此你在启动早期执行的 `dayjs.locale("en")` 会在之后被静默覆盖。如果你接受依赖这一内部行为，可以先强制触发一次性初始化，再进行覆盖：

```ts
import { getNow } from "@vef-framework-react/shared";
import dayjs from "dayjs";

getNow();           // forces the framework's one-time dayjs setup (zh-cn + plugins)
dayjs.locale("en"); // now safe — the framework will not re-assert zh-cn
```

应用的 `dayjs` 必须解析到与框架同一份拷贝（声明兼容的版本范围；框架在 v2.12.0 使用 `^1.11.21`）。注意 DatePicker/Calendar 的*面板*文案跟随 antd locale 而非 dayjs 全局设置 —— 且无论 locale 如何，`formatDuration` 始终输出 `天`/`小时`/`分钟`，季度格式固定为 `YYYY-Q季度`（两者均为硬编码）。

## 覆盖契约

框架提供的中文默认值及其覆盖机制，均已对照 v2.12.0 源码验证：

| 组件 / 区域 | 中文默认值 | 覆盖方式 |
| --- | --- | --- |
| [`Bool`](../components/bool.md) 标签 | `是` / `否` | `trueLabel` / `falseLabel` 属性 |
| [`ActionButton`](../components/action-button.md) 确认框 | `确认提示` / `确定要执行此操作吗？` | `confirmTitle` / `confirmDescription` 属性；确定/取消来自 antd locale |
| `ActionGroup` 按钮级确认框 | `确认提示` / `确定要{label}吗？` | 每个 action 的 `confirmTitle` / `confirmDescription` |
| `showConfirm()` 对话框 | 标题 `确认提示`；确定/取消来自 antd locale | 每次调用传 `title`、`okText`、`cancelText` |
| `showSuccessAlert()` 及同族 | 标题 `成功` / `提示` / `警告` / `错误`；按钮 `好的，知道了` | 每次调用传 `title`、`okText` |
| [`Form`](../components/form.md) 按钮 | `提交` / `重置` | `form.SubmitButton` / `form.ResetButton` 的 children |
| [`FormModal`](../components/form-modal.md) / [`FormDrawer`](../components/form-drawer.md) 底部 | `提交` / `重置` | `submitButtonProps` / `resetButtonProps`（设置 `children`） |
| [CRUD](./crud.md) 表单标题 | `创建` / `修改`（兜底 `表单`） | 调用 `openForm` 时传 `title` |
| CRUD 表单底部 | `提交` / `重置` | 按场景的 `formActionsRenderers` |
| [`ProSearch`](../components/pro-search.md) 按钮 | `搜索` / `重置` | `searchButtonProps` / `resetButtonProps`（设置 `children`） |
| [`ProTable`](../components/pro-table.md) 操作列表头 | `操作` | `operationColumn.title` |
| [`EditableTable`](../components/editable-table.md) 行操作 | `编辑` / `删除` / `保存` / `取消` | `operationColumn.texts` |
| `EditableTable` 操作列表头 | `操作` | `operationColumn.title` |
| `EditableTable` 表格文案（如空状态） | antd 表格默认值 | `locale` 属性，转发给底层表格（v2.12.0） |
| [`Upload`](../components/upload.md) 触发按钮 | `上传` | 传入 `children` |
| [FormEditor](../editors/form-editor/reference.md) / [ApprovalFlowEditor](../editors/approval-flow-editor/reference.md) 发布按钮 | `发布` | `publishText` 属性 |

不在此表中却渲染中文的内容，都收录在下方"仅中文"清单里。

## 实战示例：搭建英文管理后台

在 VEF v2.12.0 上交付英文产品所需的完整改动集。

启动阶段，在 `createApp().render()` 之前：

```ts
import { getNow, z } from "@vef-framework-react/shared";
import { en } from "zod/locales";
import dayjs from "dayjs";

z.config(en());     // English default validation messages
getNow();           // force the framework's one-time dayjs setup...
dayjs.locale("en"); // ...then win the locale (unsupported but effective; see above)
```

根布局，包裹所有路由页面：

```tsx
import { ConfigProvider } from "antd";
import enUS from "antd/locale/en_US";

<ConfigProvider locale={enUS}>{/* routes */}</ConfigProvider>
```

然后在契约表中的组件出现的地方逐一应用覆盖，例如：

```tsx
<Bool variant="radio" trueLabel="Yes" falseLabel="No" />

<ActionButton
  confirmable
  confirmTitle="Delete record"
  confirmDescription="This action cannot be undone."
>
  Delete
</ActionButton>

showConfirm("Publish this version?", { title: "Confirm", okText: "OK", cancelText: "Cancel" });

<ProSearch searchButtonProps={{ children: "Search" }} resetButtonProps={{ children: "Reset" }} />

<ProTable operationColumn={{ title: "Actions", width: 160, render: renderActions }} />

<EditableTable
  operationColumn={{
    title: "Actions",
    texts: { edit: "Edit", delete: "Delete", save: "Save", cancel: "Cancel" }
  }}
/>
```

由于默认值存在于各个组件而非全局配置，团队通常会把最常用的组件（`ActionButton`、`Bool`、`ProSearch`）包成薄薄的项目级组件，把英文文案一次性固化进去。

完成以上全部步骤后，下一节列出的界面仍是中文 —— 在决定用 VEF 做英文界面之前，请先确认这些界面是否会出现在你的产品里。

## 当前仅有中文的部分（v2.12.0）

以下文案没有覆盖属性、没有配置项，也没有 locale 钩子：

- **ProTable**：序号列表头 `序号`；列设置面板（`数据列设置`、`重置`、`固定在左侧` / `取消固定在左侧`、`固定在右侧`、`设置列宽`、`该列不支持设置列宽`、`当前列宽`、`未命名列`、`调整过列设置`）；分页汇总 `第 X - Y 条 / 共 N 条`（由框架渲染 —— antd locale 影响不到它）。
- **ProSearch**：高级搜索开关 `高级搜索`。
- **CRUD**：选择栏 `已选择 N 项` / `取消选择`。
- **EditableTable**：加行按钮 `新增记录`；保存校验的兜底提示 `请检查表单填写是否正确`（仅在拿不到校验器消息时显示）。
- **FormModal / FormDrawer**：缺少表单内容时的占位 `请提供表单内容`。
- **IconPicker**：搜索无结果状态 `无匹配图标`。
- **Chart**：加载遮罩 `加载中...`。
- **全局错误边界**（位于 `ConfigProvider` 内）：`出错了`、`重试`、`未知错误`。
- **`HttpClient`** 面向用户的消息：`请求超时`、`登录已过期, 请重新登录`、`发起请求失败: ...`、`...请联系管理员为您开通`，以及它的控制台诊断信息。见[错误处理](./error-handling.md)。
- **Chrono 工具**：`formatDuration` 的输出（`天` / `小时` / `分钟`）和 `YYYY-Q季度` 季度格式，与 dayjs locale 无关。
- **FormEditor 与 ApprovalFlowEditor 的界面文案**：工具栏、物料面板、属性面板、画布提示和发布拦截通知全部是中文产品文案 —— `publishText` 只能改发布按钮一处。如果需要不同的外壳文案，[嵌入指南](../editors/form-editor/embedding.md)介绍了如何围绕面板组合自己的外壳。Schema 校验消息同样仅有中文；请针对稳定的 `code` 和 `path` 编程，而不是 `message`。
- **FormEditor 移动端预览**：始终在 `zh-CN` locale 下渲染 antd-mobile，与宿主 locale 无关。
- **Starter 应用外壳**：登录页（含轮播欢迎语）、布局头部控件、页签右键菜单、主题设置面板、命令面板以及 403/404/错误页都没有 i18n 钩子。英文产品必须用自己的实现替换这些 starter 界面。
- **开发服务器启动加载页**文案（仅开发期，不会进入生产用户视野）。

## 最佳实践

- **在动工前确定产品语言。** 中文产品开箱即用；英文产品需要完成启动阶段的步骤加逐组件覆盖，并避开（或替换）上面列出的仅中文界面。
- **把覆盖集中到包装组件里。** `confirmTitle` 这类文案属性是按实例生效的；一个薄薄的项目级 `ActionButton` 包装组件能把英文默认值收敛到一处，而不是散落在各个页面。
- **英文界面下调用命令式辅助函数时务必传 `okText` / `cancelText`** —— 嵌套的 antd locale provider 影响不到它们。
- **永远不要匹配框架的消息字符串。** HTTP 错误、编辑器校验和辅助函数提示都是中文产品文案；请基于代码分支（`ApiResult` 的 code、校验的 `code` / `path`），它们在未来任何本地化工作中都保持稳定。
- **把编辑器当作中文界面对待。** 如果设计器（FormEditor、ApprovalFlowEditor）会在英文产品中直接面向最终用户，请规划自定义外壳 —— 内置界面文案目前不可本地化。
