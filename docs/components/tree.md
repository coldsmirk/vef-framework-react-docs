---
title: "Tree"
description: "A tree view component for displaying hierarchical data."
---

# Tree

A tree view component for displaying hierarchical data.

> **Source:** Re-exported from `antd` with VEF hook enhancement. Full documentation: [Ant Design Tree](https://ant.design/components/tree/)

## Basic Usage

```tsx
import { Tree } from '@vef-framework-react/components';
import type { TreeNode } from '@vef-framework-react/components';

const treeData: TreeNode[] = [
  {
    title: 'Parent 1',
    key: '0-0',
    children: [
      { title: 'Child 1-1', key: '0-0-0' },
      { title: 'Child 1-2', key: '0-0-1' },
    ],
  },
];

export default function Demo() {
  return <Tree treeData={treeData} defaultExpandAll />;
}
```

## VEF Enhancement: `useDataOptionsTree`

Load tree data from an async source with built-in loading state and search support. Fetch options are nested under `queryOptions` (the same shape TanStack Query's `useQuery` accepts); `useDataOptionsTree`-specific options sit alongside it.

```tsx
import { Tree, useDataOptionsTree } from '@vef-framework-react/components';

async function fetchDepartments() {
  const res = await fetch('/api/departments');
  return res.json();
}

export default function Demo() {
  const { treeProps, searchValue, setSearchValue } = useDataOptionsTree({
    queryOptions: {
      queryKey: ['departments'],
      queryFn: fetchDepartments,
    },
  });

  return (
    <>
      <input
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        placeholder="Search..."
      />
      <Tree {...treeProps} />
    </>
  );
}
```

### `useDataOptionsTree` Options

Typed `UseDataOptionsTreeOptions`.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `queryOptions` | `UseQueryOptions<TQueryFnData[], TData[], TParams>` | required | TanStack Query options (`queryKey`, `queryFn`, and the rest of `useQuery`'s options) |
| `onFetch` | `(data: TData[]) => void` | — | Callback after data is fetched |
| `labelKey` | `string \| (item: TData) => string` | `"label"` | Field mapping for the node label |
| `valueKey` | `string \| (item: TData) => Key` | `"value"` | Field mapping for the node value |
| `disabledKey` | `string \| (item: TData) => boolean \| undefined` | `"disabled"` | Field mapping for the disabled state |
| `descriptionKey` | `string \| (item: TData) => string \| undefined` | `"description"` | Field mapping for the node description |
| `childrenKey` | `string \| (item: TData) => TData[] \| undefined` | `"children"` | Field mapping for nested children (recursively transformed) |

Each `*Key` option accepts either a string path (e.g. `"user.name"`) or an extractor function.

### `useDataOptionsTree` Result

| Field | Type | Description |
|-------|------|-------------|
| `treeProps` | `TreeProps<DataOptionWithPinyin>` | Ready-to-spread props: `treeData` (filtered down to matching nodes plus their ancestors while searching), `fieldNames` (`title: 'label'`, `key: 'value'`, `children`), `showLine` (without leaf icons), `autoExpandParent`, `blockNode`, and `filterTreeNode` |
| `isFetching` | `boolean` | Whether the query is fetching |
| `searchValue` | `string` | The current search keyword |
| `setSearchValue` | `(value: string) => void` | Set the search keyword — wire it to your own search input; matching compares `label` / `description`, their full pinyin, and pinyin initials |

For all other props, see [Ant Design Tree documentation](https://ant.design/components/tree/).
