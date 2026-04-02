---
sidebar_position: 2
title: Package API Map
---

# Package API Map

This page does not dive into implementation details. Its purpose is to answer a simpler question: when a certain need appears, which package should be inspected first?

## `@vef-framework-react/starter`

Best suited for:

- application entry
- routing
- login and layouts
- CRUD pages

Start with:

- `createApp`
- `createRouter`
- `createApiClient`
- `Page`
- `ProTable`
- `CrudPage`
- `createCrudKit`

## `@vef-framework-react/components`

Best suited for:

- UI components
- form fields
- option-driven controls
- notifications
- icons and charts
- theme tokens and CSS variables

Start with:

- `globalCssVars`
- `useThemeTokens`
- `useIsDarkMode`
- `useForm`
- `useFormContext`
- `useDataOptionsSelect`
- `Table`
- `PermissionGate`
- `Icon`
- `Chart`

## `@vef-framework-react/core`

Best suited for:

- query and mutation
- stores and atoms
- permission checks
- HTTP and SSE

Start with:

- `useQuery`
- `useMutation`
- `createStore`
- `createComponentStore`
- `atom`
- `checkPermission`

## `@vef-framework-react/hooks`

Best suited for:

- data dictionaries
- option transformation
- loading-state checks
- permission-aware filtering

Start with:

- `useDataDictQuery`
- `useDataOptionsQuery`
- `useHasFetching`
- `useHasMutating`
- `useAuthorizedItems`

## `@vef-framework-react/shared`

Best suited for:

- validation
- formatting
- tree processing
- event emitters

Start with:

- `z`
- `EventEmitter`
- `formatDate`
- `flattenTree`
- `mapTree`

## `@vef-framework-react/dev`

Best suited for:

- Vite configuration
- ESLint
- Stylelint
- Commitlint

Start with:

- `defineViteConfig`
- `defineEslintConfig`
- `defineStylelintConfig`
- `defineCommitlintConfig`

## `@vef-framework-react/approval-flow-editor`

Best suited for:

- embedding an approval flow designer
- editing flow-definition JSON structures
- plugging in custom node pickers

Start with:

- `ApprovalFlowEditor`
- `toFlowDefinition`
- `fromFlowDefinition`
- `EditorPlugins`
