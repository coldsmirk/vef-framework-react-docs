---
sidebar_position: 2
title: 包级 API 地图
---

# 包级 API 地图

这一页不展开讲内部实现，只告诉你“遇到什么需求，应该先去哪个包找哪个导出”。

## `@vef-framework-react/starter`

适合解决:

- 应用入口
- 路由
- 登录与布局
- CRUD 页面

优先查看:

- `createApp`
- `createRouter`
- `createApiClient`
- `Page`
- `ProTable`
- `CrudPage`
- `createCrudKit`

## `@vef-framework-react/components`

适合解决:

- UI 组件
- 表单字段
- 数据选项型控件
- 消息通知
- 图标与图表
- 主题 token 与 CSS 变量

优先查看:

- `globalCssVars`
- `useThemeTokens`
- `useIsDarkMode`
- `useForm`
- `useFormContext`
- `useDataOptionsSelect`
- `Table`
- `PermissionGate`
- `Icon`
- `Chart`

## `@vef-framework-react/core`

适合解决:

- query 与 mutation
- store 与 atom
- 权限判断
- HTTP 与 SSE

优先查看:

- `useQuery`
- `useMutation`
- `createStore`
- `createComponentStore`
- `atom`
- `checkPermission`

## `@vef-framework-react/hooks`

适合解决:

- 数据字典
- 选项转换
- 加载状态判断
- 权限配置过滤

优先查看:

- `useDataDictQuery`
- `useDataOptionsQuery`
- `useHasFetching`
- `useHasMutating`
- `useAuthorizedItems`

## `@vef-framework-react/shared`

适合解决:

- 校验
- 格式化
- 树结构处理
- 事件总线

优先查看:

- `z`
- `EventEmitter`
- `formatDate`
- `flattenTree`
- `mapTree`

## `@vef-framework-react/dev`

适合解决:

- Vite 配置
- ESLint
- Stylelint
- Commitlint

优先查看:

- `defineViteConfig`
- `defineEslintConfig`
- `defineStylelintConfig`
- `defineCommitlintConfig`

## `@vef-framework-react/approval-flow-editor`

适合解决:

- 审批流设计器嵌入
- 审批流 JSON 结构编辑
- 节点选择插件接入

优先查看:

- `ApprovalFlowEditor`
- `toFlowDefinition`
- `fromFlowDefinition`
- `EditorPlugins`
