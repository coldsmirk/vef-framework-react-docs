---
sidebar_position: 1
title: Starter Package Overview
---

# Starter Package Overview

`@vef-framework-react/starter` is the package that turns VEF into a complete application shell.

It mainly covers two areas:

1. application bootstrap and routing
2. application shell components (layouts, login, error pages)

> **Note (v2.1.6):** `Page`, `FlexCard`, `FormModal`, `FormDrawer`, `ProSearch`, `ProTable`, `Crud`, `CrudPage`, and `createCrudKit` have moved from `starter` to `@vef-framework-react/components`.

## Suggested Reading Order

1. [Bootstrap and Routing](./bootstrap-and-routing.md)
2. [Page Layout and Form Containers](./page-layout.md)
3. [CRUD and Table Stack](./crud.md)
4. [Stores, Constants, and Types](./stores-and-types.md)

## Common Exports

- `createApp`
- `createApiClient`
- `createRouter`
- `createRootRouteOptions`
- `createLayoutRouteOptions`
- `setupAppVersionNotification`
