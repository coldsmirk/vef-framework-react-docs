---
title: "Select"
description: "用于从列表中选择单个或多个值的下拉选择器。"
---

# Select

用于从列表中选择单个或多个值的下拉选择器。

> **来源：** 从 `antd` 重新导出，并增加了 VEF Hook 增强。完整文档：[Ant Design Select](https://ant.design/components/select/)

## 何时使用

- 选项内容较复杂时（例如包含图标或说明文字）。
- 选项数量较多，需要筛选时。
- 当选项少于 5 个时，请使用 `Radio`。

## 基础用法

```tsx
import { Select } from '@vef-framework-react/components';

const options = [
  { value: 'jack', label: 'Jack' },
  { value: 'lucy', label: 'Lucy' },
  { value: 'tom', label: 'Tom' },
];

export default function Demo() {
  return (
    <Select
      style={{ width: 200 }}
      placeholder="Select a person"
      options={options}
      onChange={(value) => console.log(value)}
    />
  );
}
```

## 多选

```tsx
import { Select } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <Select
      mode="multiple"
      style={{ width: '100%' }}
      placeholder="Select multiple"
      options={[
        { value: 'a', label: 'Option A' },
        { value: 'b', label: 'Option B' },
        { value: 'c', label: 'Option C' },
      ]}
    />
  );
}
```

## 可搜索

```tsx
import { Select } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <Select
      showSearch
      style={{ width: 200 }}
      placeholder="Search to select"
      filterOption={(input, option) =>
        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
      }
      options={[
        { value: '1', label: 'Beijing' },
        { value: '2', label: 'Shanghai' },
        { value: '3', label: 'Guangzhou' },
      ]}
    />
  );
}
```

## VEF 增强：`useDataOptionsSelect`

VEF 提供了 `useDataOptionsSelect`，用于从异步数据源加载选项，内置了加载状态、拼音搜索支持和缓存能力。数据获取相关的选项统一嵌套在 `queryOptions` 中（与 TanStack Query 的 `useQuery` 接受的形状相同），`useDataOptionsSelect` 自身的选项与其平级。

```tsx
import { Select, useDataOptionsSelect } from '@vef-framework-react/components';

async function fetchCities() {
  const res = await fetch('/api/cities');
  return res.json(); // returns DataOption[]
}

export default function Demo() {
  const selectProps = useDataOptionsSelect({
    queryOptions: {
      queryKey: ['cities'],
      queryFn: fetchCities,
    },
    filterable: true, // enables pinyin/text filtering
  });

  return <Select style={{ width: 200 }} {...selectProps} />;
}
```

### `useDataOptionsSelect` 选项

| 选项 | 类型 | 默认值 | 说明 |
|--------|------|---------|-------------|
| `queryOptions` | `UseQueryOptions<TQueryFnData[], TData[], TParams>` | 必填 | TanStack Query 选项（`queryKey`、`queryFn` 及 `useQuery` 的其余选项） |
| `filterable` | `boolean` | `false` | 启用客户端文本/拼音过滤 |
| `onFetch` | `(data: TData[]) => void` | — | 数据获取完成后的回调 |
| `labelKey` | `string \| (item: TData) => string` | `"label"` | 选项 label 的字段映射 |
| `valueKey` | `string \| (item: TData) => Key` | `"value"` | 选项 value 的字段映射 |
| `disabledKey` | `string \| (item: TData) => boolean \| undefined` | `"disabled"` | 禁用状态的字段映射 |
| `descriptionKey` | `string \| (item: TData) => string \| undefined` | `"description"` | 选项说明文字的字段映射 |
| `childrenKey` | `string \| (item: TData) => TData[] \| undefined` | `"children"` | 嵌套子选项的字段映射（会递归转换） |

每个 `*Key` 选项都可以是字符串路径（例如 `"user.name"`）或提取函数。

该 Hook 返回的 `SelectProps` 可以直接展开到 `<Select>` 上。

## VEF 增强：`useDictionaryOptionsSelect`

对于基于数据字典的选项，`useDictionaryOptionsSelect` 封装了 `useDictionaryQuery`，为每个别名返回可直接展开的 `SelectProps`：

```tsx
import { Select, useDictionaryOptionsSelect } from '@vef-framework-react/components';

export default function Demo() {
  const { gender, status } = useDictionaryOptionsSelect({
    gender: 'common.gender',
    status: { key: 'common.status', filterable: true },
  });

  return (
    <>
      <Select style={{ width: 200 }} {...gender} />
      <Select style={{ width: 200 }} {...status} />
    </>
  );
}
```

第一个参数把每个别名映射为字典键字符串，或 `{ key, filterable? }` 以按别名覆盖过滤开关。可选的第二个参数 `{ filterable }` 为未单独指定的别名设置默认值。参见[数据字典](../guide/data-dictionaries.md)。

## API

| Prop | Type | Default | 说明 |
|------|------|---------|-------------|
| `value` | `string \| string[]` | — | 选中值（受控） |
| `defaultValue` | `string \| string[]` | — | 初始值（非受控） |
| `options` | `SelectOption[]` | — | 选项列表 |
| `mode` | `'multiple' \| 'tags'` | — | 多选模式 |
| `placeholder` | `string` | — | 占位文本 |
| `disabled` | `boolean` | `false` | 禁用选择器 |
| `loading` | `boolean` | `false` | 显示加载状态 |
| `showSearch` | `boolean` | `false` | 启用搜索 |
| `allowClear` | `boolean` | `false` | 显示清除按钮 |
| `filterOption` | `boolean \| function` | `true` | 筛选函数 |
| `size` | `'large' \| 'medium' \| 'small'` | `'medium'` | 选择器尺寸（`'middle'` 是 `'medium'` 的废弃别名） |
| `status` | `'error' \| 'warning'` | — | 校验状态 |
| `variant` | `'outlined' \| 'filled' \| 'borderless'` | `'outlined'` | 视觉变体 |
| `onChange` | `(value, option) => void` | — | 变化回调函数 |
| `onSearch` | `(value: string) => void` | — | 搜索回调函数 |
| `onClear` | `() => void` | — | 清除回调函数 |

## 最佳实践

- 对于远程数据，使用 `useDataOptionsSelect` 可以避免手动管理加载状态。
- 对于非必填字段，设置 `allowClear`。
- 在表单中使用时，请使用 [`Form`](./form) 字段组件，它已与 VEF 表单系统集成：

```tsx
<form.AppField name="city">
  {(field) => <field.Select label="City" options={options} />}
</form.AppField>
```
