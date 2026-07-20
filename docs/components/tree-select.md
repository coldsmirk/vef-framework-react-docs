---
title: "TreeSelect"
description: "A tree-structured dropdown selector."
---

# TreeSelect

A tree-structured dropdown selector.

> **Source:** Re-exported from `antd` with VEF hook enhancement. Full documentation: [Ant Design TreeSelect](https://ant.design/components/tree-select/)

## Basic Usage

```tsx
import { TreeSelect } from '@vef-framework-react/components';

const treeData = [
  {
    value: 'parent1',
    title: 'Parent 1',
    children: [
      { value: 'child1', title: 'Child 1' },
      { value: 'child2', title: 'Child 2' },
    ],
  },
];

export default function Demo() {
  return (
    <TreeSelect
      style={{ width: 300 }}
      treeData={treeData}
      placeholder="Select a node"
    />
  );
}
```

## VEF Enhancement: `useDataOptionsTreeSelect`

Load tree data from an async source with built-in loading state and optional pinyin filtering. Fetch options are nested under `queryOptions` (the same shape TanStack Query's `useQuery` accepts); `useDataOptionsTreeSelect`-specific options sit alongside it.

```tsx
import { TreeSelect, useDataOptionsTreeSelect } from '@vef-framework-react/components';

async function fetchOrgs() {
  const res = await fetch('/api/orgs');
  return res.json();
}

export default function Demo() {
  const treeSelectProps = useDataOptionsTreeSelect({
    queryOptions: {
      queryKey: ['orgs'],
      queryFn: fetchOrgs,
    },
    filterable: true,
  });

  return <TreeSelect style={{ width: 300 }} {...treeSelectProps} />;
}
```

### `useDataOptionsTreeSelect` Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `queryOptions` | `UseQueryOptions<TQueryFnData[], TData[], TParams>` | required | TanStack Query options (`queryKey`, `queryFn`, and the rest of `useQuery`'s options) |
| `filterable` | `boolean` | `false` | Enable client-side text/pinyin filtering |
| `onFetch` | `(data: TData[]) => void` | — | Callback after data is fetched |
| `labelKey` | `string \| (item: TData) => string` | `"label"` | Field mapping for the node label |
| `valueKey` | `string \| (item: TData) => Key` | `"value"` | Field mapping for the node value |
| `disabledKey` | `string \| (item: TData) => boolean \| undefined` | `"disabled"` | Field mapping for the disabled state |
| `descriptionKey` | `string \| (item: TData) => string \| undefined` | `"description"` | Field mapping for the node description |
| `childrenKey` | `string \| (item: TData) => TData[] \| undefined` | `"children"` | Field mapping for nested children (recursively transformed) |

Each `*Key` option accepts either a string path (e.g. `"user.name"`) or an extractor function.

### `useDataOptionsTreeSelect` Result

The hook returns a ready-to-spread `TreeSelectProps<Key, DataOptionWithPinyin<TData>>` carrying:

| Field | Value | Description |
|-------|-------|-------------|
| `treeData` | `DataOptionWithPinyin<TData>[]` | The transformed tree, each node enhanced with precomputed pinyin for `label` and `description` |
| `loading` | `boolean` | `true` while the query is fetching |
| `fieldNames` | `{ label, value, children }` | Maps `DataOption`'s shape onto the tree select |
| `maxTagCount` | `'responsive'` | Collapses excess tags in multiple mode |
| `listHeight` | `280` | Dropdown list height |
| `notFoundContent` | `Loader` while fetching | Shows a loader instead of "no data" during the initial fetch |
| `showSearch` | `boolean` | The `filterable` flag |
| `filterTreeNode` | `(input, node) => boolean` | Matches `label` / `description`, their full pinyin, and pinyin initials (only set when `filterable`) |
| `treeNodeFilterProp` / `treeNodeLabelProp` | `'labelPinyinInitials'` / `'label'` | Search matches against pinyin initials; the trigger displays the label |
| `treeLine` | `{ showLeafIcon: false }` | Connecting lines without leaf icons |

For all other props, see [Ant Design TreeSelect documentation](https://ant.design/components/tree-select/).
