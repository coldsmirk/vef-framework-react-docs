---
sidebar_position: 4
title: 测试建议
---

# 测试建议

VEF 没有额外提供一套“专属测试 API”，但它的 Provider 结构很清晰，因此页面测试并不难写。

## 组件测试时要补哪些 Provider

通常页面要能正常渲染，至少需要这些上下文:

- `AppContextProvider`
- `ApiClientProvider`
- 主题相关容器
- 需要路由时再补 `RouterProvider`

## 推荐做法

- 纯展示组件单测时，尽量只补最小 Provider
- 业务页测试优先 mock `queryFn` / `mutationFn`
- 不要在测试里重复实现整个登录流程

## 一个实用原则

如果你发现一个页面测试必须拉起整套应用才能跑，往往说明页面职责过重，可以考虑继续拆分。
