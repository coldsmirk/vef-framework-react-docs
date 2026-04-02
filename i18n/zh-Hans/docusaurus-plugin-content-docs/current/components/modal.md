---
sidebar_position: 7
---

# Modal 对话框

模态对话框，在不离开当前页面的情况下展示重要信息或请求用户决策。

> **来源：** 直接从 `antd` 重新导出。完整文档：[Ant Design Modal](https://ant.design/components/modal-cn/)

## 何时使用

- 需要用户处理事务，又不希望跳转页面以致打断工作流程时。
- 需要用户确认某个破坏性操作时。
- 收集少量用户输入时。

## 基础用法

```tsx
import { Modal, Button } from '@vef-framework-react/components';
import { useState } from 'react';

export default function Demo() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="primary" onClick={() => setOpen(true)}>
        打开对话框
      </Button>
      <Modal
        title="基础对话框"
        open={open}
        onOk={() => setOpen(false)}
        onCancel={() => setOpen(false)}
      >
        <p>对话框内容。</p>
      </Modal>
    </>
  );
}
```

## 异步确认

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
      <Button onClick={() => setOpen(true)}>打开</Button>
      <Modal
        title="保存更改"
        open={open}
        onOk={handleOk}
        confirmLoading={loading}
        onCancel={() => setOpen(false)}
      >
        <p>确定要保存吗？</p>
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
    title: '删除记录',
    content: '此操作不可撤销，是否继续？',
    okText: '删除',
    okType: 'danger',
    onOk: () => deleteRecord(id),
  });
}
```

> 对于表格行内的确认按钮，建议使用 [`ActionButton`](./action-button) 的 `confirmable` 属性。

## 自定义页脚

```tsx
<Modal
  title="自定义页脚"
  open={open}
  footer={[
    <Button key="back" onClick={() => setOpen(false)}>返回</Button>,
    <Button key="submit" type="primary" onClick={handleOk}>提交</Button>,
  ]}
>
  <p>内容</p>
</Modal>
```

## 无页脚

```tsx
<Modal title="信息" open={open} footer={null} onCancel={() => setOpen(false)}>
  <p>只读内容。</p>
</Modal>
```

## API

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `open` | `boolean` | `false` | 对话框是否可见 |
| `title` | `ReactNode` | — | 标题 |
| `children` | `ReactNode` | — | 内容 |
| `footer` | `ReactNode \| null` | — | 底部内容；`null` 不显示 |
| `onOk` | `(e) => void` | — | 点击确定回调 |
| `onCancel` | `(e) => void` | — | 点击遮罩层或右上角叉或取消按钮的回调 |
| `okText` | `ReactNode` | `'确定'` | 确认按钮文字 |
| `cancelText` | `ReactNode` | `'取消'` | 取消按钮文字 |
| `okType` | `ButtonType` | `'primary'` | 确认按钮类型 |
| `confirmLoading` | `boolean` | `false` | 确定按钮 loading |
| `width` | `number \| string` | `520` | 宽度 |
| `centered` | `boolean` | `false` | 垂直居中展示 |
| `closable` | `boolean` | `true` | 是否显示右上角的关闭按钮 |
| `maskClosable` | `boolean` | `true` | 点击蒙层是否允许关闭 |
| `destroyOnClose` | `boolean` | `false` | 关闭时销毁子元素 |
| `forceRender` | `boolean` | `false` | 强制渲染 |
| `keyboard` | `boolean` | `true` | 是否支持键盘 esc 关闭 |
| `zIndex` | `number` | `1000` | 设置 z-index |
| `afterClose` | `() => void` | — | 完全关闭后的回调 |
| `afterOpenChange` | `(open) => void` | — | 打开和关闭的回调 |

## 最佳实践

- 对话框内含表单时设置 `destroyOnClose`，关闭时重置表单状态。
- 避免嵌套多层对话框；次级面板使用 `Drawer`。
- 简单的是/否确认使用 `Modal.confirm`；表格行内操作使用 `ActionButton` 的 `confirmable`。
