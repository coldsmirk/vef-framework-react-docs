---
title: Cron Package Overview
description: What @vef-framework-react/cron ships — management pages for the VEF server's durable cron schedule store and its run journal.
---

# Cron Package Overview

`@vef-framework-react/cron` (v2.10.0) is the frontend console for the VEF server's **durable cron store**: schedules that live in the database rather than in code, survive restarts, fire on exactly one node of a cluster, and journal every run. The package ships two pages — schedule management and the read-only run journal — plus the API hooks and building blocks behind them.

:::caution Unreleased package
The package was added on 2026‑07‑19, after the v2.12.0 tag, and ships with the **next** framework release. It is not yet wired into the playground.
:::

## When to Use

- Your VEF server registers cron job handlers and you want operators to create, pause, trigger, and audit schedules from the UI instead of config files.
- You are building scheduling-adjacent screens and want the typed API (`useScheduleApi`, `useRunApi`), the [`TriggerEditor`](./reference.md#triggereditor) with live fire preview, or the duration/format helpers.

## Concepts

A **schedule** is a named, durable trigger bound to a registered **job handler** (`jobName` — only names the answering node registers are legal, served by `list_jobs`). Its trigger is one of three kinds:

| Kind | Fields | Fires |
| --- | --- | --- |
| `cron` | `expr` (5- or 6-field cron expression or an `@daily`-style descriptor) + optional `timezone` | On the expression's wall-clock times |
| `interval` | `everyMs` (fixed rate, minimum 1000 ms) | At a fixed rate |
| `once` | `at` (a date-time) | A single time |

Around the trigger, a schedule carries an optional effective window (`startsAt` / `endsAt`), an opaque JSON `params` object passed verbatim to the handler, a **misfire policy** (`fire_now` immediately runs, once, any occurrences missed while a node was down or the schedule was paused; `skip` drops them), a **concurrency policy** (`forbid` skips an occurrence while the previous run is still going; `allow` runs them in parallel), a `recover` flag (re-fire after a node crash — the handler must be idempotent), and a per-run `timeoutMs` (0 = the global default).

Every fire produces a **run** in the journal (`sys/cron/run`): which node claimed it, when it was scheduled/started/finished, its status (`running` / `succeeded` / `failed` / `missed` / `skipped` / `abandoned` / `canceled`), heartbeats, duration, the error text, and — for `missed` — how many occurrences were dropped.

All timestamps on the wire are naive local wall-clock strings (`YYYY-MM-DD HH:mm:ss`).

## Pages

Both pages are full-page components; mount them directly (no provider). Endpoints are `resource.operation` against the framework RPC endpoint `/api`.

### `CronSchedulePage`

Full-page management of the schedule store, built on `CrudPage` (see [Crud](../../components/crud.md)). Schedules are **addressed by name** — there is no id-keyed delete and no batch delete/row selection; renaming happens on update via `newName` (the form captures the original name and turns an edited name into a rename automatically).

The list shows name, job handler, trigger kind, a humanized trigger summary (`0 9 * * *（Asia/Shanghai）`, `每 5 分钟`, `单次 · …`), enabled state, and the next/last fire times. **A paused schedule shows a dash for 下次触发**: it keeps its fire cursor internally so resuming can account for the paused gap, but it will not fire at that time — showing it would read as a scheduled run that never happens (`ccef94e`).

Filters split into a **basic** inline field (name) and an **advanced** expandable panel (job handler from `list_jobs`, trigger kind, enabled state) — commit `c8d5dc0`.

The drawer form (responsive: `100vw` → `80vw` → 680px) edits the name (rename hint included), the job handler select, the trigger through [`TriggerEditor`](./reference.md#triggereditor) — with a debounced **live preview of the next fire times** (`preview_fires`, validated exactly like a save, errors surfaced inline) — the effective window, misfire/concurrency policies with per-value hints, crash recovery, the timeout as a value+unit pair, the params as JSON text (validated to be a JSON object; empty omits params), and the enabled switch.

Row actions: 编辑, 暂停/恢复 (by current state), 立即执行 (confirmable — triggers one execution through the normal claim flow), 删除 (confirmable — the schedule stops firing; historical runs are kept).

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `permissions` | `Partial<SchedulePermissionCodes>` | `CRON_PERMISSIONS.schedule` | Override the permission codes the page gates its actions on. |
| `columnStorageKey` | `string` | `"cron.schedule"` | Storage key for the column-settings panel. |
| `title` | `ReactNode` | — | Optional page title rendered above the table. |

- **Permissions:** every mutating action (新增 / 编辑 / 暂停 / 恢复 / 立即执行 / 删除) is gated on the single `cron.schedule.manage` code — there are no per-action codes. The list and the form's helper queries are enforced server-side by `cron.schedule.query`.
- **Endpoints:** `sys/cron/schedule.find_page`, `.get`, `.list_jobs`, `.preview_fires`, `.create`, `.update`, `.delete`, `.pause`, `.resume`, `.trigger_now`.

```tsx
// routes/sys/cron-schedule/route.tsx — host-app example (not yet in the playground).
import { createFileRoute } from "@tanstack/react-router";
import { CronSchedulePage } from "@vef-framework-react/cron";

export const Route = createFileRoute("/_layout/sys/cron-schedule")({
  component: () => <CronSchedulePage />
});
```

### `CronRunPage`

Full-page, read-only browser over the run journal. The list shows schedule name, job handler, status badge, node, scheduled/started/finished times, and duration; filters split into a basic field (schedule name) and an advanced panel (job handler, status, node, and a scheduled-time range mapping to the `scheduledAtFrom` / `scheduledAtTo` gte/lte bounds). Rows open a detail drawer (also via the 详情 action) that **refetches the full row through `find_one`** so the complete, untruncated error text is always available; `missed` runs additionally show how many occurrences were dropped.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `columnStorageKey` | `string` | `"cron.run"` | Storage key for the column-settings panel. |
| `title` | `ReactNode` | — | Optional page title rendered above the table. |

- **Permissions:** the page renders no gated actions (it is read-only); the queries are enforced server-side by `cron.run.query`.
- **Endpoints:** `sys/cron/run.find_page`, `.find_one`.

```tsx
// routes/sys/cron-run/route.tsx
import { createFileRoute } from "@tanstack/react-router";
import { CronRunPage } from "@vef-framework-react/cron";

export const Route = createFileRoute("/_layout/sys/cron-run")({
  component: () => <CronRunPage />
});
```

`RunDetailDrawer` is exported standalone (`{ runId: string | null; onClose: () => void }`) so a host dashboard can deep-link a run.

## Package structure

Because the surface is compact (two pages), this section plus the [API Reference](./reference.md) is the whole documentation — there is no separate pages document. The reference covers `CRON_PERMISSIONS`, both API hooks, the form model helpers, the trigger editor and duration/format utilities, and every wire type.
