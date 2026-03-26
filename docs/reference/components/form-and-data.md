---
sidebar_position: 3
title: Forms and Data APIs
---

# Forms and Data APIs

This page covers the most important productivity APIs exported by the `components` package.

## `useForm`

Main entry point for the VEF form system. It builds on TanStack Form while exposing the VEF `Form`, `AppField`, `SubmitButton`, and `ResetButton` surface.

Recommended for:

- standalone forms
- search forms
- settings pages

## `useFormContext`

Reads form APIs from context instead of creating a new form instance.

Recommended for:

- `CrudPage` scene forms
- large forms split into sections
- reusable field groups

## `useFormStore`

Useful when lower-level TanStack Form state needs to be observed directly.

## `createFormOptions`

Creates reusable form option objects for shared defaults, validators, or submission behavior.

## `withForm` and `withFieldGroup`

Extension points for composing higher-level form abstractions while keeping the VEF form context and field system intact.

## `useDataOptionsSelect`

Transforms regular query results or dictionary data into props suitable for `Select`.

Recommended for:

- normal selects
- multi-selects
- remote option lists

## `useDataOptionsTreeSelect`

Transforms regular query or dictionary data into `TreeSelect` data with built-in filtering support.

## `useDataOptionsTree`

Transforms regular list data into structures suitable for `Tree`, while also providing search state and tree filtering behavior.

## `Table`

The VEF table export is more than a plain Ant Design alias because it also aligns types and helper exports around table usage.

## `usePaginationProps`

Builds pagination props from `{ page, size, total }`, matching common admin-table behavior.

## `pageSizeOptions`

The built-in page-size options exported by VEF:

```ts
[10, 15, 20, 30, 40, 50, 100]
```

## `Chart` and `useChart`

The chart layer is based on ECharts and exposed through:

- `Chart`
- `useChart`
- `connectCharts`
- `disconnectCharts`

Recommended for dashboards, monitoring pages, and admin-side trend analysis.
