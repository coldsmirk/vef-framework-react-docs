---
sidebar_position: 4
title: Application Project Conventions
---

# Application Project Conventions

This page defines the mandatory conventions for VEF application projects. It applies to application codebases built with the framework, including projects organized like `playground`. It does not define conventions for framework package development inside the monorepo.

:::danger
All new application code MUST follow this page. When an existing area is modified, the touched files MUST remain compliant within the edited scope. These rules are not optional recommendations.
:::

:::tip
Read [Project Structure](./project-structure.md) first for the baseline directory map. Read this page for the naming rules, placement rules, and forbidden patterns that every application project MUST follow.
:::

## Scope and enforcement

- These rules apply only to application projects built with VEF Framework React.
- Application code MUST use the exported APIs of the framework. It MUST NOT depend on framework internals or private package source files.
- A directory, file, or naming pattern that is not defined here MUST NOT be introduced as a project-wide convention by default.
- A page-local concern MUST stay local unless it is reused across multiple route domains.
- Shared application code MUST be promoted deliberately. It MUST NOT be moved to a global directory only to reduce one or two relative imports.

## Standard application layout

Every application project MUST start from the following `src/` layout:

```text
src/
  api/
    index.ts
    request.ts
  apis/
    auth/
    md/
    pmr/
    sys/
    index.ts
  helpers/
    config.ts
    index.ts
  hooks/
    use-upload/
      index.ts
    index.ts
  pages/
    __root.ts
    _common/
      access-denied.ts
      login.ts
    _layout/
      route.ts
      index/
        route.tsx
        styles/
          index.module.scss
      auth/
      md/
      pmr/
      sys/
  router/
    context.ts
    index.ts
    router.gen.ts
  styles/
    index.scss
  types/
    config.ts
    index.ts
  main.ts
```

### Top-level directory contract

| Directory | MUST contain | MUST NOT contain |
| --- | --- | --- |
| `src/api` | application-level API client setup and shared request wrappers | domain-specific business APIs |
| `src/apis` | business-domain API files grouped by domain | page components, route modules, page state |
| `src/pages` | route entries and page-local implementation | cross-project utility buckets |
| `src/router` | router context, generated router entry, router exports | page UI, API definitions |
| `src/types` | truly application-wide types only | every domain entity type by default |
| `src/hooks` | app-wide reusable hooks | hooks used by only one page or one domain |
| `src/helpers` | app-wide non-React helpers | page-local helpers or domain business logic |
| `src/styles` | global stylesheets only | page-local CSS Modules |

### Root file contract

- `src/main.ts` MUST only bootstrap the application, import global styles, and call `createApp().render()`.
- `src/pages/__root.ts` MUST define the root route only.
- `src/pages/_layout/route.ts` MUST define the shared layout route only.
- `src/pages/_common/*` MUST contain framework-level common routes such as login and access-denied pages.
- `src/router/index.ts` MUST be the router export entry.
- `src/router/router.gen.ts` is generated output and MUST NOT be edited manually.

## Route and page directory contract

The `pages/` directory MUST mirror the route hierarchy.

### Route entry rules

- Every routeable page MUST have its own page directory.
- Every page directory MUST expose exactly one route entry file named `route.tsx` or `route.ts`.
- The route path passed to `createFileRoute()` MUST match the physical page hierarchy.
- Framework-provided route ids such as `INDEX_ROUTE_ID`, `LOGIN_ROUTE_ID`, and `ACCESS_DENIED_ROUTE_ID` MUST be used when the framework already defines them.

### `route.tsx` responsibility rules

`route.tsx` MUST do only the following:

- declare the route
- assemble `Page`, `CrudPage`, or other page shells
- connect page-local components
- connect page-local store providers when the page owns local state
- wire page-local API functions and helper factories into the page shell

`route.tsx` MUST NOT do the following:

- define large form field trees inline
- define large search form trees inline
- hold long modal implementations
- contain multiple unrelated helper functions
- become a general-purpose dumping file for the whole page

### Page-local folder contract

A typical page directory MUST follow this split:

```text
pages/_layout/auth/user/
  route.tsx
  components/
    basic-search.tsx
    form.tsx
  helpers/
    index.ts
```

Use the following placement rules:

- `components/` MUST contain page-local React UI pieces only.
- `helpers/` MUST contain page-local helper factories, scene types, column builders, and page-local utility glue.
- `styles/` MUST contain page-local style files only.
- `store.ts` MAY exist directly under the page directory only when the page owns a dedicated local store.
- A page-local concern MUST NOT be moved to `src/helpers`, `src/hooks`, or `src/types` unless it is reused across multiple route domains.

### When `store.ts` is allowed

`store.ts` is allowed only when all of the following are true:

- the state belongs to one page only
- the state is not a reusable framework abstraction
- the page needs a dedicated provider or local event coordination

If those conditions are not met, do not create a page store.

## API layer contract

The API layer has two levels, and they MUST stay separate.

### `src/api/`

`src/api/` is reserved for application-level API infrastructure.

- `src/api/index.ts` MUST create and export the application `apiClient`.
- `src/api/request.ts` MUST hold shared request-envelope builders or common request helpers.
- `src/api/` MUST NOT contain domain resources such as `user.ts`, `role.ts`, or `department.ts`.

### `src/apis/`

`src/apis/` is reserved for domain APIs and MUST be grouped by business domain:

```text
apis/
  auth/
    auth.ts
    menu.ts
    role.ts
    user.ts
  sys/
    app.ts
    audit-log.ts
    config.ts
  md/
    department.ts
    staff.ts
  pmr/
    document-type.ts
```

Each API file MUST follow these rules:

- one file MUST represent one resource or one tightly related aggregate
- domain entity types and request parameter types MUST stay in the corresponding API file by default
- query and mutation functions MUST be exported from the same file as the domain types they serve
- page components, route files, and page stores MUST NOT be imported into API files

### API naming rules

API exports MUST use verb-first, resource-specific names.

| Operation | Required naming pattern | Example |
| --- | --- | --- |
| paged query | `find<Resource>Page` | `findUserPage` |
| list/detail query | `find<Resource>` or a specific query name | `findConfigsByGroup` |
| create mutation | `create<Resource>` | `createUser` |
| update mutation | `update<Resource>` | `updateUser` |
| save mutation | `save<Resource>` | `saveConfigs` |
| delete single | `delete<Resource>` | `deleteUser` |
| delete batch | `delete<Resources>` or a clearly plural name | `deleteUsers` |
| auth refresh | `refresh<AuthOrToken>` | `refreshAuth` |

### API import rules

- Page code MUST import application APIs through `~apis`.
- Global API infrastructure MUST be imported through `~api`.
- Deep relative imports from page code into `src/apis/**` MUST NOT be used when the alias export is available.

## Types, hooks, helpers, and store placement

### Type placement rules

- `src/types/` is reserved only for application-wide types such as config, storage, or other cross-cutting contracts.
- Domain entity types, request parameter types, and response types MUST live in the corresponding API file under `src/apis/`.
- Page-specific scene values, helper types, and store-facing types MUST stay in the page directory, typically under `helpers/` or alongside `store.ts`.
- `src/types/` MUST NOT become a default bucket for every interface in the project.

### Hook placement rules

- `src/hooks/` is reserved only for hooks reused across multiple route domains.
- A hook used by only one page MUST stay under that page directory.
- A hook used by only one domain MUST stay under that domain area until it becomes cross-domain.
- `src/hooks/` MUST export public application hooks through `src/hooks/index.ts`.

### Helper placement rules

- `src/helpers/` is reserved only for app-wide non-React helpers such as config access and generic text helpers.
- Page-local helper factories such as `createCrudKit()` bindings MUST stay under the page's `helpers/` directory.
- Domain business logic MUST NOT be hidden under `src/helpers/`.

## Naming rules

### Directory and file naming

- Directories MUST use `kebab-case`.
- Files MUST use `kebab-case`.
- The only reserved file names allowed outside normal kebab-case are framework entry names such as `__root.ts`, `route.ts`, `route.tsx`, `store.ts`, and barrel `index.ts`.
- Page style entry files MUST use `styles/index.module.scss` when the page has a dedicated style folder.

### Export naming

- React components MUST use `PascalCase`.
- Hooks MUST use `camelCase` and start with `use`.
- Store providers MUST use `PascalCase` and end with `Provider` when they render context or store boundaries.
- Store hooks MUST use `useXxxStore` or `useXxxPageStore`.
- Types and interfaces MUST use `PascalCase`.
- Constants MUST use `UPPER_SNAKE_CASE` only when they are true constants; otherwise use `camelCase`.

### Barrel file rules

- `index.ts` MAY be used only as a public folder entry or a barrel export file.
- `index.ts` MUST NOT hide the primary implementation of a page route.
- Global barrels such as `src/apis/index.ts`, `src/helpers/index.ts`, `src/hooks/index.ts`, and `src/types/index.ts` MUST re-export only public application modules.

### Import path rules

- Shared application modules MUST be imported through aliases such as `~api`, `~apis`, `~helpers`, `~hooks`, `~router`, and `~types`.
- Page-local modules MUST be imported with relative paths.
- Long relative imports that climb back to the app root MUST NOT be used when an alias already exists.

## Styling and asset placement

### Styling rules

- Global styles MUST live in `src/styles/index.scss`.
- Page-local styles MUST stay inside the owning page directory.
- CSS Modules MUST be the default choice for page-local styles.
- Design values MUST use framework tokens, CSS variables, or theme hooks. Raw theme hex values MUST NOT be scattered across page styles when an exported framework token already exists.

### Asset rules

- App-wide static assets addressed by URL MUST live in `public/`.
- Page-local assets MUST stay close to the owning page or feature.
- `public/` MUST NOT become a dump folder for assets used by only one page.

## Forbidden patterns

The following patterns are forbidden in VEF application projects:

- creating generic top-level dump folders such as `src/services`, `src/utils`, `src/stores`, or `src/common` as the default place for unrelated code
- creating a top-level `src/components` folder for page-local UI
- placing multiple business domains in one API file
- placing page-only helpers in `src/helpers`
- placing page-only hooks in `src/hooks`
- moving domain entity types into `src/types` without a cross-project need
- turning `route.tsx` into the full implementation file for the entire page
- placing page-local CSS into `src/styles/index.scss`
- editing `router.gen.ts` manually

## Compliance checklist

Before merging a new page or feature, verify all of the following:

- the route directory matches the route path
- the route entry is thin and only assembles the page
- page-local UI stays under the page directory
- APIs are defined under `src/apis/<domain>/`
- app-wide infrastructure stays under `src/api/`, `src/router/`, `src/helpers/`, `src/hooks/`, and `src/types/`
- names follow the required casing and verb patterns
- styles and assets are colocated correctly

If any answer is no, the implementation is not compliant yet.
