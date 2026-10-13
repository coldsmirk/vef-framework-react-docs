---
title: "FormModal"
description: "一个整合了表单状态、mutation 执行以及提交/重置操作的弹窗组件。"
---

# FormModal

一个整合了表单状态、mutation 执行以及提交/重置操作的弹窗组件。

> **VEF 专属组件。** 已在 v2.1.6 中从 `@vef-framework-react/starter` 迁移至 `@vef-framework-react/components`。

## 何时使用

- 在弹窗对话框中打开的新建/编辑表单。
- 任何通过 `MutationFunction` 提交的表单。

## 基础用法

```tsx
import { FormModal } from '@vef-framework-react/components';

interface UserForm {
  name: string;
  email: string;
}

export default function CreateUserModal({ open, onClose }) {
  return (
    <FormModal<UserForm>
      open={open}
      title="Create User"
      defaultValues={{ name: '', email: '' }}
      mutationFn={createUser}
      mutationMeta={{ invalidates: [[findUserPage.key]] }}
      afterSubmit={() => onClose()}
      onClose={onClose}
    >
      {(form) => (
        <>
          <form.AppField name="name">
            {(field) => <field.Input label="Name" required />}
          </form.AppField>
          <form.AppField name="email">
            {(field) => <field.Input label="Email" required />}
          </form.AppField>
        </>
      )}
    </FormModal>
  );
}
```

## API

props 类型以 `FormModalProps` 导出。

`draggable` 的默认值可以通过 [`ConfigProvider.components.FormModal`](./config-provider.md#应用组件默认值) 进行应用级覆盖；显式传给该组件的 prop 仍然优先。

| Prop | Type | Default | 说明 |
|------|------|---------|-------------|
| `open` | `boolean` | `false` | 弹窗是否可见 |
| `title` | `ReactNode` | — | 弹窗标题 |
| `width` | `string \| number` | — | 弹窗宽度 |
| `draggable` | `boolean` | `true`，可由 `ConfigProvider.components.FormModal` 覆盖 | 弹窗是否可拖动 |
| `defaultValues` | `TValues` | — | 表单初始值 |
| `disabled` | `boolean` | `false` | 禁用表单 |
| `formComponent` | `ElementType` | `"form"` | 内部表单容器使用的元素类型 |
| `formLayout` | `FormLayout` | — | 弹窗内表单项的布局——`layout`（`'horizontal' \| 'vertical'`）、`labelAlign` 和 `labelWidth`。默认为水平、标签右对齐的布局（见 [Form](./form.md)） |
| `mutationFn` | `MutationFunction<ApiResult<TData>, TValues>` | — | 提交时执行的 mutation |
| `mutationMeta` | `MutationMeta` | — | mutation 元数据（例如 `invalidates`） |
| `beforeSubmit` | `(values) => Awaitable<TValues>` | — | 提交前转换表单值 |
| `afterSubmit` | `(values, data) => Awaitable<void>` | — | 提交成功后调用 |
| `onSubmit` | `(values) => Awaitable<void>` | — | 自定义提交处理函数（作为 `mutationFn` 的替代方案） |
| `onReset` | `(defaultValues?) => void` | — | 表单重置时调用 |
| `onClose` | `() => void` | — | 弹窗关闭时调用 |
| `renderActions` | `(formApi, defaults: { submitButton, resetButton }) => ReactNode` | — | 自定义底部操作区；`defaults` 携带默认的提交/重置按钮，可与自定义按钮一起复用；返回 `null` 可隐藏底部 |
| `submitButtonProps` | `Except<SubmitButtonProps, 'onSubmit' \| 'disabled' \| 'loading'>` | — | 提交按钮自定义配置——作用于默认底栏；提供 `renderActions` 时也作用于 `defaults.submitButton` |
| `resetButtonProps` | `Except<ResetButtonProps, 'onReset' \| 'disabled' \| 'loading'> \| false` | — | 重置按钮自定义配置；设为 `false` 可隐藏——作用于默认底栏；提供 `renderActions` 时也作用于 `defaults.resetButton`（设为 `false` 时它为空） |
| `children` | `ReactNode \| (formApi) => ReactNode` | — | 表单内容 |

```tsx
// Add a custom button alongside the defaults
renderActions={(formApi, { submitButton, resetButton }) => (
  <>
    <Button onClick={handleDraft}>Save Draft</Button>
    {resetButton}
    {submitButton}
  </>
)}
```
