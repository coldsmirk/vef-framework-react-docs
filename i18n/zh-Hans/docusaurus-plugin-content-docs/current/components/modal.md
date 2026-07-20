---
title: "Modal"
description: "一种会中断用户操作、用于展示重要信息或请求用户决策的对话框浮层。"
---

# Modal

一种会中断用户操作、用于展示重要信息或请求用户决策的对话框浮层。

> **来源：** 对 `antd` Modal 进行封装，新增了 `draggable` 属性。完整文档：[Ant Design Modal](https://ant.design/components/modal/)

## 何时使用

- 在执行破坏性操作前需要用户确认时。
- 需要在不离开当前页面的情况下展示补充内容时。
- 需要收集少量用户输入时。

## 基础用法

```tsx
import { Modal, Button } from '@vef-framework-react/components';
import { useState } from 'react';

export default function Demo() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="primary" onClick={() => setOpen(true)}>
        Open Modal
      </Button>
      <Modal
        title="Basic Modal"
        open={open}
        onOk={() => setOpen(false)}
        onCancel={() => setOpen(false)}
      >
        <p>Modal content goes here.</p>
      </Modal>
    </>
  );
}
```

## 异步确定操作

```tsx
import { Modal, Button } from '@vef-framework-react/components';
import { useState } from 'react';

export default function Demo() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOk = async () => {
    setLoading(true);
    await saveData();
    setLoading(false);
    setOpen(false);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open</Button>
      <Modal
        title="Save Changes"
        open={open}
        onOk={handleOk}
        confirmLoading={loading}
        onCancel={() => setOpen(false)}
      >
        <p>Are you sure you want to save?</p>
      </Modal>
    </>
  );
}
```

## 确认对话框

对于简单的确认操作，使用静态方法 `Modal.confirm`：

```tsx
import { Modal } from '@vef-framework-react/components';

function handleDelete(id: number) {
  Modal.confirm({
    title: 'Delete Record',
    content: 'This action cannot be undone. Continue?',
    okText: 'Delete',
    okType: 'danger',
    onOk: () => deleteRecord(id),
  });
}
```

> 对于行内的确认按钮，建议改用 [`ActionButton`](./action-button) 配合 `confirmable` 属性。

## 自定义页脚

```tsx
<Modal
  title="Custom Footer"
  open={open}
  footer={[
    <Button key="back" onClick={() => setOpen(false)}>Return</Button>,
    <Button key="submit" type="primary" onClick={handleOk}>Submit</Button>,
  ]}
>
  <p>Content</p>
</Modal>
```

## 无页脚

```tsx
<Modal title="Info" open={open} footer={null} onCancel={() => setOpen(false)}>
  <p>Read-only content.</p>
</Modal>
```

## 可拖拽

VEF 新增了 `draggable` 属性（`@default false`），开启后用户可以通过拖拽对话框头部来移动它。

```tsx
<Modal title="Draggable Modal" open={open} draggable onCancel={() => setOpen(false)}>
  <p>Drag the header to move this modal.</p>
</Modal>
```

## API

| Prop | Type | Default | 说明 |
|------|------|---------|-------------|
| `open` | `boolean` | `false` | 对话框是否可见 |
| `draggable` | `boolean` | `false` | 是否可以通过头部拖拽对话框（VEF 新增） |
| `title` | `ReactNode` | — | 对话框标题 |
| `children` | `ReactNode` | — | 对话框主体内容 |
| `footer` | `ReactNode \| null` | — | 自定义页脚；`null` 表示隐藏页脚 |
| `onOk` | `(e) => void` | — | 确定按钮点击回调 |
| `onCancel` | `(e) => void` | — | 取消 / 关闭回调 |
| `okText` | `ReactNode` | `'OK'` | 确定按钮文案 |
| `cancelText` | `ReactNode` | `'Cancel'` | 取消按钮文案 |
| `okType` | `ButtonType` | `'primary'` | 确定按钮类型 |
| `confirmLoading` | `boolean` | `false` | 在确定按钮上显示加载状态 |
| `width` | `number \| string` | `520` | 对话框宽度 |
| `centered` | `boolean` | `false` | 垂直居中显示 |
| `closable` | `boolean` | `true` | 显示关闭图标 |
| `maskClosable` | `boolean` | `true` | 点击蒙层是否可以关闭 |
| `destroyOnHidden` | `boolean` | `false` | 关闭时卸载子元素（`destroyOnClose` 是废弃别名） |
| `forceRender` | `boolean` | `false` | 预渲染内容 |
| `keyboard` | `boolean` | `true` | 支持按下 Esc 键关闭 |
| `zIndex` | `number` | `1000` | 层级 |
| `afterClose` | `() => void` | — | 关闭动画结束后的回调 |
| `afterOpenChange` | `(open) => void` | — | 打开状态变化后的回调 |

## 最佳实践

- 当对话框内包含表单时设置 `destroyOnHidden`，使关闭后表单状态被重置。
- 避免多层嵌套的对话框；次级面板请使用 `Drawer`。
- 简单的是/否确认使用 `Modal.confirm`；表格中的行内操作使用 `ActionButton` 配合 `confirmable`。
