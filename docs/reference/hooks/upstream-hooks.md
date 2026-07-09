---
title: Upstream Hook Exports
description: The Mantine and hotkey hooks re-exported (some wrapped) through @vef-framework-react/hooks.
---

# Upstream Hook Exports

These exports exist so business projects can import common hooks through `@vef-framework-react/hooks` instead of managing several third-party entry points directly.

## Wrapped Media and Environment Hooks

VEF wraps these Mantine hooks to normalize the `getInitialValueInEffect` behavior (default `false`, so the initial value is read on mount rather than deferred to an effect):

| Hook | Signature | Description |
| --- | --- | --- |
| `useMediaQuery` | `(query: string, initialValue?: boolean, options?: { getInitialValueInEffect?: boolean }) => boolean` | Matches a CSS media query. |
| `useColorScheme` | `(initialValue?: "light" \| "dark", options?: { getInitialValueInEffect?: boolean }) => "light" \| "dark"` | Reads the OS-level `prefers-color-scheme`. |
| `useReducedMotion` | `(initialValue?: boolean, options?: { getInitialValueInEffect?: boolean }) => boolean` | Reads the OS-level `prefers-reduced-motion`. |
| `useElementSize` | `<T extends HTMLElement>(options?: ResizeObserverOptions) => { ref: RefCallback<T \| null>; width: number; height: number }` | Tracks an element's size via `ResizeObserver`; VEF defaults `box: "border-box"`. |

## Mantine Re-Exports

Passed through as-is from `@mantine/hooks`:

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
- `assignRef` — not a hook; a ref-assignment helper used alongside `mergeRefs`
- `getHotkeyHandler` — not a hook; builds a `keydown` handler from a hotkey list
- `mergeRefs` — not a hook; combines multiple refs into one callback ref

Official docs: [Mantine Hooks](https://mantine.dev/hooks/)

## Hotkey Exports

- `HotkeysProvider`
- `useHotkeys`
- `useHotkeysContext`
- `useRecordHotkeys`

Official docs: [react-hotkeys-hook](https://react-hotkeys-hook.vercel.app/)
