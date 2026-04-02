---
sidebar_position: 106
---

# TreeSelect 树形选择器

树形结构的下拉选择器。

> **来源：** 从 `antd` 重新导出，并提供 VEF Hook 增强。完整文档：[Ant Design TreeSelect](https://ant.design/components/tree-select-cn/)

## 基础用法

```tsx
import { TreeSelect } from '@vef-framework-react/components';

const treeData = [
  {
    value: 'parent1',
    title: '父节点 1',
    children: [
      { value: 'child1', title: '子节点 1' },
      { value: 'child2', title: '子节点 2' },
    ],
  },
];

export default function Demo() {
  return (
    <TreeSelect
      style={{ width: 300 }}
      treeData={treeData}
      placeholder="请选择"
    />
  );
}
```

## VEF 增强：`useDataOptionsTreeSelect`

从异步数据源加载树形数据，内置 loading 状态和可选拼音过滤：

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

### `useDataOptionsTreeSelect` 参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `queryKey` | `QueryKey` | 必填 | TanStack Query 缓存 key |
| `queryFn` | `() => Promise<TData[]>` | 必填 | 异步数据获取函数 |
| `filterable` | `boolean` | `false` | 启用客户端文本/拼音过滤 |
| `onFetch` | `(data: TData[]) => void` | — | 数据获取成功后的回调 |

其他属性请参阅 [Ant Design TreeSelect 文档](https://ant.design/components/tree-select-cn/)。
