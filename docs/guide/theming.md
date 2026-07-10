---
title: Theming and Styling
description: How to choose between raw CSS variables, globalCssVars, and useThemeTokens when styling a VEF page.
---

# Theming and Styling

VEF theme capabilities are primarily provided by `@vef-framework-react/components`, and they are already wired when the application is bootstrapped through `createApp()`.

:::tip
If your app is bootstrapped through `starter.createApp().render()`, the CSS custom properties are already injected onto `:root`. If you mount the component layer manually, keep `@vef-framework-react/components` [`ConfigProvider`](../components/config-provider.md) in place so the global variables are emitted.
:::

## Common APIs

- `globalCssVars`
- `useThemeTokens`
- `useIsDarkMode`
- `colors`
- `semanticColors`
- `semanticScenes`

## Choosing the Right Entry Point

VEF exposes the same design language through three different access paths, and the right one depends on where the value is consumed:

- Use raw CSS variables such as `var(--vef-color-primary)` in CSS Modules, SCSS, third-party stylesheet overrides, or MDX snippets.
- Use `globalCssVars` in Emotion and other JS object styles when you want the same token without repeating string literals.
- Use `useThemeTokens()` when a value must be consumed in JavaScript logic or passed to a library that expects a resolved color or size value at render time.

```mermaid
flowchart TD
  A[Need a design value] --> B{Where will it be consumed?}
  B -->|CSS or SCSS| C["Use var(--vef-...)"]
  B -->|Emotion or object style| D["Use globalCssVars.*"]
  B -->|JS logic or third-party runtime config| E["Use useThemeTokens()"]
  C --> F[Framework-managed custom property]
  D --> F
  E --> G[Resolved current theme token]
```

The important distinction is that `globalCssVars` still returns CSS variable strings, while `useThemeTokens()` returns resolved theme values.

### Recommended Usage Patterns

| Need | Prefer | Why |
| --- | --- | --- |
| Page spacing, card padding, and section rhythm | `--vef-spacing-*`, `--vef-padding-*`, `--vef-margin-*` | Keeps layout rhythm consistent with framework components. |
| Primary actions, links, and selected states | `--vef-color-primary`, `--vef-color-primary-hover`, `--vef-color-primary-active`, `--vef-color-primary-text` | Stays aligned with theme overrides and dark-mode behavior. |
| Neutral panels, cards, and page chrome | `--vef-color-bg-container`, `--vef-color-bg-layout`, `--vef-color-border`, `--vef-shadow-*`, `--vef-border-radius*` | Matches the framework shell and default component surfaces. |
| Muted, secondary, and descriptive text | `--vef-color-text`, `--vef-color-text-secondary`, `--vef-color-text-tertiary`, `--vef-color-text-description` | Avoids ad-hoc opacity tuning and keeps contrast consistent. |
| Validation and status messaging | `--vef-color-success-*`, `--vef-color-warning-*`, `--vef-color-error-*`, `--vef-color-info-*` | Gives you matching background, border, and text states out of the box. |
| Charts, illustrations, and multicolor accents | `--vef-color-blue-50..950`, `--vef-color-emerald-50..950`, or the preset `--vef-blue-1..10` style families | Provides broader ramps than semantic status tokens. |
| CSS-in-JS styles written in TS/JS | `globalCssVars.*` | Avoids repeating raw `var(--vef-...)` strings in Emotion objects. |

## Raw CSS Variable Usage

Use raw variables when your style lives directly in CSS, SCSS, or a CSS Module:

```scss
.configItem {
  display: flex;
  gap: var(--vef-spacing-xl);
  padding: var(--vef-spacing-lg) var(--vef-spacing-xl);
  background: var(--vef-color-bg-container);
  border: 1px solid var(--vef-color-border-secondary);
  border-radius: var(--vef-border-radius-lg);
  box-shadow: var(--vef-shadow-sm);
}

.configItem:hover {
  background: var(--vef-color-fill-quaternary);
}
```

This is the best default for CSS Modules used by page routes, SCSS files that restyle framework components, and CSS authored for third-party widgets that do not know about `globalCssVars`.

## `globalCssVars` in Emotion or Object Styles

`globalCssVars` is the JS/TS alias layer exported by `@vef-framework-react/components`. It maps CSS variable names into camelCase fields, for example:

| CSS custom property | JS alias |
| --- | --- |
| `var(--vef-color-primary)` | `globalCssVars.colorPrimary` |
| `var(--vef-spacing-md)` | `globalCssVars.spacingMd` |
| `var(--vef-border-radius-lg)` | `globalCssVars.borderRadiusLg` |
| `var(--vef-font-family-code)` | `globalCssVars.fontFamilyCode` |

```tsx
import { css } from "@emotion/react";
import { globalCssVars } from "@vef-framework-react/components";

const panelStyle = css({
  padding: globalCssVars.spacingMd,
  borderRadius: globalCssVars.borderRadiusLg,
  border: `1px solid ${globalCssVars.colorBorderSecondary}`,
  backgroundColor: globalCssVars.colorBgContainer,
  boxShadow: globalCssVars.shadowSm
});
```

Use this when your style already lives in TS or JS. It keeps the token name consistent with the framework while avoiding raw string repetition.

## `useThemeTokens()` for Runtime Values

`useThemeTokens()` returns the resolved Ant Design token object for the current theme. Reach for it when a runtime library needs concrete values rather than CSS variable strings:

```tsx
import { useThemeTokens } from "@vef-framework-react/components";

export function MetricsChart() {
  const { colorPrimary, colorTextSecondary } = useThemeTokens();

  return (
    <MyChart
      palette={[colorPrimary, colorTextSecondary]}
    />
  );
}
```

Typical cases: dynamic coloring, icon and illustration colors, custom card backgrounds, and chart or canvas configuration that needs resolved runtime values.

## Dark Mode Detection

```tsx
import { useIsDarkMode } from "@vef-framework-react/components";

const isDarkMode = useIsDarkMode();
```

Use this when a page genuinely needs different gradients, shadows, or illustration treatment in dark mode. Many common color variables already adapt automatically, so reach for `useIsDarkMode()` only when a variable-based approach cannot express the difference.

## Naming Model

The variable catalog is easier to navigate once the families are clear:

- `--vef-color-primary-*`, `--vef-color-success-*`, and similar semantic ramps are the first choice for meaning-driven styling.
- `--vef-color-blue-*`, `--vef-color-emerald-*`, and other extended ramps are useful when you need a named color family rather than a semantic intent.
- `--vef-blue-1..10`, `--vef-purple-1..10`, and similar preset scales follow the Ant Design-style palette numbering.
- `--vef-color-text*`, `--vef-color-bg*`, `--vef-color-fill*`, and `--vef-color-border*` are neutral UI surface tokens.
- `--vef-spacing-*`, `--vef-padding-*`, `--vef-margin-*`, `--vef-border-radius*`, and `--vef-shadow-*` are layout and elevation primitives.

:::info
Component-scoped override variables such as `--vef-card-body-padding` are still valid when a component documents them, but they are not part of the shared global token catalog.
:::

## Why Prefer Framework Tokens

Semantic colors and CSS variables are generally preferable to hard-coded color values because theme switching requires fewer overrides, the visual language stays aligned with the component system, later theme changes cost less, and page styles stay consistent with framework components.

## Practical Guidance

At the page layer, a good default is:

- express layout through components
- express visual values through tokens or semantic colors
- use large blocks of hard-coded styles only when a page genuinely needs them
- prefer semantic tokens first, preset palettes second, hard-coded values last

For the complete, generated CSS custom property catalog — every variable name and its default value — see [CSS Variables Reference](../reference/css-variables-reference.mdx).
