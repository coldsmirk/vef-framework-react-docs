---
sidebar_position: 102
---

# FormModal

将表单状态、变更执行和提交/重置操作整合到一个 Modal 对话框中的组件。

> **VEF 专属组件。** 在 v2.1.6 中从 `@vef-framework-react/starter` 迁移到 `@vef-framework-react/components`。

## 适用场景

- 在 Modal 对话框中打开的新建和编辑表单。
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
      title="新建用户"
      defaultValues={{ name: '', email: '' }}
      mutationFn={createUser}
      mutationMeta={{ invalidates: [[findUserPage.key]] }}
      afterSubmit={() => onClose()}
      onClose={onClose}
    >
      {(form) => (
        <>
          <form.AppField name="name">
            {(field) => <field.Input label="姓名" required />}
          </form.AppField>
          <form.AppField name="email">
            {(field) => <field.Input label="邮箱" required />}
          </form.AppField>
        </>
      )}
    </FormModal>
  );
}
```

## API

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `open` | `boolean` | `false` | 是否显示 Modal |
| `title` | `ReactNode` | — | Modal 标题 |
| `width` | `string \| number` | — | Modal 宽度 |
| `draggable` | `boolean` | `true` | 是否可拖拽 |
| `defaultValues` | `TValues` | — | 表单初始值 |
| `disabled` | `boolean` | `false` | 禁用表单 |
| `mutationFn` | `MutationFunction<ApiResult<TData>, TValues>` | — | 提交时执行的变更函数 |
| `mutationMeta` | `MutationMeta` | — | 变更元数据（如 `invalidates`） |
| `beforeSubmit` | `(values) => Awaitable<TValues>` | — | 提交前转换值 |
| `afterSubmit` | `(values, data) => Awaitable<void>` | — | 提交成功后回调 |
| `onSubmit` | `(values) => Awaitable<void>` | — | 自定义提交处理（替代 `mutationFn`） |
| `onReset` | `(defaultValues?) => void` | — | 重置时回调 |
| `onClose` | `() => void` | — | Modal 关闭时回调 |
| `renderActions` | `(formApi) => ReactNode` | — | 自定义底部操作；返回 `null` 隐藏底部 |
| `submitButtonProps` | `SubmitButtonProps` | — | 提交按钮自定义 |
| `resetButtonProps` | `ResetButtonProps \| false` | — | 重置按钮自定义；`false` 隐藏 |
| `children` | `ReactNode \| (formApi) => ReactNode` | — | 表单内容 |
