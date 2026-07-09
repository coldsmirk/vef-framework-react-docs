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
