---
sidebar_position: 31
---

# XBubble 对话气泡

用于展示 AI 和用户消息的对话气泡组件。

> **来源：** 从 `@ant-design/x` 重新导出。完整文档：[Ant Design X Bubble](https://x.ant.design/components/bubble-cn)

## 基础用法

```tsx
import { XBubble } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <>
      <XBubble content="你好！有什么可以帮你的？" placement="start" />
      <XBubble content="介绍一下 VEF Framework。" placement="end" />
    </>
  );
}
```

## 带头像

```tsx
<XBubble
  content="我来帮你解答！"
  placement="start"
  avatar={{ src: '/ai-avatar.png', alt: 'AI' }}
/>
```

## Markdown 内容

```tsx
import { XBubble, XMarkdown } from '@vef-framework-react/components';

<XBubble
  placement="start"
  content="这是一段 **Markdown** 内容，包含 `代码`。"
  messageRender={(content) => <XMarkdown>{content}</XMarkdown>}
/>
```

## 流式/加载状态

```tsx
<XBubble
  placement="start"
  content={streamingContent}
  loading={isStreaming && !streamingContent}
/>
```

## API

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `content` | `ReactNode` | — | 消息内容 |
| `placement` | `'start' \| 'end'` | `'start'` | 气泡位置（start=左，end=右） |
| `avatar` | `AvatarProps \| ReactNode` | — | 头像配置或元素 |
| `loading` | `boolean` | `false` | 显示加载动画 |
| `typing` | `boolean \| { step, interval }` | `false` | 打字动画配置 |
| `messageRender` | `(content: string) => ReactNode` | — | 自定义内容渲染器 |
| `header` | `ReactNode` | — | 气泡上方内容 |
| `footer` | `ReactNode` | — | 气泡下方内容 |
| `shape` | `'round' \| 'corner'` | `'round'` | 气泡形状 |
| `variant` | `'filled' \| 'borderless' \| 'outlined' \| 'shadow'` | `'filled'` | 视觉变体 |

> 完整 API 请参阅 [Ant Design X Bubble 文档](https://x.ant.design/components/bubble-cn)。
