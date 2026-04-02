---
sidebar_position: 2
title: 主题与样式
---

# 主题与样式

VEF 的主题能力主要由 `@vef-framework-react/components` 提供，并且已经在 `createApp()` 内部自动接好。

如果你需要查阅完整的 CSS 自定义属性目录，包括间距、阴影、文本、状态色和布局变量，请直接查看 [CSS 变量参考](../reference/css-variables-reference)。

## 你通常直接会用到的 API

- `globalCssVars`
- `useThemeTokens`
- `useIsDarkMode`
- `colors`
- `semanticColors`
- `semanticScenes`

## 页面里怎么取主题 token

```tsx
import { useThemeTokens } from "@vef-framework-react/components";

const { colorPrimary } = useThemeTokens();
```

这适合:

- 动态着色
- 图标和插图配色
- 自定义卡片背景
- 图表或 canvas 场景里需要直接传运行时颜色值

## 怎么在 CSS 变量和主题 Hook 之间做选择

| 需求 | 推荐入口 |
| --- | --- |
| CSS Modules、SCSS、样式覆盖文件 | `var(--vef-...)` |
| TS/JS 里的 Emotion 或对象样式 | `globalCssVars` |
| 图表、canvas、运行时逻辑里需要真实值 | `useThemeTokens()` |

要注意的一点是，`globalCssVars` 返回的仍然是 CSS 变量字符串，而 `useThemeTokens()` 返回的是当前主题下已经解析好的值。

## 暗黑模式判断

```tsx
import { useIsDarkMode } from "@vef-framework-react/components";

const isDarkMode = useIsDarkMode();
```

当你真的需要为暗色模式单独调整渐变、阴影或插画时再用它。  
很多通用颜色变量本身已经会自动跟随主题变化。

## 为什么优先使用框架变量

相比直接写死颜色值，更推荐用框架导出的语义色与 CSS 变量，因为:

- 主题切换时不用整页重写
- 和组件库视觉保持一致
- 后续更换主题成本低
- 页面样式和框架默认组件更容易保持协调

## 一条实际建议

页面层尽量做到:

- 布局结构用组件表达
- 视觉取值用 token 或语义色表达
- 只有在非常特殊的设计里才写大段硬编码样式
- 优先选语义变量，其次再考虑预设调色盘，最后才是硬编码值
