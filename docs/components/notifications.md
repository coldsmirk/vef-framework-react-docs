---
title: "Notifications & Messages"
description: "Imperative feedback helpers — toast messages, notifications, alert dialogs, and confirm dialogs — callable from anywhere, including outside React components."
---

# Notifications & Messages

Imperative feedback helpers — toast messages, notifications, alert dialogs, and confirm dialogs — callable from anywhere, including outside React components.

> **VEF-specific API.** These are plain functions exported from `@vef-framework-react/components`, not components. They dispatch through the Ant Design `App` context registered by [`ConfigProvider`](./config-provider.md), so everything they render follows your theme, dark mode, and locale — unlike antd's static `message.success()` / `notification.open()` imported from `antd` directly.

## When to Use

- Give feedback for client-side operations (copy, export, validation) that the automatic API feedback does not cover.
- Surface background events — SSE pushes, long-running task completions — as dismissible notifications.
- Block the user with an alert or confirm dialog from non-component code: event handlers, store actions, interceptors.

## Choosing a Feedback Style

| Helper family | UI | Interrupts the user? | Auto-dismiss | Typical use |
|---------------|----|----------------------|--------------|-------------|
| `show*Message` | Toast at the top of the screen | No | Yes (1.5–4s) | Operation results, transient status |
| `show*Notification` | Card at the top-right with title and progress bar | No | Yes (3–6s, `duration: 0` to pin) | Background events, content needing a title or actions |
| `show*Alert` | Centered modal with a single OK button | Yes | No | Information the user must acknowledge |
| `showConfirm` | Centered modal with OK / Cancel | Yes | No | Destructive or irreversible actions |

For declarative cases prefer the component equivalents: [`Alert`](./alert.md) for inline page banners, [`Modal`](./modal.md) for rich dialogs, and [`ActionButton`](./action-button.md) with `confirmable` for confirm-then-run buttons.

## How It Works

`<ConfigProvider>` mounts an internal context holder that captures antd's `App.useApp()` instances (`message`, `notification`, `modal`) and stores them on `globalThis.$vef`. The helpers read through that global, which means:

- They work outside React — in axios interceptors, Zustand actions, or plain async functions.
- Their output inherits the active theme, dark mode, and locale from `ConfigProvider`.
- Calling them before `<ConfigProvider>` has mounted throws `"$vef is not initialized"` — never call them at module top level.

## Messages

Lightweight toasts for transient feedback. Content is the only parameter; the duration is fixed per severity.

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

| Function | Signature | Duration |
|----------|-----------|----------|
| `showSuccessMessage` | `(content: ReactNode) => void` | 1.5s |
| `showInfoMessage` | `(content: ReactNode) => void` | 2s |
| `showWarningMessage` | `(content: ReactNode) => void` | 3s |
| `showErrorMessage` | `(content: ReactNode) => void` | 4s |
| `showLoadingMessage` | `(content: ReactNode) => LoadingMessageHandle` | Until closed |
| `closeAllMessages` | `() => void` | — |

`showLoadingMessage` returns a handle: `close()` removes the toast, `update(content)` replaces its text while the spinner keeps running. At most 3 messages are visible at once (set by `ConfigProvider`).

## Notifications

Richer cards rendered at the top-right, with a title, optional action area, a countdown progress bar, and pause-on-hover. They stack when more than 3 are open (at most 8).

```tsx
import { Button, showInfoNotification } from '@vef-framework-react/components';

const handle = showInfoNotification('A new version is available.', {
  title: 'Update',
  duration: 0, // stay until closed
  actions: <Button size="small" onClick={() => location.reload()}>Reload</Button>,
});

// later, e.g. once the event is no longer relevant
handle.close();
```

```ts
showSuccessNotification(content: ReactNode, options?: NotificationOptions): NotificationHandle
// showInfoNotification / showWarningNotification / showErrorNotification share the signature
closeAllNotifications(): void
```

### NotificationOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `title` | `ReactNode` | Severity label (`'成功'` / `'提示'` / `'警告'` / `'错误'`) | Card title |
| `duration` | `number` | `3` / `4` / `5` / `6` by severity | Seconds before auto-close; `0` keeps it open |
| `actions` | `ReactNode` | — | Action area (buttons, links) |
| `closable` | `boolean` | `true` | Show the close button |
| `icon` | `ReactNode` | Severity icon | Custom icon |

## Alert Dialogs

A centered modal with a single OK button, for information the user must acknowledge before continuing. By default the close (×) icon is hidden, so pressing OK is the only way out.

```tsx
import { showErrorAlert } from '@vef-framework-react/components';

showErrorAlert('Your session data could not be restored.', {
  title: 'Restore failed',
  onOk: () => navigate('/login'),
});
```

```ts
showSuccessAlert(content: ReactNode, options?: AlertOptions): AlertHandle
// showInfoAlert / showWarningAlert / showErrorAlert share the signature
```

`AlertOptions` is `ConfirmOptions` without `cancelText` / `cancelButtonProps` (there is no cancel button); see the table below. Alert-specific defaults: `title` falls back to the severity label, `okText` to `'好的，知道了'`, and `closable` to `false`.

## Confirm Dialog

A centered OK / Cancel modal. When `onOk` returns a promise, the OK button shows a loading state and the dialog closes once the promise resolves; a rejected promise keeps it open (antd `Modal.confirm` semantics).

```tsx
import { showConfirm } from '@vef-framework-react/components';

function handleReset() {
  showConfirm('This resets all local settings. Continue?', {
    title: 'Reset settings',
    okText: 'Reset',
    okButtonProps: { danger: true },
    onOk: async () => {
      await resetSettings(); // OK button stays in loading state until this resolves
    },
  });
}
```

```ts
showConfirm(content: ReactNode, options?: ConfirmOptions): ModalHandle
```

> For a button whose only job is confirm-then-run, prefer [`ActionButton`](./action-button.md) with `confirmable` and `confirmMode="dialog"` — it calls `showConfirm` and manages the loading state for you.

### ConfirmOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `title` | `ReactNode` | `'确认提示'` | Dialog title |
| `okText` | `ReactNode` | Locale default | OK button label |
| `cancelText` | `ReactNode` | Locale default | Cancel button label (confirm only) |
| `okButtonProps` | `ButtonProps` | — | OK button props, e.g. `{ danger: true }` |
| `cancelButtonProps` | `ButtonProps` | — | Cancel button props (confirm only) |
| `width` | `string \| number` | — | Dialog width |
| `closable` | `boolean` | `true` (alerts: `false`) | Show the close (×) icon |
| `onOk` | `() => Awaitable<void>` | — | OK handler; async keeps OK loading |
| `onCancel` | `() => Awaitable<void>` | — | Cancel / close handler |
| `onAfterOpen` | `() => void` | — | Called after the open animation |
| `onAfterClose` | `() => void` | — | Called after the close animation |

All alert and confirm dialogs are vertically centered.

## Closing and Cleanup

Every helper except the fire-and-forget messages returns a handle:

| Handle | Returned by | Methods |
|--------|-------------|---------|
| `LoadingMessageHandle` | `showLoadingMessage` | `close()`, `update(content)` |
| `NotificationHandle` | `show*Notification` | `close()`, `update(content, options?)` |
| `AlertHandle` | `show*Alert` | `close()`, `update(content, options?)` |
| `ModalHandle` | `showConfirm` | `close()`, `update(content, options?)` |

`update` replaces the content (and options) of the still-open instance — useful for progress reporting in a loading message or a pinned notification. For bulk cleanup — logout, workspace switch — call `closeAllMessages()` and `closeAllNotifications()`.

## Automatic API Feedback

If your app is bootstrapped with the starter's `createApiClient()`, the request layer already calls these helpers for you:

| Event | Automatic feedback |
|-------|--------------------|
| Request could not be sent | Error message |
| Response code ≠ `okCode` (business error) | Warning message with the server's `message` |
| HTTP 400 | Warning message |
| HTTP 401 | Silent token refresh and retry; if the session cannot be restored, redirect to login (with an info message when the token had expired) |
| HTTP 403 | Warning message, then access-denied handling |
| Other HTTP errors (5xx, timeout, …) | Error message |
| Mutation succeeds and its result has a `message` field | Success message |

To suppress the automatic success toast for a single mutation, set `meta: { shouldShowSuccessFeedback: false }` on it.

Call the helpers manually only for what this chain does not cover: purely client-side operations, custom copy after batch operations, or upgrading an important failure from a toast to an alert dialog. See [Error Handling](../guide/error-handling.md) for the full chain and [HTTP and API Client](../reference/core/http-and-api.md) for the `HttpClientOptions` fields behind it.

## Best Practices

- Rely on the automatic API feedback first; do not repeat a manual toast after every API call.
- Use messages for transient results, notifications for content that must survive a glance away, and dialogs only when the user must decide or acknowledge.
- Always close a `showLoadingMessage` handle in a `finally` block so failures do not leave a spinner behind.
- Keep the handle of any pinned notification (`duration: 0`) and close it when its trigger becomes irrelevant; call `closeAllNotifications()` on logout.
- Pass `okButtonProps={{ danger: true }}` to `showConfirm` for destructive actions; inside React, prefer `ActionButton` with `confirmable`.
- Never call these helpers during module initialization — `<ConfigProvider>` must be mounted first.
