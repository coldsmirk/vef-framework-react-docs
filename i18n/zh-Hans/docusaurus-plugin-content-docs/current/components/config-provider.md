---
sidebar_position: 22
---

# ConfigProvider 全局配置

VEF 的全局配置提供者，在 Ant Design `ConfigProvider` 基础上增加了 VEF 特有的主题支持，包括暗色模式、语义色覆盖和全局 CSS 变量。

> **VEF 特有组件**，扩展自 Ant Design `ConfigProvider`。

## 何时使用

- 在应用根节点配置全局主题。
- 启用暗色模式。
- 覆盖语义色。
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
  return <div style={{ color: isDark ? '#fff' : '#000' }}>内容</div>;
}
```

## API

### ConfigProviderProps

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `theme` | `ThemeConfig` | — | 主题配置 |
| `children` | `ReactNode` | — | 应用内容 |

### ThemeConfig

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `isDarkMode` | `boolean` | `false` | 启用暗色模式 |
| `colors` | `Partial<Record<SemanticColor, string>>` | — | 覆盖语义色 |
| `globalCssVars` | `Record<'--vef-${string}', string \| number>` | — | 全局 CSS 变量（必须以 `--vef-` 开头） |
| `globalStyle` | `CSSInterpolation` | — | 全局 CSS-in-JS 样式 |

### `useIsDarkMode()`

返回 `boolean`——当前是否为暗色模式。

## 最佳实践

- 将 `ConfigProvider` 放在应用根节点，包裹所有内容。
- 在需要适配当前主题的组件中使用 `useIsDarkMode()`。
- CSS 变量名必须以 `--vef-` 开头，避免冲突。
