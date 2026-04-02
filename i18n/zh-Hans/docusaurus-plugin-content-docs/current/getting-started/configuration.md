---
sidebar_position: 4
title: 工程配置
---

# 工程配置

如果你使用 `@vef-framework-react/dev`，工程配置层其实不需要从零搭。  
VEF 已经把 Vite、ESLint、Stylelint、Commitlint 这些常见前端基建包装成可直接复用的导出 API。

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

### `defineViteConfig()` 支持什么

| 参数 | 作用 |
| --- | --- |
| `resolve` | 补充 alias 与 `conditions` |
| `plugins` | 注入自定义 Vite 插件 |
| `autoEnhancePlugins` | 参与框架的自动增强过程 |
| `routerHistory` | 生成 router 时采用 `hash` 还是 `browser` |
| `react` | 配置 React 插件，如 Emotion、Compiler |
| `proxies` | 统一声明开发代理 |

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

从 `@vef-framework-react/dev` 的 Vite 配置可以看出，它会优先读取 `env/` 目录，并关注两类前缀:

| 前缀 | 用途 |
| --- | --- |
| `VEF_APP_` | 注入应用级配置 |
| `VEF_BUILD_` | 控制构建与开发服务器行为 |

常见变量可以这样理解:

| 变量 | 作用 |
| --- | --- |
| `VEF_APP_NAME` | 应用名，用于生成注入常量 |
| `VEF_BUILD_BASE_PUBLIC_PATH` | 构建基础路径 |
| `VEF_BUILD_OUTPUT_DIR` | 输出目录 |
| `VEF_BUILD_SERVER_PORT` | 本地开发端口 |

## 一套常用脚本

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

## 配置完成后的验收标准

1. `pnpm dev` 能正常启动。
2. `@vef-framework-react/*` 包可以被正确解析。
3. Emotion 样式和组件样式都能正常加载。
4. ESLint 和 Stylelint 能在本地执行。
