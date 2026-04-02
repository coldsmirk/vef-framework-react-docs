---
sidebar_position: 107
---

# Typography

Text display components: `Title`, `Text`, `Paragraph`, and `Link`.

> **Source:** Re-exported from `antd`. Full documentation: [Ant Design Typography](https://ant.design/components/typography/)

## Basic Usage

```tsx
import { Title, Text, Paragraph, Link } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <>
      <Title>h1. Heading</Title>
      <Title level={2}>h2. Heading</Title>
      <Paragraph>
        This is a paragraph with <Text strong>bold</Text> and{' '}
        <Text type="danger">danger</Text> text.
      </Paragraph>
      <Link href="https://ant.design">Ant Design</Link>
    </>
  );
}
```

## Text Variants

```tsx
import { Text, Space } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <Space direction="vertical">
      <Text>Default</Text>
      <Text type="secondary">Secondary</Text>
      <Text type="success">Success</Text>
      <Text type="warning">Warning</Text>
      <Text type="danger">Danger</Text>
      <Text disabled>Disabled</Text>
      <Text strong>Bold</Text>
      <Text italic>Italic</Text>
      <Text underline>Underline</Text>
      <Text delete>Strikethrough</Text>
      <Text code>Code</Text>
    </Space>
  );
}
```

## Editable Text

```tsx
import { Paragraph } from '@vef-framework-react/components';
import { useState } from 'react';

export default function Demo() {
  const [text, setText] = useState('Editable paragraph');
  return (
    <Paragraph editable={{ onChange: setText }}>{text}</Paragraph>
  );
}
```

## API

### Title

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `level` | `1 \| 2 \| 3 \| 4 \| 5` | `1` | Heading level |
| `type` | `'secondary' \| 'success' \| 'warning' \| 'danger'` | — | Text type |
| `copyable` | `boolean \| CopyConfig` | `false` | Enable copy |
| `ellipsis` | `boolean \| EllipsisConfig` | `false` | Overflow ellipsis |

### Text / Paragraph

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `'secondary' \| 'success' \| 'warning' \| 'danger'` | — | Text type |
| `strong` | `boolean` | `false` | Bold |
| `italic` | `boolean` | `false` | Italic |
| `underline` | `boolean` | `false` | Underline |
| `delete` | `boolean` | `false` | Strikethrough |
| `code` | `boolean` | `false` | Code style |
| `disabled` | `boolean` | `false` | Disabled style |
| `copyable` | `boolean \| CopyConfig` | `false` | Enable copy |
| `editable` | `boolean \| EditConfig` | `false` | Enable editing |
| `ellipsis` | `boolean \| EllipsisConfig` | `false` | Overflow ellipsis |
