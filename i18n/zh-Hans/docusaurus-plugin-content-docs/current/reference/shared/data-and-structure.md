---
title: 树、路径与数据结构
description: "@vef-framework-react/shared 中每个 key、路径、拼音、表格更新与树处理导出的签名。"
---

# 树、路径与数据结构

## Key 与对象辅助函数

| Export | Signature | Description |
| --- | --- | --- |
| `hashKey` | `(key: unknown) => string` | 将任意值序列化为稳定的 JSON 字符串，对对象 key 排序（symbol key 排在其后，加 `@@` 前缀），使结构相同的输入无论 key 顺序如何都能得到相同的哈希结果。被用作框架的 `queryKeyHashFn`。 |
| `mergeWith` | `<T extends object>(target: T, source: Partial<T>, overrideExisting?: boolean) => T` | 将 `source` **浅层**、仅顶层地原地合并进 `target`（被修改的 `target` 也会被返回）。值为 `undefined` 的 source 字段始终被跳过；仅当 `overrideExisting` 为 `true`（默认 `false`——即只填补缺失的值）时才覆盖 target 中已定义的值。 |

## 路径辅助函数

构建在 `path-browserify` 之上（POSIX 风格，可在浏览器中安全使用）。

| Export | Signature | Description |
| --- | --- | --- |
| `PathObject` | `{ root: string; dir: string; base: string; ext: string; name: string }` | `parsePath` / `formatPath` 使用的路径解析结果结构。 |
| `getBaseName` | `(filePath: string, keepExt?: boolean) => string` | 路径的最后一段；当 `keepExt` 为 `false`（默认 `true`）时会去掉扩展名。 |
| `getExtName` | `(filePath: string) => string` | 文件扩展名，包含前面的点号。 |
| `getDirName` | `(filePath: string) => string` | 路径中的目录部分。 |
| `joinPaths` | `(...paths: string[]) => string` | 拼接多个路径片段并规范化结果。 |
| `isAbsolutePath` | `(filePath: string) => boolean` | 路径是否为绝对路径。 |
| `normalizePath` | `(filePath: string) => string` | 解析路径中的 `.` / `..` 片段。 |
| `parsePath` | `(filePath: string) => PathObject` | 将路径字符串解析为其组成部分。 |
| `formatPath` | `(pathObject: PathObject) => string` | `parsePath` 的逆操作。 |
| `getRelativePath` | `(from: string, to: string) => string` | 从 `from` 到 `to` 的相对路径。 |
| `resolvePath` | `(...pathSegments: string[]) => string` | 将一系列路径片段解析为一个绝对路径。 |
| `pathSeparator` | `string` | 路径片段分隔符（`"/"`）。 |

## 拼音辅助函数

构建在 `pinyin-pro` 之上，首次使用时懒加载现代汉语词库数据（`@pinyin-pro/data/modern`），以获得准确的多音字消歧。

| Export | Signature | Description |
| --- | --- | --- |
| `WithPinyin<T, K>` | `type WithPinyin<T extends AnyObject, K extends keyof T & string>` | 为每个 key `K` 添加 `${K}Pinyin` / `${K}PinyinInitials` 字段——当 `T[K]` 是必填字符串时为必填，当 `T[K]` 可选时为可选，非字符串 key 则完全不添加。 |
| `getPinyin` | `(text: string) => string[]` | `text` 中每个字符的完整无声调拼音音节（非中文的连续片段保持为整段文本，姓氏按姓氏读音处理），按输入字符串做了 memoize。 |
| `getPinyinInitials` | `(text: string) => string[]` | `text` 中每个字符的拼音首字母，按输入字符串做了 memoize。 |
| `withPinyin` | `<T extends AnyObject, K extends keyof T & string>(obj: T, ...keys: K[]) => WithPinyin<T, K>` | 返回 `obj` 的浅拷贝，并为给定的每个值为字符串的 key 添加 `{key}Pinyin` / `{key}PinyinInitials` 字段，例如 `withPinyin({ name: "张三" }, "name")` → 添加 `namePinyin` / `namePinyinInitials`。 |

## 表格更新辅助函数

| Export | Signature | Description |
| --- | --- | --- |
| `CompareMode` | `"reference" \| "shallow" \| "deep"` | `shouldUpdateByKeys` 使用的比较策略。 |
| `ShouldUpdateByKeysOptions` | `{ compare?: CompareMode }` | `shouldUpdateByKeys` 的选项（默认 `compare: "reference"`）。 |
| `shouldUpdateByKeys` | `(options: ShouldUpdateByKeysOptions, ...keys: K[]) => (next: T, prev: T) => boolean`（或不带 options 的重载 `(...keys: K[]) => (next: T, prev: T) => boolean`） | 构建一个 `shouldCellUpdate` 风格的比较函数，使用选定的比较模式，当 `next` 与 `prev` 之间任意给定 key 存在差异时返回 `true`。用于 `Table` 的 `shouldCellUpdate` 属性。 |

## 树辅助函数

所有树函数的 `childrenKey` 默认都是 `"children"`，且都以非破坏性方式运行（返回新的数组/节点而不是修改输入，`buildTree`/`flattenTree` 除外——它们只读取源数组而不修改它）。

| Export | Signature | Description |
| --- | --- | --- |
| `FlattenTreeOptions<TNode, TTransformedNode>` | `{ childrenKey?; includeParent?; includeLevel?; transform?; filter? }` | `flattenTree` 的选项。`filter` 会跳过某个节点，但仍会遍历其子节点；`transform` 用于覆盖默认的扁平化结构。 |
| `FlattenedNode<TNode>` | `{ data: TNode; parent?: TNode; level?: number }` | 未提供 `transform` 时，`flattenTree` 为每个节点生成的默认结构。 |
| `flattenTree` | `<TNode, TTransformedNode>(tree: TNode[], options?: FlattenTreeOptions<TNode, TTransformedNode>) => TTransformedNode[]` | 以深度优先的方式将树展平为一维数组。 |
| `KeyAccessor<T>` | `keyof T \| ((node: T) => unknown)` | 用于在 `buildTree` 中读取节点 id/parent-id 的属性名或取值函数。 |
| `BuildTreeOptions<TNode, TTransformedNode, TChildrenKey>` | `{ idKey?; parentIdKey?; childrenKey?; rootValue?; transform? }` | `buildTree` 的选项（默认：`idKey: "id"`、`parentIdKey: "parentId"`）。`rootValue` 可以是标记根节点的 parent-id 值，也可以是一个判断函数。 |
| `BuildTreeResultNode<TNode, TChildrenKey>` | `TNode & { [K in TChildrenKey]?: BuildTreeResultNode<TNode, TChildrenKey>[] }` | `buildTree` 返回的树形节点类型。 |
| `buildTree` | `<TNode, TTransformedNode, TChildrenKey extends string = "children">(nodes: TNode[], options?: BuildTreeOptions<TNode, TTransformedNode, TChildrenKey>) => BuildTreeResultNode<TTransformedNode, TChildrenKey>[]` | 通过 id/parent-id 引用关系，从扁平数组构建出一棵树；找不到父节点的节点会被视为根节点。 |
| `findNodeInTree` | `<TNode>(tree: TNode[], predicate: (node: TNode, context: { parent?: TNode; level: number }) => boolean, childrenKey?: keyof TNode) => TNode \| undefined` | 深度优先搜索第一个匹配的节点。 |
| `TraverseTreeOptions<TNode>` | `{ strategy?: "dfs" \| "bfs"; childrenKey?: keyof TNode }` | `traverseTree` 的选项（默认 `strategy: "dfs"`）。 |
| `traverseTree` | `<TNode>(tree: TNode[], callback: (node: TNode, context: { parent?: TNode; level: number; index: number }) => void, options?: TraverseTreeOptions<TNode>) => void` | 以深度优先或广度优先的方式访问每个节点，并调用 `callback` 执行副作用。 |
| `mapTree` | `<TNode, TMappedNode>(tree: TNode[], callback: (node: TNode, context: { parent?: TNode; level: number; index: number }) => TMappedNode, childrenKey?: keyof TNode) => TMappedNode[]` | 将每个节点映射为新的结构，同时保留树形结构。 |
| `filterTree` | `<TNode>(tree: TNode[], predicate: (node: TNode, context: { parent?: TNode; level: number; index: number }) => boolean, childrenKey?: keyof TNode) => TNode[]` | 移除不匹配的节点；匹配的节点只保留其匹配的后代节点。 |
| `filterTreeWithAncestors` | `<TNode>(tree: TNode[], predicate: (node: TNode, context: { parent?: TNode; level: number; index: number }) => boolean, childrenKey?: keyof TNode) => TNode[]` | 与 `filterTree` 类似，但会保留匹配节点的所有祖先节点，即使祖先节点本身不匹配——适用于必须展示到命中项完整路径的搜索/筛选界面。 |

这些导出在部门树、菜单树和树形表格页面中尤其有用。
