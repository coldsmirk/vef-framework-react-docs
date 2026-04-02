---
sidebar_position: 28
---

# SplitText 分割文字动画

使用 GSAP 将文字拆分为字符、单词或行并逐一播放动画。

> **VEF 特有组件**，不属于 Ant Design。

## 基础用法

```tsx
import { SplitText } from '@vef-framework-react/components';

export default function Demo() {
  return <SplitText text="Hello World" />;
}
```

## 按单词拆分，自定义动画

```tsx
<SplitText
  tag="h1"
  text="欢迎使用 VEF Framework"
  splitType="words"
  duration={0.8}
  delay={80}
  from={{ opacity: 0, y: 60 }}
  to={{ opacity: 1, y: 0 }}
/>
```

## 滚动触发

```tsx
<SplitText text="滚动到此处时文字开始动画" threshold={0.3} />
```

## API

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `text` | `string` | 必填 | 要动画的文字内容 |
| `tag` | `'h1' \| 'h2' \| 'h3' \| 'h4' \| 'h5' \| 'h6' \| 'p' \| 'span'` | `'p'` | 渲染的 HTML 标签 |
| `splitType` | `'chars' \| 'words' \| 'lines' \| 'words, chars'` | `'chars'` | 拆分方式 |
| `delay` | `number` | `100` | 每个单元动画间隔（毫秒） |
| `duration` | `number` | `0.6` | 每个单元动画时长（秒） |
| `ease` | `string \| function` | `'power3.out'` | GSAP 缓动函数 |
| `from` | `gsap.TweenVars` | `{ opacity: 0, y: 40 }` | 初始 GSAP 属性 |
| `to` | `gsap.TweenVars` | `{ opacity: 1, y: 0 }` | 目标 GSAP 属性 |
| `threshold` | `number` | `0.1` | 触发动画的交叉比例（0–1） |
| `className` | `string` | — | CSS 类名 |
