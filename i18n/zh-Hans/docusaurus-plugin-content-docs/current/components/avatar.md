---
sidebar_position: 51
---

# Avatar 头像

用于展示用户或事物的图片、图标或文字。

> **来源：** 直接从 `antd` 重新导出。完整文档：[Ant Design Avatar](https://ant.design/components/avatar-cn/)

## 基础用法

```tsx
import { Avatar } from '@vef-framework-react/components';
import { User } from 'lucide-react';

export default function Demo() {
  return (
    <>
      <Avatar src="https://example.com/avatar.jpg" />
      <Avatar icon={<User />} />
      <Avatar>张</Avatar>
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

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `src` | `string` | — | 图片类头像的资源地址 |
| `icon` | `ReactNode` | — | 设置头像的自定义图标 |
| `size` | `'large' \| 'small' \| 'default' \| number` | `'default'` | 设置头像的大小 |
| `shape` | `'circle' \| 'square'` | `'circle'` | 指定头像的形状 |
| `alt` | `string` | — | 图像无法显示时的替代文本 |
| `onError` | `() => boolean` | — | 图片加载失败的事件 |
