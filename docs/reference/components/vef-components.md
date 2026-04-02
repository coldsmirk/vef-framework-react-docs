---
sidebar_position: 2
title: VEF Components
---

# VEF Components

This page covers components and wrappers that are more than direct Ant Design re-exports.

> **v2.1.6:** `Page`, `FlexCard`, `FormModal`, `FormDrawer`, `ProSearch`, `ProTable`, `Crud`, `CrudPage`, and `createCrudKit` have moved from `starter` into this package.

## Page

Primary container for regular business pages. Supports left/right aside panels, header, footer, action bar, and scrollable content.

Recommended for:

- monitoring pages, settings pages, dashboards
- left/right split panels with optional resizable asides
- pages that need a consistent header/footer layout

## FlexCard

A semantic wrapper around `Card` for split-card and tree-table page layouts.

## FormModal

Combines `Modal`, form state, mutation behavior, and submit/reset actions into one component.

Recommended for:

- create and edit forms in a modal dialog
- any form that submits via a `MutationFunction`

## FormDrawer

Same form pattern as `FormModal`, but rendered inside a drawer.

Recommended for:

- create and edit forms in a side drawer
- forms that benefit from more vertical space

## ProSearch

Search-form container with basic search area, advanced search panel, and search/reset actions.

Recommended for:

- table search bars
- filter panels with collapsible advanced options

## ProTable

Page-level table abstraction with built-in query, pagination, row selection, column settings, and operation columns.

Recommended for:

- any data list page
- tables that need column visibility control or virtual scrolling

Related exports: `ProTableSubscriber`, `OperationButtonGroup`, `ProTableRef`, `ProTableState`, `RowSelectionConfig`, `ColumnSettingsConfig`, `ParamsWithPagination`, `ParamsWithSort`.

## Crud

Combines `ProSearch`, `ProTable`, scene forms, and delete mutations into one CRUD state model.

## CrudPage

The standard page-level CRUD abstraction, built from `Page + Crud`.

## createCrudKit

Fixes a page's `TRow`, `TSearchValues`, and `TSceneFormValues` generics into a reusable local toolkit.

Returned helpers: `useCrudStore`, `useSearchValues`, `useSelectedRows`, `ActionButtonGroup`, `OperationButtonGroup`.

## ActionButton

Adds async-click and confirmation behavior on top of a button.

Recommended for:

- delete, disable, and batch actions
- actions that wait for async completion
- places where confirmation should stay visually consistent

## ActionGroup

Renders a group of actions from configuration.

Recommended for:

- page toolbars
- batch actions above tables
- context-driven action groups

## Bool

Wraps a boolean field as one unified control, supporting `switch`, `checkbox`, `radio`, and `radio-button`.

Recommended for:

- enable / disable states
- yes / no style fields
- boolean fields that should stay visually consistent across forms

## ConfigProvider

VEF's top-level theme container. It extends Ant Design configuration with Emotion, CSS variables, notifications, an error boundary, and dark-mode context.

Recommended for:

- application root setup
- isolated rendering environments that still need the VEF theme shell

## DynamicIcon

Loads Lucide icons from string names with caching and safe fallback behavior.

Recommended for:

- backend-driven menu icons
- config-driven icon names
- dynamic navigation structures

## Grid

A responsive grid built for forms and admin-page layouts.

Recommended for:

- form layouts
- stats cards
- collapsible search panels

## Icon and IconButton

`Icon` integrates Lucide icons into the VEF component system.  
`IconButton` adds tooltip-oriented icon-button semantics on top.

Recommended for:

- action icons
- table-row action buttons
- toolbars and compact action areas

## Loader

Unified loading placeholder for page-level or local loading states.

## LogoIcon

The VEF framework logo icon as an SVG component. Accepts `primaryColor` and standard SVG props.

## OperationButton

Semantically close to `ActionButton`, but most often used inside row actions or compact operation areas.

## PermissionGate

Component-level permission gate based on `appContext.hasPermission()`.

Recommended for:

- hiding unauthorized actions
- permission-aware sections and cards
- rendering different content based on permission state

## ScrollArea

A scroll container built on Radix Scroll Area, better suited than plain `overflow: auto` for complex admin-page panels.

Recommended for:

- left-side tree navigation
- bounded filter panels
- panels that need scroll-position callbacks

## CodeHighlighter

Code and JSON display component for docs, request inspection, and structured payload viewing.

## Presentation Components

The following exports are more presentation-oriented than core business UI:

- `FlipText`
- `SparklesText`
- `SplitText`
- `TypingAnimation`

Adds async-click and confirmation behavior on top of a button.

Recommended for:

- delete, disable, and batch actions
- actions that wait for async completion
- places where confirmation should stay visually consistent

## ActionGroup

Renders a group of actions from configuration.

Recommended for:

- page toolbars
- batch actions above tables
- context-driven action groups

## Bool

Wraps a boolean field as one unified control, supporting `switch`, `checkbox`, `radio`, and `radio-button`.

Recommended for:

- enable / disable states
- yes / no style fields
- boolean fields that should stay visually consistent across forms

## ConfigProvider

VEF's top-level theme container. It extends Ant Design configuration with Emotion, CSS variables, notifications, an error boundary, and dark-mode context.

Recommended for:

- application root setup
- isolated rendering environments that still need the VEF theme shell

## DynamicIcon

Loads Lucide icons from string names with caching and safe fallback behavior.

Recommended for:

- backend-driven menu icons
- config-driven icon names
- dynamic navigation structures

## Grid

A responsive grid built for forms and admin-page layouts.

Recommended for:

- form layouts
- stats cards
- collapsible search panels

## Icon and IconButton

`Icon` integrates Lucide icons into the VEF component system.  
`IconButton` adds tooltip-oriented icon-button semantics on top.

Recommended for:

- action icons
- table-row action buttons
- toolbars and compact action areas

## Loader

Unified loading placeholder for page-level or local loading states.

## OperationButton

Semantically close to `ActionButton`, but most often used inside row actions or compact operation areas.

## PermissionGate

Component-level permission gate based on `appContext.hasPermission()`.

Recommended for:

- hiding unauthorized actions
- permission-aware sections and cards
- rendering different content based on permission state

## ScrollArea

A scroll container built on Radix Scroll Area, better suited than plain `overflow: auto` for complex admin-page panels.

Recommended for:

- left-side tree navigation
- bounded filter panels
- panels that need scroll-position callbacks

## CodeHighlighter

Code and JSON display component for docs, request inspection, and structured payload viewing.

## Presentation Components

The following exports are more presentation-oriented than core business UI:

- `FlipText`
- `SparklesText`
- `SplitText`
- `TypingAnimation`
