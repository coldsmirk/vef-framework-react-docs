---
sidebar_position: 42
---

# XThink

An AI thinking/loading indicator shown while the model is processing.

> **Source:** Re-exported from `@ant-design/x`. Full documentation: [Ant Design X Think](https://x.ant.design/components/think)

## Basic Usage

```tsx
import { XThink } from '@vef-framework-react/components';

export default function Demo() {
  return <XThink status="thinking" />;
}
```

## API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `status` | `'thinking' \| 'done'` | — | Current thinking status |
| `children` | `ReactNode` | — | Content shown when done |

> For the full API, see [Ant Design X Think docs](https://x.ant.design/components/think).
