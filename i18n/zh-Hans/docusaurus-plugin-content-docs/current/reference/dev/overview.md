---
title: Dev 包
description: defineViteConfig、defineEslintConfig、defineStylelintConfig 和 defineCommitlintConfig 的签名。
---

# Dev 包

`@vef-framework-react/dev` 为基于 VEF 的项目提供共享的工具链配置，涵盖四个方面：

1. Vite 构建配置
2. ESLint 规则
3. Stylelint 规则
4. Commitlint 规则

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

`__VEF_APP_CONFIG__` 的键保留完整的 `VEF_APP_*` 名称；脚手架生成的 `getAppConfig` 辅助函数会去掉前缀并将其余部分转为驼峰命名（`VEF_APP_API_BASE_URL` → `apiBaseUrl`）。

该前缀是开放式的——你添加的任何 `VEF_APP_*` 变量都会被收集。以下是框架自身消费的变量：

| 变量 | 类型 | 默认值（脚手架） | 控制内容 |
| --- | --- | --- | --- |
| `VEF_APP_NAME` | `string` | `vef-app` | 内置 HTML 外壳中显示的应用名称（加载页和 `<noscript>` 提示） |
| `VEF_APP_TITLE` | `string` | `VEF App` | 文档 `<title>` |
| `VEF_APP_FAVICON` | `string` | `/favicon.svg` | 内置 HTML 模板中的 favicon URL |
| `VEF_APP_VERSION` | `string` | `0.0.0` | `<meta name="app-version">` 与加载页版本号；starter 的 `setupAppVersionNotification`（参见[应用外壳](../starter/application-shell.md)）会轮询它来检测新部署 |
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

包含的规则集：

- TypeScript ESLint 推荐规则
- React 和 React Hooks 规则
- Import 排序规则
- 无障碍访问规则

## `defineStylelintConfig`

创建带有 VEF 默认配置的 Stylelint 配置。

```ts
// stylelint.config.ts
import { defineStylelintConfig } from "@vef-framework-react/dev";

export default defineStylelintConfig();
```

带覆盖配置：

```ts
export default defineStylelintConfig({
  scss: true
});
```

唯一支持的字段是 `scss?: boolean`——框架默认已开启 SCSS；纯 CSS 项目可传入 `{ scss: false }`。

## `defineCommitlintConfig`

创建强制执行 Conventional Commits 规范的 Commitlint 配置。

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

## 典型项目配置

标准 VEF 项目会使用全部四个配置辅助函数：

```
vite.config.ts          → defineViteConfig
eslint.config.ts        → defineEslintConfig
stylelint.config.ts     → defineStylelintConfig
commitlint.config.ts    → defineCommitlintConfig
```

这样可以保持项目根目录整洁，并确保在升级 `@vef-framework-react/dev` 时，共享工具链规则的更新能够自动传播。
