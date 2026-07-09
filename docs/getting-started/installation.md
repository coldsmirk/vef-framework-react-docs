---
title: Installation
description: Install VEF's packages, configure Vite and TypeScript, and set up the recommended npm scripts.
---

# Installation

To use VEF, four categories of dependencies are usually involved:

1. React runtime
2. VEF core packages
3. Routing through `@tanstack/react-router`
4. Build and lint tooling through `@vef-framework-react/dev`

## Runtime Requirements

The repository currently aligns with the following versions:

| Item | Recommended |
| --- | --- |
| Node.js | `>= 22` |
| pnpm | `11.x` |
| React | `19.x` |
| TypeScript | `>= 5.9` (the repo currently builds with `6.x`) |

## Minimal Installation

For a typical admin-style application, the following packages are commonly installed:

```bash
pnpm add react react-dom @tanstack/react-router
pnpm add @vef-framework-react/core @vef-framework-react/components @vef-framework-react/hooks @vef-framework-react/shared @vef-framework-react/starter
pnpm add -D vite typescript @types/react @types/react-dom @vef-framework-react/dev eslint stylelint lint-staged husky @commitlint/cli
```

If the project also embeds one of the visual editors, add it on top of the base install:

```bash
pnpm add @vef-framework-react/form-editor
pnpm add @vef-framework-react/approval-flow-editor
pnpm add @vef-framework-react/approval-form-bridge
```

## Which Packages Are Usually Needed

| Scenario | Packages |
| --- | --- |
| Only requests and query | `@vef-framework-react/core` |
| Only components and form wrappers | `@vef-framework-react/components` |
| Full admin-style application skeleton | `@vef-framework-react/starter` + `components` + `core` + `hooks` + `shared` |
| Shared project tooling | `@vef-framework-react/dev` |
| Visual form designer integration | `@vef-framework-react/form-editor` |
| Approval flow designer integration | `@vef-framework-react/approval-flow-editor` |
| Projecting a form-editor schema into an approval flow | `@vef-framework-react/approval-form-bridge` |

In most applications, `starter` is used together with `components`, `core`, `hooks`, and `shared`. The three editor packages are opt-in and independent of each other — add only the ones the application actually embeds.

## Example `package.json`

The following dependency set is close to what a real project would look like:

```json
{
  "dependencies": {
    "@tanstack/react-router": "^1.170.17",
    "@vef-framework-react/components": "^2.9.0",
    "@vef-framework-react/core": "^2.9.0",
    "@vef-framework-react/hooks": "^2.9.0",
    "@vef-framework-react/shared": "^2.9.0",
    "@vef-framework-react/starter": "^2.9.0",
    "react": "^19.2.7",
    "react-dom": "^19.2.7"
  },
  "devDependencies": {
    "@vef-framework-react/dev": "^2.9.0",
    "@types/react": "^19.2.17",
    "@types/react-dom": "^19.2.3",
    "typescript": "^6.0.3",
    "vite": "^8.1.3"
  }
}
```

## Required Vite Configuration

VEF packages expose source or build outputs through custom export conditions, so `resolve.conditions` matters.

The following setup works well in application projects:

```ts title="vite.config.ts"
import { defineViteConfig } from "@vef-framework-react/dev";

export default defineViteConfig({
  react: {
    useCompiler: true
  }
});
```

## Basic TypeScript Configuration

If you use the `tsconfig` exported by `@vef-framework-react/dev`, it can be reused directly.  
If you prefer to write your own config, these settings should at least be aligned:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "types": ["vite/client", "@vef-framework-react/dev/types"]
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
