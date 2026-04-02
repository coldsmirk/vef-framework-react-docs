---
sidebar_position: 3
title: Page Layout and Form Containers
---

# Page Layout and Form Containers

> **Note (v2.1.6):** `Page`, `FlexCard`, `FormModal`, and `FormDrawer` have moved to `@vef-framework-react/components`. Import them from there instead of `starter`.

## `App`

The application root component that connects:

- `AppContextProvider`
- `ApiClientProvider`
- `MotionProvider`
- `ThemeConfigProvider`
- `RouterProvider`

In normal application code it is used through `createApp().render()` rather than instantiated directly.

## `Page`

Primary container for regular business pages.

Useful for:

- monitoring pages
- settings pages
- dashboards
- left / right split panels

## `FlexCard`

A semantic export around `CardProps`, suitable for split cards and tree-table pages.

## `BaseLayout` / `Layout`

Application-shell layout components, usually driven by the layout route instead of being rebuilt manually in page code.

## `RouterProvider`

Injects the router and extended router context into the React tree.

## `ThemeConfigProvider`

Starter-level theme wrapper typically used together with `App`.

## `Login`

Built-in login page component.

## `FormModal`

Combines `Modal`, form state, mutation behavior, and submit actions.

## `FormDrawer`

Provides the same form pattern as `FormModal`, but inside a drawer.

## Other Page-Level Exports

- `AccessDenied`
- `Error`
- `NotFound`
- `LogoIcon`
- `nProgressEventEmitter`
- `useViewportHeight`
