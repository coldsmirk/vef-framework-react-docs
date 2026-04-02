---
sidebar_position: 107
---

# Typography 排版

文本展示组件：`Title`（标题）、`Text`（文本）、`Paragraph`（段落）、`Link`（链接）。

> **来源：** 直接从 `antd` 重新导出。完整文档：[Ant Design Typography](https://ant.design/components/typography-cn/)

## 基础用法

```tsx
import { Title, Text, Paragraph, Link } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <>
      <Title>一级标题</Title>
      <Title level={2}>二级标题</Title>
      <Paragraph>
        这是一段文字，包含 <Text strong>加粗</Text> 和{' '}
        <Text type="danger">危险</Text> 样式。
      </Paragraph>
      <Link href="https://ant.design">Ant Design</Link>
    </>
  );
}
```

## 文本类型

```tsx
import { Text, Space } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <Space direction="vertical">
      <Text>默认</Text>
      <Text type="secondary">次要</Text>
      <Text type="success">成功</Text>
      <Text type="warning">警告</Text>
      <Text type="danger">危险</Text>
      <Text disabled>禁用</Text>
      <Text strong>加粗</Text>
      <Text italic>斜体</Text>
      <Text underline>下划线</Text>
      <Text delete>删除线</Text>
      <Text code>代码</Text>
    </Space>
  );
}
```

## 可编辑文本

```tsx
import { Paragraph } from '@vef-framework-react/components';
import { useState } from 'react';

export default function Demo() {
  const [text, setText] = useState('可编辑段落');
  return (
    <Paragraph editable={{ onChange: setText }}>{text}</Paragraph>
  );
}
```

## API

### Title

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `level` | `1 \| 2 \| 3 \| 4 \| 5` | `1` | 重要程度，对应 h1-h5 |
| `type` | `'secondary' \| 'success' \| 'warning' \| 'danger'` | — | 文本类型 |
| `copyable` | `boolean \| CopyConfig` | `false` | 是否可拷贝 |
| `ellipsis` | `boolean \| EllipsisConfig` | `false` | 自动溢出省略 |

### Text / Paragraph

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `'secondary' \| 'success' \| 'warning' \| 'danger'` | — | 文本类型 |
| `strong` | `boolean` | `false` | 是否加粗 |
| `italic` | `boolean` | `false` | 是否斜体 |
| `underline` | `boolean` | `false` | 是否有下划线样式 |
| `delete` | `boolean` | `false` | 是否有删除线样式 |
| `code` | `boolean` | `false` | 是否有代码样式 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `copyable` | `boolean \| CopyConfig` | `false` | 是否可拷贝 |
| `editable` | `boolean \| EditConfig` | `false` | 是否可编辑 |
| `ellipsis` | `boolean \| EllipsisConfig` | `false` | 自动溢出省略 |
