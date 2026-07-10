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

## Environment Variables

`defineViteConfig` reads `.env` files from the `env/` directory (not the project root) and recognizes two prefixes, both exposed on `import.meta.env` in client code:

- `VEF_BUILD_*` — build and dev-server settings, resolved once at build time.
- `VEF_APP_*` — application configuration, injected into the running app.

Mode-specific file resolution (`env/.env`, `env/.env.development`, `env/.env.production`, shell variables) follows standard Vite behavior — see [Vite's env documentation](https://vite.dev/guide/env-and-mode).

### Build-time: `VEF_BUILD_*`

| Variable | Type | Default | Controls |
| --- | --- | --- | --- |
| `VEF_BUILD_BASE_PUBLIC_PATH` | `string` | `/` (Vite default) | Public base path (Vite `base`) that assets and `app.config.js` are served from |
| `VEF_BUILD_OUTPUT_DIR` | `string` | `dist` | Build output directory (`build.outDir`); also where `app.config.js` is emitted |
| `VEF_BUILD_SERVER_PORT` | `number` | `3833` | Dev-server port (`strictPort` is enabled, so the port must be free) |

### Runtime-injected: `VEF_APP_*`

Every variable with the `VEF_APP_` prefix is collected into the frozen `__VEF_APP_CONFIG__` global:

- In development, the object is built inline from `import.meta.env`.
- In production builds, the values from `env/.env` and `env/.env.production` are written to `<outputDir>/app.config.js`, loaded by a script tag injected into `index.html`. Editing that file after the build changes the runtime configuration without rebuilding.

`__VEF_APP_CONFIG__` keys keep their full `VEF_APP_*` names; the scaffolded `getAppConfig` helper strips the prefix and camel-cases the rest (`VEF_APP_API_BASE_URL` → `apiBaseUrl`).

The prefix is open-ended — any `VEF_APP_*` variable you add is picked up. These are the ones the framework itself consumes:

| Variable | Type | Default (scaffold) | Controls |
| --- | --- | --- | --- |
| `VEF_APP_NAME` | `string` | `vef-app` | Application name shown in the built-in HTML shell (loading screen and `<noscript>` notice) |
| `VEF_APP_TITLE` | `string` | `VEF App` | Document `<title>` |
| `VEF_APP_FAVICON` | `string` | `/favicon.svg` | Favicon URL in the built-in HTML template |
| `VEF_APP_VERSION` | `string` | `0.0.0` | `<meta name="app-version">` and the loading-screen version; polled by the starter's `setupAppVersionNotification` (see [Application Shell](../starter/application-shell.md)) to detect new deployments |
| `VEF_APP_CHANGELOG` | `string` | `/changelog.json` | `<meta name="app-changelog">` — URL of the changelog JSON the version notification fetches |
| `VEF_APP_API_BASE_URL` | `string` | `http://127.0.0.1:8080` (dev) / `/` (prod) | API base URL; the scaffolded API client reads it via `getAppConfig("apiBaseUrl")` |

`%VEF_APP_*%` placeholders in the built-in `index.html` template are substituted by Vite's HTML env replacement, so every variable above is also resolved into the generated HTML at build time.

Note that `VEF_APP_VERSION` — the version advertised to running clients — is independent of the `__VEF_APP_VERSION__` compile-time constant, which always comes from the `version` field in `package.json`.

`vef init` seeds `env/.env` with `VEF_APP_NAME` and `VEF_APP_TITLE`, and `env/.env.development` with `VEF_APP_API_BASE_URL`, from your scaffolding answers.

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
