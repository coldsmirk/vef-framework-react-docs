---
sidebar_position: 4
title: 树、路径与数据结构
---

# 树、路径与数据结构

## Key 与对象

| 导出 | 推荐场景 |
| --- | --- |
| `hashKey` | query key、缓存 key、标签页 key 生成 |
| `mergeWith` | 深层对象合并 |

## 路径工具

| 导出 | 推荐场景 |
| --- | --- |
| `PathObject` | 路径解析结果 |
| `getBaseName` / `getExtName` / `getDirName` | 文件名、扩展名、目录名 |
| `joinPaths` / `resolvePath` / `normalizePath` | 路径拼接与规范化 |
| `isAbsolutePath` | 判断绝对路径 |
| `parsePath` / `formatPath` | 路径对象化与反向拼装 |
| `getRelativePath` | 相对路径 |
| `pathSeparator` | 当前路径分隔符 |

## 拼音相关

| 导出 | 推荐场景 |
| --- | --- |
| `WithPinyin` | 补充拼音字段后的数据类型 |
| `getPinyin` | 获取全拼 |
| `getPinyinInitials` | 获取首字母 |
| `withPinyin` | 为选项或对象补拼音字段 |

## 表格更新判断

| 导出 | 推荐场景 |
| --- | --- |
| `CompareMode` | 比较策略 |
| `ShouldUpdateByKeysOptions` | 表格更新配置 |
| `shouldUpdateByKeys` | 精准控制渲染更新 |

## 树结构工具

| 导出 | 推荐场景 |
| --- | --- |
| `FlattenTreeOptions` / `FlattenedNode` | 扁平化树参数与结果 |
| `flattenTree` | 树转数组 |
| `KeyAccessor` | 树主键提取器 |
| `BuildTreeOptions` / `BuildTreeResultNode` | 建树配置与结果类型 |
| `buildTree` | 平铺数据建树 |
| `findNodeInTree` | 树中查找节点 |
| `TraverseTreeOptions` | 树遍历控制 |
| `traverseTree` | 递归遍历 |
| `mapTree` | 映射树结构 |
| `filterTree` | 过滤树 |
| `filterTreeWithAncestors` | 过滤同时保留祖先链 |

使用建议:

- 页面层遇到树、级联、部门组织、菜单树问题，优先先看这里
- `components` 包里的树搜索能力就是建立在这些工具之上
