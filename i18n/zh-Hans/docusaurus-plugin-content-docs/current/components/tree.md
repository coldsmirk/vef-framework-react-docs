---
sidebar_position: 105
---

# Tree 树形控件

用于展示具有层级关系的数据。

> **来源：** 从 `antd` 重新导出，并提供 VEF Hook 增强。完整文档：[Ant Design Tree](https://ant.design/components/tree-cn/)

## 基础用法

```tsx
import { Tree } from '@vef-framework-react/components';
import type { TreeNode } from '@vef-framework-react/components';

const treeData: TreeNode[] = [
  {
    title: '父节点 1',
    key: '0-0',
    children: [
      { title: '子节点 1-1', key: '0-0-0' },
      { title: '子节点 1-2', key: '0-0-1' },
    ],
  },
];

export default function Demo() {
  return <Tree treeData={treeData} defaultExpandAll />;
}
```

## VEF 增强：`useDataOptionsTree`

从异步数据源加载树形数据，内置 loading 状态和搜索支持：

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
        placeholder="搜索..."
      />
      <Tree {...treeProps} />
    </>
  );
}
```

### `useDataOptionsTree` 参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `queryKey` | `QueryKey` | 必填 | TanStack Query 缓存 key |
| `queryFn` | `() => Promise<TData[]>` | 必填 | 异步数据获取函数 |
| `onFetch` | `(data: TData[]) => void` | — | 数据获取成功后的回调 |

返回 `{ treeProps, isFetching, searchValue, setSearchValue }`。

其他属性请参阅 [Ant Design Tree 文档](https://ant.design/components/tree-cn/)。
