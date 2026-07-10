---
title: Localization
description: Where VEF's built-in Chinese UI texts come from, how to switch the antd / dayjs / zod locale, which strings accept overrides, and which are Chinese-only today.
---

# Localization

VEF ships with Simplified Chinese as its only built-in language: the Ant Design locale is `zh_CN`, `dayjs` runs under `zh-cn`, zod validation messages are Chinese, and framework components fall back to Chinese literals (`Bool` renders `是`/`否`, `ActionButton` confirms with `确认提示`, editors publish with `发布`).

This page is about the **language of framework-provided UI chrome** — built-in button labels, confirmation dialogs, validation messages, and date formatting. VEF does not include a translation framework: there is no message catalog, no `t()` function, and no per-user language switching. If your product needs full multi-language support, bring your own i18n library for your own pages; use this page to control the framework-supplied texts around them.

The value of this page is precision: every row below states whether a text **can** be overridden, and through what mechanism. Anything listed as not overridable is a fact of v2.9.0, not an omission.

## Where the Chinese Defaults Come From

Four independent layers produce Chinese text, and each is switched (or not) separately:

| Layer | Wiring in v2.9.0 | What it controls |
| --- | --- | --- |
| Ant Design locale | [`ConfigProvider`](../components/config-provider.md) hard-codes the `zh_CN` locale. `ConfigProviderProps` has no `locale` prop. | All antd built-in texts: Modal/Popconfirm OK and Cancel, pagination page-size dropdown, DatePicker panels, Transfer, empty states, and so on. |
| dayjs global locale | The chrono utilities in `@vef-framework-react/shared` set the global dayjs locale to `zh-cn` (and register plugins) lazily, the first time any of them runs. See [Chrono](../reference/shared/chrono-event-validation.md). | Localized date output (`LLLL`-style formats, relative time) from framework utilities and any dayjs formatting in your code. |
| zod global config | `@vef-framework-react/shared` calls `z.config(zhCN())` when the package is first imported, on the project-wide zod instance it re-exports. | Default validation messages for every validator that does not pass a custom message. See [Forms](./forms.md). |
| Component fallback literals | Individual components default their visible text to Chinese string literals. | `Bool`'s `是`/`否`, `ActionButton`'s `确认提示`, ProSearch's `搜索`, the editors' `发布` button, and everything else in the contract table below. |

## Switching the Global Locale

### Ant Design built-in texts

VEF's `ConfigProvider` does not expose the antd locale, but antd's own `ConfigProvider` merges with an outer one when nested — properties you do not pass (theme, prefix) keep the framework's values. Nest one inside your route tree:

```tsx
// A layout component that wraps every page (e.g. your root route)
import { ConfigProvider } from "antd";
import enUS from "antd/locale/en_US";

export function RootLayout({ children }: PropsWithChildren) {
  return <ConfigProvider locale={enUS}>{children}</ConfigProvider>;
}
```

Two caveats, both verified against the v2.9.0 wiring:

- **Add `antd` to your app's own dependencies, matching the framework's range** (`^6.5.0` for v2.9.0). The override only works if your import resolves to the same antd copy the framework uses; a second copy would create a separate React context that framework components never read.
- **Imperative helpers stay on the outer locale.** `showConfirm`, `showSuccessAlert`, message and notification helpers dispatch through context holders captured directly under the framework's `ConfigProvider` — *above* your nested provider. Their built-in OK/Cancel buttons remain Chinese unless you pass `okText` / `cancelText` per call (see the contract table).

### Zod validation messages

The framework configures the shared zod instance with the `zh-CN` locale at import time. Zod's locale config is global and last-call-wins, so flip it once during bootstrap, after framework imports and before rendering:

```ts
import { z } from "@vef-framework-react/shared";
import { en } from "zod/locales";

z.config(en());
```

This switches every *default* message (e.g. "Invalid input" instead of the Chinese equivalent). Custom messages you pass in validators — `z.string().min(2, "At least 2 characters")` — are unaffected either way. Add `zod` to your app's dependencies for the `zod/locales` import; the locale object is plain data, so it does not need to be the same zod copy.

### dayjs

There is **no supported switch** for the dayjs locale. The framework asserts `zh-cn` lazily: the first chrono utility call (`getNow`, `formatDate`, `tryParseDate`, ...) runs a one-time setup that sets the global locale, so a `dayjs.locale("en")` executed earlier in your bootstrap gets silently overwritten later. If you accept relying on this internal behavior, you can force the one-time setup and then override:

```ts
import { getNow } from "@vef-framework-react/shared";
import dayjs from "dayjs";

getNow();           // forces the framework's one-time dayjs setup (zh-cn + plugins)
dayjs.locale("en"); // now safe — the framework will not re-assert zh-cn
```

Your app's `dayjs` must resolve to the same copy the framework uses (declare a compatible range; the framework pins `^1.11.21` at v2.9.0). Note that DatePicker/Calendar *panel* text follows the antd locale, not the dayjs global — and regardless of locale, `formatDuration` always outputs `天`/`小时`/`分钟` and the quarter format is `YYYY-Q季度` (both hard-coded).

## Override Contract

Framework-provided Chinese defaults and their override mechanism, verified against the v2.9.0 source:

| Component / area | Chinese default | Override |
| --- | --- | --- |
| [`Bool`](../components/bool.md) labels | `是` / `否` | `trueLabel` / `falseLabel` props |
| [`ActionButton`](../components/action-button.md) confirmation | `确认提示` / `确定要执行此操作吗？` | `confirmTitle` / `confirmDescription` props; OK/Cancel come from the antd locale |
| `ActionGroup` per-action confirmation | `确认提示` / `确定要{label}吗？` | `confirmTitle` / `confirmDescription` on each action |
| `showConfirm()` dialog | title `确认提示`; OK/Cancel from antd locale | `title`, `okText`, `cancelText` options per call |
| `showSuccessAlert()` and siblings | titles `成功` / `提示` / `警告` / `错误`; button `好的，知道了` | `title`, `okText` options per call |
| [`Form`](../components/form.md) buttons | `提交` / `重置` | children of `form.SubmitButton` / `form.ResetButton` |
| [`FormModal`](../components/form-modal.md) / [`FormDrawer`](../components/form-drawer.md) footer | `提交` / `重置` | `submitButtonProps` / `resetButtonProps` (set `children`) |
| [CRUD](./crud.md) form title | `创建` / `修改` (fallback `表单`) | `title` option when calling `openForm` |
| CRUD form footer | `提交` / `重置` | `formActionsRenderers` per scene |
| [`ProSearch`](../components/pro-search.md) buttons | `搜索` / `重置` | `searchButtonProps` / `resetButtonProps` (set `children`) |
| [`ProTable`](../components/pro-table.md) operation column header | `操作` | `operationColumn.title` |
| [`EditableTable`](../components/editable-table.md) row actions | `编辑` / `删除` / `保存` / `取消` | `texts` prop |
| `EditableTable` operation column header | `操作` | `operation.title` |
| [`Upload`](../components/upload.md) trigger button | `上传` | pass `children` |
| [FormEditor](../editors/form-editor/reference.md) / [ApprovalFlowEditor](../editors/approval-flow-editor/reference.md) publish button | `发布` | `publishText` prop |

Everything not in this table that renders Chinese is in the "Chinese-only" list below.

## Worked Example: an English Admin UI

The full set of changes for a team shipping an English-language product on VEF v2.9.0.

Bootstrap, before `createApp().render()`:

```ts
import { getNow, z } from "@vef-framework-react/shared";
import { en } from "zod/locales";
import dayjs from "dayjs";

z.config(en());     // English default validation messages
getNow();           // force the framework's one-time dayjs setup...
dayjs.locale("en"); // ...then win the locale (unsupported but effective; see above)
```

Root layout, wrapping all routed pages:

```tsx
import { ConfigProvider } from "antd";
import enUS from "antd/locale/en_US";

<ConfigProvider locale={enUS}>{/* routes */}</ConfigProvider>
```

Then apply the per-component overrides from the contract table wherever those components appear, for example:

```tsx
<Bool variant="radio" trueLabel="Yes" falseLabel="No" />

<ActionButton
  confirmable
  confirmTitle="Delete record"
  confirmDescription="This action cannot be undone."
>
  Delete
</ActionButton>

showConfirm("Publish this version?", { title: "Confirm", okText: "OK", cancelText: "Cancel" });

<ProSearch searchButtonProps={{ children: "Search" }} resetButtonProps={{ children: "Reset" }} />

<ProTable operationColumn={{ title: "Actions", width: 160, render: renderActions }} />

<EditableTable texts={{ edit: "Edit", delete: "Delete", save: "Save", cancel: "Cancel" }} />
```

Since the defaults live in each component rather than in a global config, teams typically wrap the most-used ones (`ActionButton`, `Bool`, `ProSearch`) in thin project components that bake in the English texts once.

After all of the above, the surfaces in the next section are still Chinese — review whether any of them appear in your product before committing to VEF for an English UI.

## What Is Chinese-Only Today (v2.9.0)

These strings have no override prop, no config entry, and no locale hook:

- **ProTable**: the sequence column header `序号`; the column-settings panel (`数据列设置`, `重置`, `固定在左侧` / `取消固定在左侧`, `固定在右侧`, `设置列宽`, `该列不支持设置列宽`, `当前列宽`, `未命名列`, `调整过列设置`); the pagination summary `第 X - Y 条 / 共 N 条` (framework-rendered — the antd locale does not reach it).
- **ProSearch**: the advanced-search toggle `高级搜索`.
- **CRUD**: the selection bar `已选择 N 项` / `取消选择`.
- **EditableTable**: the add-row button `新增记录`; the save-validation fallback toast `请检查表单填写是否正确` (shown only when no validator message is available).
- **FormModal / FormDrawer**: the missing-content placeholder `请提供表单内容`.
- **IconPicker**: the empty-search state `无匹配图标`.
- **Chart**: the loading overlay `加载中...`.
- **Global error boundary** (inside `ConfigProvider`): `出错了`, `重试`, `未知错误`.
- **`HttpClient`** user-facing messages: `请求超时`, `登录已过期, 请重新登录`, `发起请求失败: ...`, `...请联系管理员为您开通`, and its console diagnostics. See [Error Handling](./error-handling.md).
- **Chrono utilities**: `formatDuration` output (`天` / `小时` / `分钟`) and the `YYYY-Q季度` quarter format, regardless of the dayjs locale.
- **FormEditor and ApprovalFlowEditor chrome**: toolbar, palette, properties panel, canvas hints, and publish-gate notifications are Chinese product copy throughout — `publishText` relabels only the publish button. The [embedding guide](../editors/form-editor/embedding.md) shows how to compose your own shell around the panels if you need different chrome. Schema validation messages are also Chinese-only; program against their stable `code` and `path`, not `message`.
- **FormEditor mobile preview**: always renders antd-mobile under a `zh-CN` locale, regardless of the host locale.
- **Starter app shell**: the login page (including its rotating welcome copy), layout header controls, tab context menus, the theme-settings panel, the command palette, and the 403/404/error pages have no i18n hook. An English product must replace these starter surfaces with its own.
- **Dev-server boot loader** text (dev-time only, not shipped to production users).

## Best Practices

- **Decide the product language before building.** Chinese products get everything for free; English products need the bootstrap steps plus per-component overrides, and must avoid (or replace) the Chinese-only surfaces above.
- **Centralize overrides in wrappers.** Text props like `confirmTitle` are per-instance; a thin project-level `ActionButton` wrapper keeps English defaults in one place instead of scattered across pages.
- **Always pass `okText` / `cancelText` to imperative helpers** in an English UI — the nested antd locale provider does not reach them.
- **Never match on framework message strings.** HTTP errors, editor validation, and helper toasts are Chinese product copy; branch on codes (`ApiResult` codes, validation `code` / `path`), which are stable across any future locale work.
- **Treat the editors as Chinese-language surfaces.** If the designers (FormEditor, ApprovalFlowEditor) are end-user-facing in an English product, plan for a custom shell — the built-in chrome is not localizable today.
