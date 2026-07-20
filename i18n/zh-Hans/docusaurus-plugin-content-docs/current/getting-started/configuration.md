---
title: 工程配置
description: 使用共享的 @vef-framework-react/dev 配置来设置 Vite、ESLint、Stylelint 和 Commitlint。
---

# 工程配置

如果你使用 `@vef-framework-react/dev`，项目的工具链层就不需要从零搭建。  
VEF 已经把 Vite、ESLint、Stylelint 和 Commitlint 等常见前端工具封装成可复用的导出。

## Vite 配置

最常见的写法如下:

```ts title="vite.config.ts"
import { defineViteConfig } from "@vef-framework-react/dev";

export default defineViteConfig({
  react: {
    useCompiler: true
  }
});
```

完整选项列表位于参考章节——`createApp()`、`createApiClient()`、`createRouter()` 及路由 helper 见[启动与路由](../reference/starter/bootstrap-and-routing.md)，`defineViteConfig()` 见 [Dev 包](../reference/dev/overview.md)。本页只介绍搭建构建流程的整体思路。

## ESLint 配置

```ts title="eslint.config.ts"
import { defineEslintConfig } from "@vef-framework-react/dev";

export default defineEslintConfig();
```

## Stylelint 配置

```js title="stylelint.config.js"
import { defineStylelintConfig } from "@vef-framework-react/dev";

export default defineStylelintConfig();
```

## Commitlint 配置

```ts title="commitlint.config.ts"
import { defineCommitlintConfig } from "@vef-framework-react/dev";

export default defineCommitlintConfig();
```

## 环境变量约定

`@vef-framework-react/dev` 导出的 Vite 配置会从 `env/` 目录（而非项目根目录）读取 `.env` 文件，并识别两类前缀:

| 前缀 | 用途 |
| --- | --- |
| `VEF_APP_` | 把应用级配置注入到运行中的应用 |
| `VEF_BUILD_` | 控制构建和开发服务器行为，仅在构建时解析一次 |

常见变量的用法通常是这样的:

| 变量 | 类型 | 默认值 | 用途 |
| --- | --- | --- | --- |
| `VEF_APP_NAME` | `string` | `vef-app`（脚手架） | 内置 HTML 外壳中显示的应用名称；同时决定生产配置全局变量的名称 |
| `VEF_BUILD_BASE_PUBLIC_PATH` | `string` | `/` | 静态资源和 `app.config.js` 的公共基础路径 |
| `VEF_BUILD_OUTPUT_DIR` | `string` | `dist` | 构建输出目录 |
| `VEF_BUILD_SERVER_PORT` | `number` | `3833` | 本地开发服务器端口（已启用 `strictPort`，端口必须空闲） |

完整的变量目录——包括 `VEF_APP_TITLE`、`VEF_APP_FAVICON`、`VEF_APP_VERSION`、`VEF_APP_CHANGELOG` 和 `VEF_APP_API_BASE_URL`——见 [Dev 包](../reference/dev/overview.md#环境变量)。

## 注入的全局常量

`defineViteConfig` 会注入三个编译期全局常量，其 TypeScript 声明由 `@vef-framework-react/dev/types` 提供（推荐的 `tsconfig` 已包含）:

| 全局常量 | 类型 | 值 | 用途 |
| --- | --- | --- | --- |
| `__VEF_FRAMEWORK_VERSION__` | `string` | 由 dev 包固定（当前为 `1.0.0`） | 标识所注入配置层的版本 |
| `__VEF_APP_VERSION__` | `string` | 构建时项目 `package.json` 的 `version` 字段 | 编译期应用版本；与运行时公布的 `VEF_APP_VERSION` 变量相互独立 |
| `__VEF_APP_CONFIG__` | `Readonly<Record<string, string>>` | 全部 `VEF_APP_*` 变量，以完整名称为键 | 运行时应用配置 |

`__VEF_APP_CONFIG__` 在不同模式下行为不同: 开发模式下由 `import.meta.env` 内联构建；生产构建中它读取 `window.__PRODUCTION__VEF_<NAME>__CONF__`，即生成的 `<outputDir>/app.config.js` 所赋值的全局变量（`<NAME>` 是 `CONSTANT_CASE` 形式的 `VEF_APP_NAME`，未设置时为 `APP`）。构建完成后直接编辑 `app.config.js` 即可修改运行时配置，无需重新构建——完整机制见 [Dev 包](../reference/dev/overview.md#运行时注入vef_app_)。

## 常用脚本

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

## 验收清单

1. `pnpm dev` 能够正常启动。
2. `@vef-framework-react/*` 包能够被正确解析。
3. Emotion 样式和组件样式能够正常加载。
4. ESLint 和 Stylelint 能够在本地运行。

下一步: [项目结构](./project-structure.md)。
