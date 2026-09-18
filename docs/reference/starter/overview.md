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

The root application and layout shell (`App`, `BaseLayout`, `Layout`, `AccessDenied`, `Error`, `NotFound`, `RouterProvider`, `NProgress`) is **internal** and configured through the helpers above; see [Application Shell](./application-shell.md). The login surface is exported for custom screens: `Login`, `SsoLogin`, `LoginChallengeOutlet`, `useLoginFlow`, `useSsoLogin`, the challenge renderer, and their types. `ThemeConfigProvider` is also exported for custom shells.

Page-level containers, form dialogs, tables, and the CRUD stack live in `@vef-framework-react/components` — see [Components / CRUD](../../components/crud.md).

## Suggested Reading Order

1. [Bootstrap and Routing](./bootstrap-and-routing.md)
2. [Application Shell](./application-shell.md)
3. [Stores and Types](./stores-and-types.md)

## Common Exports

- `createApp`
- `createApiClient`
- `createRouter`
- `createRootRouteOptions`
- `createLayoutRouteOptions`
- `createLoginRouteOptions`
- `createSsoRouteOptions`
- `createAccessDeniedRouteOptions`
- `setupAppVersionNotification`
- `PasswordChangeChallenge` / `PASSWORD_CHANGE_CHALLENGE_TYPE`
- `Login` / `SsoLogin` / `useLoginFlow` / `useSsoLogin`
- `useAppStore` / `useTabStore` / `useThemeStore`
