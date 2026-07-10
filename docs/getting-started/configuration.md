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

The Vite configuration exported by `@vef-framework-react/dev` prioritizes the `env/` directory and recognizes two prefixes:

| Prefix | Purpose |
| --- | --- |
| `VEF_APP_` | Injects application-level config |
| `VEF_BUILD_` | Controls build and dev-server behavior |

Common variables are typically used like this:

| Variable | Purpose |
| --- | --- |
| `VEF_APP_NAME` | Application name used for injected constants |
| `VEF_BUILD_BASE_PUBLIC_PATH` | Build base path |
| `VEF_BUILD_OUTPUT_DIR` | Output directory |
| `VEF_BUILD_SERVER_PORT` | Local dev-server port |

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
