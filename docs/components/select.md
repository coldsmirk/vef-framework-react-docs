---
title: "Select"
description: "A dropdown selector for choosing one or multiple values from a list."
---

# Select

A dropdown selector for choosing one or multiple values from a list.

> **Source:** Re-exported from `antd` with VEF hook enhancements. Full documentation: [Ant Design Select](https://ant.design/components/select/)

## When to Use

- The content of the options is complex (e.g. with icons or descriptions).
- The number of options is large and needs filtering.
- Use `Radio` when there are fewer than 5 options.

## Basic Usage

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

## Multiple Selection

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

## Searchable

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

## VEF Enhancement: `useDataOptionsSelect`

VEF provides `useDataOptionsSelect` to load options from an async data source with built-in loading state, pinyin search support, and caching. Fetch options are nested under `queryOptions` (the same shape TanStack Query's `useQuery` accepts); `useDataOptionsSelect`-specific options sit alongside it.

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

### `useDataOptionsSelect` Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `queryOptions` | `UseQueryOptions<TQueryFnData[], TData[], TParams>` | required | TanStack Query options (`queryKey`, `queryFn`, and the rest of `useQuery`'s options) |
| `filterable` | `boolean` | `false` | Enable client-side text/pinyin filtering |
| `onFetch` | `(data: TData[]) => void` | — | Callback after data is fetched |
| `labelKey` | `string \| (item: TData) => string` | `"label"` | Field mapping for the option label |
| `valueKey` | `string \| (item: TData) => Key` | `"value"` | Field mapping for the option value |
| `disabledKey` | `string \| (item: TData) => boolean \| undefined` | `"disabled"` | Field mapping for the disabled state |
| `descriptionKey` | `string \| (item: TData) => string \| undefined` | `"description"` | Field mapping for the option description |
| `childrenKey` | `string \| (item: TData) => TData[] \| undefined` | `"children"` | Field mapping for nested option children (recursively transformed) |

Each `*Key` option accepts either a string path (e.g. `"user.name"`) or an extractor function.

The hook returns `SelectProps` that can be spread directly onto `<Select>`.

## VEF Enhancement: `useDictionaryOptionsSelect`

For data-dictionary-backed options, `useDictionaryOptionsSelect` wraps `useDictionaryQuery` and returns ready-to-spread `SelectProps` per alias:

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

The first argument maps each alias to a dictionary key string, or `{ key, filterable? }` to override filtering per alias. The optional second argument, `{ filterable }`, sets the default for aliases that don't specify their own. See [Data Dictionaries](../guide/data-dictionaries.md).

## API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string \| string[]` | — | Selected value (controlled) |
| `defaultValue` | `string \| string[]` | — | Initial value (uncontrolled) |
| `options` | `SelectOption[]` | — | Option list |
| `mode` | `'multiple' \| 'tags'` | — | Multi-select mode |
| `placeholder` | `string` | — | Placeholder text |
| `disabled` | `boolean` | `false` | Disable the select |
| `loading` | `boolean` | `false` | Show loading state |
| `showSearch` | `boolean` | `false` | Enable search |
| `allowClear` | `boolean` | `false` | Show clear button |
| `filterOption` | `boolean \| function` | `true` | Filter function |
| `size` | `'large' \| 'medium' \| 'small'` | `'medium'` | Select size (`'middle'` is a deprecated alias for `'medium'`) |
| `status` | `'error' \| 'warning'` | — | Validation status |
| `variant` | `'outlined' \| 'filled' \| 'borderless'` | `'outlined'` | Visual variant |
| `onChange` | `(value, option) => void` | — | Change handler |
| `onSearch` | `(value: string) => void` | — | Search handler |
| `onClear` | `() => void` | — | Clear handler |

## Best Practices

- Use `useDataOptionsSelect` for remote data to avoid manual loading state management.
- Set `allowClear` for optional fields.
- For form usage, use the [`Form`](./form) field component, which integrates with the VEF form system:

```tsx
<form.AppField name="city">
  {(field) => <field.Select label="City" options={options} />}
</form.AppField>
```
