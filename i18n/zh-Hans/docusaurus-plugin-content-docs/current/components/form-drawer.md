---
sidebar_position: 103
---

# FormDrawer

将表单状态、变更执行和提交/重置操作整合到一个抽屉面板中的组件。API 与 `FormModal` 相同，但以侧边抽屉形式呈现。

> **VEF 专属组件。** 在 v2.1.6 中从 `@vef-framework-react/starter` 迁移到 `@vef-framework-react/components`。

## 适用场景

- 在侧边抽屉中打开的新建和编辑表单。
- 需要比 Modal 更多垂直空间的表单。

## 基础用法

```tsx
import { FormDrawer } from '@vef-framework-react/components';

interface UserForm {
  name: string;
  email: string;
}

export default function EditUserDrawer({ open, onClose }) {
  return (
    <FormDrawer<UserForm>
      open={open}
      title="编辑用户"
      width={480}
      mutationFn={updateUser}
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
    </FormDrawer>
  );
}
```

## API

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `open` | `boolean` | `false` | 是否显示抽屉 |
| `title` | `ReactNode` | — | 抽屉标题 |
| `width` | `string \| number` | — | 抽屉宽度 |
| `placement` | `DrawerProps['placement']` | — | 抽屉弹出方向 |
| `resizable` | `boolean` | — | 是否可调整宽度 |
| `defaultValues` | `TValues` | — | 表单初始值 |
| `disabled` | `boolean` | `false` | 禁用表单 |
| `mutationFn` | `MutationFunction<ApiResult<TData>, TValues>` | — | 提交时执行的变更函数 |
| `mutationMeta` | `MutationMeta` | — | 变更元数据 |
| `beforeSubmit` | `(values) => Awaitable<TValues>` | — | 提交前转换值 |
| `afterSubmit` | `(values, data) => Awaitable<void>` | — | 提交成功后回调 |
| `onSubmit` | `(values) => Awaitable<void>` | — | 自定义提交处理 |
| `onReset` | `(defaultValues?) => void` | — | 重置时回调 |
| `onClose` | `() => void` | — | 抽屉关闭时回调 |
| `renderActions` | `(formApi) => ReactNode` | — | 自定义底部操作 |
| `submitButtonProps` | `SubmitButtonProps` | — | 提交按钮自定义 |
| `resetButtonProps` | `ResetButtonProps \| false` | — | 重置按钮自定义；`false` 隐藏 |
| `children` | `ReactNode \| (formApi) => ReactNode` | — | 表单内容 |
