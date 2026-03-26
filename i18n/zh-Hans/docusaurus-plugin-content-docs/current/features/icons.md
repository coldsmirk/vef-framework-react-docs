---
sidebar_position: 4
title: 图标
---

# 图标

VEF 提供两种最常用的图标入口:

- `Icon`
- `DynamicIcon`

## `Icon`

适合你在代码里直接引用 Lucide 图标组件时使用:

```tsx
import { Icon } from "@vef-framework/components";
import { PlusIcon } from "lucide-react";

<Icon component={PlusIcon} />
```

## `DynamicIcon`

适合图标名由配置或后端返回的场景，比如菜单系统。

```tsx
import { DynamicIcon } from "@vef-framework/components";

<DynamicIcon name="users" />
```

它会自动:

- 懒加载图标资源
- 做缓存
- 遇到未知图标时给出兜底表现

## 菜单场景的典型用法

`createLayoutRouteOptions()` 在构造菜单项时就会把后端返回的 `icon` 字段接给 `DynamicIcon`，所以菜单系统天然适合走“后端下发图标名”的方式。

## 推荐实践

- 页面里固定写死的图标，用 `Icon`
- 来自菜单、配置、数据库的图标名，用 `DynamicIcon`
