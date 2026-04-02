---
sidebar_position: 4
---

# Select 选择器

下拉选择器，从一组选项中选择一个或多个值。

> **来源：** 从 `antd` 重新导出，并提供 VEF Hook 增强。完整文档：[Ant Design Select](https://ant.design/components/select-cn/)

## 何时使用

- 弹出一个下拉菜单给用户选择操作，用于代替原生的 `select`。
- 选项数量较多，需要过滤时。
- 选项少于 5 个时，建议使用 `Radio`。

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
      placeholder="请选择"
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
      placeholder="请选择多项"
      options={[
        { value: 'a', label: '选项 A' },
        { value: 'b', label: '选项 B' },
        { value: 'c', label: '选项 C' },
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
      placeholder="搜索选择"
      filterOption={(input, option) =>
        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
      }
      options={[
        { value: '1', label: '北京' },
        { value: '2', label: '上海' },
        { value: '3', label: '广州' },
      ]}
    />
  );
}
```

## VEF 增强：`useDataOptionsSelect`

VEF 提供 `useDataOptionsSelect`，用于从异步数据源加载选项，内置 loading 状态、拼音搜索支持和缓存。

```tsx
import { Select, useDataOptionsSelect } from '@vef-framework-react/components';

async function fetchCities() {
  const res = await fetch('/api/cities');
  return res.json(); // 返回 DataOption[]
}

export default function Demo() {
  const selectProps = useDataOptionsSelect({
    queryKey: ['cities'],
    queryFn: fetchCities,
    filterable: true, // 启用拼音/文本过滤
  });

  return <Select style={{ width: 200 }} {...selectProps} />;
}
```

### `useDataOptionsSelect` 参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `queryKey` | `QueryKey` | 必填 | TanStack Query 缓存 key |
| `queryFn` | `() => Promise<TData[]>` | 必填 | 异步数据获取函数 |
| `filterable` | `boolean` | `false` | 启用客户端文本/拼音过滤 |
| `onFetch` | `(data: TData[]) => void` | — | 数据获取成功后的回调 |
| `select` | `(data: TData) => DataOption` | — | 将原始数据转换为 `DataOption` |
| `params` | `TParams` | — | 查询参数（变化时触发重新请求） |

该 Hook 返回的 `SelectProps` 可直接展开到 `<Select>` 上。

## API

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `value` | `string \| string[]` | — | 指定当前选中的条目（受控） |
| `defaultValue` | `string \| string[]` | — | 指定默认选中的条目（非受控） |
| `options` | `SelectOption[]` | — | 数据化配置选项内容 |
| `mode` | `'multiple' \| 'tags'` | — | 设置 Select 的模式为多选或标签 |
| `placeholder` | `string` | — | 选择框默认文字 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `loading` | `boolean` | `false` | 加载中状态 |
| `showSearch` | `boolean` | `false` | 使单选模式可搜索 |
| `allowClear` | `boolean` | `false` | 支持清除 |
| `filterOption` | `boolean \| function` | `true` | 是否根据输入项进行筛选 |
| `size` | `'large' \| 'middle' \| 'small'` | `'middle'` | 选择框大小 |
| `status` | `'error' \| 'warning'` | — | 设置校验状态 |
| `variant` | `'outlined' \| 'filled' \| 'borderless'` | `'outlined'` | 形态变体 |
| `onChange` | `(value, option) => void` | — | 选中 option 时调用此函数 |
| `onSearch` | `(value: string) => void` | — | 文本框值变化时回调 |
| `onClear` | `() => void` | — | 清除内容时回调 |

## 最佳实践

- 远程数据使用 `useDataOptionsSelect`，避免手动管理 loading 状态。
- 非必填字段设置 `allowClear`。
- 在表单中使用 `form.Field.Select`，与 VEF 表单系统自动集成。
