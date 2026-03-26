---
sidebar_position: 3
title: Route Guards
---

# Route Guards

VEF does not encourage handwritten `beforeLoad` logic on every page.  
Guard responsibilities are generally better centralized in `createLayoutRouteOptions()`.

## What It Guards

The layout route handles:

1. redirecting unauthenticated users to login
2. fetching user information
3. building menu-path mappings
4. checking whether the current path belongs to the authorized menu set
5. redirecting unauthorized paths to `/access-denied`

## Why This Model Is More Stable

In admin applications, route access is usually determined by a combination of:

- current user info
- menu tree
- permission tokens
- authentication state

Distributing those checks across page files tends to make maintenance harder over time.

## Recommended Pattern

- keep authentication guards out of the root route
- let the layout route own authentication and menu guards
- keep business pages focused on page behavior

## Additional Guidance

Avoid mixing button permissions with page permissions:

- page-level access belongs in route guards
- button-level access belongs in `PermissionGate`
