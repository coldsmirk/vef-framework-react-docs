---
title: "TreeSelect"
description: "树形结构的下拉选择器。"
---

# TreeSelect

树形结构的下拉选择器。

> **来源：** 从 `antd` 重新导出，并增加了 VEF Hook 增强。完整文档：[Ant Design TreeSelect](https://ant.design/components/tree-select/)

## 基础用法

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

## VEF 增强：`useDataOptionsTreeSelect`

从异步数据源加载树形数据，内置加载状态，并可选启用拼音过滤。数据获取相关的选项统一嵌套在 `queryOptions` 中（与 TanStack Query 的 `useQuery` 接受的形状相同），`useDataOptionsTreeSelect` 自身的选项与其平级。

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

### `useDataOptionsTreeSelect` 选项

类型为 `UseDataOptionsTreeSelectOptions`。

| 选项 | 类型 | 默认值 | 说明 |
|--------|------|---------|-------------|
| `queryOptions` | `UseQueryOptions<TQueryFnData[], TData[], TParams>` | 必填 | TanStack Query 选项（`queryKey`、`queryFn` 及 `useQuery` 的其余选项） |
| `filterable` | `boolean` | `false` | 启用客户端文本/拼音过滤 |
| `onFetch` | `(data: TData[]) => void` | — | 数据获取完成后的回调 |
| `labelKey` | `string \| (item: TData) => string` | `"label"` | 节点 label 的字段映射 |
| `valueKey` | `string \| (item: TData) => Key` | `"value"` | 节点 value 的字段映射 |
| `disabledKey` | `string \| (item: TData) => boolean \| undefined` | `"disabled"` | 禁用状态的字段映射 |
| `descriptionKey` | `string \| (item: TData) => string \| undefined` | `"description"` | 节点说明文字的字段映射 |
| `childrenKey` | `string \| (item: TData) => TData[] \| undefined` | `"children"` | 嵌套子节点的字段映射（会递归转换） |

每个 `*Key` 选项都可以是字符串路径（例如 `"user.name"`）或提取函数。

### `useDataOptionsTreeSelect` 返回值

该 Hook 返回可直接展开的 `TreeSelectProps<Key, DataOptionWithPinyin<TData>>`，携带：

| 字段 | 值 | 说明 |
|-------|-------|-------------|
| `treeData` | `DataOptionWithPinyin<TData>[]` | 转换后的树，每个节点都为 `label` 和 `description` 预计算了拼音 |
| `loading` | `boolean` | 查询进行中时为 `true` |
| `fieldNames` | `{ label, value, children }` | 把 `DataOption` 的形状映射到树形选择器上 |
| `maxTagCount` | `'responsive'` | 多选模式下折叠超出的标签 |
| `listHeight` | `280` | 下拉列表高度 |
| `notFoundContent` | 获取期间为 `Loader` | 初次获取期间显示加载器而非"暂无数据" |
| `showSearch` | `boolean` | 即 `filterable` 标志 |
| `filterTreeNode` | `(input, node) => boolean` | 匹配 `label` / `description`、其完整拼音及拼音首字母（仅在 `filterable` 时设置） |
| `treeNodeFilterProp` / `treeNodeLabelProp` | `'labelPinyinInitials'` / `'label'` | 搜索按拼音首字母匹配；触发器显示 label |
| `treeLine` | `{ showLeafIcon: false }` | 显示连接线且不带叶子图标 |

其余属性请参阅 [Ant Design TreeSelect 文档](https://ant.design/components/tree-select/)。
