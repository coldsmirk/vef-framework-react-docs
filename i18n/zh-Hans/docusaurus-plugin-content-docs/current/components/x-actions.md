---
sidebar_position: 38
---

# XActions

Action buttons displayed alongside a chat message (copy, like, dislike, retry, etc.).

> **Source:** Re-exported from `@ant-design/x`. Full documentation: [Ant Design X Actions](https://x.ant.design/components/actions)

## Basic Usage

```tsx
import { XBubble, XActions } from '@vef-framework-react/components';
import { CopyOutlined, LikeOutlined } from '@ant-design/icons';

export default function Demo() {
  return (
    <XBubble
      content="Here is my response."
      footer={
        <XActions
          items={[
            { key: 'copy', icon: <CopyOutlined />, label: 'Copy' },
            { key: 'like', icon: <LikeOutlined />, label: 'Like' },
          ]}
          onClick={(info) => console.log(info.key)}
        />
      }
    />
  );
}
```

> For the full API, see [Ant Design X Actions docs](https://x.ant.design/components/actions).
