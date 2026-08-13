---
title: Project Structure
description: The standard src/ directory map for a VEF application, and how a typical page and API directory are split.
---

# Project Structure

VEF works best when projects are organized around page scenarios rather than around large shared buckets such as `components`, `hooks`, or `services`.  
The sample application `playground` follows this structure and can be used as a reference.

This page explains the standard directory map. The mandatory naming rules, placement rules, and forbidden patterns are defined in [Project Conventions](../advanced/project-conventions.md).

## Recommended Layout

This is a representative excerpt. The full mandatory `src/` layout — every top-level directory's contract — lives in [Project Conventions](../advanced/project-conventions.md).

```text
src/
  api/
    index.ts
  apis/
    auth/
    sys/
  helpers/
  hooks/
  pages/
    __root.ts
    _common/
      login.ts
      access-denied.ts
    _layout/
      route.ts
      auth/
      sys/
  router/
    context.ts
    index.ts
    router.gen.ts
  types/
    augmentation.ts
    code-set-keys.gen.ts
  main.ts
```

## Directory Responsibilities

| Directory | Purpose | Typical Contents |
| --- | --- | --- |
| `api/` | Application-level API client setup | `createApiClient()`, request wrappers, shared headers |
| `apis/` | Domain API functions | `findUserPage`, `createUser`, `refreshAuth` |
| `helpers/` | App-level utilities unrelated to one domain | config readers, environment wrappers |
| `hooks/` | Reusable page hooks | uploads, modal state, composed behaviors |
| `pages/` | Route entries and page implementations | `route.tsx`, page components, local helpers |
| `router/` | Router instance and router context | `createRouter()`, `RouterContext`, `router.gen.ts` |
| `types/` | Module augmentations and generated type files | the `Register` augmentation, `code-set-keys.gen.ts` from `vef gen:code-set-keys` |

## Typical Page Directory Split

A typical CRUD page is usually split like this:

```text
pages/_layout/auth/user/
  route.tsx
  helpers/
    index.ts
  components/
    basic-search.tsx
    form.tsx
```

This keeps responsibilities clear:

- `route.tsx` only assembles `CrudPage`
- `components/form.tsx` only renders form fields
- `components/basic-search.tsx` only renders the search area
- `helpers/index.ts` only provides page-local type helpers such as `createCrudKit()`

## API Directory Split

Splitting `apis/` by domain usually works well:

```text
apis/
  auth/
    auth.ts
    user.ts
    role.ts
    menu.ts
  sys/
    app.ts
    audit-log.ts
  md/
    department.ts
    staff.ts
```

Each file typically does two things:

1. Define interface types
2. Export `createQueryFn()` / `createMutationFn()` results

## Basic Bootstrap Files

When starting a project from scratch, these files are usually created first:

1. `src/main.ts`
2. `src/api/index.ts`
3. `src/router/context.ts`
4. `src/router/index.ts`
5. `src/pages/__root.ts`
6. `src/pages/_layout/route.ts`
7. `src/pages/_common/login.ts`
8. `src/pages/_common/access-denied.ts`

With the directory map in place, [Routing & Layout](../guide/routing.md) is the natural next read.
