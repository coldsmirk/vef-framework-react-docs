---
title: Trees, Paths, and Data Structures
description: Signatures for every key, path, pinyin, table-update, and tree-processing export in @vef-framework-react/shared.
---

# Trees, Paths, and Data Structures

## Keys and Object Helpers

| Export | Signature | Description |
| --- | --- | --- |
| `hashKey` | `(key: unknown) => string` | Serializes any value to a stable JSON string, sorting object keys (and symbol keys after them, prefixed `@@`) so structurally-equal inputs hash identically regardless of key order. Used as the framework's `queryKeyHashFn`. |
| `mergeWith` | `<T extends object>(target: T, source: Partial<T>, overrideExisting?: boolean) => T` | **Shallow**, top-level merge of `source` into `target`, in place (the mutated `target` is also returned). `undefined` source values are always skipped; a defined target value is only overwritten when `overrideExisting` is `true` (default `false` — i.e. fill in missing values only). |

## Path Helpers

Built on `path-browserify` (POSIX-style, browser-safe).

| Export | Signature | Description |
| --- | --- | --- |
| `PathObject` | `{ root: string; dir: string; base: string; ext: string; name: string }` | The parsed-path shape used by `parsePath` / `formatPath`. |
| `getBaseName` | `(filePath: string, keepExt?: boolean) => string` | Final path segment; strips the extension when `keepExt` is `false` (default `true`). |
| `getExtName` | `(filePath: string) => string` | File extension, including the leading dot. |
| `getDirName` | `(filePath: string) => string` | Directory portion of a path. |
| `joinPaths` | `(...paths: string[]) => string` | Joins path segments and normalizes the result. |
| `isAbsolutePath` | `(filePath: string) => boolean` | Whether a path is absolute. |
| `normalizePath` | `(filePath: string) => string` | Resolves `.` / `..` segments. |
| `parsePath` | `(filePath: string) => PathObject` | Parses a path string into its components. |
| `formatPath` | `(pathObject: PathObject) => string` | Inverse of `parsePath`. |
| `getRelativePath` | `(from: string, to: string) => string` | Relative path from `from` to `to`. |
| `resolvePath` | `(...pathSegments: string[]) => string` | Resolves a sequence of segments into an absolute path. |
| `pathSeparator` | `string` | The path segment separator (`"/"`). |

## Pinyin Helpers

Built on `pinyin-pro`, with the modern Chinese word data (`@pinyin-pro/data/modern`) loaded lazily on first use for accurate polyphone resolution.

| Export | Signature | Description |
| --- | --- | --- |
| `WithPinyin<T, K>` | `type WithPinyin<T extends AnyObject, K extends keyof T & string>` | Adds `${K}Pinyin` / `${K}PinyinInitials` fields for each key `K` — required when `T[K]` is a required string, optional when `T[K]` is optional, and omitted entirely for non-string keys. |
| `getPinyin` | `(text: string) => string[]` | Full toneless pinyin syllables for each character in `text` (non-Chinese runs kept as consecutive text, surnames read as surnames), memoized per input string. |
| `getPinyinInitials` | `(text: string) => string[]` | First-letter initials for each character in `text`, memoized per input string. |
| `withPinyin` | `<T extends AnyObject, K extends keyof T & string>(obj: T, ...keys: K[]) => WithPinyin<T, K>` | Returns a shallow copy of `obj` with `{key}Pinyin` / `{key}PinyinInitials` fields added for each given key whose value is a string, e.g. `withPinyin({ name: "张三" }, "name")` → adds `namePinyin` / `namePinyinInitials`. |

## Table Update Helpers

| Export | Signature | Description |
| --- | --- | --- |
| `CompareMode` | `"reference" \| "shallow" \| "deep"` | Comparison strategy for `shouldUpdateByKeys`. |
| `ShouldUpdateByKeysOptions` | `{ compare?: CompareMode }` | Options for `shouldUpdateByKeys` (default `compare: "reference"`). |
| `shouldUpdateByKeys` | `(options: ShouldUpdateByKeysOptions, ...keys: K[]) => (next: T, prev: T) => boolean` (or the options-less overload `(...keys: K[]) => (next: T, prev: T) => boolean`) | Builds a `shouldCellUpdate`-style comparator that returns `true` when any of the given keys differ between `next` and `prev`, using the chosen comparison mode. Intended for `Table`'s `shouldCellUpdate` prop. |

## Tree Helpers

All tree functions default `childrenKey` to `"children"` and operate non-destructively (they return new arrays/nodes rather than mutating input, except `buildTree`/`flattenTree`, which read but do not mutate the source array).

| Export | Signature | Description |
| --- | --- | --- |
| `FlattenTreeOptions<TNode, TTransformedNode>` | `{ childrenKey?; includeParent?; includeLevel?; transform?; filter? }` | Options for `flattenTree`. `filter` skips a node but still traverses its children; `transform` overrides the default flattened shape. |
| `FlattenedNode<TNode>` | `{ data: TNode; parent?: TNode; level?: number }` | The default per-node shape `flattenTree` produces when no `transform` is given. |
| `flattenTree` | `<TNode, TTransformedNode>(tree: TNode[], options?: FlattenTreeOptions<TNode, TTransformedNode>) => TTransformedNode[]` | Flattens a tree into a one-dimensional array, depth-first. |
| `KeyAccessor<T>` | `keyof T \| ((node: T) => unknown)` | A property name or getter function used to read a node's id/parent-id in `buildTree`. |
| `BuildTreeOptions<TNode, TTransformedNode, TChildrenKey>` | `{ idKey?; parentIdKey?; childrenKey?; rootValue?; transform? }` | Options for `buildTree` (defaults: `idKey: "id"`, `parentIdKey: "parentId"`). `rootValue` is either the parent-id value that marks a root, or a predicate. |
| `BuildTreeResultNode<TNode, TChildrenKey>` | `TNode & { [K in TChildrenKey]?: BuildTreeResultNode<TNode, TChildrenKey>[] }` | The tree-shaped node type `buildTree` returns. |
| `buildTree` | `<TNode, TTransformedNode, TChildrenKey extends string = "children">(nodes: TNode[], options?: BuildTreeOptions<TNode, TTransformedNode, TChildrenKey>) => BuildTreeResultNode<TTransformedNode, TChildrenKey>[]` | Builds a tree from a flat array via id/parent-id references; nodes whose parent is missing are treated as roots. |
| `findNodeInTree` | `<TNode>(tree: TNode[], predicate: (node: TNode, context: { parent?: TNode; level: number }) => boolean, childrenKey?: keyof TNode) => TNode \| undefined` | Depth-first search for the first matching node. |
| `TraverseTreeOptions<TNode>` | `{ strategy?: "dfs" \| "bfs"; childrenKey?: keyof TNode }` | Options for `traverseTree` (default `strategy: "dfs"`). |
| `traverseTree` | `<TNode>(tree: TNode[], callback: (node: TNode, context: { parent?: TNode; level: number; index: number }) => void, options?: TraverseTreeOptions<TNode>) => void` | Visits every node depth-first or breadth-first, calling `callback` for side effects. |
| `mapTree` | `<TNode, TMappedNode>(tree: TNode[], callback: (node: TNode, context: { parent?: TNode; level: number; index: number }) => TMappedNode, childrenKey?: keyof TNode) => TMappedNode[]` | Maps every node to a new shape, preserving tree structure. |
| `filterTree` | `<TNode>(tree: TNode[], predicate: (node: TNode, context: { parent?: TNode; level: number; index: number }) => boolean, childrenKey?: keyof TNode) => TNode[]` | Removes non-matching nodes; a matching node keeps only its matching descendants. |
| `filterTreeWithAncestors` | `<TNode>(tree: TNode[], predicate: (node: TNode, context: { parent?: TNode; level: number; index: number }) => boolean, childrenKey?: keyof TNode) => TNode[]` | Like `filterTree`, but keeps every ancestor of a matching node even when the ancestor itself doesn't match — useful for search/filter UIs that must show the full path to a hit. |

These exports are especially useful in department trees, menu trees, and tree-table pages.
