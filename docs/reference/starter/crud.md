---
sidebar_position: 4
title: CRUD and Table Stack
---

# CRUD and Table Stack

> **Note (v2.1.6):** `ProSearch`, `ProTable`, `Crud`, `CrudPage`, and `createCrudKit` have moved to `@vef-framework-react/components`. Import them from there instead of `starter`.

## `ProSearch`

Search-form container for:

- basic search area
- advanced search area
- search and reset actions

## `ProTable`

Page-level table abstraction with support for:

- query functions
- pagination
- row selection
- column settings
- operation columns
- header and footer slots

Related exports:

- `ProTableSubscriber`
- `OperationButtonGroup`
- `ParamsWithPagination`
- `ParamsWithSort`
- `RowSelectionConfig`
- `ProTableRef`
- `ProTableState`

## `Crud`

Combines `ProSearch`, `ProTable`, scene forms, and delete-related mutations into one CRUD state model.

## `CrudPage`

The standard page-level CRUD abstraction, built from `Page + Crud`.

## `createCrudKit`

Fixes a page's `TRow`, `TSearchValues`, and `TSceneFormValues` generics into a reusable local toolkit.

Returned helpers usually include:

- `useCrudStore`
- `useSearchValues`
- `useSelectedRows`
- `ActionButtonGroup`
- `OperationButtonGroup`

## CRUD Types

- `CrudBasicFormScene`
- `CrudFormScene`
- `CrudBasicSceneFormValues`
- `CrudFormMutationFns`
- `CrudProps`
- `CrudPageProps`
- `CrudKit`
