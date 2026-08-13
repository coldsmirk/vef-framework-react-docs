---
title: Configuration
description: Set up Vite, ESLint, Stylelint, and Commitlint with the shared @vef-framework-react/dev configuration.
---

# Configuration

If you use `@vef-framework-react/dev`, the project tooling layer does not need to be assembled from scratch.  
VEF already wraps common frontend tooling such as Vite, ESLint, Stylelint, and Commitlint as reusable exports.

## Vite Configuration

The most common setup looks like this:

```ts title="vite.config.ts"
import { defineViteConfig } from "@vef-framework-react/dev";

export default defineViteConfig({
  react: {
    useCompiler: true
  }
});
```

The full option lists live in the reference section — [Bootstrap & Routing](../reference/starter/bootstrap-and-routing.md) for `createApp()`, `createApiClient()`, `createRouter()`, and the route helpers, and [Dev Package](../reference/dev/overview.md) for `defineViteConfig()`. This page only covers the narrative of setting the build up.

## ESLint Configuration

```ts title="eslint.config.ts"
import { defineEslintConfig } from "@vef-framework-react/dev";

export default defineEslintConfig();
```

## Stylelint Configuration

```js title="stylelint.config.js"
import { defineStylelintConfig } from "@vef-framework-react/dev";

export default defineStylelintConfig();
```

## Commitlint Configuration

```ts title="commitlint.config.ts"
import { defineCommitlintConfig } from "@vef-framework-react/dev";

export default defineCommitlintConfig();
```

## Environment Variable Conventions

The Vite configuration exported by `@vef-framework-react/dev` reads `.env` files from the `env/` directory (not the project root) and recognizes two prefixes:

| Prefix | Purpose |
| --- | --- |
| `VEF_APP_` | Injects application-level config into the running app |
| `VEF_BUILD_` | Controls build and dev-server behavior, resolved once at build time |

Common variables are typically used like this:

| Variable | Type | Default | Purpose |
| --- | --- | --- | --- |
| `VEF_APP_NAME` | `string` | `APP` | Application name shown in the built-in HTML shell; also names the production config global |
| `VEF_BUILD_BASE_PUBLIC_PATH` | `string` | `/` | Public base path assets and `app.config.js` are served from |
| `VEF_BUILD_OUTPUT_DIR` | `string` | `dist` | Build output directory |
| `VEF_BUILD_SERVER_PORT` | `number` | `3833` | Local dev-server port (`strictPort` is on, so the port must be free) |

The full variable catalog — including `VEF_APP_TITLE`, `VEF_APP_FAVICON`, `VEF_APP_VERSION`, `VEF_APP_CHANGELOG`, and `VEF_APP_API_BASE_URL` — lives in [Dev Package](../reference/dev/overview.md#environment-variables).

## Injected Globals

`defineViteConfig` injects three compile-time globals, declared for TypeScript by `@vef-framework-react/dev/types` (already included in the recommended `tsconfig`):

| Global | Type | Value | Purpose |
| --- | --- | --- | --- |
| `__VEF_FRAMEWORK_VERSION__` | `string` | Fixed by the dev package (currently `1.0.0`) | Identifies the injected config layer's version |
| `__VEF_APP_VERSION__` | `string` | The `version` field of the project's `package.json` at build time | The compile-time app version; independent of the runtime-advertised `VEF_APP_VERSION` variable |
| `__VEF_APP_CONFIG__` | `Readonly<Record<string, string>>` | All `VEF_APP_*` variables, keyed by their full names | The runtime app configuration |

`__VEF_APP_CONFIG__` behaves differently per mode: in development it is built inline from `import.meta.env`; in a production build it reads `window.__PRODUCTION__VEF_<NAME>__CONF__`, the global assigned by the generated `<outputDir>/app.config.js`. `<NAME>` is `VEF_APP_NAME` converted to `CONSTANT_CASE` and prefixed with `VEF_`; when `VEF_APP_NAME` is unset it defaults to `APP`, giving `__PRODUCTION__VEF_APP__CONF__`. Editing `app.config.js` after a build changes the runtime configuration without rebuilding — see [Dev Package](../reference/dev/overview.md#runtime-injected-vef_app_) for the full mechanics.

## Common Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit",
    "lint": "eslint \"**/*.{ts,tsx,js,jsx,json,md,mdx}\" --fix"
  }
}
```

## Validation Checklist

1. `pnpm dev` starts successfully.
2. `@vef-framework-react/*` packages resolve correctly.
3. Emotion styles and component styles load correctly.
4. ESLint and Stylelint can run locally.

Next: [Project Structure](./project-structure.md).
