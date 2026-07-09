---
title: 安装
description: 安装 VEF 的各个包，配置 Vite 和 TypeScript，并设置推荐的 npm 脚本。
---

# 安装

要使用 VEF，通常需要涉及四类依赖:

1. React 运行时
2. VEF 核心包
3. 通过 `@tanstack/react-router` 实现的路由
4. 通过 `@vef-framework-react/dev` 实现的构建和代码检查工具

## 运行环境要求

仓库当前对齐以下版本:

| 项目 | 建议 |
| --- | --- |
| Node.js | `>= 22` |
| pnpm | `11.x` |
| React | `19.x` |
| TypeScript | `>= 5.9`（仓库当前使用 `6.x` 构建） |

## 最小安装

对于典型的后台风格应用，通常会安装以下这些包:

```bash
pnpm add react react-dom @tanstack/react-router
pnpm add @vef-framework-react/core @vef-framework-react/components @vef-framework-react/hooks @vef-framework-react/shared @vef-framework-react/starter
pnpm add -D vite typescript @types/react @types/react-dom @vef-framework-react/dev eslint stylelint lint-staged husky @commitlint/cli
```

如果项目还需要嵌入某个可视化编辑器，在基础安装之上再额外添加:

```bash
pnpm add @vef-framework-react/form-editor
pnpm add @vef-framework-react/approval-flow-editor
pnpm add @vef-framework-react/approval-form-bridge
```

## 通常需要哪些包

| 场景 | 需要的包 |
| --- | --- |
| 只需要请求和 query | `@vef-framework-react/core` |
| 只需要组件和表单封装 | `@vef-framework-react/components` |
| 完整的后台风格应用骨架 | `@vef-framework-react/starter` + `components` + `core` + `hooks` + `shared` |
| 共享的项目工具链 | `@vef-framework-react/dev` |
| 集成可视化表单设计器 | `@vef-framework-react/form-editor` |
| 集成审批流设计器 | `@vef-framework-react/approval-flow-editor` |
| 将 form-editor 的 Schema 投影为审批流 | `@vef-framework-react/approval-form-bridge` |

在大多数应用中，`starter` 会和 `components`、`core`、`hooks`、`shared` 一起使用。这三个编辑器包都是可选的，并且彼此独立——只添加应用实际需要嵌入的那些。

## `package.json` 示例

以下依赖组合接近一个真实项目的样子:

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

## 必需的 Vite 配置

VEF 的包通过自定义导出条件暴露源码或构建产物，因此 `resolve.conditions` 很重要。

以下配置在应用项目中效果良好:

```ts title="vite.config.ts"
import { defineViteConfig } from "@vef-framework-react/dev";

export default defineViteConfig({
  react: {
    useCompiler: true
  }
});
```

## 基础 TypeScript 配置

如果你使用 `@vef-framework-react/dev` 导出的 `tsconfig`，可以直接复用。  
如果你更倾向于自己编写配置，至少应该对齐以下设置:

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

## 推荐脚本

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

安装完成后，下一步阅读[快速开始](./quick-start.md)。
