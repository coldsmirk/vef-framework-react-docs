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
  // The form data type is inferred from `defaultValues` (annotate it rather
  // than passing explicit generics — `useForm` has one generic per validator slot).
  const form = useForm({
    defaultValues: { username: '', password: '' } as LoginForm,
    onSubmit: async ({ value }) => {
      await login(value);
    },
  });

  return (
    <form.AppForm>
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
    </form.AppForm>
  );
}
```

`form.AppForm` 是表单上下文的 provider：内置表单组件（`form.Form`、`form.SubmitButton`、`form.ResetButton`）与 `useFormContext` 都必须渲染在它内部。`form.AppField` 绑定一个字段，并通过其 render prop 暴露字段组件。

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

每个字段组件的 props 类型都以 `<Name>FieldProps` 导出——`AutoCompleteFieldProps`、`BoolFieldProps`、`CascaderFieldProps`、`CheckboxFieldProps`、`CheckboxGroupFieldProps`、`CodeEditorFieldProps`、`ColorPickerFieldProps`、`DatePickerFieldProps`、`DateRangePickerFieldProps`、`IconPickerFieldProps`、`InputFieldProps`、`InputNumberFieldProps`、`MentionsFieldProps`、`RadioFieldProps`、`RateFieldProps`、`SelectFieldProps`、`SliderFieldProps`、`TextAreaFieldProps`、`TimePickerFieldProps`、`TimeRangePickerFieldProps`、`TransferFieldProps`、`TreeSelectFieldProps`、`UploadFieldProps`：即控件自身的 props 去掉由表单接管的值绑定，再加上该字段自己的选项。组件同时接受它与 `FormItemProps`（见下文）。日期与时间字段（`field.DatePicker`、`field.DateRangePicker`、`field.TimePicker`、`field.TimeRangePicker`）存储的是选择器格式化后的值——一个字符串，范围选择时为 `[start, end]` 字符串对——显示时再把存储的字符串解析回来；设置 `valueAsObject` 则改为存储 Dayjs 实例。

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

`form.Form` 为其内部的每个字段项建立布局上下文：`layout`（`'horizontal' | 'vertical'`）、`labelAlign` 与 `labelWidth`。默认是水平布局、标签右对齐、`100`px 标签列。应用可以通过 [`ConfigProvider`](./config-provider.md) 设置 `labelAlign` 和 `labelWidth` 的应用级默认值；传给 `form.Form` 的 prop 覆盖应用默认值，单个字段项再通过自身的 `FormItemProps` 覆盖两者：

```tsx
// Vertical layout for the whole form
<form.Form layout="vertical">
  <form.AppField name="name">
    {(field) => <field.Input label="Name" />}
  </form.AppField>
</form.Form>

// Horizontal layout with a wider label column
<form.Form layout="horizontal" labelWidth={140}>
  <form.AppField name="name">
    {(field) => <field.Input label="Name" />}
  </form.AppField>
</form.Form>
```

这三项设置共同构成 `FormLayout` 类型，[`FormModal`](./form-modal.md)、[`FormDrawer`](./form-drawer.md) 和 [`Crud`](./crud.md) 都以 `formLayout` 属性接受它：

```ts
interface FormLayout {
  layout?: 'horizontal' | 'vertical';
  labelAlign?: 'left' | 'right';
  labelWidth?: number;
}
```

## 字段组

使用 `withFieldGroup` 创建绑定到表单值某个子树的可复用字段组。它接受 `{ defaultValues, render, props? }`；`render` 收到一个 `group` API，其 `AppField` 的 name 相对于字段组挂载的位置：

```tsx
import { withFieldGroup } from '@vef-framework-react/components';

const AddressGroup = withFieldGroup({
  defaultValues: { city: '', zip: '' },
  render: ({ group }) => (
    <>
      <group.AppField name="city">
        {(field) => <field.Input label="City" />}
      </group.AppField>
      <group.AppField name="zip">
        {(field) => <field.Input label="ZIP" />}
      </group.AppField>
    </>
  ),
});

// Mount the group on any form whose values contain a matching sub-tree:
<AddressGroup form={form} fields="shippingAddress" />
```

## `createFormOptions`

使用 `createFormOptions` 定义可复用的表单配置：

```tsx
import { createFormOptions } from '@vef-framework-react/components';

const loginFormOptions = createFormOptions({
  defaultValues: { username: '', password: '' } as LoginForm,
  onSubmit: async ({ value }) => { /* ... */ },
});

// In component:
const form = useForm(loginFormOptions);
```

## API

### `useForm(options)`

接受所有 [`@tanstack/react-form` 的 FormOptions](https://tanstack.com/form/latest/docs/reference/formApi)，返回一个经过扩展的 `FormApi`：附加了 VEF 表单组件（`form.*` / `form.AppForm` 下的 `Form`、`SubmitButton`、`ResetButton`）、字段组件（通过 `form.AppField` 的 render prop 提供），以及 `createField` 辅助函数。

| 选项 | 类型 | 说明 |
|--------|------|-------------|
| `defaultValues` | `TFormData` | 表单初始值 |
| `onSubmit` | `({ value }) => Promise<void>` | 提交处理函数 |
| `onSubmitInvalid` | `({ value, formApi }) => void` | 提交未通过校验时调用 |
| `validators` | `FormValidators` | 表单级校验器 |

### `FormItemProps`（所有字段组件共用）

每个字段组件都接受其所包裹控件自身的 props，外加以下表单项 props（`FieldComponentProps<TFieldProps> = TFieldProps & FormItemProps`）：

| Prop | Type | Default | 说明 |
|------|------|---------|-------------|
| `label` | `ReactNode` | — | 字段标签 |
| `labelWidth` | `number` | 继承自表单布局（默认 `100`） | 标签宽度（像素） |
| `labelAlign` | `'left' \| 'right'` | 继承（默认 `'right'`） | 标签文字对齐方式 |
| `layout` | `'horizontal' \| 'vertical'` | 继承（默认 `'horizontal'`） | 覆盖该字段项的表单布局 |
| `extra` | `ReactNode` | — | 字段下方的额外提示 |
| `required` | `boolean` | — | 显示必填标记 |
| `noWrapper` | `boolean` | `false` | 渲染裸控件，不带表单项包裹（label/错误骨架）——用于搜索栏和表格编辑器 |

### `form.Form` 属性

一个多态的布局/上下文 provider——默认渲染原生 `<form>`，并提供布局与禁用两个上下文。渲染原生 `<form>` 时，submit 和 reset 事件会自动接到表单 API 上（`preventDefault` + `handleSubmit()` / `reset()`）；props 中排除了 `onSubmit` / `onSubmitCapture`。

| Prop | Type | Default | 说明 |
|------|------|---------|-------------|
| `layout` | `'horizontal' \| 'vertical'` | `'horizontal'` | 表单项布局 |
| `labelAlign` | `'left' \| 'right'` | `'right'`，可由 `ConfigProvider.components.Form` 覆盖 | 标签文字对齐方式 |
| `labelWidth` | `number` | `100`，可由 `ConfigProvider.components.Form` 覆盖 | 标签列宽度（像素） |
| `disabled` | `boolean` | `false` | 禁用内部所有字段（通过上下文提供） |
| `component` | `ElementType` | `"form"` | 渲染的元素类型；非 `form` 元素会跳过原生 submit/reset 接线 |
| *(rest)* | `ComponentPropsWithoutRef<TComponent>` | — | 所渲染元素的任意 prop（`className`、`style` 等） |

### `form.SubmitButton` 属性

一个绑定到表单状态的 [`Button`](./button.md)：渲染为 `type="primary"` 加 `htmlType="submit"`，在表单 `isSubmitting` 期间显示加载状态，并在表单 `canSubmit` 为 `false` 或外围表单被禁用时自行禁用。

| Prop | Type | Default | 说明 |
|------|------|---------|-------------|
| `onSubmit` | `() => void` | — | 点击处理函数；仅在原生 `<form>` 之外需要（例如接到 `form.handleSubmit`） |
| `children` | `ReactNode` | `'提交'` | 按钮文案 |
| *(rest)* | `ButtonProps` except `htmlType` / `onClick` / `onClickCapture` | — | 其他任意 Button prop（`icon`、`size`、`danger` 等） |

### `form.ResetButton` 属性

一个 `htmlType="reset"` 的 [`Button`](./button.md)，在表单 `isSubmitting` 或外围表单被禁用时处于禁用状态。

| Prop | Type | Default | 说明 |
|------|------|---------|-------------|
| `onReset` | `() => void` | — | 点击处理函数；仅在原生 `<form>` 之外需要（例如接到 `form.reset`） |
| `children` | `ReactNode` | `'重置'` | 按钮文案 |
| *(rest)* | `ButtonProps` except `htmlType` / `onClick` / `onClickCapture` | — | 其他任意 Button prop |

### `FormActions`、`DefaultSubmitButton`、`DefaultResetButton`

通过 `useFormContext` 预先接到最近表单上的提交与重置按钮：提交调用 `form.handleSubmit`，重置调用 `form.reset()` 后再调用 `onReset`。[`FormModal`](./form-modal.md) 与 [`FormDrawer`](./form-drawer.md) 以 `FormActions` 作为默认底栏，并把这两个按钮作为 `defaults` 交给 `renderActions`；在表单内部渲染的自定义底栏也可以直接使用它们。

| Prop（`FormActionsProps`） | 类型 | 默认值 | 说明 |
|------|------|---------|-------------|
| `submitButtonProps` | `Except<SubmitButtonProps, 'onSubmit' \| 'disabled' \| 'loading'>` | `{ children: '提交', icon: <勾选图标> }` | 提交按钮的 props |
| `resetButtonProps` | `Except<ResetButtonProps, 'onReset' \| 'disabled' \| 'loading'> \| false` | `{ children: '重置' }` | 重置按钮的 props；设为 `false` 隐藏该按钮 |
| `onReset` | `() => void` | — | 表单重置之后调用 |

`DefaultSubmitButton` 接收 `submitButtonProps`，`DefaultResetButton` 接收 `resetButtonProps` 与 `onReset`。

`formComponents` 即 `{ Form, SubmitButton, ResetButton }`，是 `form.Form`、`form.SubmitButton` 与 `form.ResetButton` 背后的组件映射。

### `useFormContext<TFormData>()`

从上下文读取最近的表单 API——供渲染在 `form.*` render props 之外的字段组件使用，例如 [`ProSearch`](./pro-search.md) 内的搜索字段或自定义表单操作。返回与 `useForm` 相同的 `FormApi`，类型由你传入的 `TFormData` 决定。

### `useFormStore(form.store, selector)`

TanStack Form `useStore` 的重导出，用于以渲染优化的方式订阅表单状态切片（值、错误、`canSubmit` 等）：

```tsx
const username = useFormStore(form.store, (state) => state.values.username);
```

### `withForm` / `withFieldGroup`

TanStack Form 高阶组件的重导出，预先绑定了 VEF 的字段与表单组件。`withForm` 围绕共享的表单选项构建可复用的表单组件；`withFieldGroup` 为某个值子树构建可复用的字段组（见上文"字段组"一节）。

### `form.createField` / `restoreFieldOptions`

`form.createField(name, options)` 把字段定义成数据——用于把表单定义组织为同构数组（例如配置驱动的表单引擎）。`options` 扩展自绑定的 `<form.AppField>` 的全部选项（`validators`、`listeners`、`defaultValue`、`asyncDebounceMs`、`mode` 等），并新增：

| 选项 | 类型 | 说明 |
|--------|------|-------------|
| `render` | `(field: typeof fieldComponents) => ReactNode` | render prop 的主体，作用域限定为注入的字段组件 |
| `renderMeta` | `TMeta extends AnyObject` | 由外围遍历消费的任意元数据（例如布局跨度、可见性） |

它返回一个 `FormFieldItem<TFormData, TMeta>`：`{ name, fieldOptions?, render, renderMeta? }`，其中 `fieldOptions` 做了类型擦除（`ErasedFieldOptions<TFormData>`），让不同字段名的项可以放进同一个数组。在渲染处用 `restoreFieldOptions(item.fieldOptions)` 恢复后展开：

```tsx
items.map((item) => (
  <form.AppField key={item.name} name={item.name} {...restoreFieldOptions(item.fieldOptions)}>
    {item.render}
  </form.AppField>
));
```

## 最佳实践

- 定义 `defaultValues` 时包含表单数据的完整结构，以获得正确的 TypeScript 类型推断。
- 使用 `validators.onChange` 提供即时反馈，使用 `validators.onBlurAsync` 进行服务端校验。
- 使用 `form.SubmitButton` 而非普通的 `Button`——它会在提交期间自动禁用并显示加载状态。
- 使用 `form.ResetButton` 将表单重置为 `defaultValues`。
