---
sidebar_position: 1
title: 表单扩展与自定义组件
---

# 表单扩展与自定义组件

VEF 并不要求你永远只使用框架内置字段。  
当内置字段不够时，优先考虑在现有表单体系上扩展，而不是脱离 `useForm()` 另起一套。

## 先看已有扩展点

`@vef-framework-react/components` 在表单层导出了:

- `withForm`
- `withFieldGroup`
- `useFormContext`

这意味着你可以在保留现有表单上下文、校验和布局能力的前提下继续封装。

## 推荐扩展方式

最常见的扩展方向有两个:

1. 组合多个现有字段，形成业务组件
2. 在已有字段外再包一层场景语义

例如:

```tsx
function UserBaseFields() {
  const { AppField } = useFormContext<UserFormValues>();

  return (
    <>
      <AppField name="name">
        {field => <field.Input label="姓名" required />}
      </AppField>

      <AppField name="remark">
        {field => <field.TextArea label="备注" />}
      </AppField>
    </>
  );
}
```

## 扩展时的原则

- 保留 VEF 的 `AppField` 心智
- 让复用发生在“字段组合”层，而不是再造表单状态层
- 先组合已有字段，再考虑新增底层适配器
