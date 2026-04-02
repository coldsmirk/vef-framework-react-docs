---
sidebar_position: 105
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

Load tree data from an async source with built-in loading state and search support:

```tsx
import { Tree, useDataOptionsTree } from '@vef-framework-react/components';

async function fetchDepartments() {
  const res = await fetch('/api/departments');
  return res.json();
}

export default function Demo() {
  const { treeProps, searchValue, setSearchValue } = useDataOptionsTree({
    queryKey: ['departments'],
    queryFn: fetchDepartments,
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

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `queryKey` | `QueryKey` | required | TanStack Query cache key |
| `queryFn` | `() => Promise<TData[]>` | required | Async data fetcher |
| `onFetch` | `(data: TData[]) => void` | — | Callback after data is fetched |

Returns `{ treeProps, isFetching, searchValue, setSearchValue }`.

For all other props, see [Ant Design Tree documentation](https://ant.design/components/tree/).
