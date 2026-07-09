---
title: "Form"
description: "基于 [`@tanstack/react-form`](https://tanstack.com/form) 构建的类型安全、无样式表单系统，集成了 Ant Design 字段组件。"
---

# Form

基于 [`@tanstack/react-form`](https://tanstack.com/form) 构建的类型安全、无样式表单系统，集成了 Ant Design 字段组件。

> **注意：** VEF **不**重新导出 Ant Design 的 `Form` 组件，而是提供 `useForm`——一个完全类型安全的表单 Hook，内置字段组件。

## 何时使用

- VEF 应用中的任意数据录入表单。
- 需要通过 TypeScript 类型推断获得类型安全的表单状态时。
- 需要校验、异步提交以及字段级错误展示时。

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
        validators={{ onChange: ({ value }) => !value ? 'Required' : undefined }}
      >
        {(field) => (
          <field.Input label="Username" placeholder="Enter username" />
        )}
      </form.AppField>

      <form.AppField name="password">
        {(field) => (
          <field.Password label="Password" placeholder="Enter password" />
        )}
      </form.AppField>

      <form.SubmitButton>Login</form.SubmitButton>
    </form.Form>
  );
}
```

## 可用字段组件

所有字段组件都可以在 `form.AppField` 的渲染函数中通过 `field.*` 访问：

| Field Component | 说明 |
|----------------|-------------|
| `field.Input` | 文本输入 |
| `field.Password` | 密码输入 |
| `field.TextArea` | 多行文本 |
| `field.InputNumber` | 数字输入 |
| `field.Select` | 下拉选择器 |
| `field.TreeSelect` | 树形选择器 |
| `field.AutoComplete` | 自动完成输入 |
| `field.Cascader` | 级联选择器 |
| `field.DatePicker` | 日期选择器 |
| `field.DateRangePicker` | 日期范围选择器 |
| `field.TimePicker` | 时间选择器 |
| `field.TimeRangePicker` | 时间范围选择器 |
| `field.Checkbox` | 单个复选框 |
| `field.CheckboxGroup` | 复选框组 |
| `field.Radio` | 单选框组 |
| `field.Bool` | 布尔值输入（开关/单选/复选框，由 `variant` 属性决定具体形式，默认为 `"switch"`） |
| `field.Slider` | 滑块输入 |
| `field.Rate` | 星级评分 |
| `field.ColorPicker` | 颜色选择器 |
| `field.CodeEditor` | 代码编辑器 |
| `field.IconPicker` | 图标选择器 |
| `field.Mentions` | 提及输入 |
| `field.Transfer` | 穿梭框 |
| `field.Upload` | 文件上传 |

> 不存在单独的 `field.Switch`。如需开关样式的布尔值输入，请使用 `field.Bool`（其 `variant` 属性默认值为 `"switch"`）。

## 校验

```tsx
<form.AppField
  name="email"
  validators={{
    onChange: ({ value }) => {
      if (!value) return 'Email is required';
      if (!/\S+@\S+\.\S+/.test(value)) return 'Invalid email';
      return undefined;
    },
    onBlurAsync: async ({ value }) => {
      const taken = await checkEmailTaken(value);
      return taken ? 'Email already in use' : undefined;
    },
  }}
>
  {(field) => <field.Input label="Email" />}
</form.AppField>
```

## 表单布局

```tsx
// Horizontal layout with label width
<form.Form layout="horizontal">
  <form.AppField name="name">
    {(field) => (
      <field.Input label="Name" labelWidth={100} />
    )}
  </form.AppField>
</form.Form>

// Inline layout
<form.Form layout="inline">
  ...
</form.Form>
```

## 字段组

使用 `withFieldGroup` 创建可复用的字段组：

```tsx
import { withFieldGroup } from '@vef-framework-react/components';

const AddressGroup = withFieldGroup<{ city: string; zip: string }>(
  ({ form }) => (
    <>
      <form.AppField name="city">
        {(field) => <field.Input label="City" />}
      </form.AppField>
      <form.AppField name="zip">
        {(field) => <field.Input label="ZIP" />}
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

// In component:
const form = useForm(loginFormOptions);
```

## API

### `useForm(options)`

接受所有 [`@tanstack/react-form` 的 FormOptions](https://tanstack.com/form/latest/docs/reference/formApi) 选项，返回一个附加了 VEF 字段组件的 `FormApi`。

| 选项 | 类型 | 说明 |
|--------|------|-------------|
| `defaultValues` | `TFormData` | 表单初始值 |
| `onSubmit` | `({ value }) => Promise<void>` | 提交处理函数 |
| `onSubmitInvalid` | `({ value, formApi }) => void` | 校验失败时调用 |
| `validators` | `FormValidators` | 表单级校验器 |

### `FormItemProps`（所有字段组件共用）

| Prop | Type | Default | 说明 |
|------|------|---------|-------------|
| `label` | `ReactNode` | — | 字段标签 |
| `labelWidth` | `number` | — | 标签宽度（像素） |
| `labelAlign` | `'left' \| 'right'` | — | 标签文字对齐方式 |
| `layout` | `'horizontal' \| 'vertical' \| 'inline'` | — | 覆盖表单布局 |
| `extra` | `ReactNode` | — | 字段下方的提示信息 |
| `required` | `boolean` | — | 显示必填标记 |
| `noWrapper` | `boolean` | `false` | 不渲染表单项包裹容器 |

### `form.Form` 属性

| Prop | Type | Default | 说明 |
|------|------|---------|-------------|
| `layout` | `'horizontal' \| 'vertical' \| 'inline'` | `'horizontal'` | 表单布局 |
| `onSubmit` | `(e) => void` | — | 原生表单提交事件（自动处理） |

## 最佳实践

- 定义 `defaultValues` 时包含表单数据的完整结构，以获得正确的 TypeScript 类型推断。
- 使用 `validators.onChange` 提供即时反馈，使用 `validators.onBlurAsync` 进行服务端校验。
- 使用 `form.SubmitButton` 而非普通的 `Button`——它会在提交期间自动禁用并显示加载状态。
- 使用 `form.ResetButton` 将表单重置为 `defaultValues`。
