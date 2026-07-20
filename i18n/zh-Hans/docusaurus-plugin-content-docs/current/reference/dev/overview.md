---
title: Dev 包
description: defineViteConfig、defineEslintConfig、defineStylelintConfig 和 defineCommitlintConfig 的签名，以及码集键名生成器和 vef CLI。
---

# Dev 包

`@vef-framework-react/dev` 为基于 VEF 的项目提供共享的工具链配置，涵盖五个方面：

1. Vite 构建配置
2. ESLint 规则
3. Stylelint 规则
4. Commitlint 规则
5. 代码生成（`CodeSetKey` 联合类型生成器），由 `vef` CLI 驱动

使用此包可确保 VEF 生态中的所有项目共享一致的构建行为、代码风格和提交规范，无需重复配置文件。

## `defineViteConfig`

创建带有 VEF 默认配置的 Vite 配置。

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

`DefineConfigOptions` 字段：

| 选项 | 类型 | 说明 |
| --- | --- | --- |
| `resolve` | `Pick<UserConfig["resolve"], "alias" \| "conditions">` | 额外的 Vite resolve 配置，与框架自身配置合并 |
| `plugins` | `PluginOption[]` | 附加的 Vite 插件，前置到框架的插件列表中 |
| `autoEnhancePlugins` | `AutoEnhancePlugin[]` | 额外的自动增强插件（作用于特定组件模式的 JSX 转换） |
| `routerHistory` | `"hash" \| "browser"` | TanStack Router 历史模式（默认：`"browser"`） |
| `react` | `ReactPluginOptions` | 转发给 React 插件的选项 |
| `proxies` | `Record<string, string \| ProxyOptions>` | 开发服务器代理表 |

## 环境变量

`defineViteConfig` 从 `env/` 目录（而非项目根目录）读取 `.env` 文件，识别两种前缀，二者都会暴露在客户端代码的 `import.meta.env` 上：

- `VEF_BUILD_*`——构建与开发服务器设置，仅在构建时解析一次。
- `VEF_APP_*`——应用配置，注入到运行中的应用。

按模式解析文件（`env/.env`、`env/.env.development`、`env/.env.production`、shell 变量）遵循标准 Vite 行为——参见 [Vite 环境变量文档](https://vite.dev/guide/env-and-mode)。

### 构建时：`VEF_BUILD_*`

| 变量 | 类型 | 默认值 | 控制内容 |
| --- | --- | --- | --- |
| `VEF_BUILD_BASE_PUBLIC_PATH` | `string` | `/`（Vite 默认值） | 公共基础路径（Vite `base`），静态资源和 `app.config.js` 都从该路径提供 |
| `VEF_BUILD_OUTPUT_DIR` | `string` | `dist` | 构建输出目录（`build.outDir`）；同时也是 `app.config.js` 的生成位置 |
| `VEF_BUILD_SERVER_PORT` | `number` | `3833` | 开发服务器端口（已启用 `strictPort`，端口必须空闲） |

### 运行时注入：`VEF_APP_*`

所有带 `VEF_APP_` 前缀的变量都会被收集到冻结的 `__VEF_APP_CONFIG__` 全局对象中：

- 开发模式下，该对象由 `import.meta.env` 内联构建。
- 生产构建时，`env/.env` 和 `env/.env.production` 中的值会写入 `<outputDir>/app.config.js`，并通过注入到 `index.html` 的 script 标签加载。构建后直接编辑该文件即可修改运行时配置，无需重新构建。

在生产构建中，`__VEF_APP_CONFIG__` 会被编译为对 `window.__PRODUCTION__VEF_<NAME>__CONF__` 的读取——即 `app.config.js` 所赋值的全局变量。`<NAME>` 是转换为 `CONSTANT_CASE` 的 `VEF_APP_NAME`（例如 `my-app` → `MY_APP`），`VEF_APP_NAME` 未设置时回退为 `APP`，因此默认的全局变量是 `__PRODUCTION__VEF_APP__CONF__`。在 v2.10.0 之前，define 与生成的文件在设置了 `VEF_APP_NAME` 时可能推导出不同的名称（见[版本说明](../release-notes.md#v2100-2026-07-13)）；现在两侧解析出的名称一致。

`__VEF_APP_CONFIG__` 的键保留完整的 `VEF_APP_*` 名称；脚手架生成的 `getAppConfig` 辅助函数会去掉前缀并将其余部分转为驼峰命名（`VEF_APP_API_BASE_URL` → `apiBaseUrl`）。

该前缀是开放式的——你添加的任何 `VEF_APP_*` 变量都会被收集。以下是框架自身消费的变量：

| 变量 | 类型 | 默认值（脚手架） | 控制内容 |
| --- | --- | --- | --- |
| `VEF_APP_NAME` | `string` | `vef-app` | 内置 HTML 外壳中显示的应用名称（加载页和 `<noscript>` 提示）；同时决定生产配置全局变量的名称（`__PRODUCTION__VEF_<CONSTANT_CASE_NAME>__CONF__`） |
| `VEF_APP_TITLE` | `string` | `VEF App` | 文档 `<title>` |
| `VEF_APP_FAVICON` | `string` | `/favicon.svg` | 内置 HTML 模板中的 favicon URL |
| `VEF_APP_VERSION` | `string` | `0.0.0` | `<meta name="app-version">` 与加载页版本号；starter 的 `setupAppVersionNotification`（参见[应用壳层](../starter/application-shell.md)）会轮询它来检测新部署 |
| `VEF_APP_CHANGELOG` | `string` | `/changelog.json` | `<meta name="app-changelog">`——版本更新通知所拉取的更新日志 JSON 的 URL |
| `VEF_APP_API_BASE_URL` | `string` | `http://127.0.0.1:8080`（dev）/ `/`（prod） | API 基础地址；脚手架生成的 API 客户端通过 `getAppConfig("apiBaseUrl")` 读取 |

内置 `index.html` 模板中的 `%VEF_APP_*%` 占位符由 Vite 的 HTML 环境变量替换机制处理，因此上表所有变量在构建时也会被解析进生成的 HTML。

注意 `VEF_APP_VERSION`（向运行中客户端公布的版本）与编译期常量 `__VEF_APP_VERSION__` 相互独立，后者始终来自 `package.json` 的 `version` 字段。

`vef init` 会根据脚手架问答，将 `VEF_APP_NAME` 和 `VEF_APP_TITLE` 写入 `env/.env`，将 `VEF_APP_API_BASE_URL` 写入 `env/.env.development`。

## `defineEslintConfig`

创建带有 VEF 默认配置的 ESLint flat config。

```ts
// eslint.config.ts
import { defineEslintConfig } from "@vef-framework-react/dev";

export default defineEslintConfig();
```

带覆盖配置：

```ts
export default defineEslintConfig({
  ignores: ["scripts/**"]
});
```

该配置在 `@coldsmirk/eslint-config` 的密封 React 基线之上，组合了 TanStack Query / Router 插件规则和一条框架特有规则 `local/no-legacy-middle-size`（强制在 `size` / `componentSize` / `gap` 属性上使用框架的 `"medium"` 尺寸令牌，而不是旧的 `"middle"`）。生成的文件（`**/*.gen.ts`）始终被忽略。

选项（`EslintConfigOptions`，转发给基础配置）：

| 选项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `type` | `"app" \| "lib"` | `"app"` | 全局严格程度维度；`"lib"` 会追加可发布包的要求 |
| `react` | `boolean` | `true` | React 规则层（`@eslint-react`、react-hooks、react-dom、JSX 限制、DOM 测试层）。框架把基础配置的默认值（`false`）翻转为 `true` |
| `ignores` | `string[]` | `[]` | 额外的忽略 glob，与默认值（`**/dist/**`、`**/*.gen.ts`）合并 |

## `defineStylelintConfig`

创建带有 VEF 默认配置的 Stylelint 配置。

```ts
// stylelint.config.js
import { defineStylelintConfig } from "@vef-framework-react/dev";

export default defineStylelintConfig();
```

带覆盖配置：

```ts
export default defineStylelintConfig({
  scss: true
});
```

唯一支持的字段是 `scss?: boolean`——规则集本身是密封的。基础配置（`@coldsmirk/stylelint-config`）默认关闭 SCSS，但框架将其打开；纯 CSS 项目可传入 `{ scss: false }`。

| 选项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `scss` | `boolean` | `true` | 以 `stylelint-config-standard-scss` 为基础并启用 `scss/*` 规则层；`false` 保持纯 CSS 预设 |

## `defineCommitlintConfig`

创建强制执行 Conventional Commits 规范的 Commitlint 配置。它不接受任何选项：该配置扩展 `@commitlint/config-conventional`，并额外强制单行提交（`body-empty` 与 `footer-empty` 为错误级别），因此每次提交都只有一行 `type(scope): subject` 头部。

```ts
// commitlint.config.ts
import { defineCommitlintConfig } from "@vef-framework-react/dev";

export default defineCommitlintConfig();
```

支持的提交类型：

| 类型 | 说明 |
| --- | --- |
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `docs` | 文档变更 |
| `style` | 代码风格变更(不影响逻辑) |
| `refactor` | 代码重构 |
| `perf` | 性能优化 |
| `test` | 新增或更新测试 |
| `build` | 构建系统变更 |
| `ci` | CI 配置变更 |
| `chore` | 其他维护任务 |
| `revert` | 回滚之前的提交 |

## 代码生成

代码生成模块根据后端的码集目录生成项目的 `CodeSetKey` 联合类型，使每一处 `useCodeSetQuery` 调用点都能对照真实键名进行检查。码集的运行时部分见[码集](../../guide/code-sets.md)。

:::note 由 "dictionary" 更名而来
在 v2.12.0 之后的这次更名之前，本模块使用 "dictionary"（字典）词汇：CLI 命令是 `vef gen:dictionary-keys`，配置块是 `dictionaryKeys`（其拉取函数为 `fetchDictionaryKeys`），默认输出是 `src/types/dictionary.gen.ts`，导出名为 `generateDictionaryKeys`、`renderDictionaryKeysFile`、`DICTIONARY_AUGMENT_TARGET`、`DictionaryKeyEntry` 和 `DictionaryKeysConfig`。完整迁移说明见[版本说明](../release-notes.md#未发布v2120-之后截至-2026-07-20)。
:::

### `defineCodeGenerationConfig`

用于以类型化方式编写配置文件的恒等辅助函数；它通过泛型参数保留字面量类型。

配置位于项目根目录的 `code-generation.config.{ts,mts,js,mjs}`（按顺序取第一个存在的候选文件）。TypeScript 配置通过 jiti 加载，因此不需要构建步骤。默认导出和裸 CJS 导出均可接受。

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

`CodeGenerationConfig` 字段：

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `codeSetKeys` | `CodeSetKeysConfig` | — | 码集键名生成器配置块。该容器保留单一入口，以便未来的生成器可以与之并存 |

`CodeSetKeysConfig` 字段：

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `fetchCodeSetKeys` | `() => Promise<readonly CodeSetKeyEntry[]>` | 必填 | 生成时调用的拉取函数，用于获取全部码集键名；在 Node 中以项目凭据运行 |
| `output` | `string` | `"src/types/code-set-keys.gen.ts"` | 输出路径，相对项目根目录解析。必须位于项目内——绝对路径与 `..` 上跳会在运行时被拒绝 |
| `timeout` | `number` | `30000` | `fetchCodeSetKeys` 的超时时间（毫秒）；超时后生成会报错中止。`0` 表示禁用超时 |

`CodeSetKeyEntry` 字段：

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `key` | `string` | 必填 | 码集键名，例如 `"sys.menu.type"`。必须匹配 `/^[\w.-]+$/`（字母、数字、下划线、点、连字符） |
| `comment` | `string` | — | 可选的人类可读描述，渲染为联合类型成员上方的 JSDoc 注释 |

生成的文件导出 `export type CodeSetKey = "…" | "…"`（目录为空时为 `never`），并扩充 `@vef-framework-react/hooks` 中的 `Register.codeSetKeys`——扩充目标是常量 `CODE_SET_AUGMENT_TARGET`（`"@vef-framework-react/hooks"`）。条目会被去重（注释冲突时保留首次出现的一项，并给出警告）并按码点排序，以保证输出的确定性。

### `generateCodeSetKeys`

`vef gen:code-set-keys` 背后的编程式入口——适用于自定义脚本或 CI。

```ts
function generateCodeSetKeys(options: GenerateCodeSetKeysOptions): Promise<GenerateCodeSetKeysResult>;
```

`GenerateCodeSetKeysOptions` 字段：

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `projectDir` | `string` | 必填 | 项目根目录的绝对路径 |
| `configFile` | `string` | 自动探测 | 覆盖配置文件路径（相对 `projectDir` 或绝对路径）；若逃出项目目录树则被拒绝 |
| `output` | `string` | 取自配置 | 覆盖 `codeSetKeys.output` |
| `check` | `boolean` | `false` | 试运行：只计算 `changed`，不写入磁盘 |
| `augmentTarget` | `string` | `CODE_SET_AUGMENT_TARGET` | 生成文件所扩充的模块名；供重新发布该扩展点的下游 fork 使用 |
| `onWarn` | `(message: string) => void` | `console.warn` | 非致命警告的接收器（注释冲突的重复键名、拉取结果为空） |

`GenerateCodeSetKeysResult` 字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `outputPath` | `string` | 生成文件的绝对路径 |
| `keyCount` | `number` | 输出的唯一键名数量（为零时生成 `CodeSetKey = never`） |
| `changed` | `boolean` | 文件是否被写入（check 模式下表示是否会被写入） |

严格失败会抛出 `CodeGenerationValidationError`（同样被导出）：配置文件缺失或形状非法、缺少 `codeSetKeys` 块、键名违反字符集、`output` 路径逃出项目或指向符号链接。拉取函数的错误或超时会原样向上传播。软失败只警告并继续：拉取结果为空（生成 `never`）、注释冲突的重复键名。写入是原子的（临时文件 + 重命名）。

### `renderCodeSetKeysFile`

生成器所使用的纯渲染函数；导出以供快照测试和自定义流水线使用。

```ts
function renderCodeSetKeysFile(entries: readonly CodeSetKeyEntry[], options: RenderCodeSetKeysOptions): string;
```

`RenderCodeSetKeysOptions` 字段：

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `configFile` | `string` | 必填 | 记录在文件头部横幅中的配置文件路径（相对项目根目录），用于溯源 |
| `augmentTarget` | `string` | `CODE_SET_AUGMENT_TARGET` | 生成文件所扩充的模块名 |

## `vef` CLI

该包附带一个 `vef` 可执行文件，提供四条命令：

| 命令 | 用途 |
| --- | --- |
| `vef init [name]` | 在新目录中脚手架一个新的 VEF 项目。选项：`-t, --title <title>`（人类可读的应用标题）、`--api-url <url>`（开发环境 API 基础地址，写入开发环境变量文件）。会把 `VEF_APP_NAME` / `VEF_APP_TITLE` 写入 `env/.env`，把 `VEF_APP_API_BASE_URL` 写入 `env/.env.development` |
| `vef prepare` | 安装 git hooks 与 lint-staged，并预置 `package.json` 脚本 |
| `vef update` | 在各自的 semver 范围内更新 `@vef-framework-react/*` 依赖 |
| `vef gen:code-set-keys` | 根据项目的代码生成配置生成 `CodeSetKey` 联合类型。选项：`-c, --config <file>`（配置路径）、`-o, --output <file>`（覆盖 `codeSetKeys.output`）、`--check`（若生成文件将发生变化则以非零码退出——CI 守卫） |

## 典型项目配置

标准 VEF 项目会使用全部四个配置辅助函数，外加可选的代码生成配置：

```
vite.config.ts               → defineViteConfig
eslint.config.ts             → defineEslintConfig
stylelint.config.js          → defineStylelintConfig
commitlint.config.ts         → defineCommitlintConfig
code-generation.config.ts    → defineCodeGenerationConfig (optional)
```

这样可以保持项目根目录整洁，并确保在升级 `@vef-framework-react/dev` 时，共享工具链规则的更新能够自动传播。
