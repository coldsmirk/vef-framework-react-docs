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

## 构建新的字段控件

`field.*` 映射（`field.Input`、`field.Select` 等）在框架内部是固定的：`@vef-framework-react/components` 只在内部调用一次 TanStack Form 的 `createFormHook()`，并传入内置的字段组件。没有注册 API——应用无法向 `field.*` 中添加自己的条目，而为内置字段提供标签和校验外观的内部封装 `withFormItem` 也没有被导出。

受支持的模式是一个普通的受控组件，在 `AppField` 的 render prop 中完成接线。render prop 收到的 `field` 参数并不只是 `field.Input` 等组件的命名空间——它就是完整的 TanStack 字段 API：

- `field.state.value` —— 当前值
- `field.handleChange(value)` —— 写入新值（会运行 `onChange` 校验器）
- `field.handleBlur()` —— 把字段标记为已触碰（会运行 `onBlur` 校验器）
- `field.state.meta` —— 校验状态：`errors`、`isValid`、`isValidating`

### 完整示例

一个告警规则的严重级别选择器。控件本身就是一个普通的 `value` / `onChange` 组件，不依赖任何表单：

```tsx
import { Button, Group } from "@vef-framework-react/components";

const LEVELS = ["low", "medium", "high"] as const;
type Severity = (typeof LEVELS)[number];

interface SeverityPickerProps {
  value?: Severity | null;
  onChange: (value: Severity) => void;
  onBlur?: () => void;
}

function SeverityPicker({ value, onChange, onBlur }: SeverityPickerProps) {
  return (
    <Group>
      {LEVELS.map(level => (
        <Button
          key={level}
          type={value === level ? "primary" : "default"}
          onBlur={onBlur}
          onClick={() => onChange(level)}
        >
          {level}
        </Button>
      ))}
    </Group>
  );
}
```

把它接入表单和使用任何内置字段的 `AppField` 写法一样——validators、`listeners`、`Subscribe` 都可以原样组合：

```tsx
import { Alert, useFormContext } from "@vef-framework-react/components";
import { z } from "@vef-framework-react/shared";

function AlertRuleFields() {
  const { AppField } = useFormContext<AlertRuleFormValues>();

  return (
    <AppField
      name="severity"
      validators={{ onChange: z.enum(["low", "medium", "high"], "Required") }}
    >
      {field => (
        <SeverityPicker
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={field.handleChange}
        />
      )}
    </AppField>
  );
}
```

### 标签与错误展示

自定义控件在渲染时没有内置字段所拥有的 `Form.Item` 外观，因此 [Form 表单](../components/form.md) 中记录的共享 `FormItemProps`（`label`、`labelWidth` 等）对它不适用——标签需要作为控件的一部分或在其旁边自行渲染。校验状态可以从同一个字段 API 上拿到：

```tsx
{field => (
  <>
    <SeverityPicker
      value={field.state.value}
      onBlur={field.handleBlur}
      onChange={field.handleChange}
    />

    {!field.state.meta.isValid && (
      <Alert message={field.state.meta.errors[0]?.message} type="error" />
    )}
  </>
)}
```

当同一个控件连同接线需要在多个表单中复用时，就按其他字段集的做法抽取它——基于 `useFormContext()` 的区块组件，或者在需要挂载到多个表单形状时使用 `withFieldGroup`。

## 实践建议

- 保持 `AppField` 的心智模型不变。
- 让复用发生在字段组合层，而不是重新构建表单状态。
- 优先组合现有字段，只有在确实必要时才添加更底层的适配器。
