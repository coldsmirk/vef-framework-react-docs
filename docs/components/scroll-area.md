---
sidebar_position: 14
---

# ScrollArea

A custom scrollable container with styled scrollbars and scroll event callbacks.

> **VEF-specific component.** Built on [`@radix-ui/react-scroll-area`](https://www.radix-ui.com/primitives/docs/components/scroll-area).

## When to Use

- Replace native browser scrollbars with a consistent, styled scrollbar.
- Listen for scroll-to-top or scroll-to-bottom events (e.g. infinite scroll, back-to-top button).
- Control overscroll behavior.

## Basic Usage

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

## Infinite Scroll

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

## Scroll Position Tracking

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

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `scrollbarSize` | `Length` | `'10px'` | Scrollbar track width/height |
| `scrollbarPadding` | `Length` | `'2px'` | Scrollbar padding |
| `type` | `'auto' \| 'always' \| 'scroll' \| 'hover'` | `'hover'` | Scrollbar visibility mode |
| `scrollHideDelay` | `number` | `600` | Delay (ms) before scrollbar hides |
| `viewportRef` | `Ref<HTMLDivElement>` | — | Ref for the viewport element |
| `viewportClassName` | `string` | — | Class for the viewport element |
| `viewportStyle` | `CSSProperties` | — | Style for the viewport element |
| `overscrollBehavior` | `CSSProperties['overscrollBehavior']` | — | Overscroll behavior |
| `onScrollPositionChange` | `(position: { x: number; y: number }) => void` | — | Scroll position change callback |
| `onTopReached` | `() => void` | — | Fired when scrolled to the top |
| `onBottomReached` | `() => void` | — | Fired when scrolled to the bottom |

All standard `div` props are also supported.

## Best Practices

- Set an explicit `height` or `max-height` on `ScrollArea` — it needs a bounded container to scroll.
- Use `onBottomReached` for infinite scroll patterns instead of `IntersectionObserver` boilerplate.
- Use `type="always"` to always show scrollbars (useful for data-heavy panels).
