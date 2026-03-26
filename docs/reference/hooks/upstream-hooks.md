---
sidebar_position: 3
title: Upstream Hook Exports
---

# Upstream Hook Exports

These exports exist so business projects can import common hooks through `@vef-framework/hooks` instead of managing several third-party entry points directly.

## Wrapped Media and Environment Hooks

VEF wraps these Mantine hooks to normalize the `getInitialValueInEffect` behavior:

- `useMediaQuery`
- `useColorScheme`
- `useReducedMotion`

## Mantine Re-Exports

Representative exports include:

- `useDebouncedCallback`
- `useDebouncedState`
- `useDebouncedValue`
- `useDidUpdate`
- `useDocumentTitle`
- `useElementSize`
- `useEventListener`
- `useFocusTrap`
- `useFullscreen`
- `useIntersection`
- `useInterval`
- `useIsomorphicEffect`
- `useMutationObserver`
- `usePrevious`
- `useResizeObserver`
- `useTimeout`
- `useWindowEvent`

Official docs: [Mantine Hooks](https://mantine.dev/hooks/)

## AI SDK React Re-Exports

- `useChat`
- `useCompletion`
- `useObject`

Official docs: [AI SDK Docs](https://ai-sdk.dev/docs)

## Hotkey Exports

- `HotkeysProvider`
- `useHotkeys`
- `useHotkeysContext`
- `useRecordHotkeys`

Official docs: [react-hotkeys-hook](https://react-hotkeys-hook.vercel.app/)
