---
sidebar_position: 40
---

# XSources

Displays reference sources cited by an AI response.

> **Source:** Re-exported from `@ant-design/x`. Full documentation: [Ant Design X Sources](https://x.ant.design/components/sources)

## Basic Usage

```tsx
import { XSources } from '@vef-framework-react/components';

const sources = [
  { key: '1', title: 'VEF Framework Docs', href: 'https://vef.ilxqx.com' },
  { key: '2', title: 'Ant Design', href: 'https://ant.design' },
];

export default function Demo() {
  return <XSources items={sources} />;
}
```

> For the full API, see [Ant Design X Sources docs](https://x.ant.design/components/sources).
