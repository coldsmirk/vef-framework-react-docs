---
title: "消息与通知"
description: "命令式反馈辅助函数——轻提示消息、通知、警告对话框和确认对话框——可以在任何位置调用，包括 React 组件之外。"
---

# 消息与通知

命令式反馈辅助函数——轻提示消息（message）、通知（notification）、警告对话框（alert）和确认对话框（confirm）——可以在任何位置调用，包括 React 组件之外。

> **VEF 专属 API。** 这些是从 `@vef-framework-react/components` 导出的普通函数，而非组件。它们通过 [`ConfigProvider`](./config-provider.md) 注册的 Ant Design `App` 上下文进行派发，因此渲染出的内容会跟随你的主题、暗色模式和语言设置——这与直接从 `antd` 导入的静态方法 `message.success()` / `notification.open()` 不同。

## 何时使用

- 为纯客户端操作（复制、导出、校验）提供反馈，这些场景不在自动 API 反馈的覆盖范围内。
- 将后台事件——SSE 推送、长任务完成——以可关闭的通知形式呈现。
- 在非组件代码中（事件处理函数、store action、拦截器）弹出警告或确认对话框来阻断用户操作。

## 如何选择反馈形式

| 辅助函数族 | UI 形式 | 是否打断用户？ | 自动消失 | 典型用途 |
|-----------|---------|--------------|----------|----------|
| `show*Message` | 屏幕顶部的轻提示 | 否 | 是（1.5–4 秒） | 操作结果、瞬时状态 |
| `show*Notification` | 右上角带标题和进度条的卡片 | 否 | 是（3–6 秒，`duration: 0` 可常驻） | 后台事件、需要标题或操作按钮的内容 |
| `show*Alert` | 居中显示、只有一个确定按钮的对话框 | 是 | 否 | 用户必须知悉的信息 |
| `showConfirm` | 居中显示、带确定 / 取消按钮的对话框 | 是 | 否 | 破坏性或不可逆的操作 |

声明式场景请优先使用对应组件：页面内嵌横幅使用 [`Alert`](./alert.md)，复杂对话框使用 [`Modal`](./modal.md)，“先确认再执行”的按钮使用 [`ActionButton`](./action-button.md) 配合 `confirmable`。

## 工作原理

`<ConfigProvider>` 会挂载一个内部的上下文持有器，捕获 antd `App.useApp()` 的实例（`message`、`notification`、`modal`）并存储到 `globalThis.$vef` 上。辅助函数通过该全局对象读取实例，这意味着：

- 它们可以在 React 之外工作——axios 拦截器、Zustand action 或普通异步函数中。
- 它们的输出继承 `ConfigProvider` 当前的主题、暗色模式和语言设置。
- 在 `<ConfigProvider>` 挂载之前调用会抛出 `"$vef is not initialized"` 错误——切勿在模块顶层调用。

## 消息（Message）

用于瞬时反馈的轻量级提示。唯一的参数是内容；显示时长按严重程度固定。

```tsx
import { showSuccessMessage, showErrorMessage, showLoadingMessage } from '@vef-framework-react/components';

async function handleExport() {
  const loading = showLoadingMessage('Exporting…');

  try {
    await exportReport();
    showSuccessMessage('Export complete');
  } catch {
    showErrorMessage('Export failed');
  } finally {
    loading.close();
  }
}
```

| 函数 | 签名 | 时长 |
|------|------|------|
| `showSuccessMessage` | `(content: ReactNode) => void` | 1.5 秒 |
| `showInfoMessage` | `(content: ReactNode) => void` | 2 秒 |
| `showWarningMessage` | `(content: ReactNode) => void` | 3 秒 |
| `showErrorMessage` | `(content: ReactNode) => void` | 4 秒 |
| `showLoadingMessage` | `(content: ReactNode) => LoadingMessageHandle` | 直到手动关闭 |
| `closeAllMessages` | `() => void` | — |

`showLoadingMessage` 返回一个句柄：`close()` 移除提示，`update(content)` 在加载动画持续运行的同时替换文案。同时最多显示 3 条消息（由 `ConfigProvider` 配置）。

## 通知（Notification）

在右上角渲染的信息更丰富的卡片，带有标题、可选的操作区、倒计时进度条，并支持悬停暂停。打开超过 3 条时会堆叠（最多 8 条）。

```tsx
import { Button, showInfoNotification } from '@vef-framework-react/components';

const handle = showInfoNotification('A new version is available.', {
  title: 'Update',
  duration: 0, // 常驻直到手动关闭
  actions: <Button size="small" onClick={() => location.reload()}>Reload</Button>,
});

// 稍后，例如事件不再相关时
handle.close();
```

```ts
showSuccessNotification(content: ReactNode, options?: NotificationOptions): NotificationHandle
// showInfoNotification / showWarningNotification / showErrorNotification 签名相同
closeAllNotifications(): void
```

### NotificationOptions

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `title` | `ReactNode` | 按严重程度取标签（`'成功'` / `'提示'` / `'警告'` / `'错误'`） | 卡片标题 |
| `duration` | `number` | 按严重程度为 `3` / `4` / `5` / `6` | 自动关闭前的秒数；`0` 表示常驻 |
| `actions` | `ReactNode` | — | 操作区（按钮、链接） |
| `closable` | `boolean` | `true` | 显示关闭按钮 |
| `icon` | `ReactNode` | 按严重程度取图标 | 自定义图标 |

## 警告对话框（Alert）

居中显示、只有一个确定按钮的对话框，用于用户在继续操作前必须知悉的信息。默认隐藏关闭（×）图标，因此点击确定是唯一的退出方式。

```tsx
import { showErrorAlert } from '@vef-framework-react/components';

showErrorAlert('Your session data could not be restored.', {
  title: 'Restore failed',
  onOk: () => navigate('/login'),
});
```

```ts
showSuccessAlert(content: ReactNode, options?: AlertOptions): AlertHandle
// showInfoAlert / showWarningAlert / showErrorAlert 签名相同
```

`AlertOptions` 即去掉 `cancelText` / `cancelButtonProps` 的 `ConfirmOptions`（没有取消按钮）；参见下方表格。Alert 专属默认值：`title` 回退为严重程度标签，`okText` 为 `'好的，知道了'`，`closable` 为 `false`。

## 确认对话框（Confirm）

居中显示的确定 / 取消对话框。当 `onOk` 返回 Promise 时，确定按钮进入加载状态，Promise resolve 后对话框自动关闭；Promise 被 reject 则保持打开（与 antd `Modal.confirm` 语义一致）。

```tsx
import { showConfirm } from '@vef-framework-react/components';

function handleReset() {
  showConfirm('This resets all local settings. Continue?', {
    title: 'Reset settings',
    okText: 'Reset',
    okButtonProps: { danger: true },
    onOk: async () => {
      await resetSettings(); // 确定按钮保持加载状态，直到该 Promise resolve
    },
  });
}
```

```ts
showConfirm(content: ReactNode, options?: ConfirmOptions): ModalHandle
```

> 如果一个按钮的唯一职责就是“先确认再执行”，请优先使用 [`ActionButton`](./action-button.md) 配合 `confirmable` 和 `confirmMode="dialog"`——它会替你调用 `showConfirm` 并管理加载状态。

### ConfirmOptions

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `title` | `ReactNode` | `'确认提示'` | 对话框标题 |
| `okText` | `ReactNode` | 语言包默认值 | 确定按钮文案 |
| `cancelText` | `ReactNode` | 语言包默认值 | 取消按钮文案（仅 confirm） |
| `okButtonProps` | `ButtonProps` | — | 确定按钮属性，例如 `{ danger: true }` |
| `cancelButtonProps` | `ButtonProps` | — | 取消按钮属性（仅 confirm） |
| `width` | `string \| number` | — | 对话框宽度 |
| `closable` | `boolean` | `true`（alert 为 `false`） | 显示关闭（×）图标 |
| `onOk` | `() => Awaitable<void>` | — | 确定回调；异步时确定按钮保持加载 |
| `onCancel` | `() => Awaitable<void>` | — | 取消 / 关闭回调 |
| `onAfterOpen` | `() => void` | — | 打开动画结束后调用 |
| `onAfterClose` | `() => void` | — | 关闭动画结束后调用 |

所有 alert 和 confirm 对话框都垂直居中显示。

## 关闭与清理

除“即发即忘”的消息函数外，每个辅助函数都返回一个句柄：

| 句柄 | 返回自 | 方法 |
|------|--------|------|
| `LoadingMessageHandle` | `showLoadingMessage` | `close()`、`update(content)` |
| `NotificationHandle` | `show*Notification` | `close()`、`update(content, options?)` |
| `AlertHandle` | `show*Alert` | `close()`、`update(content, options?)` |
| `ModalHandle` | `showConfirm` | `close()`、`update(content, options?)` |

`update` 会替换仍处于打开状态的实例的内容（和选项）——适合在加载消息或常驻通知中汇报进度。需要批量清理时——退出登录、切换工作区——调用 `closeAllMessages()` 和 `closeAllNotifications()`。

## 自动 API 反馈

如果你的应用通过 starter 的 `createApiClient()` 引导启动，请求层已经替你调用了这些辅助函数：

| 事件 | 自动反馈 |
|------|----------|
| 请求无法发出 | 错误消息 |
| 响应 code ≠ `okCode`（业务错误） | 携带服务端 `message` 的警告消息 |
| HTTP 400 | 警告消息 |
| HTTP 401 | 静默刷新令牌并重试；会话无法恢复时跳转登录页（令牌确已过期时附带一条提示消息） |
| HTTP 403 | 警告消息，随后进入无权限处理 |
| 其他 HTTP 错误（5xx、超时等） | 错误消息 |
| mutation 成功且结果携带 `message` 字段 | 成功消息 |

要为单个 mutation 关闭自动成功提示，在其上设置 `meta: { shouldShowSuccessFeedback: false }`。

只有在这条链路覆盖不到的场景才手动调用辅助函数：纯客户端操作、批量操作后的自定义文案，或将重要失败从轻提示升级为警告对话框。完整链路参见[错误处理](../guide/error-handling.md)，背后的 `HttpClientOptions` 字段参见 [HTTP 与 API 客户端](../reference/core/http-and-api.md)。

## 最佳实践

- 优先依赖自动 API 反馈；不要在每次 API 调用后重复手动弹出提示。
- 瞬时结果用消息，需要在用户视线离开后仍可查看的内容用通知，只有在用户必须决策或知悉时才使用对话框。
- 始终在 `finally` 块中关闭 `showLoadingMessage` 的句柄，避免失败后残留加载提示。
- 保留常驻通知（`duration: 0`）的句柄，在触发场景失效时关闭它；退出登录时调用 `closeAllNotifications()`。
- 对破坏性操作向 `showConfirm` 传入 `okButtonProps={{ danger: true }}`；在 React 内部优先使用 `ActionButton` 配合 `confirmable`。
- 切勿在模块初始化阶段调用这些辅助函数——必须等 `<ConfigProvider>` 挂载完成。
