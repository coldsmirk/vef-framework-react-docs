---
sidebar_position: 30
---

# AI Components (X) Overview

VEF Framework includes a set of AI/chat UI components from [`@ant-design/x`](https://x.ant.design/), re-exported with the `X` prefix. These components are designed for building AI-powered conversational interfaces.

> **Source:** Re-exported from `@ant-design/x`. Full documentation: [Ant Design X](https://x.ant.design/components/overview)

## Available Components

| Export Name | Ant Design X Component | Description |
|-------------|----------------------|-------------|
| [`XBubble`](./x-bubble) | `Bubble` | Chat message bubble |
| [`XSender`](./x-sender) | `Sender` | Message input with send button |
| [`XConversations`](./x-conversations) | `Conversations` | Conversation list |
| [`XPrompts`](./x-prompts) | `Prompts` | Suggested prompt list |
| [`XThoughtChain`](./x-thought-chain) | `ThoughtChain` | AI reasoning chain display |
| [`XWelcome`](./x-welcome) | `Welcome` | Welcome screen |
| [`XAttachments`](./x-attachments) | `Attachments` | File attachment area |
| [`XActions`](./x-actions) | `Actions` | Message action buttons |
| [`XSuggestion`](./x-suggestion) | `Suggestion` | Inline suggestion list |
| [`XSources`](./x-sources) | `Sources` | Reference sources display |
| [`XFileCard`](./x-file-card) | `FileCard` | File preview card |
| [`XThink`](./x-think) | `Think` | AI thinking/loading indicator |
| [`XNotification`](./x-notification) | `notification` | AI notification utility |
| [`XMarkdown`](./x-markdown) | VEF wrapper | Markdown renderer with streaming |
| [`XMermaid`](./x-mermaid) | VEF wrapper | Mermaid diagram renderer |
| [`XCodeHighlighter`](./x-code-highlighter) | VEF wrapper | Code block for AI responses |

## Import

```tsx
import {
  XBubble,
  XSender,
  XConversations,
  XMarkdown,
} from '@vef-framework-react/components';
```

## Minimal Chat Example

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
    // Call your AI API here...
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
        placeholder="Ask anything..."
      />
    </Stack>
  );
}
```
