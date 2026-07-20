---
title: 码集
description: 后端驱动的选项数据如何通过 codeSetQueryFn 流入表单、表格和搜索区域，以及类型化键名、拼音搜索与生成键名联合类型。
---

# 码集

码集（code set）是业务应用中出现频率最高的能力之一：后端定义的选项列表（状态值、分类、性别之类的枚举），以 `"common.gender"` 这样的字符串键名标识，由表单和搜索区域渲染为下拉选择，而不需要每个页面各自维护一份自己的选项列表。

:::warning[迁移提示："数据字典"已更名为"码集"]

框架已将整套 "dictionary"（字典）词汇更名为 "code set"（码集）。这次更名**尚未发布**（位于 v2.12.0 之后的 main 分支）；本页描述的是新名称。如果你仍在使用 v2.12.0 或更早版本，下表中的旧名称依然适用。

| 旧名称（≤ v2.12.0） | 新名称（HEAD） |
| --- | --- |
| `dictionaryQueryFn`（AppContext） | `codeSetQueryFn` |
| `useDictionaryQuery` | `useCodeSetQuery` |
| `UseDictionaryQueryOptions` | `UseCodeSetQueryOptions` |
| `DictionaryAliasMap` | `CodeSetAliasMap` |
| `DictionaryKey` / `DictionaryKeyConfig` / `DictionaryKeyValue` | `CodeSetKey` / `CodeSetKeyConfig` / `CodeSetKeyValue` |
| `DictionaryQueryData` | `CodeSetQueryData` |
| `resolveDictKey` | `resolveCodeSetKey` |
| `Register['dictionaryKeys']`（模块扩充成员） | `Register['codeSetKeys']` |
| `useDictionaryOptionsSelect` | `useCodeSetOptionsSelect` |
| `UseDictionaryOptionsSelectOptions` / `...Result` | `UseCodeSetOptionsSelectOptions` / `...Result` |
| `vef gen:dictionary-keys`（CLI） | `vef gen:code-set-keys` |
| `codeGenerationConfig.dictionaryKeys`（配置块） | `codeGenerationConfig.codeSetKeys` |
| `DictionaryKeysConfig` / `DictionaryKeyEntry`（dev 包） | `CodeSetKeysConfig` / `CodeSetKeyEntry` |
| `fetchDictionaryKeys`（配置字段） | `fetchCodeSetKeys` |

:::

## 码集的数据来源

应用通过 `createApp().render()` 提供一个批量查询函数。它的契约是：接收一个码集键名数组，解析为一条记录，把每个键名映射到对应的 `DataOption[]`：

```ts
// apis/code-set.ts — a QueryFunction<Record<string, DataOption[]>, string[]>
export const findCodeSetsBatch = apiClient.createQueryFn(
  "find_code_sets_batch",
  ({ post }) => async (keys: string[]) => {
    const result = await post<Record<string, DataOption[]>>("/api/code-set/find", {
      data: { keys }
    });

    return result.data;
  }
);
```

```ts
createApp().render({
  appContext: {
    codeSetQueryFn: findCodeSetsBatch
  },
  ...
});
```

请用 `apiClient.createQueryFn()` 定义它（见 [数据获取](./data-fetching.md)）——`useCodeSetQuery` 会把该函数的 `key` 属性纳入查询键，并在应用上下文中缺少 `codeSetQueryFn` 时直接抛错。配置完成后，页面通过两个 hook 消费码集：

- `useCodeSetQuery` —— 底层查询 hook，来自 `@vef-framework-react/hooks`
- `useCodeSetOptionsSelect` —— 对它的 `Select` 就绪封装，来自 `@vef-framework-react/components`

对于*不属于*码集的任意查询型选项（角色列表、部门树以及其它领域数据），姊妹 hook `useDataOptionsSelect` 和 `useDataOptionsTreeSelect` 承担同样的工作——见 [表单](./forms.md)。

## 查询码集：`useCodeSetQuery`

`useCodeSetQuery(keys, options?)` 接收一个别名映射——每个别名都会成为解析结果上的一个键：

```tsx
import { useCodeSetQuery } from "@vef-framework-react/hooks";

const { data, isFetching } = useCodeSetQuery({
  gender: "common.gender",
  status: "md.staff.status"
});

// data is undefined until the query resolves.
const genderOptions = data?.gender ?? [];
```

以下行为值得了解（已对照 hook 源码核实）：

- 请求的键名在到达 `codeSetQueryFn` 之前会先去重并排序，因此 `{ a: "x", b: "x" }` 只会请求一次 `"x"`，而键名相同的两个别名映射会共享同一份缓存。
- 结果以 `staleTime: Infinity` 缓存——一个码集在每个会话内只请求一次，之后一直从缓存读取。
- `data` 遵循 React Query 的原生语义：在查询成功解析之前是 `undefined`，因此要做好 `undefined` 防护。
- 若某个别名对应的键名在响应中缺失，则解析为 `[]`，而不是 `undefined`。
- 空的别名映射（`{}`）会完全跳过请求。

### 选项

`UseCodeSetQueryOptions` 有两个字段：

| 选项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `enabled` | `boolean` | `true` | 传 `false` 可推迟请求，例如上游参数尚未就绪时。 |
| `select` | `(data) => TData` | — | 把解析后的别名映射转换为自定义形态；其返回值将成为 `data`。 |

`select` 会透传给 React Query，因此它的引用同一性会影响记忆化：当外层组件频繁重渲染时，请用模块作用域、`as const`、`useMemo` 或 `useCallback` 来稳定 `keys` 与 `select`。

## Select 就绪的选项：`useCodeSetOptionsSelect`

对于最典型的场景——把码集渲染为 `Select`——可以跳过底层 hook，改用来自 `@vef-framework-react/components` 的 `useCodeSetOptionsSelect`。它为每个别名返回一份可直接展开的 `SelectProps`：

```tsx
import { useCodeSetOptionsSelect } from "@vef-framework-react/components";

const { gender, status } = useCodeSetOptionsSelect({
  gender: "common.gender",
  status: "md.staff.status"
});

// gender and status are SelectProps that can be spread directly:
// <Select {...gender} />
```

每个返回的 props 对象都带有转换后的 `options`、一个 `loading` 标志、请求期间的加载占位符、`maxTagCount: "responsive"`、固定的下拉高度，以及——在启用搜索时——一个感知拼音的 `filterOption`。

### 启用搜索

搜索默认关闭。可以通过第二个参数为所有别名启用，也可以把普通键名字符串换成 `CodeSetKeyConfig` 对象来按键启用：

```tsx
// All selects searchable:
useCodeSetOptionsSelect({ gender: "common.gender" }, { filterable: true });

// Only one searchable:
useCodeSetOptionsSelect({
  gender: "common.gender",
  status: { key: "md.staff.status", filterable: true }
});
```

按键的 `filterable` 优先于 hook 级别的设置。

### 拼音搜索

选项转换链路会通过 `@vef-framework-react/shared` 的 `withPinyin`，为每个选项（包括嵌套的 `children`）在 `label` 与 `description` 两个字段上补充拼音元数据。启用 `filterable` 后，同一个搜索框可以匹配：

- 中文标签或描述本身
- 二者的完整拼音
- 二者的拼音首字母

这对人员、部门、组织以及较长的码集尤其有用。`useCodeSetOptionsSelect` 如何与其它选项获取型 hook 一起融入一个字段，见 [表单](./forms.md)。

## 选项接入的位置

返回的 `SelectProps` 可以展开到框架渲染下拉选择的所有位置：

```tsx
// A standalone Select:
<Select {...gender} style={{ width: 240 }} />

// A form field (see Forms):
<AppField name="gender" validators={{ onChange: validators.gender }}>
  {field => <field.Select {...gender} required label="Gender" />}
</AppField>

// An EditableTable editor slot (see Tables):
createEditableColumn<Member>("gender", {
  title: "Gender",
  renderEditor: field => <field.Select {...gender} noWrapper style={{ width: "100%" }} />
});
```

布尔开关是唯一不走码集的枚举——请用 `Bool` / `field.Bool`（固定的 true/false 标签）渲染，而不是定义一个只有两项的码集。

## 为码集键名提供类型

默认情况下 `CodeSetKey` 就是 `string`——任何键名都能通过编译，拼写错误只会在运行时表现为一个空的下拉框。hooks 包提供了一个扩展注册表来弥补这一缺口：为 `Register` 扩充 `codeSetKeys` 成员后，所有码集 hook 都会收窄到该联合类型，并在 IDE 中获得键名自动补全：

```ts
declare module "@vef-framework-react/hooks" {
  interface Register {
    codeSetKeys: "sys.menu.type" | "sys.user.gender";
  }
}
```

完成扩充后，`useCodeSetQuery({ gender: "not.a.real.key" })` 会成为编译错误。`@vef-framework-react/hooks` 中的相关导出：

- `CodeSetKey` —— 解析后的键名联合类型（未扩充时为 `string`）
- `CodeSetKeyConfig` —— `{ key: CodeSetKey; filterable?: boolean }`
- `CodeSetKeyValue` —— `CodeSetKey | CodeSetKeyConfig`，即别名映射的值所接受的类型
- `resolveCodeSetKey(value)` —— 从上述两种形态中提取纯键名字符串

## 生成键名联合类型：`vef gen:code-set-keys`

手工维护这个联合类型迟早会与后端脱节。dev 包内置了一个生成器，可以拉取真实的键名列表（来自你的数据库或某个 API），并替你写出这份扩充文件。本节介绍日常工作流；完整的选项表格见 [Dev 参考](../reference/dev/overview.md)。

### 配置文件

生成器会从项目根目录加载 `code-generation.config.{ts,mts,js,mjs}`（按顺序取第一个存在的候选文件；TypeScript 配置无需构建即可直接使用）。请用 `defineCodeGenerationConfig` 恒等辅助函数来编写：

```ts
// code-generation.config.ts
import type { CodeSetKeyEntry } from "@vef-framework-react/dev";

import { defineCodeGenerationConfig } from "@vef-framework-react/dev";

export default defineCodeGenerationConfig({
  codeSetKeys: {
    output: "src/types/code-set-keys.gen.ts",
    async fetchCodeSetKeys(): Promise<readonly CodeSetKeyEntry[]> {
      // Runs in Node at generation time — use Node-side HTTP/DB clients
      // with project credentials here.
      const response = await fetch("https://dev-api.example.com/code-set/keys");
      return await response.json();
    }
  }
});
```

`codeSetKeys` 块接受以下字段：

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `fetchCodeSetKeys` | `() => Promise<readonly CodeSetKeyEntry[]>` | 必填 | 生成时调用的拉取函数，用于获取全部码集键名。运行在 Node 中。 |
| `output` | `string` | `"src/types/code-set-keys.gen.ts"` | 输出路径，相对项目根目录解析；绝对路径与 `..` 上跳会被拒绝。 |
| `timeout` | `number` | `30000` | 拉取函数的超时时间（毫秒）；`0` 表示完全禁用超时。 |

每个 `CodeSetKeyEntry` 形如 `{ key: string; comment?: string }`——`key` 必须匹配 `/^[\w.-]+$/`（字母、数字、下划线、点、连字符；其它字符会导致生成失败），`comment` 会成为联合类型成员上的 JSDoc 注释。重复键名会被去重（保留首次出现的一项，注释冲突时给出警告），条目按键名排序。

### 生成的输出

```ts
// AUTO-GENERATED by @vef-framework-react/dev (vef gen:code-set-keys). DO NOT EDIT.
// Source: code-generation.config.ts

export type CodeSetKey =
  /** 通用性别 */
  | "common.gender"
  /** 菜单类型 */
  | "sys.menu.type";

declare module "@vef-framework-react/hooks" {
  interface Register {
    codeSetKeys: CodeSetKey;
  }
}
```

请把这个文件纳入版本管理——正是它让键名对所有人（包括 CI）都具备编译期安全。

### 运行

```bash
vef gen:code-set-keys              # generate (or refresh) the file
vef gen:code-set-keys --check      # CI guard: exit non-zero if the file is stale
vef gen:code-set-keys -c custom.config.ts -o src/gen/keys.ts
```

`--check` 只计算输出而不写入，当仓库中已提交的文件与后端不再一致时返回失败，这让"有人新增了码集却没有重新生成"变成一次 CI 失败，而不是运行时的意外。拉取函数返回空结果时会生成 `CodeSetKey = never`（并给出警告），而不是直接失败。

## 使用提示

当页面需要码集、树形工具、格式化或校验能力时，值得先查一下 `@vef-framework-react/shared` 以及相关的 hook——框架的设计目标就是减少页面层代码的重复劳动，而不是让每个页面都重新推导一遍同样的选项转换逻辑。`@vef-framework-react/shared` 的完整符号索引见 [Shared 包总览](../reference/shared/overview.md)。
