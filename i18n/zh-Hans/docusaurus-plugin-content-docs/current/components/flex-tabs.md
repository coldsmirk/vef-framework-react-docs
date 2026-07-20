---
title: "FlexTabs"
description: "一个填满受高度约束的 flex 父容器的 Tabs 变体——标签栏保持固定，激活面板拉伸占满剩余空间。"
---

# FlexTabs

一个填满受高度约束的 flex 父容器的 `Tabs` 变体——标签栏保持固定，激活面板拉伸占满剩余空间，因此面板内容自行管理滚动，而不是把页面撑高。它是纯 `Tabs` 重导出的高度填充对应物，正如 [`FlexCard`](./flex-card.md) 之于 `Card`。

> **VEF 专属组件。** v2.12.0 新增。在 Ant Design `Tabs` 重导出的基础上附加了高度填充的布局样式。

## 何时使用

- 全高页面布局：每个标签面板承载表格、控制台或日志视图，需要在标签栏固定不动的同时在面板内部滚动。
- 任何放在受高度约束的纵向 flex 容器（[`Page`](./page.md) 主体、[`FlexCard`](./flex-card.md)、设定了尺寸的 [`Stack`](./stack.md)）中、需要吸收剩余高度的 `Tabs`。
- 如果标签页应随内容自然撑开、由页面整体滚动，请改用纯 `Tabs` 重导出。

## 基础用法

`FlexTabs` 只会填充父容器约束出来的空间：请把它放进有固定高度的纵向 flex 容器里。典型形态是一个以任务表格为面板的页面：

```tsx
import { FlexTabs, Page } from '@vef-framework-react/components';

export default function TaskCenterPage() {
  return (
    <Page margin>
      {/* A height-bounded flex column: FlexTabs absorbs the remaining space. */}
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <FlexTabs
          items={[
            { key: 'pending', label: 'Pending', children: <PendingTaskTable /> },
            { key: 'completed', label: 'Completed', children: <CompletedTaskTable /> }
          ]}
        />
      </div>
    </Page>
  );
}
```

## 面板内滚动

由于激活面板被钉在剩余高度内，滚动是面板内容自己的职责——可与 [`Table`](./table.md) 的 `flexHeight` 或 [`ScrollArea`](./scroll-area.md) 组合使用：

```tsx
import { FlexTabs, ScrollArea, Table } from '@vef-framework-react/components';

<FlexTabs
  items={[
    {
      key: 'runs',
      label: 'Runs',
      // The pane is height-bounded, so the table can flex its body height.
      children: <Table flexHeight columns={columns} dataSource={runs} />
    },
    {
      key: 'raw',
      label: 'Raw Output',
      children: (
        <ScrollArea style={{ height: '100%' }}>
          <pre>{rawOutput}</pre>
        </ScrollArea>
      )
    }
  ]}
/>
```

## 高度填充的工作原理

`FlexTabs` 渲染的就是 Ant Design 的 `Tabs`，只附加了一段 Emotion 样式块，除此之外不做任何改动：

- 标签页根节点获得 `flex: 1` 与 `min-height: 0`，因此它会在纵向 flex 父容器中撑开，并允许收缩到小于内容尺寸。
- Ant Design v6 将面板渲染为 `.vef-tabs-body-holder > .vef-tabs-body > .vef-tabs-content`。holder 本身已受 flex 约束，但内层两级会随内容增长——`FlexTabs` 把这两级都固定为 `height: 100%`，让激活面板恰好止于标签页底边。
- 某些标签页配置会在 holder 外再包一层中间 `div`，因此规则也会匹配 `> div > .vef-tabs-body-holder`。

有两个值得了解的推论：

- **面板作用域。** 每一跳选择器都是直接子代组合器，因此高度规则只作用于 `FlexTabs` 自己的面板——嵌套在面板*内部*的 `Tabs`（或另一个 `FlexTabs`）绝不会被外层改写样式。
- **类名前缀。** 这些规则针对框架 [`ConfigProvider`](./config-provider.md) 设置的 `vef-` 类名前缀；`FlexTabs` 假定自己渲染在该 provider 之下。

## API

`FlexTabsProps` 就是 Ant Design 的 `TabsProps`——一个没有任何额外成员的类型别名：

```ts
export type FlexTabsProps = TabsProps;
```

所有 `Tabs` 属性（`items`、`activeKey`、`defaultActiveKey`、`onChange`、`tabPosition`、`type`、`size`……）原样适用；参见 [Ant Design Tabs 文档](https://ant.design/components/tabs/)。上文描述的布局行为完全通过样式附加，而非通过属性。
