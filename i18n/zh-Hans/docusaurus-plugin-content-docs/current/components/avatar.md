---
title: "Avatar"
description: "用图片、图标或文字来表示一个用户或实体。"
---

# Avatar

用图片、图标或文字来表示一个用户或实体。

> **来源：** 直接从 `antd` 重新导出。完整文档：[Ant Design Avatar](https://ant.design/components/avatar/)

## 基础用法

```tsx
import { Avatar } from '@vef-framework-react/components';
import { User } from 'lucide-react';

export default function Demo() {
  return (
    <>
      <Avatar src="https://example.com/avatar.jpg" />
      <Avatar icon={<User />} />
      <Avatar>AB</Avatar>
    </>
  );
}
```

## 头像组

```tsx
import { Avatar } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <Avatar.Group max={{ count: 3 }}>
      <Avatar src="user1.jpg" />
      <Avatar src="user2.jpg" />
      <Avatar src="user3.jpg" />
      <Avatar src="user4.jpg" />
    </Avatar.Group>
  );
}
```

## API

| Prop | Type | Default | 说明 |
|------|------|---------|-------------|
| `src` | `ReactNode` | — | 图片资源（URL 字符串，或用于自定义图片元素的任意节点） |
| `srcSet` | `string` | — | 用于响应式图片的 `srcset` |
| `icon` | `ReactNode` | — | 图标元素 |
| `size` | `'large' \| 'medium' \| 'small' \| number \| ScreenSizeMap` | `'medium'` | 头像大小；`'middle'`/`'default'` 是 `'medium'` 的废弃别名。传入 `{ xs, sm, md, lg, xl, xxl }` 断点映射可实现响应式大小 |
| `shape` | `'circle' \| 'square'` | `'circle'` | 头像形状 |
| `gap` | `number` | — | 文字内容与头像边缘之间的水平内边距 |
| `alt` | `string` | — | 图片替代文本 |
| `draggable` | `boolean \| 'true' \| 'false'` | — | 图片是否可拖拽 |
| `crossOrigin` | `'' \| 'anonymous' \| 'use-credentials'` | — | 图片元素的 `crossOrigin` 属性 |
| `onClick` | `(e?) => void` | — | 点击回调 |
| `onError` | `() => boolean` | — | 图片加载失败回调 |
