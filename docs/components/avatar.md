---
title: "Avatar"
description: "Represents a user or entity with an image, icon, or text."
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
| `src` | `ReactNode` | — | Image source (a URL string, or any node for a custom image element) |
| `srcSet` | `string` | — | Image `srcset` for responsive images |
| `icon` | `ReactNode` | — | Icon element |
| `size` | `'large' \| 'medium' \| 'small' \| number \| ScreenSizeMap` | `'medium'` | Avatar size; `'middle'`/`'default'` are deprecated aliases for `'medium'`. Pass a `{ xs, sm, md, lg, xl, xxl }` breakpoint map for a responsive size |
| `shape` | `'circle' \| 'square'` | `'circle'` | Avatar shape |
| `gap` | `number` | — | Horizontal padding between text content and the avatar edge |
| `alt` | `string` | — | Image alt text |
| `draggable` | `boolean \| 'true' \| 'false'` | — | Whether the image is draggable |
| `crossOrigin` | `'' \| 'anonymous' \| 'use-credentials'` | — | `crossOrigin` attribute for the image element |
| `onClick` | `(e?) => void` | — | Click handler |
| `onError` | `() => boolean` | — | Image load error handler |
