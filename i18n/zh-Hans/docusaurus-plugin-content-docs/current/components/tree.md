---
title: "Tree"
description: "用于展示层级数据的树形视图组件。"
---

# Tree

用于展示层级数据的树形视图组件。

> **来源：** 从 `antd` 重新导出，并增加了 VEF Hook 增强。完整文档：[Ant Design Tree](https://ant.design/components/tree/)

## 基础用法

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

## VEF 增强：`useDataOptionsTree`

从异步数据源加载树形数据，内置加载状态和搜索支持。数据获取相关的选项统一嵌套在 `queryOptions` 中（与 TanStack Query 的 `useQuery` 接受的形状相同），`useDataOptionsTree` 自身的选项与其平级。

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

### `useDataOptionsTree` 选项

| 选项 | 类型 | 默认值 | 说明 |
|--------|------|---------|-------------|
| `queryOptions` | `UseQueryOptions<TQueryFnData[], TData[], TParams>` | 必填 | TanStack Query 选项（`queryKey`、`queryFn` 及 `useQuery` 的其余选项） |
| `onFetch` | `(data: TData[]) => void` | — | 数据获取完成后的回调 |
| `labelKey` | `string \| (item: TData) => string` | `"label"` | 节点 label 的字段映射 |
| `valueKey` | `string \| (item: TData) => Key` | `"value"` | 节点 value 的字段映射 |
| `disabledKey` | `string \| (item: TData) => boolean \| undefined` | `"disabled"` | 禁用状态的字段映射 |
| `descriptionKey` | `string \| (item: TData) => string \| undefined` | `"description"` | 节点说明文字的字段映射 |
| `childrenKey` | `string \| (item: TData) => TData[] \| undefined` | `"children"` | 嵌套子节点的字段映射（会递归转换） |

每个 `*Key` 选项都可以是字符串路径（例如 `"user.name"`）或提取函数。

### `useDataOptionsTree` 返回值

| 字段 | 类型 | 说明 |
|-------|------|-------------|
| `treeProps` | `TreeProps<DataOptionWithPinyin>` | 可直接展开的 props：`treeData`（搜索时过滤为匹配节点及其祖先）、`fieldNames`（`title: 'label'`、`key: 'value'`、`children`）、`showLine`（不带叶子图标）、`autoExpandParent`、`blockNode` 和 `filterTreeNode` |
| `isFetching` | `boolean` | 查询是否正在获取数据 |
| `searchValue` | `string` | 当前搜索关键词 |
| `setSearchValue` | `(value: string) => void` | 设置搜索关键词——接到你自己的搜索输入框上；匹配时比较 `label` / `description`、其完整拼音及拼音首字母 |

其余属性请参阅 [Ant Design Tree 文档](https://ant.design/components/tree/)。
