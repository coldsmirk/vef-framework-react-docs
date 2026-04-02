---
sidebar_position: 1
title: Hooks 包总览
---

# Hooks 包总览

`@vef-framework-react/hooks` 由两部分组成:

1. **VEF 自己维护的页面层 hooks**
2. **统一出口的上游 hooks**

## 这组文档的阅读方式

- 需要看权限、数据字典、选项转换、加载态判断，优先看 [VEF Hooks](./vef-hooks.md)
- 只是想确认某个 Mantine / AI / Hotkeys 能力能不能从框架层直接拿，去看 [上游直出 Hooks](./upstream-hooks.md)

## 最值得优先掌握的自研 hooks

| Hook | 用途 |
| --- | --- |
| `useDataDictQuery` | 拉数据字典 |
| `useDataOptionsQuery` | 把任意 query 结果转换成统一选项结构 |
| `useCheckPermission` | 拿到可复用的权限判断函数 |
| `useIsAuthorized` | 直接判断权限 |
| `useAuthorizedItems` | 过滤带权限要求的配置项 |
| `useHasFetching` | 判断某类 query 是否还在加载 |
| `useHasMutating` | 判断某类 mutation 是否还在提交 |

## 文档粒度说明

- VEF 自研 hooks: 写明推荐场景、关键参数和返回值
- 上游直出 hooks: 简要说明 + 官方文档链接
