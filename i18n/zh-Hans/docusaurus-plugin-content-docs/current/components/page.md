---
title: "Page"
description: "业务页面的主容器，支持左右侧边面板、页头、页脚、操作栏及可滚动内容。"
---

# Page

业务页面的主容器，支持左右侧边面板、页头、页脚、操作栏及可滚动内容。

> **VEF 专属组件。** 不属于 Ant Design 的一部分。已在 v2.1.6 中从 `@vef-framework-react/starter` 迁移至 `@vef-framework-react/components`。

## 何时使用

- 任何需要统一布局外壳的标准业务页面。
- 左侧树形结构 + 右侧内容区域的页面。
- 需要固定页头或页脚的页面。

## 基础用法

```tsx
import { Page } from '@vef-framework-react/components';

export default function UserPage() {
  return (
    <Page>
      <div>Main content</div>
    </Page>
  );
}
```

## 带左侧边栏

```tsx
import { Page } from '@vef-framework-react/components';

export default function UserPage() {
  return (
    <Page
      leftAside={<DeptTree />}
      leftAsideWidth={260}
    >
      <UserTable />
    </Page>
  );
}
```

## 可调整宽度的侧边栏

```tsx
<Page
  leftAside={<DeptTree />}
  leftAsideWidth={{ defaultWidth: 260, minWidth: 180, maxWidth: 400 }}
>
  <UserTable />
</Page>
```

## 带页头和页脚

```tsx
<Page
  header={<PageTitle>Users</PageTitle>}
  headerPosition="outside"
  footer={<StatusBar />}
  footerPosition="inside"
>
  <UserTable />
</Page>
```

## API

| Prop | Type | Default | 说明 |
|------|------|---------|-------------|
| `className` | `string` | — | 页面容器的类名 |
| `margin` | `boolean` | `false` | 为容器应用 `var(--vef-spacing-md)` 外边距 |
| `gap` | `Length` | `var(--vef-spacing-md)` | 网格单元格间距 |
| `mainClassName` | `string` | — | 主内容区域的类名 |
| `leftAside` | `ReactNode` | — | 左侧边栏内容 |
| `leftAsideClassName` | `string` | — | 左侧边栏的类名 |
| `leftAsideWidth` | `AsideWidth` | `280` | 固定宽度或可调整宽度配置 |
| `rightAside` | `ReactNode` | — | 右侧边栏内容 |
| `rightAsideClassName` | `string` | — | 右侧边栏的类名 |
| `rightAsideWidth` | `AsideWidth` | `280` | 固定宽度或可调整宽度配置 |
| `header` | `ReactNode` | — | 页头内容 |
| `headerClassName` | `string` | — | 页头的类名 |
| `headerPosition` | `'inside' \| 'outside'` | `'inside'` | `'outside'` 时跨越全宽（包含侧边栏） |
| `footer` | `ReactNode` | — | 页脚内容 |
| `footerClassName` | `string` | — | 页脚的类名 |
| `footerPosition` | `'inside' \| 'outside'` | `'inside'` | `'outside'` 时跨越全宽（包含侧边栏） |
| `actionBar` | `ReactNode` | — | 操作栏内容 |
| `actionBarClassName` | `string` | — | 操作栏的类名 |
| `scrollable` | `boolean` | — | 主内容区域是否可滚动 |
| `scrollMargin` | `boolean` | `false` | 为滚动条间距自动添加外边距（需要 `scrollable`） |

### `AsideWidth`

```ts
type AsideWidth = string | number | {
  defaultWidth?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
};
```

### `useViewportHeight`

与 `Page` 一同导出的 hook，用于计算可用视口高度：

```ts
import { useViewportHeight } from '@vef-framework-react/components';

const height = useViewportHeight();
```

> 在 `<Page scrollable>` 之外调用 `useViewportHeight` 会抛出异常——它读取的 context 值只有 `Page` 会提供，且仅在 `scrollable` 为 `true` 时提供。

### 入场 Hook

`Page` 在挂载时播放入场动画，并把"页面已经就位"暴露为一个信号。次级动效、自动聚焦、引导提示或推迟的重型初始化都可以以它为触发点，在入场结束后再开始，而不是与入场动画抢占资源：

| 导出 | 类型 | 说明 |
|--------|------|-------------|
| `usePageEntranceEffect` | `(effect: () => void \| (() => void)) => void` | 在宿主 `Page` 的入场安定后运行一次 `effect`——若已经安定（包括在 `Page` 之外）则立即运行。不引发任何重渲染。清理函数在卸载时运行；若页面重载重放了入场动画，effect 会重新武装 |
| `usePageEntranceSettled` | `() => boolean` | 入场是否已结束（在 `Page` 之外立即为 `true`）。会订阅组件——入场安定时组件重渲染一次。当安定状态驱动渲染时使用 |
| `PageEntranceStore` | `{ isSettled(): boolean; subscribe(listener): () => void }` | context 所承载的底层 store 类型 |

CSS 也可以直接选中 `Page` 根节点的 `data-entrance` 属性。

```tsx
usePageEntranceEffect(() => {
  chart.startEntranceSequence();
});
```
