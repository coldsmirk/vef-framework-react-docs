---
sidebar_position: 8
---

# ActionButton 操作按钮

内置异步 loading 状态管理和可选确认对话框的按钮。

> **VEF 特有组件**，不属于 Ant Design。

## 何时使用

- 任何触发异步操作（API 调用、表单提交等）的按钮。
- 执行破坏性或不可逆操作前需要用户确认的按钮。

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
      保存
    </ActionButton>
  );
}
```

`onClick` 返回 Promise 时，按钮自动显示 loading 状态，无需手动管理。

## 带确认（气泡确认框）

```tsx
import { ActionButton } from '@vef-framework-react/components';

export default function Demo() {
  return (
    <ActionButton
      danger
      confirmable
      confirmTitle="删除记录"
      confirmDescription="此操作不可撤销。"
      onClick={async () => {
        await deleteRecord(id);
      }}
    >
      删除
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
      confirmTitle="提交申请"
      confirmDescription="确定要提交吗？"
      onClick={async () => {
        await submitApplication();
      }}
    >
      提交
    </ActionButton>
  );
}
```

## API

`ActionButton` 继承所有 [`Button`](./button) 属性（除 `loading` 和 `onClick`），另有：

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `onClick` | `(e) => Awaitable<void>` | — | 点击回调，支持异步函数 |
| `confirmable` | `boolean` | `false` | 执行前显示确认提示 |
| `confirmMode` | `'popover' \ | 'dialog'` | `'popover'` | 确认 UI 样式 |
| `confirmTitle` | `ReactNode` | `'确认提示'` | 确认对话框标题 |
| `confirmDescription` | `ReactNode` | `'确定要执行此操作吗？'` | 确认对话框描述 |

其他 `Button` 属性（`type`、`size`、`danger`、`disabled`、`icon` 等）均支持。

## 与 Button 的对比

| 特性 | `Button` | `ActionButton` |
|------|----------|----------------|
| 异步 loading | 手动管理 | 自动 |
| 确认对话框 | 无 | 内置 |
| 权限检查 | 无 | 无（使用 `OperationButton`） |

## 最佳实践

- 任何调用 API 的操作按钮都应使用 `ActionButton` 代替 `Button`。
- 删除、重置、发布等破坏性操作使用 `confirmable`。
- 高风险操作使用 `confirmMode="dialog"` 提供更多上下文。
- 表格行操作需要权限检查时，使用 `OperationButton`。
