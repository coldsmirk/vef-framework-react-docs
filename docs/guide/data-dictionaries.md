---
title: Data Dictionaries
description: How backend-driven option data flows through dictionaryQueryFn into forms and search areas, with pinyin search built in.
---

# Data Dictionaries

Data dictionaries are one of the highest-frequency capabilities in business applications: backend-defined option lists (status values, categories, genders, and similar enumerations) that forms and search areas render as selects, without each page defining its own option list.

## Where Data Dictionaries Come From

Provide the dictionary query function through `createApp().render()`:

```ts
createApp().render({
  appContext: {
    dictionaryQueryFn: findDataDictItems
  },
  ...
});
```

Once this is configured, forms and search areas can use:

```ts
import { useDictionaryQuery } from "@vef-framework-react/hooks";
import { useDataOptionsTreeSelect, useDictionaryOptionsSelect } from "@vef-framework-react/components";
```

- `useDictionaryQuery` — the low-level query hook, from `@vef-framework-react/hooks`
- `useDictionaryOptionsSelect` — a `Select`-ready wrapper around it, from `@vef-framework-react/components`
- `useDataOptionsTreeSelect` — the equivalent wrapper for `TreeSelect`, also from `@vef-framework-react/components`

## Example

```tsx
const { gender } = useDictionaryOptionsSelect({
  gender: "common.gender"
});

// gender is a SelectProps that can be spread directly:
// <Select {...gender} />
```

For low-level access (e.g. when not rendering a `Select`), `useDictionaryQuery({ gender: "common.gender" })` returns a `UseQueryResult` with `data?.gender` shaped as `DataOption[]`.

## Why Pinyin Search Matters

VEF's option-transformation chain can automatically enrich values with pinyin metadata via `withPinyin`, which means:

- Chinese labels can be searched directly in Chinese
- full pinyin and pinyin initials can also be used

This is especially useful for people, departments, organizations, and dictionary items. See [Forms](./forms.md) for how `useDictionaryOptionsSelect` fits into a field alongside other option-fetching hooks.

## Usage Notes

Whenever a page needs dictionaries, tree utilities, formatting, or validation, it is worth checking `@vef-framework-react/shared` and the related hooks first — the framework is designed to reduce repetition in page-level code rather than have every page re-derive the same option-transformation logic. The full symbol-by-symbol index of `@vef-framework-react/shared` lives in [Shared Package Overview](../reference/shared/overview.md).
