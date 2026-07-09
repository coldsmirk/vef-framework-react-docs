---
title: "GenericSelect"
description: "弹出式选择控件的抽象基座——保留 antd Select 触发器外观，弹出层内容任意自定义。"
---

# GenericSelect

弹出式选择控件的抽象基座：一个具备 Ant Design `Select` 外观的触发器，其下拉内容被替换为任意自定义界面。它负责样式化触发器（选中值展示、size/status/variant/清除/禁用）、受控的展开状态、触发器内的搜索框以及弹出层容器；具体组件只需提供弹出层内容以及值的渲染方式。

> **VEF 专属组件。** 并非 Ant Design 的一部分。它是 [`IconPicker`](./icon-picker.md) 所基于的基座。

## 何时使用

- 需要构建一个自定义的下拉式选择控件——例如图标网格、数据表选择器、色板选择器——它需要 `Select` 的触发器外观（值展示、size/status/variant、清除按钮、搜索框），但弹出层不是一个简单列表。
- 当扁平的选项列表就足够时，直接使用 [`Select`](./select.md)；当弹出层需要自定义组件时，使用 `GenericSelect`。

## 基础用法

```tsx
import { GenericSelect } from '@vef-framework-react/components';
import type { GenericSelectPopupApi } from '@vef-framework-react/components';
import { useState } from 'react';

function ColorPopup({ value, select, close }: GenericSelectPopupApi<string>) {
  return (
    <div style={{ display: 'flex', gap: 8, padding: 8 }}>
      {['red', 'green', 'blue'].map((color) => (
        <button
          key={color}
          style={{ background: color, width: 24, height: 24 }}
          onClick={() => {
            select(color);
            close();
          }}
        />
      ))}
    </div>
  );
}

export default function Demo() {
  const [color, setColor] = useState<string | null>(null);

  return (
    <GenericSelect<string>
      placeholder="Pick a color"
      value={color}
      renderLabel={(value) => value}
      renderPopup={(api) => <ColorPopup {...api} />}
      onChange={setColor}
    />
  );
}
```

## 弹出层 API

`renderPopup` 会接收一个 `GenericSelectPopupApi` 对象，因此弹出层内容永远不需要触碰底层的 antd `Select`：

| 成员 | 类型 | 说明 |
|--------|------|-------------|
| `value` | `TValue \| null` | 当前选中值，用于高亮激活的选项 |
| `keyword` | `string` | 在触发器中输入的、经过防抖处理的搜索关键字；非搜索状态下为 `""` |
| `open` | `boolean` | 弹出层当前是否展开——可用于将开销较大的工作（数据获取、虚拟化测量）推迟到首次打开时进行 |
| `select` | `(value: TValue) => void` | 提交一个值，转发给 `onChange`。**不会**关闭弹出层 |
| `close` | `() => void` | 关闭弹出层，不改变已选中的值 |

## 自定义标签渲染

```tsx
<GenericSelect<string>
  value={value}
  renderLabel={(value) => <strong>{value}</strong>}
  renderPopup={renderPopup}
  onChange={setValue}
/>
```

## 受控展开状态

```tsx
const [isOpen, setIsOpen] = useState(false);

<GenericSelect<string>
  open={isOpen}
  renderPopup={renderPopup}
  onOpenChange={setIsOpen}
/>
```

## API

### GenericSelectProps\<TValue\>

`TValue` 是可选择的值类型，会被转发给底层的 antd `Select` 作为其值——必须是 `string` 或 `number`。

| Prop | 类型 | 默认值 | 说明 |
|------|------|---------|-------------|
| `value` | `TValue \| null` | — | 已选中的值；`null`/`undefined` 时渲染占位内容 |
| `onChange` | `(value: TValue \| null) => void` | — | 从弹出层提交值时触发，清除时为 `null` |
| `onBlur` | `() => void` | — | 触发器失焦时触发 |
| `open` | `boolean` | — | 弹出层的受控展开状态 |
| `defaultOpen` | `boolean` | `false` | 非受控模式下的初始展开状态；提供 `open` 时忽略 |
| `onOpenChange` | `(open: boolean) => void` | — | 弹出层展开或关闭时触发 |
| `renderPopup` | `(api: GenericSelectPopupApi<TValue>) => ReactNode` | 必填 | 渲染弹出层内容 |
| `renderLabel` | `(value: TValue) => ReactNode` | 原始值 | 渲染触发器内选中的值 |
| `searchable` | `boolean` | `true` | 在触发器中显示搜索框，并将关键字转发给弹出层 |
| `placeholder` | `ReactNode` | — | 未选中值时显示的占位内容 |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | 密度预设 |
| `status` | `'error' \| 'warning'` | — | 校验状态 |
| `variant` | `'outlined' \| 'filled' \| 'borderless' \| 'underlined'` | `'outlined'` | 触发器的视觉变体 |
| `disabled` | `boolean` | `false` | 禁用控件 |
| `allowClear` | `boolean` | `false` | 显示清除按钮，将值重置为 `null` |
| `loading` | `boolean` | `false` | 将触发器渲染为加载状态 |
| `suffixIcon` | `ReactNode` | — | 自定义后缀图标；当弹出层展开且 `searchable` 时会被搜索图标覆盖 |
| `prefix` | `ReactNode` | — | 渲染在触发器内值之前的内容 |
| `getPopupContainer` | `(triggerNode: HTMLElement) => HTMLElement` | `document.body` | 弹出层渲染到的容器元素 |
| `popupMatchSelectWidth` | `boolean \| number` | `false` | 弹出层宽度是否与触发器宽度一致 |
| `popupClassName` | `string` | — | 弹出层根节点的附加类名 |
| `className` | `string` | — | 触发器上的附加类名 |
| `style` | `CSSProperties` | — | 触发器上的内联样式 |

### GenericSelectRef

| 成员 | 类型 | 说明 |
|--------|------|-------------|
| `focus` | `() => void` | 将焦点移入触发器 |
| `blur` | `() => void` | 移除触发器焦点 |

### GenericSelectStatus / GenericSelectVariant

```ts
type GenericSelectStatus = "error" | "warning";
type GenericSelectVariant = "outlined" | "filled" | "borderless" | "underlined";
```
