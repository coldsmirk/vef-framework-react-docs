---
title: 表单
description: VEF 的表单层如何把 useForm、字段组件和数据驱动的选项组合成一个典型的页面表单。
---

# 表单

VEF 的表单能力主要来自 `@vef-framework-react/components`，两个主要入口是：

- `useForm()`
- `useFormContext()`

可以把它理解为对 TanStack Form 的一层面向企业级场景的 UI 封装。完整的字段组件列表和所有共享的 `FormItemProps` 字段见 [Form 表单](../components/form.md)；本篇聚焦于一个表单是如何被组装起来的。

## 典型用法

```tsx
import { Grid, useDictionaryOptionsSelect, useFormContext } from "@vef-framework-react/components";
import { z } from "@vef-framework-react/shared";

const validators = {
  name: z.string("Required").min(2, "At least 2 characters"),
  gender: z.string("Required")
};

export function UserForm() {
  const { AppField } = useFormContext<{ name: string; gender: string }>();

  const { gender } = useDictionaryOptionsSelect({
    gender: "common.gender"
  });

  return (
    <Grid columnGap="small">
      <Grid.Item span={12}>
        <AppField name="name" validators={{ onBlur: validators.name }}>
          {field => <field.Input required label="Name" />}
        </AppField>
      </Grid.Item>

      <Grid.Item span={12}>
        <AppField name="gender" validators={{ onChange: validators.gender }}>
          {field => <field.Select {...gender} required label="Gender" />}
        </AppField>
      </Grid.Item>
    </Grid>
  );
}
```

## `useForm()` 创建表单实例

```tsx
import { useForm } from "@vef-framework-react/components";

const {
  Form,
  AppField,
  SubmitButton
} = useForm({
  defaultValues: {
    keyword: ""
  },
  onSubmit({ value }) {
    console.log(value);
  }
});
```

## `useFormContext()` 更适合拆分后的表单

当一个表单被拆分成多个独立组件时，通常不需要再创建一个新的表单实例，而是可以从上下文中取到 `AppField`：

```tsx
const { AppField } = useFormContext<FormValues>();
```

一旦表单规模超出单个组件，这就是应该采用的模式——搜索栏、场景相关的表单主体、操作按钮区的页脚，都可以从同一个表单上下文中取出 `AppField`，而不必通过 props 层层传递表单状态。

## 用 `z` 做校验

```tsx
import { z } from "@vef-framework-react/shared";

const validators = {
  username: z.string("Required").min(2, "At least 2 characters").max(16, "At most 16 characters"),
  email: z.email().nullish()
};
```

`@vef-framework-react/shared` 重新导出了一个已按项目配置好的 Zod 实例，因此校验器无需额外依赖即可与代码库的其余部分保持一致。

## 向选项类字段中灌入数据

VEF 应用通常会避免在字段组件内部发起请求。取而代之的是，用 hook 生成可以直接展开到控件上的 props，让数据来源和字段渲染各自成为独立的关注点。

### Select

```tsx
const roleSelectProps = useDataOptionsSelect({
  filterable: true,
  queryOptions: {
    queryKey: [findRoleOptions.key],
    queryFn: findRoleOptions
  }
});
```

### Tree Select

```tsx
const deptTreeSelectProps = useDataOptionsTreeSelect({
  filterable: true,
  queryOptions: {
    queryKey: [findDepartmentTree.key],
    queryFn: findDepartmentTree
  }
});
```

### 数据字典

```tsx
const { gender } = useDictionaryOptionsSelect({
  gender: "common.gender"
});

// <field.Select {...gender} />
```

`useDictionaryOptionsSelect(keys, options?)` 返回一个 `{ alias: SelectProps }` 映射。传入 `{ filterable: true }`（或针对某个 key 单独传入 `{ key: { key: "...", filterable: true } }`）可以启用拼音搜索——底层数据的来源见 [数据字典](./data-dictionaries.md)。

## 为什么要做这种拆分

把数据来源（`useDataOptionsSelect()`、`useDictionaryOptionsSelect()` 等）与字段渲染（`AppField`）和布局（`Grid`）分开，意味着：

- 选项加载逻辑可以在新建表单、编辑表单和搜索栏之间复用
- 字段组件永远不需要知道自己的选项到底来自字典、查询还是树形数据
- 更换某个字段的数据来源不会影响它的布局或校验逻辑

完整的可用字段组件列表（`field.Input`、`field.Select`、`field.Bool` 等）见 [Form 表单](../components/form.md)。
