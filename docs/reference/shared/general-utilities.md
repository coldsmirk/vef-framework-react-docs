---
sidebar_position: 5
title: General Utilities and Color Helpers
---

# General Utilities and Color Helpers

## Color Helpers

- `isValidColor`
- `toHexColor`
- `toRgbColor`
- `toHslColor`
- `toHsvColor`
- `getColorDifference`
- `convertHslToHex`
- `setColorAlpha`
- `mixColor`
- `convertTransparentToOpaque`
- `isWhiteColor`
- `getColorName`
- `getColorPalette`

## Function and Task Helpers

- `AwaitableFnInvocationOptions`
- `isAsyncFunction`
- `invokeAwaitableFn`
- `identity`
- `createThrowNotImplementedFn`
- `throwNotImplemented`
- `generateId`
- `scheduleMicrotask`

## Common Utilities from `lib.ts`

This module gathers many common utilities into one place. Representative exports include:

- type predicates such as `isArray`, `isString`, `isPlainObject`, `isPromise`
- object helpers such as `assign`, `get`, `set`, `omit`, `pick`
- collection helpers such as `first`, `last`, `max`, `min`, `sum`, `unique`
- naming helpers such as `camelCase`, `constantCase`, `kebabCase`, `pascalCase`, `snakeCase`
- rate-limiting helpers such as `debounce`, `throttle`, `memoize`, `once`
- query-string helpers such as `decodeQueryString`, `encodeQueryString`
- constants and placeholders such as `alwaysTrue`, `alwaysFalse`, `always`, and `noop`
