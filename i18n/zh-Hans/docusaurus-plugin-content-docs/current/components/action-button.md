---
title: "ActionButton"
description: "一个内置异步加载状态管理和可选确认对话框的按钮。"
---

# ActionButton

一个内置异步加载状态管理和可选确认对话框的按钮。

> **VEF 专属组件。** 不属于 Ant Design 的一部分。

## 何时使用

- 任何触发异步操作（API 调用、表单提交等）的按钮。
- 需要用户确认后才能执行破坏性或不可逆操作的按钮。

## 基础用法

```tsx
import { ActionButton } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <ActionButton
      type="primary"
      onClick={async () => {
        await saveData();
      }}
    >
      Save
    </ActionButton>
  );
}
```

在 `onClick` 返回的 Promise 处于挂起状态时，按钮会自动显示加载中的图标，无需手动管理 `loading` 状态。

## 带确认（气泡卡片）

```tsx
import { ActionButton } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <ActionButton
      danger
      confirmable
      confirmTitle="Delete Record"
      confirmDescription="This action cannot be undone."
      onClick={async () => {
        await deleteRecord(id);
      }}
    >
      Delete
    </ActionButton>
  );
}
```

## 带确认（对话框）

```tsx
import { ActionButton } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <ActionButton
      type="primary"
      confirmable
      confirmMode="dialog"
      confirmTitle="Submit Application"
      confirmDescription="Are you sure you want to submit?"
      onClick={async () => {
        await submitApplication();
      }}
    >
      Submit
    </ActionButton>
  );
}
```

## API

props 类型以 `ActionButtonProps` 导出。

`ActionButton` 继承了 [`Button`](./button) 的全部属性（`loading` 和 `onClick` 除外），并新增以下属性：

| Prop | Type | Default | 说明 |
|------|------|---------|-------------|
| `onClick` | `(e) => Awaitable<void>` | — | 点击事件处理函数，支持异步函数 |
| `confirmable` | `boolean` | `false` | 在执行 `onClick` 前显示确认提示 |
| `confirmMode` | `'popover' \| 'dialog'` | `'popover'` | 确认框的 UI 样式 |
| `confirmTitle` | `ReactNode` | `'确认提示'` | 确认对话框标题 |
| `confirmDescription` | `ReactNode` | `'确定要执行此操作吗？'` | 确认对话框描述文本 |

其余的 `Button` 属性（如 `type`、`size`、`danger`、`disabled`、`icon` 等）均受支持。

## 与 Button 的对比

| 特性 | `Button` | `ActionButton` |
|---------|----------|----------------|
| 异步加载 | 手动 | 自动 |
| 确认对话框 | 无 | 内置 |
| 权限校验 | 无 | 无（请使用 `OperationButton`） |

## 最佳实践

- 对于任何调用 API 的操作，使用 `ActionButton` 而非 `Button`。
- 对于删除、重置、发布等破坏性操作，使用 `confirmable`。
- 对于需要更多上下文信息的高风险确认操作，使用 `confirmMode="dialog"`。
- 对于需要权限校验的表格行内操作，使用 `OperationButton`。
