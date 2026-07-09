---
title: "Typography"
description: "文本展示类组件：`Title`、`Text`、`Paragraph` 和 `Link`。"
---

# Typography

文本展示类组件：`Title`、`Text`、`Paragraph` 和 `Link`。

> **来源：** 直接从 `antd` 重新导出。完整文档：[Ant Design Typography](https://ant.design/components/typography/)

## 基础用法

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

## 文本变体

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

## 可编辑文本

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

`Title`、`Text`、`Paragraph` 和 `Link` 都是纯 `antd` 重导出（`Typography.Title` / `Typography.Text` / `Typography.Paragraph` / `Typography.Link`），没有任何 VEF 专属属性。下表仅列出最常用的属性；每个组件的完整属性列表（包括此处未列出的 `Link`）请参阅 [Ant Design Typography 文档](https://ant.design/components/typography/)。

### Title

| Prop | Type | Default | 说明 |
|------|------|---------|-------------|
| `level` | `1 \| 2 \| 3 \| 4 \| 5` | `1` | 标题级别 |
| `type` | `'secondary' \| 'success' \| 'warning' \| 'danger'` | — | 文本类型 |
| `copyable` | `boolean \| CopyConfig` | `false` | 启用复制 |
| `ellipsis` | `boolean \| EllipsisConfig` | `false` | 溢出省略 |

### Text / Paragraph

| Prop | Type | Default | 说明 |
|------|------|---------|-------------|
| `type` | `'secondary' \| 'success' \| 'warning' \| 'danger'` | — | 文本类型 |
| `strong` | `boolean` | `false` | 加粗 |
| `italic` | `boolean` | `false` | 斜体 |
| `underline` | `boolean` | `false` | 下划线 |
| `delete` | `boolean` | `false` | 删除线 |
| `code` | `boolean` | `false` | 代码样式 |
| `disabled` | `boolean` | `false` | 禁用样式 |
| `copyable` | `boolean \| CopyConfig` | `false` | 启用复制 |
| `editable` | `boolean \| EditConfig` | `false` | 启用编辑 |
| `ellipsis` | `boolean \| EllipsisConfig` | `false` | 溢出省略 |
