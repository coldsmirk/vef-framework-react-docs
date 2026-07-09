---
title: "ConfigProvider"
description: "VEF 的全局配置提供者，在 Ant Design 的 `ConfigProvider` 基础上扩展了 VEF 专属的主题支持，包括暗色模式、语义化颜色覆盖和全局 CSS 变量。"
---

# ConfigProvider

VEF 的全局配置提供者，在 Ant Design 的 `ConfigProvider` 基础上扩展了 VEF 专属的主题支持，包括暗色模式、语义化颜色覆盖和全局 CSS 变量。

> **VEF 专属组件。** 扩展自 Ant Design 的 `ConfigProvider`。

## 何时使用

- 在应用根节点设置全局主题。
- 启用暗色模式。
- 覆盖语义化颜色。
- 注入全局 CSS 变量。

## 基础用法

```tsx
import { ConfigProvider } from '@vef-framework-react/components';

export default function App() {
  return (
    <ConfigProvider>
      <YourApp />
    </ConfigProvider>
  );
}
```

## 暗色模式

```tsx
import { ConfigProvider } from '@vef-framework-react/components';

export default function App({ isDark }: { isDark: boolean }) {
  return (
    <ConfigProvider theme={{ isDarkMode: isDark }}>
      <YourApp />
    </ConfigProvider>
  );
}
```

## 自定义颜色

```tsx
import { ConfigProvider } from '@vef-framework-react/components';

export default function App() {
  return (
    <ConfigProvider
      theme={{
        colors: {
          primary: 'blue',
          success: 'green',
          warning: 'gold',
          error: 'red',
        },
      }}
    >
      <YourApp />
    </ConfigProvider>
  );
}
```

## 全局 CSS 变量

```tsx
<ConfigProvider
  theme={{
    globalCssVars: {
      '--vef-sidebar-width': '240px',
      '--vef-header-height': '64px',
    },
  }}
>
  <YourApp />
</ConfigProvider>
```

## 检测暗色模式

```tsx
import { useIsDarkMode } from '@vef-framework-react/components';

export default function MyComponent() {
  const isDark = useIsDarkMode();
  return <div style={{ color: isDark ? '#fff' : '#000' }}>Content</div>;
}
```

## API

### ConfigProviderProps

| Prop | Type | Default | 说明 |
|------|------|---------|-------------|
| `theme` | `ThemeConfig` | — | 主题配置 |
| `children` | `ReactNode` | — | 应用内容 |

### ThemeConfig

| Field | Type | Default | 说明 |
|-------|------|---------|-------------|
| `isDarkMode` | `boolean` | `false` | 启用暗色模式 |
| `colors` | `Partial<Record<SemanticColor, string>>` | — | 覆盖语义化颜色 |
| `globalCssVars` | `Record<'--vef-${string}', string \| number>` | — | 全局 CSS 变量（必须以 `--vef-` 为前缀） |
| `globalStyle` | `CSSInterpolation` | — | 全局 CSS-in-JS 样式 |

### `useIsDarkMode()`

返回 `boolean` 类型——当暗色模式当前处于激活状态时为 `true`。

## 最佳实践

- 将 `ConfigProvider` 放置在应用的根节点，包裹所有内容。
- 在需要适配当前主题的组件中使用 `useIsDarkMode()`。
- CSS 变量名必须以 `--vef-` 开头，以避免冲突。
