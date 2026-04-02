---
sidebar_position: 22
---

# ConfigProvider

VEF's global configuration provider. Wraps Ant Design's `ConfigProvider` with VEF-specific theme support including dark mode, semantic color overrides, and global CSS variables.

> **VEF-specific component.** Extends Ant Design's `ConfigProvider`.

## When to Use

- Set up the global theme at the application root.
- Enable dark mode.
- Override semantic colors.
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

## API

### ConfigProviderProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `theme` | `ThemeConfig` | — | Theme configuration |
| `children` | `ReactNode` | — | Application content |

### ThemeConfig

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `isDarkMode` | `boolean` | `false` | Enable dark mode |
| `colors` | `Partial<Record<SemanticColor, string>>` | — | Override semantic colors |
| `globalCssVars` | `Record<'--vef-${string}', string \| number>` | — | Global CSS variables (must be prefixed with `--vef-`) |
| `globalStyle` | `CSSInterpolation` | — | Global CSS-in-JS styles |

### `useIsDarkMode()`

Returns `boolean` — `true` if dark mode is currently active.

## Best Practices

- Place `ConfigProvider` at the root of your application, wrapping everything.
- Use `useIsDarkMode()` in components that need to adapt to the current theme.
- CSS variable names must start with `--vef-` to avoid conflicts.
