---
title: 上游 Hook 导出
description: "通过 @vef-framework-react/hooks 重新导出（部分做了包装）的 Mantine 和热键 hooks。"
---

# 上游 Hook 导出

这些导出的目的是让业务项目可以通过 `@vef-framework-react/hooks` 导入常用 hooks，而不必直接管理多个第三方入口。

## 包装后的媒体与环境 Hooks

VEF 对以下 Mantine hooks 做了包装，以统一 `getInitialValueInEffect` 的行为（默认 `false`，即初始值在挂载时读取，而不是延迟到 effect 中）：

| Hook | Signature | Description |
| --- | --- | --- |
| `useMediaQuery` | `(query: string, initialValue?: boolean, options?: { getInitialValueInEffect?: boolean }) => boolean` | 匹配一个 CSS 媒体查询。 |
| `useColorScheme` | `(initialValue?: "light" \| "dark", options?: { getInitialValueInEffect?: boolean }) => "light" \| "dark"` | 读取操作系统级别的 `prefers-color-scheme`。 |
| `useReducedMotion` | `(initialValue?: boolean, options?: { getInitialValueInEffect?: boolean }) => boolean` | 读取操作系统级别的 `prefers-reduced-motion`。 |
| `useElementSize` | `<T extends HTMLElement>(options?: ResizeObserverOptions) => { ref: RefCallback<T \| null>; width: number; height: number }` | 通过 `ResizeObserver` 跟踪元素尺寸；VEF 默认使用 `box: "border-box"`。 |

## Mantine 直出

从 `@mantine/hooks` 原样透传：

- `useDebouncedCallback`
- `useDebouncedState`
- `useDebouncedValue`
- `useDidUpdate`
- `useDocumentTitle`
- `useEventListener`
- `useFocusTrap`
- `useFullscreenDocument`
- `useIntersection`
- `useInterval`
- `useIsFirstRender`
- `useIsomorphicEffect`
- `useMergedRef`
- `useMounted`
- `useMutationObserverTarget`
- `usePrevious`
- `useResizeObserver`
- `useTimeout`
- `useWindowEvent`
- `assignRef` — 不是 hook；一个与 `mergeRefs` 搭配使用的 ref 赋值辅助函数
- `getHotkeyHandler` — 不是 hook；根据热键列表构建 `keydown` 处理函数
- `mergeRefs` — 不是 hook；将多个 ref 合并为一个回调 ref

官方文档：[Mantine Hooks](https://mantine.dev/hooks/)

## 热键 Hook 导出

- `HotkeysProvider`
- `useHotkeys`
- `useHotkeysContext`
- `useRecordHotkeys`

官方文档：[react-hotkeys-hook](https://react-hotkeys-hook.vercel.app/)
