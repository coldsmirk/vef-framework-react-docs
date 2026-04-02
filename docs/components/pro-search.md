---
sidebar_position: 104
---

# ProSearch

A search-form container with basic search area, collapsible advanced search panel, and search/reset actions.

> **VEF-specific component.** Moved from `@vef-framework-react/starter` to `@vef-framework-react/components` in v2.1.6.

## When to Use

- Table search bars with optional advanced filter panels.
- Any search area that needs consistent search/reset button behavior.

## Basic Usage

```tsx
import { ProSearch } from '@vef-framework-react/components';

interface UserSearch {
  name?: string;
  status?: string;
}

export default function UserSearchBar({ onSearch }) {
  return (
    <ProSearch<UserSearch>
      basicSearch={
        <>
          <Input placeholder="Name" />
          <Select placeholder="Status" />
        </>
      }
      onSearch={onSearch}
    />
  );
}
```

## With Advanced Search

```tsx
<ProSearch<UserSearch>
  basicSearch={<Input placeholder="Name" />}
  advancedSearch={
    <>
      <DatePicker placeholder="Created after" />
      <Select placeholder="Department" />
    </>
  }
  onSearch={onSearch}
  onReset={onReset}
/>
```

## API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `defaultValues` | `TValues` | — | Initial search values |
| `basicSearch` | `ReactNode` | — | Inline search fields |
| `advancedSearch` | `ReactNode` | — | Collapsible advanced search fields |
| `extra` | `ReactNode` | — | Extra content on the left side |
| `disabled` | `boolean` | — | Disable the search form |
| `loading` | `boolean` | — | Loading state for the search button |
| `defaultAdvancedSearchVisible` | `boolean` | — | Initial visibility of advanced search (uncontrolled) |
| `advancedSearchVisible` | `boolean` | — | Controlled visibility of advanced search |
| `onAdvancedSearchVisibleChange` | `(visible: boolean) => void` | — | Called when advanced search visibility changes |
| `onSearch` | `(values: TValues) => void` | — | Called when search is submitted |
| `onReset` | `(defaultValues?) => void` | — | Called when search is reset |
| `searchButtonProps` | `SubmitButtonProps` | — | Search button customization |
| `resetButtonProps` | `ResetButtonProps \| false` | — | Reset button customization; `false` to hide |
