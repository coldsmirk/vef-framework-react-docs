---
sidebar_position: 101
---

# Page

业务页面的主容器，支持左右侧边栏、页头、页脚、操作栏和可滚动内容区域。

> **VEF 专属组件。** 在 v2.1.6 中从 `@vef-framework-react/starter` 迁移到 `@vef-framework-react/components`。

## 适用场景

- 任何需要统一布局外壳的标准业务页面。
- 左侧树形结构 + 右侧内容区域的分栏页面。
- 需要固定页头或页脚的页面。

## 基础用法

```tsx
import { Page } from '@vef-framework-react/components';

export default function UserPage() {
  return (
    <Page>
      <div>主内容</div>
    </Page>
  );
}
```

## 带左侧边栏

```tsx
import { Page } from '@vef-framework-react/components';

export default function UserPage() {
  return (
    <Page
      leftAside={<DeptTree />}
      leftAsideWidth={260}
    >
      <UserTable />
    </Page>
  );
}
```

## 可调整宽度的侧边栏

```tsx
<Page
  leftAside={<DeptTree />}
  leftAsideWidth={{ defaultWidth: 260, minWidth: 180, maxWidth: 400 }}
>
  <UserTable />
</Page>
```

## 带页头和页脚

```tsx
<Page
  header={<PageTitle>用户管理</PageTitle>}
  headerPosition="outside"
  footer={<StatusBar />}
  footerPosition="inside"
>
  <UserTable />
</Page>
```

## API

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `margin` | `boolean` | `false` | 为容器应用 `var(--vef-spacing-md)` 外边距 |
| `gap` | `Length` | `var(--vef-spacing-md)` | 网格单元格间距 |
| `leftAside` | `ReactNode` | — | 左侧边栏内容 |
| `leftAsideWidth` | `AsideWidth` | `280` | 固定宽度或可调整配置 |
| `rightAside` | `ReactNode` | — | 右侧边栏内容 |
| `rightAsideWidth` | `AsideWidth` | `280` | 固定宽度或可调整配置 |
| `header` | `ReactNode` | — | 页头内容 |
| `headerPosition` | `'inside' \| 'outside'` | `'inside'` | `'outside'` 时跨越全宽（包含侧边栏） |
| `footer` | `ReactNode` | — | 页脚内容 |
| `footerPosition` | `'inside' \| 'outside'` | `'inside'` | `'outside'` 时跨越全宽（包含侧边栏） |
| `actionBar` | `ReactNode` | — | 操作栏内容 |
| `scrollable` | `boolean` | — | 主内容区域是否可滚动 |
| `scrollMargin` | `boolean` | `false` | 为滚动条自动添加外边距（需开启 `scrollable`） |

### `AsideWidth`

```ts
type AsideWidth = string | number | {
  defaultWidth?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
};
```

### `useViewportHeight`

与 `Page` 一同导出的 hook，用于计算可用视口高度：

```ts
import { useViewportHeight } from '@vef-framework-react/components';

const height = useViewportHeight();
```
