---
sidebar_position: 4
title: Testing Suggestions
---

# Testing Suggestions

VEF does not provide a separate testing-only API surface, but its provider structure is explicit enough that page testing remains straightforward.

## Providers Commonly Needed in Tests

For a page to render correctly, the test environment usually needs at least:

- `AppContextProvider`
- `ApiClientProvider`
- theme-related providers
- `RouterProvider` when route behavior is part of the test

## Practical Suggestions

- For presentational components, mount only the minimum provider set.
- For business pages, mock query and mutation functions first.
- Avoid replaying the entire login flow in every test.

## A Useful Rule

If a page test requires the whole application shell to run before anything can be asserted, the page is often carrying too much responsibility and may be a good candidate for further splitting.
