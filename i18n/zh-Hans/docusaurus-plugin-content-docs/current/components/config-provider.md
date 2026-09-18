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
- 为白名单内的组件 props 设置应用级默认值。
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

## 检测暗色模式

```tsx
import { useIsDarkMode } from '@vef-framework-react/components';

export default function MyComponent() {
  const isDark = useIsDarkMode();
  return <div style={{ color: isDark ? '#fff' : '#000' }}>Content</div>;
}
```

## 应用组件默认值

`components` 用于为白名单内的组件 props 设置应用级默认值。显式传入且非 `undefined` 的 prop 优先于应用默认值；两者都未设置时，才使用组件自身的默认值。

```tsx
import { ConfigProvider } from '@vef-framework-react/components';

export default function App() {
  return (
    <ConfigProvider
      components={{
        Form: { labelAlign: 'left', labelWidth: 120 },
        Pagination: { showSizeChanger: false },
        ProTable: { striped: true },
      }}
    >
      <YourApp />
    </ConfigProvider>
  );
}
```

只有以下条目会生效。包含额外 props 的对象字面量会被 TypeScript 拒绝；但在传入 provider 之前预先构造的值，仍会在运行时被过滤：

| 组件 | 可设置默认值的 props |
| --- | --- |
| `Form` | `labelAlign`、`labelWidth` |
| `FormModal` | `draggable` |
| `Image` | `fallback` |
| `Input` | `allowClear`、`autoComplete` |
| `Message` | `duration`、`maxCount` |
| `Notification` | `duration`、`maxCount` |
| `Pagination` | `showSizeChanger` |
| `ProTable` | `rowKey`、`showSequenceColumn`、`striped` |
| `Select` | `showSearch` |
| `TextArea` | `allowClear`、`autoComplete` |

使用 starter 时，请把 `components` 传给 `createApp().render()`，而不是再嵌套一层 `ConfigProvider`。

## API

### ConfigProviderProps

| Prop | Type | Default | 说明 |
|------|------|---------|-------------|
| `theme` | `ThemeConfig` | — | 主题配置 |
| `components` | `ComponentDefaults` | — | 白名单内框架组件的应用级默认 props |
| `children` | `ReactNode` | — | 应用内容 |

### ThemeConfig

| Field | Type | Default | 说明 |
|-------|------|---------|-------------|
| `isDarkMode` | `boolean` | `false` | 启用暗色模式 |
| `colors` | `Partial<Record<SemanticColor, PresetColor \| string>>` | — | 用预设颜色名或任意 CSS 颜色覆盖语义化颜色（`primary` / `success` / `warning` / `error` / ……） |

### `useIsDarkMode()`

返回 `boolean` 类型——当暗色模式当前处于激活状态时为 `true`。

## 最佳实践

- 将 `ConfigProvider` 放置在应用的根节点，包裹所有内容。
- 在需要适配当前主题的组件中使用 `useIsDarkMode()`。
