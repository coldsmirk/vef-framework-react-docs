---
title: 测试建议
description: VEF 页面测试需要哪些 Provider，以及让页面测试保持聚焦的实用建议。
---

# 测试建议

VEF 没有提供一套单独的仅供测试使用的 API，但它的 Provider 结构足够清晰，因此页面测试依然可以写得很直接。

## 测试中通常需要的 Provider

要让页面正确渲染，测试环境通常至少需要:

- `AppContextProvider`
- `ApiClientProvider`
- 主题相关的 Provider
- 当测试涉及路由行为时，还需要 `RouterProvider`

## 实用建议

- 对于展示型组件，只挂载最小的 Provider 集合。
- 对于业务页面，优先 mock query 和 mutation 函数。
- 避免在每个测试中都重新演练一遍完整的登录流程。

## 一条实用原则

如果一个页面测试必须先跑通整个应用外壳才能开始断言，这通常说明该页面承担了过多职责，可能适合进一步拆分。
