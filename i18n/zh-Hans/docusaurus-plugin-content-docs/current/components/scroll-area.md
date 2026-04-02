---
sidebar_position: 14
---

# ScrollArea 滚动区域

带自定义样式滚动条和滚动事件回调的可滚动容器。

> **VEF 特有组件**，基于 [`@radix-ui/react-scroll-area`](https://www.radix-ui.com/primitives/docs/components/scroll-area) 构建。

## 何时使用

- 用统一样式的自定义滚动条替代浏览器原生滚动条。
- 监听滚动到顶部或底部事件（如无限滚动、返回顶部按钮）。
- 控制过度滚动行为。

## 基础用法

```tsx
import { ScrollArea } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <ScrollArea style={{ height: 300 }}>
      {Array.from({ length: 50 }, (_, i) => (
        <div key={i} style={{ padding: '8px 16px' }}>
          项目 {i + 1}
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
        console.log('滚动位置：', x, y);
      }}
    >
      {/* 内容 */}
    </ScrollArea>
  );
}
```

## API

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `scrollbarSize` | `Length` | `'10px'` | 滚动条宽度/高度 |
| `scrollbarPadding` | `Length` | `'2px'` | 滚动条内边距 |
| `type` | `'auto' \| 'always' \| 'scroll' \| 'hover'` | `'hover'` | 滚动条显示模式 |
| `scrollHideDelay` | `number` | `600` | 滚动条隐藏延迟（毫秒） |
| `viewportRef` | `Ref<HTMLDivElement>` | — | 视口元素的 ref |
| `viewportClassName` | `string` | — | 视口元素的类名 |
| `viewportStyle` | `CSSProperties` | — | 视口元素的样式 |
| `overscrollBehavior` | `CSSProperties['overscrollBehavior']` | — | 过度滚动行为 |
| `onScrollPositionChange` | `(position: { x: number; y: number }) => void` | — | 滚动位置变化回调 |
| `onTopReached` | `() => void` | — | 滚动到顶部时触发 |
| `onBottomReached` | `() => void` | — | 滚动到底部时触发 |

支持所有标准 `div` 属性。

## 最佳实践

- 为 `ScrollArea` 设置明确的 `height` 或 `max-height`——需要有界容器才能滚动。
- 使用 `onBottomReached` 实现无限滚动，无需手写 `IntersectionObserver`。
- 数据密集型面板使用 `type="always"` 始终显示滚动条。
