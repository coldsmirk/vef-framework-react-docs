---
title: "ScrollArea"
description: "带样式化滚动条和滚动事件回调的自定义可滚动容器。"
---

# ScrollArea

带样式化滚动条和滚动事件回调的自定义可滚动容器。

> **VEF 专属组件。** 基于 [`@radix-ui/react-scroll-area`](https://www.radix-ui.com/primitives/docs/components/scroll-area) 构建。

## 何时使用

- 用统一样式的滚动条替代浏览器原生滚动条。
- 监听滚动到顶部或底部的事件（如无限滚动、返回顶部按钮）。
- 控制过度滚动行为。

## 基础用法

```tsx
import { ScrollArea } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <ScrollArea style={{ height: 300 }}>
      {Array.from({ length: 50 }, (_, i) => (
        <div key={i} style={{ padding: '8px 16px' }}>
          Item {i + 1}
        </div>
      ))}
    </ScrollArea>
  );
}
```

## 无限滚动

```tsx
import { ScrollArea } from '@vef-framework-react/components';

export default function InfiniteList() {
  const loadMore = () => {
    fetchNextPage();
  };

  return (
    <ScrollArea
      style={{ height: 400 }}
      onBottomReached={loadMore}
    >
      {items.map((item) => (
        <div key={item.id}>{item.name}</div>
      ))}
    </ScrollArea>
  );
}
```

## 滚动位置追踪

```tsx
import { ScrollArea } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <ScrollArea
      style={{ height: 300 }}
      onScrollPositionChange={({ x, y }) => {
        console.log('Scroll position:', x, y);
      }}
    >
      {/* content */}
    </ScrollArea>
  );
}
```

## API

| Prop | Type | Default | 说明 |
|------|------|---------|-------------|
| `scrollbars` | `'both' \| 'vertical' \| 'horizontal'` | `'both'` | 渲染哪些方向的滚动条 |
| `scrollbarSize` | `Length` | `'10px'` | 滚动条轨道宽度/高度 |
| `scrollbarPadding` | `Length` | `'2px'` | 滚动条内边距 |
| `type` | `'auto' \| 'always' \| 'scroll' \| 'hover'` | `'hover'` | 滚动条显示模式 |
| `scrollHideDelay` | `number` | `600` | 滚动条隐藏前的延迟（毫秒） |
| `viewportRef` | `Ref<HTMLDivElement>` | — | 视口元素的 ref |
| `viewportClassName` | `string` | — | 视口元素的类名 |
| `viewportStyle` | `CSSProperties` | — | 视口元素的样式 |
| `overscrollBehavior` | `CSSProperties['overscrollBehavior']` | — | 过度滚动行为 |
| `onScrollPositionChange` | `(position: { x: number; y: number }) => void` | — | 滚动位置变化回调 |
| `onTopReached` | `() => void` | — | 滚动到顶部时触发 |
| `onBottomReached` | `() => void` | — | 滚动到底部时触发 |

同时支持所有标准 `div` 属性。

## 最佳实践

- 为 `ScrollArea` 设置明确的 `height` 或 `max-height`——它需要一个有边界的容器才能滚动。
- 使用 `onBottomReached` 实现无限滚动模式，无需编写 `IntersectionObserver` 样板代码。
- 使用 `type="always"` 始终显示滚动条（适用于数据密集型面板）。
