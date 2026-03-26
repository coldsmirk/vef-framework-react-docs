---
sidebar_position: 1
title: Components 包总览
---

# Components 包总览

`@vef-framework/components` 是页面层最直接会接触到的包。为了避免文档重复翻译一遍 Ant Design，这一组参考文档按两类能力拆开:

1. **VEF 自研或增强导出**
2. **Antd 透传导出**

## 阅读方式

- 如果你要找框架自己的表单、权限、图标、动画、数据选项能力，优先看 [VEF 自研组件](./vef-components.md) 和 [表单与数据能力](./form-and-data.md)。
- 如果你只是确认某个组件是不是原样透传 Antd，直接看 [Antd 透传组件](./antd-pass-through.md)。

## Antd 透传组件的处理方式

对于 `components` 包中只是简单导出 Antd 组件的场景，这里遵循一条规则:

- 简要说明推荐使用场景
- 明确写出 Props 与 Antd 官方保持一致
- 直接给 Antd 官方文档链接

这样可以避免重复维护一整份“中文版 Antd 文档”。

## 重点自研能力

这一包里最值得优先掌握的自研能力包括:

| 能力 | 常见导出 | 什么时候优先用 |
| --- | --- | --- |
| 操作按钮 | `ActionButton`、`ActionGroup`、`OperationButton` | 需要异步点击、二次确认、批量动作 |
| 表单体系 | `useForm`、`useFormContext`、`withForm`、`withFieldGroup` | 新增、编辑、搜索表单 |
| 数据选项 | `useDataOptionsSelect`、`useDataOptionsTreeSelect`、`useDataOptionsTree` | 下拉、树选、字典选项 |
| 布局组件 | `Grid`、`Group`、`Stack`、`Center`、`ScrollArea` | 后台页表单、卡片、树表联动 |
| 主题与反馈 | `ConfigProvider`、`useThemeTokens`、`showSuccessMessage` 等 | 页面主题和统一反馈 |
| 动画与展示 | `CodeHighlighter`、`FlipText`、`SparklesText`、`TypingAnimation` | 文档、欢迎页、增强展示 |
| 权限展示 | `PermissionGate` | 按钮、卡片、操作项的权限控制 |

## 导出覆盖策略

这组参考页会覆盖:

- 所有公开导出组件
- 所有 `components` 包公开导出的 hooks / helpers
- 所有主题与反馈相关基础导出

如果你是从业务页面反查 API，推荐先看:

1. [VEF 自研组件](./vef-components.md)
2. [表单与数据能力](./form-and-data.md)
3. [Antd 透传组件](./antd-pass-through.md)
