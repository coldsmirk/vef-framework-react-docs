---
sidebar_position: 9
title: Error Handling
---

# Error Handling

Error handling in VEF is not a single API. It is a chain:

1. the HTTP layer interprets business codes and authentication state
2. the API client triggers notifications or events
3. the router handles unauthenticated and unauthorized redirects
4. page code decides whether extra local handling is needed

## Key Request-Layer Configuration

```ts
createApiClient({
  http: {
    baseUrl: "/api",
    okCode: 0,
    tokenExpiredCode: 1002,
    timeout: 30_000,
    refreshToken,
  }
});
```

These fields determine how the framework interprets request success, token refresh behavior, and whether the user should be sent back to login.

## Business Errors and Network Errors

Errors can be roughly understood in two categories:

- business errors: the request returned a response, but the business code indicates failure
- network errors: timeout, offline, 4xx/5xx, or other transport-level failures

VEF's `HttpClient` handles the first case for you, which removes a lot of repetitive “if code !== 0 then toast” page logic.

## Unauthenticated and Unauthorized

`starter.createApiClient()` already bridges these two cases into the router:

- unauthenticated state triggers `onUnauthenticated`
- unauthorized state triggers `onAccessDenied`

`createRouter()` listens to these events and performs the redirect behavior.

## Login and Token Refresh

Login and token-refresh endpoints usually need to skip automatic auth headers:

```ts
import { skipAuthenticationHeader, skipAuthenticationValue } from "@vef-framework/core";

headers: {
  [skipAuthenticationHeader]: skipAuthenticationValue
}
```

## Route-Level Fallbacks

`createRouter()` already provides:

- `defaultPendingComponent`
- `defaultErrorComponent`
- `defaultNotFoundComponent`
- `defaultOnCatch`

So even when a page does not provide explicit local handling, the application still has a non-blank fallback path.

## When Page Code Should Handle Errors Locally

Page-level handling is still useful for:

- field-level form errors
- retry flows that should preserve user input
- a local failure that should not break the whole page
- custom feedback copy after batch operations

## Recommended Usage

- avoid repeating manual toasts after every API call
- avoid rebuilding login-expired redirects inside page components
- let the framework handle common errors and keep page code focused on business-specific cases
