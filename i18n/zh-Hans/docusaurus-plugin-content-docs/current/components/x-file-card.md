---
sidebar_position: 41
---

# XFileCard

A file preview card for displaying uploaded files in AI chat interfaces.

> **Source:** Re-exported from `@ant-design/x`. Full documentation: [Ant Design X FileCard](https://x.ant.design/components/file-card)

## Basic Usage

```tsx
import { XFileCard } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <XFileCard
      item={{
        uid: '1',
        name: 'report.pdf',
        size: 204800,
        status: 'done',
      }}
    />
  );
}
```

> For the full API, see [Ant Design X FileCard docs](https://x.ant.design/components/file-card).
