---
sidebar_position: 51
---

# Avatar

Represents a user or entity with an image, icon, or text.

> **Source:** Re-exported from `antd`. Full documentation: [Ant Design Avatar](https://ant.design/components/avatar/)

## Basic Usage

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

## Avatar Group

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

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | — | Image source URL |
| `icon` | `ReactNode` | — | Icon element |
| `size` | `'large' \| 'small' \| 'default' \| number` | `'default'` | Avatar size |
| `shape` | `'circle' \| 'square'` | `'circle'` | Avatar shape |
| `alt` | `string` | — | Image alt text |
| `onError` | `() => boolean` | — | Image load error handler |
