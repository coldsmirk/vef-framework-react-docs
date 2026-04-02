---
sidebar_position: 30
---

# AI 组件（X 系列）总览

VEF Framework 集成了来自 [`@ant-design/x`](https://x.ant.design/) 的 AI/对话 UI 组件，以 `X` 前缀重新导出。这些组件专为构建 AI 驱动的对话界面而设计。

> **来源：** 从 `@ant-design/x` 重新导出。完整文档：[Ant Design X](https://x.ant.design/components/overview-cn)

## 可用组件

| 导出名称 | Ant Design X 组件 | 说明 |
|---------|-----------------|------|
| [`XBubble`](./x-bubble) | `Bubble` | 对话消息气泡 |
| [`XSender`](./x-sender) | `Sender` | 带发送按钮的消息输入框 |
| [`XConversations`](./x-conversations) | `Conversations` | 会话列表 |
| [`XPrompts`](./x-prompts) | `Prompts` | 建议提示词列表 |
| [`XThoughtChain`](./x-thought-chain) | `ThoughtChain` | AI 推理链展示 |
| [`XWelcome`](./x-welcome) | `Welcome` | 欢迎屏幕 |
| [`XAttachments`](./x-attachments) | `Attachments` | 文件附件区域 |
| [`XActions`](./x-actions) | `Actions` | 消息操作按钮 |
| [`XSuggestion`](./x-suggestion) | `Suggestion` | 内联建议列表 |
| [`XSources`](./x-sources) | `Sources` | 参考来源展示 |
| [`XFileCard`](./x-file-card) | `FileCard` | 文件预览卡片 |
| [`XThink`](./x-think) | `Think` | AI 思考/加载指示器 |
| [`XNotification`](./x-notification) | `notification` | AI 通知工具函数 |
| [`XMarkdown`](./x-markdown) | VEF 封装 | 支持流式的 Markdown 渲染器 |
| [`XMermaid`](./x-mermaid) | VEF 封装 | Mermaid 图表渲染器 |
| [`XCodeHighlighter`](./x-code-highlighter) | VEF 封装 | AI 响应中的代码块 |

## 导入

```tsx
import {
  XBubble,
  XSender,
  XConversations,
  XMarkdown,
} from '@vef-framework-react/components';
```

## 最简对话示例

```tsx
import { XBubble, XSender, Stack } from '@vef-framework-react/components';
import { useState } from 'react';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatDemo() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [value, setValue] = useState('');

  const handleSend = (text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role: 'user', content: text },
    ]);
    setValue('');
    // 在此调用 AI API...
  };

  return (
    <Stack style={{ height: '100%' }}>
      <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
        {messages.map((msg) => (
          <XBubble
            key={msg.id}
            placement={msg.role === 'user' ? 'end' : 'start'}
            content={msg.content}
          />
        ))}
      </div>
      <XSender
        value={value}
        onChange={setValue}
        onSubmit={handleSend}
        placeholder="请输入问题..."
      />
    </Stack>
  );
}
```
