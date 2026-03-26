---
sidebar_position: 2
title: 组件
---

# 组件

`@vef-framework/components` 是整个框架最直接面向业务页面的一层。  
它不是简单地“把 Ant Design 重新导出一遍”，而是在保留主流组件心智模型的前提下，补上了 VEF 需要的主题、消息通知、表单适配、权限控制、图标与图表能力。

## 先记住这几个入口

| 类型 | 常用 API |
| --- | --- |
| 基础 UI | `Button`、`Card`、`Tag`、`Text`、`Modal`、`Drawer` |
| 表单 | `useForm`、`useFormContext`、`Select`、`TreeSelect`、`Upload` |
| 页面布局 | `Grid`、`Group`、`Stack`、`Flex`、`Center` |
| 表格 | `Table`、`usePaginationProps` |
| 权限 | `PermissionGate` |
| 图标 | `Icon`、`DynamicIcon` |
| 图表 | `Chart`、`useChart` |
| 提示反馈 | `showSuccessMessage`、`showErrorNotification` 等 |

## 为什么大多数页面只需要从这里导入 UI

在 VEF 项目里，页面层通常直接从 `@vef-framework/components` 导入组件，而不是自己再拼很多第三方组件组合。原因有三点:

1. 样式主题已经和框架其他能力对齐。
2. 一些组件已经和数据选项、权限、图标等能力自然打通。
3. 你不需要在业务层重新思考“这个控件应该怎么和框架上下文一起工作”。

## `createApp()` 已经帮你包了主题容器

只要你用的是 `starter.createApp().render()`，组件层必需的容器已经自动挂上:

- `ConfigProvider`
- `ThemeConfigProvider`
- 消息和通知容器
- Emotion / css-in-js 环境

这意味着页面组件里一般不需要再额外手工包一层全局 Provider。

## 页面里最常见的组件组合

```tsx
import { Button, Card, Group, Tag, Text } from "@vef-framework/components";

export function UserCard() {
  return (
    <Card>
      <Group justify="space-between">
        <Text strong>张三</Text>
        <Tag color="success">启用</Tag>
      </Group>

      <Button type="primary">编辑</Button>
    </Card>
  );
}
```

## 布局类组件怎么选

| 组件 | 适合场景 |
| --- | --- |
| `Grid` | 表单和信息区域的栅格排布 |
| `Group` | 水平排列按钮、标签、统计项 |
| `Stack` | 垂直堆叠模块 |
| `Flex` | 更自由的弹性布局 |
| `Center` | 居中空态、加载态 |

## 反馈类 API 很值得直接用

VEF 统一导出了消息和通知方法，页面里可以直接调用:

- `showSuccessMessage`
- `showErrorMessage`
- `showWarningMessage`
- `showInfoNotification`
- `showErrorNotification`

这些 API 和框架自身的请求层反馈风格一致，所以业务代码最好也沿用它们，而不是引入另一套 toast 体系。

## `PermissionGate`

按钮级权限控制推荐直接用:

```tsx
import { PermissionGate } from "@vef-framework/components";

<PermissionGate permTokens="sys:user:create">
  <Button type="primary">新增用户</Button>
</PermissionGate>
```

如果你想根据权限决定渲染什么，也可以传函数子节点。

## `Icon` 与 `DynamicIcon`

`Icon` 适合把 Lucide 图标安全地接进 VEF 组件体系:

```tsx
import { Icon } from "@vef-framework/components";
import { PlusIcon } from "lucide-react";

<Icon component={PlusIcon} />
```

`DynamicIcon` 则更适合菜单、后端返回图标名的场景:

```tsx
<DynamicIcon name="users" />
```

## 数据选项型组件

如果页面里有大量下拉、树选、级联选择，不要手写选项转换逻辑。  
优先配合这些 hook 一起用:

- `useDataOptionsSelect`
- `useDataOptionsTreeSelect`
- `useDataOptionsTree`

它们会把后端数据或数据字典转换成组件可以直接消费的结构。

## 一个实际使用建议

页面层优先从 `components` 取组件和 UI 相关 hook，从 `core` 取数据与状态，从 `starter` 取页面级骨架。  
这样职责会非常清晰，不容易把页面写成一团。
