---
title: Dev Package
description: defineViteConfig, defineEslintConfig, defineStylelintConfig, and defineCommitlintConfig signatures.
---

# Dev Package

`@vef-framework-react/dev` provides shared tooling configuration for VEF-based projects. It covers four areas:

1. Vite build configuration
2. ESLint rules
3. Stylelint rules
4. Commitlint rules

Using this package ensures all projects in a VEF ecosystem share consistent build behavior, code style, and commit conventions without duplicating configuration files.

## `defineViteConfig`

Creates a Vite configuration with VEF defaults.

```ts
// vite.config.ts
import { defineViteConfig } from "@vef-framework-react/dev";

export default defineViteConfig({
  proxies: {
    "/api": "http://localhost:8080"
  },
  routerHistory: "browser"
});
```

`DefineConfigOptions` fields:

| Option | Type | Description |
| --- | --- | --- |
| `resolve` | `Pick<UserConfig["resolve"], "alias" \| "conditions">` | Extra Vite resolve config, merged with the framework's own |
| `plugins` | `PluginOption[]` | Additional Vite plugins, prepended to the framework's plugin list |
| `autoEnhancePlugins` | `AutoEnhancePlugin[]` | Extra auto-enhance plugins (JSX transforms applied to specific component patterns) |
| `routerHistory` | `"hash" \| "browser"` | TanStack Router history mode (default: `"browser"`) |
| `react` | `ReactPluginOptions` | Options forwarded to the React plugin |
| `proxies` | `Record<string, string \| ProxyOptions>` | Dev-server proxy table |

## `defineEslintConfig`

Creates an ESLint flat config with VEF defaults.

```ts
// eslint.config.ts
import { defineEslintConfig } from "@vef-framework-react/dev";

export default defineEslintConfig();
```

With overrides:

```ts
export default defineEslintConfig({
  ignores: ["scripts/**"]
});
```

Included rule sets:

- TypeScript ESLint recommended
- React and React Hooks rules
- Import ordering rules
- Accessibility rules

## `defineStylelintConfig`

Creates a Stylelint configuration with VEF defaults.

```ts
// stylelint.config.ts
import { defineStylelintConfig } from "@vef-framework-react/dev";

export default defineStylelintConfig();
```

With overrides:

```ts
export default defineStylelintConfig({
  scss: true
});
```

The only supported field is `scss?: boolean` — the framework already defaults SCSS on; pass `{ scss: false }` for a plain-CSS project.

## `defineCommitlintConfig`

Creates a Commitlint configuration enforcing Conventional Commits.

```ts
// commitlint.config.ts
import { defineCommitlintConfig } from "@vef-framework-react/dev";

export default defineCommitlintConfig();
```

Supported commit types:

| Type | Description |
| --- | --- |
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code style changes (no logic change) |
| `refactor` | Code refactoring |
| `perf` | Performance improvements |
| `test` | Adding or updating tests |
| `build` | Build system changes |
| `ci` | CI configuration changes |
| `chore` | Other maintenance tasks |
| `revert` | Revert a previous commit |

## Typical Project Setup

A standard VEF project uses all four configuration helpers:

```
vite.config.ts          → defineViteConfig
eslint.config.ts        → defineEslintConfig
stylelint.config.ts     → defineStylelintConfig
commitlint.config.ts    → defineCommitlintConfig
```

This keeps the project root clean and ensures updates to shared tooling rules propagate automatically when `@vef-framework-react/dev` is upgraded.
