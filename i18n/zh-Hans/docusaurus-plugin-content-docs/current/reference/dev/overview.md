---
sidebar_position: 1
title: Dev 包
---

# Dev 包

`@vef-framework-react/dev` 为 VEF 项目提供共享的工具链配置，涵盖四个方面：

1. Vite 构建配置
2. ESLint 规则
3. Stylelint 规则
4. Commitlint 规则

使用此包可确保 VEF 生态中的所有项目共享一致的构建行为、代码风格和提交规范，无需在每个项目中重复配置文件。

## `defineViteConfig`

创建带有 VEF 默认配置的 Vite 配置。

```ts
// vite.config.ts
import { defineViteConfig } from "@vef-framework-react/dev";

export default defineViteConfig({
  base: "/my-app/",
  server: {
    port: 3000,
    proxy: {
      "/api": "http://localhost:8080"
    }
  }
});
```

`defineViteConfig` 应用的默认配置：

- 带 Babel 和 Emotion 支持的 React 插件
- TypeScript 路径别名解析
- CSS Modules 配置
- 生产环境代码分割

## `defineEslintConfig`

创建带有 VEF 默认配置的 ESLint flat config。

```ts
// eslint.config.ts
import { defineEslintConfig } from "@vef-framework-react/dev";

export default defineEslintConfig();
```

带覆盖配置：

```ts
export default defineEslintConfig([
  {
    rules: {
      "no-console": "warn"
    }
  }
]);
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
  rules: {
    "color-no-invalid-hex": true
  }
});
```

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
| `style` | 代码风格变更（不影响逻辑） |
| `refactor` | 代码重构 |
| `perf` | 性能优化 |
| `test` | 添加或更新测试 |
| `build` | 构建系统变更 |
| `ci` | CI 配置变更 |
| `chore` | 其他维护任务 |
| `revert` | 回滚之前的提交 |

## 典型项目配置

标准 VEF 项目使用全部四个配置辅助函数：

```
vite.config.ts          → defineViteConfig
eslint.config.ts        → defineEslintConfig
stylelint.config.ts     → defineStylelintConfig
commitlint.config.ts    → defineCommitlintConfig
```

这样可以保持项目根目录整洁，并确保升级 `@vef-framework-react/dev` 时共享工具链规则的更新能自动传播到所有项目。
