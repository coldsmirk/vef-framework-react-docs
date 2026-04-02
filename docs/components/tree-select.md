---
sidebar_position: 106
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

Load tree data from an async source with built-in loading state and optional pinyin filtering:

```tsx
import { TreeSelect, useDataOptionsTreeSelect } from '@vef-framework-react/components';

async function fetchOrgs() {
  const res = await fetch('/api/orgs');
  return res.json();
}

export default function Demo() {
  const treeSelectProps = useDataOptionsTreeSelect({
    queryKey: ['orgs'],
    queryFn: fetchOrgs,
    filterable: true,
  });

  return <TreeSelect style={{ width: 300 }} {...treeSelectProps} />;
}
```

### `useDataOptionsTreeSelect` Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `queryKey` | `QueryKey` | required | TanStack Query cache key |
| `queryFn` | `() => Promise<TData[]>` | required | Async data fetcher |
| `filterable` | `boolean` | `false` | Enable client-side text/pinyin filtering |
| `onFetch` | `(data: TData[]) => void` | — | Callback after data is fetched |

For all other props, see [Ant Design TreeSelect documentation](https://ant.design/components/tree-select/).
