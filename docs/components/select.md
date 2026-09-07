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

Whenever you set `showSearch` over a plain option list, pass `filterOptionByLabel` with it:

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

**antd's default `filterOption` matches the typed query against the option `value`** — the stored code — so a list of `{ label: 'Beijing', value: '1' }` filters to nothing for every word the user can actually see. `filterOptionByLabel` matches the **label** instead, case-insensitively and ignoring surrounding whitespace; a blank or all-whitespace query keeps every option. The value stays out of the comparison deliberately: it is storage, not copy, and matching it would let a query hit an option whose visible text does not contain the query at all — including numeric codes colliding with numbers the user typed for another reason. An option with no label, or a `ReactNode` label the predicate cannot read as text, does not match.

The framework applies it wherever it sets `showSearch` itself — the form editor's `select` field and its editable-table column editor, the cron schedule page's job-handler pickers, and the integration console's log filters. The two options hooks below are the exception: `useDataOptionsSelect` and `useCodeSetOptionsSelect` install their own pinyin-aware predicate over the richer option shape they produce (label, description, and both pinyin forms of each), so **do not** pass `filterOptionByLabel` on top of a spread from either.

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

## VEF Enhancement: `useCodeSetOptionsSelect`

For code-set-backed options, `useCodeSetOptionsSelect` wraps `useCodeSetQuery` and returns ready-to-spread `SelectProps` per alias:

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

All aliases are fetched in one batched code-set query. See [Code Sets](../guide/code-sets.md) for the backing query and app-context wiring.

### `useCodeSetOptionsSelect` Signature

```ts
function useCodeSetOptionsSelect<const T extends CodeSetAliasMap>(
  keys: T,
  options?: UseCodeSetOptionsSelectOptions
): UseCodeSetOptionsSelectResult<T>;
```

**`keys`** (`CodeSetAliasMap`, required) maps each alias to a `CodeSetKeyValue` — either a code set key string, or a `CodeSetKeyConfig` object:

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `key` | `CodeSetKey` | required | The code set key (typed via the `Register` augmentation, otherwise `string`) |
| `filterable` | `boolean` | the hook-level `filterable` | Per-alias override for search filtering |

**`options`** (`UseCodeSetOptionsSelectOptions`, optional):

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `filterable` | `boolean` | `false` | Whether each select should enable search; aliases with their own `filterable` config win over this default |

**Result** (`UseCodeSetOptionsSelectResult<T>` = `Record<keyof T, SelectProps<Key, DataOptionWithPinyin<DataOption>>>`) — one `SelectProps` object per alias, each carrying:

| Field | Value | Description |
|-------|-------|-------------|
| `options` | `DataOptionWithPinyin<DataOption>[]` | The code set entries (including nested `children`), each enhanced with precomputed pinyin for `label` and `description` |
| `loading` | `boolean` | `true` while the batched code-set query is fetching |
| `fieldNames` | `{ label, value, options: 'children', groupLabel: 'label' }` | Maps `DataOption`'s shape onto the select |
| `maxTagCount` | `'responsive'` | Collapses excess tags in multiple mode |
| `listHeight` | `280` | Dropdown list height |
| `notFoundContent` | `Loader` while fetching | Shows a loader instead of "no data" during the initial fetch |
| `showSearch` | `boolean` | The resolved per-alias filterable flag |
| `filterOption` | `(input, option) => boolean` | Matches `label` / `description`, their full pinyin, and pinyin initials (only set when filterable) |

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
