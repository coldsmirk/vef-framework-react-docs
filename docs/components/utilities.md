---
title: "Utility Exports"
description: "The non-component exports of @vef-framework-react/components — breakpoint, color, and size design-token constants, theme-token access, query metadata symbols, and small helpers."
---

# Utility Exports

The non-component exports of `@vef-framework-react/components` — breakpoint, color, and size design-token constants, theme-token access, query metadata symbols, and small helpers. They are the shared foundation the components themselves are built on, exported so application code can stay consistent with the framework instead of redefining the same values.

> **VEF-specific API.** Everything on this page is a plain constant, function, type, or hook — nothing here renders UI. Only exports without a component home live here: hooks and helpers bound to a component (`useCodeSetOptionsSelect` on [`Select`](./select.md), `useGridCollapsed` on [`Grid`](./grid.md), `usePaginationProps` on [`Table`](./table.md), …) are documented on their component pages, and the imperative feedback helpers (`showSuccessMessage` and friends) on [Notifications & Messages](./notifications.md).

| Section | Exports |
|---------|---------|
| [Breakpoints & Responsive Values](#breakpoints--responsive-values) | `breakpoints`, `resolveBreakpointValue`, `Breakpoint` |
| [Colors](#colors) | `colors`, `presetColors`, `semanticColors`, `isPresetColor`, `isSemanticColor`, `PresetColor`, `SemanticColor`, `Color` |
| [Semantic Scenes](#semantic-scenes) | `semanticScenes`, `semanticSceneLabels`, `semanticSceneIcons`, `SemanticScene` |
| [Spacing & Sizes](#spacing--sizes) | `sizes`, `fullSizes`, `getSpacingValue`, `Size`, `FullSize`, `Length`, `SizeableLength` |
| [Theme Tokens & CSS Variables](#theme-tokens--css-variables) | `globalCssVars`, `useThemeTokens` |
| [Query Metadata Symbols](#query-metadata-symbols) | `SYMBOL_PAGINATION`, `SYMBOL_SORT`, `OrderSpec`, `ParamsWithPagination`, `ParamsWithSort`, `QueryParams`, `PaginatedQueryParams` |
| [Miscellaneous Helpers](#miscellaneous-helpers) | `emitReloadPage`, `isFragment` |
| [Shared Types](#shared-types) | `Orientation`, `Position`, `PropsWithRef`, `GetProp`, `GetProps`, `GetRef`, `ActionConfirmMode` |

## Breakpoints & Responsive Values

### `breakpoints`

The framework's named viewport breakpoints — a frozen constant of `em`-based widths:

| Key | Value | Pixels (at the browser-default 16px font size) |
|-----|-------|------------------------------------------------|
| `xxs` | `'0em'` | 0px |
| `xs` | `'36em'` | 576px |
| `sm` | `'48em'` | 768px |
| `md` | `'62em'` | 992px |
| `lg` | `'75em'` | 1200px |
| `xl` | `'88em'` | 1408px |
| `xxl` | `'100em'` | 1600px |

`Breakpoint` is the key union: `'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'`.

These are the breakpoints behind every responsive prop in the library — [`Grid.Item`](./grid.md)'s `span`/`offset` maps and [`Crud`](./crud.md)'s per-breakpoint form `width` — and the values framework styles use in media queries:

```tsx
import { css } from '@emotion/react';
import { breakpoints } from '@vef-framework-react/components';

const toolbarStyle = css({
  display: 'flex',
  justifyContent: 'space-between',
  // Stack vertically below the 768px breakpoint
  [`@media (max-width: ${breakpoints.sm})`]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
});
```

To react to the current breakpoint in JS, pass this constant to `useBreakpoints` from `@vef-framework-react/hooks` (see [VEF Hooks](../reference/hooks/vef-hooks.md)) — that is exactly how `Crud` resolves its responsive form width.

### `resolveBreakpointValue`

```ts
function resolveBreakpointValue(
  breakpointValues: Partial<Record<Breakpoint, Length>>,
  breakpoint: Breakpoint
): Length | undefined
```

Resolves one value out of a partial per-breakpoint map — the lookup rule behind responsive props like `Crud`'s form `width`:

1. If the map defines the requested breakpoint, return that value.
2. Otherwise walk **down** and return the nearest smaller defined breakpoint (mobile-first fallback).
3. If nothing smaller is defined, walk **up** and return the nearest larger one.
4. Return `undefined` only when the map is empty.

```tsx
import { breakpoints, resolveBreakpointValue } from '@vef-framework-react/components';
import { useBreakpoints } from '@vef-framework-react/hooks';

// Sparse map — the gaps are filled by the fallback rule
const drawerWidths = { xs: '90vw', md: '60vw', xl: 720 };

function useDrawerWidth() {
  const { current } = useBreakpoints(breakpoints, { initialBreakpoint: 'xxs' });

  // 'sm' resolves to '90vw' (nearest smaller), 'xxl' resolves to 720
  return resolveBreakpointValue(drawerWidths, current ?? 'xxs');
}
```

## Colors

The color name constants accepted by theme configuration and color props, plus their type guards. All three arrays are readonly `as const` tuples.

| Export | Type | Description |
|--------|------|-------------|
| `presetColors` | `readonly PresetColor[]` | The 13 Ant Design palette names: `'blue'`, `'purple'`, `'cyan'`, `'green'`, `'magenta'`, `'pink'`, `'red'`, `'orange'`, `'yellow'`, `'volcano'`, `'geekblue'`, `'lime'`, `'gold'` (re-exported from antd) |
| `semanticColors` | `readonly SemanticColor[]` | The 5 semantic roles: `'primary'`, `'success'`, `'info'`, `'warning'`, `'error'` — `'primary'` plus the [semantic scenes](#semantic-scenes) |
| `colors` | `readonly Color[]` | All 18 names — `presetColors` followed by `semanticColors` |
| `isPresetColor` | `(color: string) => color is PresetColor` | `true` when the string is one of the 13 preset names |
| `isSemanticColor` | `(color: string) => color is SemanticColor` | `true` when the string is one of the 5 semantic roles |

The matching types are `PresetColor`, `SemanticColor`, and `Color` (= `PresetColor | SemanticColor`).

Preset names are resolved to concrete values by [`ConfigProvider`](./config-provider.md) — its `theme.colors` map accepts a preset name or any CSS color per semantic role, and each name also exists as a CSS variable (`--vef-blue`, `--vef-color-primary`, …; see [Theming](../guide/theming.md)). Use the arrays to enumerate options and the guards to validate free-form input:

```tsx
import { isPresetColor, presetColors } from '@vef-framework-react/components';

// Offer the full preset palette in a theme-settings select
const colorOptions = presetColors.map(color => ({ label: color, value: color }));

// Restrict a tenant-configured brand color to the preset palette,
// falling back to the framework default for anything unrecognized
function resolvePrimary(configured: string): string {
  return isPresetColor(configured) ? configured : 'blue';
}
```

## Semantic Scenes

The four feedback severities used across the framework — by [Notifications & Messages](./notifications.md), `Alert`, `Result`, and status-driven UI in general.

| Export | Type | Description |
|--------|------|-------------|
| `semanticScenes` | `readonly SemanticScene[]` | `'success'`, `'info'`, `'warning'`, `'error'` |
| `semanticSceneLabels` | `Record<SemanticScene, string>` | Default display titles: `'成功'` / `'提示'` / `'警告'` / `'错误'` |
| `semanticSceneIcons` | `Record<SemanticScene, ReactElement>` | Default icons from `@ant-design/icons`: `<CheckCircleOutlined />` / `<InfoCircleOutlined />` / `<ExclamationCircleOutlined />` / `<CloseCircleOutlined />` |

`SemanticScene` is the union `'success' | 'info' | 'warning' | 'error'`. Note that `semanticColors` = `'primary'` + `semanticScenes`: a scene is always a valid color name, but `'primary'` is not a scene.

`semanticSceneLabels` supplies the default `title` of every notification and alert/confirm dialog helper (see the [NotificationOptions defaults](./notifications.md#notificationoptions)). `semanticSceneIcons` is not consumed internally — it is exported so custom scene-driven UI can match the built-ins:

```tsx
import {
  semanticSceneIcons,
  semanticSceneLabels,
  type SemanticScene,
} from '@vef-framework-react/components';

// A status chip that stays visually consistent with framework feedback
function SceneChip({ scene }: { scene: SemanticScene }) {
  return (
    <span style={{ color: `var(--vef-color-${scene})` }}>
      {semanticSceneIcons[scene]} {semanticSceneLabels[scene]}
    </span>
  );
}
```

## Spacing & Sizes

### `sizes` and `fullSizes`

The named size scales used by component `size`-style props, as readonly `as const` tuples:

| Export | Values | Type union |
|--------|--------|------------|
| `sizes` | `'small'`, `'medium'`, `'large'` | `Size` |
| `fullSizes` | `'extra-small'`, `'small'`, `'medium'`, `'large'`, `'extra-large'` | `FullSize` |

`Size` is the three-step scale of control-density props (`ProTable`/`Table` `size`, `IconPicker`, `GenericSelect`, `CodeEditor`, …). `FullSize` extends it at both ends for spacing-style props — [`Grid`](./grid.md)'s `gap` maps the five names onto the theme's margin tokens (`marginXS` → `marginLG`), so named gaps track the active theme. Iterate the arrays when building settings UI (for example a density switcher offering every `Size`).

### `getSpacingValue`

```ts
function getSpacingValue(value: Length): string
```

Normalizes a `Length` (`string | number`) into a CSS length string: numbers become `px` (`16` → `'16px'`), strings pass through unchanged (`'2rem'` → `'2rem'`). This is how components like `Page`, `ScrollArea`, and `CodeEditor` interpret their `Length` props, so use it when forwarding such values into your own styles:

```tsx
import { getSpacingValue, type Length } from '@vef-framework-react/components';
import type { ReactNode } from 'react';

interface PanelProps {
  // Same contract as framework length props: 8 → '8px', '1rem' → '1rem'
  gap?: Length;
  children?: ReactNode;
}

function Panel({ gap = 8, children }: PanelProps) {
  return <div style={{ display: 'flex', gap: getSpacingValue(gap) }}>{children}</div>;
}
```

`SizeableLength<TSize>` combines both worlds: a prop typed `SizeableLength<Size>` accepts the named sizes of `TSize` *or* any free-form `Length` (with the names still suggested by autocompletion).

## Theme Tokens & CSS Variables

Two access paths to the same design language — see [Theming](../guide/theming.md) for the full decision guide on when to use which.

### `globalCssVars`

A frozen constant with one camelCase key per global VEF CSS custom property — 671 entries — whose values are `var(--vef-…)` reference strings, **not** resolved values:

```ts
globalCssVars.colorPrimary   // 'var(--vef-color-primary)'
globalCssVars.spacingMd      // 'var(--vef-spacing-md)'
globalCssVars.borderRadiusLg // 'var(--vef-border-radius-lg)'
```

It spans every variable family: semantic colors and their state ramps (`colorPrimary*`, `colorSuccess*`, …), preset palettes (`blue1`–`blue10`, …), extended Tailwind-style ramps (`colorBlue50`–`colorBlue950`, …), neutral surfaces (`colorText*`, `colorBg*`, `colorFill*`, `colorBorder*`), typography, spacing/padding/margin, radii, shadows, motion, sizing, z-index, breakpoints, and animation shorthands. The full generated catalog with default values is the [CSS Variables Reference](../reference/css-variables-reference.mdx).

Use it in Emotion or other JS object styles to avoid repeating raw `var()` strings — the values stay live CSS variables, so styles adapt to theme and dark-mode changes without re-rendering:

```tsx
import { css } from '@emotion/react';
import { globalCssVars } from '@vef-framework-react/components';

const cardStyle = css({
  padding: globalCssVars.spacingMd,
  borderRadius: globalCssVars.borderRadiusLg,
  border: `1px solid ${globalCssVars.colorBorderSecondary}`,
  backgroundColor: globalCssVars.colorBgContainer,
  boxShadow: globalCssVars.shadowSm,
});
```

The variables are emitted onto `:root` by [`ConfigProvider`](./config-provider.md) (already in place when the app is bootstrapped through the starter). `ConfigProvider`'s `theme.globalCssVars` option — a map for *injecting additional* `--vef-*` variables — is a different thing from this constant, which *reads* the built-in ones.

### `useThemeTokens`

```ts
function useThemeTokens(): GlobalToken
```

Returns Ant Design's resolved token object (`GlobalToken` from `antd`) for the currently active theme — concrete values like `colorPrimary: '#2b7fff'` or `margin: 16`, recomputed when the theme or dark mode changes. Must be called under [`ConfigProvider`](./config-provider.md).

Reach for it when a runtime consumer needs real values rather than `var()` strings — chart palettes, canvas drawing, third-party library options:

```tsx
import { useThemeTokens } from '@vef-framework-react/components';

function MetricsChart() {
  // Resolved hex values, safe to hand to ECharts
  const { colorPrimary, colorTextSecondary } = useThemeTokens();

  return <Chart option={{ color: [colorPrimary, colorTextSecondary] }} />;
}
```

Its sibling `useIsDarkMode()` is documented on the [`ConfigProvider`](./config-provider.md) page.

## Query Metadata Symbols

### `SYMBOL_PAGINATION` and `SYMBOL_SORT`

```ts
const SYMBOL_PAGINATION: unique symbol; // Symbol.for('__vef_pagination')
const SYMBOL_SORT: unique symbol;       // Symbol.for('__vef_sort')
```

Well-known symbols under which [`ProTable`](./pro-table.md) and [`Crud`](./crud.md) attach pagination and sort metadata to the params object passed to your `queryFn` (and spread into the TanStack Query key). Symbol keys cannot collide with real search fields, and `JSON.stringify` drops them — so the metadata never leaks into a request body serialized from the same object. Both are registered via `Symbol.for`, so identity holds even across duplicated module instances.

The attached value shapes:

| Symbol | Value type | Shape |
|--------|------------|-------|
| `SYMBOL_PAGINATION` | `PaginationParams` (from `@vef-framework-react/core`) | `{ page?: number; size?: number }` — 1-based page, defaults `page: 1` / `size: 15` |
| `SYMBOL_SORT` | `OrderSpec[]` | Each `OrderSpec` is `{ column: string; direction: 'asc' \| 'desc' }` |

The exported param types describe both directions of that contract:

| Type | Definition | Description |
|------|------------|-------------|
| `ParamsWithPagination<TParams>` | `TParams & { [SYMBOL_PAGINATION]?: PaginationParams }` | Params carrying pagination metadata |
| `ParamsWithSort<TParams>` | `TParams & { [SYMBOL_SORT]?: OrderSpec[] }` | Params carrying sort metadata |
| `QueryParams<TSearch, TParams = never>` | `ParamsWithSort<TSearch & If<IsNever<TParams>, EmptyObject, TParams>>` | What a non-paginated `Crud` `queryFn` receives — the `never` default is guarded so omitting `TParams` leaves plain `TSearch` intact |
| `PaginatedQueryParams<TSearch, TParams = never>` | `ParamsWithPagination<ParamsWithSort<TSearch & If<IsNever<TParams>, EmptyObject, TParams>>>` | What a paginated `Crud`/`ProTable` `queryFn` receives — same `never` guard as `QueryParams` |

A typical `queryFn` splits the symbols off before building the request:

```ts
import {
  SYMBOL_PAGINATION,
  SYMBOL_SORT,
  type PaginatedQueryParams,
} from '@vef-framework-react/components';

interface UserSearch {
  name?: string;
  status?: string;
}

async function findUserPage(params: PaginatedQueryParams<UserSearch>) {
  // Destructure the symbol-keyed metadata away from the plain search fields
  const { [SYMBOL_PAGINATION]: pagination, [SYMBOL_SORT]: sort, ...search } = params;

  return post('/api/users/page', {
    ...search,
    page: pagination?.page ?? 1,
    pageSize: pagination?.size ?? 15,
    orderBy: sort?.map(({ column, direction }) => `${column} ${direction}`),
  });
}
```

API layers built on the framework RPC convention (the approval / cron / integration engines, the starter's `extractQueryParams`) ship ready-made splitters following this exact pattern.

## Miscellaneous Helpers

### `emitReloadPage`

```ts
function emitReloadPage(key: string): void
```

Broadcasts a page-reload event on an internal event bus. Every mounted [`Page`](./page.md) listens and bumps its internal render key, remounting its entire subtree — local component state resets, the entrance animation replays, and mount-time queries refetch. This is what the starter layout's tab-bar refresh button calls, passing the route's full path as `key`.

Note that the current implementation remounts every mounted `Page` regardless of `key` — still pass a meaningful key (the route path by convention), as it documents intent and keeps callers forward-compatible. There is no exported subscribe counterpart; the listening side is internal to `Page`.

```tsx
import { emitReloadPage } from '@vef-framework-react/components';

// After switching tenant, remount the page content with fresh state
async function handleTenantSwitch(tenantId: string, routeFullPath: string) {
  await switchTenant(tenantId);
  emitReloadPage(routeFullPath);
}
```

### `isFragment`

```ts
function isFragment(node: ReactNode): node is ReactElement<FragmentProps>
```

Type guard returning `true` when a node is a React `<Fragment>` element (including the `<>…</>` shorthand) — `isValidElement(node) && node.type === Fragment`. After narrowing, `node.props.children` is typed and accessible, which is the usual reason to need it: unwrapping fragment children before decorating each one.

```tsx
import { isFragment, Keyboard } from '@vef-framework-react/components';
import { Children, type ReactNode } from 'react';

// Accepts <>⌘K</> as well as a single key node
function ShortcutHint({ keys }: { keys: ReactNode }) {
  const nodes = isFragment(keys) ? Children.toArray(keys.props.children) : [keys];

  return nodes.map((node, index) => <Keyboard key={index}>{node}</Keyboard>);
}
```

## Shared Types

Small foundation types used throughout the component props, exported for application code:

| Export | Type | Description |
|--------|------|-------------|
| `Length` | `string \| number` | A CSS length — numbers mean pixels (see [`getSpacingValue`](#getspacingvalue)) |
| `SizeableLength<TSize>` | `LiteralUnion<TSize, Length>` | A named size from `TSize` or any free-form `Length` |
| `Orientation` | `'horizontal' \| 'vertical'` | Layout direction — e.g. the starter's menu layout mode is `Orientation \| 'mixed'` |
| `Position` | `{ x: number; y: number }` | A 2D coordinate — e.g. [`ScrollArea`](./scroll-area.md)'s scroll offset callbacks |
| `PropsWithRef<TRef, TProps>` | `TProps & { ref?: Ref<TRef> }` | Adds a typed `ref` prop (React 19 style, no `forwardRef`) |
| `GetProp`, `GetProps`, `GetRef` | antd re-exports | Extract a single prop type, the full props type, or the ref instance type of a component |
| `ActionConfirmMode` | `'popover' \| 'dialog'` | Confirmation UI style behind [`ActionButton`](./action-button.md)'s `confirmMode` prop |

Types that belong to a specific feature are documented with it: `Breakpoint`, `Color`/`PresetColor`/`SemanticColor`, `SemanticScene`, `Size`/`FullSize`, and `OrderSpec` in the sections above; `ActionButtonConfig` on [`ActionGroup`](./action-group.md); `NotificationOptions`/`AlertOptions`/`ConfirmOptions` on [Notifications & Messages](./notifications.md); the form types on [`Form`](./form.md).
