---
title: Dev Package
description: defineViteConfig, defineEslintConfig, defineStylelintConfig, and defineCommitlintConfig signatures, plus the code-set key generator and the vef CLI.
---

# Dev Package

`@vef-framework-react/dev` provides shared tooling configuration for VEF-based projects. It covers five areas:

1. Vite build configuration
2. ESLint rules
3. Stylelint rules
4. Commitlint rules
5. Code generation (the `CodeSetKey` union generator), driven by the `vef` CLI

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

In a production build, `__VEF_APP_CONFIG__` compiles down to a read of `window.__PRODUCTION__VEF_<NAME>__CONF__` — the global that `app.config.js` assigns. `<NAME>` is `VEF_APP_NAME` converted to `CONSTANT_CASE` (e.g. `my-app` → `MY_APP`), falling back to `APP` when `VEF_APP_NAME` is unset, so the default global is `__PRODUCTION__VEF_APP__CONF__`. Before v2.10.0 the define and the generated file could derive different names when `VEF_APP_NAME` was set (see [Release Notes](../release-notes.md#v2100-2026-07-13)); both sides now resolve the same name.

`__VEF_APP_CONFIG__` keys keep their full `VEF_APP_*` names; the scaffolded `getAppConfig` helper strips the prefix and camel-cases the rest (`VEF_APP_API_BASE_URL` → `apiBaseUrl`).

The prefix is open-ended — any `VEF_APP_*` variable you add is picked up. These are the ones the framework itself consumes:

| Variable | Type | Default (scaffold) | Controls |
| --- | --- | --- | --- |
| `VEF_APP_NAME` | `string` | `vef-app` | Application name shown in the built-in HTML shell (loading screen and `<noscript>` notice); also names the production config global (`__PRODUCTION__VEF_<CONSTANT_CASE_NAME>__CONF__`) |
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

The config composes `@coldsmirk/eslint-config`'s sealed React baseline with the TanStack Query / Router plugin rules and one framework-specific rule, `local/no-legacy-middle-size` (enforces the framework's `"medium"` size token over the legacy `"middle"` on `size` / `componentSize` / `gap` props). Generated files (`**/*.gen.ts`) are always ignored.

Options (`EslintConfigOptions`, forwarded to the base config):

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | `"app" \| "lib"` | `"app"` | Global strictness axis; `"lib"` adds publishable-package requirements |
| `react` | `boolean` | `true` | React rule layers (`@eslint-react`, react-hooks, react-dom, JSX restrictions, DOM test layer). The framework flips the base default (`false`) to `true` |
| `ignores` | `string[]` | `[]` | Extra ignore globs, merged with the defaults (`**/dist/**`, `**/*.gen.ts`) |

## `defineStylelintConfig`

Creates a Stylelint configuration with VEF defaults.

```ts
// stylelint.config.js
import { defineStylelintConfig } from "@vef-framework-react/dev";

export default defineStylelintConfig();
```

With overrides:

```ts
export default defineStylelintConfig({
  scss: true
});
```

The only supported field is `scss?: boolean` — the ruleset itself is sealed. The base config (`@coldsmirk/stylelint-config`) defaults SCSS off, but the framework flips it on; pass `{ scss: false }` for a plain-CSS project.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `scss` | `boolean` | `true` | Use `stylelint-config-standard-scss` as the base and enable the `scss/*` rule layer; `false` keeps the plain-CSS preset |

## `defineCommitlintConfig`

Creates a Commitlint configuration enforcing Conventional Commits. It takes no options: the config extends `@commitlint/config-conventional` and additionally enforces single-line commits (`body-empty` and `footer-empty` are errors), so every commit is one `type(scope): subject` header.

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

## Code Generation

The code-generation module produces the project's `CodeSetKey` union from the backend's code set catalog, so every `useCodeSetQuery` call site is checked against real keys. The runtime side of code sets is described in [Code Sets](../../guide/code-sets.md).

:::note Renamed from "dictionary"
Before the rename that follows v2.12.0, this module used the "dictionary" vocabulary: the CLI command was `vef gen:dictionary-keys`, the config block was `dictionaryKeys` with a `fetchDictionaryKeys` fetcher, the default output was `src/types/dictionary.gen.ts`, and the exports were spelled `generateDictionaryKeys`, `renderDictionaryKeysFile`, `DICTIONARY_AUGMENT_TARGET`, `DictionaryKeyEntry`, and `DictionaryKeysConfig`. See the [release notes](../release-notes.md#breaking-dictionary-is-renamed-to-code-set-everywhere) for the full migration.
:::

### `defineCodeGenerationConfig`

Identity helper for typed authoring of the config file; it preserves literal types via its generic parameter.

The configuration lives in `code-generation.config.{ts,mts,js,mjs}` at the project root (the first existing candidate wins). TypeScript configs are loaded through jiti, so no build step is needed. Both a default export and a bare CJS export are accepted.

```ts title="code-generation.config.ts"
import { defineCodeGenerationConfig } from "@vef-framework-react/dev";

export default defineCodeGenerationConfig({
  codeSetKeys: {
    output: "src/types/code-set-keys.gen.ts",
    async fetchCodeSetKeys() {
      // Runs in Node at generation time - use Node-side HTTP/DB clients.
      const response = await fetch("http://127.0.0.1:8080/api/code-sets");
      const keys = await response.json();
      return keys.map(k => ({ key: k.key, comment: k.name }));
    }
  }
});
```

`CodeGenerationConfig` fields:

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `codeSetKeys` | `CodeSetKeysConfig` | — | The code set keys generator block. The container keeps a single entry point so future generators can live alongside it |

`CodeSetKeysConfig` fields:

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `fetchCodeSetKeys` | `() => Promise<readonly CodeSetKeyEntry[]>` | required | Fetcher invoked at generation time to retrieve all code set keys; runs in Node with project credentials |
| `output` | `string` | `"src/types/code-set-keys.gen.ts"` | Output path resolved against the project root. Must stay within the project — absolute paths and `..` traversal are rejected at runtime |
| `timeout` | `number` | `30000` | Timeout (ms) for `fetchCodeSetKeys`; generation aborts with an error after it elapses. `0` disables the timeout |

`CodeSetKeyEntry` fields:

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `key` | `string` | required | The code set key, e.g. `"sys.menu.type"`. Must match `/^[\w.-]+$/` (letters, digits, underscore, dot, hyphen) |
| `comment` | `string` | — | Optional human-readable description, rendered as a JSDoc comment above the union member |

The generated file exports `export type CodeSetKey = "…" | "…"` (or `never` for an empty catalog) and augments `Register.codeSetKeys` in `@vef-framework-react/hooks` — the augmentation target is the `CODE_SET_AUGMENT_TARGET` constant (`"@vef-framework-react/hooks"`). Entries are deduplicated (first occurrence wins on conflicting comments, with a warning) and sorted by code point for deterministic output.

### `generateCodeSetKeys`

Programmatic entry point behind `vef gen:code-set-keys` — useful in custom scripts or CI.

```ts
function generateCodeSetKeys(options: GenerateCodeSetKeysOptions): Promise<GenerateCodeSetKeysResult>;
```

`GenerateCodeSetKeysOptions` fields:

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `projectDir` | `string` | required | Absolute path to the project root |
| `configFile` | `string` | auto-detect | Override the config file path (relative to `projectDir` or absolute); rejected if it escapes the project tree |
| `output` | `string` | from config | Override `codeSetKeys.output` |
| `check` | `boolean` | `false` | Dry-run: compute `changed` without writing to disk |
| `augmentTarget` | `string` | `CODE_SET_AUGMENT_TARGET` | Module name the generated file augments; for downstream forks that re-publish the extension point |
| `onWarn` | `(message: string) => void` | `console.warn` | Sink for non-fatal warnings (duplicate keys with conflicting comments, empty fetcher result) |

`GenerateCodeSetKeysResult` fields:

| Field | Type | Description |
| --- | --- | --- |
| `outputPath` | `string` | Absolute path of the generated file |
| `keyCount` | `number` | Number of unique keys emitted (zero produces `CodeSetKey = never`) |
| `changed` | `boolean` | Whether the file was written (or would be, in check mode) |

Strict failures throw `CodeGenerationValidationError` (also exported): missing config file or invalid shape, no `codeSetKeys` block, a key violating the charset, an `output` path escaping the project or pointing at a symlink. A fetcher error or timeout propagates as-is. Soft failures warn and continue: an empty fetcher result (generates `never`), duplicate keys with conflicting comments. Writes are atomic (temp file + rename).

### `renderCodeSetKeysFile`

Pure renderer used by the generator; exported for snapshot tests and custom pipelines.

```ts
function renderCodeSetKeysFile(entries: readonly CodeSetKeyEntry[], options: RenderCodeSetKeysOptions): string;
```

`RenderCodeSetKeysOptions` fields:

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `configFile` | `string` | required | Config file path (relative to project root) recorded in the file banner for traceability |
| `augmentTarget` | `string` | `CODE_SET_AUGMENT_TARGET` | Module name the generated file augments |

## The `vef` CLI

The package ships a `vef` binary with four commands:

| Command | Purpose |
| --- | --- |
| `vef init [name]` | Scaffold a new VEF project in a new directory. Options: `-t, --title <title>` (human-readable app title), `--api-url <url>` (dev API base URL, written to the development env file). Seeds `env/.env` with `VEF_APP_NAME` / `VEF_APP_TITLE` and `env/.env.development` with `VEF_APP_API_BASE_URL` |
| `vef prepare` | Install git hooks and lint-staged, and seed `package.json` scripts |
| `vef update` | Update `@vef-framework-react/*` dependencies within their semver range |
| `vef gen:code-set-keys` | Generate the `CodeSetKey` union from the project's code-generation config. Options: `-c, --config <file>` (config path), `-o, --output <file>` (overrides `codeSetKeys.output`), `--check` (exit non-zero if the generated file would change — a CI guard) |

## Typical Project Setup

A standard VEF project uses all four configuration helpers, plus the optional code-generation config:

```
vite.config.ts               → defineViteConfig
eslint.config.ts             → defineEslintConfig
stylelint.config.js          → defineStylelintConfig
commitlint.config.ts         → defineCommitlintConfig
code-generation.config.ts    → defineCodeGenerationConfig (optional)
```

This keeps the project root clean and ensures updates to shared tooling rules propagate automatically when `@vef-framework-react/dev` is upgraded.
