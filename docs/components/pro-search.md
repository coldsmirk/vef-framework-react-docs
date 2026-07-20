---
title: "ProSearch"
description: "A search-form container with basic search area, collapsible advanced search panel, and search/reset actions."
---

# ProSearch

A search-form container with basic search area, collapsible advanced search panel, and search/reset actions.

> **VEF-specific component.** Moved from `@vef-framework-react/starter` to `@vef-framework-react/components` in v2.1.6.

## When to Use

- Table search bars with optional advanced filter panels.
- Any search area that needs consistent search/reset button behavior.

## Basic Usage

`ProSearch` owns a form instance internally. Search fields connect to it through `useFormContext` + `AppField` — a bare input without an `AppField` binding never reaches `onSearch`. The conventional shape is a small `BasicSearch` component next to the page:

```tsx
import { ProSearch, useFormContext } from '@vef-framework-react/components';

interface UserSearch {
  keyword?: string;
  status?: string;
}

function BasicSearch() {
  const { AppField } = useFormContext<UserSearch>();

  return (
    <>
      <AppField name="keyword">
        {(field) => <field.Input noWrapper placeholder="Keyword" />}
      </AppField>
      <AppField name="status">
        {(field) => <field.Select noWrapper placeholder="Status" options={STATUS_OPTIONS} />}
      </AppField>
    </>
  );
}

export default function UserSearchBar({ onSearch }: { onSearch: (values: UserSearch) => void }) {
  return (
    <ProSearch<UserSearch>
      basicSearch={<BasicSearch />}
      onSearch={onSearch}
    />
  );
}
```

`onSearch` receives the current form values when the search button is pressed. Use `noWrapper` on field components inside search areas so they render without the label/error scaffolding used in full forms.

## With Advanced Search

The collapsible advanced panel uses the same context — both areas share one form, so `onSearch` receives the merged values:

```tsx
function AdvancedSearch() {
  const { AppField } = useFormContext<UserSearch>();

  return (
    <>
      <AppField name="createdAfter">
        {(field) => <field.DatePicker noWrapper placeholder="Created after" />}
      </AppField>
      <AppField name="department">
        {(field) => <field.Select noWrapper placeholder="Department" options={DEPARTMENT_OPTIONS} />}
      </AppField>
    </>
  );
}

<ProSearch<UserSearch>
  basicSearch={<BasicSearch />}
  advancedSearch={<AdvancedSearch />}
  onSearch={onSearch}
  onReset={onReset}
/>
```

## Layout Behavior

- The bar is a two-side flex row: `extra` sits on the left, and the search controls (toggler + basic fields + actions) right-align in a shrinkable, wrapping area — long toolbars and narrow containers degrade gracefully instead of overflowing. Below the `sm` breakpoint the bar stacks vertically and the controls left-align at full width.
- When `advancedSearch` is provided, an advanced-search toggler button is rendered automatically before the basic fields; the panel expands below the bar. No prop is needed to enable the toggler.
- Field controls inside the search area get a fixed width for visual rhythm: `Input` / `Select` / `TreeSelect` are `200px` (including inputs using `allowClear` / `prefix` / `suffix`, whose affix wrapper is sized instead of the inner input), and range pickers are `360px`.
- The search and reset buttons only render when `basicSearch` or `advancedSearch` is present.

## API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | — | CSS class name |
| `defaultValues` | `TValues` | — | Initial search values |
| `basicSearch` | `ReactNode` | — | Inline search fields |
| `advancedSearch` | `ReactNode` | — | Collapsible advanced search fields; also enables the built-in advanced-search toggler |
| `extra` | `ReactNode` | — | Extra content on the left side |
| `disabled` | `boolean` | — | Disable the search form |
| `loading` | `boolean` | — | Loading state for the search button; also disables the form while pending |
| `defaultAdvancedSearchVisible` | `boolean` | `false` | Initial visibility of advanced search (uncontrolled) |
| `advancedSearchVisible` | `boolean` | — | Controlled visibility of advanced search |
| `onAdvancedSearchVisibleChange` | `(visible: boolean) => void` | — | Called when advanced search visibility changes |
| `onSearch` | `(values: TValues) => void` | — | Called with the current form values when the search button is pressed |
| `onReset` | `(defaultValues?: TValues) => void` | — | Called when search is reset (deferred one macrotask so the native form reset finishes propagating first) |
| `searchButtonProps` | `Except<SubmitButtonProps, 'onSubmit' \| 'disabled' \| 'loading'>` | — | Search button customization |
| `resetButtonProps` | `Except<ResetButtonProps, 'onReset' \| 'disabled' \| 'loading'> \| false` | — | Reset button customization; `false` to hide |
