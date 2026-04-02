---
sidebar_position: 2
title: Theming and Styling
---

# Theming and Styling

VEF theme capabilities are primarily provided by `@vef-framework-react/components`, and they are already wired when the application is bootstrapped through `createApp()`.

For the complete CSS custom property catalog used in CSS Modules, SCSS, and CSS-in-JS, see [CSS Variables Reference](../reference/css-variables-reference).

## Common APIs

- `globalCssVars`
- `useThemeTokens`
- `useIsDarkMode`
- `colors`
- `semanticColors`
- `semanticScenes`

## Reading Theme Tokens in Page Code

```tsx
import { useThemeTokens } from "@vef-framework-react/components";

const { colorPrimary } = useThemeTokens();
```

Typical cases:

- dynamic coloring
- icon and illustration colors
- custom card backgrounds
- chart or canvas configuration that needs resolved runtime values

## Choosing Between CSS Variables and Theme Hooks

| Need | Recommended API |
| --- | --- |
| CSS Modules, SCSS, or stylesheet overrides | `var(--vef-...)` |
| Emotion or object styles in TS/JS | `globalCssVars` |
| Runtime JS values for charts, canvas, or conditional logic | `useThemeTokens()` |

The important distinction is that `globalCssVars` still returns CSS variable strings, while `useThemeTokens()` returns resolved theme values.

## Dark Mode Detection

```tsx
import { useIsDarkMode } from "@vef-framework-react/components";

const isDarkMode = useIsDarkMode();
```

Use this when a page genuinely needs different gradients, shadows, or illustration treatment in dark mode.  
Many common color variables already adapt automatically.

## Why Prefer Framework Tokens

Semantic colors and CSS variables are generally preferable to hard-coded color values because:

- theme switching requires fewer overrides
- the visual language stays aligned with the component system
- later theme changes cost less
- page styles stay consistent with framework components

## Practical Guidance

At the page layer, a good default is:

- express layout through components
- express visual values through tokens or semantic colors
- use large blocks of hard-coded styles only when a page genuinely needs them
- prefer semantic tokens first, preset palettes second, hard-coded values last
