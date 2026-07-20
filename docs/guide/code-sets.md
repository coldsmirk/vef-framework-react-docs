---
title: Code Sets
description: How backend-driven option data flows through codeSetQueryFn into forms, tables, and search areas, with typed keys, pinyin search, and a generated key union.
---

# Code Sets

Code sets are one of the highest-frequency capabilities in business applications: backend-defined option lists (status values, categories, genders, and similar enumerations) identified by string keys such as `"common.gender"`, which forms and search areas render as selects without each page defining its own option list.

:::warning[Migration: "data dictionary" is now "code set"]

The framework renamed the whole "dictionary" vocabulary to "code set". This rename is **unreleased** (it lives on the main branch after v2.12.0); this page describes the new names. If you are on v2.12.0 or earlier, the old names below still apply.

| Old name (≤ v2.12.0) | New name (HEAD) |
| --- | --- |
| `dictionaryQueryFn` (AppContext) | `codeSetQueryFn` |
| `useDictionaryQuery` | `useCodeSetQuery` |
| `UseDictionaryQueryOptions` | `UseCodeSetQueryOptions` |
| `DictionaryAliasMap` | `CodeSetAliasMap` |
| `DictionaryKey` / `DictionaryKeyConfig` / `DictionaryKeyValue` | `CodeSetKey` / `CodeSetKeyConfig` / `CodeSetKeyValue` |
| `DictionaryQueryData` | `CodeSetQueryData` |
| `resolveDictKey` | `resolveCodeSetKey` |
| `Register['dictionaryKeys']` (module augmentation member) | `Register['codeSetKeys']` |
| `useDictionaryOptionsSelect` | `useCodeSetOptionsSelect` |
| `UseDictionaryOptionsSelectOptions` / `...Result` | `UseCodeSetOptionsSelectOptions` / `...Result` |
| `vef gen:dictionary-keys` (CLI) | `vef gen:code-set-keys` |
| `codeGenerationConfig.dictionaryKeys` (config block) | `codeGenerationConfig.codeSetKeys` |
| `DictionaryKeysConfig` / `DictionaryKeyEntry` (dev package) | `CodeSetKeysConfig` / `CodeSetKeyEntry` |
| `fetchDictionaryKeys` (config field) | `fetchCodeSetKeys` |

:::

## Where Code Sets Come From

The application provides one batched query function through `createApp().render()`. Its contract: it receives an array of code set keys and resolves to a record mapping each key to its `DataOption[]`:

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

Define it with `apiClient.createQueryFn()` (see [Data Fetching](./data-fetching.md)) — `useCodeSetQuery` uses the function's `key` property in its query key and throws if `codeSetQueryFn` is missing from the app context. Once this is configured, pages consume code sets through two hooks:

- `useCodeSetQuery` — the low-level query hook, from `@vef-framework-react/hooks`
- `useCodeSetOptionsSelect` — a `Select`-ready wrapper around it, from `@vef-framework-react/components`

For arbitrary query-backed options that are *not* code sets (role lists, department trees, and other domain data), the sibling hooks `useDataOptionsSelect` and `useDataOptionsTreeSelect` cover the same job — see [Forms](./forms.md).

## Querying Code Sets: `useCodeSetQuery`

`useCodeSetQuery(keys, options?)` takes an alias map — each alias becomes a key on the resolved data:

```tsx
import { useCodeSetQuery } from "@vef-framework-react/hooks";

const { data, isFetching } = useCodeSetQuery({
  gender: "common.gender",
  status: "md.staff.status"
});

// data is undefined until the query resolves.
const genderOptions = data?.gender ?? [];
```

Behavior worth knowing, verified against the hook source:

- The requested keys are deduplicated and sorted before they reach `codeSetQueryFn`, so `{ a: "x", b: "x" }` fetches `"x"` once and two alias maps with the same keys share one cache entry.
- Results are cached with `staleTime: Infinity` — a code set is fetched once per session and then served from cache.
- `data` follows React Query's native semantics: it is `undefined` until the query resolves successfully, so guard against `undefined`.
- An alias whose key is missing from the response resolves to `[]`, not `undefined`.
- An empty alias map (`{}`) skips the request entirely.

### Options

`UseCodeSetQueryOptions` has two fields:

| Option | Type | Default | Purpose |
| --- | --- | --- | --- |
| `enabled` | `boolean` | `true` | Pass `false` to defer fetching, e.g. while upstream parameters are not yet ready. |
| `select` | `(data) => TData` | — | Transform the resolved alias map into a custom shape; its return value becomes `data`. |

`select` is passed through to React Query, so its identity affects memoization: stabilize `keys` and `select` with module scope, `as const`, `useMemo`, or `useCallback` when the enclosing component re-renders frequently.

## Select-Ready Options: `useCodeSetOptionsSelect`

For the typical case — rendering a code set as a `Select` — skip the low-level hook and use `useCodeSetOptionsSelect` from `@vef-framework-react/components`. It returns a ready-to-spread `SelectProps` per alias:

```tsx
import { useCodeSetOptionsSelect } from "@vef-framework-react/components";

const { gender, status } = useCodeSetOptionsSelect({
  gender: "common.gender",
  status: "md.staff.status"
});

// gender and status are SelectProps that can be spread directly:
// <Select {...gender} />
```

Each returned props object carries the transformed `options`, a `loading` flag, a loader placeholder while fetching, `maxTagCount: "responsive"`, a fixed dropdown height, and — when search is enabled — a pinyin-aware `filterOption`.

### Enabling Search

Search is off by default. Enable it for every alias with the second argument, or per key by swapping the plain key string for a `CodeSetKeyConfig` object:

```tsx
// All selects searchable:
useCodeSetOptionsSelect({ gender: "common.gender" }, { filterable: true });

// Only one searchable:
useCodeSetOptionsSelect({
  gender: "common.gender",
  status: { key: "md.staff.status", filterable: true }
});
```

The per-key `filterable` wins over the hook-level one.

### Pinyin Search

The option-transformation chain enriches every option (including nested `children`) with pinyin metadata via `withPinyin` from `@vef-framework-react/shared`, over both `label` and `description`. With `filterable` enabled, one search box matches:

- the Chinese label or description directly
- the full pinyin of either
- the pinyin initials of either

This is especially useful for people, departments, organizations, and long code sets. See [Forms](./forms.md) for how `useCodeSetOptionsSelect` fits into a field alongside other option-fetching hooks.

## Where the Options Plug In

The returned `SelectProps` spread into every place the framework renders a select:

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

Boolean flags are the one enumeration that does not go through code sets — render those with `Bool` / `field.Bool` (fixed true/false labels) instead of a two-entry code set.

## Typing Code Set Keys

By default `CodeSetKey` is just `string` — any key compiles, and a typo surfaces only at runtime as an empty select. The hooks package exposes an extension registry to close that gap: augment `Register` with a `codeSetKeys` member and every code-set hook narrows to that union, with IDE autocomplete on keys:

```ts
declare module "@vef-framework-react/hooks" {
  interface Register {
    codeSetKeys: "sys.menu.type" | "sys.user.gender";
  }
}
```

After augmentation, `useCodeSetQuery({ gender: "not.a.real.key" })` is a compile error. The related exports from `@vef-framework-react/hooks`:

- `CodeSetKey` — the resolved key union (`string` when not augmented)
- `CodeSetKeyConfig` — `{ key: CodeSetKey; filterable?: boolean }`
- `CodeSetKeyValue` — `CodeSetKey | CodeSetKeyConfig`, what an alias map value accepts
- `resolveCodeSetKey(value)` — extracts the plain key string from either form

## Generating the Key Union: `vef gen:code-set-keys`

Maintaining that union by hand drifts. The dev package ships a generator that fetches the real key list (from your database or an API) and writes the augmentation file for you. This section covers the day-to-day workflow; the full option tables live in the [Dev reference](../reference/dev/overview.md).

### The Config File

The generator loads `code-generation.config.{ts,mts,js,mjs}` from the project root (first existing candidate wins; TypeScript configs work without a build step). Author it with the `defineCodeGenerationConfig` identity helper:

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

The `codeSetKeys` block accepts:

| Field | Type | Default | Purpose |
| --- | --- | --- | --- |
| `fetchCodeSetKeys` | `() => Promise<readonly CodeSetKeyEntry[]>` | required | Fetcher invoked at generation time to retrieve all code set keys. Runs in Node. |
| `output` | `string` | `"src/types/code-set-keys.gen.ts"` | Output path resolved against the project root; absolute paths and `..` traversal are rejected. |
| `timeout` | `number` | `30000` | Timeout (ms) for the fetcher; `0` disables the timeout entirely. |

Each `CodeSetKeyEntry` is `{ key: string; comment?: string }` — `key` must match `/^[\w.-]+$/` (letters, digits, underscore, dot, hyphen; anything else fails generation), and `comment` becomes a JSDoc comment on the union member. Duplicate keys are deduplicated (first occurrence wins, with a warning when comments conflict), and the entries are sorted by key.

### The Generated Output

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

Check this file into source control — it is what makes the keys compile-time-safe for everyone, including CI.

### Running It

```bash
vef gen:code-set-keys              # generate (or refresh) the file
vef gen:code-set-keys --check      # CI guard: exit non-zero if the file is stale
vef gen:code-set-keys -c custom.config.ts -o src/gen/keys.ts
```

`--check` computes the output without writing and fails when the checked-in file no longer matches the backend, which makes "someone added a code set but did not regenerate" a CI failure instead of a runtime surprise. An empty fetcher result generates `CodeSetKey = never` (with a warning) rather than failing.

## Usage Notes

Whenever a page needs code sets, tree utilities, formatting, or validation, it is worth checking `@vef-framework-react/shared` and the related hooks first — the framework is designed to reduce repetition in page-level code rather than have every page re-derive the same option-transformation logic. The full symbol-by-symbol index of `@vef-framework-react/shared` lives in [Shared Package Overview](../reference/shared/overview.md).
