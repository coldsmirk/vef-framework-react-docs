---
sidebar_position: 4
title: 表单
---

# 表单

VEF 的表单能力主要来自 `@vef-framework/components`，核心入口只有两个:

- `useForm()`
- `useFormContext()`

你可以把它理解成: **TanStack Form 的一层企业级 UI 封装**。

## 最常见的使用姿势

```tsx
import { Grid, useDataOptionsSelect, useFormContext } from "@vef-framework/components";
import { z } from "@vef-framework/shared";

const validators = {
  name: z.string("必须").min(2, "最少2个字符"),
  gender: z.string("必须")
};

export function UserForm() {
  const { AppField } = useFormContext<{ name: string; gender: string }>();

  const genderSelectProps = useDataOptionsSelect({
    dataDictKey: "common.gender"
  });

  return (
    <Grid columnGap="small">
      <Grid.Item span={12}>
        <AppField name="name" validators={{ onBlur: validators.name }}>
          {field => <field.Input required label="姓名" />}
        </AppField>
      </Grid.Item>

      <Grid.Item span={12}>
        <AppField name="gender" validators={{ onChange: validators.gender }}>
          {field => <field.Select {...genderSelectProps} required label="性别" />}
        </AppField>
      </Grid.Item>
    </Grid>
  );
}
```

## `useForm()` 负责创建表单实例

```tsx
import { useForm } from "@vef-framework/components";

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

## `useFormContext()` 适合表单拆分

当表单被拆到独立组件时，不需要重新创建表单实例，只需要从上下文取 `AppField`:

```tsx
const { AppField } = useFormContext<FormValues>();
```

## 校验推荐用 `z`

```tsx
import { z } from "@vef-framework/shared";

const validators = {
  username: z.string("必须").min(2, "最少2个字符").max(16, "最多16个字符"),
  email: z.email().nullish()
};
```

## 选项型字段怎么接数据

VEF 推荐不要在字段内部自己发请求，而是先通过 hook 生成可直接展开到控件上的 props。

### 下拉框

```tsx
const roleSelectProps = useDataOptionsSelect({
  filterable: true,
  queryOptions: {
    queryKey: [findRoleOptions.key],
    queryFn: findRoleOptions
  }
});
```

### 树选择

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
const genderSelectProps = useDataOptionsSelect({
  dataDictKey: "common.gender"
});
```

## 常用字段类型

- `field.Input`
- `field.Password`
- `field.TextArea`
- `field.Select`
- `field.TreeSelect`
- `field.Bool`
- `field.Upload`
- `field.DatePicker`
- `field.InputNumber`

页面里尽量让“数据来源”和“字段展示”解耦:

- `useDataOptionsSelect()` 负责拿选项
- `AppField` 负责绑定字段
- `Grid` 负责排版
