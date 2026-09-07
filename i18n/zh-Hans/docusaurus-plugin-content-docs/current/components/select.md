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

只要你在一份普通选项列表上开启 `showSearch`，就顺手把 `filterOptionByLabel` 一起传上：

```tsx
import { filterOptionByLabel, Select } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <Select
      showSearch
      style={{ width: 200 }}
      placeholder="Search to select"
      filterOption={filterOptionByLabel}
      options={[
        { value: '1', label: 'Beijing' },
        { value: '2', label: 'Shanghai' },
        { value: '3', label: 'Guangzhou' },
      ]}
    />
  );
}
```

```ts
function filterOptionByLabel(input: string, option?: SelectOption): boolean;
```

**antd 默认的 `filterOption` 是拿输入去匹配选项的 `value`**——也就是那个存储用的编码——所以一份 `{ label: 'Beijing', value: '1' }` 的列表，对用户实际看得见的每一个词都会筛成空。`filterOptionByLabel` 改为匹配 **label**，忽略大小写、忽略首尾空白；输入为空或全是空白时保留全部选项。把 value 排除在比较之外是刻意的：它是存储、不是文案，匹配它会让某次查询命中一个可见文本里压根不含该查询串的选项——包括数字编码与用户出于别的原因输入的数字撞车。没有 label 的选项，以及 label 是谓词读不出文本的 `ReactNode` 的选项，都不会匹配。

框架自己开启 `showSearch` 的地方都用了它——表单编辑器的 `select` 字段及其可编辑表格列编辑器、定时任务调度页的任务处理器选择器，以及集成控制台的日志筛选。下面两个选项 hook 是例外：`useDataOptionsSelect` 与 `useCodeSetOptionsSelect` 会在它们产出的更丰富的选项形状（label、description，以及两者各自的拼音形式）之上安装自己的拼音感知谓词，所以**不要**在它们展开出来的 props 之上再传 `filterOptionByLabel`。

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

## VEF 增强：`useCodeSetOptionsSelect`

对于以码集为数据源的选项，`useCodeSetOptionsSelect` 封装了 `useCodeSetQuery`，为每个别名返回可直接展开的 `SelectProps`：

```tsx
import { Select, useCodeSetOptionsSelect } from '@vef-framework-react/components';

export default function Demo() {
  const { gender, status } = useCodeSetOptionsSelect({
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

所有别名会在一次批量码集查询中获取。背后的查询与应用上下文接线参见[码集](../guide/code-sets.md)。

### `useCodeSetOptionsSelect` 签名

```ts
function useCodeSetOptionsSelect<const T extends CodeSetAliasMap>(
  keys: T,
  options?: UseCodeSetOptionsSelectOptions
): UseCodeSetOptionsSelectResult<T>;
```

**`keys`**（`CodeSetAliasMap`，必填）把每个别名映射为一个 `CodeSetKeyValue`——码集键字符串，或一个 `CodeSetKeyConfig` 对象：

| 字段 | 类型 | 默认值 | 说明 |
|-------|------|---------|-------------|
| `key` | `CodeSetKey` | 必填 | 码集键（通过 `Register` 增强获得类型约束，否则为 `string`） |
| `filterable` | `boolean` | Hook 级别的 `filterable` | 按别名覆盖搜索过滤开关 |

**`options`**（`UseCodeSetOptionsSelectOptions`，可选）：

| 选项 | 类型 | 默认值 | 说明 |
|--------|------|---------|-------------|
| `filterable` | `boolean` | `false` | 每个 select 是否启用搜索；带有自身 `filterable` 配置的别名优先于该默认值 |

**返回值**（`UseCodeSetOptionsSelectResult<T>` = `Record<keyof T, SelectProps<Key, DataOptionWithPinyin<DataOption>>>`）——每个别名对应一个 `SelectProps` 对象，各自携带：

| 字段 | 值 | 说明 |
|-------|-------|-------------|
| `options` | `DataOptionWithPinyin<DataOption>[]` | 码集条目（含嵌套 `children`），每一项都为 `label` 和 `description` 预计算了拼音 |
| `loading` | `boolean` | 批量码集查询进行中时为 `true` |
| `fieldNames` | `{ label, value, options: 'children', groupLabel: 'label' }` | 把 `DataOption` 的形状映射到 select 上 |
| `maxTagCount` | `'responsive'` | 多选模式下折叠超出的标签 |
| `listHeight` | `280` | 下拉列表高度 |
| `notFoundContent` | 获取期间为 `Loader` | 初次获取期间显示加载器而非"暂无数据" |
| `showSearch` | `boolean` | 该别名最终解析出的 filterable 标志 |
| `filterOption` | `(input, option) => boolean` | 匹配 `label` / `description`、其完整拼音及拼音首字母（仅在可过滤时设置） |

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
