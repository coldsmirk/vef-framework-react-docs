---
sidebar_position: 1
title: Components Package Overview
---

# Components Package Overview

`@vef-framework-react/components` is the package most directly used by page code. To avoid duplicating the entire Ant Design documentation surface, the reference pages are split into two groups:

1. VEF-native or VEF-enhanced exports
2. Ant Design pass-through exports

> **v2.1.6:** `Page`, `FlexCard`, `FormModal`, `FormDrawer`, `ProSearch`, `ProTable`, `Crud`, `CrudPage`, and `createCrudKit` have moved from `starter` into this package.

## How to Read This Section

- For VEF-specific form, permission, icon, animation, and options APIs, start with [VEF Components](./vef-components.md) and [Forms and Data APIs](./form-and-data.md).
- For components that are largely thin wrappers around Ant Design, use [Ant Design Pass-Through Components](./antd-pass-through.md).

## Key VEF-Specific Capabilities

| Capability | Main Exports | Typical Use |
| --- | --- | --- |
| Action controls | `ActionButton`, `ActionGroup`, `OperationButton` | async actions, confirmations, batch actions |
| Page layout | `Page`, `FlexCard` | business pages, tree-table layouts |
| Form containers | `FormModal`, `FormDrawer` | create and edit forms in modal or drawer |
| CRUD stack | `Crud`, `CrudPage`, `createCrudKit`, `ProTable`, `ProSearch` | full CRUD pages |
| Form system | `useForm`, `useFormContext`, `withForm`, `withFieldGroup` | create, edit, and search forms |
| Option adapters | `useDataOptionsSelect`, `useDataOptionsTreeSelect`, `useDataOptionsTree` | select, tree select, data dictionaries |
| Layout components | `Grid`, `Group`, `Stack`, `Center`, `ScrollArea` | admin-page forms, cards, tree-table layouts |
| Theme and feedback | `ConfigProvider`, `useThemeTokens`, `showSuccessMessage` | page theme integration and unified feedback |
| Enhanced presentation | `CodeHighlighter`, `FlipText`, `SparklesText`, `TypingAnimation` | docs, landing sections, richer display blocks |
| Permission rendering | `PermissionGate` | button, section, and card-level permission control |
