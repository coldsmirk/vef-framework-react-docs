---
sidebar_position: 3
title: 性能优化
---

# 性能优化

VEF 本身已经帮你做了不少默认优化，但页面层仍然有几个最值得关注的点。

## 表格

- 大列表优先考虑 `virtual`
- 搜索项变化频繁时，配合 `useDeferredValue`
- 列设置持久化开启后，避免重复重建列数组

## Query

- 给稳定数据设置合适的 `staleTime`
- 登录后频繁复用的数据优先走 `fetchQuery()` 预热
- 页面按钮 loading 可以用 `useHasFetching()` / `useHasMutating()`，不要手写重复状态

## 状态读取

- Zustand 多字段选择优先配合 `useShallow`
- 页面局部状态优先局部化，不要一上来就全局 store

## 选项搜索

对于中文选项，优先用框架的拼音增强选项链路，而不是在页面里自己写模糊搜索转换。
