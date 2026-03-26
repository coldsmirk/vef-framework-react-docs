---
sidebar_position: 3
title: Performance
---

# Performance

VEF already covers several performance defaults, but page code still benefits from a few practical habits.

## Tables

- Prefer `virtual` for large data sets.
- Use `useDeferredValue` when search input changes frequently.
- When column persistence is enabled, avoid rebuilding column arrays unnecessarily.

## Query

- Choose an appropriate `staleTime` for stable data.
- Warm frequently reused data through `fetchQuery()` after login or route entry.
- Use `useHasFetching()` and `useHasMutating()` for button loading states instead of repeating custom state flags.

## State Selection

- Use `useShallow` when selecting multiple fields from Zustand stores.
- Keep state local when possible instead of promoting everything to global stores.

## Option Search

For Chinese option data, prefer the built-in pinyin-enhanced option pipeline instead of rebuilding custom fuzzy-search conversions in page code.
