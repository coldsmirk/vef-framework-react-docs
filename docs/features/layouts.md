---
sidebar_position: 3
title: Layouts and Page Containers
---

# Layouts and Page Containers

VEF page layout is centered around two layers:

- application-level layouts: `Layout` / `BaseLayout`
- page-level containers: `Page` / `FlexCard`

## `Page`

For pages that are not CRUD pages and do not require highly custom layout behavior, `Page` is usually the first container to use:

```tsx
import { Page } from "@vef-framework/starter";

<Page title="System Monitor">
  Page content
</Page>
```

It supports:

- `title`
- header / footer
- left and right side panels
- page-level margin control

## `CrudPage` Is Also Built on `Page`

That is one of the reasons CRUD pages and regular business pages feel visually consistent.

## `FlexCard`

`FlexCard` is useful when a page needs a more flexible card-style container, especially for split layouts such as list + detail or tree + form.

## `Layout`

Application-shell layout is usually not written from scratch.  
It is generally driven by `createLayoutRouteOptions()`, which is where menus, user sections, tabs, and the content area are assembled.

## Recommended Usage

- use `Page` for regular business pages
- use `FlexCard` for split panels and tree-table layouts
- keep application-wide navigation concerns inside `Layout`
