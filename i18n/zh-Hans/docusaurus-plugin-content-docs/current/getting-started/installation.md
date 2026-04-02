---
sidebar_position: 1
title: 安装与依赖
---

# 安装与依赖

要把 VEF 用起来，最低限度需要四类依赖:

1. React 运行时
2. VEF 核心包
3. 路由依赖 `@tanstack/react-router`
4. 工程配置包 `@vef-framework-react/dev`

## 运行环境

根据当前仓库配置，建议直接对齐这些版本约束:

| 项目 | 建议 |
| --- | --- |
| Node.js | `>= 22` |
| pnpm | `10.x` |
| React | `19.x` |
| TypeScript | `5.9+` 或更新 |

## 最小安装

如果你要搭一个常规的后台系统，通常会安装下面这些包:

```bash
pnpm add react react-dom @tanstack/react-router
pnpm add @vef-framework-react/core @vef-framework-react/components @vef-framework-react/hooks @vef-framework-react/shared @vef-framework-react/starter
pnpm add -D vite typescript @types/react @types/react-dom @vef-framework-react/dev eslint stylelint lint-staged husky @commitlint/cli
```

如果项目需要审批流编辑器，再额外安装:

```bash
pnpm add @vef-framework-react/approval-flow-editor
```

## 每个包到底要不要装

| 场景 | 需要的包 |
| --- | --- |
| 只想用基础请求和 query | `@vef-framework-react/core` |
| 只想用组件和表单封装 | `@vef-framework-react/components` |
| 想直接搭一套后台骨架 | `@vef-framework-react/starter` + `components` + `core` + `hooks` + `shared` |
| 想统一项目工程配置 | `@vef-framework-react/dev` |
| 想集成审批流设计器 | `@vef-framework-react/approval-flow-editor` |

实际项目里，`starter` 基本都会和 `components`、`core`、`hooks`、`shared` 一起使用。

## package.json 示例

下面是一份接近真实项目的依赖组合:

```json
{
  "dependencies": {
    "@tanstack/react-router": "^1.168.3",
    "@vef-framework-react/components": "^2",
    "@vef-framework-react/core": "^2",
    "@vef-framework-react/hooks": "^2",
    "@vef-framework-react/shared": "^2",
    "@vef-framework-react/starter": "^2",
    "react": "^19.2.4",
    "react-dom": "^19.2.4"
  },
  "devDependencies": {
    "@vef-framework-react/dev": "^2",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "typescript": "^6.0.2",
    "vite": "^8.0.2"
  }
}
```

## Vite 需要的关键配置

VEF 包通过自定义导出条件暴露源码或构建产物，因此 `resolve.conditions` 很重要。

在应用里建议这样写:

```ts title="vite.config.ts"
import { defineViteConfig } from "@vef-framework-react/dev";

export default defineViteConfig({
  react: {
    useCompiler: true
  }
});
```

## TypeScript 基础配置

如果你使用 `@vef-framework-react/dev` 提供的 `tsconfig`，可以直接复用。  
如果暂时自己写，至少保证以下几点:

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

安装完成后，下一步直接看 [快速开始](./quick-start.md)。
