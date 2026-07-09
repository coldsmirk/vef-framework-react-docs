---
title: 自定义表单组件
description: 使用 withForm、withFieldGroup 和 useFormContext 组合可复用的表单部件，而不是搭建一套平行的表单系统。
---

# 自定义表单组件

VEF 并不要求每个表单都局限于内置字段，也不要求把表单写成一个扁平的组件。  
当一个表单需要被拆分，或者一组字段需要被复用时，推荐的做法是扩展现有的表单系统，而不是在 `useForm()` 之外搭建一套平行系统。

## 现有的扩展点

`@vef-framework-react/components` 中的表单层暴露了三个组合 API，它们都是从 TanStack Form 的 `createFormHook()` 重新导出的:

- `useFormContext` —— 读取父组件已经创建好的表单实例，让子组件无需以 prop 形式接收表单就能渲染字段。这是最常用的一个；详见[表单](../guide/forms.md)。
- `withForm` —— 预先把一个渲染函数绑定到特定的表单形状上，使一个大表单可以被拆分为多个组件，而不会失去对 `name` 的字段类型检查。
- `withFieldGroup` —— 把一个渲染函数绑定到表单值的一个可复用切片（字段组）上，使同一个子表单（例如地址、联系方式块）可以挂载到不同父表单的不同路径下。

## 常见的扩展模式

最常见的扩展方向是:

1. 把现有字段组合成一个面向业务的区块
2. 用更多领域特定的行为包装一个现有字段

例如，用 `useFormContext()` 拆出一个表单区块:

```tsx
function UserBaseFields() {
  const { AppField } = useFormContext<UserFormValues>();

  return (
    <>
      <AppField name="name">
        {field => <field.Input label="Name" required />}
      </AppField>

      <AppField name="remark">
        {field => <field.TextArea label="Remark" />}
      </AppField>
    </>
  );
}
```

当同一组字段需要在多个表单形状之间复用时，选择 `withFieldGroup` 而不是 `useFormContext()`——`useFormContext()` 只能在已经提供了它所要求的确切类型的表单内部使用，而字段组可以挂载到任何拥有匹配值切片的表单上。

## 实践建议

- 保持 `AppField` 的心智模型不变。
- 让复用发生在字段组合层，而不是重新构建表单状态。
- 优先组合现有字段，只有在确实必要时才添加更底层的适配器。
