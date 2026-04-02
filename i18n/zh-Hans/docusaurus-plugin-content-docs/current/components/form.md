---
sidebar_position: 6
---

# Form 表单

基于 [`@tanstack/react-form`](https://tanstack.com/form) 构建的类型安全、无头表单系统，集成了 Ant Design 字段组件。

> **注意：** VEF **不**重新导出 Ant Design 的 `Form` 组件，而是提供 `useForm`——一个完全类型安全的表单 Hook，内置字段组件。

## 何时使用

- VEF 应用中的任何数据录入表单。
- 需要 TypeScript 类型推断的类型安全表单状态。
- 需要校验、异步提交和字段级错误展示。

## 基础用法

```tsx
import { useForm } from '@vef-framework-react/components';

interface LoginForm {
  username: string;
  password: string;
}

export default function LoginPage() {
  const form = useForm<LoginForm>({
    defaultValues: {
      username: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      await login(value);
    },
  });

  return (
    <form.Form layout="vertical">
      <form.AppField
        name="username"
        validators={{ onChange: ({ value }) => !value ? '必填项' : undefined }}
      >
        {(field) => (
          <field.Input label="用户名" placeholder="请输入用户名" />
        )}
      </form.AppField>

      <form.AppField name="password">
        {(field) => (
          <field.Password label="密码" placeholder="请输入密码" />
        )}
      </form.AppField>

      <form.SubmitButton>登录</form.SubmitButton>
    </form.Form>
  );
}
```

## 可用字段组件

所有字段组件通过 `field.*` 在 `form.AppField` 的渲染函数中访问：

| 字段组件 | 说明 |
|---------|------|
| `field.Input` | 文本输入框 |
| `field.Password` | 密码输入框 |
| `field.TextArea` | 多行文本 |
| `field.InputNumber` | 数字输入框 |
| `field.Select` | 下拉选择器 |
| `field.TreeSelect` | 树形选择器 |
| `field.AutoComplete` | 自动完成 |
| `field.Cascader` | 级联选择 |
| `field.DatePicker` | 日期选择器 |
| `field.DateRangePicker` | 日期范围选择器 |
| `field.TimePicker` | 时间选择器 |
| `field.TimeRangePicker` | 时间范围选择器 |
| `field.Checkbox` | 单个复选框 |
| `field.CheckboxGroup` | 复选框组 |
| `field.Radio` | 单选框组 |
| `field.Bool` | 布尔值输入（开关/单选/复选框） |
| `field.Slider` | 滑动输入条 |
| `field.Rate` | 评分 |
| `field.ColorPicker` | 颜色选择器 |
| `field.Mentions` | 提及 |
| `field.Transfer` | 穿梭框 |
| `field.Upload` | 文件上传 |

## 表单校验

```tsx
<form.AppField
  name="email"
  validators={{
    onChange: ({ value }) => {
      if (!value) return '邮箱不能为空';
      if (!/\S+@\S+\.\S+/.test(value)) return '邮箱格式不正确';
      return undefined;
    },
    onBlurAsync: async ({ value }) => {
      const taken = await checkEmailTaken(value);
      return taken ? '该邮箱已被注册' : undefined;
    },
  }}
>
  {(field) => <field.Input label="邮箱" />}
</form.AppField>
```

## 表单布局

```tsx
// 水平布局，设置标签宽度
<form.Form layout="horizontal">
  <form.AppField name="name">
    {(field) => (
      <field.Input label="姓名" labelWidth={100} />
    )}
  </form.AppField>
</form.Form>

// 行内布局
<form.Form layout="inline">
  ...
</form.Form>
```

## 字段组（withFieldGroup）

使用 `withFieldGroup` 创建可复用的字段组：

```tsx
import { withFieldGroup } from '@vef-framework-react/components';

const AddressGroup = withFieldGroup<{ city: string; zip: string }>(
  ({ form }) => (
    <>
      <form.AppField name="city">
        {(field) => <field.Input label="城市" />}
      </form.AppField>
      <form.AppField name="zip">
        {(field) => <field.Input label="邮编" />}
      </form.AppField>
    </>
  )
);
```

## `createFormOptions`

使用 `createFormOptions` 定义可复用的表单配置：

```tsx
import { createFormOptions } from '@vef-framework-react/components';

const loginFormOptions = createFormOptions<LoginForm>({
  defaultValues: { username: '', password: '' },
  onSubmit: async ({ value }) => { /* ... */ },
});

// 在组件中：
const form = useForm(loginFormOptions);
```

## API

### `useForm(options)`

接受所有 [`@tanstack/react-form` FormOptions](https://tanstack.com/form/latest/docs/reference/formApi)，返回带有 VEF 字段组件的 `FormApi`。

| 参数 | 类型 | 说明 |
|------|------|------|
| `defaultValues` | `TFormData` | 表单初始值 |
| `onSubmit` | `({ value }) => Promise<void>` | 提交处理函数 |
| `onSubmitInvalid` | `({ value, formApi }) => void` | 校验失败时调用 |
| `validators` | `FormValidators` | 表单级校验器 |

### `FormItemProps`（所有字段组件共享）

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `label` | `ReactNode` | — | 字段标签 |
| `labelWidth` | `number` | — | 标签宽度（像素） |
| `labelAlign` | `'left' \| 'right'` | — | 标签文本对齐方式 |
| `layout` | `'horizontal' \| 'vertical' \| 'inline'` | — | 覆盖表单布局 |
| `extra` | `ReactNode` | — | 字段下方的额外提示 |
| `required` | `boolean` | — | 显示必填标记 |
| `noWrapper` | `boolean` | `false` | 不渲染表单项包装元素 |

### `form.Form` 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `layout` | `'horizontal' \| 'vertical' \| 'inline'` | `'horizontal'` | 表单布局 |

## 最佳实践

- 为 `defaultValues` 定义完整的表单数据结构，以获得正确的 TypeScript 类型推断。
- 使用 `validators.onChange` 实现即时反馈，使用 `validators.onBlurAsync` 进行服务端校验。
- 使用 `form.SubmitButton` 代替普通 `Button`——它会在提交时自动禁用并显示 loading 状态。
- 使用 `form.ResetButton` 将表单重置为 `defaultValues`。
