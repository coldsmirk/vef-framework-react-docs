---
title: "ConfigProvider"
description: "VEF's global configuration provider. Wraps Ant Design's `ConfigProvider` with VEF-specific theme support including dark mode, semantic color overrides, and global CSS variables."
---

# ConfigProvider

VEF's global configuration provider. Wraps Ant Design's `ConfigProvider` with VEF-specific theme support including dark mode, semantic color overrides, and global CSS variables.

> **VEF-specific component.** Extends Ant Design's `ConfigProvider`.

## When to Use

- Set up the global theme at the application root.
- Enable dark mode.
- Override semantic colors.
- Set application-wide defaults for whitelisted component props.
- Inject global CSS variables.

## Basic Usage

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

## Dark Mode

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

## Custom Colors

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

## Global CSS Variables

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

## Detect Dark Mode

```tsx
import { useIsDarkMode } from '@vef-framework-react/components';

export default function MyComponent() {
  const isDark = useIsDarkMode();
  return <div style={{ color: isDark ? '#fff' : '#000' }}>Content</div>;
}
```

## Application Component Defaults

`components` sets application-wide defaults for a whitelisted set of component props. An explicitly passed prop always wins over the application default, and the component's own default applies only when neither is set.

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

Only these entries are honored; props outside the whitelist are ignored at runtime and rejected by TypeScript:

| Component | Defaultable props |
| --- | --- |
| `Form` | `labelAlign`, `labelWidth` |
| `FormModal` | `draggable` |
| `Image` | `fallback` |
| `Input` | `allowClear`, `autoComplete` |
| `Message` | `duration`, `maxCount` |
| `Notification` | `duration`, `maxCount` |
| `Pagination` | `showSizeChanger` |
| `ProTable` | `rowKey`, `showSequenceColumn`, `striped` |
| `Select` | `showSearch` |
| `TextArea` | `allowClear`, `autoComplete` |

For the starter, pass `components` to `createApp().render()` instead of nesting another `ConfigProvider`.

## API

### ConfigProviderProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `theme` | `ThemeConfig` | — | Theme configuration |
| `components` | `ComponentDefaults` | — | Application-wide default props for whitelisted framework components |
| `children` | `ReactNode` | — | Application content |

### ThemeConfig

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `isDarkMode` | `boolean` | `false` | Enable dark mode |
| `colors` | `Partial<Record<SemanticColor, PresetColor \| string>>` | — | Override semantic colors (`primary` / `success` / `warning` / `error` / …) with a preset color name or any CSS color |
| `globalCssVars` | `Record<'--vef-${string}', string \| number>` | — | Global CSS variables (must be prefixed with `--vef-`) |
| `globalStyle` | `CSSInterpolation` | — | Global CSS-in-JS styles |

### `useIsDarkMode()`

Returns `boolean` — `true` if dark mode is currently active.

## Best Practices

- Place `ConfigProvider` at the root of your application, wrapping everything.
- Use `useIsDarkMode()` in components that need to adapt to the current theme.
- CSS variable names must start with `--vef-` to avoid conflicts.
