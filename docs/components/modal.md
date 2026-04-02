---
sidebar_position: 7
---

# Modal

A dialog overlay that interrupts the user to present critical information or request a decision.

> **Source:** Re-exported from `antd`. Full documentation: [Ant Design Modal](https://ant.design/components/modal/)

## When to Use

- Require user confirmation before a destructive action.
- Display supplementary content without leaving the current page.
- Collect a small amount of user input.

## Basic Usage

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

## Async OK Handler

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

## Confirmation Dialog

For simple confirmations, use the static `Modal.confirm` method:

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

> For inline confirm buttons, consider using [`ActionButton`](./action-button) with `confirmable` instead.

## Custom Footer

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

## No Footer

```tsx
<Modal title="Info" open={open} footer={null} onCancel={() => setOpen(false)}>
  <p>Read-only content.</p>
</Modal>
```

## API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | `false` | Whether the modal is visible |
| `title` | `ReactNode` | — | Modal title |
| `children` | `ReactNode` | — | Modal body content |
| `footer` | `ReactNode \| null` | — | Custom footer; `null` hides footer |
| `onOk` | `(e) => void` | — | OK button click handler |
| `onCancel` | `(e) => void` | — | Cancel / close handler |
| `okText` | `ReactNode` | `'OK'` | OK button label |
| `cancelText` | `ReactNode` | `'Cancel'` | Cancel button label |
| `okType` | `ButtonType` | `'primary'` | OK button type |
| `confirmLoading` | `boolean` | `false` | Show loading on OK button |
| `width` | `number \| string` | `520` | Modal width |
| `centered` | `boolean` | `false` | Vertically center the modal |
| `closable` | `boolean` | `true` | Show close icon |
| `maskClosable` | `boolean` | `true` | Close on mask click |
| `destroyOnClose` | `boolean` | `false` | Unmount children on close |
| `forceRender` | `boolean` | `false` | Pre-render content |
| `keyboard` | `boolean` | `true` | Close on Escape key |
| `zIndex` | `number` | `1000` | z-index |
| `afterClose` | `() => void` | — | Callback after close animation |
| `afterOpenChange` | `(open) => void` | — | Callback after open state changes |

## Best Practices

- Set `destroyOnClose` when the modal contains a form to reset state on close.
- Avoid deeply nested modals; use `Drawer` for secondary panels.
- Use `Modal.confirm` for simple yes/no confirmations; use `ActionButton` with `confirmable` for inline table actions.
