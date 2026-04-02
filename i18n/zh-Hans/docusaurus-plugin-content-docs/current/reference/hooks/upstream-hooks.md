---
sidebar_position: 3
title: 上游直出 Hooks
---

# 上游直出 Hooks

这些导出主要是为了让业务项目可以统一从 `@vef-framework-react/hooks` 取常用 hooks，而不是到处散装引依赖。

## 环境与媒体查询包装

这三个是 VEF 自己包了一层 Mantine 的媒体查询 hooks，目的是统一 `getInitialValueInEffect` 默认行为。

| 导出 | 推荐场景 | 文档 |
| --- | --- | --- |
| `useMediaQuery` | 响应式布局判断 | [Mantine Hooks](https://mantine.dev/hooks/use-media-query/) |
| `useColorScheme` | 跟随系统颜色方案 | [Mantine Hooks](https://mantine.dev/hooks/use-color-scheme/) |
| `useReducedMotion` | 兼容减少动画偏好 | [Mantine Hooks](https://mantine.dev/hooks/use-reduced-motion/) |

## Mantine 直出

| 导出 | 推荐场景 | 文档 |
| --- | --- | --- |
| `assignRef` | 组合 ref | [Mantine Hooks](https://mantine.dev/hooks/) |
| `getHotkeyHandler` | 表单或输入快捷键 | [Mantine Hooks](https://mantine.dev/hooks/) |
| `mergeRefs` | 合并多个 ref | [Mantine Hooks](https://mantine.dev/hooks/) |
| `useDebouncedCallback` | 防抖回调 | [Mantine Hooks](https://mantine.dev/hooks/use-debounced-callback/) |
| `useDebouncedState` | 防抖状态 | [Mantine Hooks](https://mantine.dev/hooks/use-debounced-state/) |
| `useDebouncedValue` | 防抖值 | [Mantine Hooks](https://mantine.dev/hooks/use-debounced-value/) |
| `useDidUpdate` | 跳过首次的更新 effect | [Mantine Hooks](https://mantine.dev/hooks/use-did-update/) |
| `useDocumentTitle` | 修改文档标题 | [Mantine Hooks](https://mantine.dev/hooks/use-document-title/) |
| `useElementSize` | 读取元素尺寸 | [Mantine Hooks](https://mantine.dev/hooks/use-element-size/) |
| `useEventListener` | 事件监听 | [Mantine Hooks](https://mantine.dev/hooks/use-event-listener/) |
| `useFocusTrap` | 焦点锁定 | [Mantine Hooks](https://mantine.dev/hooks/use-focus-trap/) |
| `useFullscreen` | 全屏控制 | [Mantine Hooks](https://mantine.dev/hooks/use-fullscreen/) |
| `useIntersection` | 交叉观察 | [Mantine Hooks](https://mantine.dev/hooks/use-intersection/) |
| `useInterval` | 定时器 | [Mantine Hooks](https://mantine.dev/hooks/use-interval/) |
| `useIsFirstRender` | 首次渲染判断 | [Mantine Hooks](https://mantine.dev/hooks/use-first-render/) |
| `useIsomorphicEffect` | 同构 effect | [Mantine Hooks](https://mantine.dev/hooks/use-isomorphic-effect/) |
| `useMergedRef` | 多 ref 组合 | [Mantine Hooks](https://mantine.dev/hooks/use-merged-ref/) |
| `useMounted` | mounted 状态 | [Mantine Hooks](https://mantine.dev/hooks/use-mounted/) |
| `useMutationObserver` | DOM 变化监听 | [Mantine Hooks](https://mantine.dev/hooks/use-mutation-observer/) |
| `usePrevious` | 上一次值 | [Mantine Hooks](https://mantine.dev/hooks/use-previous/) |
| `useResizeObserver` | 尺寸观察 | [Mantine Hooks](https://mantine.dev/hooks/use-resize-observer/) |
| `useTimeout` | 延时器 | [Mantine Hooks](https://mantine.dev/hooks/use-timeout/) |
| `useWindowEvent` | window 事件监听 | [Mantine Hooks](https://mantine.dev/hooks/use-window-event/) |

## AI SDK React

| 导出 | 推荐场景 | 文档 |
| --- | --- | --- |
| `useChat` | 聊天型 AI 交互 | [AI SDK React](https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat) |
| `useCompletion` | 文本补全 | [AI SDK React](https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-completion) |
| `useObject` | 结构化对象输出 | [AI SDK React](https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-object) |

## 热键能力

| 导出 | 推荐场景 | 文档 |
| --- | --- | --- |
| `HotkeysProvider` | 全局热键上下文 | [react-hotkeys-hook](https://react-hotkeys-hook.vercel.app/) |
| `useHotkeys` | 局部快捷键 | [react-hotkeys-hook](https://react-hotkeys-hook.vercel.app/) |
| `useHotkeysContext` | 热键上下文读取 | [react-hotkeys-hook](https://react-hotkeys-hook.vercel.app/) |
| `useRecordHotkeys` | 录制快捷键 | [react-hotkeys-hook](https://react-hotkeys-hook.vercel.app/) |

使用建议:

- 只要框架已经转出了同名能力，优先从 `@vef-framework-react/hooks` 统一导入
- 如果你需要看完整参数细节，以官方文档为准
