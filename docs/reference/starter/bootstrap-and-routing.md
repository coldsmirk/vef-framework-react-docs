---
sidebar_position: 2
title: Bootstrap and Routing
---

# Bootstrap and Routing

## `createApp`

Creates an application instance and renders `App` into `#root`.

Typical cases:

- the main application entry in `main.ts`
- controlled render and unmount in isolated environments

## `createApiClient`

Extends `core.createApiClient()` with token storage, unauthenticated handling, access-denied handling, and global message feedback.

## `createRouter`

Creates the VEF-flavored TanStack Router instance.

Its main inputs are:

- `history`
- `routeTree`
- `context`

It also provides route-progress behavior, fallback components, and event-driven unauthenticated / unauthorized handling.

## `createRootRouteOptions`

Root-route helper focused on document-title behavior.

## `createLayoutRouteOptions`

Layout-route helper for:

- authenticated application areas
- menu loading
- permission-aware navigation
- logout wiring

## `createLoginRouteOptions`

Login-route helper that handles redirect-aware login flow.

## `createAccessDeniedRouteOptions`

Access-denied-route helper for unauthorized entry behavior.

## Event Helpers

- `dispatchCustomEvent`
- `eventEmitter`
- `reloadPage`
- `handleClientLogout`

## Route Constants

- `LOGIN_ROUTE_PATH` / `LOGIN_ROUTE_ID`
- `INDEX_ROUTE_PATH` / `INDEX_ROUTE_ID`
- `ACCESS_DENIED_ROUTE_PATH` / `ACCESS_DENIED_ROUTE_ID`
