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

## Optional Engine Packages

Three packages ship drop-in management pages for the VEF backend engines — each exports finished page components (plus their permission catalogs) that mount directly onto application routes. See [Engines](../engines/overview.md).

| Package | One-liner |
| --- | --- |
| `@vef-framework-react/approval` | Approval engine pages: flow designer, task center, instance views, admin, categories, delegations |
| `@vef-framework-react/integration` | Integration engine pages: systems, adapters, contracts, routes, and a console workbench |
| `@vef-framework-react/cron` | Durable cron scheduling pages: schedules and run history |

```bash
pnpm add @vef-framework-react/approval
pnpm add @vef-framework-react/integration
pnpm add @vef-framework-react/cron
```

Version note: the engine packages (`approval`, `integration`, `cron`) are versioned together with the framework release, so install them at the same version as the core packages. See [Release Notes](../reference/release-notes.md) for the exact published versions.

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
| Approval engine management pages | `@vef-framework-react/approval` |
| Integration engine management pages | `@vef-framework-react/integration` |
| Cron schedule management pages | `@vef-framework-react/cron` |

In most applications, `starter` is used together with `components`, `core`, `hooks`, and `shared`. The editor and engine packages are opt-in and independent of each other — add only the ones the application actually embeds.

## Example `package.json`

The following dependency set is close to what a real project would look like:

```json
{
  "dependencies": {
    "@tanstack/react-router": "^1.170.17",
    "@vef-framework-react/components": "^2.27.0",
    "@vef-framework-react/core": "^2.27.0",
    "@vef-framework-react/hooks": "^2.27.0",
    "@vef-framework-react/shared": "^2.27.0",
    "@vef-framework-react/starter": "^2.27.0",
    "react": "^19.2.7",
    "react-dom": "^19.2.7"
  },
  "devDependencies": {
    "@vef-framework-react/dev": "^2.27.0",
    "@types/react": "^19.2.17",
    "@types/react-dom": "^19.2.3",
    "typescript": "^6.0.3",
    "vite": "^8.1.3"
  }
}
```

## Peer Requirements

Verified against each package manifest at v2.22.0:

- `starter` declares peers on `@tanstack/react-router >=1`, `react` / `react-dom >=19`, and the sibling `components` / `core` / `hooks` / `shared` packages `>=2` — the minimal install above satisfies all of them.
- `dev` declares peers on `vite ^8.0.0`, `eslint ^10.0.0`, `stylelint ^17.0.0`, `@commitlint/cli ^21.0.0`, `husky ^9.1.7`, and `lint-staged ^17.0.0`, which is why they appear in the dev-dependency install command.
- Every runtime package (`core`, `components`, `hooks`, the editors, the engine packages) peers only on `react >=19`.
- `antd` (`^6.5.0`) is a regular dependency of `components`, not a peer — applications do not install it themselves.

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
