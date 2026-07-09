---
title: 数据字典
description: 后端驱动的选项数据如何通过 dictionaryQueryFn 流入表单和搜索区域，并内置拼音搜索能力。
---

# 数据字典

数据字典是业务应用中出现频率最高的能力之一：后端定义的选项列表（状态值、分类、性别之类的枚举）被表单和搜索区域渲染为下拉选择，而不需要每个页面各自维护一份自己的选项列表。

## 数据字典的数据来源

通过 `createApp().render()` 提供字典查询函数：

```ts
createApp().render({
  appContext: {
    dictionaryQueryFn: findDataDictItems
  },
  ...
});
```

配置完成后，表单和搜索区域就可以使用：

```ts
import { useDictionaryQuery } from "@vef-framework-react/hooks";
import { useDataOptionsTreeSelect, useDictionaryOptionsSelect } from "@vef-framework-react/components";
```

- `useDictionaryQuery` —— 底层查询 hook，来自 `@vef-framework-react/hooks`
- `useDictionaryOptionsSelect` —— 对它的 `Select` 就绪封装，来自 `@vef-framework-react/components`
- `useDataOptionsTreeSelect` —— 对应 `TreeSelect` 的等价封装，同样来自 `@vef-framework-react/components`

## 示例

```tsx
const { gender } = useDictionaryOptionsSelect({
  gender: "common.gender"
});

// gender is a SelectProps that can be spread directly:
// <Select {...gender} />
```

对于更底层的访问场景（例如不需要渲染 `Select` 的时候），`useDictionaryQuery({ gender: "common.gender" })` 返回一个 `UseQueryResult`，其 `data?.gender` 的形态是 `DataOption[]`。

## 为什么拼音搜索很重要

VEF 的选项转换链路可以通过 `withPinyin` 自动为选项值补充拼音元数据，这意味着：

- 中文标签可以直接用中文搜索
- 完整拼音和拼音首字母也都可以使用

这对人员、部门、组织以及字典项这类场景尤其有用。`useDictionaryOptionsSelect` 如何与其它数据获取型 hook 一起融入一个字段，见 [表单](./forms.md)。

## 使用提示

当页面需要字典、树形工具、格式化或校验能力时，值得先查一下 `@vef-framework-react/shared` 以及相关的 hook——框架的设计目标就是减少页面层代码的重复劳动，而不是让每个页面都重新推导一遍同样的选项转换逻辑。`@vef-framework-react/shared` 的完整符号索引见 [Shared 包总览](../reference/shared/overview.md)。
