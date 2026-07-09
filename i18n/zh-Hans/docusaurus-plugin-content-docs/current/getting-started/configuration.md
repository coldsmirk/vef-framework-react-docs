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

`defineViteConfig()`、`createApp()`、`createApiClient()` 和 `createRouter()` 的完整选项列表位于[配置速查](../reference/configuration-reference.md)——本页只介绍搭建构建流程的整体思路。

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

`@vef-framework-react/dev` 导出的 Vite 配置会优先读取 `env/` 目录，并识别两类前缀:

| 前缀 | 用途 |
| --- | --- |
| `VEF_APP_` | 注入应用级配置 |
| `VEF_BUILD_` | 控制构建和开发服务器行为 |

常见变量的用法通常是这样的:

| 变量 | 用途 |
| --- | --- |
| `VEF_APP_NAME` | 用于生成注入常量的应用名称 |
| `VEF_BUILD_BASE_PUBLIC_PATH` | 构建基础路径 |
| `VEF_BUILD_OUTPUT_DIR` | 输出目录 |
| `VEF_BUILD_SERVER_PORT` | 本地开发服务器端口 |

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
