---
sidebar_position: 15
---

# Loader

A full-screen or inline loading indicator with an optional description.

> **VEF-specific component.** Not part of Ant Design.

## When to Use

- Display a loading state while a page or section is fetching data.
- Use as a full-page overlay during route transitions.

## Basic Usage

```tsx
import { Loader } from '@vef-framework-react/components';

export default function Demo() {
  return <Loader />;
}
```

## With Description

```tsx
import { Loader } from '@vef-framework-react/components';

export default function Demo() {
  return <Loader description="Loading data, please wait..." />;
}
```

## Custom Size

```tsx
import { Loader } from '@vef-framework-react/components';

export default function Demo() {
  return <Loader size="large" description="Initializing..." descriptionSize={16} />;
}
```

## Conditional Rendering

```tsx
import { Loader } from '@vef-framework-react/components';

export default function Page({ isLoading }: { isLoading: boolean }) {
  if (isLoading) {
    return <Loader description="Loading page..." />;
  }
  return <div>Page content</div>;
}
```

## API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'small' \| 'default' \| 'large' \| number` | — | Spinner size |
| `description` | `ReactNode` | — | Text shown below the spinner |
| `descriptionSize` | `number` | — | Font size of the description in pixels |

## Best Practices

- Use `Loader` for page-level loading states; use Ant Design's `Spin` for inline/component-level loading.
- Provide a `description` to give users context about what is loading.
