---
sidebar_position: 1
title: Installation
---

# Installation

To use VEF, four categories of dependencies are usually involved:

1. React runtime
2. VEF core packages
3. Routing through `@tanstack/react-router`
4. Build and lint tooling through `@vef-framework/dev`

## Runtime Requirements

The repository currently aligns with the following versions:

| Item | Recommended |
| --- | --- |
| Node.js | `>= 22` |
| pnpm | `10.x` |
| React | `19.x` |
| TypeScript | `5.9+` or newer |

## Minimal Installation

For a typical admin-style application, the following packages are commonly installed:

```bash
pnpm add react react-dom @tanstack/react-router
pnpm add @vef-framework/core @vef-framework/components @vef-framework/hooks @vef-framework/shared @vef-framework/starter
pnpm add -D vite typescript @types/react @types/react-dom @vef-framework/dev eslint stylelint lint-staged husky @commitlint/cli
```

If the project also needs the approval flow editor:

```bash
pnpm add @vef-framework/approval-flow-editor
```

## Which Packages Are Usually Needed

| Scenario | Packages |
| --- | --- |
| Only requests and query | `@vef-framework/core` |
| Only components and form wrappers | `@vef-framework/components` |
| Full admin-style application skeleton | `@vef-framework/starter` + `components` + `core` + `hooks` + `shared` |
| Shared project tooling | `@vef-framework/dev` |
| Approval flow designer integration | `@vef-framework/approval-flow-editor` |

In most applications, `starter` is used together with `components`, `core`, `hooks`, and `shared`.

## Example `package.json`

The following dependency set is close to what a real project would look like:

```json
{
  "dependencies": {
    "@tanstack/react-router": "^1.168.3",
    "@vef-framework/components": "^2",
    "@vef-framework/core": "^2",
    "@vef-framework/hooks": "^2",
    "@vef-framework/shared": "^2",
    "@vef-framework/starter": "^2",
    "react": "^19.2.4",
    "react-dom": "^19.2.4"
  },
  "devDependencies": {
    "@vef-framework/dev": "^2",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "typescript": "^6.0.2",
    "vite": "^8.0.2"
  }
}
```

## Required Vite Configuration

VEF packages expose source or build outputs through custom export conditions, so `resolve.conditions` matters.

The following setup works well in application projects:

```ts title="vite.config.ts"
import { defineViteConfig } from "@vef-framework/dev";

export default defineViteConfig({
  react: {
    useCompiler: true
  }
});
```

## Basic TypeScript Configuration

If you use the `tsconfig` exported by `@vef-framework/dev`, it can be reused directly.  
If you prefer to write your own config, these settings should at least be aligned:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "types": ["vite/client", "@vef-framework/dev/types"]
  }
}
```

## Recommended Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit"
  }
}
```

After installation, the next page to read is [Quick Start](./quick-start.md).
