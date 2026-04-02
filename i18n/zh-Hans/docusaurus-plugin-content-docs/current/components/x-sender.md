---
sidebar_position: 32
---

# XSender 消息输入框

带发送按钮、文件附件支持和语音输入的消息输入区域。

> **来源：** 从 `@ant-design/x` 重新导出。完整文档：[Ant Design X Sender](https://x.ant.design/components/sender-cn)

## 基础用法

```tsx
import { XSender } from '@vef-framework-react/components';
import { useState } from 'react';

export default function Demo() {
  const [value, setValue] = useState('');

  return (
    <XSender
      value={value}
      onChange={setValue}
      onSubmit={(text) => {
        console.log('发送：', text);
        setValue('');
      }}
      placeholder="请输入问题..."
    />
  );
}
```

## 流式加载状态

```tsx
<XSender
  value={value}
  onChange={setValue}
  onSubmit={handleSend}
  onCancel={handleCancel}
  loading={isStreaming}
  placeholder="请输入问题..."
/>
```

## API

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `value` | `string` | — | 输入值（受控） |
| `defaultValue` | `string` | — | 初始值（非受控） |
| `onChange` | `(value: string) => void` | — | 输入变化回调 |
| `onSubmit` | `(value: string) => void` | — | 发送按钮点击回调 |
| `onCancel` | `() => void` | — | 取消按钮点击回调（`loading` 时显示） |
| `loading` | `boolean` | `false` | 显示取消按钮代替发送按钮 |
| `disabled` | `boolean` | `false` | 禁用输入框 |
| `placeholder` | `string` | — | 占位文本 |
| `allowSpeech` | `boolean` | `false` | 启用语音输入 |
| `header` | `ReactNode` | — | 输入框上方内容 |
| `footer` | `ReactNode` | — | 输入框下方内容 |
| `prefix` | `ReactNode` | — | 输入框前置内容 |
| `actions` | `ReactNode \| false` | — | 自定义操作按钮 |

> 完整 API 请参阅 [Ant Design X Sender 文档](https://x.ant.design/components/sender-cn)。
