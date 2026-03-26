---
sidebar_position: 3
title: 布局与页面容器
---

# 布局与页面容器

VEF 在页面布局上有两层核心能力:

- 应用级布局: `Layout` / `BaseLayout`
- 页面级容器: `Page` / `FlexCard`

## `Page` 是业务页最常见的入口

如果一个页面不是 CRUD 页，也不是特别复杂的自定义布局，通常直接从 `Page` 开始:

```tsx
import { Page } from "@vef-framework/starter";

<Page title="系统监控">
  页面内容
</Page>
```

它支持:

- `title`
- header / footer
- 左右侧栏
- 页面级 margin 控制

## `CrudPage` 其实也是基于 `Page`

这也是为什么你会感觉 CRUD 页和普通业务页视觉结构很一致。  
VEF 在这层已经帮你统一了页面容器心智。

## `FlexCard`

当你需要一个更灵活的内容卡容器，尤其是左右结构、列表+详情、树+表单这种页面时，`FlexCard` 很实用。

## `Layout`

应用壳层级别的布局一般不需要你从零实现，而是通过 `createLayoutRouteOptions()` 驱动。  
菜单、用户区、标签页、内容区这些结构都应该放在布局路由层。

## 推荐实践

- 普通页面优先用 `Page`
- 树表联动或分栏面板优先考虑 `FlexCard`
- 应用整体导航结构交给 `Layout`
