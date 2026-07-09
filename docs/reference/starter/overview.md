---
title: Starter Package Overview
description: What @vef-framework-react/starter covers and the suggested reading order across bootstrap, routing, and the application shell.
---

# Starter Package Overview

`@vef-framework-react/starter` is the package that turns VEF into a complete application shell.

It mainly covers three areas:

1. application bootstrap (`createApp`, `createApiClient`)
2. routing (`createRouter`, the route-option helpers)
3. app-level state (`useAppStore`, `useTabStore`, `useThemeStore`)

The application shell itself — the root app, layouts, login, and status pages (`App`, `Layout`, `Login`, `AccessDenied`, `Error`, `NotFound`, `NProgress`, and friends) — is **internal**: none of it is exported from the package. It is configured entirely through the functions above; see [Application Shell](./application-shell.md) for the option shapes each one accepts.

Page-level containers, form dialogs, tables, and the CRUD stack live in `@vef-framework-react/components` — see [Components / CRUD](../../components/crud.md).

## Suggested Reading Order

1. [Bootstrap and Routing](./bootstrap-and-routing.md)
2. [Application Shell](./application-shell.md)
3. [Stores, Constants, and Types](./stores-and-types.md)

## Common Exports

- `createApp`
- `createApiClient`
- `createRouter`
- `createRootRouteOptions`
- `createLayoutRouteOptions`
- `createLoginRouteOptions`
- `createAccessDeniedRouteOptions`
- `setupAppVersionNotification`
- `useAppStore` / `useTabStore` / `useThemeStore`
